import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { countMasterRegistryByStatus } from "@/lib/agents/master-tool-registry";

export type CampaignGap = {
  id: string;
  title: string;
  whyItMatters: string;
  recommendedAction: string;
  whoShouldAct: string;
  affectedRoutes: string[];
  toolsNeeded: string[];
  impact: "P0" | "P1" | "P2";
};

export type CampaignGapAnalysis = {
  highestImpact: CampaignGap;
  allGaps: CampaignGap[];
  agentReadinessPct: number;
  summary: string;
};

export function analyzeCampaignGaps(input: {
  snapshot?: CampaignEventsDashboardSnapshot | null;
  readinessScore?: number | null;
}): CampaignGapAnalysis {
  const gaps: CampaignGap[] = [];
  const s = input.snapshot;
  const registry = countMasterRegistryByStatus();

  if (s?.calendarSync?.jsonStale) {
    gaps.push({
      id: "sync_stale",
      title: "Calendar sync data stale",
      whyItMatters: "Operators may promote or approve against outdated Google/JSON truth.",
      recommendedAction: "Run calendar sync refresh commands; open sync dashboard.",
      whoShouldAct: "Campaign manager / operator",
      affectedRoutes: ["/admin/campaign-events/calendar-sync"],
      toolsNeeded: ["stale-data-risk-detector", "calendar-sync-command-advisor"],
      impact: "P0",
    });
  }
  if (s && s.pendingApprovals > 5) {
    gaps.push({
      id: "approval_backlog",
      title: `${s.pendingApprovals} pending approvals`,
      whyItMatters: "Blocks reimbursement accuracy and calendar promotion.",
      recommendedAction: "Run Month Review wizard or send approval packages (gated).",
      whoShouldAct: "Candidate + CM",
      affectedRoutes: ["/admin/campaign-events/review", "/admin/candidate-dashboard"],
      toolsNeeded: ["approval-context-composer", "operator-next-action-recommender"],
      impact: "P0",
    });
  }
  if (s && s.promotionFailed > 0) {
    gaps.push({
      id: "promotion_failed",
      title: `${s.promotionFailed} failed Google promotion(s)`,
      whyItMatters: "Ledger and Google calendar may be out of sync.",
      recommendedAction: "Open promotion workbench; retry with dry-run first.",
      whoShouldAct: "Operator",
      affectedRoutes: ["/admin/campaign-events/calendar-promotion"],
      toolsNeeded: ["promotion-retry-handler", "google-write-guard"],
      impact: "P1",
    });
  }
  if (registry.functional / Math.max(registry.total, 1) < 0.35) {
    gaps.push({
      id: "tool_maturity",
      title: "AI tool catalog still maturing",
      whyItMatters: "Many tools are idea/scaffold — agent cannot orchestrate what is not wired.",
      recommendedAction: "Prioritize Agent Intelligence + Kelly Agent registry import.",
      whoShouldAct: "AI builder / operator",
      affectedRoutes: ["/admin/ai-command-center", "/admin/campaign-events/ai-tools"],
      toolsNeeded: ["campaign-gap-analyzer", "sprint-priority-recommender"],
      impact: "P1",
    });
  }
  if (input.readinessScore != null && input.readinessScore < 80) {
    gaps.push({
      id: "month_readiness",
      title: `Month readiness ${input.readinessScore}%`,
      whyItMatters: "Month close blocked by missing city, mileage, or decisions.",
      recommendedAction: "Open month readiness checklist; clear missing_* queues.",
      whoShouldAct: "Campaign manager",
      affectedRoutes: ["/admin/campaign-events/month-readiness"],
      toolsNeeded: ["workflow-bottleneck-detector", "rpt-month-readiness"],
      impact: "P1",
    });
  }

  if (!gaps.length) {
    gaps.push({
      id: "none_critical",
      title: "No critical gap detected (V1 heuristics)",
      whyItMatters: "Continue observation learning and registry consolidation.",
      recommendedAction: "Review AI command center; run dry-run promotion test.",
      whoShouldAct: "Operator",
      affectedRoutes: ["/admin/ai-command-center"],
      toolsNeeded: ["observation-pattern-miner"],
      impact: "P2",
    });
  }

  gaps.sort((a, b) => (a.impact === "P0" ? -1 : b.impact === "P0" ? 1 : 0));

  const agentReadinessPct = Math.round(
    ((registry.functional + registry.partial * 0.65) / Math.max(registry.total, 1)) * 100,
  );

  return {
    highestImpact: gaps[0],
    allGaps: gaps,
    agentReadinessPct,
    summary: `${gaps[0].title} — ${gaps[0].recommendedAction}`,
  };
}
