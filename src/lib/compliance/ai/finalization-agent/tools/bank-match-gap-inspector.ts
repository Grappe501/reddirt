import { loadBankAnalyses } from "../../../storage";
import { buildReconciliationWorkbench } from "../../../reconciliation/reconciliation-workbench-storage";
import type { FinalizationInspectorResult } from "../inspector-types";

export async function inspectBankMatchGaps(): Promise<FinalizationInspectorResult> {
  const [bank, workbench] = await Promise.all([loadBankAnalyses(), buildReconciliationWorkbench()]);
  const unmatched = workbench.unmatchedBankTransactions.length + workbench.unmatchedMoneyMovements.length;
  const score = bank.length && unmatched === 0 ? 85 : bank.length ? 50 : 25;
  return {
    id: "bank-match-gaps",
    label: "Bank Match Gap Inspector",
    score,
    status: score >= 80 ? "green" : score >= 50 ? "yellow" : "red",
    explanation: bank.length
      ? `${bank.length} bank batch(es); ${unmatched} unmatched row(s) remain.`
      : "No bank CSV analyzed — upload statement sample for memo/debit/credit conventions.",
  };
}
