import { CommunicationActionType, CommsQueueStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const CAL_TYPES: CommunicationActionType[] = [
  CommunicationActionType.CAL_REMINDER_DUE,
  CommunicationActionType.CAL_EVENT_CHANGED,
  CommunicationActionType.CAL_CANCELLATION_NOTICE,
  CommunicationActionType.CAL_RSVP_FOLLOWUP,
  CommunicationActionType.CAL_THANK_YOU_FOLLOWUP,
  CommunicationActionType.CAL_COUNTY_LEAD_MISSING,
  CommunicationActionType.CAL_MEDIA_CAPTURE_MISSING,
  CommunicationActionType.CAL_COMMS_PREP_MISSING,
  CommunicationActionType.CAL_STAFFING_GAP,
];

export function isCalendarCommsType(t: CommunicationActionType) {
  return (CAL_TYPES as readonly CommunicationActionType[]).includes(t);
}

export async function enqueueCalendarOp(
  params: {
    type: CommunicationActionType;
    eventId: string;
    payload?: Record<string, unknown>;
    scheduledAt?: Date;
    createdByUserId?: string | null;
  }
) {
  if (!CAL_TYPES.includes(params.type)) {
    throw new Error(`Not a calendar op type: ${params.type}`);
  }
  return prisma.communicationActionQueue.create({
    data: {
      actionType: params.type,
      eventId: params.eventId,
      threadId: null,
      queueStatus: CommsQueueStatus.PENDING,
      scheduledAt: params.scheduledAt ?? null,
      payloadJson: (params.payload ?? {}) as Prisma.InputJsonValue,
      createdByUserId: params.createdByUserId ?? undefined,
    },
  });
}

/**
 * Suggested follow-ups when an event is approved/published (staff still sends messages manually unless automated later).
 */
export async function seedCalendarOpsForEvent(eventId: string, createdByUserId?: string | null) {
  const existing = await prisma.communicationActionQueue.findFirst({
    where: { eventId, actionType: CommunicationActionType.CAL_COMMS_PREP_MISSING, queueStatus: CommsQueueStatus.PENDING },
  });
  if (existing) return;
  await enqueueCalendarOp({
    type: CommunicationActionType.CAL_COMMS_PREP_MISSING,
    eventId,
    createdByUserId: createdByUserId ?? null,
    payload: { reason: "new_or_updated_event" },
  });
}
