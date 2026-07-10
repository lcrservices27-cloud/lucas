import { NextResponse } from 'next/server';
import { verifyCredentials, createSessionCookieValue, COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'email e password são obrigatórios' }, { status: 400 });
  }

  if (!verifyCredentials(body.email, body.password)) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, email: body.email });
  response.cookies.set(COOKIE_NAME, createSessionCookieValue(), SESSION_COOKIE_OPTIONS);
  return response;
}
