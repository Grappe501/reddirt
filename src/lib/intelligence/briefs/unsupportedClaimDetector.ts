import type { ClassifiedClaim } from "./claimClassification";
import { classifyEvidencePacketClaims } from "./claimClassification";
import type { EvidencePacket } from "./evidencePacketTypes";

export type UnsupportedClaimRiskSummary = {
  unsupportedCount: number;
  needsReviewCount: number;
  criticalPublicUseRiskCount: number;
  blocksPublicAdaptation: boolean;
  warnings: string[];
  recommendedResearchTasks: string[];
};

export function detectUnsupportedClaims(evidencePacket: EvidencePacket): ClassifiedClaim[] {
  const classified = classifyEvidencePacketClaims(evidencePacket);
  return classified.filter(
    (c) => c.classification === "UNSUPPORTED" || c.classification === "NEEDS_REVIEW",
  );
}

export function summarizeUnsupportedClaimRisk(
  evidencePacket: EvidencePacket,
): UnsupportedClaimRiskSummary {
  const classified = classifyEvidencePacketClaims(evidencePacket);
  const unsupported = classified.filter((c) => c.classification === "UNSUPPORTED");
  const needsReview = classified.filter((c) => c.classification === "NEEDS_REVIEW");
  const critical = classified.filter((c) => c.publicUseRisk === "CRITICAL" || c.publicUseRisk === "HIGH");

  const warnings = [
    ...evidencePacket.unsupportedClaimWarnings,
    ...unsupported.map((c) => `UNSUPPORTED: ${c.claimText.slice(0, 120)}`),
    ...needsReview.slice(0, 5).map((c) => `NEEDS_REVIEW: ${c.claimText.slice(0, 120)}`),
  ];

  const recommendedResearchTasks = evidencePacket.researchGaps
    .filter((g) => g.blocksPublicUse || g.severity === "HIGH" || g.severity === "CRITICAL")
    .map((g) => g.description)
    .slice(0, 8);

  if (evidencePacket.generationContext.shellCounty) {
    warnings.push("SHELL_ONLY county — sparse evidence; do not produce confident county messaging");
  }
  if (evidencePacket.generationContext.oppositionArchiveThin) {
    warnings.push("Opposition archive thin — opposition claims require extra verification");
  }
  if ((evidencePacket.generationContext.debateClipCount ?? 0) < 2) {
    warnings.push("Debate clip archive thin — debate claims are gap-driven");
  }

  const blocksPublicAdaptation =
    unsupported.length > 0 ||
    needsReview.length > 3 ||
    evidencePacket.generationContext.shellCounty === true ||
    evidencePacket.riskLevel === "CRITICAL";

  return {
    unsupportedCount: unsupported.length,
    needsReviewCount: needsReview.length,
    criticalPublicUseRiskCount: critical.length,
    blocksPublicAdaptation,
    warnings,
    recommendedResearchTasks,
  };
}

export function blockPublicReadyStatusIfUnsupportedClaims(evidencePacket: EvidencePacket): {
  publicBriefReady: false;
  reason: string;
} {
  const risk = summarizeUnsupportedClaimRisk(evidencePacket);
  if (risk.blocksPublicAdaptation) {
    return {
      publicBriefReady: false,
      reason: `${risk.unsupportedCount} unsupported, ${risk.needsReviewCount} needs review — public adaptation blocked`,
    };
  }
  return {
    publicBriefReady: false,
    reason: "Default NOT_PUBLISHABLE — human approval required even without unsupported claims",
  };
}
