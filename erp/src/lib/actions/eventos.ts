"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, assertUser } from "@/lib/auth";

export type EventoState = { error?: string };

export async function createEvento(_prevState: EventoState, formData: FormData): Promise<EventoState> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: "Não autenticado." };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "COMPROMISSO");
  const data = String(formData.get("data") ?? "");
  const hora = String(formData.get("hora") ?? "09:00");
  const clienteId = String(formData.get("clienteId") ?? "") || null;
  const responsavelId = String(formData.get("responsavelId") ?? "") || usuario.id;
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!titulo || !data) return { error: "Informe título e data." };

  const inicio = new Date(`${data}T${hora}:00`);

  await prisma.evento.create({
    data: {
      titulo,
      tipo: tipo as never,
      inicio,
      clienteId,
      responsavelId,
      observacao,
    },
  });

  revalidatePath("/agenda");
  return {};
}

export async function toggleEventoConcluido(id: string, concluido: boolean) {
  await assertUser();
  await prisma.evento.update({ where: { id }, data: { concluido } });
  revalidatePath("/agenda");
}
