import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// DELETE /api/transactions/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const tx = await prisma.transaction.findUnique({ where: { id: params.id } });
  if (!tx || tx.userId !== userId) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
