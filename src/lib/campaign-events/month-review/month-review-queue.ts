import { getRegistryCountyBySlug, regionLabelForId } from "@/lib/county/arkansas-county-registry";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import { filterRowsByDateRange } from "../travel-reimbursement/travel-log-logic";
import { isTravelReportCandidate } from "../travel-report/travel-report-logic";
import type { MonthReviewFocus } from "../month-readiness/month-readiness-types";
import type { MonthReviewMode } from "./month-review-types";

function needsTravelApproval(row: WorkbenchEventRow): boolean {
  if (!isTravelReportCandidate(row)) return false;
  return !row.rawDecision || row.rawDecision === "hold" || row.rawDecision === "request_confirmation";
}

function regionKeyForRow(row: WorkbenchEventRow): string {
  const reg = resolveRegistryCountyFromLabel(row.county);
  return reg ? regionLabelForId(reg.regionId) : "Unknown region";
}

function countyKeyForRow(row: WorkbenchEventRow): string {
  return row.county?.trim() || "No county";
}

function applyFocusFilter(list: WorkbenchEventRow[], focus: MonthReviewFocus | null | undefined): WorkbenchEventRow[] {
  if (!focus) return list;
  switch (focus) {
    case "missing_city":
      return list.filter((r) => !r.likelyCity?.trim());
    case "missing_county":
      return list.filter((r) => !r.county?.trim());
    case "missing_zip":
      return list.filter((r) => !r.factCard.where.zipCode?.trim());
    case "missing_mileage":
      return list.filter((r) => isTravelReportCandidate(r) && r.roundTripMiles == null);
    default:
      return list;
  }
}

export function buildMonthReviewQueue(
  rows: WorkbenchEventRow[],
  mode: MonthReviewMode,
  focus?: MonthReviewFocus | null,
  dateRange?: { start?: string | null; end?: string | null },
): WorkbenchEventRow[] {
  let list = filterRowsByDateRange(rows, dateRange?.start, dateRange?.end);

  switch (mode) {
    case "needs_info":
      list = list.filter(
        (r) =>
          r.persistedMissingCount > 2 ||
          r.rawReviewStatus === "NEEDS_INFO" ||
          !r.likelyCity ||
          !r.county ||
          !r.factCard.where.zipCode?.trim(),
      );
      break;
    case "work_hours":
      list = list.filter((r) => r.hasWorkHoursWarning);
      break;
    case "conflicts":
      list = list.filter((r) => r.hasConflictWarning);
      break;
    case "reimbursable":
      list = list.filter((r) => r.roundTripMiles != null && r.roundTripMiles > 0);
      break;
    case "tentative_only":
      list = list.filter((r) => r.rawEventStatus === "TENTATIVE");
      break;
    case "unreviewed_only":
      list = list.filter((r) => !r.rawDecision);
      break;
    case "travel_needs_approval":
      list = list.filter((r) => needsTravelApproval(r));
      break;
    case "approved_travel":
      list = list.filter((r) => isTravelReportCandidate(r) && r.rawDecision === "approved");
      break;
    case "denied_travel":
      list = list.filter((r) => isTravelReportCandidate(r) && r.rawDecision === "denied");
      break;
    case "website_intake_only":
      list = list.filter((r) => r.isWebsiteIntake);
      break;
    case "needs_intake_review":
      list = list.filter((r) => r.intakeNeedsReview);
      break;
    case "duplicate_risk":
      list = list.filter((r) => r.duplicateRisk);
      break;
    case "intake_conflict":
      list = list.filter((r) => r.intakeScheduleConflict);
      break;
    default:
      break;
  }

  list = applyFocusFilter(list, focus);

  switch (mode) {
    case "type":
      list.sort((a, b) => a.classificationLabel.localeCompare(b.classificationLabel) || a.startAtMs - b.startAtMs);
      break;
    case "county":
      list.sort((a, b) => countyKeyForRow(a).localeCompare(countyKeyForRow(b)) || a.startAtMs - b.startAtMs);
      break;
    case "region":
      list.sort((a, b) => regionKeyForRow(a).localeCompare(regionKeyForRow(b)) || a.startAtMs - b.startAtMs);
      break;
    case "status":
      list.sort(
        (a, b) =>
          (a.rawReviewStatus + a.rawEventStatus).localeCompare(b.rawReviewStatus + b.rawEventStatus) ||
          a.startAtMs - b.startAtMs,
      );
      break;
    case "chronological":
    default:
      list.sort((a, b) => a.startAtMs - b.startAtMs || a.calendar.title.localeCompare(b.calendar.title));
      break;
  }

  return list;
}

export function regionReviewAvailable(): boolean {
  return getRegistryCountyBySlug("pulaski") != null;
}
