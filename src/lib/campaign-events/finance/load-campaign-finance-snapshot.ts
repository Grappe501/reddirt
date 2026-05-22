import { loadCampaignEventsWorkbench } from "../load-workbench-events";
import { loadReimbursementMonthStatusContext } from "../travel-reimbursement/reimbursement-month-status";
import { listFinanceDocumentsForMonth } from "./finance-document-store";
import { buildCampaignFinanceSummary, detectReimbursementExceptions, derivePipelineStatus } from "./finance-helpers";
import { loadReimbursementMonthOperations } from "./reimbursement-operations-store";
import { REIMBURSEMENT_PIPELINE_LABELS } from "./reimbursement-operations-types";

export type CampaignFinanceSnapshot = {
  month: string;
  pipelineLabel: string;
  approvedReimbursement: number;
  pendingApprovals: number;
  missingMileage: number;
  receiptCount: number;
  pendingReceipts: number;
  exceptionCount: number;
  topBlockers: string[];
  countySpendNotes: string[];
};

export async function loadCampaignFinanceSnapshot(month = "2026-03"): Promise<CampaignFinanceSnapshot> {
  const { rows, period } = await loadCampaignEventsWorkbench({ period: month });
  const ctx = await loadReimbursementMonthStatusContext(rows, period);
  const docs = await listFinanceDocumentsForMonth(period);
  const summary = await buildCampaignFinanceSummary(rows, period);
  const ops = await loadReimbursementMonthOperations(period);
  const exceptions = detectReimbursementExceptions(rows, period);
  const pipeline = ops?.pipelineStatus ?? derivePipelineStatus(ctx, docs.filter((d) => d.approvalStatus !== "approved").length);

  const countyTotals = new Map<string, number>();
  for (const row of rows) {
    const c = row.county ?? "Unknown";
    countyTotals.set(c, (countyTotals.get(c) ?? 0) + (row.reimbursementAmount ?? 0));
  }
  const countySpendNotes = [...countyTotals.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c, v]) => `${c}: $${v.toFixed(2)}`);

  const topBlockers = [
    ...ctx.blockingFinalize.slice(0, 2),
    ...exceptions.filter((e) => e.severity === "high").map((e) => e.message).slice(0, 2),
  ].slice(0, 4);

  return {
    month: period,
    pipelineLabel: REIMBURSEMENT_PIPELINE_LABELS[pipeline],
    approvedReimbursement: summary.approvedReimbursement,
    pendingApprovals: summary.pendingApprovals,
    missingMileage: summary.missingMileage,
    receiptCount: summary.receiptCount,
    pendingReceipts: summary.pendingReceipts,
    exceptionCount: exceptions.length,
    topBlockers,
    countySpendNotes,
  };
}
