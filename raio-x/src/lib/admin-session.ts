import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "raiox_admin";
const secret = new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? "dev-insecure-admin-secret-change-me"
);
const DURACAO = 60 * 60 * 12; // 12h

if (!process.env.ADMIN_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("ADMIN_SECRET é obrigatório em produção.");
}

export async function criarSessaoAdmin() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO}s`)
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO,
  });
}

export async function destruirSessaoAdmin() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function adminAutenticado(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function exigirAdmin() {
  if (!(await adminAutenticado())) redirect("/admin/login");
}
