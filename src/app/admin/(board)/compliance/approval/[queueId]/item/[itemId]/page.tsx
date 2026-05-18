import { notFound } from "next/navigation";
import { getApprovalItem } from "@/lib/compliance/approval/approval-storage";
import { getQueueItems } from "@/lib/compliance/approval/approval-storage";
import { computeQueueStats, getPreviousQueueItem } from "@/lib/compliance/approval/load-approval-queue";
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

  return (
    <LightningApprovalWorkbench
      queueId={queueId}
      item={item}
      position={position || 1}
      total={sorted.length}
      stats={stats}
      prevItemId={prev?.id}
    />
  );
}
