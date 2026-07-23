import { prisma } from "@/lib/prisma";
import {
  monthRange,
  remainingDaysInMonth,
  toMonthKey,
} from "@/lib/utils";

export type MonthSummary = {
  monthKey: string;
  saldoAtual: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoLiquido: number;
  disponivelParaGuardar: number;
  metaMensal: number;
  jaGuardado: number;
  faltaParaMeta: number;
  percentualMeta: number;
  diasRestantes: number;
  precisaGuardarPorDia: number;
  totalDespesasFixas: number;
  fixedExpenses: { id: string; name: string; amount: number }[];
  lazer: {
    gasto: number;
    quantidade: number;
    podeGastar: number;
  };
};

/**
 * Saldo acumulado (todas as entradas - todas as saídas) até o fim do mês dado.
 */
async function computeSaldoAtual(userId: string, end: Date): Promise<number> {
  const rows = await prisma.transaction.findMany({
    where: { userId, date: { lte: end } },
    select: { type: true, amount: true },
  });
  return rows.reduce(
    (acc, r) => acc + (r.type === "entrada" ? r.amount : -r.amount),
    0
  );
}

export async function getMonthSummary(
  userId: string,
  monthKey: string
): Promise<MonthSummary> {
  const { start, end } = monthRange(monthKey);

  const [monthTx, goal, fixed, saldoAtual] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { type: true, amount: true, category: true },
    }),
    prisma.savingsGoal.findFirst({ where: { userId, active: true } }),
    prisma.fixedExpense.findMany({
      where: { userId, active: true },
      orderBy: { amount: "desc" },
      select: { id: true, name: true, amount: true },
    }),
    computeSaldoAtual(userId, end),
  ]);

  const totalEntradas = monthTx
    .filter((t) => t.type === "entrada")
    .reduce((s, t) => s + t.amount, 0);
  const totalSaidas = monthTx
    .filter((t) => t.type === "saida")
    .reduce((s, t) => s + t.amount, 0);
  const saldoLiquido = totalEntradas - totalSaidas;

  const metaMensal = goal?.monthlyTarget ?? 0;

  // "Já guardado" no mês = saldo líquido positivo do mês (o que sobrou).
  const jaGuardado = Math.max(0, saldoLiquido);
  const faltaParaMeta = Math.max(0, metaMensal - jaGuardado);
  const percentualMeta =
    metaMensal > 0 ? Math.min(100, (jaGuardado / metaMensal) * 100) : 0;

  const diasRestantes = remainingDaysInMonth(monthKey);
  const precisaGuardarPorDia =
    diasRestantes > 0 ? faltaParaMeta / diasRestantes : 0;

  // Disponível para guardar = o que já sobrou este mês.
  const disponivelParaGuardar = saldoLiquido;

  const totalDespesasFixas = fixed.reduce((s, f) => s + f.amount, 0);

  // Lazer
  const lazerTx = monthTx.filter(
    (t) => t.type === "saida" && t.category === "Lazer"
  );
  const gastoLazer = lazerTx.reduce((s, t) => s + t.amount, 0);

  // Orçamento de lazer: quanto ainda pode gastar sem comprometer a meta.
  // Base = entradas do mês - despesas fixas - meta mensal.
  const orcamentoLazer = Math.max(
    0,
    totalEntradas - totalDespesasFixas - metaMensal
  );
  const podeGastarLazer = Math.max(0, orcamentoLazer - gastoLazer);

  return {
    monthKey,
    saldoAtual,
    totalEntradas,
    totalSaidas,
    saldoLiquido,
    disponivelParaGuardar,
    metaMensal,
    jaGuardado,
    faltaParaMeta,
    percentualMeta,
    diasRestantes,
    precisaGuardarPorDia,
    totalDespesasFixas,
    fixedExpenses: fixed,
    lazer: {
      gasto: gastoLazer,
      quantidade: lazerTx.length,
      podeGastar: podeGastarLazer,
    },
  };
}

export type ReportData = {
  monthlyEntradas: { month: string; value: number }[];
  monthlySaidas: { month: string; value: number }[];
  monthlyGuardado: { month: string; value: number }[];
  saldoEvolution: { month: string; value: number }[];
  saidasPorCategoria: { category: string; value: number }[];
  projection: {
    totalTarget: number;
    accumulated: number;
    mediaMensal: number;
    mesesRestantes: number | null;
    dataProjetada: string | null;
  };
};

/**
 * Dados agregados para a tela de relatórios (últimos N meses).
 */
export async function getReportData(
  userId: string,
  months = 6
): Promise<ReportData> {
  const all = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: { type: true, amount: true, category: true, date: true },
  });

  const goal = await prisma.savingsGoal.findFirst({
    where: { userId, active: true },
  });

  // Gera as chaves dos últimos `months` meses (incluindo o atual).
  const now = new Date();
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(toMonthKey(d));
  }

  const entradasByMonth: Record<string, number> = {};
  const saidasByMonth: Record<string, number> = {};
  const catTotals: Record<string, number> = {};
  keys.forEach((k) => {
    entradasByMonth[k] = 0;
    saidasByMonth[k] = 0;
  });

  let runningSaldo = 0;
  const saldoAtEndOfMonth: Record<string, number> = {};

  for (const t of all) {
    const k = toMonthKey(new Date(t.date));
    if (t.type === "entrada") {
      runningSaldo += t.amount;
      if (k in entradasByMonth) entradasByMonth[k] += t.amount;
    } else {
      runningSaldo -= t.amount;
      if (k in saidasByMonth) saidasByMonth[k] += t.amount;
      catTotals[t.category] = (catTotals[t.category] ?? 0) + t.amount;
    }
    saldoAtEndOfMonth[k] = runningSaldo;
  }

  // Preenche o saldo ao fim de cada mês listado (carrega o anterior).
  let last = 0;
  const saldoEvolution = keys.map((k) => {
    if (k in saldoAtEndOfMonth) last = saldoAtEndOfMonth[k];
    return { month: k, value: last };
  });

  const monthlyEntradas = keys.map((k) => ({ month: k, value: entradasByMonth[k] }));
  const monthlySaidas = keys.map((k) => ({ month: k, value: saidasByMonth[k] }));
  const monthlyGuardado = keys.map((k) => ({
    month: k,
    value: Math.max(0, entradasByMonth[k] - saidasByMonth[k]),
  }));

  const saidasPorCategoria = Object.entries(catTotals)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  // Projeção para atingir o objetivo total (ex.: R$ 40.000).
  const accumulated = monthlyGuardado.reduce((s, m) => s + m.value, 0);
  const guardadoMeses = monthlyGuardado.filter((m) => m.value > 0);
  const mediaMensal =
    guardadoMeses.length > 0
      ? guardadoMeses.reduce((s, m) => s + m.value, 0) / guardadoMeses.length
      : 0;

  const totalTarget = goal?.totalTarget ?? 0;
  let mesesRestantes: number | null = null;
  let dataProjetada: string | null = null;
  if (totalTarget > 0 && mediaMensal > 0) {
    const restante = Math.max(0, totalTarget - accumulated);
    mesesRestantes = Math.ceil(restante / mediaMensal);
    const proj = new Date(now.getFullYear(), now.getMonth() + mesesRestantes, 1);
    dataProjetada = toMonthKey(proj);
  }

  return {
    monthlyEntradas,
    monthlySaidas,
    monthlyGuardado,
    saldoEvolution,
    saidasPorCategoria,
    projection: {
      totalTarget,
      accumulated,
      mediaMensal,
      mesesRestantes,
      dataProjetada,
    },
  };
}
