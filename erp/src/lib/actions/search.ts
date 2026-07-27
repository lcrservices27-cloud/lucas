"use server";

import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth";

export type SearchResult = {
  id: string;
  nome: string;
  cpf: string | null;
  cnpj: string | null;
  telefone: string | null;
};

export async function searchClientes(query: string): Promise<SearchResult[]> {
  await assertUser();

  const q = query.trim();
  if (q.length < 2) return [];

  const clientes = await prisma.cliente.findMany({
    where: {
      OR: [
        { nome: { contains: q, mode: "insensitive" } },
        { cpf: { contains: q } },
        { cnpj: { contains: q } },
        { telefone: { contains: q } },
        { whatsapp: { contains: q } },
      ],
    },
    select: { id: true, nome: true, cpf: true, cnpj: true, telefone: true },
    take: 8,
    orderBy: { nome: "asc" },
  });

  return clientes;
}
