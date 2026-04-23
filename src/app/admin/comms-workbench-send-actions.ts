"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import {
  CommunicationDraftStatus,
  CommunicationSendStatus,
  CommunicationVariantStatus,
} from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  cancelCommunicationSendSchema,
  createCommunicationSendSchema,
  PLANNING_COMMUNICATION_SEND_STATUSES,
  updateCommunicationSendSchema,
} from "@/lib/comms-workbench/send-schemas";
import { prisma } from "@/lib/db";

export type CommsSendActionResult = { ok: true; id: string } | { ok: false; error: string };

function revalidateCommsPlan(communicationPlanId: string) {
  revalidatePath(`/admin/workbench/comms/plans/${communicationPlanId}`);
  revalidatePath("/admin/workbench/comms/plans");
  revalidatePath("/admin/workbench/comms");
}

const TERMINAL_FOR_UPDATE = new Set<CommunicationSendStatus>([
  CommunicationSendStatus.SENT,
  CommunicationSendStatus.PARTIALLY_SENT,
  CommunicationSendStatus.FAILED,
  CommunicationSendStatus.CANCELED,
]);

const NON_CANCELABLE = new Set<CommunicationSendStatus>([
  CommunicationSendStatus.SENT,
  CommunicationSendStatus.PARTIALLY_SENT,
  CommunicationSendStatus.FAILED,
  CommunicationSendStatus.CANCELED,
]);

function parseOptionalScheduledAt(
  raw: string | undefined
): { date: Date | null; error?: string; initialStatus: CommunicationSendStatus } {
  if (raw == null || raw === "") {
    return { date: null, initialStatus: CommunicationSendStatus.DRAFT };
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    return { date: null, error: "Invalid scheduled time.", initialStatus: CommunicationSendStatus.DRAFT };
  }
  const now = Date.now();
  if (d.getTime() > now) {
    return { date: d, initialStatus: CommunicationSendStatus.SCHEDULED };
  }
  return {
    date: null,
    error: "A scheduled send must use a time in the future, or leave the field empty for an unscheduled planning send.",
    initialStatus: CommunicationSendStatus.DRAFT,
  };
}

export async function createCommunicationSendAction(raw: unknown): Promise<CommsSendActionResult> {
  await requireAdminAction();
  const parsed = createCommunicationSendSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { communicationPlanId, channel, sendType, targetSegmentId } = parsed.data;
  const scheduledRaw = parsed.data.scheduledAt;

  const plan = await prisma.communicationPlan.findUnique({
    where: { id: communicationPlanId },
    select: { id: true },
  });
  if (!plan) return { ok: false, error: "Plan not found." };

  const { date: scheduledAt, error: schedError, initialStatus } = parseOptionalScheduledAt(scheduledRaw);
  if (schedError) return { ok: false, error: schedError };

  if (parsed.data.communicationVariantId) {
    const v = await prisma.communicationVariant.findUnique({
      where: { id: parsed.data.communicationVariantId },
      include: { draft: { select: { id: true, communicationPlanId: true, status: true, channel: true } } },
    });
    if (!v) return { ok: false, error: "Variant not found." };
    if (v.draft.communicationPlanId !== communicationPlanId) {
      return { ok: false, error: "Variant does not belong to this plan." };
    }
    if (v.status !== CommunicationVariantStatus.APPROVED) {
      return { ok: false, error: "The variant must be approved before you can create a send." };
    }
    try {
      const created = await prisma.communicationSend.create({
        data: {
          communicationPlanId,
          communicationDraftId: v.draft.id,
          communicationVariantId: v.id,
          channel,
          sendType: sendType ?? null,
          targetSegmentId: targetSegmentId ?? v.targetSegmentId ?? null,
          status: initialStatus,
          scheduledAt,
        },
        select: { id: true },
      });
      revalidateCommsPlan(communicationPlanId);
      return { ok: true, id: created.id };
    } catch (e) {
      console.error(e);
      return { ok: false, error: "Could not create send." };
    }
  }

  const d = await prisma.communicationDraft.findUnique({
    where: { id: parsed.data.communicationDraftId! },
    select: { id: true, communicationPlanId: true, status: true },
  });
  if (!d) return { ok: false, error: "Draft not found." };
  if (d.communicationPlanId !== communicationPlanId) {
    return { ok: false, error: "Draft does not belong to this plan." };
  }
  if (d.status !== CommunicationDraftStatus.APPROVED) {
    return { ok: false, error: "The draft must be approved before you can create a send." };
  }
  try {
    const created = await prisma.communicationSend.create({
      data: {
        communicationPlanId,
        communicationDraftId: d.id,
        communicationVariantId: null,
        channel,
        sendType: sendType ?? null,
        targetSegmentId: targetSegmentId ?? null,
        status: initialStatus,
        scheduledAt,
      },
      select: { id: true },
    });
    revalidateCommsPlan(communicationPlanId);
    return { ok: true, id: created.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create send." };
  }
}

export async function updateCommunicationSendAction(raw: unknown): Promise<CommsSendActionResult> {
  await requireAdminAction();
  const parsed = updateCommunicationSendSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { communicationSendId, scheduledAt, targetSegmentId, sendType, status: statusIn } = parsed.data;

  const send = await prisma.communicationSend.findUnique({
    where: { id: communicationSendId },
    select: { id: true, communicationPlanId: true, status: true, scheduledAt: true },
  });
  if (!send) return { ok: false, error: "Send not found." };
  if (TERMINAL_FOR_UPDATE.has(send.status)) {
    return { ok: false, error: "This send can no longer be edited." };
  }
  if (send.status === CommunicationSendStatus.SENDING) {
    return { ok: false, error: "This send is in progress; it cannot be edited here." };
  }

  if (statusIn != null && !PLANNING_COMMUNICATION_SEND_STATUSES.includes(statusIn)) {
    return { ok: false, error: "Only DRAFT, QUEUED, or SCHEDULED can be set in this workbench." };
  }

  let proposedScheduled: Date | null;
  if (scheduledAt === undefined) {
    proposedScheduled = send.scheduledAt;
  } else if (scheduledAt === null) {
    proposedScheduled = null;
  } else {
    const d = new Date(scheduledAt);
    if (Number.isNaN(d.getTime())) {
      return { ok: false, error: "Invalid scheduled time." };
    }
    if (d.getTime() <= Date.now()) {
      return { ok: false, error: "Use a future time for a scheduled time, or clear the field." };
    }
    proposedScheduled = d;
  }

  let proposedStatus = statusIn ?? send.status;
  if (statusIn == null) {
    if (scheduledAt !== undefined) {
      if (proposedScheduled == null && send.status === CommunicationSendStatus.SCHEDULED) {
        proposedStatus = CommunicationSendStatus.DRAFT;
      } else if (proposedScheduled != null && send.status === CommunicationSendStatus.DRAFT) {
        proposedStatus = CommunicationSendStatus.SCHEDULED;
      }
    }
  }
  if (statusIn === CommunicationSendStatus.DRAFT) {
    proposedScheduled = null;
  }
  if (proposedStatus === CommunicationSendStatus.SCHEDULED && proposedScheduled == null) {
    return { ok: false, error: "SCHEDULED status requires a future scheduled time." };
  }
  if (proposedStatus === CommunicationSendStatus.DRAFT && proposedScheduled != null) {
    return { ok: false, error: "DRAFT sends cannot have a scheduled time; clear the time or set status to SCHEDULED." };
  }

  const data: Prisma.CommunicationSendUpdateInput = {};
  if (scheduledAt !== undefined || statusIn === CommunicationSendStatus.DRAFT) {
    data.scheduledAt = proposedScheduled;
  }
  if (targetSegmentId !== undefined) {
    data.targetSegmentId = targetSegmentId;
  }
  if (sendType !== undefined) {
    data.sendType = sendType;
  }
  if (statusIn != null) {
    data.status = statusIn;
  } else if (scheduledAt !== undefined && (data.status == null) && proposedStatus !== send.status) {
    data.status = proposedStatus;
  }

  if (
    send.status === CommunicationSendStatus.QUEUED &&
    statusIn != null &&
    statusIn !== CommunicationSendStatus.QUEUED
  ) {
    data.queuedAt = null;
    data.queuedByUser = { disconnect: true };
  }

  if (Object.keys(data).length === 0) {
    return { ok: true, id: send.id };
  }

  try {
    await prisma.communicationSend.update({
      where: { id: send.id },
      data,
    });
    revalidateCommsPlan(send.communicationPlanId);
    return { ok: true, id: send.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update send." };
  }
}

export async function cancelCommunicationSendAction(raw: unknown): Promise<CommsSendActionResult> {
  await requireAdminAction();
  const parsed = cancelCommunicationSendSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const send = await prisma.communicationSend.findUnique({
    where: { id: parsed.data.communicationSendId },
    select: { id: true, communicationPlanId: true, status: true },
  });
  if (!send) return { ok: false, error: "Send not found." };
  if (NON_CANCELABLE.has(send.status)) {
    return { ok: false, error: "This send cannot be canceled." };
  }
  try {
    await prisma.communicationSend.update({
      where: { id: send.id },
      data: {
        status: CommunicationSendStatus.CANCELED,
        queuedAt: null,
        queuedByUser: { disconnect: true },
      },
    });
    revalidateCommsPlan(send.communicationPlanId);
    return { ok: true, id: send.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not cancel send." };
  }
}
