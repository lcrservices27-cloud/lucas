import { prisma } from "@/lib/prisma";

export async function getUsuarios() {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { criadoEm: "asc" },
    include: {
      _count: { select: { clientesResponsavel: true } },
    },
  });
  return usuarios;
}

export type UsuarioItem = Awaited<ReturnType<typeof getUsuarios>>[number];
