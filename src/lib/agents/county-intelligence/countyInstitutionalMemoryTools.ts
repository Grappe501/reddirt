import fs from "node:fs";
import path from "node:path";
import { getCountyMemoryIndexRow } from "./countyMemoryIndex";
import { getCountyMemoryReadinessRow } from "./countyMemoryReadinessAudit";
import type { CountyEventOutcomesFile } from "./countyMemoryTypes";

const EVENT_OUTCOMES_PATH = path.join(
  process.cwd(),
  "data",
  "county-memory",
  "county-event-outcomes.json",
);

function loadEventOutcomes(): CountyEventOutcomesFile {
  return JSON.parse(fs.readFileSync(EVENT_OUTCOMES_PATH, "utf8")) as CountyEventOutcomesFile;
}

export function countyMemoryTimeline(countySlug: string) {
  const index = getCountyMemoryIndexRow(countySlug);
  return {
    countySlug,
    memoryStatus: index.memoryStatus,
    updatedAt: index.updatedAt ?? "MISSING",
    timeline: index.notes.length > 0 ? index.notes : ["MISSING"],
    confidenceScore: index.confidenceScore,
  };
}

export function countyPoliticalCultureProfile(countySlug: string) {
  const readiness = getCountyMemoryReadinessRow(countySlug);
  return {
    countySlug,
    profileStatus: readiness.politicalCultureProfile,
    recurringIssues:
      readiness.recurringIssues === "MISSING" ? ["MISSING"] : readiness.nextSafeDataActions.slice(0, 2),
    confidenceScore: readiness.confidenceScore,
    recommendations: readiness.nextSafeDataActions,
  };
}

export function eventOutcomeAnalyzer(countySlug: string) {
  const outcomes = loadEventOutcomes().rows.filter((row) => row.countySlug === countySlug);
  if (outcomes.length === 0) {
    return {
      countySlug,
      status: "MISSING",
      outcomes: [{ eventTitle: "MISSING", outcomeSummary: "No event outcomes available." }],
    };
  }
  return {
    countySlug,
    status: outcomes.some((row) => row.status === "PRESENT") ? "PRESENT" : "NEEDS_REVIEW",
    outcomes: outcomes.slice(0, 10).map((row) => ({
      eventTitle: row.eventTitle,
      outcomeSummary: row.outcomeSummary,
      outcomeType: row.outcomeType,
      source: row.source,
    })),
  };
}

export function recurringIssueTracker(countySlug: string) {
  const row = getCountyMemoryIndexRow(countySlug);
  return {
    countySlug,
    recurringIssues: row.recurringIssues.length > 0 ? row.recurringIssues : ["MISSING"],
    status: row.recurringIssueStatus,
    confidenceScore: row.confidenceScore,
  };
}

export function localInfluenceMap(countySlug: string) {
  const row = getCountyMemoryIndexRow(countySlug);
  return {
    countySlug,
    organizations: row.organizations.length > 0 ? row.organizations : ["NEEDS_REVIEW"],
    status: row.relationshipStatus,
    notes: row.notes,
  };
}

export function institutionalMemoryGapExplainer(countySlug: string) {
  const row = getCountyMemoryReadinessRow(countySlug);
  const gaps = [
    `memoryTimeline:${row.memoryTimeline}`,
    `eventOutcomes:${row.eventOutcomes}`,
    `relationshipGraph:${row.relationshipGraph}`,
    `recurringIssues:${row.recurringIssues}`,
    `politicalCultureProfile:${row.politicalCultureProfile}`,
  ];
  return {
    countySlug,
    gaps,
    nextSafeDataActions: row.nextSafeDataActions,
    confidenceScore: row.confidenceScore,
  };
}

