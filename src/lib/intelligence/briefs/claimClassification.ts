import type { GovernedBrief, GovernedClaimRecord } from "./governedBriefTypes";
import type {
  EvidencePacket,
  EvidencePacketClaimCandidate,
} from "./evidencePacketTypes";

export type ClaimClassification =
  | "VERIFIED"
  | "INFERRED"
  | "UNSUPPORTED"
  | "NEEDS_REVIEW";

export type ClassifiedClaim = {
  claimText: string;
  classification: ClaimClassification;
  sourceAnchorIds: string[];
  evidenceStrength: "STRONG" | "MODERATE" | "WEAK" | "NONE";
  reason: string;
  publicUseRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendedHumanAction: string;
};

function strengthFromAnchors(anchorCount: number): ClassifiedClaim["evidenceStrength"] {
  if (anchorCount >= 2) return "STRONG";
  if (anchorCount === 1) return "MODERATE";
  return "NONE";
}

function publicRiskFromClassification(
  classification: ClaimClassification,
  packet: EvidencePacket,
): ClassifiedClaim["publicUseRisk"] {
  if (classification === "UNSUPPORTED") return "CRITICAL";
  if (classification === "NEEDS_REVIEW") return "HIGH";
  if (classification === "INFERRED") return packet.generationContext.shellCounty ? "HIGH" : "MEDIUM";
  if (packet.generationContext.oppositionArchiveThin) return "MEDIUM";
  return "LOW";
}

export function classifyClaimCandidate(
  candidate: EvidencePacketClaimCandidate,
  evidencePacket: EvidencePacket,
): ClassifiedClaim {
  const anchorCount = candidate.sourceAnchorIds.length;
  const hasAnchors = anchorCount > 0;

  let classification: ClaimClassification;
  let reason: string;

  if (candidate.tierHint === "unsupported" || !hasAnchors) {
    classification = "UNSUPPORTED";
    reason = hasAnchors
      ? "Marked unsupported in source brief"
      : "No source anchor attached to claim";
  } else if (candidate.tierHint === "verified" && hasAnchors) {
    classification = "VERIFIED";
    reason = "Explicit source anchor(s) in governed brief verified tier";
  } else if (candidate.tierHint === "inferred") {
    classification = "INFERRED";
    reason = "Evidence supports interpretation but not direct public claim";
  } else if (candidate.tierHint === "unverified") {
    classification = "NEEDS_REVIEW";
    reason = "Unverified tier — ambiguous, stale, or weak evidence";
  } else {
    classification = "NEEDS_REVIEW";
    reason = "Classification ambiguous — human review required";
  }

  if (evidencePacket.generationContext.shellCounty && classification === "VERIFIED") {
    classification = "NEEDS_REVIEW";
    reason = "Shell county — downgrade verified claims pending local validation";
  }

  const evidenceStrength = strengthFromAnchors(anchorCount);
  const publicUseRisk = publicRiskFromClassification(classification, evidencePacket);

  let recommendedHumanAction = "Review claim against source anchors before any use";
  if (classification === "UNSUPPORTED") {
    recommendedHumanAction = "Remove from drafts or convert to research gap — do not use publicly";
  } else if (classification === "NEEDS_REVIEW") {
    recommendedHumanAction = "Assign research owner; verify citation locker before internal use";
  } else if (classification === "INFERRED") {
    recommendedHumanAction = "Use as internal hypothesis only — not public copy";
  }

  return {
    claimText: candidate.claimText,
    classification,
    sourceAnchorIds: candidate.sourceAnchorIds,
    evidenceStrength,
    reason,
    publicUseRisk,
    recommendedHumanAction,
  };
}

export function extractClaimCandidatesFromBrief(brief: GovernedBrief): EvidencePacketClaimCandidate[] {
  const toCandidate = (
    record: GovernedClaimRecord,
    index: number,
    tierHint: EvidencePacketClaimCandidate["tierHint"],
  ): EvidencePacketClaimCandidate => ({
    claimId: `${brief.briefId}-claim-${index}`,
    claimText: record.claim,
    tierHint,
    sourceAnchorIds: record.sourceAnchors.map((a, i) => `${brief.briefId}-anchor-${a}-${i}`),
  });

  return [
    ...brief.verifiedClaims.map((c, i) => toCandidate(c, i, "verified")),
    ...brief.unverifiedClaims.map((c, i) => toCandidate(c, i + 100, "unverified")),
    ...brief.inferredClaims.map((c, i) => toCandidate(c, i + 200, "inferred")),
  ];
}

export function classifyEvidencePacketClaims(evidencePacket: EvidencePacket): ClassifiedClaim[] {
  const candidates = [
    ...evidencePacket.verifiedClaimCandidates,
    ...evidencePacket.inferredClaimCandidates,
  ];
  return candidates.map((c) => classifyClaimCandidate(c, evidencePacket));
}
