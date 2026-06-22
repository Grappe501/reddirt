import { summarizeClaimLedger } from "@/lib/intelligence/claims/claimLedgerSummary";
import { loadClaimLedger } from "@/lib/intelligence/claims/claimLedgerStore";
import type { ClaimLedgerEntry } from "@/lib/intelligence/claims/claimLedgerTypes";
import type { ElectionPlanClaimsSuperioritySummary } from "@/lib/election-plan/debate-prep-claims-superiority-types";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";

export type { ElectionPlanClaimsSuperioritySummary } from "@/lib/election-plan/debate-prep-claims-superiority-types";

const DOMAIN_LABELS: Record<string, string> = {
  debate: "Debate-week lines",
  message: "Message / superiority stats",
  opposition: "Opponent contrast",
  county: "County / clerk facts",
  rapid_response: "Rapid response",
  weekly: "Weekly briefing",
  general: "General research",
};

function isStageSafeClaim(entry: ClaimLedgerEntry): boolean {
  if (entry.classification === "UNSUPPORTED") return false;
  if (entry.classification === "NEEDS_REVIEW" || entry.verificationStatus === "NEEDS_REVIEW") return false;
  if (entry.verificationStatus === "REJECTED" || entry.verificationStatus === "RETIRED") return false;
  return (
    entry.classification === "VERIFIED" ||
    entry.verificationStatus === "HUMAN_APPROVED_FOR_PUBLIC_ADAPTATION" ||
    entry.verificationStatus === "HUMAN_APPROVED_INTERNAL" ||
    entry.verificationStatus === "HUMAN_VERIFIED"
  );
}

function isNeedsReviewClaim(entry: ClaimLedgerEntry): boolean {
  return (
    entry.classification === "NEEDS_REVIEW" ||
    entry.verificationStatus === "NEEDS_REVIEW" ||
    entry.classification === "UNSUPPORTED"
  );
}

/** Day 3 claims gate — category counts Kelly can scan without admin login. */
export function buildElectionPlanClaimsSuperioritySummary(): ElectionPlanClaimsSuperioritySummary {
  const summary = summarizeClaimLedger();
  const entries = loadClaimLedger().entries;
  const v4 = loadDebateIntelligenceV4HubPacket();

  const domainStats = new Map<string, { total: number; needsReview: number; stageSafe: number }>();

  for (const entry of entries) {
    const bucket = domainStats.get(entry.domain) ?? { total: 0, needsReview: 0, stageSafe: 0 };
    bucket.total++;
    if (isNeedsReviewClaim(entry)) bucket.needsReview++;
    if (isStageSafeClaim(entry)) bucket.stageSafe++;
    domainStats.set(entry.domain, bucket);
  }

  const superiorityCategories = [...domainStats.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .map(([id, stats]) => ({
      id,
      label: DOMAIN_LABELS[id] ?? id.replaceAll("_", " "),
      totalCount: stats.total,
      needsReviewCount: stats.needsReview,
      stageSafeCount: stats.stageSafe,
    }));

  return {
    ledgerTotals: {
      totalClaims: summary.totalClaims,
      verifiedClaims: summary.verifiedClaims,
      needsReviewClaims: summary.needsReviewClaims,
      unsupportedClaims: summary.unsupportedClaims,
      approvedForPublicAdaptation: summary.approvedPublicAdaptation,
    },
    hubBuckets: {
      supported: v4.hub.claims.supported.length,
      partial: v4.hub.claims.partial.length,
      needsResearch: v4.hub.claims.needsResearch.length,
    },
    superiorityCategories,
  };
}
