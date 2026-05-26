import { loadFieldCoverageReadiness } from "./resourceAllocationModel";

export function fieldCoverageGapFinder(countySlug: string) {
  const row = loadFieldCoverageReadiness().rows.find((x) => x.countySlug === countySlug);
  if (!row) {
    return {
      countySlug,
      coverageStatus: "MISSING",
      fieldCoverageScore: 0,
      staffingGapScore: 100,
      forecastType: "FORECAST",
      confidence: "LOW",
      sourceLayers: ["data/resource-allocation/field-coverage-readiness.json"],
    };
  }
  return {
    ...row,
    forecastType: "FORECAST",
    confidence: row.coverageStatus === "PRESENT" ? "MEDIUM" : "LOW",
  };
}

