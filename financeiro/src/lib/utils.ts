export const CATEGORIES = [
  "Salário",
  "Renda extra",
  "Alimentação",
  "Contas fixas",
  "Lazer",
  "Transporte",
  "Saúde",
  "Compras",
  "Outros",
] as const;

export const PAYMENT_METHODS = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "debito", label: "Cartão de débito" },
  { value: "credito", label: "Cartão de crédito" },
  { value: "transferencia", label: "Transferência" },
] as const;

export function paymentLabel(value: string): string {
  return PAYMENT_METHODS.find((p) => p.value === value)?.label ?? value;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const MONTH_NAMES_LONG = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Rótulo curto "Jul/26" a partir de uma chave "2026-07". */
export function monthKeyToLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]}/${String(y).slice(2)}`;
}

export function monthKeyToLong(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES_LONG[m - 1]} de ${y}`;
}

/** Chave "2026-07" da data. */
export function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Chave do mês atual. */
export function currentMonthKey(): string {
  return toMonthKey(new Date());
}

/** Primeiro e último instante do mês (chave "2026-07"). */
export function monthRange(key: string): { start: Date; end: Date } {
  const [y, m] = key.split("-").map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

/** Número de dias no mês da chave. */
export function daysInMonth(key: string): number {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/**
 * Dias restantes no mês (contando o dia de hoje) — se a chave for de um mês
 * passado, retorna 0; se for futuro, retorna o total de dias do mês.
 */
export function remainingDaysInMonth(key: string): number {
  const now = new Date();
  const nowKey = currentMonthKey();
  const total = daysInMonth(key);
  if (key < nowKey) return 0;
  if (key > nowKey) return total;
  return total - now.getDate() + 1;
}

export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

/** Data de hoje no formato yyyy-mm-dd (para inputs date). */
export function todayInputValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
