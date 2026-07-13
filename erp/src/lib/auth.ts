import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";
import { PAPEL_USUARIO_LABEL } from "@/lib/labels";

export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.userId, ativo: true },
  });

  return usuario;
});

// Para Server Components/páginas: sem sessão, redireciona para o login.
export async function requireUser() {
  const usuario = await getCurrentUser();
  if (!usuario) {
    redirect("/login");
  }
  return usuario;
}

// Para Server Actions e route handlers de mutação: sem sessão, aborta.
export async function assertUser() {
  const usuario = await getCurrentUser();
  if (!usuario) {
    throw new Error("Não autenticado.");
  }
  return usuario;
}

export async function assertAdmin() {
  const usuario = await assertUser();
  if (usuario.papel !== "ADMINISTRADOR") {
    throw new Error("Apenas administradores podem executar esta ação.");
  }
  return usuario;
}

export const PAPEL_LABEL = PAPEL_USUARIO_LABEL;
