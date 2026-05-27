import { loadPathwaySensitivityModel } from "./statewideScenarioMatrix";

export function pathwaySensitivityAnalyzer(countySlug: string) {
  const row = loadPathwaySensitivityModel().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    scenarioLabel: "MODEL" as const,
    factors: row?.sensitivityFactors ?? [],
    confidenceScore: row?.confidenceScore ?? 0,
    status: row?.status ?? "MISSING",
  };
}

