import { NextResponse } from "next/server";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { resolveStoragePath } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".txt": "text/plain; charset=utf-8",
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await getCurrentUser();
  if (!usuario) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const doc = await prisma.documento.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
  }

  const abs = resolveStoragePath(doc.url);
  if (!abs) {
    return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
  }

  let tamanho: number;
  try {
    tamanho = (await stat(abs)).size;
  } catch {
    return NextResponse.json({ error: "Arquivo não está mais disponível." }, { status: 404 });
  }

  const ext = path.extname(doc.nomeArquivo).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  // filename* (RFC 5987) preserva acentos; o fallback ASCII cobre clientes antigos.
  const asciiName = doc.nomeArquivo.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "'");

  const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(tamanho),
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(doc.nomeArquivo)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
