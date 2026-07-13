"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { clienteSchema } from "@/lib/validators/cliente";
import { logTimeline } from "@/lib/actions/timeline";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function toNullable(value?: string) {
  return value && value.trim() !== "" ? value.trim() : null;
}

export async function createCliente(_prevState: FormState, formData: FormData): Promise<FormState> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: "Não autenticado." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const cliente = await prisma.cliente.create({
    data: {
      nome: data.nome,
      cpf: toNullable(data.cpf),
      rg: toNullable(data.rg),
      telefone: toNullable(data.telefone),
      whatsapp: toNullable(data.whatsapp),
      email: toNullable(data.email),
      cidade: toNullable(data.cidade),
      estado: toNullable(data.estado),
      endereco: toNullable(data.endereco),
      origemLead: toNullable(data.origemLead),
      responsavelId: toNullable(data.responsavelId),
      valorContratado: data.valorContratado ?? 0,
      formaPagamento: data.formaPagamento || null,
      numeroParcelas: data.numeroParcelas ?? null,
    },
  });

  await logTimeline(cliente.id, "CLIENTE_CRIADO", `Cliente ${cliente.nome} cadastrado no sistema`, usuario.id);

  revalidatePath("/crm");
  redirect(`/crm/${cliente.id}`);
}

export async function updateCliente(clienteId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: "Não autenticado." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  await prisma.cliente.update({
    where: { id: clienteId },
    data: {
      nome: data.nome,
      cpf: toNullable(data.cpf),
      rg: toNullable(data.rg),
      telefone: toNullable(data.telefone),
      whatsapp: toNullable(data.whatsapp),
      email: toNullable(data.email),
      cidade: toNullable(data.cidade),
      estado: toNullable(data.estado),
      endereco: toNullable(data.endereco),
      origemLead: toNullable(data.origemLead),
      responsavelId: toNullable(data.responsavelId),
      valorContratado: data.valorContratado ?? 0,
      formaPagamento: data.formaPagamento || null,
      numeroParcelas: data.numeroParcelas ?? null,
    },
  });

  await logTimeline(clienteId, "OUTRO", "Dados cadastrais atualizados", usuario.id);

  revalidatePath(`/crm/${clienteId}`);
  revalidatePath("/crm");
  return {};
}

export async function updateStatusComercial(clienteId: string, statusComercial: string) {
  const usuario = await getCurrentUser();
  const cliente = await prisma.cliente.update({
    where: { id: clienteId },
    data: { statusComercial: statusComercial as never },
  });
  await logTimeline(
    clienteId,
    "STATUS_ALTERADO",
    `Status comercial alterado para "${statusComercial}"`,
    usuario?.id
  );
  revalidatePath("/comercial");
  revalidatePath(`/crm/${clienteId}`);
  return cliente;
}

export async function updateStatusJuridico(clienteId: string, statusJuridico: string) {
  const usuario = await getCurrentUser();
  const cliente = await prisma.cliente.update({
    where: { id: clienteId },
    data: { statusJuridico: statusJuridico as never },
  });
  await logTimeline(
    clienteId,
    "STATUS_ALTERADO",
    `Status jurídico alterado para "${statusJuridico}"`,
    usuario?.id
  );
  revalidatePath("/juridico");
  revalidatePath(`/crm/${clienteId}`);
  return cliente;
}

export async function moveClienteComercial(clienteId: string, statusComercial: string): Promise<void> {
  await updateStatusComercial(clienteId, statusComercial);
}

export async function moveClienteJuridico(clienteId: string, statusJuridico: string): Promise<void> {
  await updateStatusJuridico(clienteId, statusJuridico);
}
