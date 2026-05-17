import type { CashContributionPolicy } from "./types";

export const defaultCashContributionPolicy: CashContributionPolicy = {
  maxCashContributionAmount: 100,
  idRequired: true,
  contributorInfoRequired: true,
  requireHumanReview: true,
  sourceNote:
    "Campaign working policy pending final Arkansas cash contribution rule verification with campaign counsel/compliance officer. Search references did not confirm exact cash-specific threshold language.",
};

export const cashPolicyNotice =
  "Campaign policy: cash over/at configured limits requires compliance review. Verify final rules with campaign counsel/compliance officer.";

export function evaluateCashPolicy(input: {
  amount: number;
  idChecked: boolean;
  donorNamePresent: boolean;
  contributorInfoComplete: boolean;
  policy?: CashContributionPolicy;
}): string[] {
  const policy = input.policy ?? defaultCashContributionPolicy;
  const warnings: string[] = [];

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    warnings.push("Amount missing or invalid.");
  }
  if (input.amount >= policy.maxCashContributionAmount) {
    warnings.push(`Amount is at or above configured cash review threshold of $${policy.maxCashContributionAmount}.`);
  }
  if (policy.idRequired && !input.idChecked) {
    warnings.push("ID check is required by campaign policy and has not been recorded.");
  }
  if (policy.contributorInfoRequired && !input.donorNamePresent) {
    warnings.push("Contributor name is required by campaign policy.");
  }
  if (policy.contributorInfoRequired && !input.contributorInfoComplete) {
    warnings.push("Contributor information is incomplete.");
  }
  if (policy.requireHumanReview) {
    warnings.push("Human compliance review is required before finalizing.");
  }

  return warnings;
}
