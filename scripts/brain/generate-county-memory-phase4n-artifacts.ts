import fs from "node:fs";
import path from "node:path";
import {
  ARKANSAS_COMMAND_REGIONS,
  ARKANSAS_COUNTY_REGISTRY,
} from "../../src/lib/county/arkansas-county-registry";

function writeJson(relPath: string, value: unknown): void {
  const abs = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function main() {
  const generatedAt = new Date().toISOString();
  const countyRows = ARKANSAS_COUNTY_REGISTRY.map((county) => ({
    countySlug: county.slug,
    countyName: county.displayName,
    fips: county.fips,
    regionId: county.regionId,
    memoryStatus: "MISSING",
    eventOutcomeStatus: "MISSING",
    relationshipStatus: "MISSING",
    recurringIssueStatus: "MISSING",
    confidenceScore: 10,
    updatedAt: null,
    knownEvents: 0,
    recurringIssues: [],
    organizations: [],
    notes: ["No county memory records yet — MISSING until additive records arrive."],
  }));

  writeJson("data/county-memory/county-memory-index.json", {
    version: 1,
    generatedAt,
    countyCount: ARKANSAS_COUNTY_REGISTRY.length,
    rows: countyRows,
  });

  writeJson("data/county-memory/county-event-outcomes.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county) => ({
      countySlug: county.slug,
      eventId: `${county.slug}-missing`,
      eventTitle: `${county.displayName} memory missing`,
      outcomeSummary: "No county event outcome records yet.",
      outcomeType: "needs_review",
      eventDate: null,
      status: "MISSING",
      source: "data/campaign-events/county-memory/*.json",
    })),
  });

  writeJson("data/county-memory/county-relationship-graph.json", {
    version: 1,
    generatedAt,
    edges: [],
  });

  writeJson("data/county-memory/regional-influence-map.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COMMAND_REGIONS.map((region) => ({
      regionId: region.id,
      regionLabel: region.label,
      counties: ARKANSAS_COUNTY_REGISTRY.filter((county) => county.regionId === region.id).map(
        (county) => county.slug,
      ),
      dominantIssueSignals: ["NEEDS_REVIEW"],
      relationshipSignalStrength: 15,
      status: "NEEDS_REVIEW",
    })),
  });

  writeJson("data/audit/county-memory-readiness-table.json", {
    version: 1,
    generatedAt,
    countyCount: ARKANSAS_COUNTY_REGISTRY.length,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county) => ({
      countySlug: county.slug,
      countyName: county.displayName,
      fips: county.fips,
      memoryTimeline: "MISSING",
      eventOutcomes: "MISSING",
      relationshipGraph: "MISSING",
      recurringIssues: "MISSING",
      politicalCultureProfile: "MISSING",
      crossCountyConnections: "NEEDS_REVIEW",
      confidenceScore: 10,
      nextSafeDataActions: [
        "Capture county event memory timeline entries.",
        "Record known event outcomes with source notes.",
        "Add county relationship evidence (shared issues, regional ties).",
        "Log recurring county issues as operational memory.",
        "Add county civic/political culture notes with NEEDS_REVIEW status until verified.",
      ],
    })),
  });

  console.log("Generated Phase 4N county memory artifacts.");
}

main();

