import { prepareApprovalItemAi } from "./approval-ai-prep";
import { evaluateApprovalGuards } from "./approval-guards";
import { applyApprovalToSourceRecord } from "./approval-source-updates";
import {
  appendApprovalAudit,
  getApprovalItem,
  loadApprovalItems,
  saveApprovalItems,
} from "./approval-storage";
import type { ApprovalAuditEntry, ApprovalItem, ApprovalItemStatus } from "./approval-types";
import { getNextQueueItem } from "./load-approval-queue";
import { upsertApprovalNeedsInfoTask } from "../tasks/approval-needs-info-storage";

function initials(value: string): string {
  return value.trim().toUpperCase().slice(0, 8) || "UNK";
}

async function updateItem(itemId: string, updater: (item: ApprovalItem) => ApprovalItem): Promise<ApprovalItem> {
  const items = await loadApprovalItems();
  const index = items.findIndex((item) => item.id === itemId);
  if (index < 0) throw new Error("Approval item not found");
  const next = updater(items[index]);
  items[index] = next;
  await saveApprovalItems(items);
  return next;
}

async function audit(entry: Omit<ApprovalAuditEntry, "id" | "createdAt">) {
  const full: ApprovalAuditEntry = {
    ...entry,
    id: `appr-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  await appendApprovalAudit(full);
  return full;
}

export async function saveApprovalFieldEdits(
  itemId: string,
  edits: Record<string, string | number | boolean | null>,
  actorInitials: string,
): Promise<ApprovalItem> {
  const before = await getApprovalItem(itemId);
  if (!before) throw new Error("Item not found");
  const fields = before.fields.map((field) => {
    if (!(field.key in edits)) return field;
    const value = edits[field.key];
    return {
      ...field,
      value,
      proposedValue: value,
      validationStatus: field.required && (value == null || value === "") ? "missing" as const : "ok" as const,
    };
  });
  const missingFields = fields.filter((f) => f.validationStatus === "missing").map((f) => f.label);
  const draft = { ...before, fields, missingFields, updatedAt: new Date().toISOString() };
  const ai = prepareApprovalItemAi(draft);
  const item = await updateItem(itemId, () => ({ ...draft, ...ai, status: before.status === "queued" ? "needs_review" : before.status }));
  await audit({
    itemId,
    queueId: item.queueId,
    action: "field_edits_saved",
    actorInitials: initials(actorInitials),
    before: { fields: before.fields },
    after: { fields: item.fields },
    changedFields: Object.keys(edits),
  });
  item.auditTrailIds.push(`saved-${Date.now()}`);
  return item;
}

async function finalizeDecision(
  itemId: string,
  status: ApprovalItemStatus,
  action: ApprovalAuditEntry["action"],
  actorInitials: string,
  note?: string,
  voiceTranscript?: string,
  overrideReason?: string,
): Promise<{ item: ApprovalItem; nextItemId: string | null }> {
  const existing = await getApprovalItem(itemId);
  if (!existing) throw new Error("Item not found");
  const guards = evaluateApprovalGuards(existing, { overrideReason });
  if ((status === "approved" || status === "approved_with_changes") && existing.source === "rule_review" && !overrideReason?.trim()) {
    throw new Error("Rule review items cannot be approved without override reason documenting topic review on Rules page.");
  }
  if ((status === "approved" || status === "approved_with_changes") && !guards.canApprove) {
    throw new Error("Cannot approve yet. Required fields are missing.");
  }
  const sourceStatus =
    status === "approved" || status === "approved_with_changes" || status === "needs_info" || status === "rejected" || status === "duplicate" || status === "skipped"
      ? status
      : "needs_info";
  const sourceResult = await applyApprovalToSourceRecord(existing, sourceStatus, initials(actorInitials));
  const item = await updateItem(itemId, (current) => ({
    ...current,
    status,
    sourceUpdatePending: sourceResult.sourceUpdatePending,
    updatedAt: new Date().toISOString(),
  }));
  const entry = await audit({
    itemId,
    queueId: item.queueId,
    action,
    actorInitials: initials(actorInitials),
    note: note ?? overrideReason,
    voiceTranscript,
    after: { status: item.status, sourceUpdatePending: item.sourceUpdatePending },
  });
  item.auditTrailIds.push(entry.id);
  const next = await getNextQueueItem(item.queueId, itemId);
  return { item, nextItemId: next?.id ?? null };
}

export async function approveItem(itemId: string, actorInitials: string, note?: string) {
  return finalizeDecision(itemId, "approved", "approved", actorInitials, note);
}

export async function approveItemWithChanges(itemId: string, actorInitials: string, note?: string) {
  return finalizeDecision(itemId, "approved_with_changes", "approved_with_changes", actorInitials, note);
}

export async function markNeedsInfo(itemId: string, actorInitials: string, note?: string) {
  const result = await finalizeDecision(itemId, "needs_info", "needs_info", actorInitials, note);
  await upsertApprovalNeedsInfoTask({
    approvalItemId: result.item.id,
    queueId: result.item.queueId,
    title: `Needs info: ${result.item.title}`,
    note,
    requestedInfo: note?.trim() || "Operator requested additional documentation or fields.",
    priority: result.item.riskLevel === "high" ? "urgent" : "high",
  });
  return result;
}

export async function rejectItem(itemId: string, actorInitials: string, reason: string) {
  return finalizeDecision(itemId, "rejected", "rejected", actorInitials, reason);
}

export async function markDuplicate(itemId: string, actorInitials: string, duplicateOfId?: string, note?: string) {
  const result = await finalizeDecision(itemId, "duplicate", "duplicate", actorInitials, note);
  if (duplicateOfId) {
    await updateItem(itemId, (item) => ({ ...item, duplicateOfId }));
  }
  return result;
}

export async function skipItem(itemId: string, actorInitials: string, note?: string) {
  return finalizeDecision(itemId, "skipped", "skipped", actorInitials, note);
}

export async function reopenItem(itemId: string, actorInitials: string, note?: string) {
  const item = await updateItem(itemId, (current) => ({
    ...current,
    status: "reopened",
    updatedAt: new Date().toISOString(),
  }));
  await audit({ itemId, queueId: item.queueId, action: "reopened", actorInitials: initials(actorInitials), note });
  return item;
}

export async function approveBatch(itemIds: string[], actorInitials: string, auditNote: string) {
  const results = [];
  for (const itemId of itemIds) {
    const item = await getApprovalItem(itemId);
    if (!item) continue;
    if (item.source === "rule_review") {
      throw new Error(`Item ${itemId} is a rule review item — batch approval is not allowed.`);
    }
    if (item.confidenceScore < 98 || item.riskLevel !== "low" || item.blockers.length) {
      throw new Error(`Item ${itemId} is not eligible for batch approval.`);
    }
    results.push(await approveItem(itemId, actorInitials, auditNote));
  }
  await audit({
    itemId: "batch",
    queueId: results[0]?.item.queueId ?? "unknown",
    action: "batch_approved",
    actorInitials: initials(actorInitials),
    note: auditNote,
    after: { count: results.length, itemIds },
  });
  return results;
}
