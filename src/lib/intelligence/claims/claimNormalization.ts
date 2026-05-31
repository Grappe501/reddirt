import { createHash } from "node:crypto";
import type { ClaimLedgerEntry } from "./claimLedgerTypes";

export function normalizeClaimText(claimText: string): string {
  return claimText
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s.-]/g, "")
    .trim()
    .slice(0, 500);
}

export function generateClaimFingerprint(input: {
  normalizedClaimText: string;
  countySlug: string | null;
  opponentId: string | null;
  domain: string;
}): string {
  const key = [input.domain, input.countySlug ?? "", input.opponentId ?? "", input.normalizedClaimText].join("|");
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

export function detectDuplicateClaim(
  fingerprint: string,
  ledger: ClaimLedgerEntry[],
): ClaimLedgerEntry | null {
  return ledger.find((e) => e.claimFingerprint === fingerprint) ?? null;
}

export function mergeClaimEvidence(
  existing: ClaimLedgerEntry,
  incoming: Pick<
    ClaimLedgerEntry,
    | "sourceBriefIds"
    | "sourceEvidencePacketIds"
    | "sourceReviewItemIds"
    | "citationAnchorIds"
    | "supportingSourceIds"
    | "topicTags"
    | "classification"
  >,
): ClaimLedgerEntry {
  const mergeUnique = (a: string[], b: string[]) => [...new Set([...a, ...b])];

  return {
    ...existing,
    sourceBriefIds: mergeUnique(existing.sourceBriefIds, incoming.sourceBriefIds),
    sourceEvidencePacketIds: mergeUnique(existing.sourceEvidencePacketIds, incoming.sourceEvidencePacketIds),
    sourceReviewItemIds: mergeUnique(existing.sourceReviewItemIds, incoming.sourceReviewItemIds),
    citationAnchorIds: mergeUnique(existing.citationAnchorIds, incoming.citationAnchorIds),
    supportingSourceIds: mergeUnique(existing.supportingSourceIds, incoming.supportingSourceIds),
    topicTags: mergeUnique(existing.topicTags, incoming.topicTags),
    classification:
      existing.classification === "UNSUPPORTED" || incoming.classification === "UNSUPPORTED"
        ? "UNSUPPORTED"
        : existing.classification === "NEEDS_REVIEW" || incoming.classification === "NEEDS_REVIEW"
          ? "NEEDS_REVIEW"
          : existing.classification,
    updatedAt: new Date().toISOString(),
    history: [
      ...existing.history,
      {
        timestamp: new Date().toISOString(),
        eventType: "MERGED",
        actor: "claimNormalization.v1",
        previousStatus: existing.verificationStatus,
        nextStatus: existing.verificationStatus,
        notes: "Merged duplicate claim evidence from ingest",
      },
    ],
  };
}

export function updateClaimConfidenceFromEvidence(claim: ClaimLedgerEntry): ClaimLedgerEntry {
  if (claim.classification === "UNSUPPORTED") {
    return {
      ...claim,
      evidenceDepthScore: 0,
      evidenceStrength: "NONE",
      confidenceScore: 0,
      internalUseStatus: "DO_NOT_USE",
    };
  }

  let confidence = claim.evidenceDepthScore;
  const independentSources = new Set(claim.supportingSourceIds).size;
  if (independentSources >= 2 && claim.classification === "VERIFIED") confidence += 5;
  if (claim.contradictingSourceIds.length > 0) confidence -= 15;
  if (claim.classification === "INFERRED") confidence = Math.min(confidence, 55);

  confidence = Math.max(0, Math.min(100, confidence));

  return {
    ...claim,
    confidenceScore: confidence,
    updatedAt: new Date().toISOString(),
  };
}
