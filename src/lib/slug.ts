/**
 * Utilitaires pour générer des slugs sécurisés
 * Ces slugs masquent les UUIDs de la base de données
 */

// Caractères utilisés pour le slug (URL-safe)
const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SLUG_LENGTH = 12;

/**
 * Génère un hash simple mais sécurisé à partir d'un UUID et d'un secret
 * Utilise un algorithme de hachage basé sur la méthode djb2 avec le secret
 */
function hashWithSecret(uuid: string, secret: string): number[] {
  const combined = secret + uuid + secret;
  const hashes: number[] = [];
  
  // Générer plusieurs hashes pour plus d'entropie
  for (let round = 0; round < SLUG_LENGTH; round++) {
    let hash = 5381 + round * 33;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt((i + round) % combined.length);
      hash = ((hash << 5) + hash + char) >>> 0; // hash * 33 + char
    }
    hashes.push(hash);
  }
  
  return hashes;
}

/**
 * Génère un slug sécurisé à partir d'un UUID
 * Le même UUID produira toujours le même slug (déterministe)
 */
export function generateSlug(uuid: string, secret: string): string {
  const hashes = hashWithSecret(uuid, secret);
  let slug = '';
  
  for (let i = 0; i < SLUG_LENGTH; i++) {
    const index = hashes[i] % SLUG_CHARS.length;
    slug += SLUG_CHARS[index];
  }
  
  return slug;
}

/**
 * Vérifie si un slug correspond à un UUID donné
 */
export function verifySlug(slug: string, uuid: string, secret: string): boolean {
  return generateSlug(uuid, secret) === slug;
}

/**
 * Trouve l'UUID correspondant à un slug dans une liste
 * Retourne null si aucun UUID ne correspond
 */
export function findUuidBySlug(
  slug: string, 
  uuids: string[], 
  secret: string
): string | null {
  for (const uuid of uuids) {
    if (verifySlug(slug, uuid, secret)) {
      return uuid;
    }
  }
  return null;
}

/**
 * Convertit un tableau d'objets avec ID en objets avec slug
 */
export function addSlugsToItems<T extends { id: string }>(
  items: T[], 
  secret: string
): (T & { slug: string })[] {
  return items.map(item => ({
    ...item,
    slug: generateSlug(item.id, secret)
  }));
}

/**
 * Valide le format d'un slug
 */
export function isValidSlugFormat(slug: string): boolean {
  if (!slug || slug.length !== SLUG_LENGTH) return false;
  return [...slug].every(char => SLUG_CHARS.includes(char));
}











