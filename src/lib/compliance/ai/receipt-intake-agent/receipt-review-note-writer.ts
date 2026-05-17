import type { StagedReceiptExpense } from "../../receipts/receipt-types";

export function writeReceiptReviewNote(receipt: StagedReceiptExpense): string {
  const parts = [
    `${receipt.vendorName ?? "Unknown vendor"} receipt for $${receipt.total.toFixed(2)}.`,
    `Payment method: ${receipt.paymentMethod}.`,
    `Tip status: ${receipt.tipStatus}${receipt.tip ? ` ($${receipt.tip.toFixed(2)})` : ""}.`,
    receipt.businessPurpose ? `Purpose: ${receipt.businessPurpose}.` : "Purpose needs human confirmation.",
    receipt.warnings.length ? `Warnings: ${receipt.warnings.join(" ")}` : "No deterministic warnings.",
  ];
  return parts.join(" ");
}
