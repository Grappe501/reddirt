import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runIncrementalIngestForSource, registerOrRenewWatchForSource } from "@/lib/calendar/google-sync-engine";

export const dynamic = "force-dynamic";

function baseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") || "http://localhost:3000";
}

/**
 * Call from cron: `GET /api/calendar/google/cron-sync?key=...`
 * - incrementally ingests all active `CalendarSource` rows with `syncEnabled`
 * - renews webhooks that expire in &lt; 48h
 */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!process.env.CALENDAR_CRON_SECRET || key !== process.env.CALENDAR_CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const sources = await prisma.calendarSource.findMany({ where: { isActive: true, syncEnabled: true } });
  const out: string[] = [];
  const soon = new Date(Date.now() + 48 * 3600 * 1000);
  for (const s of sources) {
    try {
      const r = await runIncrementalIngestForSource(s.id);
      out.push(`${s.id}: ${r.mode} ${r.items ?? 0}`);
    } catch (e) {
      out.push(`${s.id}: err ${e instanceof Error ? e.message : String(e)}`);
    }
    const w = await prisma.calendarWatchChannel.findFirst({ where: { calendarSourceId: s.id } });
    if (!w || w.expiration < soon) {
      try {
        await registerOrRenewWatchForSource(s, baseUrl());
        out.push(`${s.id}: watch renewed`);
      } catch (e) {
        out.push(`${s.id}: watch err ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  return NextResponse.json({ ok: true, log: out });
}
