"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth";
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

  // Cancelamento é decisão manual — não deve ser revertido por um recálculo.
  if (cliente.statusFinanceiro === "CANCELADO") return;

  const totalPago = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
  const valorContratado = Number(cliente.valorContratado);
  const temAtrasada = parcelas.some((p) => p.status === "ATRASADA");
  const soEntradaPaga =
    pagamentos.length > 0 && pagamentos.every((p) => p.tipo === "ENTRADA");

  let status: "NAO_INICIADO" | "ENTRADA_PAGA" | "PAGAMENTO_PARCIAL" | "PAGO" | "ATRASADO" = "NAO_INICIADO";
  if (valorContratado > 0 && totalPago >= valorContratado) {
    status = "PAGO";
  } else if (temAtrasada) {
    status = "ATRASADO";
  } else if (soEntradaPaga) {
    status = "ENTRADA_PAGA";
  } else if (totalPago > 0) {
    status = "PAGAMENTO_PARCIAL";
  }

  await prisma.cliente.update({ where: { id: clienteId }, data: { statusFinanceiro: status } });
}

export async function registrarPagamento(input: RegistrarPagamentoInput) {
  const usuario = await assertUser();

  if (!Number.isFinite(input.valor) || input.valor <= 0) {
    throw new Error("Valor de pagamento inválido.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.pagamento.create({
      data: {
        clienteId: input.clienteId,
        parcelaId: input.parcelaId || null,
        tipo: input.tipo,
        metodo: input.metodo,
        valor: input.valor,
        observacao: input.observacao || null,
        registradoPorId: usuario.id,
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
    usuario.id
  );

  revalidatePath(`/crm/${input.clienteId}`);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function marcarParcelaAtrasada(parcelaId: string, clienteId: string) {
  await assertUser();
  await prisma.parcela.update({ where: { id: parcelaId }, data: { status: "ATRASADA" } });
  await recalcularStatusFinanceiro(clienteId);
  revalidatePath(`/crm/${clienteId}`);
  revalidatePath("/financeiro");
}
