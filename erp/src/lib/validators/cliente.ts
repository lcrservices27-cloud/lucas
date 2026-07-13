import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome completo"),
  cpf: z.string().trim().optional().or(z.literal("")),
  rg: z.string().trim().optional().or(z.literal("")),
  telefone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  cidade: z.string().trim().optional().or(z.literal("")),
  estado: z.string().trim().max(2).optional().or(z.literal("")),
  endereco: z.string().trim().optional().or(z.literal("")),
  origemLead: z.string().trim().optional().or(z.literal("")),
  responsavelId: z.string().trim().optional().or(z.literal("")),
  valorContratado: z.coerce.number().min(0).optional(),
  formaPagamento: z.enum(["A_VISTA", "ENTRADA_MAIS_PARCELAS", "PARCELADO"]).optional().or(z.literal("")),
  numeroParcelas: z.coerce.number().int().min(1).max(60).optional(),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;

export const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
