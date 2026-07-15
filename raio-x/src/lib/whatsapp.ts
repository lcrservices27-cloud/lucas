import { mascararCpf } from "@/lib/utils";

const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? "5585999999999";

export function linkWhatsappConsulta(params: {
  id: string;
  nome: string;
  cpf: string;
  indice: number;
}): string {
  const texto =
    `Olá! Fiz o Raio-X do Crédito e quero a Consulta Completa SCR/Basen.\n\n` +
    `Nome: ${params.nome}\n` +
    `CPF: ${mascararCpf(params.cpf)}\n` +
    `Índice: ${params.indice}/100\n` +
    `Protocolo: ${params.id}`;
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`;
}
