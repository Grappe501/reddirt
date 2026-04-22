import { NextResponse } from "next/server";
import { runFestivalIngestPipeline } from "@/lib/festivals/ingest/pipeline";

export const dynamic = "force-dynamic";

/**
 * Ingest community fairs/festivals from registered sources.
 * `GET /api/cron/festivals-ingest?key=...`
 * Set `FESTIVAL_INGEST_CRON_SECRET` (or fall back to `CALENDAR_CRON_SECRET`).
 */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  const secret =
    process.env.FESTIVAL_INGEST_CRON_SECRET?.trim() || process.env.CALENDAR_CRON_SECRET?.trim() || "";
  if (!secret || key !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const result = await runFestivalIngestPipeline({ label: "cron" });
  return NextResponse.json({ ok: !result.error, ...result });
}
