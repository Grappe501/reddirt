import type { WorkbenchEventRow } from "../merge-persisted-row";

export type MonthReviewStats = {
  total: number;
  unreviewed: number;
  approved: number;
  denied: number;
  hold: number;
  needsInfo: number;
  missingCity: number;
  missingCounty: number;
  missingZip: number;
  missingMileage: number;
  conflicts: number;
  workHours: number;
};

export function computeMonthReviewStats(rows: WorkbenchEventRow[]): MonthReviewStats {
  let unreviewed = 0;
  let approved = 0;
  let denied = 0;
  let hold = 0;
  let needsInfo = 0;
  let missingCity = 0;
  let missingCounty = 0;
  let missingZip = 0;
  let missingMileage = 0;
  let conflicts = 0;
  let workHours = 0;

  for (const r of rows) {
    const d = r.rawDecision;
    if (!d) unreviewed++;
    else if (d === "approved") approved++;
    else if (d === "denied" || d === "personal") denied++;
    else if (d === "hold" || d === "request_confirmation") hold++;

    if (r.rawReviewStatus === "NEEDS_INFO" || r.requestInfoStatus === "draft_ready") needsInfo++;
    if (!r.likelyCity?.trim()) missingCity++;
    if (!r.county?.trim()) missingCounty++;
    if (!r.factCard.where.zipCode?.trim()) missingZip++;
    if (r.roundTripMiles == null) missingMileage++;
    if (r.hasConflictWarning) conflicts++;
    if (r.hasWorkHoursWarning) workHours++;
  }

  return {
    total: rows.length,
    unreviewed,
    approved,
    denied,
    hold,
    needsInfo,
    missingCity,
    missingCounty,
    missingZip,
    missingMileage,
    conflicts,
    workHours,
  };
}
