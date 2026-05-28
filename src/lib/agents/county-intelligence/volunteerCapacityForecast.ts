import { loadResourceAllocationModel } from "./resourceAllocationModel";
import type { ForecastConfidence } from "./resourceAllocationTypes";

type VolunteerCapacityForecastResult = {
  countySlug: string;
  volunteerCapacity: number | "MISSING";
  burnoutRisk: "FORECAST";
  confidence: ForecastConfidence;
  score: number;
  sourceLayers: string[];
};

export function volunteerCapacityForecast(countySlug: string): VolunteerCapacityForecastResult {
  const row = loadResourceAllocationModel().rows.find((x) => x.countySlug === countySlug);
  if (!row) {
    return {
      countySlug,
      volunteerCapacity: "MISSING",
      burnoutRisk: "FORECAST",
      confidence: "LOW",
      score: 0,
      sourceLayers: ["data/resource-allocation/resource-allocation-model.json"],
    };
  }
  const burnoutRiskScore = Math.max(0, Math.min(100, 100 - row.volunteerCapacity + row.staffingGaps / 2));
  return {
    countySlug,
    volunteerCapacity: row.volunteerCapacity,
    burnoutRisk: "FORECAST",
    confidence: burnoutRiskScore >= 65 ? "HIGH" : burnoutRiskScore >= 35 ? "MEDIUM" : "LOW",
    score: burnoutRiskScore,
    sourceLayers: row.sourceLayers,
  };
}

