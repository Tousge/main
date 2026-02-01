import type { APIRoute } from 'astro';
import type { DevisFormData, DevisResponse } from '../../types/devis';
import { sendDevisEmails } from '../../lib/email';
import { logConfigStatus } from '../../lib/config';

// Désactiver le pré-rendu pour cette route API
export const prerender = false;

// Vérifier la config au premier chargement du module
let configChecked = false;

// Vérification du token Turnstile
async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secretKey = import.meta.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY non configurée - vérification CAPTCHA ignorée');
    return true; // En développement, on peut ignorer
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Erreur vérification Turnstile:', error);
    return false;
  }
}

// Validation des champs requis
function validateFormData(data: Partial<DevisFormData>): Record<string, string> {
  const errors: Record<string, string> = {};

  // 1. Informations générales
  if (!data.nom_prenom?.trim()) {
    errors.nom_prenom = 'Le nom et prénom sont requis';
  }
  if (!data.entreprise?.trim()) {
    errors.entreprise = 'L\'entreprise / organisation est requise';
  }
  if (!data.email?.trim()) {
    errors.email = 'L\'email est requis';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'L\'email n\'est pas valide';
  }
  if (!data.telephone?.trim()) {
    errors.telephone = 'Le téléphone est requis';
  } else if (!/^[\d\s\+\-\.\(\)]{8,20}$/.test(data.telephone.replace(/\s/g, ''))) {
    errors.telephone = 'Le numéro de téléphone n\'est pas valide';
  }

  // Site web optionnel mais doit être valide si fourni
  if (data.site_web?.trim()) {
    try {
      new URL(data.site_web);
    } catch {
      errors.site_web = 'L\'URL du site web n\'est pas valide';
    }
  }

  // 2. Projet MLM
  if (!data.type_business) {
    errors.type_business = 'Le type de business est requis';
  }
  if (data.type_business === 'autre' && !data.type_business_autre?.trim()) {
    errors.type_business_autre = 'Veuillez préciser votre type de business';
  }
  if (!data.integration_mlm || data.integration_mlm.length === 0) {
    errors.integration_mlm = 'Veuillez sélectionner au moins une option d\'intégration';
  }
  if (!data.modele_mlm || data.modele_mlm.length === 0) {
    errors.modele_mlm = 'Veuillez sélectionner au moins un modèle MLM';
  }
  if (!data.objectif_mlm) {
    errors.objectif_mlm = 'L\'objectif principal est requis';
  }
  if (data.objectif_mlm === 'autre' && !data.objectif_mlm_autre?.trim()) {
    errors.objectif_mlm_autre = 'Veuillez préciser votre objectif';
  }

  // 3. Fonctionnalités
  if (!data.fonctionnalites || data.fonctionnalites.length === 0) {
    errors.fonctionnalites = 'Veuillez sélectionner au moins une fonctionnalité';
  }
  if (data.fonctionnalites?.includes('autre') && !data.fonctionnalites_autre?.trim()) {
    errors.fonctionnalites_autre = 'Veuillez préciser la fonctionnalité';
  }

  // 4. Informations techniques
  if (!data.technologie) {
    errors.technologie = 'La technologie est requise';
  }
  if (data.base_donnees_existante === true && !data.base_donnees_details?.trim()) {
    errors.base_donnees_details = 'Veuillez préciser les détails de votre base de données';
  }

  // 5. Budget & Délais
  if (!data.budget) {
    errors.budget = 'Le budget est requis';
  }
  if (!data.delai) {
    errors.delai = 'Le délai est requis';
  }

  // 6. Description
  if (!data.description_projet?.trim()) {
    errors.description_projet = 'La description du projet est requise';
  } else if (data.description_projet.trim().length < 20) {
    errors.description_projet = 'La description doit contenir au moins 20 caractères';
  }

  // 7. Consentement
  if (data.acceptation_rgpd !== true) {
    errors.acceptation_rgpd = 'Vous devez accepter les conditions RGPD';
  }

  return errors;
}

// Sanitize les données pour éviter les injections
function sanitizeData(data: Partial<DevisFormData>): Partial<DevisFormData> {
  const sanitized: Partial<DevisFormData> = {};
  
  // Strings simples
  const stringFields = [
    'nom_prenom', 'entreprise', 'email', 'telephone', 'site_web',
    'type_business_autre', 'objectif_mlm_autre', 'fonctionnalites_autre',
    'base_donnees_details', 'description_projet'
  ] as const;

  for (const field of stringFields) {
    if (data[field]) {
      sanitized[field] = String(data[field])
        .trim()
        .replace(/<[^>]*>/g, '') // Supprime les balises HTML
        .slice(0, field === 'description_projet' ? 5000 : 500); // Limite la longueur
    }
  }

  // Email en minuscules
  if (sanitized.email) {
    sanitized.email = sanitized.email.toLowerCase();
  }

  // Champs enum simples
  sanitized.type_business = data.type_business;
  sanitized.objectif_mlm = data.objectif_mlm;
  sanitized.technologie = data.technologie;
  sanitized.budget = data.budget;
  sanitized.delai = data.delai;

  // Arrays
  sanitized.integration_mlm = Array.isArray(data.integration_mlm) ? data.integration_mlm : [];
  sanitized.modele_mlm = Array.isArray(data.modele_mlm) ? data.modele_mlm : [];
  sanitized.fonctionnalites = Array.isArray(data.fonctionnalites) ? data.fonctionnalites : [];

  // Booléens
  sanitized.base_donnees_existante = Boolean(data.base_donnees_existante);
  sanitized.recontact_telephone = Boolean(data.recontact_telephone);
  sanitized.acceptation_rgpd = Boolean(data.acceptation_rgpd);

  return sanitized;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Vérification de la config au premier appel
  if (!configChecked) {
    logConfigStatus(import.meta.env);
    configChecked = true;
  }

  // Import dynamique de Supabase (évite les erreurs lors du build)
  const { supabase, DEVIS_TABLE } = await import('../../lib/supabase');

  try {
    // Vérifier le Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Content-Type doit être application/json',
        } as DevisResponse),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parser les données
    let rawData: Partial<DevisFormData> & { captchaToken?: string };
    try {
      rawData = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Données JSON invalides',
        } as DevisResponse),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier le CAPTCHA Turnstile
    const captchaToken = rawData.captchaToken;
    if (!captchaToken) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Veuillez valider le CAPTCHA',
          errors: { captcha: 'Validation CAPTCHA requise' },
        } as DevisResponse),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const isCaptchaValid = await verifyTurnstileToken(captchaToken, clientAddress || '');
    if (!isCaptchaValid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Échec de la validation CAPTCHA. Veuillez réessayer.',
          errors: { captcha: 'Validation CAPTCHA échouée' },
        } as DevisResponse),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Supprimer le token du payload avant sanitization
    delete rawData.captchaToken;

    // Sanitize les données
    const data = sanitizeData(rawData);

    // Valider les données
    const errors = validateFormData(data);
    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Veuillez corriger les erreurs du formulaire',
          errors,
        } as DevisResponse),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Ajouter les métadonnées
    const devisData = {
      ...data,
      created_at: new Date().toISOString(),
      ip_address: clientAddress || 'unknown',
      user_agent: request.headers.get('user-agent')?.slice(0, 500) || 'unknown',
    };

    // Insérer dans Supabase
    const { data: insertedData, error } = await supabase
      .from(DEVIS_TABLE)
      .insert([devisData])
      .select('id')
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.',
        } as DevisResponse),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Envoyer les emails de confirmation et notification
    // On n'attend pas la réponse pour ne pas bloquer l'utilisateur
    const devisId = insertedData?.id || 'unknown';
    sendDevisEmails(data as DevisFormData, devisId)
      .then(({ confirmationSent, adminSent }) => {
        if (!confirmationSent) {
          console.warn(`Email de confirmation non envoyé pour le devis ${devisId}`);
        }
        if (!adminSent) {
          console.warn(`Email admin non envoyé pour le devis ${devisId}`);
        }
      })
      .catch((emailError) => {
        console.error('Erreur lors de l\'envoi des emails:', emailError);
      });

    // Succès
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Votre demande de devis a été envoyée avec succès ! Nous vous contacterons très rapidement.',
        id: insertedData?.id,
      } as DevisResponse),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
      } as DevisResponse),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Méthode GET non autorisée
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Méthode non autorisée',
    } as DevisResponse),
    { 
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    }
  );
};

