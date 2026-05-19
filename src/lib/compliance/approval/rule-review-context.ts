import type { ApprovalItem } from "./approval-types";

export type RuleReviewContext = {
  topicId: string;
  topicLabel: string;
  whyHumanReview: string;
  evidenceAvailable: string[];
  missingEvidence: string[];
  suggestedAction: string;
  affectsFilingReadiness: boolean;
  batchApprovalAllowed: false;
};

export function getRuleReviewContext(item: ApprovalItem): RuleReviewContext | null {
  if (item.source !== "rule_review") return null;
  const topicId = item.sourceRecordId;
  const topicLabel = item.title.replace(/^Rule review ·\s*/i, "") || topicId;
  const evidenceAvailable = item.evidence.map((e) => e.title || e.type);
  const missingEvidence: string[] = [];
  if (!item.evidence.length) missingEvidence.push("Official source citation not linked");
  if (item.confidenceScore < 98) missingEvidence.push("Topic not marked reviewed for campaign workflow");

  return {
    topicId,
    topicLabel,
    whyHumanReview:
      "Arkansas rule topic requires human review before campaign reliance. This is source reviewed for campaign compliance workflow — not legal certification.",
    evidenceAvailable,
    missingEvidence,
    suggestedAction: `Open /admin/compliance/rules, review topic “${topicLabel}”, add initials and review note, then return to approve or reject this queue item.`,
    affectsFilingReadiness: true,
    batchApprovalAllowed: false,
  };
}
