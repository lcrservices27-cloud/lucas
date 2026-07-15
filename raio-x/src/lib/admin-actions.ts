"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  criarSessaoAdmin,
  destruirSessaoAdmin,
  exigirAdmin,
} from "@/lib/admin-session";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export type LoginState = { erro?: string };

export async function loginAdmin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const senha = String(formData.get("senha") ?? "");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000)) {
    return { erro: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const esperada = process.env.ADMIN_SENHA;
  if (!esperada) return { erro: "ADMIN_SENHA não configurada no servidor." };
  if (senha !== esperada) return { erro: "Senha incorreta." };

  await criarSessaoAdmin();
  redirect("/admin");
}

export async function logoutAdmin() {
  await destruirSessaoAdmin();
  redirect("/admin/login");
}

export async function marcarConversao(id: string, converteu: boolean) {
  await exigirAdmin();
  await prisma.diagnostico.update({
    where: { id },
    data: { converteu, convertidoEm: converteu ? new Date() : null },
  });
  revalidatePath("/admin");
}
