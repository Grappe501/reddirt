import type { ApprovalItem } from "./approval-types";

export type ApprovalGuardResult = {
  canApprove: boolean;
  canApproveWithChanges: boolean;
  blockers: string[];
  warnings: string[];
  overrideAllowed: boolean;
};

export function evaluateApprovalGuards(item: ApprovalItem, overrides?: { overrideReason?: string }): ApprovalGuardResult {
  const blockers = [...item.blockers];
  const warnings = [...item.warnings];

  if (item.missingFields.length) {
    blockers.push(`Required fields missing: ${item.missingFields.join(", ")}`);
  }
  if (!item.evidence.length) {
    blockers.push("Evidence missing — approval blocked unless override reason is entered.");
  }
  if (item.fields.some((field) => field.validationStatus === "blocked")) {
    blockers.push("One or more fields are blocked.");
  }
  if (item.riskLevel === "blocked") {
    blockers.push("Item risk level is blocked.");
  }
  if (item.aiRecommendation === "duplicate") {
    warnings.push("AI flagged possible duplicate.");
  }
  if (item.sourceUpdatePending) {
    warnings.push("Source record update path pending — approval recorded on workbench only.");
  }

  const overrideAllowed = blockers.length > 0;
  const canApprove = blockers.length === 0 || Boolean(overrides?.overrideReason?.trim());
  return {
    canApprove,
    canApproveWithChanges: canApprove,
    blockers,
    warnings,
    overrideAllowed,
  };
}
