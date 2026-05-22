import type { ComplianceRuleChunk, ComplianceRuleCoverageAudit, ComplianceRuleCorpus, ComplianceRuleSource, ComplianceRuleTopic, ComplianceRuleTopicCoverage, ComplianceRuleVerificationStatus } from "./compliance-rule-types";
import { complianceRuleTopicLabels, requiredComplianceRuleTopics } from "./compliance-rule-types";
import { loadRuleReviews } from "./rule-reviews-storage";

const sourceTypes: ComplianceRuleSource["sourceType"][] = ["arkansas_ethics", "arkansas_sos", "arkansas_code", "campaign_policy", "internal_notes"];

export async function auditComplianceRuleCorpusAsync(corpus: ComplianceRuleCorpus | null): Promise<ComplianceRuleCoverageAudit> {
  const reviews = await loadRuleReviews();
  return auditComplianceRuleCorpus(corpus, reviews);
}

export function auditComplianceRuleCorpus(corpus: ComplianceRuleCorpus | null, reviews?: Awaited<ReturnType<typeof loadRuleReviews>>): ComplianceRuleCoverageAudit {
  const chunks = corpus?.chunks ?? [];
  const topicCoverage = buildTopicCoverage(corpus, reviews);
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

export function buildTopicCoverage(corpus: ComplianceRuleCorpus | null, reviews?: Awaited<ReturnType<typeof loadRuleReviews>>): ComplianceRuleTopicCoverage[] {
  return requiredComplianceRuleTopics.map((topic) => {
    const chunks = corpus?.chunks.filter((chunk) => chunk.topic === topic || chunk.subtopics?.includes(topic)) ?? [];
    const sources =
      corpus?.sources.filter(
        (source) =>
          source.topics?.includes(topic)
          || chunks.some((chunk) => chunk.sourceId === source.id),
      ) ?? [];
    const topicReview = reviews?.find((review) => review.topic === topic && !review.stale);
    const status = topicReview ? "verified_authoritative" as const : resolveTopicStatus(sources, reviews);
    const lastUpdated = [...sources.map((source) => source.effectiveDate ?? source.retrievedAt).filter(Boolean)].sort().at(-1);
    const hasOfficialSource = sources.some((source) =>
      source.verificationStatus === "official_link_verified"
      || source.verificationStatus === "downloaded_official_source"
      || source.verificationStatus === "verified_authoritative",
    );
    const brokenLinkCount = sources.filter((source) => source.linkStatus === "broken" || source.verificationStatus === "broken_link").length;
    return {
      topic,
      label: complianceRuleTopicLabels[topic],
      status,
      sourceCount: sources.length,
      chunkCount: chunks.length,
      verified: status === "verified_authoritative",
      hasOfficialSource,
      legalReviewRequired: status !== "verified_authoritative",
      lastUpdated,
      lastRetrieved: [...sources.map((source) => source.retrievedAt).filter(Boolean)].sort().at(-1),
      brokenLinkCount,
      confidence: status === "verified_authoritative" ? "high" : hasOfficialSource ? "medium" : sources.length ? "low" : "low",
      nextAction: nextActionForStatus(status, topic),
    };
  });
}

function resolveTopicStatus(sources: ComplianceRuleSource[], reviews?: Awaited<ReturnType<typeof loadRuleReviews>>): ComplianceRuleVerificationStatus {
  if (!sources.length) return "missing";
  const humanVerified = sources.some((source) =>
    source.verificationStatus === "verified_authoritative"
    && source.reviewedByInitials
    && !reviews?.find((review) => review.sourceId === source.id)?.stale,
  );
  if (humanVerified) return "verified_authoritative";
  if (sources.some((source) => source.verificationStatus === "official_link_verified" || source.verificationStatus === "downloaded_official_source")) return "official_link_verified";
  if (sources.some((source) => source.verificationStatus === "broken_link")) return "broken_link";
  if (sources.some((source) => source.verificationStatus === "manual_needed")) return "manual_needed";
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
