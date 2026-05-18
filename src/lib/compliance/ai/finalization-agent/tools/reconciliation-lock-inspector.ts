import { buildReconciliationWorkbench } from "../../../reconciliation/reconciliation-workbench-storage";
import type { FinalizationInspectorResult } from "../inspector-types";

export async function inspectReconciliationLocks(): Promise<FinalizationInspectorResult> {
  const workbench = await buildReconciliationWorkbench();
  const score = workbench.matches.length
    ? Math.round((workbench.lockedCount / workbench.matches.length) * 100)
    : workbench.unmatchedBankTransactions.length + workbench.unmatchedMoneyMovements.length
      ? 25
      : 70;
  return {
    id: "reconciliation-locks",
    label: "Reconciliation Lock Inspector",
    score,
    status: score >= 85 ? "green" : score >= 60 ? "yellow" : "red",
    explanation: `${workbench.lockedCount}/${workbench.matches.length} matches locked; ${workbench.unmatchedBankTransactions.length} unmatched bank rows.`,
  };
}
