import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { parseDataHoraPtBr } from "@/lib/assistant/data-parser";
import { formatCurrency } from "@/lib/utils";
import {
  buscarClientesCandidatos,
  buscarClientesPorFiltro,
  responderPerguntaFinanceira,
  moverClienteKanban,
  registrarPagamentoAssistente,
  criarTarefaAssistente,
  formatarQuando,
  uiDeResultadoBusca,
} from "@/lib/assistant/tools";
import type {
  AssistenteContexto,
  AssistenteResposta,
  AssistenteTurno,
  ClarifyAcao,
} from "@/lib/assistant/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ASSISTANT_MODEL || "claude-sonnet-5";

const TOOLS: Anthropic.Tool[] = [
  {
    name: "atualizar_cadastro_cliente",
    description:
      "Registra ou atualiza um ou mais campos do cliente que está sendo cadastrado nesta conversa. Chame sempre que o usuário informar um novo dado (nome, cpf, telefone, cidade, valor do contrato, valor de entrada pago, ou observação sobre como o restante será pago).",
    input_schema: {
      type: "object",
      properties: {
        nome: { type: "string" },
        cpf: { type: "string" },
        telefone: { type: "string" },
        cidade: { type: "string" },
        valor_contratado: { type: "number" },
        valor_entrada: { type: "number" },
        observacao_pagamento: { type: "string" },
      },
    },
  },
  {
    name: "finalizar_cadastro_cliente",
    description: "Chame quando o usuário disser para salvar/confirmar o cadastro do cliente em andamento.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "cancelar_cadastro",
    description: "Chame quando o usuário quiser cancelar o cadastro do cliente em andamento.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "registrar_pagamento",
    description: "Registra um pagamento recebido de um cliente já existente.",
    input_schema: {
      type: "object",
      properties: {
        nome_cliente: { type: "string" },
        valor: { type: "number" },
      },
      required: ["nome_cliente", "valor"],
    },
  },
  {
    name: "mover_cliente_kanban",
    description: "Move um cliente para outra etapa do funil comercial.",
    input_schema: {
      type: "object",
      properties: {
        nome_cliente: { type: "string" },
        status_alvo: { type: "string", description: "Nome da etapa/status para onde mover, em linguagem natural." },
      },
      required: ["nome_cliente", "status_alvo"],
    },
  },
  {
    name: "buscar_clientes",
    description:
      "Busca e lista clientes por filtro: inadimplentes, aguardando documentos, aguardando pagamento, ou processos parados há mais de 30 dias.",
    input_schema: {
      type: "object",
      properties: { filtro: { type: "string" } },
      required: ["filtro"],
    },
  },
  {
    name: "abrir_cliente",
    description: "Abre a ficha de um cliente específico pelo nome.",
    input_schema: {
      type: "object",
      properties: { nome_cliente: { type: "string" } },
      required: ["nome_cliente"],
    },
  },
  {
    name: "responder_pergunta_financeira",
    description: "Responde perguntas sobre valores a receber, inadimplência ou outros dados financeiros agregados.",
    input_schema: {
      type: "object",
      properties: { pergunta: { type: "string" } },
      required: ["pergunta"],
    },
  },
  {
    name: "criar_tarefa",
    description: "Cria uma tarefa (e evento na agenda) para um usuário, opcionalmente relacionada a um cliente.",
    input_schema: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        nome_cliente: { type: "string" },
        quando: { type: "string", description: "Expressão temporal em português, ex: 'amanhã às 14 horas'." },
      },
      required: ["titulo", "quando"],
    },
  },
  {
    name: "responder",
    description: "Responde diretamente ao usuário sem executar nenhuma ação (esclarecimentos, saudações, respostas que não se encaixam nas outras ferramentas).",
    input_schema: {
      type: "object",
      properties: { fala: { type: "string" } },
      required: ["fala"],
    },
  },
];

function systemPrompt(contexto: AssistenteContexto) {
  return `Você é o assistente de voz do Lucas Limpa Nome ERP, um sistema de gestão para uma empresa de limpeza de nome (recuperação de crédito). Você age como um funcionário administrativo: entende linguagem natural em português do Brasil, não exige comandos exatos, e SEMPRE responde chamando exatamente uma ferramenta (tool) representando a próxima ação a tomar.

Estado atual da conversa: modo="${contexto.modo}"${
    contexto.modo === "cadastro_cliente"
      ? `, dados já coletados do cliente em cadastro: ${JSON.stringify(contexto.draftCliente ?? {})}`
      : ""
  }.

Se o modo for "cadastro_cliente", o usuário está no meio de um cadastro de cliente passo a passo — cada frase dele tende a informar um novo campo (nome, cpf, telefone, cidade, valor do contrato, valor de entrada, ou como o restante será pago). Chame "atualizar_cadastro_cliente" passando SOMENTE os campos novos mencionados nesta frase. Quando o usuário disser algo como "salvar", "pode salvar" ou "confirmar", chame "finalizar_cadastro_cliente".

Se o usuário disser algo como "cadastrar um novo cliente" e o modo ainda não for "cadastro_cliente", chame "atualizar_cadastro_cliente" sem campos para iniciar o fluxo.

Nunca invente dados que o usuário não disse. Seja direto e natural nas respostas faladas.`;
}

function toClaudeHistory(historico: AssistenteTurno[]): Anthropic.MessageParam[] {
  return historico.slice(-12).map((turno) => ({
    role: turno.papel === "usuario" ? "user" : "assistant",
    content: turno.texto,
  }));
}

export async function processarComLLM(
  texto: string,
  contexto: AssistenteContexto,
  historico: AssistenteTurno[],
  usuarioId: string
): Promise<AssistenteResposta> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt(contexto),
    messages: [...toClaudeHistory(historico), { role: "user", content: texto }],
    tools: TOOLS,
    tool_choice: { type: "any" },
  });

  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) {
    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    return {
      fala: textBlock?.text ?? "Não consegui processar o pedido.",
      contexto,
      ui: { kind: "none" },
      tipoAcao: null,
      executada: false,
    };
  }

  return executarFerramenta(toolUse.name, toolUse.input as Record<string, unknown>, contexto, usuarioId);
}

async function executarFerramenta(
  nome: string,
  input: Record<string, unknown>,
  contexto: AssistenteContexto,
  usuarioId: string
): Promise<AssistenteResposta> {
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const num = (v: unknown) => (typeof v === "number" ? v : undefined);

  switch (nome) {
    case "atualizar_cadastro_cliente": {
      const draft = { ...(contexto.draftCliente ?? {}) };
      if (str(input.nome)) draft.nome = str(input.nome);
      if (str(input.cpf)) draft.cpf = str(input.cpf);
      if (str(input.telefone)) draft.telefone = str(input.telefone);
      if (str(input.cidade)) draft.cidade = str(input.cidade);
      if (num(input.valor_contratado) !== undefined) draft.valorContratado = num(input.valor_contratado);
      if (num(input.valor_entrada) !== undefined) draft.valorEntrada = num(input.valor_entrada);
      if (str(input.observacao_pagamento)) draft.observacaoPagamento = str(input.observacao_pagamento);

      return {
        fala: "Ok, anotado. Pode continuar ou dizer \"salvar\" para concluir.",
        contexto: { modo: "cadastro_cliente", draftCliente: draft },
        ui: { kind: "draft_update" },
        tipoAcao: "CRIAR_CLIENTE",
        executada: false,
      };
    }

    case "finalizar_cadastro_cliente": {
      const draft = contexto.draftCliente ?? {};
      if (!draft.nome) {
        return {
          fala: "Ainda preciso do nome do cliente antes de salvar.",
          contexto,
          ui: { kind: "draft_update" },
          tipoAcao: "CRIAR_CLIENTE",
          executada: false,
        };
      }
      const resumo = [
        draft.nome && { label: "Nome", value: draft.nome },
        draft.cpf && { label: "CPF", value: draft.cpf },
        draft.telefone && { label: "Telefone", value: draft.telefone },
        draft.cidade && { label: "Cidade", value: draft.cidade },
        draft.valorContratado && { label: "Valor do contrato", value: formatCurrency(draft.valorContratado) },
        draft.valorEntrada && { label: "Entrada paga", value: formatCurrency(draft.valorEntrada) },
        draft.observacaoPagamento && { label: "Observação", value: draft.observacaoPagamento },
      ].filter(Boolean) as { label: string; value: string }[];

      return {
        fala: `Confirma o cadastro de ${draft.nome}?`,
        contexto,
        ui: {
          kind: "confirm",
          titulo: "Confirmar cadastro de cliente",
          resumo,
          pendingAction: { type: "criar_cliente", payload: draft },
        },
        tipoAcao: "CRIAR_CLIENTE",
        executada: false,
      };
    }

    case "cancelar_cadastro":
      return {
        fala: "Cadastro cancelado.",
        contexto: { modo: "idle" },
        ui: { kind: "none" },
        tipoAcao: "CANCELADO",
        executada: true,
      };

    case "registrar_pagamento": {
      const nomeConsulta = str(input.nome_cliente) ?? "";
      const valor = num(input.valor);
      if (!nomeConsulta || valor === undefined) {
        return erroGenerico("Preciso do nome do cliente e do valor pago.");
      }
      const candidatos = await buscarClientesCandidatos(nomeConsulta);
      if (candidatos.length === 0) return erroGenerico(`Não encontrei nenhum cliente chamado "${nomeConsulta}".`);
      if (candidatos.length > 1)
        return clarificar(nomeConsulta, candidatos, "REGISTRAR_PAGAMENTO", "registrar_pagamento", { valor });

      const cliente = candidatos[0];
      await registrarPagamentoAssistente(cliente.id, valor);
      return {
        fala: `Pagamento de ${formatCurrency(valor)} registrado para ${cliente.nome}. Saldo, parcelas e timeline foram atualizados.`,
        contexto: { modo: "idle" },
        ui: { kind: "navigate", href: `/crm/${cliente.id}` },
        tipoAcao: "REGISTRAR_PAGAMENTO",
        executada: true,
      };
    }

    case "mover_cliente_kanban": {
      const nomeConsulta = str(input.nome_cliente) ?? "";
      const statusAlvo = str(input.status_alvo) ?? "";
      if (!nomeConsulta || !statusAlvo) return erroGenerico("Preciso do nome do cliente e do status de destino.");

      const candidatos = await buscarClientesCandidatos(nomeConsulta);
      if (candidatos.length === 0) return erroGenerico(`Não encontrei nenhum cliente chamado "${nomeConsulta}".`);
      if (candidatos.length > 1)
        return clarificar(nomeConsulta, candidatos, "MOVER_KANBAN", "mover_kanban", { statusAlvo });

      const cliente = candidatos[0];
      const resultado = await moverClienteKanban(cliente.id, statusAlvo);
      if (!resultado) return erroGenerico(`Não reconheci o status "${statusAlvo}".`);

      return {
        fala: `${cliente.nome} foi movido no kanban comercial para "${statusAlvo}". Timeline atualizada.`,
        contexto: { modo: "idle" },
        ui: { kind: "navigate", href: "/comercial" },
        tipoAcao: "MOVER_KANBAN",
        executada: true,
      };
    }

    case "buscar_clientes": {
      const filtro = str(input.filtro) ?? "";
      const resultado = await buscarClientesPorFiltro(filtro);
      return {
        fala: `${resultado.titulo}: encontrei ${resultado.itens.length} cliente(s).`,
        contexto: { modo: "idle" },
        ui: uiDeResultadoBusca(resultado),
        tipoAcao: "BUSCAR_CLIENTES",
        executada: true,
      };
    }

    case "abrir_cliente": {
      const nomeConsulta = str(input.nome_cliente) ?? "";
      const candidatos = await buscarClientesCandidatos(nomeConsulta);
      if (candidatos.length === 0) return erroGenerico(`Não encontrei nenhum cliente chamado "${nomeConsulta}".`);
      if (candidatos.length > 1) return clarificar(nomeConsulta, candidatos, "ABRIR_CLIENTE", "abrir_cliente");
      return {
        fala: `Abrindo a ficha de ${candidatos[0].nome}.`,
        contexto: { modo: "idle" },
        ui: { kind: "navigate", href: `/crm/${candidatos[0].id}` },
        tipoAcao: "ABRIR_CLIENTE",
        executada: true,
      };
    }

    case "responder_pergunta_financeira": {
      const pergunta = str(input.pergunta) ?? "";
      const resposta = await responderPerguntaFinanceira(pergunta);
      return {
        fala: resposta,
        contexto: { modo: "idle" },
        ui: { kind: "none" },
        tipoAcao: "RESPONDER_PERGUNTA",
        executada: true,
      };
    }

    case "criar_tarefa": {
      const titulo = str(input.titulo) ?? "Tarefa";
      const nomeCliente = str(input.nome_cliente);
      const quandoTexto = str(input.quando) ?? "amanhã às 9 horas";
      const quando = parseDataHoraPtBr(quandoTexto);

      let clienteId: string | null = null;
      if (nomeCliente) {
        const candidatos = await buscarClientesCandidatos(nomeCliente);
        if (candidatos.length === 1) clienteId = candidatos[0].id;
      }

      await criarTarefaAssistente(usuarioId, titulo, clienteId, quando);
      return {
        fala: `Tarefa criada: "${titulo}" para ${formatarQuando(quando)}. Também adicionei na agenda.`,
        contexto: { modo: "idle" },
        ui: { kind: "navigate", href: "/tarefas" },
        tipoAcao: "CRIAR_TAREFA",
        executada: true,
      };
    }

    case "responder":
    default:
      return {
        fala: str(input.fala) ?? "Certo.",
        contexto,
        ui: { kind: "none" },
        tipoAcao: null,
        executada: false,
      };
  }
}

function erroGenerico(fala: string): AssistenteResposta {
  return {
    fala,
    contexto: { modo: "idle" },
    ui: { kind: "none" },
    tipoAcao: "ERRO",
    executada: false,
  };
}

function clarificar(
  nomeConsulta: string,
  candidatos: { id: string; nome: string }[],
  tipoAcao: AssistenteResposta["tipoAcao"],
  acao: ClarifyAcao,
  extra?: { valor?: number; statusAlvo?: string }
): AssistenteResposta {
  return {
    fala: `Encontrei mais de um cliente parecido com "${nomeConsulta}". Qual deles?`,
    contexto: { modo: "idle" },
    ui: { kind: "clarify", acao, opcoes: candidatos.map((c) => ({ label: c.nome, value: c.id })), extra },
    tipoAcao,
    executada: false,
  };
}

export const assistantConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);
