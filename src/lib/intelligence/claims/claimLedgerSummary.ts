import {
  loadCitationAnchors,
  loadCitationSources,
  loadClaimLedger,
  findClaimsNeedingReview,
} from "./claimLedgerStore";
import type { ClaimLedgerEntry } from "./claimLedgerTypes";
import { evaluateCitationDepthPolicy } from "./citationDepthPolicy";

export type ClaimLedgerSummary = {
  totalClaims: number;
  verifiedClaims: number;
  inferredClaims: number;
  unsupportedClaims: number;
  needsReviewClaims: number;
  approvedInternal: number;
  approvedPublicAdaptation: number;
  topMissingCitationGaps: string[];
  byDomain: Record<string, number>;
  byVerificationStatus: Record<string, number>;
};

export function summarizeClaimLedger(repoRoot?: string): ClaimLedgerSummary {
  const entries = loadClaimLedger(repoRoot).entries;

  const byDomain: Record<string, number> = {};
  const byVerificationStatus: Record<string, number> = {};
  let verified = 0;
  let inferred = 0;
  let unsupported = 0;
  let needsReview = 0;
  let approvedInternal = 0;
  let approvedPublicAdaptation = 0;
  const citationGaps: string[] = [];

  for (const e of entries) {
    byDomain[e.domain] = (byDomain[e.domain] ?? 0) + 1;
    byVerificationStatus[e.verificationStatus] = (byVerificationStatus[e.verificationStatus] ?? 0) + 1;

    if (e.classification === "VERIFIED") verified++;
    if (e.classification === "INFERRED") inferred++;
    if (e.classification === "UNSUPPORTED") unsupported++;
    if (e.classification === "NEEDS_REVIEW" || e.verificationStatus === "NEEDS_REVIEW") needsReview++;
    if (e.verificationStatus === "HUMAN_APPROVED_INTERNAL") approvedInternal++;
    if (e.verificationStatus === "HUMAN_APPROVED_FOR_PUBLIC_ADAPTATION") approvedPublicAdaptation++;

    const violations = evaluateCitationDepthPolicy(e);
    for (const v of violations.filter((x) => x.blocking)) {
      citationGaps.push(`${e.id.slice(0, 12)}: ${v.message}`);
    }
  }

  return {
    totalClaims: entries.length,
    verifiedClaims: verified,
    inferredClaims: inferred,
    unsupportedClaims: unsupported,
    needsReviewClaims: needsReview,
    approvedInternal,
    approvedPublicAdaptation,
    topMissingCitationGaps: [...new Set(citationGaps)].slice(0, 10),
    byDomain,
    byVerificationStatus,
  };
}

export function summarizeClaimsForReviewItem(input: {
  briefId?: string;
  evidencePacketId?: string;
  draftId?: string;
}, repoRoot?: string): ClaimLedgerSummary & { linkedClaimCount: number } {
  const entries = loadClaimLedger(repoRoot).entries.filter((e) => {
    if (input.briefId && e.sourceBriefIds.includes(input.briefId)) return true;
    if (input.evidencePacketId && e.sourceEvidencePacketIds.includes(input.evidencePacketId)) return true;
    if (input.draftId && e.sourceReviewItemIds.includes(input.draftId)) return true;
    return false;
  });

  const base = summarizeClaimLedger(repoRoot);
  return {
    ...base,
    totalClaims: entries.length,
    verifiedClaims: entries.filter((e) => e.classification === "VERIFIED").length,
    inferredClaims: entries.filter((e) => e.classification === "INFERRED").length,
    unsupportedClaims: entries.filter((e) => e.classification === "UNSUPPORTED").length,
    needsReviewClaims: entries.filter((e) => e.verificationStatus === "NEEDS_REVIEW" || e.classification === "NEEDS_REVIEW").length,
    linkedClaimCount: entries.length,
  };
}

export function getClaimWithCitations(claimId: string, repoRoot?: string): {
  claim: ClaimLedgerEntry;
  sources: ReturnType<typeof loadCitationSources>["sources"];
  anchors: ReturnType<typeof loadCitationAnchors>["anchors"];
  policyViolations: ReturnType<typeof evaluateCitationDepthPolicy>;
} | null {
  const claim = loadClaimLedger(repoRoot).entries.find((e) => e.id === claimId);
  if (!claim) return null;

  const sources = loadCitationSources(repoRoot).sources.filter((s) =>
    claim.supportingSourceIds.includes(s.id),
  );
  const anchors = loadCitationAnchors(repoRoot).anchors.filter((a) =>
    claim.citationAnchorIds.includes(a.id),
  );

  return {
    claim,
    sources,
    anchors,
    policyViolations: evaluateCitationDepthPolicy(claim),
  };
}

export function listClaimsForAdmin(repoRoot?: string): ClaimLedgerEntry[] {
  return loadClaimLedger(repoRoot).entries.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function listClaimsNeedingReview(repoRoot?: string): ClaimLedgerEntry[] {
  return findClaimsNeedingReview(repoRoot);
}
