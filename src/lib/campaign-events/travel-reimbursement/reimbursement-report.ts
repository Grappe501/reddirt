import { CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE, REIMBURSEMENT_CANDIDATE_NAME } from "../constants";
import {
  buildTravelLines,
  computeTravelTotals,
  isReimbursementEligible,
  isTravelReportCandidate,
  travelLinesToCsv,
} from "../travel-report/travel-report-logic";
import type { TravelReportLine } from "../travel-report/travel-report-types";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import type { CampaignEventDecision } from "../review-meta";

/** @deprecated Use month status store — kept for report-derived hints only */
export type ReimbursementReportStatus = "draft" | "ready" | "empty";

export type OfficialReimbursementLine = TravelReportLine & {
  purpose: string;
  notes: string;
  zip: string;
};

export type ReimbursementAppendixCategory =
  | "denied"
  | "personal"
  | "duplicate"
  | "hold"
  | "request_info"
  | "pending_approval"
  | "missing_data";

export type ReimbursementExcludedLine = {
  recordId: string;
  dateYmd: string;
  title: string;
  reason: string;
  decisionLabel: string | null;
  category: ReimbursementAppendixCategory;
  miles: number | null;
  reimbursement: number | null;
  city: string;
  county: string;
};

export type OfficialReimbursementReport = {
  month: string;
  monthLabel: string;
  preparedDate: string;
  rate: number;
  candidateName: string;
  /** Derived from row data — month store overrides in UI */
  derivedStatus: ReimbursementReportStatus;
  statusNote: string;
  approvedLines: OfficialReimbursementLine[];
  excludedLines: ReimbursementExcludedLine[];
  totals: {
    approvedEventCount: number;
    totalMiles: number;
    totalReimbursement: number;
    excludedCount: number;
    needsReviewCount: number;
  };
  candidateTravelCandidates: number;
  pendingApprovalCount: number;
  missingCityCountyCount: number;
  missingMileageCount: number;
};

function monthLabelFromPeriod(month: string): string {
  const [y, m] = month.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function isApprovedReimbursableTravel(row: WorkbenchEventRow): boolean {
  if (row.rawDecision !== "approved") return false;
  if (row.roundTripMiles == null || row.roundTripMiles <= 0) return false;
  return true;
}

function classifyExcluded(
  row: WorkbenchEventRow,
  line: TravelReportLine | undefined,
): { reason: string; category: ReimbursementAppendixCategory } {
  const d = row.rawDecision as CampaignEventDecision | null;
  if (d === "personal") return { reason: "Personal — excluded from campaign reimbursement", category: "personal" };
  if (d === "duplicate") return { reason: "Duplicate event — excluded from totals", category: "duplicate" };
  if (d === "denied") return { reason: "Denied by reviewer", category: "denied" };
  if (d === "hold") return { reason: "On hold", category: "hold" };
  if (d === "request_confirmation") return { reason: "Needs more information", category: "request_info" };
  if (!d) return { reason: "Pending travel approval", category: "pending_approval" };
  if (row.roundTripMiles == null || row.roundTripMiles <= 0) {
    return { reason: "Missing mileage or not reimbursable", category: "missing_data" };
  }
  if (!row.likelyCity?.trim() || !row.county?.trim()) {
    return { reason: "Missing city or county", category: "missing_data" };
  }
  return { reason: "Not on official reimbursement request", category: "missing_data" };
}

export function buildOfficialReimbursementReport(rows: WorkbenchEventRow[], month: string): OfficialReimbursementReport {
  const preparedDate = new Date().toISOString().slice(0, 10);
  const allTravel = buildTravelLines(rows);

  const approvedLines: OfficialReimbursementLine[] = allTravel
    .filter((l) => l.rawDecision === "approved" && l.miles != null && l.miles > 0 && isReimbursementEligible(l.row))
    .map((l) => ({
      ...l,
      purpose: l.title,
      notes: [l.row.factCard.travel.mileageSource, l.row.decisionLabel].filter(Boolean).join(" · ") || "",
      zip: l.row.factCard.where.zipCode ?? "",
    }));

  const approvedIds = new Set(approvedLines.map((l) => l.recordId));

  const excluded: ReimbursementExcludedLine[] = rows
    .filter(isTravelReportCandidate)
    .filter((r) => !approvedIds.has(r.recordId))
    .map((r) => {
      const line = allTravel.find((t) => t.recordId === r.recordId);
      const { reason, category } = classifyExcluded(r, line);
      return {
        recordId: r.recordId,
        dateYmd: r.dateYmd,
        title: r.calendar.title,
        reason,
        decisionLabel: r.decisionLabel,
        category,
        miles: line?.miles ?? r.roundTripMiles,
        reimbursement: line?.reimbursement ?? r.reimbursementAmount,
        city: r.likelyCity ?? "",
        county: r.county ?? "",
      };
    });

  let totalMiles = 0;
  let totalReimbursement = 0;
  for (const l of approvedLines) {
    if (l.miles != null) totalMiles += l.miles;
    if (l.reimbursement != null) totalReimbursement += l.reimbursement;
  }

  const pendingApprovalCount = allTravel.filter(
    (l) => !l.rawDecision || l.rawDecision === "hold" || l.rawDecision === "request_confirmation",
  ).length;
  const missingCityCountyCount = allTravel.filter((l) => !l.city?.trim() || !l.county?.trim()).length;
  const missingMileageCount = allTravel.filter((l) => l.miles == null).length;

  let derivedStatus: ReimbursementReportStatus = "draft";
  let statusNote = "Complete travel approvals and mileage before finalizing.";
  if (allTravel.length === 0) {
    derivedStatus = "empty";
    statusNote = "No travel candidates for this month in the ledger.";
  } else if (
    approvedLines.length > 0 &&
    pendingApprovalCount === 0 &&
    missingMileageCount === 0 &&
    missingCityCountyCount === 0
  ) {
    derivedStatus = "ready";
    statusNote = "Approved reimbursable events are complete — ready to print and submit.";
  } else if (pendingApprovalCount > 0 || missingMileageCount > 0 || missingCityCountyCount > 0) {
    statusNote = "Resolve pending approvals, city/county, and mileage before marking ready.";
  }

  return {
    month,
    monthLabel: monthLabelFromPeriod(month),
    preparedDate,
    rate: CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE,
    candidateName: REIMBURSEMENT_CANDIDATE_NAME,
    derivedStatus,
    statusNote,
    approvedLines,
    excludedLines: excluded,
    totals: {
      approvedEventCount: approvedLines.length,
      totalMiles: Math.round(totalMiles * 10) / 10,
      totalReimbursement: Math.round(totalReimbursement * 100) / 100,
      excludedCount: excluded.length,
      needsReviewCount: pendingApprovalCount + missingMileageCount,
    },
    candidateTravelCandidates: rows.filter(isTravelReportCandidate).length,
    pendingApprovalCount,
    missingCityCountyCount,
    missingMileageCount,
  };
}

export function reimbursementReportToCsv(report: OfficialReimbursementReport): string {
  const header =
    "date,event_purpose,city,county,origin,destination,miles,rate_usd,amount_usd,notes";
  const body = report.approvedLines.map((l) => {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      l.dateYmd,
      esc(l.purpose),
      esc(l.city),
      esc(l.county),
      esc(l.origin),
      esc(l.destination),
      l.miles?.toFixed(1) ?? "",
      l.rate.toFixed(2),
      l.reimbursement?.toFixed(2) ?? "",
      esc(l.notes),
    ].join(",");
  });
  return [header, ...body].join("\n");
}

export function reimbursementReportToJson(report: OfficialReimbursementReport): string {
  return JSON.stringify(report, null, 2);
}
