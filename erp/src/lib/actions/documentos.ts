"use server";

import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logTimeline } from "@/lib/actions/timeline";
import { TIPO_DOCUMENTO_LABEL } from "@/lib/labels";
import type { TipoDocumento } from "@/generated/prisma/enums";

export type UploadDocumentoState = { error?: string };

export async function uploadDocumento(
  _prevState: UploadDocumentoState,
  formData: FormData
): Promise<UploadDocumentoState> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: "Não autenticado." };

  const clienteId = String(formData.get("clienteId") ?? "");
  const tipo = String(formData.get("tipo") ?? "OUTRO") as TipoDocumento;
  const file = formData.get("arquivo") as File | null;

  if (!clienteId || !file || file.size === 0) {
    return { error: "Selecione um arquivo." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const dir = path.join(process.cwd(), "public", "uploads", clienteId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), bytes);

  await prisma.documento.create({
    data: {
      clienteId,
      tipo,
      nomeArquivo: file.name,
      url: `/uploads/${clienteId}/${safeName}`,
      tamanho: file.size,
      enviadoPorId: usuario.id,
    },
  });

  await logTimeline(clienteId, "DOCUMENTO_ENVIADO", `Documento enviado (${TIPO_DOCUMENTO_LABEL[tipo] ?? tipo})`, usuario.id);

  revalidatePath(`/crm/${clienteId}`);
  return {};
}

export async function excluirDocumento(documentoId: string, clienteId: string) {
  const doc = await prisma.documento.findUnique({ where: { id: documentoId } });
  if (!doc) return;

  await prisma.documento.delete({ where: { id: documentoId } });

  try {
    await unlink(path.join(process.cwd(), "public", doc.url.replace(/^\//, "")));
  } catch {
    // arquivo já pode ter sido removido
  }

  revalidatePath(`/crm/${clienteId}`);
}
