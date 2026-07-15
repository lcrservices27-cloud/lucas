import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getAdminDashboard() {
  const agora = new Date();
  const inicio14 = startOfDay(subDays(agora, 13));
  const inicioHoje = startOfDay(agora);

  const [total, conversoes, hoje, porStatus, porOrigem, recentes14] = await Promise.all([
    prisma.diagnostico.count(),
    prisma.diagnostico.count({ where: { converteu: true } }),
    prisma.diagnostico.count({ where: { criadoEm: { gte: inicioHoje } } }),
    prisma.diagnostico.groupBy({ by: ["status"], _count: true }),
    prisma.diagnostico.groupBy({
      by: ["utmSource"],
      _count: true,
      orderBy: { _count: { utmSource: "desc" } },
    }),
    prisma.diagnostico.findMany({
      where: { criadoEm: { gte: inicio14 } },
      select: { criadoEm: true, converteu: true },
    }),
  ]);

  const taxaConversao = total > 0 ? (conversoes / total) * 100 : 0;

  // Série dos últimos 14 dias
  const dias = Array.from({ length: 14 }).map((_, i) => startOfDay(subDays(agora, 13 - i)));
  const serie = dias.map((dia) => {
    const doDia = recentes14.filter((r) => startOfDay(r.criadoEm).getTime() === dia.getTime());
    return {
      label: format(dia, "dd/MM", { locale: ptBR }),
      diagnosticos: doDia.length,
      conversoes: doDia.filter((r) => r.converteu).length,
    };
  });

  const origem = porOrigem.map((o) => ({
    fonte: o.utmSource ?? "Direto / sem UTM",
    total: o._count,
  }));

  const statusMap = Object.fromEntries(porStatus.map((s) => [s.status, s._count])) as Record<string, number>;

  return {
    total,
    conversoes,
    hoje,
    taxaConversao,
    serie,
    origem,
    statusMap,
  };
}

export async function buscarPorCpf(cpf: string) {
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length < 3) return [];
  return prisma.diagnostico.findMany({
    where: { cpf: { contains: digitos } },
    orderBy: { criadoEm: "desc" },
    take: 50,
  });
}

export async function ultimosDiagnosticos(take = 20) {
  return prisma.diagnostico.findMany({
    orderBy: { criadoEm: "desc" },
    take,
  });
}
