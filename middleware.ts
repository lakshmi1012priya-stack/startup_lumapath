import { NextRequest, NextResponse } from 'next/server';

/**
 * Inline edge-compatible token verification.
 * Uses atob() (available in the Edge runtime) instead of Buffer (Node.js-only).
 * Token format: base64-encoded JSON { iat: number, exp: number }
 */
function verifyToken(token: string): boolean {
  try {
    const json = atob(token);
    const payload = JSON.parse(json) as { exp?: unknown };
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest): NextResponse {
  const tokenValue = request.cookies.get('lumapath_auth')?.value;

  if (!tokenValue || !verifyToken(tokenValue)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/bride', '/groom', '/ledger'],
};
