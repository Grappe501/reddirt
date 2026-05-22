import { CampaignManagerOpsDashboard } from "@/components/admin/campaign-events/dashboard/CampaignManagerOpsDashboard";
import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadReimbursementMonthSummaries } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { loadCampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { loadNextActionsForPage } from "@/lib/agents/user-intelligence/load-next-actions";
import { analyzeCampaignGaps } from "@/lib/agents/campaign-intelligence/campaign-gap-analyzer";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";
import { detectWorkflowFriction } from "@/lib/agents/user-intelligence/workflow-friction-detector";
import { loadDashboardNavigationBundle } from "@/lib/dashboard-orchestration/load-dashboard-navigation-bundle";
import { composeCountyDashboardContext } from "@/lib/agents/county-intelligence/county-intelligence-engine";
import { loadVolunteerSystemBundle } from "@/lib/campaign-events/volunteers/load-volunteer-bundle";
import { CampaignGuidanceStrip } from "@/components/admin/guidance/CampaignGuidanceStrip";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CampaignManagerDashboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const [{ snapshot }, reimbursementSummaries, financeSnapshot, navBundle] = await Promise.all([
    loadCampaignEventsDashboard(month),
    loadReimbursementMonthSummaries(),
    loadCampaignFinanceSnapshot(month),
    loadDashboardNavigationBundle(month, {
      role: "campaign_manager",
      pathname: "/admin/campaign-manager-dashboard",
      surface: "campaign_manager_dashboard",
    }),
  ]);
  const nextActions = loadNextActionsForPage({
    role: "campaign_manager",
    pathname: "/admin/campaign-manager-dashboard",
    period: month,
    snapshot,
  });
  const gapAnalysis = analyzeCampaignGaps({ snapshot });
  const frictionTop = detectWorkflowFriction(loadGlobalUserObservations()).slice(0, 2);
  const countyStatewide = composeCountyDashboardContext();
  const volunteerBundle = loadVolunteerSystemBundle();
  return (
    <AgentObservationTracker
      role="campaign_manager"
      pathname="/admin/campaign-manager-dashboard"
      period={month}
    >
      <div className="mx-auto max-w-[1200px] px-0">
        <CampaignEventsMonthNav activeMonth={month} basePath="campaign-manager-dashboard" />
      </div>
      <div className="mx-auto max-w-[1200px] px-4 pb-2">
        <CampaignGuidanceStrip role="campaign_manager" pathname="/admin/campaign-manager-dashboard" pageLabel="CM dashboard" compact />
      </div>
      <CampaignManagerOpsDashboard
        countyStatewide={countyStatewide}
        snapshot={snapshot}
        reimbursementSummaries={reimbursementSummaries}
        financeSnapshot={JSON.parse(JSON.stringify(financeSnapshot))}
        nextActions={nextActions}
        gapHighlight={gapAnalysis.highestImpact}
        frictionTop={frictionTop}
        executiveSummary={navBundle.executiveSummary}
        guidanceCards={navBundle.guidanceCards}
        adaptivePlan={navBundle.adaptivePlan}
        volunteerBundle={volunteerBundle}
      />
    </AgentObservationTracker>
  );
}
