import { loadPublicIssueSignalRegistry } from "./publicIssueSignalRegistry";

export function countyConcernAnalyzer(countySlug: string) {
  const rows = loadPublicIssueSignalRegistry().rows
    .filter((row) => row.countySlug === countySlug)
    .sort((a, b) => b.frequencyScore - a.frequencyScore);
  return {
    countySlug,
    signalKind: "SIGNAL" as const,
    topConcerns: rows.slice(0, 5).map((row) => row.issueCategory),
    confidence: rows[0]?.confidence ?? "MISSING",
    sourceLayers: rows[0]?.sourceLayers ?? ["data/public-narrative/public-issue-signal-registry.json"],
  };
}

