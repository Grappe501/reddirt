import type { StagedCashContribution } from "../cash/types";

export type CashContributionIntakeAgentSummary = {
  summary: string;
  nextReviewerActions: string[];
  guardrails: string[];
};

export function summarizeCashContributionForReviewer(contribution: StagedCashContribution): CashContributionIntakeAgentSummary {
  return {
    summary: `Cash contribution ${contribution.id} is ${contribution.complianceStatus} for $${contribution.amount.toFixed(2)} with OCR confidence ${contribution.ocrExtraction?.confidence ?? "not_run"}.`,
    nextReviewerActions: [
      contribution.warnings.length ? `Review warnings: ${contribution.warnings.join("; ")}` : "No current warnings beyond required human review.",
      contribution.idChecked ? "Confirm ID check initials and method." : "Record ID check before approval if campaign policy requires it.",
      contribution.donorSlipPhotoPath ? "Compare donor slip image to editable fields." : "Attach or capture donor slip evidence if available.",
      "Approve only after contributor identity, amount, date, employer, occupation, and address are reviewed.",
    ],
    guardrails: [
      "AI can read donor slips, identify missing fields, flag unclear handwriting, compare entered amount to extracted amount, and draft review notes.",
      "AI cannot approve contributions, certify ID, decide legal compliance, alter source images, or hide missing fields.",
    ],
  };
}
