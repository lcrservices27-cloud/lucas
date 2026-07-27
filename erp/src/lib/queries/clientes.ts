import { prisma } from "@/lib/prisma";

export async function getClientesList() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { criadoEm: "desc" },
  });

  return clientes.map((c) => ({
    id: c.id,
    nome: c.nome,
    tipoPessoa: c.tipoPessoa,
    cpf: c.cpf,
    cnpj: c.cnpj,
    telefone: c.telefone,
    whatsapp: c.whatsapp,
    produto: c.produto,
    dataEntrada: c.dataEntrada,
    statusComercial: c.statusComercial,
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
