import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resolverClarificacao } from "@/lib/assistant/engine";
import type { ClarifyAcao } from "@/lib/assistant/types";

export async function POST(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const acao = body?.acao as ClarifyAcao | undefined;
  const clienteId = typeof body?.clienteId === "string" ? body.clienteId : undefined;
  const extra = body?.extra as { valor?: number; statusAlvo?: string } | undefined;

  if (!acao || !clienteId) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  try {
    const resultado = await resolverClarificacao(acao, clienteId, usuario.id, extra);
    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Erro ao resolver clarificação do assistente:", err);
    return NextResponse.json({ error: "Não foi possível concluir a ação." }, { status: 500 });
  }
}
