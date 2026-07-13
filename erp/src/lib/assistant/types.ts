export type AssistenteDraftCliente = {
  nome?: string;
  cpf?: string;
  telefone?: string;
  cidade?: string;
  valorContratado?: number;
  valorEntrada?: number;
  observacaoPagamento?: string;
};

export type AssistenteContexto = {
  modo: "idle" | "cadastro_cliente";
  draftCliente?: AssistenteDraftCliente;
};

export type ResumoItem = { label: string; value: string };

export type PendingAction =
  | { type: "criar_cliente"; payload: AssistenteDraftCliente }
  | {
      type: "registrar_pagamento";
      payload: { clienteId: string; clienteNome: string; valor: number };
    };

export type ListaItem = { label: string; sublabel?: string; href: string };

export type ClarifyAcao = "registrar_pagamento" | "mover_kanban" | "abrir_cliente";

export type AssistenteUiAction =
  | { kind: "draft_update" }
  | { kind: "confirm"; titulo: string; resumo: ResumoItem[]; pendingAction: PendingAction }
  | { kind: "navigate"; href: string }
  | { kind: "list"; titulo: string; itens: ListaItem[] }
  | {
      kind: "clarify";
      acao: ClarifyAcao;
      opcoes: { label: string; value: string }[];
      extra?: { valor?: number; statusAlvo?: string };
    }
  | { kind: "none" };

export type TipoAcao =
  | "CRIAR_CLIENTE"
  | "REGISTRAR_PAGAMENTO"
  | "MOVER_KANBAN"
  | "BUSCAR_CLIENTES"
  | "ABRIR_CLIENTE"
  | "RESPONDER_PERGUNTA"
  | "CRIAR_TAREFA"
  | "RELATORIO"
  | "CANCELADO"
  | "ERRO";

export type AssistenteResposta = {
  fala: string;
  contexto: AssistenteContexto;
  ui: AssistenteUiAction;
  tipoAcao: TipoAcao | null;
  executada: boolean;
};

export type AssistenteTurno = { papel: "usuario" | "assistente"; texto: string };
