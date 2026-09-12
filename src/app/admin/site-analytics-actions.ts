"use server";

import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { analyzeSiteTraffic } from "@/lib/analytics/site-traffic-ai";
import { loadSiteTrafficSnapshot, type TrafficWindowDays } from "@/lib/analytics/site-traffic";

export type SiteAnalyticsActionState = {
  summary?: string;
  moves?: string[];
  error?: string;
};

export async function analyzeSiteTrafficAction(
  _prev: SiteAnalyticsActionState,
  formData: FormData,
): Promise<SiteAnalyticsActionState> {
  await requireAdminAction();
  const rawDays = Number(formData.get("days") ?? 7);
  const days: TrafficWindowDays = rawDays === 30 ? 30 : 7;
  const snapshot = await loadSiteTrafficSnapshot(days);
  const brief = await analyzeSiteTraffic(snapshot);
  if (!brief.ok) return { error: brief.error };
  return { summary: brief.summary, moves: brief.moves };
}
