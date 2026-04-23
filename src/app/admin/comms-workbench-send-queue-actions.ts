"use server";

import { revalidatePath } from "next/cache";
import {
  CommunicationDraftStatus,
  CommunicationSendStatus,
  CommunicationVariantStatus,
} from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { buildCommunicationSendExecutionContract } from "@/lib/comms-workbench/send-execution-contract";
import { queueCommunicationSendSchema, unqueueCommunicationSendSchema } from "@/lib/comms-workbench/send-queue-schemas";
import { prisma } from "@/lib/db";

export type CommsQueueActionResult = { ok: true; id: string; noop?: boolean } | { ok: false; error: string };

function revalidateCommsPlan(communicationPlanId: string) {
  revalidatePath(`/admin/workbench/comms/plans/${communicationPlanId}`);
  revalidatePath("/admin/workbench/comms/plans");
  revalidatePath("/admin/workbench/comms");
}

const TERMINAL: CommunicationSendStatus[] = [
  CommunicationSendStatus.SENT,
  CommunicationSendStatus.FAILED,
  CommunicationSendStatus.PARTIALLY_SENT,
];

const QUEUEABLE: CommunicationSendStatus[] = [
  CommunicationSendStatus.DRAFT,
  CommunicationSendStatus.SCHEDULED,
];

function isSourceApproved(draftStatus: CommunicationDraftStatus, variant: { status: CommunicationVariantStatus } | null) {
  if (variant) {
    return variant.status === CommunicationVariantStatus.APPROVED;
  }
  return draftStatus === CommunicationDraftStatus.APPROVED;
}

/**
 * Mark a send as ready for a future execution layer. Idempotent if already QUEUED.
 * Does not run providers, workers, or delivery.
 */
export async function queueCommunicationSendAction(raw: unknown): Promise<CommsQueueActionResult> {
  await requireAdminAction();
  const parsed = queueCommunicationSendSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const send = await prisma.communicationSend.findUnique({
    where: { id: parsed.data.communicationSendId },
    include: {
      draft: {
        select: {
          id: true,
          status: true,
          subjectLine: true,
          previewText: true,
          bodyCopy: true,
          shortCopy: true,
          ctaType: true,
        },
      },
      variant: {
        select: {
          id: true,
          status: true,
          subjectLineOverride: true,
          bodyCopyOverride: true,
          ctaOverride: true,
        },
      },
    },
  });

  if (!send) {
    return { ok: false, error: "Send not found." };
  }

  if (send.status === CommunicationSendStatus.QUEUED) {
    return { ok: true, id: send.id, noop: true };
  }

  if (send.status === CommunicationSendStatus.CANCELED) {
    return { ok: false, error: "Canceled sends cannot be queued." };
  }
  if (TERMINAL.includes(send.status)) {
    return { ok: false, error: "This send has already completed or failed; it cannot be queued." };
  }
  if (send.status === CommunicationSendStatus.SENDING) {
    return { ok: false, error: "This send is already in progress." };
  }
  if (!QUEUEABLE.includes(send.status)) {
    return { ok: false, error: "Only a DRAFT or SCHEDULED send can be queued for execution." };
  }

  if (!isSourceApproved(send.draft.status, send.variant)) {
    return { ok: false, error: "The source asset is no longer approved; update or re-approve before queueing." };
  }

  const actor = await getAdminActorUserId();
  if (!actor) {
    return { ok: false, error: "Admin actor required." };
  }

  // Ensure handoff shape at queue time (pure); future workers load the same contract from DB relations.
  buildCommunicationSendExecutionContract(
    {
      id: send.id,
      communicationPlanId: send.communicationPlanId,
      communicationDraftId: send.communicationDraftId,
      communicationVariantId: send.communicationVariantId,
      channel: send.channel,
      sendType: send.sendType,
      scheduledAt: send.scheduledAt,
      targetSegmentId: send.targetSegmentId,
      metadataJson: send.metadataJson,
    },
    send.draft,
    send.variant
  );

  const now = new Date();
  try {
    await prisma.communicationSend.update({
      where: { id: send.id },
      data: {
        status: CommunicationSendStatus.QUEUED,
        queuedAt: now,
        queuedByUser: { connect: { id: actor } },
      },
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not queue send." };
  }

  revalidateCommsPlan(send.communicationPlanId);
  return { ok: true, id: send.id };
}

/**
 * Return a send to planning (not execution-ready). Only when current status is QUEUED.
 */
export async function unqueueCommunicationSendAction(raw: unknown): Promise<CommsQueueActionResult> {
  await requireAdminAction();
  const parsed = unqueueCommunicationSendSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const send = await prisma.communicationSend.findUnique({
    where: { id: parsed.data.communicationSendId },
    select: { id: true, communicationPlanId: true, status: true, scheduledAt: true },
  });
  if (!send) {
    return { ok: false, error: "Send not found." };
  }
  if (send.status !== CommunicationSendStatus.QUEUED) {
    return { ok: false, error: "Only a queued send can be unqueued." };
  }

  const t = send.scheduledAt?.getTime();
  const isFuture = t != null && t > Date.now();
  const nextStatus = isFuture ? CommunicationSendStatus.SCHEDULED : CommunicationSendStatus.DRAFT;

  try {
    await prisma.communicationSend.update({
      where: { id: send.id },
      data: {
        status: nextStatus,
        queuedAt: null,
        queuedByUser: { disconnect: true },
        ...(isFuture
          ? {}
          : {
              scheduledAt: null,
            }),
      },
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not unqueue send." };
  }

  revalidateCommsPlan(send.communicationPlanId);
  return { ok: true, id: send.id };
}
