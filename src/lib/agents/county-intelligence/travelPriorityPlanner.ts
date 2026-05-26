import { loadTravelPriorityMap } from "./resourceAllocationModel";

export function travelPriorityPlanner(countySlug: string) {
  const row = loadTravelPriorityMap().rows.find((x) => x.countySlug === countySlug);
  if (!row) {
    return {
      countySlug,
      travelPriorityScore: 0,
      travelBand: "MISSING",
      forecastType: "FORECAST",
      confidence: "LOW",
      sourceLayers: ["data/resource-allocation/travel-priority-map.json"],
    };
  }
  return {
    ...row,
    forecastType: "FORECAST",
    confidence: row.travelPriorityScore >= 65 ? "HIGH" : row.travelPriorityScore >= 35 ? "MEDIUM" : "LOW",
  };
}

