import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getMonthSummary } from "@/lib/finance";
import { currentMonthKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/summary?month=2026-07
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? currentMonthKey();

  const summary = await getMonthSummary(userId, month);
  return NextResponse.json(summary);
}
