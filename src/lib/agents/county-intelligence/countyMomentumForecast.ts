import { loadResourceAllocationModel } from "./resourceAllocationModel";
import type { ForecastConfidence } from "./resourceAllocationTypes";

type CountyMomentumForecastResult = {
  countySlug: string;
  momentum: "MISSING" | "LOW" | "MEDIUM" | "HIGH";
  forecastType: "FORECAST";
  confidence: ForecastConfidence;
  score: number;
  sourceLayers: string[];
};

export function countyMomentumForecast(countySlug: string): CountyMomentumForecastResult {
  const row = loadResourceAllocationModel().rows.find((x) => x.countySlug === countySlug);
  if (!row) {
    return {
      countySlug,
      momentum: "MISSING",
      forecastType: "FORECAST",
      confidence: "LOW",
      score: 0,
      sourceLayers: ["data/resource-allocation/resource-allocation-model.json"],
    };
  }
  const score = Math.max(
    0,
    Math.min(100, Math.round((row.registrationMomentum + row.civicEngagement + row.eventDensity) / 3)),
  );
  return {
    countySlug,
    momentum: score >= 65 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW",
    forecastType: "FORECAST",
    confidence: row.dataConfidence >= 70 ? "HIGH" : row.dataConfidence >= 40 ? "MEDIUM" : "LOW",
    score,
    sourceLayers: row.sourceLayers,
  };
}

