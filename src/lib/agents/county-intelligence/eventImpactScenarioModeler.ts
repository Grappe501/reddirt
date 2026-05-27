import { loadEventImpactScenarios } from "./statewideScenarioMatrix";

export function eventImpactScenarioModeler(countySlug: string) {
  const row = loadEventImpactScenarios().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    scenarioLabel: row?.scenarioLabel ?? "SCENARIO",
    eventExpansionLevel: row?.eventExpansionLevel ?? 0,
    projectedEngagementLift: row?.projectedEngagementLift ?? 0,
    projectedReadinessLift: row?.projectedReadinessLift ?? 0,
    confidenceScore: row?.confidenceScore ?? 0,
    status: row?.status ?? "MISSING",
  };
}

