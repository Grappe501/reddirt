import { loadCountyResourcePressureTable } from "./resourceAllocationModel";

export function countyResourcePressureAnalyzer(countySlug: string) {
  const row = loadCountyResourcePressureTable().rows.find((x) => x.countySlug === countySlug);
  if (!row) {
    return {
      countySlug,
      pressureScore: 0,
      pressureBand: "MISSING",
      forecastType: "FORECAST",
      confidence: "LOW",
      sourceLayers: ["data/resource-allocation/county-resource-pressure-table.json"],
    };
  }
  return {
    ...row,
    forecastType: "FORECAST",
    confidence: row.pressureScore >= 70 ? "HIGH" : row.pressureScore >= 40 ? "MEDIUM" : "LOW",
  };
}

