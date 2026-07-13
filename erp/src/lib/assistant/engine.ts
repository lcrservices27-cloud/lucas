import "server-only";
import { prisma } from "@/lib/prisma";
import { processarHeuristica } from "@/lib/assistant/heuristica";
import { processarComLLM, assistantConfigured } from "@/lib/assistant/llm";
import {
  criarClienteAssistente,
  registrarPagamentoAssistente,
  moverClienteKanban,
} from "@/lib/assistant/tools";
import { formatCurrency } from "@/lib/utils";
import type {
  AssistenteContexto,
  AssistenteResposta,
  AssistenteTurno,
  ClarifyAcao,
  PendingAction,
} from "@/lib/assistant/types";

export { assistantConfigured };

export async function processarTurno(
  texto: string,
  contexto: AssistenteContexto,
  historico: AssistenteTurno[],
  usuarioId: string
): Promise<AssistenteResposta> {
  const resposta = assistantConfigured()
    ? await processarComLLM(texto, contexto, historico, usuarioId)
    : await processarHeuristica(texto, contexto, usuarioId);

  await prisma.assistenteInteracao.create({
    data: {
      usuarioId,
      transcricao: texto,
      resposta: resposta.fala,
      tipoAcao: resposta.tipoAcao ?? undefined,
      payload: resposta.ui.kind === "confirm" ? (resposta.ui.pendingAction as object) : undefined,
      executada: resposta.executada,
    },
  });

  return resposta;
}

export async function confirmarAcaoPendente(
  pendingAction: PendingAction,
  usuarioId: string
): Promise<{ fala: string; href?: string }> {
  if (pendingAction.type === "criar_cliente") {
    const cliente = await criarClienteAssistente(pendingAction.payload);
    await prisma.assistenteInteracao.create({
      data: {
        usuarioId,
        transcricao: "(confirmação)",
        resposta: `Cliente ${cliente.nome} cadastrado.`,
        tipoAcao: "CRIAR_CLIENTE",
        payload: pendingAction.payload as object,
        executada: true,
      },
    });
    return { fala: `${cliente.nome} foi cadastrado com sucesso.`, href: `/crm/${cliente.id}` };
  }

  if (pendingAction.type === "registrar_pagamento") {
    await registrarPagamentoAssistente(pendingAction.payload.clienteId, pendingAction.payload.valor);
    await prisma.assistenteInteracao.create({
      data: {
        usuarioId,
        transcricao: "(confirmação)",
        resposta: `Pagamento de ${formatCurrency(pendingAction.payload.valor)} registrado para ${pendingAction.payload.clienteNome}.`,
        tipoAcao: "REGISTRAR_PAGAMENTO",
        payload: pendingAction.payload as object,
        executada: true,
      },
    });
    return {
      fala: `Pagamento registrado para ${pendingAction.payload.clienteNome}.`,
      href: `/crm/${pendingAction.payload.clienteId}`,
    };
  }

  return { fala: "Ação cancelada." };
}

export async function resolverClarificacao(
  acao: ClarifyAcao,
  clienteId: string,
  usuarioId: string,
  extra?: { valor?: number; statusAlvo?: string }
): Promise<{ fala: string; href?: string }> {
  const clienteBasico = await prisma.cliente.findUnique({ where: { id: clienteId }, select: { nome: true } });
  const nome = clienteBasico?.nome ?? "Cliente";

  if (acao === "registrar_pagamento" && extra?.valor) {
    await registrarPagamentoAssistente(clienteId, extra.valor);
    await prisma.assistenteInteracao.create({
      data: {
        usuarioId,
        transcricao: "(desambiguação)",
        resposta: `Pagamento de ${formatCurrency(extra.valor)} registrado para ${nome}.`,
        tipoAcao: "REGISTRAR_PAGAMENTO",
        executada: true,
      },
    });
    return { fala: `Pagamento de ${formatCurrency(extra.valor)} registrado para ${nome}.`, href: `/crm/${clienteId}` };
  }

  if (acao === "mover_kanban" && extra?.statusAlvo) {
    const resultado = await moverClienteKanban(clienteId, extra.statusAlvo);
    if (!resultado) return { fala: `Não reconheci o status "${extra.statusAlvo}".` };
    await prisma.assistenteInteracao.create({
      data: {
        usuarioId,
        transcricao: "(desambiguação)",
        resposta: `${nome} movido para "${extra.statusAlvo}".`,
        tipoAcao: "MOVER_KANBAN",
        executada: true,
      },
    });
    return {
      fala: `${nome} foi movido para "${extra.statusAlvo}".`,
      href: resultado.tipo === "comercial" ? "/comercial" : "/juridico",
    };
  }

  if (acao === "abrir_cliente") {
    return { fala: `Abrindo a ficha de ${nome}.`, href: `/crm/${clienteId}` };
  }

  return { fala: "Não foi possível concluir." };
}

export async function getHistoricoAssistente(limite = 30) {
  return prisma.assistenteInteracao.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite,
    include: { usuario: { select: { nome: true } } },
  });
}
