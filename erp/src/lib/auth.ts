import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.userId, ativo: true },
  });

  return usuario;
});

export async function requireUser() {
  const usuario = await getCurrentUser();
  if (!usuario) {
    redirect("/login");
  }
  return usuario;
}

export const PAPEL_LABEL: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  FINANCEIRO: "Financeiro",
  ATENDIMENTO: "Atendimento",
  CONSULTOR: "Consultor",
  JURIDICO: "Jurídico",
};
