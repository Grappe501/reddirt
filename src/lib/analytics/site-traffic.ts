import { prisma } from "@/lib/db";
import {
  aggregateSiteTraffic,
  emptySiteTrafficSnapshot,
  type SiteTrafficSnapshot,
  type TrafficWindowDays,
} from "@/lib/analytics/site-traffic-aggregate";

export type {
  CampaignRow,
  ChannelRow,
  ConversionPathRow,
  CountRow,
  DepthRow,
  FunnelRow,
  HourRow,
  PageHitRow,
  PageIntelRow,
  PriorWindowDelta,
  ReferrerRow,
  SeoDesk,
  SessionPathRow,
  SiteTrafficSnapshot,
  SourceLandingRow,
  TrafficWindowDays,
  TransitionRow,
  TrendDayRow,
  UtmRow,
  VisitorJourney,
} from "@/lib/analytics/site-traffic-aggregate";
export { pctChange, trafficBriefInput } from "@/lib/analytics/site-traffic-aggregate";

const TRACKED_NAMES = ["page_view", "cta_click", "form_start", "form_complete", "engage"] as const;
const MAX_EVENTS = 12000;

export function parseTrafficWindowDays(raw: string | undefined): TrafficWindowDays {
  if (raw === "7") return 7;
  if (raw === "30") return 30;
  if (raw === "90") return 90;
  return 1;
}

export type SiteTrafficLoad = {
  snapshot: SiteTrafficSnapshot;
  readError: string | null;
  newestEventAt: string | null;
};

export async function loadSiteTrafficSnapshot(days: TrafficWindowDays = 7): Promise<SiteTrafficLoad> {
  try {
    const since = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [rows, newest] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: {
          name: { in: [...TRACKED_NAMES] },
          createdAt: { gte: since },
        },
        select: { name: true, path: true, sessionId: true, createdAt: true, payload: true },
        orderBy: { createdAt: "asc" },
        take: MAX_EVENTS,
      }),
      prisma.analyticsEvent.findFirst({
        where: { name: { in: [...TRACKED_NAMES] } },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);
    const current = rows.filter((row) => row.createdAt >= cutoff);
    const prior = rows.filter((row) => row.createdAt < cutoff);
    return {
      snapshot: aggregateSiteTraffic(current, days, {
        priorRows: prior,
        truncated: rows.length >= MAX_EVENTS,
      }),
      readError: null,
      newestEventAt: newest?.createdAt.toISOString() ?? null,
    };
  } catch {
    return {
      snapshot: emptySiteTrafficSnapshot(days),
      readError: "The visitor desk could not read AnalyticsEvent from this site's database.",
      newestEventAt: null,
    };
  }
}
