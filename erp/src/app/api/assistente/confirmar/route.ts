import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { confirmarAcaoPendente } from "@/lib/assistant/engine";
import type { PendingAction } from "@/lib/assistant/types";

export async function POST(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const pendingAction = body?.pendingAction as PendingAction | undefined;

  if (!pendingAction) {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  try {
    const resultado = await confirmarAcaoPendente(pendingAction, usuario.id);
    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Erro ao confirmar ação do assistente:", err);
    return NextResponse.json({ error: "Não foi possível concluir a ação." }, { status: 500 });
  }
}
