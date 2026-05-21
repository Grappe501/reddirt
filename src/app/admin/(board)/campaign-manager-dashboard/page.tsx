import { CampaignManagerOpsDashboard } from "@/components/admin/campaign-events/dashboard/CampaignManagerOpsDashboard";
import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadReimbursementMonthSummaries } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { loadNextActionsForPage } from "@/lib/agents/user-intelligence/load-next-actions";
import { analyzeCampaignGaps } from "@/lib/agents/campaign-intelligence/campaign-gap-analyzer";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";
import { detectWorkflowFriction } from "@/lib/agents/user-intelligence/workflow-friction-detector";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CampaignManagerDashboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const [{ snapshot }, reimbursementSummaries] = await Promise.all([
    loadCampaignEventsDashboard(month),
    loadReimbursementMonthSummaries(),
  ]);
  const nextActions = loadNextActionsForPage({
    role: "campaign_manager",
    pathname: "/admin/campaign-manager-dashboard",
    period: month,
    snapshot,
  });
  const gapAnalysis = analyzeCampaignGaps({ snapshot });
  const frictionTop = detectWorkflowFriction(loadGlobalUserObservations()).slice(0, 2);
  return (
    <AgentObservationTracker
      role="campaign_manager"
      pathname="/admin/campaign-manager-dashboard"
      period={month}
    >
      <div className="mx-auto max-w-[1200px] px-0">
        <CampaignEventsMonthNav activeMonth={month} basePath="campaign-manager-dashboard" />
      </div>
      <CampaignManagerOpsDashboard
        snapshot={snapshot}
        reimbursementSummaries={reimbursementSummaries}
        nextActions={nextActions}
        gapHighlight={gapAnalysis.highestImpact}
        frictionTop={frictionTop}
      />
    </AgentObservationTracker>
  );
}
