import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getReportData } from "@/lib/finance";

export const dynamic = "force-dynamic";

// GET /api/reports?months=6
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const months = Number(searchParams.get("months") ?? 6);

  const data = await getReportData(userId, Number.isFinite(months) ? months : 6);
  return NextResponse.json(data);
}
