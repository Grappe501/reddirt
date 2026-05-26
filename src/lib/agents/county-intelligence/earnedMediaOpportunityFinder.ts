import { loadEarnedMediaOpportunities } from "./publicIssueSignalRegistry";

export function earnedMediaOpportunityFinder(countySlug: string) {
  const rows = loadEarnedMediaOpportunities().rows.filter((row) => row.countySlug === countySlug);
  return {
    countySlug,
    signalKind: "SIGNAL" as const,
    opportunities: rows.map((row) => row.opportunity),
    readinessScore: rows[0]?.readinessScore ?? 0,
    confidence: rows[0]?.confidence ?? "LOW_CONFIDENCE",
  };
}

