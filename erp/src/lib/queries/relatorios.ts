import { prisma } from "@/lib/prisma";
import { sincronizarAtrasos } from "@/lib/financeiro-sync";

export type RelatorioLinha = {
  id: string;
  nome: string;
  cpf: string | null;
  produto: string | null;
  dataEntrada: string; // ISO
  valorTotal: number;
  valorPago: number;
  valorRestante: number;
  formaPagamento: string | null;
  statusComercial: string;
  statusFinanceiro: string;
  datasPagamentos: string[]; // ISO
  dataConclusao: string | null; // ISO — quando virou Venda Fechada
  observacoes: string;
};

export async function getRelatoriosData(): Promise<{ linhas: RelatorioLinha[] }> {
  await sincronizarAtrasos();

  const clientes = await prisma.cliente.findMany({
    orderBy: { dataEntrada: "desc" },
    select: {
      id: true,
      nome: true,
      cpf: true,
      produto: true,
      dataEntrada: true,
      atualizadoEm: true,
      valorContratado: true,
      formaPagamento: true,
      statusComercial: true,
      statusFinanceiro: true,
      pagamentos: { orderBy: { dataPagamento: "asc" }, select: { valor: true, dataPagamento: true } },
      observacoes: { orderBy: { criadoEm: "desc" }, select: { conteudo: true } },
    },
  });

  const linhas: RelatorioLinha[] = clientes.map((c) => {
    const total = Number(c.valorContratado);
    const pago = c.pagamentos.reduce((s, p) => s + Number(p.valor), 0);
    const ultimoPagamento = c.pagamentos.at(-1)?.dataPagamento ?? null;
    const concluido = c.statusComercial === "VENDA_FECHADA";
    return {
      id: c.id,
      nome: c.nome,
      cpf: c.cpf,
      produto: c.produto,
      dataEntrada: c.dataEntrada.toISOString(),
      valorTotal: total,
      valorPago: pago,
      valorRestante: Math.max(0, total - pago),
      formaPagamento: c.formaPagamento,
      statusComercial: c.statusComercial,
      statusFinanceiro: c.statusFinanceiro,
      datasPagamentos: c.pagamentos.map((p) => p.dataPagamento.toISOString()),
      dataConclusao: concluido ? (ultimoPagamento ?? c.atualizadoEm).toISOString() : null,
      observacoes: c.observacoes.map((o) => o.conteudo).join(" | "),
    };
  });

  return { linhas };
}
