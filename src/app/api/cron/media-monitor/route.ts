import { NextResponse } from "next/server";
import { runExternalMediaIngest } from "@/lib/media-monitor/run-ingest";

export const dynamic = "force-dynamic";

/**
 * Weekly / scheduled press monitor ingest.
 * `GET /api/cron/media-monitor?key=...`
 * Secrets: `MEDIA_MONITOR_CRON_SECRET` or fallback `CALENDAR_CRON_SECRET`.
 */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  const secret =
    process.env.MEDIA_MONITOR_CRON_SECRET?.trim() || process.env.CALENDAR_CRON_SECRET?.trim() || "";
  if (!secret || key !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const verticalSliceOnly = new URL(request.url).searchParams.get("full") !== "1";
  const incremental = new URL(request.url).searchParams.get("incremental") === "1";
  const dryRun = new URL(request.url).searchParams.get("dry") === "1";
  const useOpenAi = process.env.MEDIA_MONITOR_USE_OPENAI === "1";

  const result = await runExternalMediaIngest({
    label: "cron",
    dryRun,
    verticalSliceOnly,
    incremental,
    useOpenAiRefine: useOpenAi,
  });

  return NextResponse.json({ ok: !result.error, ...result });
}
