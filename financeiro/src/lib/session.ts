import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Retorna o id do usuário autenticado, ou null.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  return id ?? null;
}
