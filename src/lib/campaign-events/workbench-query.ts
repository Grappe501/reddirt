import type { WorkbenchEventRow } from "./merge-persisted-row";

export type WorkbenchSortKey =
  | "date_asc"
  | "date_desc"
  | "missing_desc"
  | "event_type"
  | "city"
  | "review_status"
  | "reimbursement_desc";

export type WorkbenchFilters = {
  dateFrom: string;
  dateTo: string;
  eventType: string;
  eventStatus: string;
  reviewStatus: string;
  decision: string;
  city: string;
  county: string;
  workHoursOnly: boolean;
  conflictOnly: boolean;
  missingOnly: boolean;
  reimbursableOnly: boolean;
  websiteIntakeOnly: boolean;
  tentativeOnly: boolean;
  needsIntakeReviewOnly: boolean;
  duplicateRiskOnly: boolean;
  intakeConflictOnly: boolean;
};

export const DEFAULT_WORKBENCH_FILTERS: WorkbenchFilters = {
  dateFrom: "",
  dateTo: "",
  eventType: "",
  eventStatus: "",
  reviewStatus: "",
  decision: "",
  city: "",
  county: "",
  workHoursOnly: false,
  conflictOnly: false,
  missingOnly: false,
  reimbursableOnly: false,
  websiteIntakeOnly: false,
  tentativeOnly: false,
  needsIntakeReviewOnly: false,
  duplicateRiskOnly: false,
  intakeConflictOnly: false,
};

export function filterWorkbenchRows(rows: WorkbenchEventRow[], filters: WorkbenchFilters): WorkbenchEventRow[] {
  return rows.filter((row) => {
    if (filters.dateFrom && row.dateYmd < filters.dateFrom) return false;
    if (filters.dateTo && row.dateYmd > filters.dateTo) return false;
    if (filters.eventType && row.classificationLabel !== filters.eventType) return false;
    if (filters.eventStatus && row.rawEventStatus !== filters.eventStatus) return false;
    if (filters.reviewStatus && row.rawReviewStatus !== filters.reviewStatus) return false;
    if (filters.decision === "none" && row.rawDecision) return false;
    if (filters.decision && filters.decision !== "none" && row.rawDecision !== filters.decision) return false;
    if (filters.city && !(row.likelyCity ?? "").toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.county && !(row.county ?? "").toLowerCase().includes(filters.county.toLowerCase())) return false;
    if (filters.workHoursOnly && !row.hasWorkHoursWarning) return false;
    if (filters.conflictOnly && !row.hasConflictWarning) return false;
    if (filters.missingOnly && row.persistedMissingCount === 0) return false;
    if (filters.reimbursableOnly && (row.roundTripMiles == null || row.roundTripMiles <= 0)) return false;
    if (filters.websiteIntakeOnly && !row.isWebsiteIntake) return false;
    if (filters.tentativeOnly && row.rawEventStatus !== "TENTATIVE") return false;
    if (filters.needsIntakeReviewOnly && !row.intakeNeedsReview) return false;
    if (filters.duplicateRiskOnly && !row.duplicateRisk) return false;
    if (filters.intakeConflictOnly && !row.intakeScheduleConflict) return false;
    return true;
  });
}

export function sortWorkbenchRows(rows: WorkbenchEventRow[], sortKey: WorkbenchSortKey): WorkbenchEventRow[] {
  const copy = [...rows];
  switch (sortKey) {
    case "date_desc":
      return copy.sort((a, b) => b.startAtMs - a.startAtMs);
    case "missing_desc":
      return copy.sort((a, b) => b.persistedMissingCount - a.persistedMissingCount || a.startAtMs - b.startAtMs);
    case "event_type":
      return copy.sort((a, b) => a.classificationLabel.localeCompare(b.classificationLabel) || a.startAtMs - b.startAtMs);
    case "city":
      return copy.sort((a, b) => (a.likelyCity ?? "").localeCompare(b.likelyCity ?? "") || a.startAtMs - b.startAtMs);
    case "review_status":
      return copy.sort((a, b) => a.rawReviewStatus.localeCompare(b.rawReviewStatus) || a.startAtMs - b.startAtMs);
    case "reimbursement_desc":
      return copy.sort((a, b) => (b.reimbursementAmount ?? 0) - (a.reimbursementAmount ?? 0));
    case "date_asc":
    default:
      return copy.sort((a, b) => a.startAtMs - b.startAtMs);
  }
}

export function collectFilterOptions(rows: WorkbenchEventRow[]) {
  const uniq = (values: string[]) => [...new Set(values.filter(Boolean))].sort();
  return {
    eventTypes: uniq(rows.map((r) => r.classificationLabel)),
    eventStatuses: uniq(rows.map((r) => r.rawEventStatus)),
    reviewStatuses: uniq(rows.map((r) => r.rawReviewStatus)),
    decisions: uniq(rows.map((r) => r.rawDecision ?? "none")),
    cities: uniq(rows.map((r) => r.likelyCity ?? "")),
    counties: uniq(rows.map((r) => r.county ?? "")),
  };
}
