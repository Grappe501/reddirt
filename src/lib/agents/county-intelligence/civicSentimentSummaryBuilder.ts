import { loadCivicSentimentSummary } from "./publicIssueSignalRegistry";

export function civicSentimentSummaryBuilder(countySlug: string) {
  const row = loadCivicSentimentSummary().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    signalKind: "TREND" as const,
    civicSentiment: row?.civicSentiment ?? "MISSING",
    engagementScore: row?.engagementScore ?? 0,
    volatility: row?.volatility ?? 0,
    confidence: row?.confidence ?? "LOW_CONFIDENCE",
  };
}

