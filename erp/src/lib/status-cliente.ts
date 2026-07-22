import type { StatusComercial, StatusFinanceiro } from "@/generated/prisma/enums";

// Regra única de status a partir do total contratado e do total pago:
// - quitou tudo (pago >= total)      -> Venda Fechada / Pago
// - pagou parte (0 < pago < total)   -> Aguardando Pix / Pagamento Parcial
// - nada pago ainda                  -> Entrada Recebida / Não iniciado
// Uma parcela atrasada empurra o financeiro para ATRASADO (mas não o comercial).
export function calcularStatusCliente(
  total: number,
  pago: number,
  temParcelaAtrasada = false,
): { comercial: StatusComercial; financeiro: StatusFinanceiro } {
  if (total > 0 && pago >= total) {
    return { comercial: "VENDA_FECHADA", financeiro: "PAGO" };
  }
  if (pago > 0) {
    return {
      comercial: "AGUARDANDO_PIX",
      financeiro: temParcelaAtrasada ? "ATRASADO" : "PAGAMENTO_PARCIAL",
    };
  }
  return {
    comercial: "ENTRADA_RECEBIDA",
    financeiro: temParcelaAtrasada ? "ATRASADO" : "NAO_INICIADO",
  };
}
