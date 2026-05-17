import type { StagedReceiptExpense } from "../../receipts/receipt-types";

export function scoreReceiptReadiness(receipt: StagedReceiptExpense): {
  reviewStatus: StagedReceiptExpense["reviewStatus"];
  documentationStatus: StagedReceiptExpense["documentationStatus"];
  warnings: string[];
} {
  const warnings = [
    !receipt.vendorName ? "Missing vendor/merchant." : undefined,
    !receipt.receiptDate ? "Missing receipt date." : undefined,
    !receipt.total || receipt.total <= 0 ? "Missing receipt total." : undefined,
    receipt.tipStatus === "not_sure" ? "Tip status needs human verification." : undefined,
    receipt.paymentMethod === "unknown" ? "Payment method needs human verification." : undefined,
    receipt.category === "unknown" ? "Expense category needs review." : undefined,
    !receipt.businessPurpose ? "Missing campaign business purpose." : undefined,
    !receipt.imagePath && !receipt.extraction ? "Missing receipt image or extraction." : undefined,
  ].filter((warning): warning is string => Boolean(warning));
  const documentationStatus: StagedReceiptExpense["documentationStatus"] = warnings.length
    ? receipt.imagePath
      ? "needs_human_review"
      : "missing_receipt"
    : "complete";
  const reviewStatus: StagedReceiptExpense["reviewStatus"] =
    receipt.approvalStatus === "approved"
      ? "approved"
      : warnings.length
        ? "needs_review"
        : "ready_for_approval";
  return { reviewStatus, documentationStatus, warnings };
}
