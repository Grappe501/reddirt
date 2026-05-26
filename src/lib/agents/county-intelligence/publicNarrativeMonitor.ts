import { loadPublicIssueSignalRegistry } from "./publicIssueSignalRegistry";

export function publicNarrativeMonitor(countySlug: string) {
  const rows = loadPublicIssueSignalRegistry().rows.filter((row) => row.countySlug === countySlug);
  const volatility = rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row.frequencyScore, 0) / rows.length) : 0;
  return {
    countySlug,
    signalKind: "TREND" as const,
    narrativeVolatility: volatility,
    topNarrativeSignals: rows.slice(0, 5).map((row) => row.issueCategory),
    confidence: rows[0]?.confidence ?? "LOW_CONFIDENCE",
  };
}

