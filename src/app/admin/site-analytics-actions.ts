"use server";

import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { analyzeSiteTraffic, type SiteTrafficCommandBrief } from "@/lib/analytics/site-traffic-ai";
import { loadSiteTrafficSnapshot, parseTrafficWindowDays } from "@/lib/analytics/site-traffic";

export type SiteAnalyticsActionState = {
  summary?: string;
  moves?: string[];
  command?: SiteTrafficCommandBrief;
  cached?: boolean;
  generatedAt?: string;
  error?: string;
};

export async function analyzeSiteTrafficAction(
  _prev: SiteAnalyticsActionState,
  formData: FormData,
): Promise<SiteAnalyticsActionState> {
  await requireAdminAction();
  const days = parseTrafficWindowDays(String(formData.get("days") ?? "7"));
  const refresh = formData.get("refresh") === "1";
  const snapshot = await loadSiteTrafficSnapshot(days);
  const brief = await analyzeSiteTraffic(snapshot, { refresh });
  if (!brief.ok) return { error: brief.error };
  return {
    summary: brief.summary,
    moves: brief.moves,
    command: brief.command,
    cached: brief.cached,
    generatedAt: brief.generatedAt,
  };
}
