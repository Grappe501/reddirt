import type { ReconciliationAnalysis } from "../imports/types";

export type ReconciliationAgentSuggestion = {
  summary: string;
  nextReviewerActions: string[];
  guardrails: string[];
};

export function summarizeReconciliationForReviewer(analysis: ReconciliationAnalysis): ReconciliationAgentSuggestion {
  return {
    summary: `Reconciliation preview found ${analysis.candidates.length} candidate(s): ${analysis.summary.highConfidence} high, ${analysis.summary.mediumConfidence} medium, ${analysis.summary.lowConfidence} low confidence.`,
    nextReviewerActions: [
      analysis.summary.highConfidence ? "Review high-confidence matches for batch/date reasonableness." : "No high-confidence matches yet; provide real GoodChange and bank samples.",
      analysis.summary.manualRequired ? `Manually review ${analysis.summary.manualRequired} candidate(s).` : "No manual review candidates were generated.",
      "Confirm processor fee treatment before any contribution records are promoted.",
      "Confirm whether GoodChange rows are individual donations, payout-level rows, or mixed.",
    ],
    guardrails: [
      "AI may explain unmatched deposits and suspicious duplicates only.",
      "AI cannot certify compliance, finalize filing records, or mark bank transactions reconciled without human approval.",
    ],
  };
}
