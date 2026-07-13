"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type PerfilState = { error?: string; success?: boolean };

export async function updatePerfil(_prevState: PerfilState, formData: FormData): Promise<PerfilState> {
  const usuario = await requireUser();

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { error: "Informe o nome." };

  await prisma.usuario.update({ where: { id: usuario.id }, data: { nome } });
  revalidatePath("/configuracoes");
  return { success: true };
}

export type SenhaState = { error?: string; success?: boolean };

export async function updateSenha(_prevState: SenhaState, formData: FormData): Promise<SenhaState> {
  const usuario = await requireUser();

  const senhaAtual = String(formData.get("senhaAtual") ?? "");
  const novaSenha = String(formData.get("novaSenha") ?? "");

  if (novaSenha.length < 6) return { error: "A nova senha deve ter pelo menos 6 caracteres." };

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);
  if (!senhaValida) return { error: "Senha atual incorreta." };

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({ where: { id: usuario.id }, data: { senhaHash } });

  return { success: true };
}
