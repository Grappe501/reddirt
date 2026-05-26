import fs from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import {
  getCountyRelationshipEdges,
  summarizeRelationshipConfidence,
} from "./countyRelationshipGraph";
import type {
  CountyMemoryReadinessTable,
  RegionalInfluenceMapFile,
} from "./countyMemoryTypes";

const REGIONAL_INFLUENCE_PATH = path.join(
  process.cwd(),
  "data",
  "county-memory",
  "regional-influence-map.json",
);
const MEMORY_READINESS_PATH = path.join(
  process.cwd(),
  "data",
  "audit",
  "county-memory-readiness-table.json",
);

function loadRegionalInfluenceMap(): RegionalInfluenceMapFile {
  return JSON.parse(fs.readFileSync(REGIONAL_INFLUENCE_PATH, "utf8")) as RegionalInfluenceMapFile;
}

function loadMemoryReadinessTable(): CountyMemoryReadinessTable {
  return JSON.parse(fs.readFileSync(MEMORY_READINESS_PATH, "utf8")) as CountyMemoryReadinessTable;
}

export function countyRelationshipGraphReader(countySlug: string) {
  const edges = getCountyRelationshipEdges(countySlug);
  return {
    countySlug,
    relationshipStatus: summarizeRelationshipConfidence(edges),
    edges,
  };
}

export function regionalInfluenceAnalyzer(regionId: string) {
  const row = loadRegionalInfluenceMap().rows.find((r) => r.regionId === regionId);
  if (!row) {
    return {
      regionId,
      status: "MISSING",
      dominantIssueSignals: ["MISSING"],
      counties: [],
      relationshipSignalStrength: 0,
    };
  }
  return row;
}

export function crossCountyTrendAnalyzer() {
  const readiness = loadMemoryReadinessTable();
  const byRegion = new Map<string, { total: number; missing: number }>();
  for (const county of ARKANSAS_COUNTY_REGISTRY) {
    const row = readiness.rows.find((x) => x.countySlug === county.slug);
    const current = byRegion.get(county.regionId) ?? { total: 0, missing: 0 };
    current.total += 1;
    if (!row || row.memoryTimeline !== "PRESENT") current.missing += 1;
    byRegion.set(county.regionId, current);
  }
  return Array.from(byRegion.entries()).map(([regionId, stats]) => ({
    regionId,
    coveragePercent:
      stats.total > 0 ? Math.round(((stats.total - stats.missing) / stats.total) * 100) : 0,
    missingCount: stats.missing,
  }));
}

export function sharedIssueDetector() {
  const readiness = loadMemoryReadinessTable();
  const cluster = readiness.rows.filter((row) => row.recurringIssues !== "PRESENT").map((row) => row.countySlug);
  return {
    issue: "recurring_issue_memory_gap",
    counties: cluster,
    status: cluster.length > 0 ? "NEEDS_REVIEW" : "PRESENT",
  };
}

