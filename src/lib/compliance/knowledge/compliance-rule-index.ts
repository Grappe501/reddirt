import type { ComplianceRuleChunk, ComplianceRuleCoverageAudit, ComplianceRuleCorpus, ComplianceRuleSource } from "./compliance-rule-types";
import { requiredComplianceRuleTopics } from "./compliance-rule-types";

const sourceTypes: ComplianceRuleSource["sourceType"][] = ["arkansas_ethics", "arkansas_sos", "arkansas_code", "campaign_policy", "internal_notes"];

export function auditComplianceRuleCorpus(corpus: ComplianceRuleCorpus | null): ComplianceRuleCoverageAudit {
  const chunks = corpus?.chunks ?? [];
  const topicsCovered = requiredComplianceRuleTopics.filter((topic) => chunks.some((chunk) => chunk.topic === topic));
  const topicsMissing = requiredComplianceRuleTopics.filter((topic) => !topicsCovered.includes(topic));
  const sourceCounts = Object.fromEntries(sourceTypes.map((type) => [type, corpus?.sources.filter((source) => source.sourceType === type).length ?? 0])) as Record<ComplianceRuleSource["sourceType"], number>;
  return {
    builtAt: new Date().toISOString(),
    sourceCounts,
    chunksIndexed: chunks.length,
    topicsCovered,
    topicsMissing,
    rulesNeedingVerification: corpus?.sources.filter((source) => source.verificationStatus !== "verified").length ?? 0,
    warning: topicsMissing.length || !chunks.length
      ? "Rules corpus incomplete. Do not rely on this system for final filing certification yet."
      : "Rules corpus has initial topic coverage, but final filing certification still requires human review.",
  };
}

export function retrieveComplianceRuleChunks(corpus: ComplianceRuleCorpus, query: string, limit = 6): ComplianceRuleChunk[] {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2);
  return corpus.chunks
    .map((chunk) => ({
      chunk,
      score: terms.filter((term) => `${chunk.title} ${chunk.text} ${chunk.topic}`.toLowerCase().includes(term)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.chunk);
}
