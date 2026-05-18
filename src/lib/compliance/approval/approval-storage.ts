import { createJsonRepository } from "../persistence/compliance-repository";
import type { ApprovalAuditEntry, ApprovalItem, ApprovalQueue } from "./approval-types";

const queuesRepo = createJsonRepository<ApprovalQueue[]>("data/compliance/approval/approval-queues.json", []);
const itemsRepo = createJsonRepository<ApprovalItem[]>("data/compliance/approval/approval-items.json", []);
const auditRepo = createJsonRepository<ApprovalAuditEntry[]>("data/compliance/approval/approval-audit-log.json", []);

export async function loadApprovalQueues(): Promise<ApprovalQueue[]> {
  return queuesRepo.load();
}

export async function saveApprovalQueues(queues: ApprovalQueue[]): Promise<void> {
  await queuesRepo.save(queues);
}

export async function loadApprovalItems(): Promise<ApprovalItem[]> {
  return itemsRepo.load();
}

export async function saveApprovalItems(items: ApprovalItem[]): Promise<void> {
  await itemsRepo.save(items);
}

export async function loadApprovalAuditLog(): Promise<ApprovalAuditEntry[]> {
  return auditRepo.load();
}

export async function appendApprovalAudit(entry: ApprovalAuditEntry): Promise<void> {
  const log = await auditRepo.load();
  await auditRepo.save([entry, ...log].slice(0, 5000));
}

export async function getApprovalQueue(queueId: string): Promise<ApprovalQueue | null> {
  return (await loadApprovalQueues()).find((queue) => queue.id === queueId) ?? null;
}

export async function getApprovalItem(itemId: string): Promise<ApprovalItem | null> {
  return (await loadApprovalItems()).find((item) => item.id === itemId) ?? null;
}

export async function getQueueItems(queueId: string): Promise<ApprovalItem[]> {
  const queue = await getApprovalQueue(queueId);
  if (!queue) return [];
  const items = await loadApprovalItems();
  const byId = new Map(items.map((item) => [item.id, item]));
  return queue.itemIds.map((id) => byId.get(id)).filter((item): item is ApprovalItem => Boolean(item));
}
