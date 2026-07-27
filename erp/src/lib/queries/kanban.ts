import { prisma } from "@/lib/prisma";

export async function getClientesKanban() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { atualizadoEm: "desc" },
    select: {
      id: true,
      nome: true,
      produto: true,
      valorContratado: true,
      statusComercial: true,
      atualizadoEm: true,
      pagamentos: { select: { valor: true } },
    },
  });

  return clientes.map((c) => {
    const total = Number(c.valorContratado);
    const pago = c.pagamentos.reduce((s, p) => s + Number(p.valor), 0);
    return {
      id: c.id,
      nome: c.nome,
      produto: c.produto,
      valorContratado: total,
      pago,
      restante: Math.max(0, total - pago),
      statusComercial: c.statusComercial,
      atualizadoEm: c.atualizadoEm,
    };
  });
}

export type KanbanCliente = Awaited<ReturnType<typeof getClientesKanban>>[number];
