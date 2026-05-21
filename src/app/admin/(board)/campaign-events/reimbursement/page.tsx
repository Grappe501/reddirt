import { OfficialReimbursementReportView } from "@/components/admin/campaign-events/travel-reimbursement/OfficialReimbursementReport";
import { TravelReimbursementMonthNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementMonthNav";
import { TravelReimbursementWorkflowNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementWorkflowNav";
import { CampaignEventsNav, CampaignEventsPageHeader } from "@/app/admin/(board)/campaign-events/components";
import { loadCampaignEventsWorkbench } from "@/lib/campaign-events/load-workbench-events";
import { loadReimbursementMonthStatusContext } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function OfficialReimbursementPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const { rows, period } = await loadCampaignEventsWorkbench({ period: month });
  const statusContext = await loadReimbursementMonthStatusContext(rows, period);
  const serializedContext = JSON.parse(JSON.stringify(statusContext));

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 pb-12">
      <div className="print:hidden">
        <CampaignEventsPageHeader
          eyebrow="Travel reimbursement · step 4"
          title="Official travel reimbursement request"
          description="Print-ready reimbursement for approved travel only. Set month status (draft → ready → finalized), complete the checklist, then print or download CSV/JSON. PDF export is not built yet — use Print official request."
        />
        <CampaignEventsNav />
        <TravelReimbursementWorkflowNav month={period} active="reimbursement" />
        <TravelReimbursementMonthNav activeMonth={period} activeBase="reimbursement" />
      </div>
      <OfficialReimbursementReportView report={statusContext.report} statusContext={serializedContext} />
    </div>
  );
}
