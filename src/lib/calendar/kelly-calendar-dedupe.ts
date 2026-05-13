import "server-only";

import type { LocalCoverageRequest } from "@prisma/client";
import { CalendarSourceType, EventWorkflowState } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { mergeKellyCockpitData } from "@/lib/calendar/kelly-cockpit-merge";
import type { EnrichedCalendarItem } from "@/lib/calendar/kelly-cockpit-types";

const ORPHAN_PREFIX = "ce-orphan:";

class DSU {
  private readonly parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a: number, b: number) {
    const pa = this.find(a);
    const pb = this.find(b);
    if (pa !== pb) this.parent[pa] = pb;
  }
}

function fingerprint(it: EnrichedCalendarItem): string {
  const t = it.title.trim().toLowerCase().replace(/\s+/g, " ");
  const st = it.start.slice(0, 16);
  const c = (it.county ?? "").trim().toLowerCase();
  const cy = (it.city ?? "").trim().toLowerCase();
  return `fp:${t}|${st}|${c}|${cy}`;
}

/** Lower number wins when collapsing duplicates (Kelly cockpit). */
export function displayPriorityForKellyDedupe(it: EnrichedCalendarItem): number {
  const g = it.kellyGoogle;
  const wf = g?.eventWorkflowState ?? "";
  if (g?.lane === "confirmed" && g.googleEventId && g.googleSyncState === "SYNCED") return 1;
  if (
    wf === EventWorkflowState.APPROVED ||
    wf === EventWorkflowState.PUBLISHED ||
    wf === EventWorkflowState.COMPLETED
  ) {
    return 2;
  }
  if (g?.lane === "tentative" && g.googleEventId && g.googleSyncState === "SYNCED") return 3;
  if (!it.id.startsWith(ORPHAN_PREFIX)) return 4;
  return 5;
}

function clusterKeys(it: EnrichedCalendarItem): string[] {
  const keys: string[] = [];
  const g = it.kellyGoogle;
  if (g?.campaignEventId) keys.push(`ce:${g.campaignEventId}`);
  if (g?.googleEventId) keys.push(`g:${g.googleEventId}`);
  if (g?.iCalUID) keys.push(`ical:${g.iCalUID}`);
  const matched = it.drillDown?.matchedDb;
  if (matched?.kind === "CampaignEvent" && matched.id) keys.push(`ce:${matched.id}`);
  keys.push(fingerprint(it));
  return [...new Set(keys)];
}

/**
 * Collapses duplicate cockpit rows that refer to the same real event (same CampaignEvent / Google id / fingerprint).
 * Winner priority: Confirmed+synced Google → approved workflow → tentative+synced → JSON row → orphan lane row.
 */
export function dedupeKellyCockpitDisplayItems(items: EnrichedCalendarItem[]): EnrichedCalendarItem[] {
  const n = items.length;
  if (n <= 1) return items;
  const dsu = new DSU(n);
  const keyToIndex = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const it = items[i]!;
    for (const key of clusterKeys(it)) {
      const j = keyToIndex.get(key);
      if (j === undefined) keyToIndex.set(key, i);
      else dsu.union(i, j);
    }
  }
  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const r = dsu.find(i);
    const arr = groups.get(r) ?? [];
    arr.push(i);
    groups.set(r, arr);
  }
  const winners: EnrichedCalendarItem[] = [];
  for (const idxs of groups.values()) {
    let bestIdx = idxs[0]!;
    let bestP = displayPriorityForKellyDedupe(items[bestIdx]!);
    let bestSk = items[bestIdx]!.sortKey;
    for (let k = 1; k < idxs.length; k++) {
      const ix = idxs[k]!;
      const p = displayPriorityForKellyDedupe(items[ix]!);
      const sk = items[ix]!.sortKey;
      if (p < bestP || (p === bestP && sk < bestSk)) {
        bestIdx = ix;
        bestP = p;
        bestSk = sk;
      }
    }
    winners.push(items[bestIdx]!);
  }
  winners.sort((a, b) => a.sortKey - b.sortKey || a.start.localeCompare(b.start));
  return winners;
}

function campaignEventToSyntheticCalendarItem(ev: {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  locationName: string | null;
  description: string | null;
  eventWorkflowState: EventWorkflowState;
  county: { displayName: string } | null;
}): CampaignCalendarItem {
  return {
    id: `${ORPHAN_PREFIX}${ev.id}`,
    source: "google_calendar",
    title: ev.title,
    start: ev.startAt.toISOString(),
    end: ev.endAt.toISOString(),
    allDay: false,
    county: ev.county?.displayName,
    city: undefined,
    location: ev.locationName ?? undefined,
    eventType: "campaign_event",
    calendarStatus:
      ev.eventWorkflowState === EventWorkflowState.APPROVED ||
      ev.eventWorkflowState === EventWorkflowState.PUBLISHED ||
      ev.eventWorkflowState === EventWorkflowState.COMPLETED
        ? "confirmed"
        : "tentative",
    publishStatus: "private_admin_only",
    countyTouchCounts: false,
    verificationConfidence: 1,
    notes: ev.description ?? undefined,
    drillDown: {
      matchedDb: {
        kind: "CampaignEvent",
        id: ev.id,
        matchReason: "Kelly Google lane (no JSON promotion)",
      },
    },
  };
}

/** Campaign events on Kelly Tentative/Confirmed calendars with no `KellyCalendarPromotion` (pure Google creates). */
export async function enrichedKellyLaneOrphans(): Promise<EnrichedCalendarItem[]> {
  const rows = await prisma.campaignEvent.findMany({
    where: {
      calendarSource: {
        sourceType: { in: [CalendarSourceType.KELLY_GOOGLE_TENTATIVE, CalendarSourceType.KELLY_GOOGLE_CONFIRMED] },
      },
      kellyCalendarPromotions: { none: {} },
    },
    include: {
      county: { select: { displayName: true } },
    },
    orderBy: { startAt: "asc" },
    take: 400,
  });
  if (rows.length === 0) return [];
  const emptyLocals = new Map<string, LocalCoverageRequest[]>();
  const promoted = new Set<string>();
  return rows.map((ev) => {
    const base = campaignEventToSyntheticCalendarItem(ev);
    return mergeKellyCockpitData([base], [], emptyLocals, promoted)[0]!;
  });
}
