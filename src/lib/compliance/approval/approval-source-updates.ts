import { loadStagedCashContributions, saveStagedCashContributions } from "../cash/cash-storage";
import { loadStagedMoneyMovements, saveStagedMoneyMovements } from "../money/money-movement-storage";
import { loadStagedReceipts, saveStagedReceipts } from "../receipts/receipt-storage";
import { loadReconciliationMatches, saveReconciliationMatches } from "../reconciliation/reconciliation-workbench-storage";
import type { ApprovalItem, ApprovalItemSource } from "./approval-types";

export async function applyApprovalToSourceRecord(
  item: ApprovalItem,
  status: "approved" | "approved_with_changes" | "needs_info" | "rejected" | "duplicate" | "skipped",
  actorInitials: string,
): Promise<{ ok: boolean; sourceUpdatePending: boolean }> {
  try {
    switch (item.source) {
      case "manual_money_movement":
      case "goodchange_contribution":
      case "processor_fee":
      case "loan":
      case "debt":
        return updateMoneyMovement(item.sourceRecordId, status, actorInitials);
      case "receipt_expense":
        return updateReceipt(item.sourceRecordId, status, actorInitials);
      case "cash_contribution":
        return updateCash(item.sourceRecordId, status, actorInitials);
      case "bank_transaction":
        return updateReconciliationMatch(item.sourceRecordId, status, actorInitials);
      case "vendor_payment":
      case "staff_1099_payment":
        return updateMoneyMovement(item.sourceRecordId, status, actorInitials);
      default:
        return { ok: true, sourceUpdatePending: true };
    }
  } catch {
    return { ok: false, sourceUpdatePending: true };
  }
}

async function updateMoneyMovement(
  id: string,
  status: string,
  initials: string,
): Promise<{ ok: boolean; sourceUpdatePending: boolean }> {
  const movements = await loadStagedMoneyMovements();
  const index = movements.findIndex((movement) => movement.id === id);
  if (index < 0) return { ok: false, sourceUpdatePending: true };
  const now = new Date().toISOString();
  movements[index] = {
    ...movements[index],
    reviewStatus: mapMoneyReview(status),
    approvalStatus: status === "approved" || status === "approved_with_changes" ? "approved" : status === "rejected" ? "rejected" : movements[index].approvalStatus,
    updatedAt: now,
    memo: [movements[index].memo, `Approval ${status} by ${initials}`].filter(Boolean).join(" · "),
  };
  await saveStagedMoneyMovements(movements);
  return { ok: true, sourceUpdatePending: false };
}

async function updateReceipt(id: string, status: string, initials: string) {
  const receipts = await loadStagedReceipts();
  const index = receipts.findIndex((receipt) => receipt.id === id);
  if (index < 0) return { ok: false, sourceUpdatePending: true };
  const now = new Date().toISOString();
  receipts[index] = {
    ...receipts[index],
    reviewStatus: status === "approved" || status === "approved_with_changes" ? "approved" : status === "rejected" ? "rejected" : "needs_review",
    approvalStatus: status === "approved" || status === "approved_with_changes" ? "approved" : "not_approved",
  };
  await saveStagedReceipts(receipts);
  return { ok: true, sourceUpdatePending: false };
}

async function updateCash(id: string, status: string, initials: string) {
  const cash = await loadStagedCashContributions();
  const index = cash.findIndex((row) => row.id === id);
  if (index < 0) return { ok: false, sourceUpdatePending: true };
  cash[index] = {
    ...cash[index],
    complianceStatus: status === "approved" || status === "approved_with_changes" ? "approved" : status === "rejected" ? "rejected" : "needs_review",
    approvalStatus: status === "approved" || status === "approved_with_changes" ? "approved" : status === "rejected" ? "rejected" : "not_approved",
    notes: [cash[index].notes, `${status} by ${initials}`].filter(Boolean).join(" · "),
  };
  await saveStagedCashContributions(cash);
  return { ok: true, sourceUpdatePending: false };
}

async function updateReconciliationMatch(id: string, status: string, initials: string) {
  const matches = await loadReconciliationMatches();
  const index = matches.findIndex((match) => match.id === id);
  if (index < 0) return { ok: false, sourceUpdatePending: true };
  const now = new Date().toISOString();
  matches[index] = {
    ...matches[index],
    status: status === "approved" || status === "approved_with_changes" ? "approved" : matches[index].status,
    reviewerInitials: initials,
    approvedAt: status === "approved" || status === "approved_with_changes" ? now : matches[index].approvedAt,
    updatedAt: now,
  };
  await saveReconciliationMatches(matches);
  return { ok: true, sourceUpdatePending: false };
}

function mapMoneyReview(status: string) {
  if (status === "approved" || status === "approved_with_changes") return "approved" as const;
  if (status === "rejected") return "rejected" as const;
  return "needs_review" as const;
}

export function sourceLabel(source: ApprovalItemSource): string {
  return source.replace(/_/g, " ");
}
