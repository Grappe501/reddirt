import { loadCountyIssueClusters } from "./publicIssueSignalRegistry";

export function localIssueHeatmap(countySlug: string) {
  const rows = loadCountyIssueClusters().rows.filter((row) => row.countySlug === countySlug);
  return {
    countySlug,
    signalKind: "SIGNAL" as const,
    issueHeat: rows.map((row) => ({
      clusterId: row.clusterId,
      issue: row.topIssues[0] ?? "MISSING",
      intensity: row.volatility,
      confidence: row.confidence,
    })),
  };
}

