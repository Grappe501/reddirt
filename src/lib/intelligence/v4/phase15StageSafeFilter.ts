/**
 * Phase 15 P3 — Stage-safe content filter for candidate / clerk-week profiles.
 */
import {
  buildCandidateStageSafeFallback,
  isClaimsGateCandidateBlocked,
  isClaimsGateStageBlocked,
} from "@/lib/intelligence/v4/claimsGatePolicy";
import type { IntelligenceNavProfile } from "@/lib/intelligence/v4/roleBasedNavProfile";
import { profileUsesStageSafeFilter } from "@/lib/intelligence/v4/roleBasedNavProfile";

export type StageSafeAudience = "staff" | "candidate";

export type StageSafeContentDecision = {
  audience: StageSafeAudience;
  blocked: boolean;
  claimsGate: string;
  fallback: ReturnType<typeof buildCandidateStageSafeFallback>;
};

export function resolveStageSafeAudience(
  profile: Exclude<IntelligenceNavProfile, "AUTO">,
): StageSafeAudience {
  return profileUsesStageSafeFilter(profile) ? "candidate" : "staff";
}

export function evaluateStageSafeContent(
  claimsGate: string,
  audience: StageSafeAudience,
): StageSafeContentDecision {
  const blocked =
    audience === "candidate"
      ? isClaimsGateCandidateBlocked(claimsGate)
      : isClaimsGateStageBlocked(claimsGate);
  return {
    audience,
    blocked,
    claimsGate,
    fallback: buildCandidateStageSafeFallback(claimsGate),
  };
}

export function shouldRedactOperatorScripts(decision: StageSafeContentDecision): boolean {
  return decision.blocked;
}

export const STAGE_SAFE_FILTER_CLAIMS_HREF = "/admin/intelligence/claims";

export const STAGE_SAFE_CANDIDATE_FALLBACK_SCRIPT =
  "Staff is still verifying the facts behind this rehearse line. Until the claims ledger row is cleared, use research-question framing only — cite the statute pattern, not unverified totals or opponent statistics.";
