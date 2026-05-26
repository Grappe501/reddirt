import { loadCountyIssueClusters } from "./publicIssueSignalRegistry";

export function recurringIssueTracker(countySlug: string) {
  const rows = loadCountyIssueClusters().rows.filter((row) => row.countySlug === countySlug);
  return {
    countySlug,
    signalKind: "TREND" as const,
    recurringIssueTimeline: rows.map(
      (row) => `${row.clusterId}: ${row.topIssues.slice(0, 2).join(", ")}`,
    ),
    volatility: rows[0]?.volatility ?? 0,
    confidence: rows[0]?.confidence ?? "LOW_CONFIDENCE",
  };
}

