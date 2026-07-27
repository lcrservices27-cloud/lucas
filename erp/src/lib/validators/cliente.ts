import { z } from "zod";

const digitos = (v?: string) => (v ?? "").replace(/\D/g, "");

export const clienteSchema = z
  .object({
    tipoPessoa: z.enum(["FISICA", "JURIDICA"]).default("FISICA"),
    nome: z.string().trim().min(2, "Informe o nome completo"),
    cpf: z.string().trim().optional().or(z.literal("")),
    cnpj: z.string().trim().optional().or(z.literal("")),
    produto: z.enum(["RATING_COMERCIAL", "LIMPA_NOME"], { message: "Selecione o produto contratado" }),
    telefone: z.string().trim().optional().or(z.literal("")),
    whatsapp: z.string().trim().optional().or(z.literal("")),
    endereco: z.string().trim().optional().or(z.literal("")),
    valorContratado: z.coerce.number().min(0, "Informe o valor total"),
    valorPago: z.coerce.number().min(0).optional().default(0),
    formaPagamento: z.enum(["A_VISTA", "ENTRADA_MAIS_PARCELAS", "PARCELADO"], {
      message: "Selecione a forma de pagamento",
    }),
    numeroParcelas: z.coerce.number().int().min(1).max(60).optional(),
    dataEntrada: z.string().trim().optional().or(z.literal("")),
  })
  // Pessoa física exige CPF; empresa exige CNPJ. O documento do outro tipo é ignorado.
  .superRefine((valores, ctx) => {
    if (valores.tipoPessoa === "JURIDICA") {
      if (digitos(valores.cnpj).length !== 14) {
        ctx.addIssue({ code: "custom", path: ["cnpj"], message: "Informe o CNPJ (14 dígitos)" });
      }
      return;
    }
    if (digitos(valores.cpf).length !== 11) {
      ctx.addIssue({ code: "custom", path: ["cpf"], message: "Informe o CPF (11 dígitos)" });
    }
  });

export type ClienteFormValues = z.infer<typeof clienteSchema>;
