import type { APIRoute } from 'astro';
import { generateSlug, findUuidBySlug, addSlugsToItems, isValidSlugFormat } from '../../lib/slug';

// Désactiver le pré-rendu pour cette route API
export const prerender = false;

// Récupérer le secret pour les slugs
function getSlugSecret(): string {
  const secret = import.meta.env.SLUG_SECRET || import.meta.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('SLUG_SECRET ou ADMIN_PASSWORD requis pour générer les slugs');
  }
  return secret;
}

// Récupérer les demandes de devis (avec authentification)
export const POST: APIRoute = async ({ request }) => {
  const { supabase, DEVIS_TABLE } = await import('../../lib/supabase');
  
  try {
    // Vérifier le Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Content-Type doit être application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parser les données
    const { password, action, id, slug } = await request.json();
    
    // Vérifier le mot de passe admin
    const adminPassword = import.meta.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD non configuré');
      return new Response(
        JSON.stringify({ success: false, message: 'Configuration admin manquante' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password !== adminPassword) {
      return new Response(
        JSON.stringify({ success: false, message: 'Mot de passe incorrect' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slugSecret = getSlugSecret();

    // Actions disponibles
    if (action === 'list') {
      // Récupérer toutes les demandes de devis
      const { data, error } = await supabase
        .from(DEVIS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Erreur lors de la récupération des données' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Ajouter les slugs aux données (masquer les IDs dans les URLs)
      const dataWithSlugs = addSlugsToItems(data || [], slugSecret);

      return new Response(
        JSON.stringify({ success: true, data: dataWithSlugs }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get') {
      // Support du slug OU de l'ID pour la rétrocompatibilité
      let targetId = id;
      
      // Si un slug est fourni, le convertir en ID
      if (slug && !id) {
        // Valider le format du slug
        if (!isValidSlugFormat(slug)) {
          return new Response(
            JSON.stringify({ success: false, message: 'Format de slug invalide' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Récupérer tous les IDs pour trouver le correspondant
        const { data: allIds, error: idsError } = await supabase
          .from(DEVIS_TABLE)
          .select('id');

        if (idsError) {
          console.error('Erreur Supabase:', idsError);
          return new Response(
            JSON.stringify({ success: false, message: 'Erreur lors de la recherche' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const uuids = (allIds || []).map(item => item.id);
        targetId = findUuidBySlug(slug, uuids, slugSecret);

        if (!targetId) {
          return new Response(
            JSON.stringify({ success: false, message: 'Demande non trouvée' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      if (!targetId) {
        return new Response(
          JSON.stringify({ success: false, message: 'ID ou slug requis' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Récupérer la demande spécifique
      const { data, error } = await supabase
        .from(DEVIS_TABLE)
        .select('*')
        .eq('id', targetId)
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Demande non trouvée' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Ajouter le slug à la réponse
      const dataWithSlug = {
        ...data,
        slug: generateSlug(data.id, slugSecret)
      };

      return new Response(
        JSON.stringify({ success: true, data: dataWithSlug }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete') {
      // Support du slug OU de l'ID
      let targetId = id;
      
      if (slug && !id) {
        if (!isValidSlugFormat(slug)) {
          return new Response(
            JSON.stringify({ success: false, message: 'Format de slug invalide' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const { data: allIds, error: idsError } = await supabase
          .from(DEVIS_TABLE)
          .select('id');

        if (idsError) {
          console.error('Erreur Supabase:', idsError);
          return new Response(
            JSON.stringify({ success: false, message: 'Erreur lors de la recherche' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const uuids = (allIds || []).map(item => item.id);
        targetId = findUuidBySlug(slug, uuids, slugSecret);

        if (!targetId) {
          return new Response(
            JSON.stringify({ success: false, message: 'Demande non trouvée' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      if (!targetId) {
        return new Response(
          JSON.stringify({ success: false, message: 'ID ou slug requis' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Supprimer la demande
      const { error } = await supabase
        .from(DEVIS_TABLE)
        .delete()
        .eq('id', targetId);

      if (error) {
        console.error('Erreur Supabase:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Erreur lors de la suppression' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Demande supprimée' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Action non reconnue' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Méthode GET non autorisée
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ success: false, message: 'Méthode non autorisée' }),
    { status: 405, headers: { 'Content-Type': 'application/json', 'Allow': 'POST' } }
  );
};
