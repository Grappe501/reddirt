import { loadComplianceRuleCorpus } from "../../knowledge/load-compliance-rule-corpus";
import { searchComplianceRuleCitations } from "../../knowledge/rule-citation-search";
import type { ComplianceRuleChunk, ComplianceRuleSource } from "../../knowledge/compliance-rule-types";

export type ComplianceRuleRetrievalResult = {
  status: "ok" | "needs_rule_verification";
  chunks: Array<{
    chunk: ComplianceRuleChunk;
    source?: ComplianceRuleSource;
    verificationStatus?: ComplianceRuleSource["verificationStatus"];
    confidence: "high" | "medium" | "low";
    warning?: string;
  }>;
  warning?: string;
};

export async function retrieveComplianceRulesForAI(query: string): Promise<ComplianceRuleRetrievalResult> {
  const corpus = await loadComplianceRuleCorpus();
  if (!corpus) {
    return { status: "needs_rule_verification", chunks: [], warning: "No compliance rule corpus is built. Run compliance:rules:build and verify sources before legal reliance." };
  }
  const search = searchComplianceRuleCitations(corpus, query, 6);
  const chunks = search.chunks.map((chunk) => {
    const source = corpus.sources.find((item) => item.id === chunk.sourceId);
    const humanVerified = source?.verificationStatus === "verified_authoritative" && Boolean(source.reviewedByInitials);
    const officialLoaded = chunk.verificationStatus === "official_source_loaded";
    return {
      chunk,
      source,
      verificationStatus: source?.verificationStatus,
      confidence: humanVerified ? "high" as const : officialLoaded ? "medium" as const : search.confidence,
      warning: humanVerified
        ? undefined
        : officialLoaded
          ? "Rule source loaded — citation available. Ready for compliance officer review; not legal certification."
          : "Rule source needs legal review. AI must not give final legal guidance.",
    };
  });
  if (!chunks.length || search.legalReviewRequired) {
    return {
      status: "needs_rule_verification",
      chunks,
      warning: search.warning ?? "No verified authoritative source citation found. AI must not give final legal guidance.",
    };
  }
  return { status: "ok", chunks, warning: search.warning };
}
