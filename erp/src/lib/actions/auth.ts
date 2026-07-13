"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !senha) {
    return { error: "Informe e-mail e senha." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.ativo) {
    return { error: "Credenciais inválidas." };
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    return { error: "Credenciais inválidas." };
  }

  await createSession({ userId: usuario.id });
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
