import Link from "next/link";
import { MonthlyTravelReport } from "@/components/admin/campaign-events/travel-report/MonthlyTravelReport";
import { CampaignEventsNav, CampaignEventsPageHeader } from "@/app/admin/(board)/campaign-events/components";
import { ReimbursementMonthStatusBadge } from "@/components/admin/campaign-events/travel-reimbursement/ReimbursementMonthStatusBadge";
import { loadCampaignEventsWorkbench, serializeWorkbenchRows } from "@/lib/campaign-events/load-workbench-events";
import { loadReimbursementMonthStatusContext } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { TravelReimbursementMonthNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementMonthNav";
import { TravelReimbursementWorkflowNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementWorkflowNav";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CampaignTravelReportPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const { rows, period } = await loadCampaignEventsWorkbench({ period: month });
  const statusContext = await loadReimbursementMonthStatusContext(rows, period);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Travel reimbursement · working report"
        title="Monthly Travel Ledger Report"
        description="Chronological travel ledger with mileage and reimbursement totals. Use the tentative travel log for pre-approval review and the official reimbursement request for print-ready submission."
        actions={
          <>
            <Link
              href={`/admin/campaign-events/reimbursement?month=${period}`}
              className="rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white"
            >
              Official reimbursement request
            </Link>
            <Link
              href={`/admin/campaign-events/travel-log?month=${period}`}
              className="rounded-full border px-4 py-2 font-body text-sm font-bold"
            >
              Tentative travel log
            </Link>
            <Link href="/admin/campaign-events/workbench" className="rounded-full border px-4 py-2 font-body text-sm font-bold">
              Workbench
            </Link>
            <Link
              href={`/admin/campaign-events/month-readiness?month=${period}`}
              className="rounded-full border border-amber-700/30 bg-amber-50 px-4 py-2 font-body text-sm font-bold text-amber-950"
            >
              Month readiness
            </Link>
            <Link href="/admin/candidate-dashboard" className="rounded-full border px-4 py-2 font-body text-sm font-bold">
              Candidate dashboard
            </Link>
            <Link href="/admin/campaign-manager-dashboard" className="rounded-full border px-4 py-2 font-body text-sm font-bold">
              CM dashboard
            </Link>
            <Link href="/admin/campaign-events/ai-tools" className="rounded-full border border-kelly-navy/30 px-4 py-2 font-body text-sm font-bold text-kelly-navy">
              AI tool package
            </Link>
          </>
        }
      />
      <CampaignEventsNav />
      <TravelReimbursementWorkflowNav month={period} active="travel-report" />
      <TravelReimbursementMonthNav activeMonth={period} activeBase="travel-report" />
      <ReimbursementMonthStatusBadge month={period} status={statusContext.effectiveStatus} />
      <MonthlyTravelReport initialRows={serializeWorkbenchRows(rows)} initialMonth={period} />
    </div>
  );
}
