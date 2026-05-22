import type { MonthReviewStats } from "../month-review/month-review-stats";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import { isTravelReportCandidate } from "../travel-report/travel-report-logic";
import { buildReviewQueueHref } from "./month-readiness-types";
import { estimateQueueScoreImpact } from "./month-readiness-score-delta";

export type MonthQuickAction = {
  id: string;
  title: string;
  count: number;
  href: string;
  impactLabel: string;
  description: string;
};

export function buildMonthQuickActions(period: string, rows: WorkbenchEventRow[], stats: MonthReviewStats): MonthQuickAction[] {
  const active = rows.filter((r) => r.rawEventStatus !== "CANCELLED");
  const missingMileageTravel = active.filter(
    (r) => isTravelReportCandidate(r) && r.roundTripMiles == null,
  ).length;

  const autostart = (href: string) => `${href}&autostart=1`;

  return [
    {
      id: "missing_city",
      title: "Fill missing cities",
      count: stats.missingCity,
      href: autostart(buildReviewQueueHref(period, "needs_info", "missing_city")),
      impactLabel: estimateQueueScoreImpact(rows, (r) => !r.likelyCity?.trim(), "city").label,
      description: "Infer from title, location, notes, and prior events — accept or edit per event.",
    },
    {
      id: "missing_county",
      title: "Fill missing counties",
      count: stats.missingCounty,
      href: autostart(buildReviewQueueHref(period, "needs_info", "missing_county")),
      impactLabel: estimateQueueScoreImpact(rows, (r) => !r.county?.trim(), "county").label,
      description: "County registry + city alias memory — one-click accept in review.",
    },
    {
      id: "missing_zip",
      title: "Fill missing ZIPs",
      count: stats.missingZip,
      href: autostart(buildReviewQueueHref(period, "needs_info", "missing_zip")),
      impactLabel: estimateQueueScoreImpact(rows, (r) => !r.factCard.where.zipCode?.trim(), "zip").label,
      description: "Physical events — full address preferred; city-level OK for travel estimate.",
    },
    {
      id: "travel_approval",
      title: "Approve travel for reimbursement",
      count: active.filter(
        (r) =>
          isTravelReportCandidate(r) &&
          (!r.rawDecision || r.rawDecision === "hold" || r.rawDecision === "request_confirmation"),
      ).length,
      href: autostart(buildReviewQueueHref(period, "travel_needs_approval")),
      impactLabel: "Clears travel approval queue",
      description: "One event at a time — approve, deny, hold, or request more information.",
    },
    {
      id: "missing_mileage",
      title: "Resolve missing mileage",
      count: missingMileageTravel,
      href: autostart(buildReviewQueueHref(period, "reimbursable", "missing_mileage")),
      impactLabel: estimateQueueScoreImpact(
        rows,
        (r) => isTravelReportCandidate(r) && r.roundTripMiles == null,
        "mileage",
      ).label,
      description: "Rose Bud / Tue–Fri Little Rock origin rules · accept estimate then Save & recalculate.",
    },
    {
      id: "conflicts",
      title: "Resolve conflicts",
      count: stats.conflicts,
      href: autostart(buildReviewQueueHref(period, "conflicts")),
      impactLabel: estimateQueueScoreImpact(rows, (r) => r.hasConflictWarning, "conflict_clear").label,
      description: "Review overlap flags — approve/hold/deny records a decision (clears score when decided).",
    },
    {
      id: "work_hours",
      title: "Review work-hours warnings",
      count: stats.workHours,
      href: autostart(buildReviewQueueHref(period, "work_hours")),
      impactLabel: estimateQueueScoreImpact(rows, (r) => r.hasWorkHoursWarning, "work_hours_clear").label,
      description: "Mon–Fri employer window — confirm or hold each event.",
    },
    {
      id: "unreviewed",
      title: "Approve / deny / hold remaining",
      count: stats.unreviewed,
      href: autostart(buildReviewQueueHref(period, "unreviewed_only")),
      impactLabel: estimateQueueScoreImpact(rows, (r) => !r.rawDecision, "decision").label,
      description: "Final pass — one event at a time with full approval control.",
    },
  ];
}
