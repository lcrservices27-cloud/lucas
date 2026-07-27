import "server-only";
import { subDays, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { logTimeline } from "@/lib/actions/timeline";
import { registrarPagamento } from "@/lib/actions/pagamentos";
import { moveClienteComercial } from "@/lib/actions/clientes";
import { formatCurrency, formatDate } from "@/lib/utils";
import { normalizar } from "@/lib/assistant/normalize";
import { calcularStatusCliente } from "@/lib/status-cliente";
import { STATUS_COMERCIAL_LABEL } from "@/lib/labels";
import type { AssistenteDraftCliente, AssistenteUiAction, ListaItem } from "@/lib/assistant/types";

export type ClienteCandidato = { id: string; nome: string; telefone: string | null };

export async function buscarClientesCandidatos(consulta: string, limite = 5): Promise<ClienteCandidato[]> {
  const alvo = normalizar(consulta);
  if (!alvo) return [];

  const clientes = await prisma.cliente.findMany({
    select: { id: true, nome: true, telefone: true },
  });

  const tokensAlvo = alvo.split(/\s+/).filter((t) => t.length > 1);

  const pontuados = clientes
    .map((c) => {
      const nomeNorm = normalizar(c.nome);
      let pontos = -1;
      if (nomeNorm === alvo) pontos = 100;
      else if (nomeNorm.includes(alvo)) pontos = 80 - Math.abs(nomeNorm.length - alvo.length);
      else {
        const tokensNome = nomeNorm.split(/\s+/).filter(Boolean);
        const bateram = tokensAlvo.filter((t) => tokensNome.some((n) => n.includes(t))).length;
        const cobertura = tokensAlvo.length > 0 ? bateram / tokensAlvo.length : 0;
        if (bateram > 0 && cobertura >= 0.5) pontos = cobertura * 50 - nomeNorm.length * 0.1;
      }
      return { cliente: c, pontos };
    })
    .filter((p) => p.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos);

  if (pontuados.length === 0) return [];

  const [melhor, segundo] = pontuados;
  if (melhor.pontos === 100 || !segundo || melhor.pontos - segundo.pontos >= 25) {
    return [melhor.cliente];
  }

  return pontuados.slice(0, limite).map((p) => p.cliente);
}

export async function criarClienteAssistente(draft: AssistenteDraftCliente) {
  const valorContratado = draft.valorContratado ?? 0;
  const valorEntrada = draft.valorEntrada ?? 0;

  const pagoInicial = Math.min(valorEntrada, valorContratado);
  const { comercial, financeiro } = calcularStatusCliente(valorContratado, pagoInicial);
  const formaPagamento = valorEntrada > 0 && valorEntrada < valorContratado ? "ENTRADA_MAIS_PARCELAS" : valorContratado > 0 ? "A_VISTA" : null;

  const cliente = await prisma.cliente.create({
    data: {
      nome: draft.nome ?? "Cliente sem nome",
      tipoPessoa: draft.cnpj ? "JURIDICA" : "FISICA",
      cpf: draft.cnpj ? null : draft.cpf || null,
      cnpj: draft.cnpj || null,
      telefone: draft.telefone || null,
      whatsapp: draft.telefone || null,
      valorContratado,
      statusComercial: comercial,
      statusFinanceiro: financeiro,
      formaPagamento,
    },
  });

  await logTimeline(cliente.id, "CLIENTE_CRIADO", `Cliente ${cliente.nome} cadastrado via assistente de voz`);

  if (valorEntrada > 0) {
    await registrarPagamento({
      clienteId: cliente.id,
      tipo: "ENTRADA",
      metodo: "PIX",
      valor: valorEntrada,
      observacao: draft.observacaoPagamento || "Registrado via assistente de voz",
    });
  }

  return cliente;
}

export async function registrarPagamentoAssistente(clienteId: string, valor: number) {
  await registrarPagamento({
    clienteId,
    tipo: "PARCELA",
    metodo: "PIX",
    valor,
    observacao: "Registrado via assistente de voz",
  });
}

const STATUS_KANBAN_NORMALIZADO = (() => {
  const mapa: { normalizado: string; status: string; tipo: "comercial" }[] = [];
  for (const [status, label] of Object.entries(STATUS_COMERCIAL_LABEL)) {
    mapa.push({ normalizado: normalizar(label), status, tipo: "comercial" });
  }
  return mapa;
})();

export function resolverStatusKanban(alvo: string): { status: string; tipo: "comercial" } | null {
  const alvoNorm = normalizar(alvo);
  let melhor: { status: string; tipo: "comercial"; pontos: number } | null = null;

  for (const opcao of STATUS_KANBAN_NORMALIZADO) {
    let pontos = 0;
    if (opcao.normalizado === alvoNorm) pontos = 100;
    else if (alvoNorm.includes(opcao.normalizado) || opcao.normalizado.includes(alvoNorm)) {
      pontos = 60 - Math.abs(opcao.normalizado.length - alvoNorm.length);
    }
    if (pontos > 0 && (!melhor || pontos > melhor.pontos)) {
      melhor = { status: opcao.status, tipo: opcao.tipo, pontos };
    }
  }

  return melhor ? { status: melhor.status, tipo: melhor.tipo } : null;
}

export async function moverClienteKanban(clienteId: string, alvo: string) {
  const resolvido = resolverStatusKanban(alvo);
  if (!resolvido) return null;

  await moveClienteComercial(clienteId, resolvido.status);

  return resolvido;
}

export async function buscarClientesPorFiltro(
  filtro: string
): Promise<{ titulo: string; itens: ListaItem[]; hrefLista?: string }> {
  const f = normalizar(filtro);

  if (f.includes("inadimplente") || f.includes("atrasad")) {
    const clientes = await prisma.cliente.findMany({
      where: { statusFinanceiro: "ATRASADO" },
      select: { id: true, nome: true, telefone: true },
      take: 30,
    });
    return {
      titulo: "Clientes inadimplentes",
      itens: clientes.map((c) => ({ label: c.nome, sublabel: c.telefone ?? undefined, href: `/crm/${c.id}` })),
      hrefLista: "/crm?statusFinanceiro=ATRASADO",
    };
  }

  if (f.includes("pagamento")) {
    const clientes = await prisma.cliente.findMany({
      where: { statusFinanceiro: { in: ["NAO_INICIADO", "PAGAMENTO_PARCIAL"] } },
      select: { id: true, nome: true, telefone: true },
      take: 30,
    });
    return {
      titulo: "Clientes aguardando pagamento",
      itens: clientes.map((c) => ({ label: c.nome, sublabel: c.telefone ?? undefined, href: `/crm/${c.id}` })),
    };
  }

  if (f.includes("parado") || f.includes("30 dia")) {
    const clientes = await prisma.cliente.findMany({
      where: {
        statusComercial: { notIn: ["VENDA_FECHADA", "CANCELADO"] },
        atualizadoEm: { lt: subDays(new Date(), 30) },
      },
      select: { id: true, nome: true, atualizadoEm: true },
      take: 30,
    });
    return {
      titulo: "Clientes parados há mais de 30 dias",
      itens: clientes.map((c) => ({
        label: c.nome,
        sublabel: `Sem atividade desde ${formatDate(c.atualizadoEm)}`,
        href: `/crm/${c.id}`,
      })),
    };
  }

  const clientes = await prisma.cliente.findMany({
    select: { id: true, nome: true, telefone: true },
    take: 20,
    orderBy: { criadoEm: "desc" },
  });
  return {
    titulo: "Clientes",
    itens: clientes.map((c) => ({ label: c.nome, sublabel: c.telefone ?? undefined, href: `/crm/${c.id}` })),
  };
}

export function uiDeResultadoBusca(resultado: {
  titulo: string;
  itens: ListaItem[];
  hrefLista?: string;
}): AssistenteUiAction {
  if (resultado.hrefLista) return { kind: "navigate", href: resultado.hrefLista };
  return { kind: "list", titulo: resultado.titulo, itens: resultado.itens };
}

export async function responderPerguntaFinanceira(pergunta: string): Promise<string> {
  const p = normalizar(pergunta);

  if (p.includes("falta receber") || (p.includes("quanto") && p.includes("receber"))) {
    const esteMes = p.includes("este mes") || p.includes("esse mes") || p.includes("mes");
    const statusPendentes: ("PENDENTE" | "ATRASADA")[] = ["PENDENTE", "ATRASADA"];
    const parcelas = await prisma.parcela.findMany({
      where: {
        status: { in: statusPendentes },
        ...(esteMes ? { vencimento: { gte: startOfMonth(new Date()) } } : {}),
      },
    });
    const total = parcelas.reduce((acc, p) => acc + Number(p.valor), 0);
    return `Ainda falta receber ${formatCurrency(total)}${esteMes ? " este mês" : ""}, em ${parcelas.length} parcela(s) pendente(s) ou atrasada(s).`;
  }

  if (p.includes("inadimplent")) {
    const total = await prisma.cliente.count({ where: { statusFinanceiro: "ATRASADO" } });
    return `Existem ${total} cliente(s) inadimplente(s) no momento.`;
  }

  const [pendentes, contratado] = await Promise.all([
    prisma.parcela.aggregate({
      where: { status: { in: ["PENDENTE", "ATRASADA"] } },
      _sum: { valor: true },
    }),
    prisma.cliente.aggregate({ _sum: { valorContratado: true } }),
  ]);

  return `Valor pendente a receber: ${formatCurrency(Number(pendentes._sum.valor ?? 0))}. Valor total contratado na base: ${formatCurrency(Number(contratado._sum.valorContratado ?? 0))}.`;
}
