import type { ApprovalItem } from "./approval-types";
import { getBatchEligibleItems } from "./load-approval-queue";

export type BatchIneligibilityReason =
  | "confidence_low"
  | "evidence_missing"
  | "blockers"
  | "source_update_pending"
  | "missing_required_field"
  | "rule_review_required"
  | "high_risk"
  | "not_open_status";

export type BatchReadinessReport = {
  eligible: number;
  closeToEligible: number;
  ineligible: number;
  reasonCounts: Record<BatchIneligibilityReason, number>;
  topBlockers: Array<{ reason: string; count: number }>;
  nearEligible: Array<{ id: string; title: string; fixes: string[] }>;
};

function reasonsForItem(item: ApprovalItem): BatchIneligibilityReason[] {
  const reasons: BatchIneligibilityReason[] = [];
  if (!["queued", "needs_review", "ready", "reopened"].includes(item.status)) reasons.push("not_open_status");
  if (item.confidenceScore < 98) reasons.push("confidence_low");
  if (!item.evidence.length) reasons.push("evidence_missing");
  if (item.blockers.length) reasons.push("blockers");
  if (item.sourceUpdatePending) reasons.push("source_update_pending");
  if (item.missingFields.length) reasons.push("missing_required_field");
  if (item.source === "rule_review") reasons.push("rule_review_required");
  if (item.riskLevel !== "low") reasons.push("high_risk");
  return reasons;
}

export async function buildBatchReadinessReport(queueId: string, items: ApprovalItem[]): Promise<BatchReadinessReport> {
  const eligibleItems = await getBatchEligibleItems(queueId);
  const eligibleIds = new Set(eligibleItems.map((item) => item.id));
  const open = items.filter((item) => ["queued", "needs_review", "ready", "reopened"].includes(item.status));
  const reasonCounts: Record<BatchIneligibilityReason, number> = {
    confidence_low: 0,
    evidence_missing: 0,
    blockers: 0,
    source_update_pending: 0,
    missing_required_field: 0,
    rule_review_required: 0,
    high_risk: 0,
    not_open_status: 0,
  };
  const blockerLabels = new Map<string, number>();
  const nearEligible: BatchReadinessReport["nearEligible"] = [];

  for (const item of open) {
    if (eligibleIds.has(item.id)) continue;
    const reasons = reasonsForItem(item);
    for (const reason of reasons) reasonCounts[reason] += 1;
    for (const blocker of item.blockers) {
      blockerLabels.set(blocker, (blockerLabels.get(blocker) ?? 0) + 1);
    }
    const fixCount = reasons.length;
    if (fixCount <= 2 && reasons.every((r) => r !== "high_risk" && r !== "rule_review_required")) {
      nearEligible.push({
        id: item.id,
        title: item.title,
        fixes: reasons.map((reason) => REASON_LABELS[reason]),
      });
    }
  }

  const topBlockers = [...blockerLabels.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    eligible: eligibleItems.length,
    closeToEligible: nearEligible.length,
    ineligible: open.length - eligibleItems.length,
    reasonCounts,
    topBlockers,
    nearEligible: nearEligible.slice(0, 10),
  };
}

const REASON_LABELS: Record<BatchIneligibilityReason, string> = {
  confidence_low: "Raise confidence to ≥ 98% (complete fields + evidence)",
  evidence_missing: "Attach or link evidence",
  blockers: "Resolve blockers listed on item",
  source_update_pending: "Complete source record write path",
  missing_required_field: "Fill required fields",
  rule_review_required: "Complete rule topic review (human, not legal certification)",
  high_risk: "Reduce risk or use single-item approval with override",
  not_open_status: "Item already decided",
};
