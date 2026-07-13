import { NextResponse } from "next/server";
import { assistantConfigured } from "@/lib/assistant/engine";

export async function GET() {
  return NextResponse.json({ configurado: assistantConfigured() });
}
