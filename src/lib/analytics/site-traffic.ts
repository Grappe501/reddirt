import { prisma } from "@/lib/db";
import {
  aggregateSiteTraffic,
  emptySiteTrafficSnapshot,
  type SiteTrafficSnapshot,
  type TrafficWindowDays,
} from "@/lib/analytics/site-traffic-aggregate";

export type {
  CampaignRow,
  PageHitRow,
  ReferrerRow,
  SessionPathRow,
  SiteTrafficSnapshot,
  TrafficWindowDays,
} from "@/lib/analytics/site-traffic-aggregate";
export { trafficBriefInput } from "@/lib/analytics/site-traffic-aggregate";

export async function loadSiteTrafficSnapshot(days: TrafficWindowDays = 7): Promise<SiteTrafficSnapshot> {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await prisma.analyticsEvent.findMany({
      where: {
        name: "page_view",
        createdAt: { gte: since },
      },
      select: { path: true, sessionId: true, createdAt: true, payload: true },
      orderBy: { createdAt: "asc" },
      take: 8000,
    });
    return aggregateSiteTraffic(rows, days);
  } catch {
    return emptySiteTrafficSnapshot(days);
  }
}
