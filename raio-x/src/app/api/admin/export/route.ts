import { NextResponse } from "next/server";
import { adminAutenticado } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { formatarCpf, formatarData } from "@/lib/utils";

function csvEscape(valor: string): string {
  if (/[",;\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`;
  return valor;
}

export async function GET() {
  if (!(await adminAutenticado())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const registros = await prisma.diagnostico.findMany({ orderBy: { criadoEm: "desc" } });

  const cabecalho = [
    "id",
    "nome",
    "cpf",
    "objetivo",
    "recusado",
    "dividas",
    "negativado",
    "faixa_score",
    "indice",
    "status",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "converteu",
    "criado_em",
  ];

  const linhas = registros.map((d) =>
    [
      d.id,
      d.nome,
      formatarCpf(d.cpf),
      d.objetivo,
      d.recusado,
      d.dividas,
      d.negativado,
      d.faixaScore,
      String(d.indice),
      d.status,
      d.utmSource ?? "",
      d.utmMedium ?? "",
      d.utmCampaign ?? "",
      d.converteu ? "sim" : "nao",
      formatarData(d.criadoEm),
    ]
      .map((c) => csvEscape(String(c)))
      .join(";")
  );

  // BOM para o Excel abrir com acentuação correta
  const csv = "﻿" + [cabecalho.join(";"), ...linhas].join("\n");
  const nome = `raio-x-diagnosticos-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
