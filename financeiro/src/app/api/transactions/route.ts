import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { monthRange } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/transactions?month=2026-07&category=Lazer&type=saida
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = { userId };
  if (month) {
    const { start, end } = monthRange(month);
    where.date = { gte: start, lte: end };
  }
  if (category && category !== "todas") where.category = category;
  if (type && (type === "entrada" || type === "saida")) where.type = type;

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ transactions });
}

// POST /api/transactions
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body: {
    type?: string;
    amount?: number | string;
    category?: string;
    description?: string;
    paymentMethod?: string;
    date?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const type = body.type === "entrada" ? "entrada" : "saida";
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }
  const category = (body.category ?? "Outros").toString();
  const paymentMethod = (body.paymentMethod ?? "pix").toString();
  const description = (body.description ?? "").toString();
  const date = body.date ? new Date(body.date) : new Date();
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: { userId, type, amount, category, description, paymentMethod, date },
  });

  return NextResponse.json({ transaction }, { status: 201 });
}
