import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";

export type WorkflowRouteRecommendation = {
  id: string;
  title: string;
  why: string;
  href: string;
  priority: number;
  estimatedMinutes?: number;
  riskLevel: "low" | "medium" | "high";
  confidence: "high" | "medium" | "low";
  suppressOthers?: string[];
};

export type WorkflowRouterInput = {
  pathname: string;
  period: string;
  snapshot?: CampaignEventsDashboardSnapshot | null;
  observations?: UserObservationEntry[];
};

export function buildWorkflowRouterV1(input: WorkflowRouterInput): WorkflowRouteRecommendation[] {
  const { pathname, period, snapshot: s } = input;
  const out: WorkflowRouteRecommendation[] = [];

  if (s?.pendingApprovals && s.pendingApprovals > 0) {
    out.push({
      id: "approvals-queue",
      title: "Clear pending approvals",
      why: `${s.pendingApprovals} event(s) need a decision before promotion or reimbursement close.`,
      href: `/admin/campaign-events/review?month=${period}&mode=chronological`,
      priority: 95,
      estimatedMinutes: 20,
      riskLevel: "medium",
      confidence: "high",
    });
  }

  if (s?.needsMileageReview || (s?.actionItems?.travelReview ?? 0) > 0) {
    out.push({
      id: "mileage-travel",
      title: "Finish travel / mileage review",
      why: "Reimbursement print requires mileage and travel decisions to be clean.",
      href: `/admin/campaign-events/travel-report?month=${period}`,
      priority: 90,
      estimatedMinutes: 25,
      riskLevel: "medium",
      confidence: "high",
    });
  }

  if (s?.calendarSync?.jsonStale) {
    out.push({
      id: "calendar-sync",
      title: "Refresh calendar sync truth",
      why: "Stale normalized JSON can mislead workbench and promotion readiness.",
      href: `/admin/campaign-events/calendar-sync?month=${period}`,
      priority: 85,
      estimatedMinutes: 10,
      riskLevel: "low",
      confidence: "high",
    });
  }

  if (s?.needsIntakeReviewCount && s.needsIntakeReviewCount > 0) {
    out.push({
      id: "intake-review",
      title: "Review website intake",
      why: `${s.needsIntakeReviewCount} intake item(s) waiting in the workbench.`,
      href: `/admin/campaign-events/workbench?month=${period}`,
      priority: 80,
      estimatedMinutes: 15,
      riskLevel: "low",
      confidence: "high",
    });
  }

  if (pathname.includes("reimbursement") || pathname.includes("candidate-dashboard")) {
    out.push({
      id: "reimbursement-packet",
      title: "Open reimbursement packet",
      why: "Treasurer-ready print lives on the official reimbursement page.",
      href: `/admin/campaign-events/reimbursement?month=${period}`,
      priority: 75,
      estimatedMinutes: 8,
      riskLevel: "low",
      confidence: "high",
    });
  }

  if (!pathname.includes("ai-command-center")) {
    out.push({
      id: "command-center",
      title: "Check AI command center",
      why: "System health, workflow plans, and gated prepared actions in one place.",
      href: "/admin/ai-command-center",
      priority: 40,
      estimatedMinutes: 5,
      riskLevel: "low",
      confidence: "medium",
    });
  }

  const obs = input.observations ?? [];
  const overwhelm = obs.filter((o) => o.event === "operator_overwhelm_detected").length;
  if (overwhelm >= 2) {
    out.push({
      id: "focus-mode",
      title: "Enter focus mode",
      why: "Recent overload signals — collapse secondary panels and follow top 3 actions only.",
      href: pathname,
      priority: 100,
      estimatedMinutes: 2,
      riskLevel: "low",
      confidence: "high",
      suppressOthers: ["command-center"],
    });
  }

  return out.sort((a, b) => b.priority - a.priority).slice(0, 6);
}

export function pickTopWorkflowRoute(routes: WorkflowRouteRecommendation[]): WorkflowRouteRecommendation | null {
  return routes[0] ?? null;
}
