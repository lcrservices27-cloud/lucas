import { prisma } from "@/lib/prisma";

export async function getClientesKanban() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { atualizadoEm: "desc" },
    select: {
      id: true,
      nome: true,
      cidade: true,
      estado: true,
      valorContratado: true,
      statusComercial: true,
      statusJuridico: true,
      atualizadoEm: true,
      responsavel: { select: { nome: true } },
    },
  });

  return clientes.map((c) => ({
    ...c,
    valorContratado: Number(c.valorContratado),
    responsavel: c.responsavel?.nome ?? null,
  }));
}

export type KanbanCliente = Awaited<ReturnType<typeof getClientesKanban>>[number];
