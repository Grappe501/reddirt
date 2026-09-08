import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let database = "down";
  let databaseError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "up";
  } catch (error) {
    databaseError = error instanceof Error ? error.name : "DatabaseError";
  }

  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_MARKETLAB_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_MARKETLAB_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );
  const marketProvider = (process.env.MARKETLAB_MARKET_DATA_PROVIDER || "").trim().toLowerCase() || null;
  const marketDataConfigured = Boolean(
    marketProvider === "alpaca" &&
      (process.env.MARKETLAB_ALPACA_API_KEY_ID?.trim() || process.env.MARKETLAB_MARKET_DATA_API_KEY?.trim()) &&
      (process.env.MARKETLAB_ALPACA_API_SECRET_KEY?.trim() || process.env.MARKETLAB_ALPACA_API_SECRET?.trim()),
  );

  const healthy = database === "up" && authConfigured && marketDataConfigured;
  return NextResponse.json(
    {
      service: "marketlab",
      status: healthy ? "ready" : "degraded",
      checks: {
        database,
        authConfigured,
        marketDataConfigured,
        marketProvider,
      },
      diagnostics: databaseError ? { databaseError } : undefined,
      durationMs: Date.now() - startedAt,
    },
    { status: healthy ? 200 : 503 },
  );
}
