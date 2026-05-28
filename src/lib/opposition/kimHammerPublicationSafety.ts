import type {
  KimHammerCitationStatus,
  KimHammerClaim,
  KimHammerExternalUseStatus,
  KimHammerLegalRisk,
  KimHammerPublicationTier,
  KimHammerReviewStatus,
} from "@/lib/opposition/types/kimHammerEvidence";
import { KIM_HAMMER_EXPORT_APPROVED_REVIEW_STATUSES } from "@/lib/opposition/types/kimHammerEvidence";

/** Export filter aligned with KH-4 debate packet export. */
export const KIM_HAMMER_EXPORT_FILTER = {
  externalUseStatus: "READY_WITH_CITATION" as KimHammerExternalUseStatus,
  citationStatus: "CITED" as KimHammerCitationStatus,
  confidenceTier: "TIER_1_PUBLIC_DEPLOYABLE" as KimHammerPublicationTier,
  legalRisk: "LOW" as KimHammerLegalRisk,
};

export type KimHammerPublicationSafetyRule = {
  id: string;
  description: string;
  severity: "BLOCKER" | "REVIEW_REQUIRED" | "RECOMMENDED";
};

export type KimHammerPublicationSafetyFile = {
  generatedAt: string;
  rules: KimHammerPublicationSafetyRule[];
};

export function getPublicationTier(claim: KimHammerClaim): KimHammerPublicationTier | undefined {
  return claim.confidenceTier ?? claim.verificationTier;
}

export function getExternalUseStatus(claim: KimHammerClaim): KimHammerExternalUseStatus | undefined {
  return claim.externalUseStatus ?? claim.publicationReadiness;
}

export function getLegalRiskLabel(claim: KimHammerClaim): KimHammerLegalRisk | "UNKNOWN" {
  return claim.legalRisk ?? "UNKNOWN";
}

export function getReviewStatus(claim: KimHammerClaim): KimHammerReviewStatus | undefined {
  return claim.reviewStatus;
}

export function getReviewStatusLabel(claim: KimHammerClaim): string {
  return claim.reviewStatus ?? "LEGACY_UNSET";
}

/**
 * Legacy compatibility: claims without reviewStatus pass the review export gate
 * so pre-Step-9 JSON continues to export when Tier 1 safety criteria are met.
 */
export function passesReviewExportGate(claim: KimHammerClaim): boolean {
  if (!claim.reviewStatus) {
    return true;
  }

  return KIM_HAMMER_EXPORT_APPROVED_REVIEW_STATUSES.includes(claim.reviewStatus);
}

export function passesTierOneSafetyCriteria(claim: KimHammerClaim): boolean {
  const tier = getPublicationTier(claim);
  return (
    getExternalUseStatus(claim) === KIM_HAMMER_EXPORT_FILTER.externalUseStatus &&
    claim.citationStatus === KIM_HAMMER_EXPORT_FILTER.citationStatus &&
    tier === KIM_HAMMER_EXPORT_FILTER.confidenceTier &&
    claim.legalRisk === KIM_HAMMER_EXPORT_FILTER.legalRisk
  );
}

function ruleTriggersBlocker(claim: KimHammerClaim, rule: KimHammerPublicationSafetyRule): boolean {
  const tier = getPublicationTier(claim);
  switch (rule.id) {
    case "rule-tier-4-block":
      return tier === "TIER_4_HIGH_CAUTION";
    case "rule-uncited-block":
      return claim.citationStatus === "UNCITED";
    default:
      return false;
  }
}

function ruleTriggersReview(claim: KimHammerClaim, rule: KimHammerPublicationSafetyRule): boolean {
  switch (rule.id) {
    case "rule-legal-medium-review":
      return claim.legalRisk === "MEDIUM" || claim.legalRisk === "HIGH";
    default:
      return false;
  }
}

function getRuleSafetyBlockers(
  claim: KimHammerClaim,
  rules: KimHammerPublicationSafetyRule[],
): string[] {
  return rules
    .filter((rule) => rule.severity === "BLOCKER" && ruleTriggersBlocker(claim, rule))
    .map((rule) => rule.id);
}

function getExportGateBlockers(claim: KimHammerClaim): string[] {
  const blockers: string[] = [];

  if (claim.citationStatus === "UNCITED") {
    blockers.push("gate-citation-uncited");
  } else if (claim.citationStatus === "PARTIAL") {
    blockers.push("gate-citation-partial");
  } else if (claim.citationStatus !== KIM_HAMMER_EXPORT_FILTER.citationStatus) {
    blockers.push("gate-citation-not-cited");
  }

  const tier = getPublicationTier(claim);
  if (tier === "TIER_2_NEEDS_CORROBORATION") {
    blockers.push("gate-tier-2");
  } else if (tier === "TIER_3_INTERNAL_ONLY") {
    blockers.push("gate-tier-3");
  } else if (tier === "TIER_4_HIGH_CAUTION") {
    blockers.push("gate-tier-4");
  } else if (tier !== KIM_HAMMER_EXPORT_FILTER.confidenceTier) {
    blockers.push("gate-tier-not-deployable");
  }

  if (claim.legalRisk === "MEDIUM") {
    blockers.push("gate-legal-risk-medium");
  } else if (claim.legalRisk === "HIGH") {
    blockers.push("gate-legal-risk-high");
  } else if (claim.legalRisk !== KIM_HAMMER_EXPORT_FILTER.legalRisk) {
    blockers.push("gate-legal-risk-not-low");
  }

  const externalUse = getExternalUseStatus(claim);
  if (externalUse === "DO_NOT_USE_EXTERNALLY") {
    blockers.push("gate-external-do-not-use");
  } else if (externalUse === "USE_WITH_CAUTION") {
    blockers.push("gate-external-use-with-caution");
  } else if (externalUse === "INTERNAL_ONLY") {
    blockers.push("gate-external-internal-only");
  } else if (externalUse !== KIM_HAMMER_EXPORT_FILTER.externalUseStatus) {
    blockers.push("gate-external-not-ready");
  }

  if (claim.reviewStatus === "BLOCKED") {
    blockers.push("gate-review-blocked");
  } else if (claim.reviewStatus && !passesReviewExportGate(claim)) {
    blockers.push("gate-review-not-approved-for-export");
  }

  return blockers;
}

export function getSafetyBlockers(
  claim: KimHammerClaim,
  rules: KimHammerPublicationSafetyRule[] = [],
): string[] {
  const blockers = [...getRuleSafetyBlockers(claim, rules)];

  if (!canExportClaim(claim)) {
    blockers.push(...getExportGateBlockers(claim));
  }

  return [...new Set(blockers)];
}

export function canExportClaim(claim: KimHammerClaim): boolean {
  return passesTierOneSafetyCriteria(claim) && passesReviewExportGate(claim);
}

export function evaluateClaimSafety(
  claim: KimHammerClaim,
  rules: KimHammerPublicationSafetyRule[],
): { blocked: boolean; reviewNeeded: boolean; safetyBlockers: string[] } {
  const safetyBlockers = getRuleSafetyBlockers(claim, rules);

  const blocked =
    safetyBlockers.length > 0 ||
    getExternalUseStatus(claim) === "DO_NOT_USE_EXTERNALLY" ||
    claim.reviewStatus === "BLOCKED";

  const reviewNeeded =
    blocked ||
    claim.humanReviewRequired === true ||
    claim.reviewStatus === "NEEDS_REVIEW" ||
    claim.reviewStatus === "DRAFT" ||
    rules.some((rule) => rule.severity === "REVIEW_REQUIRED" && ruleTriggersReview(claim, rule));

  return { blocked, reviewNeeded, safetyBlockers };
}
