import type { ComplianceRuleChunk, ComplianceRuleCoverageAudit, ComplianceRuleCorpus, ComplianceRuleSource, ComplianceRuleTopic, ComplianceRuleTopicCoverage, ComplianceRuleVerificationStatus } from "./compliance-rule-types";
import { complianceRuleTopicLabels, requiredComplianceRuleTopics } from "./compliance-rule-types";

const sourceTypes: ComplianceRuleSource["sourceType"][] = ["arkansas_ethics", "arkansas_sos", "arkansas_code", "campaign_policy", "internal_notes"];

export function auditComplianceRuleCorpus(corpus: ComplianceRuleCorpus | null): ComplianceRuleCoverageAudit {
  const chunks = corpus?.chunks ?? [];
  const topicCoverage = buildTopicCoverage(corpus);
  const topicsCovered = topicCoverage.filter((topic) => topic.sourceCount > 0 || topic.chunkCount > 0).map((topic) => topic.topic);
  const topicsMissing = topicCoverage.filter((topic) => topic.status === "missing").map((topic) => topic.topic);
  const sourceCounts = Object.fromEntries(sourceTypes.map((type) => [type, corpus?.sources.filter((source) => source.sourceType === type).length ?? 0])) as Record<ComplianceRuleSource["sourceType"], number>;
  return {
    builtAt: new Date().toISOString(),
    sourceCounts,
    chunksIndexed: chunks.length,
    topicsCovered,
    topicsMissing,
    topicCoverage,
    verifiedSources: corpus?.sources.filter((source) => source.verificationStatus === "verified_authoritative").length ?? 0,
    campaignPolicySources: corpus?.sources.filter((source) => source.verificationStatus === "campaign_policy").length ?? 0,
    rulesNeedingVerification: corpus?.sources.filter((source) => source.verificationStatus === "needs_legal_review" || source.verificationStatus === "placeholder").length ?? 0,
    warning: topicCoverage.some((topic) => topic.status !== "verified_authoritative") || !chunks.length
      ? "Rules corpus incomplete. Do not rely on this system for final filing certification yet."
      : "Rules corpus has initial topic coverage, but final filing certification still requires human review.",
  };
}

export function buildTopicCoverage(corpus: ComplianceRuleCorpus | null): ComplianceRuleTopicCoverage[] {
  return requiredComplianceRuleTopics.map((topic) => {
    const sources = corpus?.sources.filter((source) => source.topics?.includes(topic)) ?? [];
    const chunks = corpus?.chunks.filter((chunk) => chunk.topic === topic || sources.some((source) => source.id === chunk.sourceId)) ?? [];
    const status = resolveTopicStatus(sources);
    const lastUpdated = [...sources.map((source) => source.effectiveDate ?? source.retrievedAt).filter(Boolean)].sort().at(-1);
    return {
      topic,
      label: complianceRuleTopicLabels[topic],
      status,
      sourceCount: sources.length,
      chunkCount: chunks.length,
      verified: status === "verified_authoritative",
      lastUpdated,
      nextAction: nextActionForStatus(status, topic),
    };
  });
}

function resolveTopicStatus(sources: ComplianceRuleSource[]): ComplianceRuleVerificationStatus {
  if (!sources.length) return "missing";
  if (sources.some((source) => source.verificationStatus === "verified_authoritative")) return "verified_authoritative";
  if (sources.some((source) => source.verificationStatus === "needs_legal_review")) return "needs_legal_review";
  if (sources.some((source) => source.verificationStatus === "campaign_policy")) return "campaign_policy";
  if (sources.some((source) => source.verificationStatus === "placeholder")) return "placeholder";
  return "missing";
}

function nextActionForStatus(status: ComplianceRuleVerificationStatus, topic: ComplianceRuleTopic): string {
  if (status === "verified_authoritative") return "Keep source monitored for updates.";
  if (status === "campaign_policy") return `Replace ${topic} campaign policy with authoritative Arkansas source before filing reliance.`;
  if (status === "needs_legal_review") return `Compliance officer/counsel should verify ${topic} source and effective date.`;
  if (status === "placeholder") return `Add authoritative ${topic} source text and mark verification status.`;
  return `Find and ingest ${topic} rule source.`;
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
