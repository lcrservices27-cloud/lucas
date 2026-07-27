"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rm } from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, assertUser, assertAdmin } from "@/lib/auth";
import { clienteSchema } from "@/lib/validators/cliente";
import { logTimeline } from "@/lib/actions/timeline";
import { resolveStoragePath } from "@/lib/storage";
import { calcularStatusCliente } from "@/lib/status-cliente";
import { formatCurrency } from "@/lib/utils";
import { STATUS_COMERCIAL_ORDER, STATUS_COMERCIAL_LABEL } from "@/lib/labels";
import type { StatusComercial } from "@/generated/prisma/enums";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function toNullable(value?: string) {
  return value && value.trim() !== "" ? value.trim() : null;
}

// Guarda só o documento do tipo escolhido — trocar de pessoa física para
// empresa (ou o contrário) limpa o documento antigo.
function documentos(data: { tipoPessoa: "FISICA" | "JURIDICA"; cpf?: string; cnpj?: string }) {
  return data.tipoPessoa === "JURIDICA"
    ? { cpf: null, cnpj: toNullable(data.cnpj) }
    : { cpf: toNullable(data.cpf), cnpj: null };
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

  const total = data.valorContratado ?? 0;
  // O valor pago nunca passa do total contratado.
  const pago = total > 0 ? Math.min(data.valorPago ?? 0, total) : data.valorPago ?? 0;
  const { comercial, financeiro } = calcularStatusCliente(total, pago);

  const cliente = await prisma.cliente.create({
    data: {
      nome: data.nome,
      tipoPessoa: data.tipoPessoa,
      ...documentos(data),
      telefone: toNullable(data.telefone),
      whatsapp: toNullable(data.whatsapp),
      endereco: toNullable(data.endereco),
      // Operação de uma pessoa só: quem cadastra fica como responsável.
      responsavelId: usuario.id,
      produto: data.produto,
      dataEntrada: data.dataEntrada ? new Date(data.dataEntrada) : undefined,
      valorContratado: total,
      formaPagamento: data.formaPagamento,
      numeroParcelas: data.numeroParcelas ?? null,
      statusComercial: comercial,
      statusFinanceiro: financeiro,
    },
  });

  await logTimeline(cliente.id, "CLIENTE_CRIADO", `Cliente ${cliente.nome} cadastrado no sistema`, usuario.id);

  // Registra a entrada como pagamento — já entra no fluxo de caixa.
  if (pago > 0) {
    await prisma.pagamento.create({
      data: {
        clienteId: cliente.id,
        tipo: total > 0 && pago >= total ? "PAGAMENTO_UNICO" : "ENTRADA",
        metodo: "PIX",
        valor: pago,
        registradoPorId: usuario.id,
        observacao: "Entrada registrada no cadastro",
      },
    });
    await logTimeline(
      cliente.id,
      "PAGAMENTO_RECEBIDO",
      `Entrada registrada — ${formatCurrency(pago)}`,
      usuario.id
    );
  }

  revalidatePath("/crm");
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
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
      tipoPessoa: data.tipoPessoa,
      ...documentos(data),
      telefone: toNullable(data.telefone),
      whatsapp: toNullable(data.whatsapp),
      endereco: toNullable(data.endereco),
      produto: data.produto,
      valorContratado: data.valorContratado ?? 0,
      formaPagamento: data.formaPagamento,
      numeroParcelas: data.numeroParcelas ?? null,
    },
  });

  await logTimeline(clienteId, "OUTRO", "Dados cadastrais atualizados", usuario.id);

  revalidatePath(`/crm/${clienteId}`);
  revalidatePath("/crm");
  return {};
}

export async function excluirCliente(clienteId: string): Promise<void> {
  await assertAdmin();

  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { id: true, nome: true },
  });
  if (!cliente) throw new Error("Cliente não encontrado.");

  // A cascata do banco remove parcelas, pagamentos, documentos, observações e
  // timeline; eventos da agenda sobrevivem com clienteId nulo (onDelete: SetNull).
  await prisma.cliente.delete({ where: { id: cliente.id } });

  // Os arquivos enviados vivem fora do banco — limpa a pasta do cliente.
  const dir = resolveStoragePath(cliente.id);
  if (dir) {
    try {
      await rm(dir, { recursive: true, force: true });
    } catch {
      // pasta pode não existir ou o disco ser efêmero (serverless)
    }
  }

  // O cliente aparece em quase todos os módulos (KPIs, kanban, fluxo de caixa,
  // relatórios, carteira dos usuários): invalida o cache do app inteiro.
  revalidatePath("/", "layout");
}

export async function updateStatusComercial(clienteId: string, statusComercial: string) {
  const usuario = await assertUser();
  if (!STATUS_COMERCIAL_ORDER.includes(statusComercial)) {
    throw new Error(`Status comercial inválido: ${statusComercial}`);
  }
  const cliente = await prisma.cliente.update({
    where: { id: clienteId },
    data: { statusComercial: statusComercial as StatusComercial },
  });
  await logTimeline(
    clienteId,
    "STATUS_ALTERADO",
    `Status comercial alterado para "${STATUS_COMERCIAL_LABEL[statusComercial]}"`,
    usuario.id
  );
  revalidatePath("/comercial");
  revalidatePath(`/crm/${clienteId}`);
  return cliente;
}

export async function moveClienteComercial(clienteId: string, statusComercial: string): Promise<void> {
  await updateStatusComercial(clienteId, statusComercial);
}
