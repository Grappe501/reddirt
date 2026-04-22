import { NextResponse } from "next/server";
import { runFestivalCoverageAiPlanner } from "@/lib/festivals/ai-weekend-planner";

export const dynamic = "force-dynamic";

/**
 * Rebuilds the AI weekend coverage snapshot (statewide candidate vs volunteer routing).
 * `GET /api/cron/festivals-coverage?key=...`
 */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  const secret =
    process.env.FESTIVAL_INGEST_CRON_SECRET?.trim() || process.env.CALENDAR_CRON_SECRET?.trim() || "";
  if (!secret || key !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const r = await runFestivalCoverageAiPlanner();
  return NextResponse.json(r);
}
