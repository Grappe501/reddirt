import fs from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import type {
  CountyMemoryReadinessRow,
  CountyMemoryReadinessTable,
  MemoryFieldStatus,
} from "./countyMemoryTypes";

const READINESS_PATH = path.join(process.cwd(), "data", "audit", "county-memory-readiness-table.json");

function status(value: string | undefined): MemoryFieldStatus {
  if (value === "PRESENT" || value === "MISSING" || value === "NEEDS_REVIEW") return value;
  return "NEEDS_REVIEW";
}

function fallbackRow(countySlug: string): CountyMemoryReadinessRow {
  const county = ARKANSAS_COUNTY_REGISTRY.find((c) => c.slug === countySlug);
  return {
    countySlug,
    countyName: county?.displayName ?? countySlug,
    fips: county?.fips ?? "MISSING",
    memoryTimeline: "MISSING",
    eventOutcomes: "MISSING",
    relationshipGraph: "MISSING",
    recurringIssues: "MISSING",
    politicalCultureProfile: "MISSING",
    crossCountyConnections: "NEEDS_REVIEW",
    confidenceScore: 0,
    nextSafeDataActions: [
      "Capture county event memory timeline entries.",
      "Record known event outcomes with source notes.",
      "Add county relationship evidence (shared issues, regional ties).",
      "Log recurring county issues as operational memory.",
      "Add county civic/political culture notes with NEEDS_REVIEW status until verified.",
    ],
  };
}

export function loadCountyMemoryReadinessAudit(): CountyMemoryReadinessTable {
  const raw = fs.readFileSync(READINESS_PATH, "utf8");
  return JSON.parse(raw) as CountyMemoryReadinessTable;
}

export function getCountyMemoryReadinessRow(countySlug: string): CountyMemoryReadinessRow {
  const audit = loadCountyMemoryReadinessAudit();
  const found = audit.rows.find((row) => row.countySlug === countySlug);
  if (!found) return fallbackRow(countySlug);
  return {
    ...found,
    memoryTimeline: status(found.memoryTimeline),
    eventOutcomes: status(found.eventOutcomes),
    relationshipGraph: status(found.relationshipGraph),
    recurringIssues: status(found.recurringIssues),
    politicalCultureProfile: status(found.politicalCultureProfile),
    crossCountyConnections: status(found.crossCountyConnections),
  };
}

export function listInstitutionalMemoryGaps(countySlug: string): string[] {
  const row = getCountyMemoryReadinessRow(countySlug);
  const gaps: string[] = [];
  if (row.memoryTimeline !== "PRESENT") gaps.push(`memory timeline ${row.memoryTimeline}`);
  if (row.eventOutcomes !== "PRESENT") gaps.push(`event outcomes ${row.eventOutcomes}`);
  if (row.relationshipGraph !== "PRESENT") gaps.push(`relationship graph ${row.relationshipGraph}`);
  if (row.recurringIssues !== "PRESENT") gaps.push(`recurring issues ${row.recurringIssues}`);
  if (row.politicalCultureProfile !== "PRESENT")
    gaps.push(`political culture profile ${row.politicalCultureProfile}`);
  if (row.crossCountyConnections !== "PRESENT")
    gaps.push(`cross-county connections ${row.crossCountyConnections}`);
  return gaps;
}

