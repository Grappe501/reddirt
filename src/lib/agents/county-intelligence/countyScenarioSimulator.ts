import { loadCountyScenarioRegistry } from "./statewideScenarioMatrix";

export function countyScenarioSimulator(countySlug: string) {
  const rows = loadCountyScenarioRegistry().rows.filter((row) => row.countySlug === countySlug);
  return {
    countySlug,
    scenarios: rows.map((row) => ({
      scenarioId: row.scenarioId,
      label: row.scenarioLabel,
      readinessImpact: row.readinessImpact,
      assumptions: row.assumptions,
      confidenceScore: row.confidenceScore,
      status: row.status,
    })),
  };
}

