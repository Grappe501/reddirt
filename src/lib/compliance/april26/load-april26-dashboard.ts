import { loadApprovalItems, loadApprovalQueues } from "../approval/approval-storage";
import { APRIL_2026_QUEUE_ID } from "../approval/build-approval-queue";
import { computeQueueStats } from "../approval/load-approval-queue";
import { buildReconciliationWorkbench } from "../reconciliation/reconciliation-workbench-storage";
import { loadStagedMoneyMovements } from "../money/money-movement-storage";
import {
  loadApril26AiChunks,
  loadApril26IngestSummary,
  loadApril26PayoutBatches,
  loadApril26ReconciliationCandidates,
  loadApril26SourceDocuments,
} from "./april26-ingest-storage";
import { discoverApril26Sources } from "./discover-april26-sources";
import { BANK_CSV_NAME, getApril26Dir } from "./paths";

export async function loadApril26Dashboard() {
  const [
    inventory,
    summary,
    registry,
    chunks,
    payoutBatches,
    reconciliationCandidates,
    movements,
    workbench,
    approvalItems,
    approvalQueues,
  ] = await Promise.all([
    discoverApril26Sources(),
    loadApril26IngestSummary(),
    loadApril26SourceDocuments(),
    loadApril26AiChunks(),
    loadApril26PayoutBatches(),
    loadApril26ReconciliationCandidates(),
    loadStagedMoneyMovements(),
    buildReconciliationWorkbench(),
    loadApprovalItems(),
    loadApprovalQueues(),
  ]);

  const aprilMovements = movements.filter((movement) => movement.id.startsWith("april26-"));
  const aprilQueue = approvalQueues.find((queue) => queue.id === APRIL_2026_QUEUE_ID);
  const aprilItems = approvalItems.filter((item) => item.queueId === APRIL_2026_QUEUE_ID);
  const approvalStats = computeQueueStats(aprilItems);

  const bankCsvPath = `${getApril26Dir()}\\${BANK_CSV_NAME}`;

  return {
    inventory,
    summary,
    registry,
    registrySummary: {
      total: registry.length,
      pendingExtraction: registry.filter((doc) => doc.extractionStatus === "pending").length,
    },
    chunks: { count: chunks.length },
    payoutBatches,
    reconciliationCandidates,
    aprilMovements: {
      total: aprilMovements.length,
      contributions: aprilMovements.filter((movement) => movement.direction === "in").length,
      expenses: aprilMovements.filter((movement) => movement.direction === "out" && movement.category !== "processor_fee").length,
    },
    workbench: {
      unmatchedBank: workbench.unmatchedBankTransactions.length,
      unmatchedMoney: workbench.unmatchedMoneyMovements.length,
      lockedCount: workbench.lockedCount,
    },
    approval: {
      queueLabel: aprilQueue?.label ?? "April 2026 Compliance Review",
      stats: approvalStats,
    },
    bankCsvPath,
    bankCsvPresent: inventory.bankCsvFound,
    reconciliationBlockers: summary?.reconciliationBlockers ?? (inventory.bankCsvFound ? [] : [
      `Bank CSV required to complete reconciliation. Expected file: ${bankCsvPath} (headers: date, amount, memo; credits positive).`,
    ]),
  };
}
