"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, assertUser } from "@/lib/auth";
import { logTimeline } from "@/lib/actions/timeline";

export type TarefaState = { error?: string };

export async function createTarefa(_prevState: TarefaState, formData: FormData): Promise<TarefaState> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: "Não autenticado." };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const clienteId = String(formData.get("clienteId") ?? "") || null;
  const responsavelId = String(formData.get("responsavelId") ?? "") || null;
  const prioridade = String(formData.get("prioridade") ?? "MEDIA");
  const prazoStr = String(formData.get("prazo") ?? "");

  if (!titulo) return { error: "Informe o título da tarefa." };

  await prisma.tarefa.create({
    data: {
      titulo,
      descricao,
      clienteId,
      responsavelId,
      criadorId: usuario.id,
      prioridade: prioridade as never,
      prazo: prazoStr ? new Date(prazoStr) : null,
    },
  });

  if (clienteId) {
    await logTimeline(clienteId, "TAREFA_CRIADA", `Tarefa criada: ${titulo}`, usuario.id);
  }

  revalidatePath("/tarefas");
  return {};
}

export async function toggleTarefaConcluida(id: string, concluida: boolean) {
  const usuario = await assertUser();
  const tarefa = await prisma.tarefa.update({
    where: { id },
    data: { concluida, concluidaEm: concluida ? new Date() : null },
  });

  if (tarefa.clienteId && concluida) {
    await logTimeline(tarefa.clienteId, "TAREFA_CONCLUIDA", `Tarefa concluída: ${tarefa.titulo}`, usuario.id);
  }

  revalidatePath("/tarefas");
  if (tarefa.clienteId) revalidatePath(`/crm/${tarefa.clienteId}`);
}
