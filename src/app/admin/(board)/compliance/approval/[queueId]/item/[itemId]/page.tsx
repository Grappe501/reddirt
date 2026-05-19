import { notFound } from "next/navigation";
import { buildApprovalBurnDownReport } from "@/lib/compliance/approval/approval-burn-down";
import { getApprovalItem, getQueueItems } from "@/lib/compliance/approval/approval-storage";
import { computeQueueStats, getPreviousQueueItem } from "@/lib/compliance/approval/load-approval-queue";
import { getRuleReviewContext } from "@/lib/compliance/approval/rule-review-context";
import { LightningApprovalWorkbench } from "../../../workbench-client";

export const dynamic = "force-dynamic";

export default async function ApprovalItemWorkbenchPage({
  params,
}: {
  params: Promise<{ queueId: string; itemId: string }>;
}) {
  const { queueId, itemId } = await params;
  const item = await getApprovalItem(itemId);
  if (!item || item.queueId !== queueId) notFound();

  const items = await getQueueItems(queueId);
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const position = sorted.findIndex((row) => row.id === itemId) + 1;
  const prev = await getPreviousQueueItem(queueId, itemId);
  const stats = computeQueueStats(items);
  const burnDown = buildApprovalBurnDownReport(items);
  const ruleReview = getRuleReviewContext(item);

  return (
    <LightningApprovalWorkbench
      queueId={queueId}
      item={item}
      position={position || 1}
      total={sorted.length}
      stats={stats}
      prevItemId={prev?.id}
      nextBestExplanation={burnDown.nextBest?.itemId === item.id ? burnDown.nextBest : null}
      ruleReview={ruleReview}
    />
  );
}
