import type { WorkbenchEventRow } from "../merge-persisted-row";

export type TravelReportFilter = "all" | "approved_only" | "needs_travel_info" | "reimbursable_only";

export type TravelReportLine = {
  recordId: string;
  dateYmd: string;
  timeLabel: string;
  title: string;
  city: string;
  county: string;
  origin: string;
  destination: string;
  miles: number | null;
  rate: number;
  reimbursement: number | null;
  reviewStatus: string;
  decisionLabel: string | null;
  rawDecision: string | null;
  workHoursWarning: boolean;
  lrOriginNote: boolean;
  row: WorkbenchEventRow;
};

export type TravelReportTotals = {
  lineCount: number;
  totalMiles: number;
  totalReimbursement: number;
  approvedMiles: number;
  approvedReimbursement: number;
  needsReviewCount: number;
  missingCity: number;
  missingCounty: number;
  missingMileage: number;
  unapprovedReimbursementCount: number;
  workHoursWarnings: number;
  lrOriginEvents: number;
};

export type TravelReportSummary = {
  monthLabel: string;
  narrative: string;
  bullets: string[];
  totals: TravelReportTotals;
};
