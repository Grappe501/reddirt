import type { GoodChangeImportAnalysis } from "../imports/types";

export type GoodChangeImportAgentSuggestion = {
  summary: string;
  nextReviewerActions: string[];
  guardrails: string[];
};

export function summarizeGoodChangeImportForReviewer(analysis: GoodChangeImportAnalysis): GoodChangeImportAgentSuggestion {
  const missingEmployer = analysis.stagedContributions.filter((row) => row.missingFields.includes("employer")).length;
  const missingOccupation = analysis.stagedContributions.filter((row) => row.missingFields.includes("occupation")).length;
  const needsReview = analysis.stagedContributions.filter((row) => row.complianceStatus !== "ready").length;

  return {
    summary: `GoodChange batch ${analysis.batch.id} has ${analysis.batch.rowCount} row(s), ${needsReview} row(s) needing review, mapping confidence ${analysis.fieldMapping.confidenceScore}.`,
    nextReviewerActions: [
      analysis.fieldMapping.unmappedRequiredFields.length
        ? `Confirm column mappings for: ${analysis.fieldMapping.unmappedRequiredFields.join(", ")}.`
        : "Review inferred column mappings before staging any final records.",
      missingEmployer ? `Collect or verify employer for ${missingEmployer} row(s).` : "Employer field appears available or not currently missing.",
      missingOccupation ? `Collect or verify occupation for ${missingOccupation} row(s).` : "Occupation field appears available or not currently missing.",
      analysis.duplicateRisks.length ? "Review duplicate-risk rows before Pass 2 promotion." : "No deterministic duplicate risk found in this batch.",
    ],
    guardrails: [
      "AI may suggest mappings and reviewer actions only.",
      "AI cannot finalize filing records, certify compliance, alter source files, delete records, or mark rows reconciled.",
    ],
  };
}
