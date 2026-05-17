import type { BankImportAnalysis } from "../imports/types";

export type BankImportAgentSuggestion = {
  summary: string;
  nextReviewerActions: string[];
  guardrails: string[];
};

export function summarizeBankImportForReviewer(analysis: BankImportAnalysis): BankImportAgentSuggestion {
  return {
    summary: `Bank batch ${analysis.batch.id} has ${analysis.batch.rowCount} row(s), ${analysis.possibleDeposits} possible deposit(s), ${analysis.possibleExpenditures} possible expenditure(s), and ${analysis.possibleFees} possible fee(s).`,
    nextReviewerActions: [
      analysis.detectedCapabilities.dateColumn ? "Confirm the detected posted-date column." : "Identify the posted-date column.",
      analysis.detectedCapabilities.descriptionColumn ? "Confirm the detected memo/description column." : "Identify the memo/description column.",
      analysis.depositExpenseSignConvention === "unknown"
        ? "Confirm whether deposits are positive amounts or split into debit/credit columns."
        : `Confirm sign convention: ${analysis.depositExpenseSignConvention}.`,
      analysis.detectedCapabilities.processorInfoInMemo
        ? "Review processor memo text for GoodChange payout matching."
        : "Check whether processor names or payout IDs appear in bank descriptions.",
    ],
    guardrails: [
      "AI may explain unmatched deposits and suggest review actions only.",
      "AI cannot alter source files, delete transactions, or mark bank rows reconciled without human approval.",
    ],
  };
}
