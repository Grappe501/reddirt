import type { ApprovalItem, ApprovalItemStatus, ApprovalQueue, ApprovalQueueStats } from "./approval-types";
import { getApprovalQueue, getQueueItems, loadApprovalItems, loadApprovalQueues } from "./approval-storage";
import { pickBestNextItem } from "./queue-navigation";

export { filterQueueItems, sortQueueItems, pickBestNextItem, QUEUE_FILTER_OPTIONS, QUEUE_SORT_OPTIONS } from "./queue-navigation";
export type { QueueFilterKey, QueueSortKey } from "./queue-navigation";
export { getQueueItems } from "./approval-storage";

const REVIEWED: ApprovalItemStatus[] = ["approved", "approved_with_changes", "needs_info", "rejected", "duplicate", "skipped"];
const REMAINING: ApprovalItemStatus[] = ["queued", "needs_review", "ready", "reopened"];

export async function loadApprovalQueueSummary(queueId: string) {
  const queue = await getApprovalQueue(queueId);
  const items = queue ? await getQueueItems(queueId) : [];
  return { queue, items, stats: computeQueueStats(items) };
}

export function computeQueueStats(items: ApprovalItem[]): ApprovalQueueStats {
  const reviewed = items.filter((item) => REVIEWED.includes(item.status));
  const remaining = items.filter((item) => REMAINING.includes(item.status));
  return {
    total: items.length,
    approved: items.filter((item) => item.status === "approved").length,
    approvedWithChanges: items.filter((item) => item.status === "approved_with_changes").length,
    needsInfo: items.filter((item) => item.status === "needs_info").length,
    rejected: items.filter((item) => item.status === "rejected").length,
    duplicate: items.filter((item) => item.status === "duplicate").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    remaining: remaining.length,
    highRisk: items.filter((item) => item.riskLevel === "high" || item.riskLevel === "blocked").length,
    blockerCount: items.filter((item) => item.blockers.length > 0).length,
    dollarsReviewed: sumAmount(reviewed),
    dollarsRemaining: sumAmount(remaining),
  };
}

function sumAmount(items: ApprovalItem[]): number {
  return items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
}

export async function getNextQueueItem(queueId: string, currentItemId?: string, filter?: (item: ApprovalItem) => boolean): Promise<ApprovalItem | null> {
  let items = await getQueueItems(queueId);
  if (filter) items = items.filter(filter);
  items = items.filter((item) => REMAINING.includes(item.status)).sort((a, b) => a.sortOrder - b.sortOrder);
  if (!currentItemId) return pickBestNextItem(items) ?? items[0] ?? null;
  const index = items.findIndex((item) => item.id === currentItemId);
  return items[index + 1] ?? null;
}

export async function getBestNextQueueItem(queueId: string): Promise<ApprovalItem | null> {
  const items = await getQueueItems(queueId);
  return pickBestNextItem(items.filter((item) => REMAINING.includes(item.status)));
}

export async function getPreviousQueueItem(queueId: string, currentItemId: string): Promise<ApprovalItem | null> {
  const items = (await getQueueItems(queueId))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const index = items.findIndex((item) => item.id === currentItemId);
  return index > 0 ? items[index - 1] : null;
}

export async function listAllQueues(): Promise<ApprovalQueue[]> {
  return loadApprovalQueues();
}

export async function getBatchEligibleItems(queueId: string): Promise<ApprovalItem[]> {
  const items = await getQueueItems(queueId);
  return items.filter(
    (item) =>
      item.confidenceScore >= 98
      && item.riskLevel === "low"
      && !item.blockers.length
      && !item.missingFields.length
      && item.evidence.length > 0
      && !item.sourceUpdatePending
      && REMAINING.includes(item.status),
  );
}
