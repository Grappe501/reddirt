import { CandidateCampaignDashboard } from "@/components/admin/campaign-events/dashboard/CandidateCampaignDashboard";
import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadReimbursementMonthSummaries } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { loadNextActionsForPage } from "@/lib/agents/user-intelligence/load-next-actions";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CandidateDashboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const [{ snapshot }, reimbursementSummaries] = await Promise.all([
    loadCampaignEventsDashboard(month),
    loadReimbursementMonthSummaries(),
  ]);
  const nextActions = loadNextActionsForPage({
    role: "candidate",
    pathname: "/admin/candidate-dashboard",
    period: month,
    snapshot,
  });
  return (
    <AgentObservationTracker
      role="candidate"
      pathname="/admin/candidate-dashboard"
      period={month}
    >
      <div className="mx-auto max-w-[1200px] px-0">
        <CampaignEventsMonthNav activeMonth={month} basePath="candidate-dashboard" />
      </div>
      <CandidateCampaignDashboard
        snapshot={snapshot}
        reimbursementSummaries={reimbursementSummaries}
        nextActions={nextActions}
      />
    </AgentObservationTracker>
  );
}
