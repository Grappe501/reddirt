import { loadCandidateTimeAllocation } from "./resourceAllocationModel";

export function candidateTimeAllocator(countySlug: string) {
  const row = loadCandidateTimeAllocation().rows.find((x) => x.countySlug === countySlug);
  if (!row) {
    return {
      countySlug,
      suggestedHoursPerMonth: 0,
      reason: "MISSING",
      forecastType: "FORECAST",
      confidence: "LOW",
      sourceLayers: ["data/resource-allocation/candidate-time-allocation.json"],
    };
  }
  return {
    ...row,
    forecastType: "FORECAST",
    confidence: row.suggestedHoursPerMonth >= 8 ? "HIGH" : row.suggestedHoursPerMonth >= 4 ? "MEDIUM" : "LOW",
  };
}

