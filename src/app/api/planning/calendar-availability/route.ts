import { NextResponse } from "next/server";
import { events } from "@/content/events";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import {
  computePlanningAvailability,
  movementAndPublicToPlanningEvents,
  planningDateParamRegex,
} from "@/lib/planning/campaign-calendar-planning";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Live public calendar + movement events: open vs busy on a date, plus day-before / day-after travel context.
 * Default “home” when empty: Rose Bud, Arkansas.
 */
export async function GET(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`planning-cal:${ip}`, 40, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs }, { status: 429 });
  }

  const date = new URL(request.url).searchParams.get("date")?.trim() ?? "";
  if (!planningDateParamRegex.test(date)) {
    return NextResponse.json(
      { ok: false, error: "validation", message: "Query `date` must be YYYY-MM-DD (Central planning context)." },
      { status: 400 },
    );
  }

  const publicRows = await queryPublicCampaignEvents({ range: "all_upcoming" }, { take: 400 });
  const planningEvents = movementAndPublicToPlanningEvents(events, publicRows);
  const payload = computePlanningAvailability(date, planningEvents);

  return NextResponse.json({ ok: true, ...payload });
}
