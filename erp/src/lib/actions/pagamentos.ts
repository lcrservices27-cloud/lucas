"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logTimeline } from "@/lib/actions/timeline";
import { formatCurrency } from "@/lib/utils";
import type { MetodoPagamento, TipoPagamento } from "@/generated/prisma/enums";

export type RegistrarPagamentoInput = {
  clienteId: string;
  parcelaId?: string;
  tipo: TipoPagamento;
  metodo: MetodoPagamento;
  valor: number;
  observacao?: string;
};

async function recalcularStatusFinanceiro(clienteId: string) {
  const [cliente, parcelas, pagamentos] = await Promise.all([
    prisma.cliente.findUniqueOrThrow({ where: { id: clienteId } }),
    prisma.parcela.findMany({ where: { clienteId } }),
    prisma.pagamento.findMany({ where: { clienteId } }),
  ]);

  const totalPago = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
  const valorContratado = Number(cliente.valorContratado);
  const temAtrasada = parcelas.some((p) => p.status === "ATRASADA");

  let status: "NAO_INICIADO" | "ENTRADA_PAGA" | "PAGAMENTO_PARCIAL" | "PAGO" | "ATRASADO" = "NAO_INICIADO";
  if (valorContratado > 0 && totalPago >= valorContratado) {
    status = "PAGO";
  } else if (temAtrasada) {
    status = "ATRASADO";
  } else if (totalPago > 0) {
    status = parcelas.length > 0 && parcelas.some((p) => p.numero === 1 && p.status === "PAGA") && totalPago < valorContratado
      ? "PAGAMENTO_PARCIAL"
      : "PAGAMENTO_PARCIAL";
  }

  await prisma.cliente.update({ where: { id: clienteId }, data: { statusFinanceiro: status } });
}

export async function registrarPagamento(input: RegistrarPagamentoInput) {
  const usuario = await getCurrentUser();

  await prisma.$transaction(async (tx) => {
    await tx.pagamento.create({
      data: {
        clienteId: input.clienteId,
        parcelaId: input.parcelaId || null,
        tipo: input.tipo,
        metodo: input.metodo,
        valor: input.valor,
        observacao: input.observacao || null,
        registradoPorId: usuario?.id,
      },
    });

    if (input.parcelaId) {
      await tx.parcela.update({ where: { id: input.parcelaId }, data: { status: "PAGA" } });
    }
  });

  await recalcularStatusFinanceiro(input.clienteId);
  await logTimeline(
    input.clienteId,
    "PAGAMENTO_RECEBIDO",
    `Pagamento registrado — ${formatCurrency(input.valor)}`,
    usuario?.id
  );

  revalidatePath(`/crm/${input.clienteId}`);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function marcarParcelaAtrasada(parcelaId: string, clienteId: string) {
  await prisma.parcela.update({ where: { id: parcelaId }, data: { status: "ATRASADA" } });
  await recalcularStatusFinanceiro(clienteId);
  revalidatePath(`/crm/${clienteId}`);
  revalidatePath("/financeiro");
}
