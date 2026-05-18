import { auditComplianceRuleCorpus } from "../../../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../../../knowledge/load-compliance-rule-corpus";
import { requiredComplianceRuleTopics } from "../../../knowledge/compliance-rule-types";
import type { FinalizationInspectorResult } from "../inspector-types";

export async function inspectRuleCorpus(): Promise<FinalizationInspectorResult> {
  const corpus = await loadComplianceRuleCorpus();
  const audit = auditComplianceRuleCorpus(corpus);
  const covered = requiredComplianceRuleTopics.length - audit.topicsMissing.length;
  const score = Math.round((covered / requiredComplianceRuleTopics.length) * 100);
  return {
    id: "rule-corpus",
    label: "Rule Corpus Auditor",
    score,
    status: audit.topicsMissing.length ? "yellow" : score >= 85 ? "green" : "yellow",
    explanation: audit.warning,
  };
}
