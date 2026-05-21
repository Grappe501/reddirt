import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import type { NextActionResult } from "../user-intelligence/next-action-engine";
import type { CampaignUserRole } from "../user-intelligence/user-personas";
import type { UserObservationEntry } from "../user-intelligence/user-observations";
import { buildNextActions } from "../user-intelligence/next-action-engine";

export type AgentDomain =
  | "calendar"
  | "intake"
  | "approval"
  | "event_planning"
  | "travel"
  | "reimbursement"
  | "compliance"
  | "county"
  | "media_hot_wash"
  | "dashboard_ux"
  | "agent_tooling";

export type CrossDomainContextInput = {
  role: CampaignUserRole;
  pathname: string;
  period: string;
  eventRecordId?: string | null;
  snapshot?: CampaignEventsDashboardSnapshot | null;
  readinessScore?: number | null;
  syncStale?: boolean;
  reimbursementEffectiveStatus?: string | null;
  recentObservations?: UserObservationEntry[];
};

export type CrossDomainContext = {
  contextSummary: string;
  activeDomain: AgentDomain;
  relatedDomains: AgentDomain[];
  currentBlockers: string[];
  recommendedNextActions: NextActionResult;
  toolsLikelyNeeded: string[];
  confidence: "high" | "medium" | "low";
  humanApprovalReminders: string[];
};

function inferActiveDomain(pathname: string): AgentDomain {
  if (pathname.includes("calendar-promotion")) return "calendar";
  if (pathname.includes("calendar-sync")) return "calendar";
  if (pathname.includes("reimbursement") || pathname.includes("travel")) return "travel";
  if (pathname.includes("review")) return "approval";
  if (pathname.includes("workbench") || pathname.includes("campaign-events/")) return "event_planning";
  if (pathname.includes("ai-command-center") || pathname.includes("ai-tools")) return "agent_tooling";
  if (pathname.includes("counties")) return "county";
  if (pathname.includes("media")) return "media_hot_wash";
  if (pathname.includes("dashboard")) return "dashboard_ux";
  return "dashboard_ux";
}

function relatedDomainsFor(active: AgentDomain, s?: CampaignEventsDashboardSnapshot | null): AgentDomain[] {
  const out = new Set<AgentDomain>([active]);
  if (!s) return [...out];
  if (s.pendingApprovals > 0) out.add("approval");
  if (s.actionItems.travelReview > 0 || s.needsMileageReview) out.add("travel");
  if (s.promotionReadyTentative > 0 || s.promotionFailed > 0) out.add("calendar");
  if (s.needsIntakeReviewCount > 0) out.add("intake");
  if (s.calendarSync?.jsonStale) out.add("calendar");
  return [...out];
}

function blockersFromSnapshot(s?: CampaignEventsDashboardSnapshot | null, syncStale?: boolean): string[] {
  const b: string[] = [];
  if (!s) return b;
  if (s.pendingApprovals > 0) b.push(`${s.pendingApprovals} pending approval(s)`);
  if (s.actionItems.travelReview > 0) b.push(`${s.actionItems.travelReview} travel review row(s)`);
  if (s.needsMileageReview) b.push("Mileage review queue not clear");
  if (s.needsIntakeReviewCount > 0) b.push(`${s.needsIntakeReviewCount} intake review item(s)`);
  if (syncStale || s.calendarSync?.jsonStale) b.push("Calendar sync stale");
  if (s.promotionFailed > 0) b.push(`${s.promotionFailed} failed promotion(s)`);
  if (s.intakeConflictCount > 0) b.push(`${s.intakeConflictCount} intake conflict(s)`);
  return b;
}

export function composeCrossDomainContext(input: CrossDomainContextInput): CrossDomainContext {
  const activeDomain = inferActiveDomain(input.pathname);
  const blockers = blockersFromSnapshot(input.snapshot, input.syncStale);
  const recent = input.recentObservations ?? [];
  const obsOnPath = recent.filter((o) => o.pathname === input.pathname).length;
  const frictionHints = recent.filter(
    (o) =>
      o.event === "flow_abandoned" ||
      o.event === "abandoned_flow" ||
      o.event === "no_results_search" ||
      o.event === "promotion_attempted",
  );
  if (frictionHints.length >= 2) {
    blockers.push("Repeated friction signals on this surface");
  }

  const recommendedNextActions = buildNextActions({
    role: input.role,
    pathname: input.pathname,
    period: input.period,
    snapshot: input.snapshot,
    recentObservations: recent,
    readinessScore: input.readinessScore ?? null,
    syncStale: input.syncStale,
    crossDomain: { activeDomain, blockers },
  });

  const toolsLikelyNeeded: string[] = [];
  if (activeDomain === "calendar") toolsLikelyNeeded.push("promotion-readiness-checker", "calendar-sync-truth");
  if (activeDomain === "travel") toolsLikelyNeeded.push("mr-reimburse-dollar", "next-action-recommender");
  if (activeDomain === "approval") toolsLikelyNeeded.push("appr-month-wizard", "workflow-friction-detector");
  if (blockers.some((b) => b.includes("intake"))) toolsLikelyNeeded.push("intake-conflict-detector");
  if (obsOnPath > 5) toolsLikelyNeeded.push("behavior-pattern-observer");

  const summaryParts = [
    `${input.role} on ${input.pathname}`,
    `Month ${input.period}`,
    `Active: ${activeDomain.replaceAll("_", " ")}`,
  ];
  if (input.eventRecordId) summaryParts.push(`Event ${input.eventRecordId}`);
  if (blockers.length) summaryParts.push(`${blockers.length} blocker(s)`);

  const humanApprovalReminders = [
    "No autonomous email/SMS send",
    "No autonomous Google Calendar writes",
    "No autonomous approvals or financial posts",
  ];
  if (activeDomain === "calendar") {
    humanApprovalReminders.push("Promotion requires explicit Promote click + env gate");
  }

  const confidence: CrossDomainContext["confidence"] =
    input.snapshot && blockers.length <= 2 ? "high" : input.snapshot ? "medium" : "low";

  return {
    contextSummary: summaryParts.join(" · "),
    activeDomain,
    relatedDomains: relatedDomainsFor(activeDomain, input.snapshot),
    currentBlockers: blockers,
    recommendedNextActions,
    toolsLikelyNeeded: [...new Set(toolsLikelyNeeded)],
    confidence,
    humanApprovalReminders,
  };
}
