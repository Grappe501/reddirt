import { prisma } from "@/lib/db";
import {
  aggregateSiteTraffic,
  emptySiteTrafficSnapshot,
  type SiteTrafficSnapshot,
  type TrafficWindowDays,
} from "@/lib/analytics/site-traffic-aggregate";

export type {
  CampaignRow,
  CountRow,
  FunnelRow,
  HourRow,
  PageHitRow,
  PriorWindowDelta,
  ReferrerRow,
  SessionPathRow,
  SiteTrafficSnapshot,
  TrafficWindowDays,
  TrendDayRow,
} from "@/lib/analytics/site-traffic-aggregate";
export { pctChange, trafficBriefInput } from "@/lib/analytics/site-traffic-aggregate";

const TRACKED_NAMES = ["page_view", "cta_click", "form_start", "form_complete", "engage"] as const;
const MAX_EVENTS = 12000;

export function parseTrafficWindowDays(raw: string | undefined): TrafficWindowDays {
  if (raw === "1") return 1;
  if (raw === "30") return 30;
  if (raw === "90") return 90;
  return 7;
}

export async function loadSiteTrafficSnapshot(days: TrafficWindowDays = 7): Promise<SiteTrafficSnapshot> {
  try {
    const since = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await prisma.analyticsEvent.findMany({
      where: {
        name: { in: [...TRACKED_NAMES] },
        createdAt: { gte: since },
      },
      select: { name: true, path: true, sessionId: true, createdAt: true, payload: true },
      orderBy: { createdAt: "asc" },
      take: MAX_EVENTS,
    });
    const current = rows.filter((row) => row.createdAt >= cutoff);
    const prior = rows.filter((row) => row.createdAt < cutoff);
    return aggregateSiteTraffic(current, days, {
      priorRows: prior,
      truncated: rows.length >= MAX_EVENTS,
    });
  } catch {
    return emptySiteTrafficSnapshot(days);
  }
}
