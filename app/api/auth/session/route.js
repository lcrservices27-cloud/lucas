import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionCookieValue } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;

  if (!verifySessionCookieValue(value)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, email: process.env.ADMIN_EMAIL });
}
