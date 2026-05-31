import type { ClaimLedgerEntry, ClaimVerificationStatus } from "./claimLedgerTypes";

export type CitationDepthViolation = {
  code: string;
  message: string;
  blocking: boolean;
};

const SENSITIVE_PATTERNS = [
  /\d{1,3}(,\d{3})*\s*(votes|registrations|percent|%)/i,
  /\b(HB|SB|Act)\s*\d+/i,
  /\b(said|stated|claimed|quoted)\b/i,
  /\b(registration goal|vote target)\b/i,
  /\b(accused|guilty|corrupt|criminal)\b/i,
];

export function evaluateCitationDepthPolicy(claim: ClaimLedgerEntry): CitationDepthViolation[] {
  const violations: CitationDepthViolation[] = [];

  if (claim.citationAnchorIds.length === 0 && claim.supportingSourceIds.length === 0) {
    violations.push({
      code: "NO_CITATION",
      message: "No citation anchor or supporting source — cannot use for message drafting without human waiver",
      blocking: true,
    });
  }

  if (
    claim.publishabilityStatus === "APPROVED_FOR_PUBLIC_ADAPTATION" &&
    claim.evidenceDepthScore < 40
  ) {
    violations.push({
      code: "LOW_DEPTH_PUBLIC",
      message: "Public adaptation requires at least moderate evidence depth (40+)",
      blocking: true,
    });
  }

  const sensitive = SENSITIVE_PATTERNS.some((p) => p.test(claim.claimText));
  const hasDirectSupport = claim.citationAnchorIds.length >= 1;

  if (sensitive && !hasDirectSupport) {
    violations.push({
      code: "SENSITIVE_NO_DIRECT_CITATION",
      message: "Numbers, dates, votes, laws, quotes, or accusations require direct citation",
      blocking: true,
    });
  }

  if (claim.claimText.toLowerCase().includes("registration goal") && !claim.claimText.includes("CountyCampaignStats")) {
    violations.push({
      code: "COUNTY_GOAL_CANONICAL",
      message: "County voter/registration goal claims must cite canonical CountyCampaignStats source",
      blocking: true,
    });
  }

  if (claim.domain === "opposition" && claim.publicUseRisk === "CRITICAL") {
    violations.push({
      code: "OPPOSITION_HIGH_RISK",
      message: "Opposition claim has CRITICAL public use risk — export control review required",
      blocking: true,
    });
  }

  if (claim.classification === "INFERRED" && claim.claimType === "INTERNAL_INTERPRETATION") {
    violations.push({
      code: "INTERNAL_INTERPRETATION",
      message: "Campaign internal interpretation — label and restrict to internal strategy",
      blocking: false,
    });
  }

  return violations;
}

export function canClaimBeUsedForDrafting(claim: ClaimLedgerEntry): boolean {
  if (claim.classification === "UNSUPPORTED") return false;
  if (claim.verificationStatus === "REJECTED" || claim.verificationStatus === "RETIRED") return false;
  const violations = evaluateCitationDepthPolicy(claim);
  return !violations.some((v) => v.blocking);
}

export function canClaimBeApprovedForPublicAdaptation(claim: ClaimLedgerEntry): boolean {
  if (claim.classification === "UNSUPPORTED" || claim.classification === "NEEDS_REVIEW") return false;
  if (claim.classification === "INFERRED") return false;
  if (claim.evidenceDepthScore < 40) return false;
  const violations = evaluateCitationDepthPolicy(claim);
  return !violations.some((v) => v.blocking);
}

export function defaultVerificationForClassification(
  classification: ClaimLedgerEntry["classification"],
): ClaimVerificationStatus {
  if (classification === "UNSUPPORTED") return "NEEDS_REVIEW";
  if (classification === "NEEDS_REVIEW") return "NEEDS_REVIEW";
  return "DRAFT";
}

export function exportControlAllowsPublicRelease(_claim: ClaimLedgerEntry): boolean {
  /** KH-4 export control gate — public release blocked until export workflow approves. */
  return false;
}

export function canClaimBePromoted(claim: ClaimLedgerEntry): boolean {
  if (claim.classification === "UNSUPPORTED") return false;
  if (claim.verificationStatus === "REJECTED" || claim.verificationStatus === "RETIRED") return false;
  return true;
}
