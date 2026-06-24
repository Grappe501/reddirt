import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import { analyzeOperatorCognitiveLoad } from "./operator-cognitive-load-analyzer";
import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";
import { buildWorkflowRouterV1 } from "./workflow-router-v1";

export type DashboardCardPriority = {
  id: string;
  title: string;
  emphasis: "primary" | "secondary" | "collapsed";
  reason: string;
};

export type AdaptiveDashboardPlan = {
  role: CampaignUserRole;
  period: string;
  topActions: { label: string; href: string }[];
  cardPriorities: DashboardCardPriority[];
  collapseLowPriority: boolean;
  focusMode: boolean;
  calmLayout: boolean;
};

const CM_CARD_IDS = [
  "executive_summary",
  "workflow_guidance",
  "next_actions",
  "approvals",
  "travel",
  "reimbursement",
  "finance",
  "calendar_health",
  "automation_scaffolds",
] as const;

export function buildAdaptiveDashboardPlan(input: {
  role: CampaignUserRole;
  period: string;
  pathname: string;
  snapshot?: CampaignEventsDashboardSnapshot | null;
  observations?: UserObservationEntry[];
  focusMode?: boolean;
}): AdaptiveDashboardPlan {
  const obs = input.observations ?? [];
  const load = analyzeOperatorCognitiveLoad(
    obs,
    8,
    (input.snapshot?.pendingApprovals ?? 0) + (input.snapshot?.calendarSync?.jsonStale ? 2 : 0),
  );
  const routes = buildWorkflowRouterV1({
    pathname: input.pathname,
    period: input.period,
    snapshot: input.snapshot,
    observations: obs,
  });

  const topActions = routes.slice(0, 3).map((r) => ({ label: r.title, href: r.href }));
  const s = input.snapshot;
  const collapseLowPriority = load.calmModeRecommended || Boolean(input.focusMode);

  const cardPriorities: DashboardCardPriority[] = CM_CARD_IDS.map((id) => {
    let emphasis: DashboardCardPriority["emphasis"] = "secondary";
    let reason = "Standard visibility";

    if (id === "executive_summary" || id === "workflow_guidance" || id === "next_actions") {
      emphasis = "primary";
      reason = "Sprint 9 calm routing — always surface first";
    }
    if (id === "approvals" && (s?.pendingApprovals ?? 0) > 0) {
      emphasis = "primary";
      reason = "Pending approvals need attention";
    }
    if (id === "travel" && (s?.needsMileageReview || (s?.actionItems?.travelReview ?? 0) > 0)) {
      emphasis = "primary";
      reason = "Travel / mileage blocking reimbursement";
    }
    if (id === "reimbursement" && input.pathname.includes("reimbursement")) {
      emphasis = "primary";
      reason = "Active reimbursement workflow";
    }
    if (id === "finance" && (s?.pendingApprovals ?? 0) === 0 && input.role === "campaign_manager") {
      emphasis = collapseLowPriority ? "secondary" : "primary";
      reason = "Finance ops when approvals calmer";
    }
    if (collapseLowPriority && (id === "automation_scaffolds" || id === "calendar_health")) {
      emphasis = "collapsed";
      reason = "Collapsed during calm / focus mode";
    }

    return {
      id,
      title: id.replace(/_/g, " "),
      emphasis,
      reason,
    };
  });

  if (input.role === "candidate") {
    for (const c of cardPriorities) {
      if (c.id === "approvals" || c.id === "reimbursement") c.emphasis = "primary";
      if (c.id === "automation_scaffolds" || c.id === "calendar_health") c.emphasis = "collapsed";
    }
  }

  return {
    role: input.role,
    period: input.period,
    topActions,
    cardPriorities,
    collapseLowPriority: collapseLowPriority || input.role === "candidate",
    focusMode: Boolean(input.focusMode) || input.role === "candidate",
    calmLayout: load.calmModeRecommended || input.role === "candidate",
  };
}

export function isCardCollapsed(plan: AdaptiveDashboardPlan, cardId: string): boolean {
  const card = plan.cardPriorities.find((c) => c.id === cardId);
  return card?.emphasis === "collapsed";
}
