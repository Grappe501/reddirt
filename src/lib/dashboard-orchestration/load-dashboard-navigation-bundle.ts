import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";
import { buildCampaignOsNavGroups } from "./campaign-os-nav-config";
import {
  buildOppositionDebateLaunchNavGroups,
  isIntelligenceOppositionDebateLaunchMode,
} from "@/lib/intelligence/intelligenceLaunchMode";
import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
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

const DEBATE_PREP_HREF = "/admin/intelligence/kim-hammer/debate-prep";

function buildLaunchNavigationBundle(
  period: string,
  opts?: { role?: CampaignUserRole; pathname?: string; surface?: Parameters<typeof buildExecutiveSummary>[0]["surface"] },
): DashboardNavigationBundle {
  const pathname = opts?.pathname ?? "/admin/intelligence";
  const role = opts?.role ?? "campaign_manager";
  return {
    period,
    navGroups: buildOppositionDebateLaunchNavGroups(),
    navBadges: {},
    workflowRoutes: [],
    guidanceCards: [],
    cognitiveLoad: { score: 0, signals: [], calmModeRecommended: false },
    adaptivePlan: {
      role,
      period,
      topActions: [{ label: "Debate prep", href: DEBATE_PREP_HREF }],
      cardPriorities: [],
      collapseLowPriority: true,
      focusMode: true,
      calmLayout: true,
    },
    executiveSummary: {
      surface: opts?.surface ?? "command_center",
      headline: "Debate week intelligence",
      whatMatters: ["Start at Tonight's overview", "Open debate prep for rehearsal"],
      blocked: [],
      ready: [],
      needsAction: [],
      topNextMove: {
        label: "Debate prep",
        href: DEBATE_PREP_HREF,
        why: "Primary candidate rehearsal surface",
      },
      aiExplanation: "",
      calmNote: "Debate launch mode — use All tools for staff surfaces.",
    },
  };
}

export async function loadDashboardNavigationBundle(
  period: string,
  opts?: { role?: CampaignUserRole; pathname?: string; surface?: Parameters<typeof buildExecutiveSummary>[0]["surface"] },
): Promise<DashboardNavigationBundle> {
  const launchMode = isIntelligenceOppositionDebateLaunchMode();
  if (launchMode) {
    return buildLaunchNavigationBundle(period, opts);
  }

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

  const navGroups = buildCampaignOsNavGroups(period);

  return {
    period,
    navGroups,
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
