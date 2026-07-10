import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifySessionCookieValue } from '@/lib/auth';

export function proxy(request) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (verifySessionCookieValue(cookie)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/prospects/:path*'],
};
