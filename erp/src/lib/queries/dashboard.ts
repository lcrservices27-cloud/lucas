import { prisma } from "@/lib/prisma";
import { startOfMonth, startOfYear, subMonths, format, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sincronizarAtrasos } from "@/lib/financeiro-sync";
import type { StatusComercial } from "@/generated/prisma/enums";

export async function getDashboardData() {
  await sincronizarAtrasos();

  const now = new Date();
  const inicioMes = startOfMonth(now);
  const inicioAno = startOfYear(now);
  const seiseMesesAtras = startOfMonth(subMonths(now, 5));

  const [
    totalClientes,
    clientesPorStatusComercial,
    clientesPorStatusFinanceiro,
    pagamentos,
    parcelasPendentes,
    lancamentos,
    clientesRecentes,
    timelineRecente,
    tarefasVencidas,
    clientesParados,
    vendasFechadas,
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.cliente.groupBy({ by: ["statusComercial"], _count: true }),
    prisma.cliente.groupBy({ by: ["statusFinanceiro"], _count: true }),
    prisma.pagamento.findMany({
      where: { dataPagamento: { gte: seiseMesesAtras } },
      select: { valor: true, dataPagamento: true },
    }),
    prisma.parcela.findMany({
      where: { status: { in: ["PENDENTE", "ATRASADA"] } },
      select: { valor: true, status: true },
    }),
    prisma.lancamento.findMany({
      where: { data: { gte: seiseMesesAtras } },
      select: { tipo: true, valor: true, data: true },
    }),
    prisma.cliente.findMany({
      where: { dataEntrada: { gte: seiseMesesAtras } },
      select: { dataEntrada: true },
    }),
    prisma.timelineEntrada.findMany({
      take: 8,
      orderBy: { criadoEm: "desc" },
      include: { cliente: { select: { nome: true } }, usuario: { select: { nome: true } } },
    }),
    prisma.tarefa.count({ where: { concluida: false, prazo: { lt: now } } }),
    prisma.cliente.count({
      where: {
        statusComercial: { notIn: ["VENDA_FECHADA", "CANCELADO"] satisfies StatusComercial[] },
        atualizadoEm: { lt: subMonths(now, 1) },
      },
    }),
    prisma.cliente.findMany({
      where: { statusComercial: "VENDA_FECHADA" },
      select: { valorContratado: true, dataEntrada: true, atualizadoEm: true },
    }),
  ]);

  const countByComercial = Object.fromEntries(
    clientesPorStatusComercial.map((g) => [g.statusComercial, g._count])
  ) as Record<string, number>;
  const countByFinanceiro = Object.fromEntries(
    clientesPorStatusFinanceiro.map((g) => [g.statusFinanceiro, g._count])
  ) as Record<string, number>;

  const clientesAtivos = totalClientes - (countByComercial["CANCELADO"] ?? 0);
  const vendasFechadasTotal = countByComercial["VENDA_FECHADA"] ?? 0;
  const clientesAguardandoPagamento =
    (countByFinanceiro["NAO_INICIADO"] ?? 0) + (countByFinanceiro["PAGAMENTO_PARCIAL"] ?? 0);
  const clientesInadimplentes = countByFinanceiro["ATRASADO"] ?? 0;

  const receitaMes = pagamentos
    .filter((p) => p.dataPagamento >= inicioMes)
    .reduce((acc, p) => acc + Number(p.valor), 0);
  const receitaAno = pagamentos
    .filter((p) => p.dataPagamento >= inicioAno)
    .reduce((acc, p) => acc + Number(p.valor), 0);
  const valorRecebido = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
  const valorPendente = parcelasPendentes.reduce((acc, p) => acc + Number(p.valor), 0);

  const ticketMedio =
    vendasFechadas.length > 0
      ? vendasFechadas.reduce((acc, c) => acc + Number(c.valorContratado), 0) / vendasFechadas.length
      : 0;

  const conversaoVendas = totalClientes > 0 ? (vendasFechadas.length / totalClientes) * 100 : 0;

  const tempoMedioFechamento =
    vendasFechadas.length > 0
      ? vendasFechadas.reduce((acc, c) => acc + differenceInCalendarDays(c.atualizadoEm, c.dataEntrada), 0) /
        vendasFechadas.length
      : 0;

  // Séries mensais (últimos 6 meses)
  const meses = Array.from({ length: 6 }).map((_, i) => startOfMonth(subMonths(now, 5 - i)));
  const receitaMensal = meses.map((mesInicio) => {
    const mesFim = startOfMonth(subMonths(mesInicio, -1));
    const total = pagamentos
      .filter((p) => p.dataPagamento >= mesInicio && p.dataPagamento < mesFim)
      .reduce((acc, p) => acc + Number(p.valor), 0);
    return { mes: format(mesInicio, "MMM", { locale: ptBR }), total };
  });

  const clientesPorMes = meses.map((mesInicio) => {
    const mesFim = startOfMonth(subMonths(mesInicio, -1));
    const total = clientesRecentes.filter(
      (c) => c.dataEntrada >= mesInicio && c.dataEntrada < mesFim
    ).length;
    return { mes: format(mesInicio, "MMM", { locale: ptBR }), total };
  });

  const fluxoCaixa = meses.map((mesInicio) => {
    const mesFim = startOfMonth(subMonths(mesInicio, -1));
    const doMes = lancamentos.filter((l) => l.data >= mesInicio && l.data < mesFim);
    const receitas = doMes.filter((l) => l.tipo === "RECEITA").reduce((acc, l) => acc + Number(l.valor), 0);
    const despesas = doMes.filter((l) => l.tipo === "DESPESA").reduce((acc, l) => acc + Number(l.valor), 0);
    return { mes: format(mesInicio, "MMM", { locale: ptBR }), receitas, despesas, saldo: receitas - despesas };
  });

  const statusComercial = Object.entries(countByComercial).map(([status, count]) => ({ status, count }));

  return {
    cards: {
      totalClientes,
      clientesAtivos,
      vendasFechadas: vendasFechadasTotal,
      clientesAguardandoPagamento,
      clientesInadimplentes,
      receitaMes,
      receitaAno,
      valorRecebido,
      valorPendente,
      ticketMedio,
      conversaoVendas,
      tempoMedioFechamento,
    },
    charts: { receitaMensal, clientesPorMes, fluxoCaixa, statusComercial },
    timelineRecente,
    alertas: {
      tarefasVencidas,
      clientesParados,
      parcelasAtrasadas: parcelasPendentes.filter((p) => p.status === "ATRASADA").length,
    },
  };
}
