import { prisma } from "@/lib/prisma";

export async function getClientesList() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      responsavel: { select: { id: true, nome: true } },
    },
  });

  return clientes.map((c) => ({
    id: c.id,
    nome: c.nome,
    cpf: c.cpf,
    telefone: c.telefone,
    whatsapp: c.whatsapp,
    email: c.email,
    cidade: c.cidade,
    estado: c.estado,
    origemLead: c.origemLead,
    responsavel: c.responsavel?.nome ?? null,
    dataEntrada: c.dataEntrada,
    statusComercial: c.statusComercial,
    statusJuridico: c.statusJuridico,
    statusFinanceiro: c.statusFinanceiro,
    valorContratado: Number(c.valorContratado),
  }));
}

export type ClienteListItem = Awaited<ReturnType<typeof getClientesList>>[number];

export async function getClientesBasico() {
  return prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}

export async function getUsuariosAtivos() {
  return prisma.usuario.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, papel: true },
  });
}
