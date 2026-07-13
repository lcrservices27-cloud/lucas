import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getRelatoriosData() {
  const now = new Date();
  const seisMesesAtras = startOfMonth(subMonths(now, 5));

  const [
    totalClientes,
    clientesPorStatusComercial,
    clientesPorStatusJuridico,
    clientesCidadeEstado,
    clientesOrigem,
    clientesResponsavel,
    pagamentosSeisMeses,
    todosPagamentos,
    parcelasEmAberto,
    pagamentosRecentes,
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.cliente.groupBy({ by: ["statusComercial"], _count: true }),
    prisma.cliente.groupBy({ by: ["statusJuridico"], _count: true }),
    prisma.cliente.findMany({ select: { cidade: true, estado: true } }),
    prisma.cliente.groupBy({ by: ["origemLead"], _count: true }),
    prisma.cliente.findMany({
      select: {
        valorContratado: true,
        responsavel: { select: { id: true, nome: true } },
      },
    }),
    prisma.pagamento.findMany({
      where: { dataPagamento: { gte: seisMesesAtras } },
      select: { valor: true, dataPagamento: true },
    }),
    prisma.pagamento.aggregate({ _sum: { valor: true } }),
    prisma.parcela.findMany({
      where: { status: { in: ["PENDENTE", "ATRASADA"] } },
      select: { valor: true },
    }),
    prisma.pagamento.findMany({
      orderBy: { dataPagamento: "desc" },
      take: 50,
      include: { cliente: { select: { id: true, nome: true } } },
    }),
  ]);

  // Clientes por status comercial / jurídico
  const porStatusComercial = clientesPorStatusComercial.map((g) => ({
    status: g.statusComercial as string,
    count: g._count,
  }));
  const porStatusJuridico = clientesPorStatusJuridico.map((g) => ({
    status: g.statusJuridico as string,
    count: g._count,
  }));

  // Clientes por cidade (top 10)
  const cidadeCounts = new Map<string, number>();
  for (const c of clientesCidadeEstado) {
    const cidade = c.cidade?.trim() || "Não informado";
    const key = c.estado ? `${cidade}/${c.estado}` : cidade;
    cidadeCounts.set(key, (cidadeCounts.get(key) ?? 0) + 1);
  }
  const porCidade = Array.from(cidadeCounts.entries())
    .map(([cidade, count]) => ({ cidade, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Clientes por origem de lead
  const porOrigem = clientesOrigem
    .map((g) => ({ origem: g.origemLead ?? "Não informado", count: g._count }))
    .sort((a, b) => b.count - a.count);

  // Clientes por responsável
  const responsavelMap = new Map<string, { nome: string; count: number; total: number }>();
  for (const c of clientesResponsavel) {
    const nome = c.responsavel?.nome ?? "Sem responsável";
    const entry = responsavelMap.get(nome) ?? { nome, count: 0, total: 0 };
    entry.count += 1;
    entry.total += Number(c.valorContratado);
    responsavelMap.set(nome, entry);
  }
  const porResponsavel = Array.from(responsavelMap.values()).sort((a, b) => b.total - a.total);

  // Receita
  const totalReceita = Number(todosPagamentos._sum.valor ?? 0);
  const totalAReceber = parcelasEmAberto.reduce((acc, p) => acc + Number(p.valor), 0);

  const meses = Array.from({ length: 6 }).map((_, i) => startOfMonth(subMonths(now, 5 - i)));
  const receitaMensal = meses.map((mesInicio) => {
    const mesFim = startOfMonth(subMonths(mesInicio, -1));
    const total = pagamentosSeisMeses
      .filter((p) => p.dataPagamento >= mesInicio && p.dataPagamento < mesFim)
      .reduce((acc, p) => acc + Number(p.valor), 0);
    return { mes: format(mesInicio, "MMM", { locale: ptBR }), total };
  });

  // Conversão
  const vendasFechadas = porStatusComercial.find((s) => s.status === "VENDA_FECHADA")?.count ?? 0;
  const conversao = totalClientes > 0 ? (vendasFechadas / totalClientes) * 100 : 0;

  // Pagamentos (últimos ~50)
  const pagamentos = pagamentosRecentes.map((p) => ({
    id: p.id,
    clienteId: p.cliente.id,
    clienteNome: p.cliente.nome,
    tipo: p.tipo as string,
    metodo: p.metodo as string,
    valor: Number(p.valor),
    dataPagamento: p.dataPagamento,
  }));

  return {
    clientes: {
      total: totalClientes,
      porStatusComercial,
      porStatusJuridico,
      porCidade,
      porOrigem,
      porResponsavel,
      conversao,
    },
    financeiro: {
      totalReceita,
      totalAReceber,
      receitaMensal,
    },
    processos: {
      porStatusJuridico,
    },
    pagamentos,
  };
}

export type RelatoriosData = Awaited<ReturnType<typeof getRelatoriosData>>;
