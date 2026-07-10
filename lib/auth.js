import crypto from 'crypto';

export const COOKIE_NAME = 'lucas_session';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias — uso pessoal, sessão longa

function sign(payload) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('hex');
}

export function createSessionCookieValue() {
  const payload = String(Date.now() + TTL_MS);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionCookieValue(value) {
  if (!value) return false;
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return false;

  const expected = sign(payload);
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  return Number(payload) > Date.now();
}

export function verifyCredentials(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') return false;

  const expectedEmail = process.env.ADMIN_EMAIL || '';
  const expectedPassword = process.env.ADMIN_PASSWORD || '';

  const emailBuf = Buffer.from(email);
  const expectedEmailBuf = Buffer.from(expectedEmail);
  const emailMatches =
    emailBuf.length === expectedEmailBuf.length && crypto.timingSafeEqual(emailBuf, expectedEmailBuf);

  const passBuf = Buffer.from(password);
  const expectedPassBuf = Buffer.from(expectedPassword);
  const passMatches =
    passBuf.length === expectedPassBuf.length && crypto.timingSafeEqual(passBuf, expectedPassBuf);

  return emailMatches && passMatches;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: TTL_MS / 1000,
  path: '/',
};
