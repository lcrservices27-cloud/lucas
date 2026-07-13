import { prisma } from "@/lib/prisma";
import { subDays, addDays } from "date-fns";

export async function getEventos() {
  const now = new Date();
  const eventos = await prisma.evento.findMany({
    where: { inicio: { gte: subDays(now, 60), lte: addDays(now, 180) } },
    orderBy: { inicio: "asc" },
    include: {
      cliente: { select: { id: true, nome: true } },
      responsavel: { select: { id: true, nome: true } },
    },
  });
  return eventos;
}

export type EventoItem = Awaited<ReturnType<typeof getEventos>>[number];
