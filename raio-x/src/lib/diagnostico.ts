// Definição das perguntas do funil e o cálculo do Índice de Saúde Financeira.
// Regra de negócio importante: o índice é uma ESTIMATIVA baseada nas respostas
// do próprio usuário — nunca uma consulta real a bureaus. A UI comunica isso
// com honestidade. Nada aqui promete aprovação de crédito ou aumento de score.

export type Objetivo = "EMPRESTIMO" | "FINANCIAMENTO" | "CARTAO" | "LIMPAR_NOME" | "OUTRO";
export type RespostaRecusado = "SIM" | "NAO" | "NUNCA";
export type RespostaTriplo = "SIM" | "NAO" | "NAO_SEI";
export type FaixaScore = "ATE_300" | "DE_301_500" | "DE_501_700" | "ACIMA_700" | "NAO_SEI";
export type StatusIndice = "ATENCAO" | "MODERADO" | "SAUDAVEL";

export type Respostas = {
  objetivo: Objetivo;
  recusado: RespostaRecusado;
  dividas: RespostaTriplo;
  negativado: RespostaTriplo;
  faixaScore: FaixaScore;
};

export type Opcao<T extends string> = { valor: T; label: string };

export const OBJETIVOS: Opcao<Objetivo>[] = [
  { valor: "EMPRESTIMO", label: "Empréstimo" },
  { valor: "FINANCIAMENTO", label: "Financiamento" },
  { valor: "CARTAO", label: "Cartão de Crédito" },
  { valor: "LIMPAR_NOME", label: "Limpar Nome" },
  { valor: "OUTRO", label: "Outro" },
];

export const OPCOES_RECUSADO: Opcao<RespostaRecusado>[] = [
  { valor: "SIM", label: "Sim" },
  { valor: "NAO", label: "Não" },
  { valor: "NUNCA", label: "Nunca solicitei" },
];

export const OPCOES_TRIPLO: Opcao<RespostaTriplo>[] = [
  { valor: "SIM", label: "Sim" },
  { valor: "NAO", label: "Não" },
  { valor: "NAO_SEI", label: "Não sei" },
];

export const OPCOES_FAIXA_SCORE: Opcao<FaixaScore>[] = [
  { valor: "ATE_300", label: "Até 300" },
  { valor: "DE_301_500", label: "301 a 500" },
  { valor: "DE_501_700", label: "501 a 700" },
  { valor: "ACIMA_700", label: "Acima de 700" },
  { valor: "NAO_SEI", label: "Não sei" },
];

// Pontuação: parte de 100 e subtrai por fatores de risco declarados.
export function calcularIndice(r: Respostas): number {
  let indice = 100;

  switch (r.negativado) {
    case "SIM":
      indice -= 32;
      break;
    case "NAO_SEI":
      indice -= 14;
      break;
  }

  switch (r.dividas) {
    case "SIM":
      indice -= 16;
      break;
    case "NAO_SEI":
      indice -= 8;
      break;
  }

  switch (r.recusado) {
    case "SIM":
      indice -= 16;
      break;
    case "NUNCA":
      indice -= 4;
      break;
  }

  switch (r.faixaScore) {
    case "ATE_300":
      indice -= 26;
      break;
    case "DE_301_500":
      indice -= 14;
      break;
    case "DE_501_700":
      indice -= 4;
      break;
    case "ACIMA_700":
      indice += 4;
      break;
    case "NAO_SEI":
      indice -= 10;
      break;
  }

  if (r.objetivo === "LIMPAR_NOME") indice -= 6;

  // Nunca mostra 0 ou 100 — mantém a análise crível e sempre com margem.
  return Math.max(8, Math.min(96, Math.round(indice)));
}

export function statusDoIndice(indice: number): StatusIndice {
  if (indice < 50) return "ATENCAO";
  if (indice < 75) return "MODERADO";
  return "SAUDAVEL";
}

export const STATUS_META: Record<
  StatusIndice,
  { rotulo: string; cor: string; corHex: string; descricao: string; insights: string[] }
> = {
  ATENCAO: {
    rotulo: "ATENÇÃO",
    cor: "text-rose-600",
    corHex: "#e11d48",
    descricao: "Seu perfil apresenta fatores que merecem atenção antes de solicitar crédito.",
    insights: [
      "Possível dificuldade de aprovação nas condições atuais.",
      "Seu histórico financeiro merece atenção.",
      "Recomendamos uma análise detalhada antes de solicitar crédito.",
    ],
  },
  MODERADO: {
    rotulo: "MODERADO",
    cor: "text-amber-500",
    corHex: "#f59e0b",
    descricao: "Seu perfil está intermediário — há pontos que podem ser ajustados.",
    insights: [
      "Aprovação possível, porém sujeita a condições menos favoráveis.",
      "Alguns fatores podem estar limitando suas oportunidades.",
      "Uma análise completa ajuda a identificar o que ajustar.",
    ],
  },
  SAUDAVEL: {
    rotulo: "SAUDÁVEL",
    cor: "text-emerald-600",
    corHex: "#059669",
    descricao: "Seu perfil aparenta boa saúde financeira com base nas suas respostas.",
    insights: [
      "Perfil com boa aparência para análises de crédito.",
      "Ainda assim, detalhes do seu histórico podem passar despercebidos.",
      "A análise completa confirma o que os bancos realmente enxergam.",
    ],
  },
};

// Cards da área bloqueada (premium). Ficam genuinamente bloqueados —
// não exibimos dados bancários (isso seria falso). O bloqueio é a isca.
export const CARDS_BLOQUEADOS = [
  { titulo: "Histórico SCR", descricao: "Operações de crédito registradas no seu CPF." },
  { titulo: "Relacionamento Bancário", descricao: "Como as instituições enxergam seu vínculo." },
  { titulo: "Operações Registradas", descricao: "Contratos e valores em aberto no sistema." },
  { titulo: "Risco Bancário", descricao: "Classificação de risco usada em análises." },
  { titulo: "Pendências Financeiras", descricao: "Sinalizações que impactam sua aprovação." },
  { titulo: "Recomendações Personalizadas", descricao: "Próximos passos com base no seu perfil." },
] as const;
