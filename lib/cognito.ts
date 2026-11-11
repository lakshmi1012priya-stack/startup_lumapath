// Typed import only — CognitoIdentityProviderClient is imported to satisfy the
// package installation requirement. It is only instantiated when
// COGNITO_USER_POOL_ID is explicitly set.
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

// Keep a lazily-created client reference for future pool-based flows.
let _cognitoClient: CognitoIdentityProviderClient | null = null;

function getCognitoClient(): CognitoIdentityProviderClient | null {
  if (!process.env.COGNITO_USER_POOL_ID) return null;
  if (!_cognitoClient) {
    _cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION ?? 'ap-south-1',
    });
  }
  return _cognitoClient;
}

// Expose for future callers that need the Cognito client directly.
export { getCognitoClient };

/**
 * Simple ADMIN_SECRET-based password check (prototype auth).
 * Returns true only when the supplied password matches the env var.
 */
export function verifyAdminPassword(password: string): boolean {
  return password === (process.env.ADMIN_SECRET ?? '');
}

/**
 * Generates a lightweight base64-encoded JSON session token.
 * Not a JWT — used only as an httpOnly cookie value in the prototype.
 */
export function generateSessionToken(): string {
  const now = Date.now();
  const payload = JSON.stringify({ iat: now, exp: now + 86_400_000 });
  return Buffer.from(payload).toString('base64');
}

/**
 * Verifies the session token produced by generateSessionToken().
 * Returns false if the token is malformed or expired.
 */
export function verifySessionToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}
