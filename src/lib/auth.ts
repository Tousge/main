/**
 * Authentification admin avec token signé et expiration
 * Remplace le stockage du mot de passe brut en sessionStorage
 */

const TOKEN_EXPIRY_MS = 4 * 60 * 60 * 1000; // 4 heures

/**
 * Génère un token signé HMAC-like à partir du mot de passe admin et d'un timestamp
 * Format: timestamp.signature
 */
export function generateAuthToken(adminPassword: string): string {
  const timestamp = Date.now();
  const signature = computeSignature(timestamp.toString(), adminPassword);
  return `${timestamp}.${signature}`;
}

/**
 * Vérifie qu'un token est valide et non expiré
 */
export function verifyAuthToken(token: string, adminPassword: string): boolean {
  if (!token || !token.includes('.')) return false;

  const [timestampStr, signature] = token.split('.');
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;

  // Vérifier l'expiration
  if (Date.now() - timestamp > TOKEN_EXPIRY_MS) return false;

  // Vérifier la signature
  const expectedSignature = computeSignature(timestampStr, adminPassword);
  return signature === expectedSignature;
}

/**
 * Signature déterministe basée sur djb2 avec le secret
 */
function computeSignature(data: string, secret: string): string {
  const combined = secret + ':' + data + ':' + secret;
  let hash1 = 5381;
  let hash2 = 52711;

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1 + char) >>> 0;
    hash2 = ((hash2 << 5) + hash2 + char) >>> 0;
  }

  return hash1.toString(36) + hash2.toString(36);
}
