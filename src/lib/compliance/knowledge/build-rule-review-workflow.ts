import { loadRuleReviews } from "./rule-reviews-storage";
import { loadApprovalItems } from "../approval/approval-storage";
import { APRIL_2026_QUEUE_ID } from "../approval/build-approval-queue";

export type RuleReviewWorkflowItem = {
  topicId: string;
  topicLabel: string;
  queueItemId: string;
  queueStatus: string;
  topicReviewed: boolean;
  reviewedInitials?: string;
  hrefRules: string;
  hrefQueueItem: string;
  nextStep: string;
};

export type RuleReviewWorkflow = {
  totalQueueItems: number;
  topicsPendingReview: number;
  itemsReadyForWorkbench: number;
  items: RuleReviewWorkflowItem[];
  operatorSummary: string;
};

export async function buildRuleReviewWorkflow(): Promise<RuleReviewWorkflow> {
  const [reviews, items] = await Promise.all([loadRuleReviews(), loadApprovalItems()]);
  const ruleItems = items.filter((i) => i.queueId === APRIL_2026_QUEUE_ID && i.source === "rule_review");
  const reviewedTopics = new Set(
    reviews.filter((r) => r.topic && !r.stale).map((r) => r.topic as string),
  );

  const workflowItems: RuleReviewWorkflowItem[] = ruleItems.map((item) => {
    const topicId = item.sourceRecordId;
    const topicLabel = item.title.replace(/^Rule review ·\s*/i, "") || topicId;
    const topicReviewed = reviewedTopics.has(topicId);
    const review = reviews.find((r) => r.topic === topicId && !r.stale);
    let nextStep: string;
    if (!topicReviewed) {
      nextStep = "Mark topic reviewed on Rules page with officer initials (not legal certification).";
    } else if (item.status === "needs_info" || item.status === "queued") {
      nextStep = "Topic reviewed — open queue item, complete override if required, approve individually (no batch).";
    } else {
      nextStep = `Queue status: ${item.status} — continue workbench review.`;
    }
    return {
      topicId,
      topicLabel,
      queueItemId: item.id,
      queueStatus: item.status,
      topicReviewed,
      reviewedInitials: review?.reviewedByInitials,
      hrefRules: `/admin/compliance/rules?focus=${encodeURIComponent(topicId)}`,
      hrefQueueItem: `/admin/compliance/approval/${APRIL_2026_QUEUE_ID}/item/${item.id}`,
      nextStep,
    };
  });

  const topicsPendingReview = workflowItems.filter((i) => !i.topicReviewed).length;
  const itemsReadyForWorkbench = workflowItems.filter((i) => i.topicReviewed && ["queued", "needs_info", "needs_review"].includes(i.queueStatus)).length;

  return {
    totalQueueItems: ruleItems.length,
    topicsPendingReview,
    itemsReadyForWorkbench,
    items: workflowItems.sort((a, b) => Number(a.topicReviewed) - Number(b.topicReviewed)),
    operatorSummary: `${ruleItems.length} rule_review queue item(s). ${topicsPendingReview} topic(s) need Rules page review first. Batch approval remains blocked.`,
  };
}

export async function syncRuleReviewQueueAfterTopicReview(topicId: string): Promise<number> {
  const items = await loadApprovalItems();
  let updated = 0;
  const now = new Date().toISOString();
  const next = items.map((item) => {
    if (item.source !== "rule_review" || item.sourceRecordId !== topicId) return item;
    if (item.status === "approved" || item.status === "rejected") return item;
    updated += 1;
    const noteLine = "Topic marked reviewed on Rules page — return to workbench for individual approve (no batch).";
    const suggestedNotes = item.suggestedNotes.includes(noteLine) ? item.suggestedNotes : [...item.suggestedNotes, noteLine];
    return {
      ...item,
      status: "needs_review" as const,
      updatedAt: now,
      aiRecommendation: "manual_review" as const,
      blockers: item.blockers.filter((b) => b !== "rule_topic_not_reviewed"),
      suggestedNotes,
    };
  });
  if (updated) {
    const { saveApprovalItems } = await import("../approval/approval-storage");
    await saveApprovalItems(next);
  }
  return updated;
}
