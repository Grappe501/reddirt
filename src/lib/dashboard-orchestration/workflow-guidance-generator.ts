import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { buildWorkflowRouterV1 } from "./workflow-router-v1";

export type WorkflowGuidanceCard = {
  id: string;
  title: string;
  whyItMatters: string;
  nextStep: string;
  href: string;
  estimatedMinutes: number;
  riskLevel: "low" | "medium" | "high";
  aiConfidence: "high" | "medium" | "low";
};

export function generateWorkflowGuidanceCards(input: {
  period: string;
  pathname: string;
  snapshot?: CampaignEventsDashboardSnapshot | null;
}): WorkflowGuidanceCard[] {
  const s = input.snapshot;
  const cards: WorkflowGuidanceCard[] = [];

  if (s?.needsMileageReview || (s?.actionItems?.travelReview ?? 0) > 0) {
    const n = s?.actionItems?.travelReview ?? 0;
    cards.push({
      id: "mileage-before-reimb",
      title: "Mileage must be cleared before reimbursement is printable",
      whyItMatters: "Official reimbursement totals exclude rows missing mileage or travel decisions.",
      nextStep: "Open travel report and accept or correct mileage rows",
      href: `/admin/campaign-events/travel-report?month=${input.period}`,
      estimatedMinutes: 25,
      riskLevel: "medium",
      aiConfidence: "high",
    });
  }

  if (s?.pendingApprovals && s.pendingApprovals > 0) {
    cards.push({
      id: "approvals-blocking",
      title: `${s.pendingApprovals} event(s) still need approval decisions`,
      whyItMatters: "Google promotion and reimbursement close depend on approval state.",
      nextStep: "Run month review chronological mode",
      href: `/admin/campaign-events/review?month=${input.period}&mode=chronological`,
      estimatedMinutes: 20,
      riskLevel: "medium",
      aiConfidence: "high",
    });
  }

  if (s?.calendarSync?.jsonStale) {
    cards.push({
      id: "gcal-promotion-blocked",
      title: "Calendar truth is stale — promotion readiness may be wrong",
      whyItMatters: "Workbench and promotion workbench read normalized JSON freshness.",
      nextStep: "Open calendar sync dashboard and run documented refresh",
      href: `/admin/campaign-events/calendar-sync?month=${input.period}`,
      estimatedMinutes: 10,
      riskLevel: "low",
      aiConfidence: "high",
    });
  }

  if (s?.promotionFailed && s.promotionFailed > 0) {
    cards.push({
      id: "promotion-failed",
      title: `${s.promotionFailed} promotion attempt(s) failed`,
      whyItMatters: "Official calendar may not match approved ledger rows.",
      nextStep: "Review promotion audit on event drilldown",
      href: `/admin/campaign-events/workbench?month=${input.period}`,
      estimatedMinutes: 15,
      riskLevel: "high",
      aiConfidence: "medium",
    });
  }

  const routes = buildWorkflowRouterV1({
    pathname: input.pathname,
    period: input.period,
    snapshot: s,
  });
  for (const r of routes.slice(0, 2)) {
    if (cards.some((c) => c.href === r.href)) continue;
    cards.push({
      id: `route-${r.id}`,
      title: r.title,
      whyItMatters: r.why,
      nextStep: "Open recommended workflow",
      href: r.href,
      estimatedMinutes: r.estimatedMinutes ?? 10,
      riskLevel: r.riskLevel,
      aiConfidence: r.confidence,
    });
  }

  return cards.slice(0, 6);
}
