import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/fixed-expenses
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const fixedExpenses = await prisma.fixedExpense.findMany({
    where: { userId },
    orderBy: { amount: "desc" },
  });
  return NextResponse.json({ fixedExpenses });
}

// POST /api/fixed-expenses  { name, amount }
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body: { name?: string; amount?: number | string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const name = (body.name ?? "").toString().trim();
  const amount = Number(body.amount);
  if (!name || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const fixedExpense = await prisma.fixedExpense.create({
    data: { userId, name, amount, active: true },
  });
  return NextResponse.json({ fixedExpense }, { status: 201 });
}
