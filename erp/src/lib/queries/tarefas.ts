import { prisma } from "@/lib/prisma";

export async function getTarefas() {
  const tarefas = await prisma.tarefa.findMany({
    orderBy: [{ concluida: "asc" }, { prazo: "asc" }],
    include: {
      cliente: { select: { id: true, nome: true } },
      responsavel: { select: { id: true, nome: true } },
    },
  });
  return tarefas;
}

export type TarefaItem = Awaited<ReturnType<typeof getTarefas>>[number];
