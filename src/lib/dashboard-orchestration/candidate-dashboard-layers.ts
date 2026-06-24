import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";

export type CandidateDashboardLayerId = "decisions" | "schedule" | "travel" | "finance" | "reports";

export type CandidateDashboardLayer = {
  id: CandidateDashboardLayerId;
  label: string;
  description: string;
  badge: number;
  badgeHint: string;
  href: string;
  primaryAction: { label: string; href: string } | null;
};

export function candidateDashboardLayerHref(layer: CandidateDashboardLayerId, month: string): string {
  return `/admin/candidate-dashboard?month=${month}&layer=${layer}`;
}

export function buildCandidateDashboardLayers(
  snapshot: CampaignEventsDashboardSnapshot,
): CandidateDashboardLayer[] {
  const { period } = snapshot;
  const reviewHref = `/admin/campaign-events/review?month=${period}&mode=chronological`;
  const travelHref = `/admin/campaign-events/travel-report?month=${period}`;

  const decisionCount =
    snapshot.pendingApprovals +
    snapshot.actionItems.approveDenyHold +
    snapshot.approvalInbox.filter((i) => i.awaitingCandidate).length;

  const travelCount =
    snapshot.actionItems.travelReview +
    snapshot.travel.needsReviewCount +
    snapshot.travel.missingMileage;

  return [
    {
      id: "decisions",
      label: "Decisions & approvals",
      description: "Events waiting on approve, deny, or hold — your call only.",
      badge: decisionCount,
      badgeHint: decisionCount === 1 ? "needs you" : "need you",
      href: candidateDashboardLayerHref("decisions", period),
      primaryAction:
        decisionCount > 0
          ? { label: "Open month review", href: reviewHref }
          : { label: "Review calendar", href: reviewHref },
    },
    {
      id: "schedule",
      label: "Schedule",
      description: "What's next on the calendar — stops, times, and locations.",
      badge: snapshot.upcoming.length,
      badgeHint: "next 14 days",
      href: candidateDashboardLayerHref("schedule", period),
      primaryAction: { label: "Kelly schedule cockpit", href: "/admin/calendar-command-center/kelly" },
    },
    {
      id: "travel",
      label: "Travel & reimbursement",
      description: "Monthly mileage and reimbursement packet — review when Steve flags ready.",
      badge: travelCount,
      badgeHint: travelCount > 0 ? "to review" : "clear",
      href: candidateDashboardLayerHref("travel", period),
      primaryAction: { label: "Travel report", href: travelHref },
    },
    {
      id: "finance",
      label: "Finance snapshot",
      description: "High-level fundraising and budget view — detail lives with the treasurer.",
      badge: 0,
      badgeHint: "summary",
      href: candidateDashboardLayerHref("finance", period),
      primaryAction: null,
    },
    {
      id: "reports",
      label: "Field & county reports",
      description: "County readiness and campaign pulse — drill down when you want context.",
      badge: snapshot.needsIntakeReviewCount > 0 ? snapshot.needsIntakeReviewCount : 0,
      badgeHint: snapshot.needsIntakeReviewCount > 0 ? "staff queue" : "optional",
      href: candidateDashboardLayerHref("reports", period),
      primaryAction: {
        label: "Month readiness checklist",
        href: `/admin/campaign-events/month-readiness?month=${period}`,
      },
    },
  ];
}

export function parseCandidateDashboardLayer(raw: string | undefined): CandidateDashboardLayerId | null {
  if (
    raw === "decisions" ||
    raw === "schedule" ||
    raw === "travel" ||
    raw === "finance" ||
    raw === "reports"
  ) {
    return raw;
  }
  return null;
}
