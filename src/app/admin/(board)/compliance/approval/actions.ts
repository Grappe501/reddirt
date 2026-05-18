"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  approveItem,
  approveItemWithChanges,
  approveBatch,
  markDuplicate,
  markNeedsInfo,
  rejectItem,
  reopenItem,
  saveApprovalFieldEdits,
  skipItem,
} from "@/lib/compliance/approval/approval-actions";
import { buildApprovalQueues } from "@/lib/compliance/approval/build-approval-queue";
import { saveApprovalItems, saveApprovalQueues } from "@/lib/compliance/approval/approval-storage";

function revalidateApproval(queueId: string) {
  revalidatePath("/admin/compliance/approval");
  revalidatePath(`/admin/compliance/approval/${queueId}`);
  revalidatePath("/admin/compliance/approval/history");
}

export async function rebuildApprovalQueuesAction() {
  const { queues, items } = await buildApprovalQueues();
  await saveApprovalQueues(queues);
  await saveApprovalItems(items);
  revalidatePath("/admin/compliance/approval");
}

export async function saveFieldEditsAction(input: {
  itemId: string;
  queueId: string;
  edits: Record<string, string | number | boolean | null>;
  initials: string;
}) {
  await saveApprovalFieldEdits(input.itemId, input.edits, input.initials);
  revalidateApproval(input.queueId);
}

export async function decisionAction(input: {
  itemId: string;
  queueId: string;
  decision: "approve" | "approve_with_changes" | "save_next" | "needs_info" | "reject" | "duplicate" | "skip";
  initials: string;
  note?: string;
  duplicateOfId?: string;
  edits?: Record<string, string | number | boolean | null>;
}) {
  if (input.edits && Object.keys(input.edits).length) {
    await saveApprovalFieldEdits(input.itemId, input.edits, input.initials);
  }
  let nextId: string | null = null;
  switch (input.decision) {
    case "save_next": {
      const { getNextQueueItem } = await import("@/lib/compliance/approval/load-approval-queue");
      const next = await getNextQueueItem(input.queueId, input.itemId);
      nextId = next?.id ?? null;
      break;
    }
    case "approve": {
      const result = await approveItem(input.itemId, input.initials, input.note);
      nextId = result.nextItemId;
      break;
    }
    case "approve_with_changes": {
      const result = await approveItemWithChanges(input.itemId, input.initials, input.note);
      nextId = result.nextItemId;
      break;
    }
    case "needs_info": {
      const result = await markNeedsInfo(input.itemId, input.initials, input.note);
      nextId = result.nextItemId;
      break;
    }
    case "reject": {
      const result = await rejectItem(input.itemId, input.initials, input.note ?? "Rejected");
      nextId = result.nextItemId;
      break;
    }
    case "duplicate": {
      const result = await markDuplicate(input.itemId, input.initials, input.duplicateOfId, input.note);
      nextId = result.nextItemId;
      break;
    }
    case "skip": {
      const result = await skipItem(input.itemId, input.initials, input.note);
      nextId = result.nextItemId;
      break;
    }
  }
  revalidateApproval(input.queueId);
  if (nextId) redirect(`/admin/compliance/approval/${input.queueId}/item/${nextId}`);
  redirect(`/admin/compliance/approval/${input.queueId}`);
}

export async function batchApproveAction(formData: FormData) {
  const queueId = String(formData.get("queueId") ?? "");
  const initials = String(formData.get("initials") ?? "");
  const note = String(formData.get("note") ?? "");
  const itemIds = formData.getAll("itemIds").map(String).filter(Boolean);
  if (!queueId || !initials.trim() || !note.trim() || !itemIds.length) {
    throw new Error("Batch approval requires queue, initials, note, and at least one item.");
  }
  await approveBatch(itemIds, initials, note);
  revalidateApproval(queueId);
  redirect(`/admin/compliance/approval/${queueId}`);
}

export async function reopenItemAction(input: { itemId: string; queueId: string; initials: string; note?: string }) {
  await reopenItem(input.itemId, input.initials, input.note);
  revalidateApproval(input.queueId);
  redirect(`/admin/compliance/approval/${input.queueId}/item/${input.itemId}`);
}

export async function reopenItemFormAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const queueId = String(formData.get("queueId") ?? "");
  const initials = String(formData.get("initials") ?? "OP");
  await reopenItem(itemId, initials);
  revalidateApproval(queueId);
  redirect(`/admin/compliance/approval/${queueId}/item/${itemId}`);
}
