import { loadResourceAllocationModel } from "./resourceAllocationModel";

export function organizationalFragilityDetector(countySlug: string) {
  const row = loadResourceAllocationModel().rows.find((x) => x.countySlug === countySlug);
  if (!row) {
    return {
      countySlug,
      fragility: "MISSING",
      forecastType: "FORECAST",
      confidence: "LOW",
      fragilityScore: 100,
      sourceLayers: ["data/resource-allocation/resource-allocation-model.json"],
    };
  }
  const fragilityScore = Math.max(
    0,
    Math.min(100, Math.round((row.operationalFragility + row.staffingGaps + (100 - row.organizationalHealth)) / 3)),
  );
  return {
    countySlug,
    fragility: fragilityScore >= 65 ? "HIGH" : fragilityScore >= 35 ? "MEDIUM" : "LOW",
    forecastType: "FORECAST",
    confidence: row.dataConfidence >= 70 ? "HIGH" : row.dataConfidence >= 40 ? "MEDIUM" : "LOW",
    fragilityScore,
    sourceLayers: row.sourceLayers,
  };
}

