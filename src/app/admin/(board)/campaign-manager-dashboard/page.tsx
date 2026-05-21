import { CampaignManagerOpsDashboard } from "@/components/admin/campaign-events/dashboard/CampaignManagerOpsDashboard";
import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadReimbursementMonthSummaries } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CampaignManagerDashboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const [{ snapshot }, reimbursementSummaries] = await Promise.all([
    loadCampaignEventsDashboard(month),
    loadReimbursementMonthSummaries(),
  ]);
  return (
    <>
      <div className="mx-auto max-w-[1200px] px-0">
        <CampaignEventsMonthNav activeMonth={month} basePath="campaign-manager-dashboard" />
      </div>
      <CampaignManagerOpsDashboard snapshot={snapshot} reimbursementSummaries={reimbursementSummaries} />
    </>
  );
}
