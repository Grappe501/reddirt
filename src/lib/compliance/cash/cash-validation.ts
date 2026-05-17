import { defaultCashContributionPolicy } from "./cash-policy";
import type { CashContributionPolicy, StagedCashContribution } from "./types";

export function validateStagedCashContribution(input: {
  contribution: Omit<StagedCashContribution, "complianceStatus" | "warnings" | "auditLogIds"> & {
    warnings?: string[];
  };
  existing: StagedCashContribution[];
  policy?: CashContributionPolicy;
}): {
  complianceStatus: StagedCashContribution["complianceStatus"];
  missingFields: string[];
  warnings: string[];
} {
  const policy = input.policy ?? defaultCashContributionPolicy;
  const contribution = input.contribution;
  const donorNamePresent = Boolean(contribution.donorFullName || (contribution.donorFirstName && contribution.donorLastName));
  const missingFields = [
    !Number.isFinite(contribution.amount) || contribution.amount <= 0 ? "amount" : undefined,
    !donorNamePresent ? "donor name" : undefined,
    !contribution.donorAddress1 ? "address" : undefined,
    !contribution.donorCity || !contribution.donorState || !contribution.donorZip ? "city/state/zip" : undefined,
    !contribution.employer ? "employer" : undefined,
    !contribution.occupation ? "occupation" : undefined,
    policy.idRequired && !contribution.idChecked ? "ID checked" : undefined,
    !contribution.donorSlipPhotoPath ? "donor slip photo" : undefined,
  ].filter((field): field is string => Boolean(field));

  const duplicateWarnings = findDuplicateWarnings(contribution, input.existing);
  const ocrWarnings =
    contribution.ocrExtraction?.confidence === "low" ? ["OCR confidence is low; manual review required."] : [];
  const warnings = [
    ...(contribution.warnings ?? []),
    ...duplicateWarnings,
    ...ocrWarnings,
    contribution.amount >= policy.maxCashContributionAmount
      ? `Amount is at or above configured cash review threshold of $${policy.maxCashContributionAmount}.`
      : undefined,
  ].filter((warning): warning is string => Boolean(warning));

  const complianceStatus: StagedCashContribution["complianceStatus"] =
    contribution.approvalStatus === "approved"
      ? "approved"
      : contribution.approvalStatus === "rejected"
        ? "rejected"
        : contribution.amount > policy.maxCashContributionAmount
          ? "amount_over_cash_limit"
          : missingFields.length
            ? "missing_required_fields"
            : "ready_for_approval";

  return { complianceStatus, missingFields, warnings };
}

function findDuplicateWarnings(
  contribution: Omit<StagedCashContribution, "complianceStatus" | "warnings" | "auditLogIds">,
  existing: StagedCashContribution[],
): string[] {
  const donor = normalizeName(contribution.donorFullName || `${contribution.donorFirstName ?? ""} ${contribution.donorLastName ?? ""}`);
  const sameDateAmount = existing.find((row) => {
    const existingDonor = normalizeName(row.donorFullName || `${row.donorFirstName ?? ""} ${row.donorLastName ?? ""}`);
    return existingDonor && existingDonor === donor && row.contributionDate === contribution.contributionDate && row.amount === contribution.amount;
  });
  const sameEvent = existing.find((row) => {
    const existingDonor = normalizeName(row.donorFullName || `${row.donorFirstName ?? ""} ${row.donorLastName ?? ""}`);
    return existingDonor && existingDonor === donor && row.eventSource && row.eventSource === contribution.eventSource;
  });

  return [
    sameDateAmount ? "Duplicate possible: same donor, date, and amount already staged." : undefined,
    sameEvent ? "Duplicate possible: same donor and event/source already staged." : undefined,
  ].filter((warning): warning is string => Boolean(warning));
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
