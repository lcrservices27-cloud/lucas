"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/auth";
import { PAPEL_USUARIO_LABEL } from "@/lib/labels";
import type { PapelUsuario } from "@/generated/prisma/enums";

export type UsuarioState = { error?: string };

const PAPEIS_VALIDOS = new Set(Object.keys(PAPEL_USUARIO_LABEL));

function papelValido(papel: string): PapelUsuario {
  return (PAPEIS_VALIDOS.has(papel) ? papel : "ATENDIMENTO") as PapelUsuario;
}

export async function createUsuario(_prevState: UsuarioState, formData: FormData): Promise<UsuarioState> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sem permissão." };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const papel = papelValido(String(formData.get("papel") ?? "ATENDIMENTO"));

  if (!nome || !email || senha.length < 6) {
    return { error: "Preencha nome, e-mail e uma senha com pelo menos 6 caracteres." };
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return { error: "Já existe um usuário com este e-mail." };

  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.create({
    data: { nome, email, senhaHash, papel },
  });

  revalidatePath("/usuarios");
  return {};
}

export async function toggleUsuarioAtivo(id: string, ativo: boolean) {
  const atual = await assertAdmin();
  if (atual.id === id && !ativo) throw new Error("Você não pode desativar sua própria conta.");

  await prisma.usuario.update({ where: { id }, data: { ativo } });
  revalidatePath("/usuarios");
}

export async function updateUsuarioPapel(id: string, papel: string) {
  const atual = await assertAdmin();
  if (atual.id === id) throw new Error("Você não pode alterar seu próprio papel.");
  if (!PAPEIS_VALIDOS.has(papel)) throw new Error("Papel inválido.");

  await prisma.usuario.update({ where: { id }, data: { papel: papel as PapelUsuario } });
  revalidatePath("/usuarios");
}
