export const STATUS_COMERCIAL_LABEL: Record<string, string> = {
  NOVO_LEAD: "Novo Lead",
  PRIMEIRO_CONTATO: "Primeiro Contato",
  NEGOCIACAO: "Negociação",
  AGUARDANDO_PIX: "Aguardando PIX",
  ENTRADA_RECEBIDA: "Entrada Recebida",
  VENDA_FECHADA: "Venda Fechada",
  CANCELADO: "Cancelado",
};

export const STATUS_COMERCIAL_ORDER = [
  "NOVO_LEAD",
  "PRIMEIRO_CONTATO",
  "NEGOCIACAO",
  "AGUARDANDO_PIX",
  "ENTRADA_RECEBIDA",
  "VENDA_FECHADA",
  "CANCELADO",
];

export const STATUS_JURIDICO_LABEL: Record<string, string> = {
  AGUARDANDO_DOCUMENTOS: "Aguardando documentos",
  DOCUMENTOS_RECEBIDOS: "Documentos recebidos",
  AGUARDANDO_ENVIO: "Aguardando envio",
  ENVIADO_AO_PARCEIRO: "Enviado ao parceiro",
  EM_ANALISE: "Em análise",
  PROCESSO_PROTOCOLADO: "Processo protocolado",
  AGUARDANDO_DECISAO: "Aguardando decisão",
  CONCLUIDO: "Concluído",
  AGUARDANDO_PAGAMENTO_FINAL: "Aguardando pagamento final",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

export const STATUS_JURIDICO_ORDER = [
  "AGUARDANDO_DOCUMENTOS",
  "DOCUMENTOS_RECEBIDOS",
  "AGUARDANDO_ENVIO",
  "ENVIADO_AO_PARCEIRO",
  "EM_ANALISE",
  "PROCESSO_PROTOCOLADO",
  "AGUARDANDO_DECISAO",
  "CONCLUIDO",
  "AGUARDANDO_PAGAMENTO_FINAL",
  "FINALIZADO",
  "CANCELADO",
];

export const STATUS_FINANCEIRO_LABEL: Record<string, string> = {
  NAO_INICIADO: "Não iniciado",
  ENTRADA_PAGA: "Entrada paga",
  PAGAMENTO_PARCIAL: "Pagamento parcial",
  PAGO: "Pago",
  ATRASADO: "Atrasado",
  CANCELADO: "Cancelado",
};

export const STATUS_FINANCEIRO_ORDER = [
  "NAO_INICIADO",
  "ENTRADA_PAGA",
  "PAGAMENTO_PARCIAL",
  "PAGO",
  "ATRASADO",
  "CANCELADO",
];

export const STATUS_FINANCEIRO_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  NAO_INICIADO: "outline",
  ENTRADA_PAGA: "secondary",
  PAGAMENTO_PARCIAL: "warning",
  PAGO: "success",
  ATRASADO: "destructive",
  CANCELADO: "outline",
};

export const STATUS_PARCELA_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
  ATRASADA: "Atrasada",
  CANCELADA: "Cancelada",
};

export const STATUS_PARCELA_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  PENDENTE: "outline",
  PAGA: "success",
  ATRASADA: "destructive",
  CANCELADA: "secondary",
};

export const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
  A_VISTA: "À vista",
  ENTRADA_MAIS_PARCELAS: "Entrada + parcelas",
  PARCELADO: "Parcelado",
};

export const METODO_PAGAMENTO_LABEL: Record<string, string> = {
  PIX: "PIX",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
  BOLETO: "Boleto",
  TRANSFERENCIA: "Transferência",
};

export const TIPO_PAGAMENTO_LABEL: Record<string, string> = {
  ENTRADA: "Entrada",
  PARCELA: "Parcela",
  PAGAMENTO_UNICO: "Pagamento único",
  PAGAMENTO_FINAL: "Pagamento final",
};

export const TIPO_DOCUMENTO_LABEL: Record<string, string> = {
  CPF: "CPF",
  RG: "RG",
  CNH: "CNH",
  CONTRATO: "Contrato",
  COMPROVANTE_PIX: "Comprovante PIX",
  PDF: "PDF",
  IMAGEM: "Imagem",
  OUTRO: "Outro",
};

export const PRIORIDADE_TAREFA_LABEL: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
};

export const PRIORIDADE_TAREFA_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  BAIXA: "secondary",
  MEDIA: "warning",
  ALTA: "destructive",
};

export const TIPO_EVENTO_LABEL: Record<string, string> = {
  LIGACAO: "Ligação",
  COBRANCA: "Cobrança",
  RETORNO: "Retorno",
  DOCUMENTACAO: "Documentação",
  COMPROMISSO: "Compromisso",
};

export const TIPO_TIMELINE_LABEL: Record<string, string> = {
  CLIENTE_CRIADO: "Cliente criado",
  STATUS_ALTERADO: "Status alterado",
  PAGAMENTO_RECEBIDO: "Pagamento recebido",
  DOCUMENTO_ENVIADO: "Documento enviado",
  OBSERVACAO_CRIADA: "Observação criada",
  TAREFA_CRIADA: "Tarefa criada",
  TAREFA_CONCLUIDA: "Tarefa concluída",
  LOGIN_REALIZADO: "Login realizado",
  OUTRO: "Outro",
};

export const PAPEL_USUARIO_LABEL: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  FINANCEIRO: "Financeiro",
  ATENDIMENTO: "Atendimento",
  CONSULTOR: "Consultor",
  JURIDICO: "Jurídico",
};
