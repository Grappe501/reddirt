import type { WorkbenchEventRow } from "../merge-persisted-row";
import { isTravelReportCandidate } from "../travel-report/travel-report-logic";
import { readinessBandForScore, type ReadinessBand } from "./month-readiness-types";

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

export type MonthReadinessScoreResult = {
  scorePercent: number;
  band: ReadinessBand;
  bandLabel: string;
  eventsScored: number;
  moveToMayRecommended: boolean;
  moveToMayGatePercent: number;
};

export function computeMonthReadinessScore(rows: WorkbenchEventRow[]): MonthReadinessScoreResult {
  const active = rows.filter((r) => r.rawEventStatus !== "CANCELLED");
  let earned = 0;
  let possible = 0;

  for (const row of active) {
    const p = rowPoints(row);
    earned += p.earned;
    possible += p.possible;
  }

  const scorePercent = possible > 0 ? Math.round((earned / possible) * 1000) / 10 : 0;
  const band = readinessBandForScore(scorePercent);
  const moveToMayGatePercent = 80;

  return {
    scorePercent,
    band,
    bandLabel: {
      not_ready: "Not ready",
      in_progress: "In progress",
      nearly_ready: "Nearly ready",
      ready: "Ready for month close",
    }[band],
    eventsScored: active.length,
    moveToMayRecommended: scorePercent >= moveToMayGatePercent,
    moveToMayGatePercent,
  };
}
