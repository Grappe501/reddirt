import fs from "node:fs";
import path from "node:path";
import type {
  CountyEventOutcomesFile,
  CountyMemoryIndexFile,
  CountyMemoryIndexRow,
  MemoryFieldStatus,
} from "./countyMemoryTypes";

const MEMORY_INDEX_PATH = path.join(process.cwd(), "data", "county-memory", "county-memory-index.json");
const EVENT_OUTCOMES_PATH = path.join(process.cwd(), "data", "county-memory", "county-event-outcomes.json");

function defaultRow(countySlug: string): CountyMemoryIndexRow {
  return {
    countySlug,
    countyName: countySlug,
    fips: "MISSING",
    regionId: "MISSING",
    memoryStatus: "MISSING",
    eventOutcomeStatus: "MISSING",
    relationshipStatus: "MISSING",
    recurringIssueStatus: "MISSING",
    confidenceScore: 0,
    updatedAt: null,
    knownEvents: 0,
    recurringIssues: [],
    organizations: [],
    notes: ["County memory row missing"],
  };
}

export function loadCountyMemoryIndex(): CountyMemoryIndexFile {
  const raw = fs.readFileSync(MEMORY_INDEX_PATH, "utf8");
  return JSON.parse(raw) as CountyMemoryIndexFile;
}

export function loadCountyEventOutcomes(): CountyEventOutcomesFile {
  const raw = fs.readFileSync(EVENT_OUTCOMES_PATH, "utf8");
  return JSON.parse(raw) as CountyEventOutcomesFile;
}

export function getCountyMemoryIndexRow(countySlug: string): CountyMemoryIndexRow {
  const file = loadCountyMemoryIndex();
  return file.rows.find((row) => row.countySlug === countySlug) ?? defaultRow(countySlug);
}

export function normalizeMemoryStatus(value: string | null | undefined): MemoryFieldStatus {
  if (value === "PRESENT" || value === "MISSING" || value === "NEEDS_REVIEW") {
    return value;
  }
  return "NEEDS_REVIEW";
}

