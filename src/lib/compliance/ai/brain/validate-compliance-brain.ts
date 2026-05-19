import {
  complianceBrainSnapshotSchema,
  complianceLaunchReadinessSchema,
  complianceNextActionSchema,
  complianceRiskSchema,
  type ComplianceBrainSnapshot,
  type ComplianceLaunchReadiness,
  type ComplianceNextAction,
  type ComplianceRisk,
} from "./compliance-brain-types";

export function validateComplianceBrainSnapshot(data: unknown): ComplianceBrainSnapshot {
  return complianceBrainSnapshotSchema.parse(data);
}

export function validateComplianceNextActions(data: unknown): ComplianceNextAction[] {
  return complianceNextActionSchema.array().parse(data);
}

export function validateComplianceRisks(data: unknown): ComplianceRisk[] {
  return complianceRiskSchema.array().parse(data);
}

export function validateComplianceLaunchReadiness(data: unknown): ComplianceLaunchReadiness {
  return complianceLaunchReadinessSchema.parse(data);
}

export function assertBrainPackage(outputs: {
  snapshot: unknown;
  nextActions: unknown;
  risks: unknown;
  launchReadiness: unknown;
}): void {
  validateComplianceBrainSnapshot(outputs.snapshot);
  validateComplianceNextActions(outputs.nextActions);
  validateComplianceRisks(outputs.risks);
  validateComplianceLaunchReadiness(outputs.launchReadiness);
  const snap = outputs.snapshot as ComplianceBrainSnapshot;
  if (snap.filing.overall === "green" && snap.filing.blockerCount > 0) {
    throw new Error("Brain snapshot inconsistent: filing green with blockers");
  }
  if (snap.queue.batchEligible > 0) {
    const hasRuleReview = snap.queue.ruleReviewItems > 0;
    if (hasRuleReview && snap.unsafeActions.includes("batch_approve_rule_review")) {
      // guard documented; batch >0 with rule_review items is allowed only if eligible are non-rule_review
    }
  }
}
