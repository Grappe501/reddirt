import { loadRegionalNarrativeMap } from "./publicIssueSignalRegistry";

export function regionalNarrativeAnalyzer(regionId: string) {
  const row = loadRegionalNarrativeMap().rows.find((x) => x.regionId === regionId);
  if (!row) {
    return {
      regionId,
      signalKind: "TREND" as const,
      confidence: "LOW_CONFIDENCE",
      dominantNarratives: ["MISSING"],
    };
  }
  return row;
}

