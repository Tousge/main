/**
 * Validation centralisée de la configuration
 * Vérifie toutes les variables d'environnement requises au démarrage
 */

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  { key: 'SUPABASE_URL', required: true, description: 'URL du projet Supabase' },
  { key: 'SUPABASE_ANON_KEY', required: true, description: 'Clé anonyme Supabase' },
  { key: 'ADMIN_PASSWORD', required: true, description: 'Mot de passe admin' },
  { key: 'SLUG_SECRET', required: true, description: 'Secret pour la génération des slugs (doit être différent du mot de passe admin)' },
  { key: 'PUBLIC_TURNSTILE_SITE_KEY', required: true, description: 'Clé publique Cloudflare Turnstile' },
  { key: 'TURNSTILE_SECRET_KEY', required: true, description: 'Clé secrète Cloudflare Turnstile' },
  { key: 'RESEND_API_KEY', required: true, description: 'Clé API Resend pour l\'envoi d\'emails' },
  { key: 'FROM_EMAIL', required: true, description: 'Adresse email d\'expédition (vérifiée sur Resend)' },
  { key: 'ADMIN_EMAIL', required: true, description: 'Adresse email admin pour les notifications' },
  { key: 'SITE_URL', required: true, description: 'URL du site (pour les liens dans les emails)' },
];

export function validateConfig(env: Record<string, string | undefined>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const v of ENV_VARS) {
    const value = env[v.key];
    if (v.required && (!value || value.startsWith('your-'))) {
      errors.push(`${v.key} - ${v.description}`);
    }
  }

  // Vérifier que SLUG_SECRET est différent de ADMIN_PASSWORD
  if (env.SLUG_SECRET && env.ADMIN_PASSWORD && env.SLUG_SECRET === env.ADMIN_PASSWORD) {
    errors.push('SLUG_SECRET doit être différent de ADMIN_PASSWORD pour des raisons de sécurité');
  }

  return { valid: errors.length === 0, errors };
}

export function logConfigStatus(env: Record<string, string | undefined>): void {
  const { valid, errors } = validateConfig(env);

  if (!valid) {
    console.warn('=== Configuration incomplète ===');
    console.warn('Variables manquantes ou non configurées:');
    errors.forEach(e => console.warn(`  - ${e}`));
    console.warn('Consultez .env.example pour le format attendu.');
    console.warn('================================');
  }
}
