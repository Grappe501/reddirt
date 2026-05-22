import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";
import { buildCampaignOsNavGroups } from "./campaign-os-nav-config";
import { buildAdaptiveDashboardPlan } from "./adaptive-dashboard-orchestrator";
import { buildWorkflowRouterV1 } from "./workflow-router-v1";
import { generateWorkflowGuidanceCards } from "./workflow-guidance-generator";
import { buildExecutiveSummary } from "./executive-summary-builder";
import { analyzeOperatorCognitiveLoad } from "./operator-cognitive-load-analyzer";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";

export type DashboardNavigationBundle = {
  period: string;
  navGroups: ReturnType<typeof buildCampaignOsNavGroups>;
  navBadges: Record<string, number>;
  workflowRoutes: ReturnType<typeof buildWorkflowRouterV1>;
  guidanceCards: ReturnType<typeof generateWorkflowGuidanceCards>;
  cognitiveLoad: ReturnType<typeof analyzeOperatorCognitiveLoad>;
  adaptivePlan: ReturnType<typeof buildAdaptiveDashboardPlan>;
  executiveSummary: ReturnType<typeof buildExecutiveSummary>;
};

export async function loadDashboardNavigationBundle(
  period: string,
  opts?: { role?: CampaignUserRole; pathname?: string; surface?: Parameters<typeof buildExecutiveSummary>[0]["surface"] },
): Promise<DashboardNavigationBundle> {
  const { snapshot } = await loadCampaignEventsDashboard(period);
  const observations = loadGlobalUserObservations();
  const pathname = opts?.pathname ?? "/admin/campaign-manager-dashboard";
  const role = opts?.role ?? "campaign_manager";

  const navBadges: Record<string, number> = {};
  if (snapshot.pendingApprovals > 0) navBadges.approvals = snapshot.pendingApprovals;
  if (snapshot.actionItems.travelReview > 0) navBadges.travel = snapshot.actionItems.travelReview;
  if (snapshot.needsIntakeReviewCount > 0) navBadges.intake = snapshot.needsIntakeReviewCount;
  if (snapshot.calendarSync?.jsonStale) navBadges.sync = 1;

  const warningCount =
    (snapshot.pendingApprovals > 0 ? 1 : 0) +
    (snapshot.needsMileageReview ? 1 : 0) +
    (snapshot.calendarSync?.jsonStale ? 1 : 0);

  return {
    period,
    navGroups: buildCampaignOsNavGroups(period),
    navBadges,
    workflowRoutes: buildWorkflowRouterV1({ pathname, period, snapshot, observations }),
    guidanceCards: generateWorkflowGuidanceCards({ period, pathname, snapshot }),
    cognitiveLoad: analyzeOperatorCognitiveLoad(observations, 8, warningCount),
    adaptivePlan: buildAdaptiveDashboardPlan({
      role,
      period,
      pathname,
      snapshot,
      observations,
    }),
    executiveSummary: buildExecutiveSummary({
      surface: opts?.surface ?? "campaign_manager_dashboard",
      period,
      pathname,
      snapshot,
    }),
  };
}
