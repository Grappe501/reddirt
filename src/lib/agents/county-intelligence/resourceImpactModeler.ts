import { loadResourceImpactModels } from "./statewideScenarioMatrix";

export function resourceImpactModeler(countySlug: string) {
  const row = loadResourceImpactModels().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    scenarioLabel: row?.scenarioLabel ?? "MODEL",
    staffingAdjustment: row?.staffingAdjustment ?? 0,
    volunteerAdjustment: row?.volunteerAdjustment ?? 0,
    projectedOperationalImpact: row?.projectedOperationalImpact ?? 0,
    confidenceScore: row?.confidenceScore ?? 0,
    status: row?.status ?? "MISSING",
  };
}

