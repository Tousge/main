import type { APIRoute } from 'astro';

export const prerender = false;

// Taille max par fichier : 10 Mo
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Taille max totale : 30 Mo
const MAX_TOTAL_SIZE = 30 * 1024 * 1024;
// Extensions autorisées
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.zip'];
// Nombre max de fichiers
const MAX_FILES = 5;

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return jsonResponse(400, { success: false, message: 'Content-Type multipart/form-data requis' });
    }

    const formData = await request.formData();
    const devisId = formData.get('devisId') as string;

    if (!devisId) {
      return jsonResponse(400, { success: false, message: 'ID de devis requis' });
    }

    const files = formData.getAll('fichiers') as File[];

    if (!files || files.length === 0) {
      return jsonResponse(200, { success: true, message: 'Aucun fichier à envoyer', fichiers: [] });
    }

    if (files.length > MAX_FILES) {
      return jsonResponse(400, { success: false, message: `Maximum ${MAX_FILES} fichiers autorisés` });
    }

    // Valider chaque fichier
    let totalSize = 0;
    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;

      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return jsonResponse(400, {
          success: false,
          message: `Type de fichier non autorisé: ${ext}. Types acceptés: ${ALLOWED_EXTENSIONS.join(', ')}`
        });
      }

      if (file.size > MAX_FILE_SIZE) {
        return jsonResponse(400, {
          success: false,
          message: `Le fichier "${file.name}" dépasse la taille maximale de 10 Mo`
        });
      }

      totalSize += file.size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return jsonResponse(400, { success: false, message: 'La taille totale des fichiers dépasse 30 Mo' });
    }

    // Stocker dans Supabase Storage
    const { supabase } = await import('../../lib/supabase');
    const uploadedFiles: { name: string; path: string; size: number }[] = [];

    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;

      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `devis/${devisId}/${timestamp}_${safeName}`;

      const buffer = await file.arrayBuffer();
      const { error } = await supabase.storage
        .from('fichiers-devis')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error('Erreur upload Supabase Storage:', error);
        return jsonResponse(500, {
          success: false,
          message: `Erreur lors de l'upload de "${file.name}"`
        });
      }

      uploadedFiles.push({
        name: file.name,
        path: storagePath,
        size: file.size,
      });
    }

    // Mettre à jour la demande de devis avec les chemins des fichiers
    const { DEVIS_TABLE } = await import('../../lib/supabase');
    await supabase
      .from(DEVIS_TABLE)
      .update({ fichiers: uploadedFiles })
      .eq('id', devisId);

    return jsonResponse(200, {
      success: true,
      message: `${uploadedFiles.length} fichier(s) envoyé(s)`,
      fichiers: uploadedFiles,
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    return jsonResponse(500, { success: false, message: 'Erreur serveur lors de l\'upload' });
  }
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ success: false, message: 'Méthode non autorisée' }),
    { status: 405, headers: { 'Content-Type': 'application/json', 'Allow': 'POST' } }
  );
};
