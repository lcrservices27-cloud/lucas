import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getHistoricoAssistente } from "@/lib/assistant/engine";

export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const historico = await getHistoricoAssistente();
  return NextResponse.json({ historico });
}
