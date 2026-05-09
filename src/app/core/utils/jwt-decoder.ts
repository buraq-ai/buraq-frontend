/**
 * Decodes the payload of a JWT token without verification.
 * The payload is the middle section between the two dots, base64-encoded.
 */
export function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extracts the user's email (sub claim) from the JWT token.
 */
export function getUserEmailFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  return payload?.sub ?? null;
}

/**
 * Extracts the user's role from the JWT token.
 */
export function getUserRoleFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  return payload?.role ?? null;
}