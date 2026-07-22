import "server-only";
import { normalizar, extrairNumero, extrairDigitos } from "@/lib/assistant/normalize";
import {
  buscarClientesCandidatos,
  buscarClientesPorFiltro,
  responderPerguntaFinanceira,
  moverClienteKanban,
  registrarPagamentoAssistente,
  uiDeResultadoBusca,
} from "@/lib/assistant/tools";
import { formatCurrency } from "@/lib/utils";
import type { AssistenteContexto, AssistenteDraftCliente, AssistenteResposta } from "@/lib/assistant/types";

function capitalizarNome(nome: string) {
  return nome
    .split(" ")
    .map((p) => (p.length > 2 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function extrairApos(textoLower: string, palavraChave: RegExp): string | null {
  const match = textoLower.match(palavraChave);
  if (!match || !match[1]) return null;
  return match[1].trim().replace(/[.?!]+$/, "");
}

function resumoDraft(draft: AssistenteDraftCliente) {
  const resumo: { label: string; value: string }[] = [];
  if (draft.nome) resumo.push({ label: "Nome", value: draft.nome });
  if (draft.cpf) resumo.push({ label: "CPF", value: draft.cpf });
  if (draft.telefone) resumo.push({ label: "Telefone", value: draft.telefone });
  if (draft.cidade) resumo.push({ label: "Cidade", value: draft.cidade });
  if (draft.valorContratado) resumo.push({ label: "Valor do contrato", value: formatCurrency(draft.valorContratado) });
  if (draft.valorEntrada) resumo.push({ label: "Entrada paga", value: formatCurrency(draft.valorEntrada) });
  if (draft.observacaoPagamento) resumo.push({ label: "Observação", value: draft.observacaoPagamento });
  return resumo;
}

export async function processarHeuristica(
  textoOriginal: string,
  contexto: AssistenteContexto,
  _usuarioId: string
): Promise<AssistenteResposta> {
  const textoLower = textoOriginal.toLowerCase().trim();
  const t = normalizar(textoOriginal);

  const iniciandoCadastro = (t.includes("cadastrar") || t.includes("cadastro")) && t.includes("cliente");

  if (iniciandoCadastro) {
    return {
      fala: "Certo, vamos cadastrar um novo cliente. Pode me dizer o nome?",
      contexto: { modo: "cadastro_cliente", draftCliente: {} },
      ui: { kind: "draft_update" },
      tipoAcao: "CRIAR_CLIENTE",
      executada: false,
    };
  }

  if (contexto.modo === "cadastro_cliente") {
    const draft: AssistenteDraftCliente = { ...contexto.draftCliente };

    if (t.includes("cancelar")) {
      return {
        fala: "Cadastro cancelado.",
        contexto: { modo: "idle" },
        ui: { kind: "none" },
        tipoAcao: "CANCELADO",
        executada: true,
      };
    }

    if (t.includes("salvar") || t.includes("confirmar") || (t.includes("pode") && t.includes("salvar"))) {
      if (!draft.nome) {
        return {
          fala: "Ainda preciso do nome do cliente antes de salvar.",
          contexto: { modo: "cadastro_cliente", draftCliente: draft },
          ui: { kind: "draft_update" },
          tipoAcao: "CRIAR_CLIENTE",
          executada: false,
        };
      }
      return {
        fala: `Confirma o cadastro de ${draft.nome}?`,
        contexto: { modo: "cadastro_cliente", draftCliente: draft },
        ui: {
          kind: "confirm",
          titulo: "Confirmar cadastro de cliente",
          resumo: resumoDraft(draft),
          pendingAction: { type: "criar_cliente", payload: draft },
        },
        tipoAcao: "CRIAR_CLIENTE",
        executada: false,
      };
    }

    let algoAtualizado = false;

    if (t.includes("entrada")) {
      const valor = extrairNumero(textoOriginal);
      if (valor !== null) {
        draft.valorEntrada = valor;
        algoAtualizado = true;
      }
    } else if (t.includes("valor") || (t.includes("contrato") && /\d/.test(textoOriginal))) {
      const valor = extrairNumero(textoOriginal);
      if (valor !== null) {
        draft.valorContratado = valor;
        algoAtualizado = true;
      }
    }

    if (t.includes("restante") || t.includes("resto")) {
      draft.observacaoPagamento = textoOriginal.replace(/[.?!]+$/, "");
      algoAtualizado = true;
    }

    if (t.includes("nome") && !t.includes("restante")) {
      const nome = extrairApos(textoLower, /nome\s*(?:e|é)?\s*(.+)/i);
      if (nome) {
        draft.nome = capitalizarNome(nome);
        algoAtualizado = true;
      }
    }

    if (t.includes("telefone") || t.includes("whatsapp") || t.includes("celular")) {
      const digitos = extrairDigitos(textoOriginal);
      if (digitos) {
        draft.telefone = digitos;
        algoAtualizado = true;
      }
    }

    if (t.includes("cpf")) {
      const digitos = extrairDigitos(textoOriginal);
      if (digitos) {
        draft.cpf = digitos;
        algoAtualizado = true;
      }
    }

    if (t.includes("cidade")) {
      const cidade = extrairApos(textoLower, /cidade\s*(?:e|é)?\s*(.+)/i);
      if (cidade) {
        draft.cidade = capitalizarNome(cidade);
        algoAtualizado = true;
      }
    }

    if (algoAtualizado) {
      return {
        fala: "Ok, anotado. Pode continuar ou dizer \"salvar\" para concluir.",
        contexto: { modo: "cadastro_cliente", draftCliente: draft },
        ui: { kind: "draft_update" },
        tipoAcao: "CRIAR_CLIENTE",
        executada: false,
      };
    }

    return {
      fala: "Não entendi. Pode repetir ou dizer \"salvar\" para concluir o cadastro?",
      contexto: { modo: "cadastro_cliente", draftCliente: draft },
      ui: { kind: "draft_update" },
      tipoAcao: null,
      executada: false,
    };
  }

  const pagamentoMatch = textoLower.match(/^(.*?)\s+pagou\s+(?:mais\s+)?(.+)/i);
  if (pagamentoMatch) {
    const nomeConsulta = pagamentoMatch[1].replace(/^registrar pagamento\.?\s*/i, "").trim();
    const valor = extrairNumero(pagamentoMatch[2]);
    if (nomeConsulta && valor !== null) {
      const candidatos = await buscarClientesCandidatos(nomeConsulta);
      if (candidatos.length === 0) {
        return {
          fala: `Não encontrei nenhum cliente chamado "${nomeConsulta}".`,
          contexto: { modo: "idle" },
          ui: { kind: "none" },
          tipoAcao: "ERRO",
          executada: false,
        };
      }
      if (candidatos.length > 1) {
        return {
          fala: `Encontrei mais de um cliente parecido com "${nomeConsulta}". Qual deles?`,
          contexto: { modo: "idle" },
          ui: {
            kind: "clarify",
            acao: "registrar_pagamento",
            opcoes: candidatos.map((c) => ({ label: c.nome, value: c.id })),
            extra: { valor },
          },
          tipoAcao: "REGISTRAR_PAGAMENTO",
          executada: false,
        };
      }
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
  }

  const moverMatch = textoLower.match(/mover\s+(.+?)\s+para\s+(.+)/i);
  if (moverMatch) {
    const nomeConsulta = moverMatch[1].trim();
    const statusAlvo = moverMatch[2].replace(/[.?!]+$/, "").trim();
    const candidatos = await buscarClientesCandidatos(nomeConsulta);
    if (candidatos.length === 0) {
      return {
        fala: `Não encontrei nenhum cliente chamado "${nomeConsulta}".`,
        contexto: { modo: "idle" },
        ui: { kind: "none" },
        tipoAcao: "ERRO",
        executada: false,
      };
    }
    if (candidatos.length > 1) {
      return {
        fala: `Encontrei mais de um cliente parecido com "${nomeConsulta}". Qual deles?`,
        contexto: { modo: "idle" },
        ui: {
          kind: "clarify",
          acao: "mover_kanban",
          opcoes: candidatos.map((c) => ({ label: c.nome, value: c.id })),
          extra: { statusAlvo },
        },
        tipoAcao: "MOVER_KANBAN",
        executada: false,
      };
    }
    const cliente = candidatos[0];
    const resultado = await moverClienteKanban(cliente.id, statusAlvo);
    if (!resultado) {
      return {
        fala: `Não reconheci o status "${statusAlvo}".`,
        contexto: { modo: "idle" },
        ui: { kind: "none" },
        tipoAcao: "ERRO",
        executada: false,
      };
    }
    return {
      fala: `${cliente.nome} foi movido no kanban comercial para "${statusAlvo}". Timeline atualizada.`,
      contexto: { modo: "idle" },
      ui: { kind: "navigate", href: "/comercial" },
      tipoAcao: "MOVER_KANBAN",
      executada: true,
    };
  }

  const pesquisarMatch = textoLower.match(/(?:pesquisar|buscar|abrir)\s+cliente\s+(.+)/i);
  if (pesquisarMatch) {
    const nomeConsulta = pesquisarMatch[1].replace(/[.?!]+$/, "").trim();
    const candidatos = await buscarClientesCandidatos(nomeConsulta);
    if (candidatos.length === 0) {
      return {
        fala: `Não encontrei nenhum cliente chamado "${nomeConsulta}".`,
        contexto: { modo: "idle" },
        ui: { kind: "none" },
        tipoAcao: "ERRO",
        executada: false,
      };
    }
    if (candidatos.length > 1) {
      return {
        fala: `Encontrei ${candidatos.length} clientes parecidos com "${nomeConsulta}". Qual deles?`,
        contexto: { modo: "idle" },
        ui: { kind: "clarify", acao: "abrir_cliente", opcoes: candidatos.map((c) => ({ label: c.nome, value: c.id })) },
        tipoAcao: "ABRIR_CLIENTE",
        executada: false,
      };
    }
    return {
      fala: `Abrindo a ficha de ${candidatos[0].nome}.`,
      contexto: { modo: "idle" },
      ui: { kind: "navigate", href: `/crm/${candidatos[0].id}` },
      tipoAcao: "ABRIR_CLIENTE",
      executada: true,
    };
  }

  if ((t.includes("mostrar") || t.includes("mostre") || t.includes("liste") || t.includes("listar")) && (t.includes("cliente") || t.includes("processo"))) {
    const resultado = await buscarClientesPorFiltro(t);
    return {
      fala: `${resultado.titulo}: encontrei ${resultado.itens.length} cliente(s).`,
      contexto: { modo: "idle" },
      ui: uiDeResultadoBusca(resultado),
      tipoAcao: "BUSCAR_CLIENTES",
      executada: true,
    };
  }

  if (t.includes("quanto") || t.includes("quantos") || t.includes("qual") || t.includes("quais")) {
    if (t.includes("cliente") && (t.includes("aguardando") || t.includes("documento") || t.includes("inadimplente"))) {
      const resultado = await buscarClientesPorFiltro(t);
      return {
        fala: `${resultado.titulo}: encontrei ${resultado.itens.length} cliente(s).`,
        contexto: { modo: "idle" },
        ui: uiDeResultadoBusca(resultado),
        tipoAcao: "BUSCAR_CLIENTES",
        executada: true,
      };
    }
    const resposta = await responderPerguntaFinanceira(t);
    return {
      fala: resposta,
      contexto: { modo: "idle" },
      ui: { kind: "none" },
      tipoAcao: "RESPONDER_PERGUNTA",
      executada: true,
    };
  }

  if (t.includes("processo") && (t.includes("parado") || t.includes("30 dia"))) {
    const resultado = await buscarClientesPorFiltro(t);
    return {
      fala: `${resultado.titulo}: encontrei ${resultado.itens.length} processo(s).`,
      contexto: { modo: "idle" },
      ui: uiDeResultadoBusca(resultado),
      tipoAcao: "RELATORIO",
      executada: true,
    };
  }

  if (t.includes("registrar pagamento") || (t.includes("registrar") && t.includes("pagamento"))) {
    return {
      fala: "Certo, quem pagou e quanto? Por exemplo: \"João Silva pagou mais 300 reais\".",
      contexto: { modo: "idle" },
      ui: { kind: "none" },
      tipoAcao: null,
      executada: false,
    };
  }

  return {
    fala: "Desculpe, não entendi o comando. Você pode dizer, por exemplo: \"cadastrar um novo cliente\", \"mover João para processo protocolado\" ou \"mostrar clientes inadimplentes\".",
    contexto: { modo: "idle" },
    ui: { kind: "none" },
    tipoAcao: null,
    executada: false,
  };
}
