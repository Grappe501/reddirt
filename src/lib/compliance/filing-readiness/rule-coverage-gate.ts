import { auditComplianceRuleCorpus } from "../knowledge/compliance-rule-index";
import type { ComplianceRuleCorpus } from "../knowledge/compliance-rule-types";

export function buildRuleCoverageGate(corpus: ComplianceRuleCorpus | null): {
  complete: boolean;
  missingTopics: string[];
  needsLegalReviewTopics: string[];
  blockers: string[];
  warnings: string[];
} {
  const audit = auditComplianceRuleCorpus(corpus);
  const needsLegalReviewTopics = audit.topicCoverage
    .filter((topic) => topic.status === "needs_legal_review" || topic.status === "placeholder" || topic.status === "campaign_policy")
    .map((topic) => topic.topic);
  const complete = audit.topicCoverage.every((topic) => topic.status === "verified_authoritative");
  return {
    complete,
    missingTopics: audit.topicsMissing,
    needsLegalReviewTopics,
    blockers: complete ? [] : ["Rule corpus is not verified for final filing certification."],
    warnings: [
      ...audit.topicsMissing.map((topic) => `Missing authoritative rule source for ${topic}.`),
      ...needsLegalReviewTopics.map((topic) => `${topic} rule source needs legal/compliance verification.`),
    ],
  };
}
