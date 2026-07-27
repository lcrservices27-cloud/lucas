import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function somenteDigitos(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

export function formatCpf(cpf?: string | null) {
  const d = somenteDigitos(cpf);
  if (d.length !== 11) return cpf ?? null;
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCnpj(cnpj?: string | null) {
  const d = somenteDigitos(cnpj);
  if (d.length !== 14) return cnpj ?? null;
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

// Documento do cliente já rotulado: "CPF 000.000.000-00" ou "CNPJ 00.000.000/0000-00".
export function documentoCliente(cliente: {
  tipoPessoa: string;
  cpf?: string | null;
  cnpj?: string | null;
}) {
  if (cliente.tipoPessoa === "JURIDICA") {
    return cliente.cnpj ? `CNPJ ${formatCnpj(cliente.cnpj)}` : "CNPJ não informado";
  }
  return cliente.cpf ? `CPF ${formatCpf(cliente.cpf)}` : "CPF não informado";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
