/**
 * Victory OS Sprint 5 — match calendar tactics to county missions and decisions.
 */

import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { loadTravelCalendarItems, filterCalendarItemsInWindow } from "@/lib/calendar/load-travel-calendar-data";
import { weekStartDateFromKey, endOfWeekExclusive } from "@/lib/calendar/weekly-time";
import type { CountyMissionStack } from "../types";
import type { LinkedTacticRecord, TacticLinkageRegistryFile, TacticLinkageStatus } from "./types";

const COUNTY_BY_SHORT = new Map(
  ARKANSAS_COUNTY_REGISTRY.map((c) => [
    c.displayName.replace(/\s+County$/i, "").trim().toLowerCase(),
    c,
  ]),
);

export function countyNameToSlug(county?: string | null): { slug: string; county: string } | null {
  if (!county?.trim()) return null;
  const key = county.replace(/\s+County$/i, "").trim().toLowerCase();
  const reg = COUNTY_BY_SHORT.get(key);
  if (!reg) return null;
  return { slug: reg.slug, county: reg.displayName.replace(/\s+County$/i, "").trim() };
}

function ymdFromIso(iso: string): string {
  return iso.slice(0, 10);
}

function inferKellyTier(eventType: string, priorityTier?: string): number | null {
  if (priorityTier === "Tier 1") return 1;
  if (priorityTier === "Tier 2") return 2;
  if (eventType === "fundraiser" || eventType === "media") return 1;
  if (eventType === "fair_festival" || eventType === "campaign_event") return 2;
  if (eventType === "county_party_meeting" || eventType === "community_event") return 3;
  return 4;
}

function matchTactic(
  item: ReturnType<typeof loadTravelCalendarItems>[number],
  stacks: CountyMissionStack[],
  decisionBySlug: Map<string, { id: string; countySlug: string }>,
  weekKey: string,
): LinkedTacticRecord {
  const countyMatch = countyNameToSlug(item.county);
  const startYmd = ymdFromIso(item.start);
  const inWeek = startYmd >= weekKey && startYmd < addDaysYmd(weekKey, 7);

  let linkedMissionId: string | null = null;
  let linkedDecisionId: string | null = null;
  let linkageStatus: TacticLinkageStatus = "orphan";
  let matchReason = "No county on calendar row";

  if (countyMatch) {
    const stack = stacks.find((s) => s.countySlug === countyMatch.slug);
    const decision = decisionBySlug.get(countyMatch.slug);
    if (decision) linkedDecisionId = decision.id;
    if (stack?.weekly && inWeek) {
      linkedMissionId = stack.weekly.id;
      linkageStatus = "linked";
      matchReason = `Matched ${countyMatch.county} weekly mission for ${weekKey}`;
    } else if (stack?.weekly) {
      linkageStatus = "unlinked";
      matchReason = `County mission exists but tactic outside week window`;
    } else if (decision) {
      linkageStatus = "needs_mission";
      matchReason = `Top 10 decision exists — sync missions to link`;
    } else {
      linkageStatus = "unlinked";
      matchReason = `Calendar row in ${countyMatch.county} — no weekly mission this week`;
    }
  }

  return {
    tacticId: `tactic-${item.id}`,
    calendarItemId: item.id,
    title: item.title,
    startYmd,
    countySlug: countyMatch?.slug ?? null,
    county: countyMatch?.county ?? item.county ?? null,
    eventType: item.eventType,
    calendarStatus: item.calendarStatus,
    linkedMissionId,
    linkedDecisionId,
    linkageStatus,
    matchReason,
    kellyTierHint: inferKellyTier(item.eventType, item.priorityTier),
  };
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return dt.toISOString().slice(0, 10);
}

export function syncTacticLinkage(input: {
  weekKey: string;
  briefId: string | null;
  stacks: CountyMissionStack[];
  decisions: { id: string; countySlug: string }[];
}): TacticLinkageRegistryFile {
  const { weekKey } = input;
  const startMs = weekStartDateFromKey(weekKey).getTime();
  const endMs = endOfWeekExclusive(weekKey).getTime();
  const items = filterCalendarItemsInWindow(loadTravelCalendarItems(), startMs, endMs);
  const decisionBySlug = new Map(input.decisions.map((d) => [d.countySlug, d]));

  const tactics = items.map((item) => matchTactic(item, input.stacks, decisionBySlug, weekKey));

  const linkedCount = tactics.filter((t) => t.linkageStatus === "linked").length;
  const unlinkedCount = tactics.filter((t) => t.linkageStatus === "unlinked").length;
  const orphanCount = tactics.filter((t) => t.linkageStatus === "orphan").length;
  const needsMissionCount = tactics.filter((t) => t.linkageStatus === "needs_mission").length;

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    syncedWeekKey: weekKey,
    syncedFromBriefId: input.briefId,
    doctrinePath: "docs/campaign-events/VICTORY_OS_DOCTRINE.md",
    tactics,
    summary: {
      totalCalendarItems: tactics.length,
      linkedCount,
      unlinkedCount,
      orphanCount,
      needsMissionCount,
    },
  };
}
