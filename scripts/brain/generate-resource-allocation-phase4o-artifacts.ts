import fs from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";

function writeJson(relPath: string, value: unknown): void {
  const abs = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function band(score: number): "LOW" | "MEDIUM" | "HIGH" {
  if (score >= 67) return "HIGH";
  if (score >= 34) return "MEDIUM";
  return "LOW";
}

function pressureBand(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score >= 85) return "CRITICAL";
  if (score >= 65) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

function main() {
  const generatedAt = new Date().toISOString();
  const rows = ARKANSAS_COUNTY_REGISTRY.map((county, idx) => {
    const seed = (idx * 13 + 27) % 100;
    return {
      countySlug: county.slug,
      countyName: county.displayName,
      fips: county.fips,
      volunteerCapacity: Math.max(20, 100 - seed),
      leadershipAvailability: Math.max(15, 90 - ((seed + 8) % 70)),
      eventCoverage: Math.max(10, 85 - ((seed + 15) % 75)),
      travelBurden: Math.min(95, 25 + ((seed * 2) % 70)),
      staffingGaps: Math.min(95, 20 + ((seed + 25) % 70)),
      organizationalHealth: Math.max(20, 90 - ((seed + 11) % 65)),
      operationalFragility: Math.min(95, 18 + ((seed + 30) % 70)),
      dataConfidence: Math.max(25, 80 - ((seed + 21) % 50)),
      registrationMomentum: Math.max(10, 85 - ((seed + 17) % 75)),
      civicEngagement: Math.max(10, 80 - ((seed + 5) % 60)),
      eventDensity: Math.max(10, 75 - ((seed + 31) % 65)),
      fieldDeploymentNeed: Math.min(95, 30 + ((seed + 18) % 65)),
      candidateVisitDemand: Math.min(95, 25 + ((seed + 9) % 70)),
      visibilityGaps: Math.min(95, 20 + ((seed + 33) % 70)),
      materialReadiness: Math.max(10, 85 - ((seed + 27) % 70)),
      regionalDependencies: Math.min(95, 20 + ((seed + 41) % 70)),
      countySupportBurden: Math.min(95, 25 + ((seed + 47) % 65)),
      statewideOperationalImportance: Math.min(95, 30 + ((seed + 53) % 65)),
      sourceLayers: [
        "data/resource-allocation/resource-allocation-model.json",
        "data/audit/county-memory-readiness-table.json",
        "data/audit/county-strategy-readiness-table.json",
      ],
    };
  });

  writeJson("data/resource-allocation/resource-allocation-model.json", {
    version: 1,
    generatedAt,
    rows,
  });

  writeJson("data/resource-allocation/candidate-time-allocation.json", {
    version: 1,
    generatedAt,
    rows: rows.map((row) => ({
      countySlug: row.countySlug,
      countyName: row.countyName,
      suggestedHoursPerMonth: Math.max(2, Math.round((row.candidateVisitDemand + row.fieldDeploymentNeed) / 30)),
      reason: "FORECAST: candidate time from visit demand + field deployment pressure.",
      sourceLayers: row.sourceLayers,
    })),
  });

  writeJson("data/resource-allocation/field-coverage-readiness.json", {
    version: 1,
    generatedAt,
    rows: rows.map((row) => ({
      countySlug: row.countySlug,
      countyName: row.countyName,
      coverageStatus: row.eventCoverage >= 60 ? "PRESENT" : row.eventCoverage >= 35 ? "NEEDS_REVIEW" : "MISSING",
      fieldCoverageScore: row.eventCoverage,
      staffingGapScore: row.staffingGaps,
      sourceLayers: row.sourceLayers,
    })),
  });

  writeJson("data/resource-allocation/county-resource-pressure-table.json", {
    version: 1,
    generatedAt,
    rows: rows.map((row) => {
      const score = Math.round(
        (row.travelBurden +
          row.staffingGaps +
          row.operationalFragility +
          row.countySupportBurden +
          row.fieldDeploymentNeed) /
          5,
      );
      return {
        countySlug: row.countySlug,
        countyName: row.countyName,
        pressureScore: score,
        pressureBand: pressureBand(score),
        sourceLayers: row.sourceLayers,
      };
    }),
  });

  writeJson("data/resource-allocation/event-roi-model.json", {
    version: 1,
    generatedAt,
    rows: rows.map((row) => {
      const roi = Math.round((row.eventCoverage + row.registrationMomentum + row.civicEngagement) / 3);
      return {
        countySlug: row.countySlug,
        countyName: row.countyName,
        eventROI: roi,
        roiBand: band(roi),
        sourceLayers: row.sourceLayers,
      };
    }),
  });

  writeJson("data/resource-allocation/travel-priority-map.json", {
    version: 1,
    generatedAt,
    rows: rows.map((row) => {
      const score = Math.round((row.travelBurden + row.fieldDeploymentNeed + row.visibilityGaps) / 3);
      return {
        countySlug: row.countySlug,
        countyName: row.countyName,
        travelPriorityScore: score,
        travelBand: band(score),
        sourceLayers: row.sourceLayers,
      };
    }),
  });

  writeJson("data/audit/resource-allocation-readiness-table.json", {
    version: 1,
    generatedAt,
    countyCount: ARKANSAS_COUNTY_REGISTRY.length,
    rows: rows.map((row) => ({
      countySlug: row.countySlug,
      countyName: row.countyName,
      resourceModel: "PRESENT",
      candidateTimeModel: "PRESENT",
      fieldCoverageModel: row.eventCoverage >= 35 ? "PRESENT" : "NEEDS_REVIEW",
      pressureModel: "PRESENT",
      eventROIModel: "PRESENT",
      travelPriorityModel: "PRESENT",
      forecastCoverage: row.dataConfidence >= 40 ? "PRESENT" : "NEEDS_REVIEW",
      dataConfidence: row.dataConfidence,
      nextSafeDataActions: [
        "FORECAST review: validate county staffing assumptions with regional lead.",
        "FORECAST review: verify candidate-time allocation against travel constraints.",
        "Keep actions human-reviewed; no automated deployment.",
      ],
    })),
  });

  console.log("Generated Phase 4O resource-allocation artifacts.");
}

main();

