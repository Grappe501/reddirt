import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";

export const PUBLIC_MEETING_WATCHLIST_REL = "data/intelligence/public-meeting-watchlist.json";

export type PublicMeetingWatchTarget = {
  watchId: string;
  name: string;
  jurisdiction: string;
  county: string;
  url: string;
  sourceType: string;
  monitoringMethod: string;
  updateFrequency: string;
  manualReviewRequired: boolean;
  aiAccessLevel: string;
  topics: string[];
  relevanceNotes: string;
  reviewStatus: string;
};

export type PublicMeetingWatchlist = {
  version: number;
  generatedAt: string;
  purpose: string;
  targets: PublicMeetingWatchTarget[];
};

const NSI5_COUNTIES = ["pulaski", "benton", "washington", "sebastian", "craighead", "crittenden"];

export function loadPublicMeetingWatchlist(repoRoot: string = process.cwd()): PublicMeetingWatchlist {
  const abs = path.join(repoRoot, PUBLIC_MEETING_WATCHLIST_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "Watchlist not initialized.",
      targets: [],
    };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as PublicMeetingWatchlist;
}

export function summarizeWatchlistCoverage(repoRoot?: string): {
  totalTargets: number;
  countyCount: number;
  statewideCount: number;
  manualReviewCount: number;
  bySourceType: Record<string, number>;
} {
  const watchlist = loadPublicMeetingWatchlist(repoRoot);
  const bySourceType: Record<string, number> = {};
  for (const row of watchlist.targets) {
    bySourceType[row.sourceType] = (bySourceType[row.sourceType] ?? 0) + 1;
  }
  return {
    totalTargets: watchlist.targets.length,
    countyCount: new Set(watchlist.targets.map((row) => row.county).filter((c) => c !== "statewide")).size,
    statewideCount: watchlist.targets.filter((row) => row.county === "statewide").length,
    manualReviewCount: watchlist.targets.filter((row) => row.manualReviewRequired).length,
    bySourceType,
  };
}

export function resolveWatchlistByCounty(countyId: string, repoRoot?: string): PublicMeetingWatchTarget[] {
  return loadPublicMeetingWatchlist(repoRoot).targets.filter(
    (row) => row.county === countyId || row.county === "statewide",
  );
}

export function recommendWatchlistGaps(repoRoot?: string): string[] {
  const watchlist = loadPublicMeetingWatchlist(repoRoot);
  const covered = new Set(watchlist.targets.map((row) => row.county));
  const gaps: string[] = [];

  for (const countyId of NSI5_COUNTIES) {
    if (!covered.has(countyId)) {
      const county = loadCountyBriefingIntelligenceIndex(repoRoot).counties.find((c) => c.countyId === countyId);
      gaps.push(`No watchlist targets for ${county?.countyName ?? countyId} — add quorum court / election commission URLs.`);
    }
  }

  if (!watchlist.targets.some((row) => row.sourceType === "city_council")) {
    gaps.push("No city council agenda targets registered.");
  }
  if (!watchlist.targets.some((row) => row.sourceType === "school_board")) {
    gaps.push("No school board agenda targets registered (if relevant).");
  }

  return gaps;
}
