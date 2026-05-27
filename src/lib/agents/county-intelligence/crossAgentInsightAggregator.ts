import { loadCrossAgentInsightStream } from "./campaignBrainAgentRegistry";

export function crossAgentInsightAggregator(countySlug: string) {
  const rows = loadCrossAgentInsightStream().rows.filter((x) => x.countySlug === countySlug);
  return {
    countySlug,
    insights: rows.map((row) => ({
      insight: row.insight,
      sourceAgents: row.sourceAgents,
      confidenceScore: row.confidenceScore,
      label: row.label,
    })),
  };
}

