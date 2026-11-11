import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, generateSessionToken } from '@/lib/cognito';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { password } = body as { password?: string };

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  }

  const token = generateSessionToken();
  const response = NextResponse.json({ success: true });

  response.cookies.set('lumapath_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });

  return response;
}
