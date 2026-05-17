import type { StagedReceiptExpense } from "../../receipts/receipt-types";

export type ReceiptDuplicateRisk = {
  receiptId: string;
  confidence: "high" | "medium" | "low";
  explanation: string;
};

export function detectReceiptDuplicates(receipt: StagedReceiptExpense, existing: StagedReceiptExpense[]): ReceiptDuplicateRisk[] {
  const risks: ReceiptDuplicateRisk[] = [];
  for (const candidate of existing) {
    if (receipt.imageHash && candidate.imageHash === receipt.imageHash) {
      risks.push({ receiptId: candidate.id, confidence: "high", explanation: `Possible duplicate receipt found: same image hash as ${candidate.id}.` });
      continue;
    }
    const sameVendor = normalize(candidate.vendorName) && normalize(candidate.vendorName) === normalize(receipt.vendorName);
    const sameDate = candidate.receiptDate && receipt.receiptDate && candidate.receiptDate === receipt.receiptDate;
    const sameTotal = Math.abs((candidate.total ?? 0) - (receipt.total ?? 0)) < 0.01;
    if (sameVendor && sameDate && sameTotal) {
      risks.push({ receiptId: candidate.id, confidence: "high", explanation: `Possible duplicate receipt found: same vendor/date/total as ${candidate.id}.` });
    }
    if (receipt.cardLastFour && candidate.cardLastFour === receipt.cardLastFour && sameDate && sameTotal) {
      risks.push({ receiptId: candidate.id, confidence: "medium", explanation: `Possible duplicate receipt found: same card/date/amount as ${candidate.id}.` });
    }
    if (receipt.bankTransactionId && candidate.bankTransactionId === receipt.bankTransactionId) {
      risks.push({ receiptId: candidate.id, confidence: "high", explanation: `Possible duplicate receipt found: same bank transaction as ${candidate.id}.` });
    }
  }
  return risks.slice(0, 5);
}

function normalize(value: string | undefined): string {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}
