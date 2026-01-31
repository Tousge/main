import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Nom de la table dans Supabase
export const DEVIS_TABLE = 'demandes_devis';

// Variables d'environnement
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

// Client Supabase initialisé de manière lazy
let _supabase: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
          'Variables d\'environnement SUPABASE_URL et SUPABASE_ANON_KEY requises. ' +
          'Vérifiez votre fichier .env'
        );
      }
      _supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return Reflect.get(_supabase, prop);
  }
});
