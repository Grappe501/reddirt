import { isTravelReportCandidate } from "../travel-report/travel-report-logic";
import type { WorkbenchEventRow } from "../merge-persisted-row";

export type TravelQueueVerification = {
  month: string;
  totalTravelCandidates: number;
  needsApproval: number;
  approved: number;
  denied: number;
  hold: number;
  requestInfo: number;
  personal: number;
  duplicate: number;
  missingCityCounty: number;
  missingMileage: number;
  includedInReimbursement: number;
  excludedAppendix: number;
  unreviewedTravel: number;
};

function isNeedsApproval(row: WorkbenchEventRow): boolean {
  return (
    !row.rawDecision ||
    row.rawDecision === "hold" ||
    row.rawDecision === "request_confirmation"
  );
}

function isApprovedForReimbursement(row: WorkbenchEventRow): boolean {
  return (
    row.rawDecision === "approved" &&
    row.roundTripMiles != null &&
    row.roundTripMiles > 0 &&
    Boolean(row.likelyCity?.trim()) &&
    Boolean(row.county?.trim())
  );
}

export function verifyTravelReimbursementQueues(
  rows: WorkbenchEventRow[],
  month: string,
): TravelQueueVerification {
  const travel = rows.filter(isTravelReportCandidate);
  let needsApproval = 0;
  let approved = 0;
  let denied = 0;
  let hold = 0;
  let requestInfo = 0;
  let personal = 0;
  let duplicate = 0;
  let missingCityCounty = 0;
  let missingMileage = 0;
  let includedInReimbursement = 0;
  let excludedAppendix = 0;
  let unreviewedTravel = 0;

  for (const row of travel) {
    if (!row.rawDecision) unreviewedTravel++;
    if (isNeedsApproval(row)) needsApproval++;
    if (row.rawDecision === "approved") approved++;
    if (row.rawDecision === "denied") denied++;
    if (row.rawDecision === "hold") hold++;
    if (row.rawDecision === "request_confirmation") requestInfo++;
    if (row.rawDecision === "personal") personal++;
    if (row.rawDecision === "duplicate") duplicate++;
    if (!row.likelyCity?.trim() || !row.county?.trim()) missingCityCounty++;
    if (row.roundTripMiles == null) missingMileage++;

    if (isApprovedForReimbursement(row)) includedInReimbursement++;
    else if (isTravelReportCandidate(row)) excludedAppendix++;
  }

  return {
    month,
    totalTravelCandidates: travel.length,
    needsApproval,
    approved,
    denied,
    hold,
    requestInfo,
    personal,
    duplicate,
    missingCityCounty,
    missingMileage,
    includedInReimbursement,
    excludedAppendix,
    unreviewedTravel,
  };
}
