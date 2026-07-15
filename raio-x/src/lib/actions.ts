"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cpfValido } from "@/lib/utils";
import { calcularIndice, statusDoIndice, type Respostas } from "@/lib/diagnostico";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo.").max(120),
  cpf: z.string().refine((v) => cpfValido(v), "CPF inválido."),
  objetivo: z.enum(["EMPRESTIMO", "FINANCIAMENTO", "CARTAO", "LIMPAR_NOME", "OUTRO"]),
  recusado: z.enum(["SIM", "NAO", "NUNCA"]),
  dividas: z.enum(["SIM", "NAO", "NAO_SEI"]),
  negativado: z.enum(["SIM", "NAO", "NAO_SEI"]),
  faixaScore: z.enum(["ATE_300", "DE_301_500", "DE_501_700", "ACIMA_700", "NAO_SEI"]),
  consentimento: z.literal(true),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(180).optional(),
  referrer: z.string().max(300).optional(),
});

export type CriarDiagnosticoResultado =
  | { ok: true; id: string }
  | { ok: false; erro: string };

export async function criarDiagnostico(
  input: z.input<typeof schema>
): Promise<CriarDiagnosticoResultado> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const d = parsed.data;
  const respostas: Respostas = {
    objetivo: d.objetivo,
    recusado: d.recusado,
    dividas: d.dividas,
    negativado: d.negativado,
    faixaScore: d.faixaScore,
  };

  const indice = calcularIndice(respostas);
  const status = statusDoIndice(indice);

  const diagnostico = await prisma.diagnostico.create({
    data: {
      nome: d.nome,
      cpf: d.cpf.replace(/\D/g, ""),
      objetivo: d.objetivo,
      recusado: d.recusado,
      dividas: d.dividas,
      negativado: d.negativado,
      faixaScore: d.faixaScore,
      indice,
      status,
      utmSource: d.utmSource || null,
      utmMedium: d.utmMedium || null,
      utmCampaign: d.utmCampaign || null,
      referrer: d.referrer || null,
    },
    select: { id: true },
  });

  return { ok: true, id: diagnostico.id };
}
