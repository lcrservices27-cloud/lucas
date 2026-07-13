import "server-only";
import { prisma } from "@/lib/prisma";
import type { TipoEventoTimeline } from "@/generated/prisma/enums";

export async function logTimeline(
  clienteId: string,
  tipo: TipoEventoTimeline,
  descricao: string,
  usuarioId?: string | null
) {
  await prisma.timelineEntrada.create({
    data: { clienteId, tipo, descricao, usuarioId: usuarioId ?? undefined },
  });
}
