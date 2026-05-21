import { LEDGER_PERIOD_QUICK_LINKS } from "../constants";
import { loadCampaignEventsWorkbench } from "../load-workbench-events";
import { loadReimbursementMonthStatusContext, type ReimbursementMonthStatusContext } from "./reimbursement-month-status";

export type ReimbursementMonthSummary = {
  month: string;
  effectiveStatus: ReimbursementMonthStatusContext["effectiveStatus"];
  approvedCount: number;
  totalReimbursement: number;
  needsApproval: number;
  missingMileage: number;
  nextAction: string;
  reimbursementHref: string;
};

export async function loadReimbursementMonthSummaries(
  months: readonly string[] = LEDGER_PERIOD_QUICK_LINKS,
): Promise<ReimbursementMonthSummary[]> {
  const out: ReimbursementMonthSummary[] = [];
  for (const month of months) {
    const { rows } = await loadCampaignEventsWorkbench({ period: month });
    const ctx = await loadReimbursementMonthStatusContext(rows, month);
    let nextAction = "Review travel log";
    if (ctx.effectiveStatus === "finalized") nextAction = "View / print finalized packet";
    else if (ctx.effectiveStatus === "ready") nextAction = "Print official request · finalize when signed";
    else if (ctx.queues.needsApproval > 0) nextAction = `Approve ${ctx.queues.needsApproval} travel row(s)`;
    else if (ctx.queues.missingMileage > 0) nextAction = `Fix ${ctx.queues.missingMileage} missing mileage`;
    else if (ctx.report.totals.approvedEventCount > 0) nextAction = "Mark ready · print request";

    out.push({
      month,
      effectiveStatus: ctx.effectiveStatus,
      approvedCount: ctx.report.totals.approvedEventCount,
      totalReimbursement: ctx.report.totals.totalReimbursement,
      needsApproval: ctx.queues.needsApproval,
      missingMileage: ctx.queues.missingMileage,
      nextAction,
      reimbursementHref: `/admin/campaign-events/reimbursement?month=${month}`,
    });
  }
  return out;
}
