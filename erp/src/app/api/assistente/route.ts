import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { processarTurno } from "@/lib/assistant/engine";
import type { AssistenteContexto, AssistenteTurno } from "@/lib/assistant/types";

export async function POST(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  const contexto: AssistenteContexto = body?.contexto ?? { modo: "idle" };
  const historico: AssistenteTurno[] = Array.isArray(body?.historico) ? body.historico : [];

  if (!texto) {
    return NextResponse.json({ error: "Texto vazio." }, { status: 400 });
  }

  try {
    const resposta = await processarTurno(texto, contexto, historico, usuario.id);
    return NextResponse.json(resposta);
  } catch (err) {
    console.error("Erro no assistente de voz:", err);
    return NextResponse.json(
      {
        fala: "Ocorreu um erro ao processar o comando. Tente novamente.",
        contexto: { modo: "idle" },
        ui: { kind: "none" },
        tipoAcao: "ERRO",
        executada: false,
      },
      { status: 200 }
    );
  }
}
