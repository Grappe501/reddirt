import { loadEventROIModel } from "./resourceAllocationModel";

export function eventROIAnalyzer(countySlug: string) {
  const row = loadEventROIModel().rows.find((x) => x.countySlug === countySlug);
  if (!row) {
    return {
      countySlug,
      eventROI: 0,
      roiBand: "MISSING",
      forecastType: "FORECAST",
      confidence: "LOW",
      sourceLayers: ["data/resource-allocation/event-roi-model.json"],
    };
  }
  return {
    ...row,
    forecastType: "FORECAST",
    confidence: row.eventROI >= 70 ? "HIGH" : row.eventROI >= 40 ? "MEDIUM" : "LOW",
  };
}

