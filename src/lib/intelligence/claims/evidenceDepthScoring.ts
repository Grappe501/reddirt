import type { CitationAnchor, CitationSource, ClaimLedgerEntry, EvidenceStrength } from "./claimLedgerTypes";

export type EvidenceDepthResult = {
  evidenceDepthScore: number;
  evidenceStrength: EvidenceStrength;
  confidenceScore: number;
  reason: string;
  missingEvidenceNeeded: string[];
};

const SOURCE_TYPE_WEIGHT: Record<CitationSource["sourceType"], number> = {
  public_record: 25,
  file: 18,
  registry: 15,
  url: 12,
  media: 10,
  internal_note: 5,
};

const SUPPORT_WEIGHT: Record<CitationAnchor["claimSupportType"], number> = {
  DIRECT_SUPPORT: 20,
  INDIRECT_SUPPORT: 10,
  CONTEXT_ONLY: 4,
  WEAK_SUPPORT: 3,
  NEEDS_CONFIRMATION: 2,
  CONTRADICTS: -15,
};

function strengthFromScore(score: number): EvidenceStrength {
  if (score >= 80) return "HIGH_CONFIDENCE";
  if (score >= 60) return "STRONG";
  if (score >= 40) return "MODERATE";
  if (score >= 15) return "WEAK";
  return "NONE";
}

export function scoreClaimEvidence(input: {
  claim: Pick<ClaimLedgerEntry, "classification" | "citationAnchorIds" | "supportingSourceIds" | "contradictingSourceIds">;
  anchors: CitationAnchor[];
  sources: CitationSource[];
  shellCounty?: boolean;
}): EvidenceDepthResult {
  const missing: string[] = [];

  if (input.claim.classification === "UNSUPPORTED") {
    return {
      evidenceDepthScore: 0,
      evidenceStrength: "NONE",
      confidenceScore: 0,
      reason: "UNSUPPORTED classification — no evidence depth",
      missingEvidenceNeeded: ["Attach direct citation or retire claim"],
    };
  }

  const claimAnchors = input.anchors.filter((a) => input.claim.citationAnchorIds.includes(a.id));
  const claimSources = input.sources.filter((s) => input.claim.supportingSourceIds.includes(s.id));

  if (claimAnchors.length === 0) {
    missing.push("No citation anchors linked");
  }
  if (claimSources.length === 0) {
    missing.push("No supporting sources linked");
  }

  let score = 10;

  for (const anchor of claimAnchors) {
    score += SUPPORT_WEIGHT[anchor.claimSupportType] ?? 0;
    if (anchor.excerpt) score += 5;
  }

  for (const source of claimSources) {
    score += SOURCE_TYPE_WEIGHT[source.sourceType] ?? 5;
    score += Math.round(source.sourceConfidence / 10);
    if (source.quoteOrExcerpt) score += 5;
  }

  const independentSources = new Set(input.claim.supportingSourceIds).size;
  if (independentSources >= 2) score += 10;
  if (independentSources >= 3) score += 5;

  score -= input.claim.contradictingSourceIds.length * 12;

  if (input.claim.classification === "INFERRED") {
    score = Math.min(score, 50);
    missing.push("Inferred claim — direct citation required before public use");
  }
  if (input.claim.classification === "NEEDS_REVIEW") {
    score = Math.min(score, 45);
    missing.push("Human review required");
  }
  if (input.shellCounty) {
    score = Math.min(score, 35);
    missing.push("Shell county — local validation required");
  }

  score = Math.max(0, Math.min(100, score));

  let confidence = score;
  if (input.claim.classification === "INFERRED") confidence = Math.min(confidence, 55);

  return {
    evidenceDepthScore: score,
    evidenceStrength: strengthFromScore(score),
    confidenceScore: confidence,
    reason: `${claimAnchors.length} anchor(s), ${independentSources} source(s), classification ${input.claim.classification}`,
    missingEvidenceNeeded: missing,
  };
}
