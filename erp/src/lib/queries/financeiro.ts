import { prisma } from "@/lib/prisma";
import { startOfMonth, startOfDay } from "date-fns";
import { sincronizarAtrasos } from "@/lib/financeiro-sync";

export type FluxoItem = {
  id: string;
  data: Date;
  tipo: "RECEITA" | "DESPESA";
  clienteId: string | null;
  clienteNome: string | null;
  produto: string | null;
  descricao: string;
  forma: string | null;
  valor: number;
  saldoAcumulado: number;
};

export async function getFinanceiroData() {
  await sincronizarAtrasos();

  const now = new Date();
  const inicioMes = startOfMonth(now);
  const inicioDia = startOfDay(now);

  const [pagamentos, lancamentos, clientes, vendasFechadas, aguardandoPix] = await Promise.all([
    prisma.pagamento.findMany({
      orderBy: { dataPagamento: "asc" },
      include: { cliente: { select: { id: true, nome: true, produto: true } } },
    }),
    prisma.lancamento.findMany({ orderBy: { data: "asc" } }),
    prisma.cliente.findMany({
      where: { statusComercial: { not: "CANCELADO" } },
      select: { valorContratado: true, pagamentos: { select: { valor: true } } },
    }),
    prisma.cliente.count({ where: { statusComercial: "VENDA_FECHADA" } }),
    prisma.cliente.count({ where: { statusComercial: "AGUARDANDO_PIX" } }),
  ]);

  // Ledger unificado: pagamentos (entradas de clientes) + lançamentos manuais.
  type Raw = {
    id: string;
    data: Date;
    tipo: "RECEITA" | "DESPESA";
    clienteId: string | null;
    clienteNome: string | null;
    produto: string | null;
    descricao: string;
    forma: string | null;
    valor: number;
  };

  const raw: Raw[] = [
    ...pagamentos.map((p) => ({
      id: `pg-${p.id}`,
      data: p.dataPagamento,
      tipo: "RECEITA" as const,
      clienteId: p.cliente.id,
      clienteNome: p.cliente.nome,
      produto: p.cliente.produto,
      descricao: `Pagamento de ${p.cliente.nome}`,
      forma: p.metodo,
      valor: Number(p.valor),
    })),
    ...lancamentos.map((l) => ({
      id: `lc-${l.id}`,
      data: l.data,
      tipo: l.tipo as "RECEITA" | "DESPESA",
      clienteId: null,
      clienteNome: null,
      produto: null,
      descricao: l.descricao || l.categoria,
      forma: null,
      valor: Number(l.valor),
    })),
  ].sort((a, b) => a.data.getTime() - b.data.getTime());

  // Saldo acumulado em ordem cronológica.
  let acumulado = 0;
  const fluxoAsc: FluxoItem[] = raw.map((r) => {
    acumulado += r.tipo === "RECEITA" ? r.valor : -r.valor;
    return { ...r, saldoAcumulado: acumulado };
  });
  const fluxo = [...fluxoAsc].reverse(); // mais recentes primeiro para exibição

  const saldoAcumulado = acumulado;
  const saldoDoDia = raw
    .filter((r) => r.data >= inicioDia)
    .reduce((acc, r) => acc + (r.tipo === "RECEITA" ? r.valor : -r.valor), 0);
  const totalRecebidoMes = raw
    .filter((r) => r.tipo === "RECEITA" && r.data >= inicioMes)
    .reduce((acc, r) => acc + r.valor, 0);

  const totalPendente = clientes.reduce((acc, c) => {
    const total = Number(c.valorContratado);
    const pago = c.pagamentos.reduce((s, p) => s + Number(p.valor), 0);
    return acc + Math.max(0, total - pago);
  }, 0);

  return {
    kpis: {
      saldoDoDia,
      saldoAcumulado,
      totalRecebidoMes,
      totalPendente,
      vendasFechadas,
      aguardandoPix,
    },
    fluxo,
  };
}
