import { NextResponse } from "next/server";
import { processCommsCampaignBatch } from "@/lib/comms/campaign-processor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Poll for `QUEUED` / `SENDING` broadcast campaigns and process a batch per run.
 * `GET /api/cron/comms-broadcasts?key=...`
 */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  const secret = process.env.COMMS_BROADCAST_CRON_SECRET?.trim();
  if (!secret || key !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const r = await processCommsCampaignBatch();
  return NextResponse.json({
    ok: true,
    processed: r.processed,
    campaigns: r.campaigns,
    recovery: r.recovery,
  });
}
