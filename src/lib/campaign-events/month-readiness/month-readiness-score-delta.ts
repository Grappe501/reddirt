import type { WorkbenchEventRow } from "../merge-persisted-row";
import { isTravelReportCandidate } from "../travel-report/travel-report-logic";
import { computeMonthReadinessScore } from "./month-readiness-score";

export type RowFixKind = "city" | "county" | "zip" | "mileage" | "decision" | "conflict_clear" | "work_hours_clear";

const LOCATION_TYPES = new Set([
  "campaign_event",
  "community_event",
  "fair_festival",
  "county_party_meeting",
  "fundraiser",
  "house_meet_greet",
  "media",
]);

function needsZipCheck(row: WorkbenchEventRow): boolean {
  return LOCATION_TYPES.has(row.classification) && row.rawEventStatus !== "CANCELLED";
}

function rowPoints(row: WorkbenchEventRow): { earned: number; possible: number } {
  if (row.rawEventStatus === "CANCELLED") return { earned: 0, possible: 0 };

  let earned = 0;
  let possible = 0;
  const travel = isTravelReportCandidate(row);

  possible += 18;
  if (row.rawDecision) earned += 18;

  possible += 14;
  if (row.likelyCity?.trim()) earned += 14;

  possible += 14;
  if (row.county?.trim()) earned += 14;

  if (needsZipCheck(row)) {
    possible += 8;
    if (row.factCard.where.zipCode?.trim()) earned += 8;
  }

  if (travel) {
    possible += 16;
    if (row.roundTripMiles != null && row.roundTripMiles > 0) earned += 16;
    possible += 10;
    if (row.reimbursementAmount != null && row.reimbursementAmount > 0) earned += 10;
    else if (row.roundTripMiles != null && row.roundTripMiles > 0) earned += 10;
  }

  possible += 10;
  if (!row.hasConflictWarning || row.rawDecision) earned += 10;

  possible += 10;
  if (!row.hasWorkHoursWarning || row.rawDecision) earned += 10;

  return { earned, possible };
}

function applyFix(row: WorkbenchEventRow, fix: RowFixKind): WorkbenchEventRow {
  const next = {
    ...row,
    factCard: {
      ...row.factCard,
      where: { ...row.factCard.where },
      travel: { ...row.factCard.travel },
    },
  };

  switch (fix) {
    case "city":
      next.likelyCity = next.likelyCity || "Inferred";
      next.factCard.where.city = next.factCard.where.city || "Inferred";
      break;
    case "county":
      next.county = next.county || "Inferred County";
      next.factCard.where.county = next.factCard.where.county || "Inferred County";
      break;
    case "zip":
      next.factCard.where.zipCode = next.factCard.where.zipCode || "00000";
      break;
    case "mileage":
      next.roundTripMiles = next.roundTripMiles ?? 1;
      next.reimbursementAmount = next.reimbursementAmount ?? 0.7;
      next.factCard.travel.roundTripMiles = next.factCard.travel.roundTripMiles ?? 1;
      next.factCard.travel.reimbursementAmount = next.factCard.travel.reimbursementAmount ?? 0.7;
      break;
    case "decision":
      next.rawDecision = next.rawDecision ?? "approved";
      break;
    case "conflict_clear":
    case "work_hours_clear":
      next.rawDecision = next.rawDecision ?? "approved";
      break;
  }
  return next;
}

export function estimateMonthScoreDeltaIfRowFixed(
  rows: WorkbenchEventRow[],
  target: WorkbenchEventRow,
  fix: RowFixKind,
): number {
  const active = rows.filter((r) => r.rawEventStatus !== "CANCELLED");
  let earnedBefore = 0;
  let earnedAfter = 0;
  let possible = 0;

  for (const r of active) {
    const b = rowPoints(r);
    earnedBefore += b.earned;
    possible += b.possible;
    const sim = r.recordId === target.recordId ? applyFix(r, fix) : r;
    const a = rowPoints(sim);
    earnedAfter += a.earned;
  }

  if (possible === 0) return 0;
  return Math.round(((earnedAfter - earnedBefore) / possible) * 1000) / 10;
}

export function estimateQueueScoreImpact(
  rows: WorkbenchEventRow[],
  match: (r: WorkbenchEventRow) => boolean,
  fix: RowFixKind,
): { totalDelta: number; label: string } {
  const matching = rows.filter((r) => r.rawEventStatus !== "CANCELLED" && match(r));
  if (!matching.length) return { totalDelta: 0, label: "No score change" };

  let sum = 0;
  for (const r of matching) sum += estimateMonthScoreDeltaIfRowFixed(rows, r, fix);

  const label =
    matching.length === 1
      ? `~+${sum.toFixed(1)}% month score if fixed`
      : `~+${sum.toFixed(1)}% if all ${matching.length} fixed`;

  return { totalDelta: sum, label };
}

export function countRemainingIssues(stats: {
  missingCity: number;
  missingCounty: number;
  missingZip: number;
  missingMileage: number;
  conflicts: number;
  workHours: number;
  unreviewed: number;
}): number {
  return (
    stats.missingCity +
    stats.missingCounty +
    stats.missingZip +
    stats.missingMileage +
    stats.conflicts +
    stats.workHours +
    stats.unreviewed
  );
}

export function previewReadinessForEvent(
  allRows: WorkbenchEventRow[],
  currentRow: WorkbenchEventRow,
  fix: RowFixKind | null,
): { currentScore: number; projectedScore: number; delta: number } {
  const currentScore = computeMonthReadinessScore(allRows).scorePercent;
  if (!fix) return { currentScore, projectedScore: currentScore, delta: 0 };
  const delta = estimateMonthScoreDeltaIfRowFixed(allRows, currentRow, fix);
  return {
    currentScore,
    projectedScore: Math.min(100, Math.round((currentScore + delta) * 10) / 10),
    delta,
  };
}
