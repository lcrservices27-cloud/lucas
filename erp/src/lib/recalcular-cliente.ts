import "server-only";
import { prisma } from "@/lib/prisma";
import { calcularStatusCliente } from "@/lib/status-cliente";

// Recalcula e persiste os dois status do cliente (comercial + financeiro) a
// partir do total contratado e da soma dos pagamentos. É o coração da
// automação: registrar um pagamento — ou mudar o valor contratado — reposiciona
// o cliente no Kanban e no financeiro sem nenhuma ação manual.
//
// Vive fora de "use server" de propósito: num módulo de server action todo
// export vira endpoint público, e isto aqui é chamado só internamente.
export async function recalcularCliente(clienteId: string) {
  const [cliente, parcelas, pagamentos] = await Promise.all([
    prisma.cliente.findUniqueOrThrow({ where: { id: clienteId } }),
    prisma.parcela.findMany({ where: { clienteId }, select: { status: true } }),
    prisma.pagamento.findMany({ where: { clienteId }, select: { valor: true } }),
  ]);

  // Cancelamento é decisão manual — não deve ser revertido por um recálculo.
  if (cliente.statusComercial === "CANCELADO" || cliente.statusFinanceiro === "CANCELADO") return;

  const totalPago = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
  const valorContratado = Number(cliente.valorContratado);
  const temAtrasada = parcelas.some((p) => p.status === "ATRASADA");

  const { comercial, financeiro } = calcularStatusCliente(valorContratado, totalPago, temAtrasada);

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { statusComercial: comercial, statusFinanceiro: financeiro },
  });
}

// Soma dos pagamentos já registrados para o cliente.
export async function totalPagoDoCliente(clienteId: string) {
  const pagamentos = await prisma.pagamento.findMany({
    where: { clienteId },
    select: { valor: true },
  });
  return pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
}
