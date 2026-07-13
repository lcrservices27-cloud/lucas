"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type LancamentoState = { error?: string };

export async function createLancamento(_prevState: LancamentoState, formData: FormData): Promise<LancamentoState> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: "Não autenticado." };

  const tipo = String(formData.get("tipo") ?? "");
  const categoria = String(formData.get("categoria") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valor = Number(formData.get("valor"));
  const dataStr = String(formData.get("data") ?? "");

  if (!categoria || !descricao || !valor || valor <= 0) {
    return { error: "Preencha todos os campos com valores válidos." };
  }

  await prisma.lancamento.create({
    data: {
      tipo: tipo === "DESPESA" ? "DESPESA" : "RECEITA",
      categoria,
      descricao,
      valor,
      data: dataStr ? new Date(dataStr) : new Date(),
    },
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  return {};
}
