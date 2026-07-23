import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/goal
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const goal = await prisma.savingsGoal.findFirst({
    where: { userId, active: true },
  });
  return NextResponse.json({ goal });
}

// PUT /api/goal  { monthlyTarget, totalTarget?, months? }
export async function PUT(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body: { monthlyTarget?: number | string; totalTarget?: number | string; months?: number | string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const monthlyTarget = Number(body.monthlyTarget);
  if (!Number.isFinite(monthlyTarget) || monthlyTarget < 0) {
    return NextResponse.json({ error: "Meta inválida" }, { status: 400 });
  }
  const totalTarget = body.totalTarget != null ? Number(body.totalTarget) : null;
  const months = body.months != null ? Number(body.months) : null;

  const existing = await prisma.savingsGoal.findFirst({
    where: { userId, active: true },
  });

  const goal = existing
    ? await prisma.savingsGoal.update({
        where: { id: existing.id },
        data: {
          monthlyTarget,
          totalTarget: totalTarget ?? existing.totalTarget,
          months: months ?? existing.months,
        },
      })
    : await prisma.savingsGoal.create({
        data: { userId, monthlyTarget, totalTarget, months, active: true },
      });

  return NextResponse.json({ goal });
}
