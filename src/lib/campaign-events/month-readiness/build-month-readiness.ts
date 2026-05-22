import { computeMonthReviewStats, type MonthReviewStats } from "../month-review/month-review-stats";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import { buildTravelLines, computeTravelTotals } from "../travel-report/travel-report-logic";
import { findDuplicateCalendarIdsForPeriod, type PeriodDuplicateReport } from "./month-readiness-duplicates";
import { computeMonthReadinessScore, type MonthReadinessScoreResult } from "./month-readiness-score";
import {
  buildReviewQueueHref,
  type MonthReadinessQueueLink,
} from "./month-readiness-types";

export type MonthReadinessSnapshot = {
  period: string;
  monthLabel: string;
  stats: MonthReviewStats;
  score: MonthReadinessScoreResult;
  duplicates: PeriodDuplicateReport;
  travel: ReturnType<typeof computeTravelTotals>;
  travelLineCount: number;
  unreviewed: number;
  pendingApprovalPackages: number;
  unapprovedReimbursement: number;
  queues: {
    location: MonthReadinessQueueLink[];
    travel: MonthReadinessQueueLink[];
    decisions: MonthReadinessQueueLink[];
    warnings: MonthReadinessQueueLink[];
    other: MonthReadinessQueueLink[];
  };
  completionChecklist: Array<{ id: string; label: string; done: boolean; detail: string }>;
};

export async function buildMonthReadinessSnapshot(
  rows: WorkbenchEventRow[],
  period: string,
): Promise<MonthReadinessSnapshot> {
  const [y, m] = period.split("-");
  const monthLabel = new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const stats = computeMonthReviewStats(rows);
  const score = computeMonthReadinessScore(rows);
  const duplicates = await findDuplicateCalendarIdsForPeriod(period);
  const travelLines = buildTravelLines(rows);
  const travel = computeTravelTotals(travelLines);

  const active = rows.filter((r) => r.rawEventStatus !== "CANCELLED");
  const unreviewed = active.filter((r) => !r.rawDecision).length;
  const pendingApprovalPackages = active.filter(
    (r) => !r.rawDecision || r.rawEventStatus === "TENTATIVE",
  ).length;
  const unapprovedReimbursement = active.filter(
    (r) => r.reimbursementAmount != null && r.reimbursementAmount > 0 && r.rawDecision !== "approved",
  ).length;

  const missingMileageTravel = active.filter(
    (r) => travelLines.some((l) => l.recordId === r.recordId) && r.roundTripMiles == null,
  ).length;

  const location: MonthReadinessQueueLink[] = [
    {
      id: "missing_city",
      label: "Missing city",
      count: stats.missingCity,
      href: buildReviewQueueHref(period, "needs_info", "missing_city"),
    },
    {
      id: "missing_county",
      label: "Missing county",
      count: stats.missingCounty,
      href: buildReviewQueueHref(period, "needs_info", "missing_county"),
    },
    {
      id: "missing_zip",
      label: "Missing ZIP",
      count: stats.missingZip,
      href: buildReviewQueueHref(period, "needs_info", "missing_zip"),
    },
  ];

  const travelQueues: MonthReadinessQueueLink[] = [
    {
      id: "missing_mileage",
      label: "Missing mileage (travel events)",
      count: missingMileageTravel,
      href: buildReviewQueueHref(period, "reimbursable", "missing_mileage"),
      hint: "Reimbursable queue + mileage focus",
    },
    {
      id: "travel_report",
      label: "Open travel report",
      count: travel.lineCount,
      href: `/admin/campaign-events/travel-report?month=${period}`,
      hint: "Chronological travel lines + CSV",
    },
  ];

  const decisions: MonthReadinessQueueLink[] = [
    {
      id: "unreviewed",
      label: "Unreviewed events",
      count: stats.unreviewed,
      href: buildReviewQueueHref(period, "unreviewed_only"),
    },
    {
      id: "needs_info",
      label: "Needs information (broad)",
      count: stats.needsInfo,
      href: buildReviewQueueHref(period, "needs_info"),
    },
    {
      id: "tentative",
      label: "Tentative only",
      count: active.filter((r) => r.rawEventStatus === "TENTATIVE").length,
      href: buildReviewQueueHref(period, "tentative_only"),
    },
  ];

  const warnings: MonthReadinessQueueLink[] = [
    {
      id: "conflicts",
      label: "Schedule conflicts",
      count: stats.conflicts,
      href: buildReviewQueueHref(period, "conflicts"),
    },
    {
      id: "work_hours",
      label: "Work-hours warnings",
      count: stats.workHours,
      href: buildReviewQueueHref(period, "work_hours"),
    },
  ];

  const other: MonthReadinessQueueLink[] = [
    {
      id: "reimbursable",
      label: "Has mileage (reimbursable queue)",
      count: active.filter((r) => r.roundTripMiles != null && r.roundTripMiles > 0).length,
      href: buildReviewQueueHref(period, "reimbursable"),
    },
    {
      id: "workbench",
      label: "Full workbench",
      count: stats.total,
      href: `/admin/campaign-events/workbench?month=${period}`,
    },
  ];

  const completionChecklist = [
    {
      id: "decisions",
      label: "All events reviewed (approve/deny/hold)",
      done: stats.unreviewed === 0,
      detail: `${stats.unreviewed} unreviewed · ${stats.approved} approved · ${stats.denied} denied · ${stats.hold} hold`,
    },
    {
      id: "location",
      label: "City and county filled for operational events",
      done: stats.missingCity === 0 && stats.missingCounty === 0,
      detail: `${stats.missingCity} missing city · ${stats.missingCounty} missing county · ${stats.missingZip} missing ZIP`,
    },
    {
      id: "mileage",
      label: "Mileage on travel events",
      done: missingMileageTravel === 0,
      detail: `${missingMileageTravel} travel events still need mileage`,
    },
    {
      id: "warnings",
      label: "Conflicts and work-hours acknowledged (decision recorded)",
      done: stats.conflicts === 0 && stats.workHours === 0,
      detail: `${stats.conflicts} with conflicts · ${stats.workHours} work-hours warnings (cleared when decided)`,
    },
    {
      id: "reimbursement",
      label: "Reimbursement rows approved where applicable",
      done: unapprovedReimbursement === 0,
      detail: `${unapprovedReimbursement} with reimbursement not approved`,
    },
    {
      id: "score",
      label: `Readiness score ≥ ${score.moveToMayGatePercent}% for May handoff`,
      done: score.moveToMayRecommended,
      detail: `Current ${score.scorePercent}% — ${score.bandLabel}`,
    },
  ];

  return {
    period,
    monthLabel,
    stats,
    score,
    duplicates,
    travel,
    travelLineCount: travel.lineCount,
    unreviewed,
    pendingApprovalPackages,
    unapprovedReimbursement,
    queues: { location, travel: travelQueues, decisions, warnings, other },
    completionChecklist,
  };
}
