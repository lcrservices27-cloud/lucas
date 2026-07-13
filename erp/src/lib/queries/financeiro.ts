import { prisma } from "@/lib/prisma";
import { startOfMonth, startOfYear } from "date-fns";

export async function getFinanceiroData() {
  const now = new Date();
  const inicioMes = startOfMonth(now);
  const inicioAno = startOfYear(now);

  const [lancamentos, parcelasEmAberto, pagamentosRecentes, todasParcelas] = await Promise.all([
    prisma.lancamento.findMany({ orderBy: { data: "desc" } }),
    prisma.parcela.findMany({
      where: { status: { in: ["PENDENTE", "ATRASADA"] } },
      orderBy: { vencimento: "asc" },
      include: { cliente: { select: { id: true, nome: true } } },
    }),
    prisma.pagamento.findMany({
      orderBy: { dataPagamento: "desc" },
      take: 20,
      include: { cliente: { select: { id: true, nome: true } }, registradoPor: { select: { nome: true } } },
    }),
    prisma.parcela.findMany({ select: { valor: true, status: true } }),
  ]);

  const receitasTotais = lancamentos.filter((l) => l.tipo === "RECEITA").reduce((a, l) => a + Number(l.valor), 0);
  const despesasTotais = lancamentos.filter((l) => l.tipo === "DESPESA").reduce((a, l) => a + Number(l.valor), 0);

  const receitasMes = lancamentos
    .filter((l) => l.tipo === "RECEITA" && l.data >= inicioMes)
    .reduce((a, l) => a + Number(l.valor), 0);
  const despesasMes = lancamentos
    .filter((l) => l.tipo === "DESPESA" && l.data >= inicioMes)
    .reduce((a, l) => a + Number(l.valor), 0);

  const receitasAno = lancamentos
    .filter((l) => l.tipo === "RECEITA" && l.data >= inicioAno)
    .reduce((a, l) => a + Number(l.valor), 0);
  const despesasAno = lancamentos
    .filter((l) => l.tipo === "DESPESA" && l.data >= inicioAno)
    .reduce((a, l) => a + Number(l.valor), 0);

  const contasAReceber = parcelasEmAberto.reduce((a, p) => a + Number(p.valor), 0);
  const totalEmParcelas = todasParcelas.reduce((a, p) => a + Number(p.valor), 0);
  const totalParcelasPagas = todasParcelas
    .filter((p) => p.status === "PAGA")
    .reduce((a, p) => a + Number(p.valor), 0);

  return {
    kpis: {
      receitasTotais,
      despesasTotais,
      lucro: receitasTotais - despesasTotais,
      saldo: receitasTotais - despesasTotais,
      receitasMes,
      despesasMes,
      lucroMes: receitasMes - despesasMes,
      receitasAno,
      despesasAno,
      contasAReceber,
      totalEmParcelas,
      totalParcelasPagas,
    },
    lancamentos: lancamentos.slice(0, 40).map((l) => ({ ...l, valor: Number(l.valor) })),
    parcelasEmAberto: parcelasEmAberto.map((p) => ({ ...p, valor: Number(p.valor) })),
    pagamentosRecentes: pagamentosRecentes.map((p) => ({ ...p, valor: Number(p.valor) })),
  };
}
