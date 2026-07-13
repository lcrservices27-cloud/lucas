"use server";

import { prisma } from "@/lib/prisma";

export type SearchResult = {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  cidade: string | null;
};

export async function searchClientes(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const clientes = await prisma.cliente.findMany({
    where: {
      OR: [
        { nome: { contains: q, mode: "insensitive" } },
        { cpf: { contains: q } },
        { telefone: { contains: q } },
        { whatsapp: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
        { cidade: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, nome: true, cpf: true, telefone: true, cidade: true },
    take: 8,
    orderBy: { nome: "asc" },
  });

  return clientes;
}
