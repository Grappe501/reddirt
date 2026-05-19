import { loadApprovalItems } from "../approval/approval-storage";
import { auditComplianceRuleCorpus } from "./compliance-rule-index";
import { loadComplianceRuleCorpus } from "./load-compliance-rule-corpus";
import type { ComplianceRuleTopic } from "./compliance-rule-types";

export type RuleTopicPacketEntry = {
  topicId: ComplianceRuleTopic;
  label: string;
  verified: boolean;
  approvalItemsAffected: number;
  whyReviewRequired: string;
  evidenceAvailable: string;
  unresolvedQuestion: string;
  recommendedDecisionFormat: string;
  qaGuard: string;
};

export type RuleTopicReviewPacket = {
  generatedAt: string;
  topicCount: number;
  unverifiedCount: number;
  topics: RuleTopicPacketEntry[];
};

export async function buildRuleTopicReviewPacket(): Promise<RuleTopicReviewPacket> {
  const [corpus, items] = await Promise.all([loadComplianceRuleCorpus(), loadApprovalItems()]);
  const audit = auditComplianceRuleCorpus(corpus);
  const ruleItems = items.filter((i) => i.source === "rule_review");

  const topics: RuleTopicPacketEntry[] = audit.topicCoverage.map((topic) => {
    const affected = ruleItems.filter((i) => i.sourceRecordId === topic.topic).length;
    return {
      topicId: topic.topic,
      label: topic.label,
      verified: topic.verified,
      approvalItemsAffected: affected,
      whyReviewRequired: topic.verified
        ? "Topic marked reviewed for campaign workflow."
        : "Official Arkansas rule source must be reviewed before campaign reliance — not legal certification.",
      evidenceAvailable: topic.hasOfficialSource
        ? "Official or campaign policy source linked in rules corpus."
        : topic.sourceCount > 0
          ? `${topic.sourceCount} source(s) indexed; verify link health.`
          : "No sources indexed yet.",
      unresolvedQuestion: topic.verified ? "None" : topic.nextAction,
      recommendedDecisionFormat:
        "On /admin/compliance/rules: open topic → review sources → initials + note → mark reviewed for campaign compliance workflow.",
      qaGuard: "rule_review approval items require override reason; batch approval excludes rule_review.",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    topicCount: topics.length,
    unverifiedCount: topics.filter((t) => !t.verified).length,
    topics,
  };
}
