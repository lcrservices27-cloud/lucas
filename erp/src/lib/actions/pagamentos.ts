"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth";
import { logTimeline } from "@/lib/actions/timeline";
import { formatCurrency } from "@/lib/utils";
import { recalcularCliente } from "@/lib/recalcular-cliente";
import type { MetodoPagamento, TipoPagamento } from "@/generated/prisma/enums";

export type RegistrarPagamentoInput = {
  clienteId: string;
  parcelaId?: string;
  tipo: TipoPagamento;
  metodo: MetodoPagamento;
  valor: number;
  observacao?: string;
};

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

  await recalcularCliente(input.clienteId);
  await logTimeline(
    input.clienteId,
    "PAGAMENTO_RECEBIDO",
    `Pagamento registrado — ${formatCurrency(input.valor)}`,
    usuario.id
  );

  // O pagamento muda o status do cliente, então ele se move no Kanban e nos
  // KPIs — invalida todas as telas que mostram saldo, pendência ou etapa.
  revalidatePath(`/crm/${input.clienteId}`);
  revalidatePath("/crm");
  revalidatePath("/comercial");
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  revalidatePath("/relatorios");
}

export async function marcarParcelaAtrasada(parcelaId: string, clienteId: string) {
  await assertUser();
  await prisma.parcela.update({ where: { id: parcelaId }, data: { status: "ATRASADA" } });
  await recalcularCliente(clienteId);
  revalidatePath(`/crm/${clienteId}`);
  revalidatePath("/financeiro");
}
