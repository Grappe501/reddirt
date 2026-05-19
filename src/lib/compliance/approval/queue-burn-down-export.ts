import type { ApprovalItem } from "./approval-types";
import { buildOperatorReviewRowsV2, summarizeBurnDownV2, BURN_DOWN_START_ORDER } from "./approval-burn-down-v2";
import { pickBestNextItem } from "./queue-navigation";
import { buildApprovalBurnDownReport } from "./approval-burn-down";

export type QueueImpactLabel =
  | "clears_filing_blocker"
  | "improves_reconciliation"
  | "may_become_batch_eligible"
  | "requires_human_rule_decision"
  | "waiting_on_source_file";

export type QueueBurndownRow = {
  id: string;
  queueId: string;
  blockerCategory: string;
  confidence: number;
  impactLabels: QueueImpactLabel[];
  recommendedAction: string;
  filingImpact: string;
  couldBecomeBatchEligibleAfterFix: boolean;
};

export type QueueBurndownReport = {
  generatedAt: string;
  queueId: string;
  openCount: number;
  groupedCounts: Record<string, number>;
  startHere: string[];
  nextBestItemId: string | null;
  nextBestReasons: string[];
  rows: QueueBurndownRow[];
};

function impactLabelsForCategory(category: string, item: ApprovalItem): QueueImpactLabel[] {
  const labels: QueueImpactLabel[] = [];
  if (item.source === "rule_review") labels.push("requires_human_rule_decision");
  if (item.source === "filing_task" || item.source === "rule_review") labels.push("clears_filing_blocker");
  if (item.source === "goodchange_contribution") labels.push("improves_reconciliation");
  if (category === "low_confidence" || category === "near_eligible") labels.push("may_become_batch_eligible");
  if (category === "source_update_pending") labels.push("waiting_on_source_file");
  if (category === "missing_evidence") labels.push("waiting_on_source_file");
  return [...new Set(labels)];
}

export async function buildQueueBurndownReport(queueId: string, items: ApprovalItem[]): Promise<QueueBurndownReport> {
  const open = items.filter((i) => ["queued", "needs_review", "ready", "reopened"].includes(i.status));
  const rowsV2 = await buildOperatorReviewRowsV2(items, queueId);
  const grouped = summarizeBurnDownV2(rowsV2);
  const startHere = BURN_DOWN_START_ORDER.filter((k) => (grouped[k] ?? 0) > 0);
  const burnDown = buildApprovalBurnDownReport(items);
  const next = pickBestNextItem(items);

  const rows: QueueBurndownRow[] = rowsV2.map((r) => {
    const item = open.find((i) => i.id === r.id);
    return {
      id: r.id,
      queueId: r.queueId,
      blockerCategory: r.blockerCategory,
      confidence: item?.confidenceScore ?? 0,
      impactLabels: item ? impactLabelsForCategory(r.blockerCategory, item) : [],
      recommendedAction: r.recommendedAction,
      filingImpact: r.filingImpact,
      couldBecomeBatchEligibleAfterFix: r.couldBecomeBatchEligibleAfterFix,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    queueId,
    openCount: open.length,
    groupedCounts: grouped,
    startHere,
    nextBestItemId: next?.id ?? null,
    nextBestReasons: burnDown.nextBest?.reasons ?? [],
    rows,
  };
}
