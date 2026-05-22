import { CandidateCampaignDashboard } from "@/components/admin/campaign-events/dashboard/CandidateCampaignDashboard";
import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadReimbursementMonthSummaries } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { loadCampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { loadNextActionsForPage } from "@/lib/agents/user-intelligence/load-next-actions";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";
import { loadDashboardNavigationBundle } from "@/lib/dashboard-orchestration/load-dashboard-navigation-bundle";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CandidateDashboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const [{ snapshot }, reimbursementSummaries, financeSnapshot, navBundle] = await Promise.all([
    loadCampaignEventsDashboard(month),
    loadReimbursementMonthSummaries(),
    loadCampaignFinanceSnapshot(month),
    loadDashboardNavigationBundle(month, {
      role: "candidate",
      pathname: "/admin/candidate-dashboard",
      surface: "candidate_dashboard",
    }),
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
        financeSnapshot={JSON.parse(JSON.stringify(financeSnapshot))}
        nextActions={nextActions}
        executiveSummary={navBundle.executiveSummary}
        guidanceCards={navBundle.guidanceCards}
      />
    </AgentObservationTracker>
  );
}
