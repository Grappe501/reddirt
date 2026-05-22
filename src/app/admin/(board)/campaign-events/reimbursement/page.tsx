import { OfficialReimbursementReportView } from "@/components/admin/campaign-events/travel-reimbursement/OfficialReimbursementReport";
import { TravelReimbursementMonthNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementMonthNav";
import { TravelReimbursementWorkflowNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementWorkflowNav";
import { CampaignEventsNav, CampaignEventsPageHeader } from "@/app/admin/(board)/campaign-events/components";
import { loadCampaignEventsWorkbench } from "@/lib/campaign-events/load-workbench-events";
import { loadReimbursementMonthStatusContext } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status";
import { loadReimbursementMonthOperations } from "@/lib/campaign-events/finance/reimbursement-operations-store";
import { detectReimbursementExceptions, derivePipelineStatus } from "@/lib/campaign-events/finance/finance-helpers";
import { listFinanceDocumentsForMonth } from "@/lib/campaign-events/finance/finance-document-store";
import { saveReimbursementMonthOperations } from "@/lib/campaign-events/finance/reimbursement-operations-store";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { MicrocopyHint } from "@/components/admin/campaign-events/MicrocopyHint";
import { AgentNextActionPanel } from "@/components/admin/campaign-events/AgentNextActionPanel";
import { loadNextActionsForPage } from "@/lib/agents/user-intelligence/load-next-actions";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";
import { AgentCommandPalette } from "@/components/agents/AgentCommandPalette";
import { TreasurerReadinessPanel } from "@/components/admin/campaign-events/finance/TreasurerReadinessPanel";
import { loadCampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function OfficialReimbursementPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const { rows, period } = await loadCampaignEventsWorkbench({ period: month });
  const statusContext = await loadReimbursementMonthStatusContext(rows, period);
  const docs = await listFinanceDocumentsForMonth(period);
  let operations = await loadReimbursementMonthOperations(period);
  const pipeline = derivePipelineStatus(statusContext, docs.filter((d) => d.approvalStatus !== "approved").length);
  const exceptions = detectReimbursementExceptions(rows, period);
  if (!operations) {
    operations = {
      month: period,
      pipelineStatus: pipeline,
      auditHistory: [],
      exceptions,
      updatedAt: new Date().toISOString(),
    };
    await saveReimbursementMonthOperations(operations);
  } else if (operations.exceptions.length === 0 && exceptions.length) {
    operations = { ...operations, exceptions, pipelineStatus: pipeline };
    await saveReimbursementMonthOperations(operations);
  }
  const serializedContext = JSON.parse(JSON.stringify(statusContext));
  const serializedOps = JSON.parse(JSON.stringify(operations));
  const { snapshot } = await loadCampaignEventsDashboard(period);
  const financeSnapshot = await loadCampaignFinanceSnapshot(period);
  const nextActions = loadNextActionsForPage({
    role: "treasurer",
    pathname: "/admin/campaign-events/reimbursement",
    period,
    snapshot,
  });

  return (
    <AgentObservationTracker role="treasurer" pathname="/admin/campaign-events/reimbursement" period={period}>
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
        <p className="font-body text-xs text-kelly-text/65">
          <MicrocopyHint term="reimbursement" role="treasurer" />
          {" · "}
          <MicrocopyHint term="approval_package" role="treasurer" />
        </p>
        <AgentCommandPalette role="treasurer" pathname="/admin/campaign-events/reimbursement" period={period} compact />
        <AgentNextActionPanel actions={nextActions} compact />
      </div>
      <TreasurerReadinessPanel snapshot={financeSnapshot} />
      <OfficialReimbursementReportView report={statusContext.report} statusContext={serializedContext} operations={serializedOps} />
    </div>
    </AgentObservationTracker>
  );
}
