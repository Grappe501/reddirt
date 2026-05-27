import { loadTurnoutSensitivityModels } from "./statewideScenarioMatrix";

export function turnoutSensitivityAnalyzer(countySlug: string) {
  const row = loadTurnoutSensitivityModels().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    scenarioLabel: row?.scenarioLabel ?? "MODEL",
    baselineTurnout: row?.baselineTurnout ?? 0,
    projectedTurnout: row?.projectedTurnout ?? 0,
    turnoutDelta: row?.turnoutDelta ?? 0,
    assumptions: row?.assumptions ?? ["MISSING assumptions"],
    confidenceScore: row?.confidenceScore ?? 0,
    status: row?.status ?? "MISSING",
  };
}

