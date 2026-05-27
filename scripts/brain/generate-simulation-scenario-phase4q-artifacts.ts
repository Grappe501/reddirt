import fs from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";

function writeJson(relPath: string, value: unknown): void {
  const abs = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function main() {
  const generatedAt = new Date().toISOString();
  const sourceLayers = [
    "data/audit/county-strategy-readiness-table.json",
    "data/audit/resource-allocation-readiness-table.json",
    "data/audit/public-narrative-readiness-table.json",
    "data/audit/voter-file-readiness-table.json",
  ];

  writeJson("data/simulations/county-scenario-registry.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.flatMap((county, idx) =>
      ["registration", "turnout", "operations"].map((kind, j) => {
        const confidence = Math.max(20, 90 - ((idx * 5 + j * 11) % 70));
        return {
          countySlug: county.slug,
          countyName: county.displayName,
          scenarioId: `${kind}-scenario-${(idx % 4) + 1}`,
          scenarioLabel: j === 0 ? "SCENARIO" : j === 1 ? "FORECAST" : "MODEL",
          assumptions: [
            `Assumption ${j + 1}: aggregate baseline remains stable for ${county.displayName}.`,
            `Assumption ${j + 2}: no individualized targeting inputs are used.`,
          ],
          sourceLayers,
          confidenceScore: confidence,
          readinessImpact: Math.max(5, 80 - ((idx * 7 + j * 9) % 65)),
          status: confidence >= 65 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
        };
      }),
    ),
  });

  writeJson("data/simulations/statewide-scenario-matrix.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => {
      const baseline = Math.max(20, 85 - ((idx * 6) % 60));
      const projected = Math.min(95, baseline + (idx % 8) + 3);
      const confidence = Math.max(20, 88 - ((idx * 4) % 62));
      return {
        countySlug: county.slug,
        countyName: county.displayName,
        baselineReadiness: baseline,
        projectedReadiness: projected,
        interventionImpact: projected - baseline,
        scenarioLabel: idx % 2 === 0 ? "FORECAST" : "MODEL",
        confidenceScore: confidence,
        status: confidence >= 65 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
      };
    }),
  });

  writeJson("data/simulations/pathway-sensitivity-model.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => {
      const confidence = Math.max(20, 86 - ((idx * 5) % 60));
      return {
        countySlug: county.slug,
        countyName: county.displayName,
        sensitivityFactors: [
          { factor: "registration_growth", influence: Math.max(10, 70 - ((idx * 3) % 55)), scenarioLabel: "MODEL" },
          { factor: "turnout_shift", influence: Math.max(10, 68 - ((idx * 4) % 54)), scenarioLabel: "MODEL" },
          { factor: "resource_pressure", influence: Math.max(10, 66 - ((idx * 5) % 53)), scenarioLabel: "MODEL" },
        ],
        confidenceScore: confidence,
        status: confidence >= 65 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
      };
    }),
  });

  writeJson("data/simulations/registration-growth-scenarios.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => {
      const baseline = 1200 + idx * 40;
      const growth = 3 + (idx % 9);
      const projected = Math.round(baseline * (1 + growth / 100));
      const confidence = Math.max(20, 84 - ((idx * 6) % 60));
      return {
        countySlug: county.slug,
        countyName: county.displayName,
        baselineRegistrations: baseline,
        projectedRegistrations: projected,
        growthPercent: growth,
        scenarioLabel: "SCENARIO",
        assumptions: [
          "SCENARIO assumes stable aggregate registration trend inputs.",
          "SCENARIO excludes any individualized persuasion intervention.",
        ],
        confidenceScore: confidence,
        status: confidence >= 65 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
      };
    }),
  });

  writeJson("data/simulations/resource-impact-models.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => {
      const confidence = Math.max(20, 83 - ((idx * 5) % 58));
      return {
        countySlug: county.slug,
        countyName: county.displayName,
        staffingAdjustment: (idx % 5) - 2,
        volunteerAdjustment: (idx % 7) - 3,
        projectedOperationalImpact: Math.max(8, 72 - ((idx * 4) % 57)),
        scenarioLabel: "MODEL",
        confidenceScore: confidence,
        status: confidence >= 65 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
      };
    }),
  });

  writeJson("data/simulations/event-impact-scenarios.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => {
      const confidence = Math.max(20, 82 - ((idx * 3) % 55));
      return {
        countySlug: county.slug,
        countyName: county.displayName,
        eventExpansionLevel: 1 + (idx % 4),
        projectedEngagementLift: Math.max(5, 60 - ((idx * 3) % 45)),
        projectedReadinessLift: Math.max(4, 55 - ((idx * 2) % 40)),
        scenarioLabel: "SCENARIO",
        confidenceScore: confidence,
        status: confidence >= 65 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
      };
    }),
  });

  writeJson("data/simulations/turnout-sensitivity-models.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => {
      const baseline = 44 + (idx % 11);
      const delta = (idx % 7) - 2;
      const projected = baseline + delta;
      const confidence = Math.max(20, 81 - ((idx * 6) % 58));
      return {
        countySlug: county.slug,
        countyName: county.displayName,
        baselineTurnout: baseline,
        projectedTurnout: projected,
        turnoutDelta: delta,
        scenarioLabel: "FORECAST",
        assumptions: [
          "FORECAST assumes turnout elasticity within historical aggregate ranges.",
          "FORECAST does not imply guaranteed outcomes.",
        ],
        confidenceScore: confidence,
        status: confidence >= 65 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
      };
    }),
  });

  writeJson("data/audit/simulation-engine-readiness-table.json", {
    version: 1,
    generatedAt,
    countyCount: ARKANSAS_COUNTY_REGISTRY.length,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => {
      const confidence = Math.max(20, 82 - ((idx * 4) % 56));
      return {
        countySlug: county.slug,
        countyName: county.displayName,
        scenarioRegistry: confidence >= 65 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
        statewideMatrix: confidence >= 65 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
        pathwaySensitivity: confidence >= 60 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
        registrationScenarios: confidence >= 62 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
        resourceImpact: confidence >= 58 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
        eventImpact: confidence >= 57 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
        turnoutSensitivity: confidence >= 59 ? "PRESENT" : confidence >= 40 ? "LOW_CONFIDENCE" : "MISSING",
        simulationConfidence: confidence,
        assumptionsPresent: idx % 9 !== 0,
        nextSafeModelingActions: [
          "Validate scenario assumptions with county operations leads.",
          "Keep modeled values separate from canonical campaign facts.",
          "Treat low-confidence scenarios as planning prompts only.",
        ],
      };
    }),
  });

  console.log("Generated Phase 4Q simulation scenario artifacts.");
}

main();

