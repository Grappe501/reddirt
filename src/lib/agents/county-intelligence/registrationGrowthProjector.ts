import { loadRegistrationGrowthScenarios } from "./statewideScenarioMatrix";

export function registrationGrowthProjector(countySlug: string) {
  const row = loadRegistrationGrowthScenarios().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    scenarioLabel: row?.scenarioLabel ?? "SCENARIO",
    baselineRegistrations: row?.baselineRegistrations ?? 0,
    projectedRegistrations: row?.projectedRegistrations ?? 0,
    growthPercent: row?.growthPercent ?? 0,
    assumptions: row?.assumptions ?? ["MISSING assumptions"],
    confidenceScore: row?.confidenceScore ?? 0,
    status: row?.status ?? "MISSING",
  };
}

