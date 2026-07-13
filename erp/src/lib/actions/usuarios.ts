"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type UsuarioState = { error?: string };

export async function createUsuario(_prevState: UsuarioState, formData: FormData): Promise<UsuarioState> {
  const atual = await requireUser();
  if (atual.papel !== "ADMINISTRADOR") return { error: "Apenas administradores podem criar usuários." };

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const papel = String(formData.get("papel") ?? "ATENDIMENTO");

  if (!nome || !email || senha.length < 6) {
    return { error: "Preencha nome, e-mail e uma senha com pelo menos 6 caracteres." };
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return { error: "Já existe um usuário com este e-mail." };

  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.create({
    data: { nome, email, senhaHash, papel: papel as never },
  });

  revalidatePath("/usuarios");
  return {};
}

export async function toggleUsuarioAtivo(id: string, ativo: boolean) {
  const atual = await requireUser();
  if (atual.papel !== "ADMINISTRADOR") throw new Error("Apenas administradores podem alterar usuários.");
  if (atual.id === id && !ativo) throw new Error("Você não pode desativar sua própria conta.");

  await prisma.usuario.update({ where: { id }, data: { ativo } });
  revalidatePath("/usuarios");
}

export async function updateUsuarioPapel(id: string, papel: string) {
  const atual = await requireUser();
  if (atual.papel !== "ADMINISTRADOR") throw new Error("Apenas administradores podem alterar usuários.");

  await prisma.usuario.update({ where: { id }, data: { papel: papel as never } });
  revalidatePath("/usuarios");
}
