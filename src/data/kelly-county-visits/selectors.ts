import { ARKANSAS_COUNTIES, ARKANSAS_COUNTY_COUNT } from "./arkansas-counties";
import { kellyCampaignStops } from "./kelly-county-visits";
import type { KellyCampaignStop } from "./types";

const PUBLIC_STATUSES = new Set(["completed", "scheduled", "needs-review"]);

export function getPublicStops(): KellyCampaignStop[] {
  return kellyCampaignStops.filter(
    (s) => s.includeOnPublicPage && PUBLIC_STATUSES.has(s.status),
  );
}

export function getCompletedPublicStops(): KellyCampaignStop[] {
  return getPublicStops()
    .filter((s) => s.status === "completed" || (s.status === "needs-review" && s.date < todayIso()))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getUpcomingPublicStops(): KellyCampaignStop[] {
  return getPublicStops()
    .filter((s) => s.status === "scheduled" || (s.status === "needs-review" && s.date >= todayIso()))
    .filter((s) => s.date <= "2026-11-03")
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

function todayIso(): string {
  // Campaign reference day for Pass 1 status display; override via env if needed.
  return process.env.KELLY_VISITS_AS_OF?.trim() || new Date().toISOString().slice(0, 10);
}

export type CountyVisitBucket = "visited" | "scheduled" | "undocumented";

export function getCountyBuckets(): Record<CountyVisitBucket, string[]> {
  const visited = new Set<string>();
  const scheduled = new Set<string>();
  for (const s of getPublicStops()) {
    for (const c of s.counties) {
      if (s.status === "completed" || (s.status === "needs-review" && s.date < todayIso())) {
        visited.add(c);
      } else if (s.status === "scheduled" || s.status === "needs-review") {
        scheduled.add(c);
      }
    }
  }
  // Visited wins over scheduled
  for (const c of visited) scheduled.delete(c);
  const undocumented = ARKANSAS_COUNTIES.filter((c) => !visited.has(c) && !scheduled.has(c));
  return {
    visited: ARKANSAS_COUNTIES.filter((c) => visited.has(c)),
    scheduled: ARKANSAS_COUNTIES.filter((c) => scheduled.has(c)),
    undocumented: [...undocumented],
  };
}

export type VisitSummary = {
  visitedCounties: number;
  totalCounties: number;
  percentVisited: number;
  completedStopCount: number;
  scheduledStopCount: number;
  /** Lifetime public stops (completed + upcoming through Election Day). */
  totalPublicStopCount: number;
  needsReviewCount: number;
  buckets: Record<CountyVisitBucket, string[]>;
};

export function getVisitSummary(): VisitSummary {
  const buckets = getCountyBuckets();
  const completedStops = getCompletedPublicStops();
  const upcomingStops = getUpcomingPublicStops();
  const needsReview = getPublicStops().filter(
    (s) => s.status === "needs-review" || s.counties.length === 0,
  );
  const visitedCount = buckets.visited.length;
  return {
    visitedCounties: visitedCount,
    totalCounties: ARKANSAS_COUNTY_COUNT,
    percentVisited: Math.round((visitedCount / ARKANSAS_COUNTY_COUNT) * 1000) / 10,
    completedStopCount: completedStops.length,
    scheduledStopCount: upcomingStops.length,
    totalPublicStopCount: completedStops.length + upcomingStops.length,
    needsReviewCount: needsReview.length,
    buckets,
  };
}

export function displayTitle(stop: KellyCampaignStop): string {
  return stop.publicTitle?.trim() || stop.title;
}

export function formatStopDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}
