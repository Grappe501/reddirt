import { retrieveComplianceRuleChunks } from "../../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../../knowledge/load-compliance-rule-corpus";
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
  const chunks = retrieveComplianceRuleChunks(corpus, query, 6).map((chunk) => {
    const source = corpus.sources.find((item) => item.id === chunk.sourceId);
    const verified = source?.verificationStatus === "verified_authoritative";
    return {
      chunk,
      source,
      verificationStatus: source?.verificationStatus,
      confidence: verified ? "high" as const : source ? "medium" as const : "low" as const,
      warning: verified ? undefined : "Rule source is not verified authoritative. Human compliance review required before reliance.",
    };
  });
  if (!chunks.length || chunks.every((item) => item.verificationStatus !== "verified_authoritative")) {
    return {
      status: "needs_rule_verification",
      chunks,
      warning: "No verified authoritative source citation found. AI must not give final legal guidance.",
    };
  }
  return { status: "ok", chunks };
}
