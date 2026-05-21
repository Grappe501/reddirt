import { TentativeTravelLog } from "@/components/admin/campaign-events/travel-reimbursement/TentativeTravelLog";
import { ReimbursementMonthStatusBadge } from "@/components/admin/campaign-events/travel-reimbursement/ReimbursementMonthStatusBadge";
import { loadReimbursementMonthStatusContext } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status";
import { TravelReimbursementMonthNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementMonthNav";
import { TravelReimbursementWorkflowNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementWorkflowNav";
import { CampaignEventsNav, CampaignEventsPageHeader } from "@/app/admin/(board)/campaign-events/components";
import { loadCampaignEventsWorkbench, serializeWorkbenchRows } from "@/lib/campaign-events/load-workbench-events";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { parseTravelLogFilter } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";
import { countNormalizedItemsForPeriod } from "@/lib/campaign-events/persistence/seed-period";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string; filter?: string }> };

export default async function TentativeTravelLogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const filter = parseTravelLogFilter(sp.filter);
  const { rows, period } = await loadCampaignEventsWorkbench({ period: month });
  const statusContext = await loadReimbursementMonthStatusContext(rows, period);
  const jsonCount = await countNormalizedItemsForPeriod(period);

  return (
    <AgentObservationTracker role="campaign_manager" pathname="/admin/campaign-events/travel-log" period={period}>
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Travel reimbursement · step 1"
        title="Tentative travel log"
        description="One line per travel-related campaign event before approval. Use filters to find missing city, mileage, or pending decisions — then open the review wizard to approve travel for reimbursement."
      />
      <CampaignEventsNav />
      <TravelReimbursementWorkflowNav month={period} active="travel-log" />
      <TravelReimbursementMonthNav activeMonth={period} activeBase="travel-log" />
      <ReimbursementMonthStatusBadge month={period} status={statusContext.effectiveStatus} />
      {rows.length === 0 && jsonCount === 0 ? (
        <p className="rounded-xl border border-amber-700/25 bg-amber-50 px-4 py-3 font-body text-sm text-amber-950">
          No calendar rows in normalized JSON for {period}. Run <code>npm run campaign-events:seed-month -- {period}</code> after
          updating the calendar export.
        </p>
      ) : null}
      <TentativeTravelLog initialRows={serializeWorkbenchRows(rows)} initialMonth={period} initialFilter={filter} />
    </div>
    </AgentObservationTracker>
  );
}
