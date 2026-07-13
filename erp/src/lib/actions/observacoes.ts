"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logTimeline } from "@/lib/actions/timeline";

export type ObservacaoState = { error?: string };

export async function createObservacao(
  _prevState: ObservacaoState,
  formData: FormData
): Promise<ObservacaoState> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: "Não autenticado." };

  const clienteId = String(formData.get("clienteId") ?? "");
  const conteudo = String(formData.get("conteudo") ?? "").trim();

  if (!clienteId || !conteudo) return { error: "Escreva uma observação." };

  await prisma.observacao.create({
    data: { clienteId, conteudo, autorId: usuario.id },
  });

  await logTimeline(clienteId, "OBSERVACAO_CRIADA", "Nova observação registrada", usuario.id);

  revalidatePath(`/crm/${clienteId}`);
  return {};
}
