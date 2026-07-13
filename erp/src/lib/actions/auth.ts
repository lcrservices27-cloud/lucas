"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { rateLimit, cleanupIfDue } from "@/lib/rate-limit";

export type LoginState = {
  error?: string;
};

// Hash de senha inexistente: mantém o tempo de resposta constante quando o
// e-mail não existe, evitando enumeração de usuários por timing.
const DUMMY_HASH = "$2b$10$C6UzMDM.H6dfI/f/IKcEeO7ZBpZk0P8gRfHhZuBIm1lPMYPtWLh7u";

function sanitizeNext(next: string): string {
  // Apenas caminhos internos: bloqueia URLs absolutas e protocol-relative (//host).
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/dashboard";
  }
  return next;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const next = sanitizeNext(String(formData.get("next") ?? "/dashboard"));

  if (!email || !senha) {
    return { error: "Informe e-mail e senha." };
  }

  cleanupIfDue();
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`login:${ip}`, 20, 15 * 60 * 1000) || !rateLimit(`login:${email}`, 10, 15 * 60 * 1000)) {
    return { error: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  const senhaValida = await bcrypt.compare(senha, usuario?.senhaHash ?? DUMMY_HASH);
  if (!usuario || !usuario.ativo || !senhaValida) {
    return { error: "Credenciais inválidas." };
  }

  await createSession({ userId: usuario.id });
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
