import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { buildWorkflowRouterV1, pickTopWorkflowRoute } from "./workflow-router-v1";

export type ExecutiveSummarySurface =
  | "workbench"
  | "reimbursement"
  | "finance"
  | "command_center"
  | "event_drilldown"
  | "month_review"
  | "hot_wash"
  | "county"
  | "candidate_dashboard"
  | "campaign_manager_dashboard"
  | "calendar_sync";

export type ExecutiveSummary = {
  surface: ExecutiveSummarySurface;
  headline: string;
  whatMatters: string[];
  blocked: string[];
  ready: string[];
  needsAction: string[];
  topNextMove: { label: string; href: string; why: string } | null;
  aiExplanation: string;
  calmNote: string;
};

export function buildExecutiveSummary(input: {
  surface: ExecutiveSummarySurface;
  period: string;
  pathname: string;
  snapshot?: CampaignEventsDashboardSnapshot | null;
  extraBlocked?: string[];
  extraReady?: string[];
}): ExecutiveSummary {
  const s = input.snapshot;
  const routes = buildWorkflowRouterV1({
    pathname: input.pathname,
    period: input.period,
    snapshot: s,
  });
  const top = pickTopWorkflowRoute(routes);

  const blocked: string[] = [...(input.extraBlocked ?? [])];
  const ready: string[] = [...(input.extraReady ?? [])];
  const needsAction: string[] = [];

  if (s) {
    if (s.pendingApprovals > 0) {
      blocked.push(`${s.pendingApprovals} pending approval(s)`);
      needsAction.push("Run month review decisions");
    } else {
      ready.push("No pending approvals in snapshot");
    }
    if (s.needsMileageReview) {
      blocked.push("Mileage review queue not clear");
      needsAction.push("Clear mileage on travel rows");
    }
    if (s.calendarSync?.jsonStale) {
      blocked.push("Calendar JSON stale");
      needsAction.push("Refresh calendar sync");
    }
    if ((s.actionItems?.travelReview ?? 0) > 0) {
      needsAction.push(`${s.actionItems.travelReview} travel review row(s)`);
    }
    if (s.promotionReadyTentative > 0) {
      ready.push(`${s.promotionReadyTentative} event(s) ready for promotion preview`);
    }
  }

  const whatMatters: string[] = [];
  if (input.surface === "reimbursement" || input.surface === "candidate_dashboard") {
    whatMatters.push("Month reimbursement packet accuracy and print readiness");
  }
  if (input.surface === "command_center") {
    whatMatters.push("Cross-domain system health and supervised agent plans");
  }
  if (input.surface === "workbench" || input.surface === "month_review") {
    whatMatters.push("Event queue throughput and approval decisions");
  }
  if (whatMatters.length === 0) {
    whatMatters.push("Operational continuity for the active month");
  }

  const headline =
    blocked.length > 0
      ? `${blocked.length} blocker(s) — focus on ${top?.title ?? "top queue"}`
      : ready.length > 0
        ? "On track — follow ready workflows"
        : "Calm operations — review open work";

  const aiExplanation = top
    ? `The system recommends "${top.title}" because ${top.why}`
    : "No urgent cross-domain route detected; use command palette for plain-language routing.";

  return {
    surface: input.surface,
    headline,
    whatMatters,
    blocked,
    ready,
    needsAction,
    topNextMove: top ? { label: top.title, href: top.href, why: top.why } : null,
    aiExplanation,
    calmNote:
      blocked.length >= 3
        ? "High cognitive load — executive summary first; detail on demand."
        : "Progressive disclosure: summary → guidance cards → full tables.",
  };
}
