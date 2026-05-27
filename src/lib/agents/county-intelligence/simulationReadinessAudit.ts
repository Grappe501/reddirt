import { loadSimulationEngineReadiness } from "./statewideScenarioMatrix";

export function simulationReadinessAudit(countySlug: string) {
  const row = loadSimulationEngineReadiness().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    scenarioLabel: "FORECAST" as const,
    readiness:
      row == null
        ? "MISSING"
        : row.simulationConfidence >= 70
          ? "PRESENT"
          : row.simulationConfidence >= 40
            ? "LOW_CONFIDENCE"
            : "MISSING",
    nextSafeModelingActions: row?.nextSafeModelingActions ?? ["MISSING readiness row"],
  };
}

