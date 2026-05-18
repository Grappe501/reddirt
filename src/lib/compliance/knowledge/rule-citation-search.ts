import type { ComplianceRuleChunk, ComplianceRuleCorpus, ComplianceRuleCitation } from "./compliance-rule-types";
import { retrieveComplianceRuleChunks } from "./compliance-rule-index";

export type RuleCitationSearchResult = {
  query: string;
  chunks: ComplianceRuleChunk[];
  citations: ComplianceRuleCitation[];
  verificationStatus: "official_source_loaded" | "needs_legal_review" | "campaign_policy" | "placeholder" | "mixed";
  confidence: "high" | "medium" | "low";
  legalReviewRequired: boolean;
  warning?: string;
};

export function searchComplianceRuleCitations(corpus: ComplianceRuleCorpus, query: string, limit = 8): RuleCitationSearchResult {
  const chunks = retrieveComplianceRuleChunks(corpus, query, limit);
  const citations = chunks.flatMap((chunk) => chunk.citations);
  const statuses = new Set(chunks.map((chunk) => chunk.verificationStatus ?? "needs_legal_review"));
  const verificationStatus = statuses.size > 1 ? "mixed" : (statuses.values().next().value ?? "needs_legal_review");
  const hasOfficial = chunks.some((chunk) => chunk.verificationStatus === "official_source_loaded");
  const legalReviewRequired = !chunks.length || chunks.some((chunk) => chunk.verificationStatus !== "official_source_loaded" || chunk.ruleStatus === "needs_legal_review");
  const confidence: RuleCitationSearchResult["confidence"] = hasOfficial && !legalReviewRequired ? "high" : hasOfficial ? "medium" : chunks.length ? "low" : "low";
  return {
    query,
    chunks,
    citations,
    verificationStatus,
    confidence,
    legalReviewRequired,
    warning: legalReviewRequired
      ? "Citation available for review. System check passed only for retrieval — ready for compliance officer review, not legal certification."
      : undefined,
  };
}
