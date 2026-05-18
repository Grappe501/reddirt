import { appendMoneyAuditLog, createStagedMoneyMovement } from "../money/money-movement-storage";
import type { MoneyMovementCategory } from "../money/money-movement-types";
import { appendReceiptAuditLog, loadStagedReceipts, saveStagedReceipts } from "./receipt-storage";
import type { StagedReceiptExpense } from "./receipt-types";

export async function convertReceiptToMoneyMovement(input: {
  receiptId: string;
  actorInitials: string;
  conversionMode?: "expense" | "reimbursement";
  note?: string;
}): Promise<StagedReceiptExpense> {
  const receipts = await loadStagedReceipts();
  const receipt = receipts.find((item) => item.id === input.receiptId);
  if (!receipt) throw new Error("Receipt not found.");
  if (receipt.approvalStatus !== "approved" && receipt.reviewStatus !== "approved") {
    throw new Error("Receipt must be approved by a human before money movement conversion.");
  }
  const blockers = receiptApprovalBlockers(receipt);
  if (blockers.length) {
    throw new Error(`Receipt is not ready to stage: ${blockers.join("; ")}`);
  }
  if (receipt.moneyMovementId) return receipt;
  const movement = await createStagedMoneyMovement({
    source: "receipt_intake",
    direction: "out",
    category: mapReceiptCategory(receipt, input.conversionMode),
    amount: receipt.total,
    transactionDate: receipt.receiptDate,
    name: receipt.vendorName,
    entityType: "vendor",
    paymentMethod: mapPaymentMethod(receipt),
    checkNumber: receipt.checkNumber,
    description: `Receipt intake: ${receipt.category}`,
    purpose: receipt.businessPurpose,
    memo: receipt.tip ? `Tip verified: ${receipt.tipStatus}; tip $${receipt.tip.toFixed(2)}.` : `Tip verified: ${receipt.tipStatus}.`,
    documentationStatus: "complete",
    reviewStatus: "ready_for_approval",
    approvalStatus: "approved",
    reconciliationStatus: "awaiting_bank_match",
    sourceRefs: [receipt.id, receipt.imageHash ? `image:${receipt.imageHash}` : "receipt:no-image-hash"],
    actorInitials: input.actorInitials,
    sourceRoute: "/admin/compliance/receipts/review",
  });
  const now = new Date().toISOString();
  const next: StagedReceiptExpense = {
    ...receipt,
    moneyMovementId: movement.id,
    reviewStatus: "staged_to_money_movement",
    approvalStatus: "approved",
    documentationStatus: "complete",
    reconciliationStatus: "awaiting_bank_match",
  };
  const receiptAuditId = `receipt-audit-${Date.now()}`;
  next.auditLogIds = [receiptAuditId, ...receipt.auditLogIds].slice(0, 50);
  await saveStagedReceipts(receipts.map((item) => (item.id === receipt.id ? next : item)));
  await appendReceiptAuditLog({
    id: receiptAuditId,
    receiptId: receipt.id,
    moneyMovementId: movement.id,
    actorInitials: input.actorInitials.trim().toUpperCase() || "UNK",
    action: "staged_to_money_movement",
    before: receipt,
    after: next,
    note: input.note,
    createdAt: now,
  });
  await appendMoneyAuditLog({
    id: `money-audit-${Date.now()}-receipt-link`,
    moneyMovementId: movement.id,
    actorInitials: input.actorInitials.trim().toUpperCase() || "UNK",
    action: "converted_to_compliance_ledger",
    note: `Linked to receipt ${receipt.id}.`,
    sourceRoute: "/admin/compliance/receipts/review",
    createdAt: now,
  });
  return next;
}

export async function approveReceipt(input: { receiptId: string; actorInitials: string; note?: string }): Promise<StagedReceiptExpense> {
  const receipts = await loadStagedReceipts();
  const receipt = receipts.find((item) => item.id === input.receiptId);
  if (!receipt) throw new Error("Receipt not found.");
  const blockers = receiptApprovalBlockers(receipt);
  if (blockers.length) {
    throw new Error(`Receipt is not ready for approval: ${blockers.join("; ")}`);
  }
  const next: StagedReceiptExpense = {
    ...receipt,
    reviewStatus: "approved",
    approvalStatus: "approved",
    documentationStatus: receipt.imagePath || receipt.extraction ? "complete" : receipt.documentationStatus,
  };
  const auditId = `receipt-audit-${Date.now()}`;
  next.auditLogIds = [auditId, ...receipt.auditLogIds].slice(0, 50);
  await saveStagedReceipts(receipts.map((item) => (item.id === receipt.id ? next : item)));
  await appendReceiptAuditLog({
    id: auditId,
    receiptId: receipt.id,
    actorInitials: input.actorInitials.trim().toUpperCase() || "UNK",
    action: "approved",
    before: receipt,
    after: next,
    note: input.note,
    createdAt: new Date().toISOString(),
  });
  return next;
}

export function receiptApprovalBlockers(receipt: StagedReceiptExpense): string[] {
  return [
    !receipt.vendorName ? "missing vendor" : undefined,
    !receipt.receiptDate ? "missing receipt date" : undefined,
    !receipt.total || receipt.total <= 0 ? "missing total" : undefined,
    receipt.tipStatus === "not_sure" ? "tip status needs verification" : undefined,
    receipt.paymentMethod === "unknown" ? "payment method needs verification" : undefined,
    receipt.category === "unknown" ? "expense category needs review" : undefined,
    !receipt.businessPurpose ? "missing campaign business purpose" : undefined,
    !receipt.imagePath && !receipt.extraction ? "missing receipt image or extraction" : undefined,
  ].filter((blocker): blocker is string => Boolean(blocker));
}

function mapReceiptCategory(receipt: StagedReceiptExpense, conversionMode?: "expense" | "reimbursement"): MoneyMovementCategory {
  if (conversionMode === "reimbursement" || receipt.paymentMethod === "personal_reimbursement") return "travel_reimbursement";
  if (receipt.paymentMethod === "cash") return "cash_expense";
  if (receipt.category === "bank_fee") return "bank_fee";
  if (receipt.category === "staff_payment" || receipt.category === "consulting") return "staff_1099_payment";
  return "vendor_payment";
}

function mapPaymentMethod(receipt: StagedReceiptExpense) {
  if (receipt.paymentMethod === "campaign_card") return "debit_card" as const;
  if (receipt.paymentMethod === "campaign_check") return "check" as const;
  if (receipt.paymentMethod === "cash") return "cash" as const;
  return "other" as const;
}
