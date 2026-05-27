import { loadSimulationEngineReadiness } from "./statewideScenarioMatrix";

export function scenarioConfidenceScorer(countySlug: string) {
  const row = loadSimulationEngineReadiness().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    scenarioLabel: "MODEL" as const,
    confidenceScore: row?.simulationConfidence ?? 0,
    assumptionsPresent: row?.assumptionsPresent ?? false,
    status:
      row?.simulationConfidence == null
        ? "MISSING"
        : row.simulationConfidence >= 65
          ? "PRESENT"
          : "LOW_CONFIDENCE",
  };
}

