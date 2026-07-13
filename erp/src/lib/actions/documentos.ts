"use server";

import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth";
import { logTimeline } from "@/lib/actions/timeline";
import { STORAGE_ROOT, resolveStoragePath } from "@/lib/storage";
import { TIPO_DOCUMENTO_LABEL } from "@/lib/labels";
import type { TipoDocumento } from "@/generated/prisma/enums";

export type UploadDocumentoState = { error?: string };

const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10 MB
const EXTENSOES_PERMITIDAS = new Set([
  ".pdf", ".png", ".jpg", ".jpeg", ".webp", ".gif",
  ".doc", ".docx", ".xls", ".xlsx", ".txt", ".zip",
]);

const TIPOS_VALIDOS = new Set(Object.keys(TIPO_DOCUMENTO_LABEL));

export async function uploadDocumento(
  _prevState: UploadDocumentoState,
  formData: FormData
): Promise<UploadDocumentoState> {
  const usuario = await assertUser();

  const clienteId = String(formData.get("clienteId") ?? "");
  const tipoBruto = String(formData.get("tipo") ?? "OUTRO");
  const tipo = (TIPOS_VALIDOS.has(tipoBruto) ? tipoBruto : "OUTRO") as TipoDocumento;
  const file = formData.get("arquivo") as File | null;

  if (!clienteId || !file || file.size === 0) {
    return { error: "Selecione um arquivo." };
  }

  if (file.size > TAMANHO_MAXIMO_BYTES) {
    return { error: "Arquivo muito grande. O limite é 10 MB." };
  }

  const extensao = path.extname(file.name).toLowerCase();
  if (!EXTENSOES_PERMITIDAS.has(extensao)) {
    return { error: `Tipo de arquivo não permitido (${extensao || "sem extensão"}).` };
  }

  // Valida que o cliente existe — isso também impede path traversal via
  // clienteId, já que só um cuid real do banco chega ao caminho do arquivo.
  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId }, select: { id: true } });
  if (!cliente) {
    return { error: "Cliente não encontrado." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const dir = path.join(STORAGE_ROOT, cliente.id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), bytes);

  await prisma.documento.create({
    data: {
      clienteId: cliente.id,
      tipo,
      nomeArquivo: file.name,
      url: `${cliente.id}/${safeName}`, // chave de storage relativa a STORAGE_ROOT
      tamanho: file.size,
      enviadoPorId: usuario.id,
    },
  });

  await logTimeline(cliente.id, "DOCUMENTO_ENVIADO", `Documento enviado (${TIPO_DOCUMENTO_LABEL[tipo] ?? tipo})`, usuario.id);

  revalidatePath(`/crm/${cliente.id}`);
  return {};
}

export async function excluirDocumento(documentoId: string, clienteId: string) {
  const usuario = await assertUser();

  const doc = await prisma.documento.findUnique({ where: { id: documentoId } });
  if (!doc || doc.clienteId !== clienteId) return;

  await prisma.documento.delete({ where: { id: documentoId } });
  await logTimeline(clienteId, "OUTRO", `Documento excluído: ${doc.nomeArquivo}`, usuario.id);

  const abs = resolveStoragePath(doc.url);
  if (abs) {
    try {
      await unlink(abs);
    } catch {
      // arquivo já pode ter sido removido
    }
  }

  revalidatePath(`/crm/${clienteId}`);
}
