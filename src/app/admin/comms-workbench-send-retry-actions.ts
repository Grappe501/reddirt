"use server";

import { revalidatePath } from "next/cache";
import { CommunicationSendStatus, Prisma } from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";
import {
  buildOutcomeJsonForOperatorRequeue,
  determineCommunicationSendRetryEligibility,
  inferCommsSendRetryCategoryFromOutcome,
  isCommsSendSourceApprovedForExecution,
  logCommsSendRetryAttempt,
} from "@/lib/comms-workbench/send-retry-policy";
import { retryCommunicationSendSchema } from "@/lib/comms-workbench/send-retry-schemas";

export type CommsSendRetryActionResult = { ok: true } | { ok: false; error: string };

function revalidateCommsPlan(communicationPlanId: string) {
  revalidatePath(`/admin/workbench/comms/plans/${communicationPlanId}`);
  revalidatePath("/admin/workbench/comms/plans");
  revalidatePath("/admin/workbench/comms");
}

/**
 * **Operator retry (Packet 12A)** — from `FAILED` only, after policy and approval checks.
 * Idempotent: if the send is no longer FAILED (e.g. already re-queued), the update is skipped and a clear error is returned.
 * Does not automatically execute; the send must be run via the normal queue/execution path.
 */
export async function retryCommunicationSendAction(
  raw: unknown
): Promise<CommsSendRetryActionResult> {
  await requireAdminAction();
  const parsed = retryCommunicationSendSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const actor = await getAdminActorUserId();
  if (!actor) {
    return { ok: false, error: "Admin actor required." };
  }

  const send = await prisma.communicationSend.findUnique({
    where: { id: parsed.data.communicationSendId },
    include: {
      draft: { select: { status: true } },
      variant: { select: { status: true } },
    },
  });
  if (!send) {
    return { ok: false, error: "Send not found." };
  }
  if (send.communicationVariantId && !send.variant) {
    return { ok: false, error: "Send references a variant that is missing." };
  }

  const variant = send.communicationVariantId && send.variant ? { status: send.variant.status } : null;

  const eligibility = determineCommunicationSendRetryEligibility({
    status: send.status,
    channel: send.channel,
    retryCount: send.retryCount,
    draftStatus: send.draft.status,
    variant,
    outcomeSummaryJson: send.outcomeSummaryJson,
  });

  logCommsSendRetryAttempt({
    event: "retry_attempt",
    sendId: send.id,
    planId: send.communicationPlanId,
    currentRetryCount: send.retryCount,
    actorUserId: actor,
    canRetry: eligibility.canRetry,
    category: eligibility.retryCategory,
    blockedReason: eligibility.canRetry ? null : eligibility.retryBlockedReason,
  });

  if (!eligibility.canRetry) {
    return { ok: false, error: eligibility.retryBlockedReason || "Retry is not allowed for this send." };
  }

  const nowIso = new Date().toISOString();
  const now = new Date();
  const priorCategory = inferCommsSendRetryCategoryFromOutcome(send.outcomeSummaryJson, {
    ignoreStaleApprovalGating: isCommsSendSourceApprovedForExecution(send.draft.status, variant),
    channel: send.channel,
  });

  const newOutcome = buildOutcomeJsonForOperatorRequeue(send.outcomeSummaryJson, {
    channel: send.channel,
    priorProviderMessageId: send.providerMessageId,
    priorCategory,
    nowIso,
    actorUserId: actor,
  });

  const u = await prisma.communicationSend.updateMany({
    where: {
      id: send.id,
      status: CommunicationSendStatus.FAILED,
    },
    data: {
      status: CommunicationSendStatus.QUEUED,
      queuedAt: now,
      lastRetriedAt: now,
      retryCount: { increment: 1 },
      lastRetriedByUserId: actor,
      queuedByUserId: actor,
      sentAt: null,
      completedAt: null,
      sentByUserId: null,
      providerMessageId: null,
      outcomeSummaryJson: newOutcome as Prisma.InputJsonValue,
    },
  });

  if (u.count === 0) {
    const cur = await prisma.communicationSend.findUnique({
      where: { id: send.id },
      select: { status: true },
    });
    logCommsSendRetryAttempt({
      event: "retry_noop",
      sendId: send.id,
      planId: send.communicationPlanId,
      reason: "row_not_failed_or_raced",
      currentStatus: cur?.status,
    });
    return {
      ok: false,
      error: "Re-queue was skipped — the send is not in FAILED (it may have been updated already).",
    };
  }

  logCommsSendRetryAttempt({
    event: "retry_requeued",
    sendId: send.id,
    planId: send.communicationPlanId,
    newRetryCount: send.retryCount + 1,
    actorUserId: actor,
  });

  revalidateCommsPlan(send.communicationPlanId);
  return { ok: true };
}
