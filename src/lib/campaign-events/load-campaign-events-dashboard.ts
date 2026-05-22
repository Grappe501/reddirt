import { formatInTimeZone } from "date-fns-tz";
import { MARCH_2026_LEDGER_PERIOD } from "./constants";
import { loadCampaignEventsWorkbench } from "./load-workbench-events";
import { summarizeCalendarSyncForPeriod } from "./calendar-sync/load-calendar-sync-dashboard";
import type { WorkbenchEventRow } from "./merge-persisted-row";
import { buildTravelLines, computeTravelTotals } from "./travel-report/travel-report-logic";
import type { TravelReportTotals } from "./travel-report/travel-report-types";

const TZ = "America/Chicago";

export type DashboardUpcomingEvent = {
  recordId: string;
  dateYmd: string;
  timeLabel: string;
  title: string;
  city: string;
  county: string;
  status: string;
  reviewStatus: string;
  decisionLabel: string | null;
};

export type ApprovalInboxPackageStatus = "not_sent" | "drafted" | "skipped_disabled" | "sent" | "failed";

export type ApprovalInboxItem = {
  recordId: string;
  title: string;
  dateYmd: string;
  timeLabel: string;
  status: string;
  reviewStatus: string;
  packagePreviewUrl: string;
  packageStatus: ApprovalInboxPackageStatus;
  lastSentAt: string | null;
  awaitingCandidate: boolean;
  emailSubject: string | null;
};

export type CampaignEventsDashboardSnapshot = {
  period: string;
  todayYmd: string;
  totalEvents: number;
  pendingApprovals: number;
  needsReview: number;
  holds: number;
  denials: number;
  approved: number;
  requestInfo: number;
  travel: TravelReportTotals;
  conflicts: number;
  workHoursWarnings: number;
  missingCity: number;
  missingCounty: number;
  missingZip: number;
  tentativeCount: number;
  officialCount: number;
  upcoming: DashboardUpcomingEvent[];
  approvalInbox: ApprovalInboxItem[];
  actionItems: {
    approveDenyHold: number;
    missingInfo: number;
    travelReview: number;
    hotWashPending: number;
  };
  websiteIntakeCount: number;
  tentativeWebsiteCount: number;
  duplicateRiskCount: number;
  intakeConflictCount: number;
  needsIntakeReviewCount: number;
  promotionReadyTentative: number;
  promotionReadyOfficial: number;
  promotionFailed: number;
  promotionBlocked: number;
  /** True when travel/mileage rows need operator review (alias for actionItems.travelReview > 0). */
  needsMileageReview: boolean;
  calendarSync?: Awaited<ReturnType<typeof summarizeCalendarSyncForPeriod>>;
};

function todayYmdChicago(): string {
  return formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function isPendingApproval(row: WorkbenchEventRow): boolean {
  if (row.rawEventStatus === "CANCELLED") return false;
  return !row.rawDecision || row.rawDecision === "hold" || row.rawDecision === "request_confirmation";
}

function needsTravelReview(row: WorkbenchEventRow): boolean {
  if (!row.likelyCity?.trim() || !row.county?.trim() || row.roundTripMiles == null) return true;
  return false;
}

export function buildCampaignEventsDashboardSnapshot(
  rows: WorkbenchEventRow[],
  period: string,
  todayYmd = todayYmdChicago(),
): CampaignEventsDashboardSnapshot {
  const travelLines = buildTravelLines(rows);
  const travel = computeTravelTotals(travelLines);
  const horizonEnd = addDaysYmd(todayYmd, 14);

  let pendingApprovals = 0;
  let needsReview = 0;
  let holds = 0;
  let denials = 0;
  let approved = 0;
  let requestInfo = 0;
  let conflicts = 0;
  let workHoursWarnings = 0;
  let missingCity = 0;
  let missingCounty = 0;
  let missingZip = 0;
  let tentativeCount = 0;
  let officialCount = 0;
  let missingInfo = 0;
  let travelReview = 0;
  let hotWashPending = 0;
  let websiteIntakeCount = 0;
  let tentativeWebsiteCount = 0;
  let duplicateRiskCount = 0;
  let intakeConflictCount = 0;
  let needsIntakeReviewCount = 0;
  let promotionReadyTentative = 0;
  let promotionReadyOfficial = 0;
  let promotionFailed = 0;
  let promotionBlocked = 0;

  const approvalInbox: ApprovalInboxItem[] = [];

  for (const row of rows) {
    if (row.rawEventStatus === "CANCELLED") continue;

    if (isPendingApproval(row)) pendingApprovals++;
    if (!row.rawDecision) needsReview++;
    if (row.rawDecision === "hold") holds++;
    if (row.rawDecision === "denied") denials++;
    if (row.rawDecision === "approved") approved++;
    if (row.rawDecision === "request_confirmation" || row.requestInfoStatus) requestInfo++;

    if (row.hasConflictWarning) conflicts++;
    if (row.hasWorkHoursWarning) workHoursWarnings++;
    if (!row.likelyCity?.trim()) missingCity++;
    if (!row.county?.trim()) missingCounty++;
    if (!row.factCard.where.zipCode?.trim()) missingZip++;

    if (row.rawEventStatus === "TENTATIVE") tentativeCount++;
    if (row.calendarLanes.targetLane === "official" || row.rawEventStatus === "CONFIRMED" || row.rawEventStatus === "COMPLETED") {
      officialCount++;
    }

    if (row.persistedMissingCount > 0 || row.requestInfoStatus) missingInfo++;
    if (needsTravelReview(row)) travelReview++;

    if (row.rawDecision === "approved" && row.dateYmd < todayYmd) hotWashPending++;

    if (row.isWebsiteIntake) {
      websiteIntakeCount++;
      if (row.rawEventStatus === "TENTATIVE") tentativeWebsiteCount++;
      if (row.duplicateRisk) duplicateRiskCount++;
      if (row.intakeScheduleConflict) intakeConflictCount++;
      if (row.intakeNeedsReview) needsIntakeReviewCount++;
    }

    if (row.promotionStatus === "READY_FOR_TENTATIVE_PROMOTION") promotionReadyTentative++;
    if (row.promotionStatus === "READY_FOR_OFFICIAL_PROMOTION") promotionReadyOfficial++;
    if (row.promotionStatus === "PROMOTION_FAILED") promotionFailed++;
    if (row.promotionStatus === "PROMOTION_BLOCKED" || row.promotionStatus === "PROMOTION_CONFLICT") promotionBlocked++;

    if (isPendingApproval(row) || row.rawEventStatus === "TENTATIVE") {
      const lastLog = row.approvalEmailLastLog;
      const packageStatus: ApprovalInboxPackageStatus = lastLog?.status ?? "not_sent";
      approvalInbox.push({
        recordId: row.recordId,
        title: row.calendar.title,
        dateYmd: row.dateYmd,
        timeLabel: row.timeLabel,
        status: row.eventStatus,
        reviewStatus: row.reviewStatus,
        packagePreviewUrl: `/admin/campaign-calendar/approval-package/${row.recordId}`,
        packageStatus,
        lastSentAt: lastLog?.sentAt ?? null,
        awaitingCandidate: isPendingApproval(row) && packageStatus !== "sent",
        emailSubject: lastLog?.subject ?? null,
      });
    }
  }

  approvalInbox.sort((a, b) => a.dateYmd.localeCompare(b.dateYmd) || a.timeLabel.localeCompare(b.timeLabel));

  const upcoming: DashboardUpcomingEvent[] = rows
    .filter((r) => r.rawEventStatus !== "CANCELLED" && r.dateYmd >= todayYmd && r.dateYmd <= horizonEnd)
    .sort((a, b) => a.startAtMs - b.startAtMs)
    .slice(0, 20)
    .map((r) => ({
      recordId: r.recordId,
      dateYmd: r.dateYmd,
      timeLabel: r.timeLabel,
      title: r.calendar.title,
      city: r.likelyCity ?? "",
      county: r.county ?? "",
      status: r.eventStatus,
      reviewStatus: r.reviewStatus,
      decisionLabel: r.decisionLabel,
    }));

  return {
    period,
    todayYmd,
    totalEvents: rows.filter((r) => r.rawEventStatus !== "CANCELLED").length,
    pendingApprovals,
    needsReview,
    holds,
    denials,
    approved,
    requestInfo,
    travel,
    conflicts,
    workHoursWarnings,
    missingCity,
    missingCounty,
    missingZip,
    tentativeCount,
    officialCount,
    upcoming,
    approvalInbox: approvalInbox.slice(0, 12),
    actionItems: {
      approveDenyHold: pendingApprovals,
      missingInfo,
      travelReview,
      hotWashPending,
    },
    websiteIntakeCount,
    tentativeWebsiteCount,
    duplicateRiskCount,
    intakeConflictCount,
    needsIntakeReviewCount,
    promotionReadyTentative,
    promotionReadyOfficial,
    promotionFailed,
    promotionBlocked,
    needsMileageReview: travelReview > 0,
  };
}

export async function loadCampaignEventsDashboard(period: string = MARCH_2026_LEDGER_PERIOD) {
  const { rows, period: loadedPeriod } = await loadCampaignEventsWorkbench({ period });
  const calendarSync = await summarizeCalendarSyncForPeriod(loadedPeriod);
  const snapshot = { ...buildCampaignEventsDashboardSnapshot(rows, loadedPeriod), calendarSync };
  return { snapshot, rows };
}
