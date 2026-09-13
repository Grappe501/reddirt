"use server";

import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { analyzeSiteTraffic, type SiteTrafficCommandBrief } from "@/lib/analytics/site-traffic-ai";
import { loadSiteTrafficSnapshot, parseTrafficWindowDays } from "@/lib/analytics/site-traffic";
import { buildSiteTrafficIntelligence, type SiteTrafficIntelligence } from "@/lib/analytics/site-traffic-intelligence";
import type { SiteTrafficSnapshot, TrafficWindowDays } from "@/lib/analytics/site-traffic-aggregate";

export type SiteAnalyticsActionState = {
  summary?: string;
  moves?: string[];
  command?: SiteTrafficCommandBrief;
  cached?: boolean;
  generatedAt?: string;
  mode?: string;
  error?: string;
};

export type SiteTrafficDeskPayload = {
  snapshot: SiteTrafficSnapshot;
  intel: SiteTrafficIntelligence;
  readError: string | null;
  newestEventAt: string | null;
  fetchedAt: string;
};

export async function refreshSiteTrafficDeskAction(days: TrafficWindowDays): Promise<SiteTrafficDeskPayload> {
  await requireAdminAction();
  const loaded = await loadSiteTrafficSnapshot(days);
  return {
    snapshot: loaded.snapshot,
    intel: buildSiteTrafficIntelligence(loaded.snapshot),
    readError: loaded.readError,
    newestEventAt: loaded.newestEventAt,
    fetchedAt: new Date().toISOString(),
  };
}

export async function analyzeSiteTrafficAction(
  _prev: SiteAnalyticsActionState,
  formData: FormData,
): Promise<SiteAnalyticsActionState> {
  await requireAdminAction();
  const days = parseTrafficWindowDays(String(formData.get("days") ?? "7"));
  const refresh = formData.get("refresh") === "1";
  const loaded = await loadSiteTrafficSnapshot(days);
  const brief = await analyzeSiteTraffic(loaded.snapshot, {
    refresh,
    mode: String(formData.get("mode") ?? "command"),
  });
  if (!brief.ok) return { error: brief.error };
  return {
    summary: brief.summary,
    moves: brief.moves,
    command: brief.command,
    cached: brief.cached,
    generatedAt: brief.generatedAt,
    mode: brief.mode,
  };
}
