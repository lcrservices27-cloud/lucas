import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getClienteDetail(id: string) {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      responsavel: { select: { id: true, nome: true } },
      parcelas: { orderBy: { numero: "asc" } },
      pagamentos: {
        orderBy: { dataPagamento: "desc" },
        include: { registradoPor: { select: { nome: true } } },
      },
      documentos: {
        orderBy: { criadoEm: "desc" },
        include: { enviadoPor: { select: { nome: true } } },
      },
      observacoes: {
        orderBy: { criadoEm: "desc" },
        include: { autor: { select: { nome: true } } },
      },
      timelineEntradas: {
        orderBy: { criadoEm: "desc" },
        include: { usuario: { select: { nome: true } } },
      },
      tarefas: {
        orderBy: { criadoEm: "desc" },
        include: { responsavel: { select: { nome: true } } },
      },
      eventos: { orderBy: { inicio: "desc" } },
    },
  });

  if (!cliente) notFound();

  return {
    ...cliente,
    valorContratado: Number(cliente.valorContratado),
    parcelas: cliente.parcelas.map((p) => ({ ...p, valor: Number(p.valor) })),
    pagamentos: cliente.pagamentos.map((p) => ({ ...p, valor: Number(p.valor) })),
  };
}

export type ClienteDetail = Awaited<ReturnType<typeof getClienteDetail>>;
