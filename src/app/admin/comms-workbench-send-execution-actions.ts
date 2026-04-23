"use server";

import { revalidatePath } from "next/cache";
import { CommunicationSendStatus } from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import {
  claimQueuedCommunicationSendForExecution,
  executeCommunicationSend,
  findNextQueuedCommunicationSendInPlan,
} from "@/lib/comms-workbench/send-execution";
import { prisma } from "@/lib/db";
import { retryCommunicationSendAction } from "@/app/admin/comms-workbench-send-retry-actions";
import {
  claimCommunicationSendSchema,
  executeCommunicationSendSchema,
  executeNextQueuedSendInPlanSchema,
  resetFailedSendToQueuedSchema,
} from "@/lib/comms-workbench/send-execution-schemas";

export type CommsExecutionActionResult = { ok: true } | { ok: false; error: string };

function revalidateCommsPlan(communicationPlanId: string) {
  revalidatePath(`/admin/workbench/comms/plans/${communicationPlanId}`);
  revalidatePath("/admin/workbench/comms/plans");
  revalidatePath("/admin/workbench/comms");
}

/**
 * Execute one queued workbench send: claim (`QUEUED` → `SENDING`) then run provider dispatch.
 * Optional one-shot `toEmail` / `toPhone` (admin) for test sends; not persisted.
 */
export async function executeQueuedCommunicationSendAction(raw: unknown): Promise<CommsExecutionActionResult> {
  await requireAdminAction();
  const parsed = executeCommunicationSendSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { communicationSendId, toEmail, toPhone } = parsed.data;
  const actor = await getAdminActorUserId();
  if (!actor) {
    return { ok: false, error: "Admin actor required." };
  }

  const plan = await prisma.communicationSend.findUnique({
    where: { id: communicationSendId },
    select: { communicationPlanId: true, status: true },
  });
  if (!plan) {
    return { ok: false, error: "Send not found." };
  }
  if (plan.status !== CommunicationSendStatus.QUEUED && plan.status !== CommunicationSendStatus.SENDING) {
    return { ok: false, error: "The send must be QUEUED (or SENDING to retry / repair) to run execution." };
  }

  if (plan.status === CommunicationSendStatus.QUEUED) {
    const claimed = await claimQueuedCommunicationSendForExecution(communicationSendId);
    if (!claimed.ok) {
      return { ok: false, error: claimed.error };
    }
  }

  const ex = await executeCommunicationSend({
    communicationSendId,
    sentByUserId: actor,
    recipientOverride: { toEmail, toPhone },
  });
  if (!ex.ok) {
    revalidateCommsPlan(plan.communicationPlanId);
    return { ok: false, error: ex.error };
  }
  revalidateCommsPlan(plan.communicationPlanId);
  return { ok: true };
}

/**
 * `QUEUED` → claim → execute for the next eligible send in a plan.
 */
export async function executeNextQueuedCommunicationSendInPlanAction(raw: unknown): Promise<CommsExecutionActionResult> {
  await requireAdminAction();
  const parsed = executeNextQueuedSendInPlanSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const next = await findNextQueuedCommunicationSendInPlan(parsed.data.communicationPlanId);
  if (!next) {
    return { ok: false, error: "No queued sends in this plan." };
  }
  return executeQueuedCommunicationSendAction({
    communicationSendId: next.id,
    toEmail: parsed.data.toEmail,
    toPhone: parsed.data.toPhone,
  });
}

/**
 * Idempotent: claim only — for workers that call `executeCommunicationSend` separately.
 */
export async function claimCommunicationSendForExecutionAction(
  raw: unknown
): Promise<CommsExecutionActionResult> {
  await requireAdminAction();
  const parsed = claimCommunicationSendSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const r = await claimQueuedCommunicationSendForExecution(parsed.data.communicationSendId);
  if (!r.ok) {
    return { ok: false, error: r.error };
  }
  const plan = await prisma.communicationSend.findUnique({
    where: { id: parsed.data.communicationSendId },
    select: { communicationPlanId: true },
  });
  if (plan) revalidateCommsPlan(plan.communicationPlanId);
  return { ok: true };
}

/**
 * @deprecated Use `retryCommunicationSendAction` (Packet 12A policy). Thin wrapper for compatibility.
 * Explicitly move FAILED → `QUEUED` with retry tracking, limit checks, and outcome audit.
 */
export async function resetFailedCommunicationSendToQueuedAction(
  raw: unknown
): Promise<CommsExecutionActionResult> {
  const parsed = resetFailedSendToQueuedSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  return retryCommunicationSendAction(parsed.data);
}
