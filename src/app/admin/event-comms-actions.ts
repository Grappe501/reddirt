"use server";

import { revalidatePath } from "next/cache";
import { CommunicationActionType, EventReadinessStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { generateEventCommsMessageDraft, type EventCommsDraftInput } from "@/lib/calendar/event-comms-drafts";
import type { EventCommsDraftKind } from "@/lib/calendar/event-comms-policy";
import { assertCalendarQueueItemAllowedForStage } from "@/lib/calendar/event-comms-policy";
import { enqueueCalendarOp } from "@/lib/calendar/queue-helpers";

function str(form: FormData, k: string) {
  return String(form.get(k) ?? "").trim();
}

const DRAFT_KINDS = new Set<string>([
  "reminder_sms",
  "reminder_email",
  "cancellation",
  "thank_you",
  "volunteer_followup",
]);

const QUEUE_PICK: Record<string, CommunicationActionType> = {
  reminder: CommunicationActionType.CAL_REMINDER_DUE,
  rsvp: CommunicationActionType.CAL_RSVP_FOLLOWUP,
  event_changed: CommunicationActionType.CAL_EVENT_CHANGED,
  cancel: CommunicationActionType.CAL_CANCELLATION_NOTICE,
  county: CommunicationActionType.CAL_COUNTY_LEAD_MISSING,
  thankyou: CommunicationActionType.CAL_THANK_YOU_FOLLOWUP,
  nocomms: CommunicationActionType.CAL_COMMS_PREP_MISSING,
};

export type EventCommsDraftResult = { ok: true; text: string } | { ok: false; error: string };

export async function generateEventCommsDraftAction(
  _prev: EventCommsDraftResult | null,
  formData: FormData
): Promise<EventCommsDraftResult> {
  await requireAdminAction();
  const eventId = str(formData, "eventId");
  const kind = str(formData, "kind") as EventCommsDraftKind;
  if (!eventId || !DRAFT_KINDS.has(kind)) {
    return { ok: false, error: "Invalid request." };
  }
  const ev = await prisma.campaignEvent.findUnique({
    where: { id: eventId },
    include: { county: { select: { displayName: true } } },
  });
  if (!ev) return { ok: false, error: "Event not found." };
  const input: EventCommsDraftInput = {
    title: ev.title,
    eventType: ev.eventType,
    startAt: ev.startAt,
    endAt: ev.endAt,
    timezone: ev.timezone,
    locationName: ev.locationName,
    address: ev.address,
    publicSummary: ev.publicSummary,
    internalSummary: ev.internalSummary,
    eventWorkflowState: ev.eventWorkflowState,
    county: ev.county,
  };
  const r = await generateEventCommsMessageDraft(input, kind);
  if ("error" in r) return { ok: false, error: r.error };
  return { ok: true, text: r.text };
}

export async function enqueueEventCalendarCommsNudgeAction(formData: FormData) {
  await requireAdminAction();
  const eventId = str(formData, "eventId");
  const key = str(formData, "queue");
  if (!eventId || !QUEUE_PICK[key]) return;
  const actor = await getAdminActorUserId();
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) return;
  try {
    assertCalendarQueueItemAllowedForStage(ev.eventWorkflowState, QUEUE_PICK[key]!);
  } catch {
    revalidatePath("/admin/workbench/calendar");
    return;
  }
  await enqueueCalendarOp({
    type: QUEUE_PICK[key]!,
    eventId,
    createdByUserId: actor,
    payload: { source: "event_execution_panel", key },
  });
  if (key === "thankyou") {
    await prisma.campaignEvent.update({
      where: { id: eventId },
      data: { thankYouQueuedAt: new Date() } as Record<string, unknown>,
    });
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/workbench");
  revalidatePath("/admin/events");
}

function pickStatus(raw: string): EventReadinessStatus {
  const u = Object.values(EventReadinessStatus).find((v) => v === raw);
  return u ?? EventReadinessStatus.UNKNOWN;
}

/**
 * Log operational milestones (optional staff clicks after sending in Twilio / Sendgrid).
 */
export async function recordEventCommsMilestoneAction(formData: FormData) {
  await requireAdminAction();
  const eventId = str(formData, "eventId");
  const m = str(formData, "milestone");
  if (!eventId) return;
  const now = new Date();
  const data: Record<string, unknown> = {};
  if (m === "reminder_sent") data.lastReminderSentAt = now;
  else if (m === "attendee_notice") data.lastAttendeeNoticeAt = now;
  else if (m === "cancellation_notice") data.lastCancellationNoticeAt = now;
  else return;
  await prisma.campaignEvent.update({ where: { id: eventId }, data });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
}

export async function updateEventCommsStatusFieldsAction(formData: FormData) {
  await requireAdminAction();
  const eventId = str(formData, "eventId");
  if (!eventId) return;
  await prisma.campaignEvent.update({
    where: { id: eventId },
    data: {
      reminderPlanStatus: pickStatus(str(formData, "reminderPlanStatus")),
      attendeeCommsStatus: pickStatus(str(formData, "attendeeCommsStatus")),
      followupCommsStatus: pickStatus(str(formData, "followupCommsStatus")),
      nextReminderDueAt: (() => {
        const t = str(formData, "nextReminderDueAt");
        if (!t) return null;
        const d = new Date(t);
        return isNaN(+d) ? null : d;
      })(),
    } as Record<string, unknown>,
  });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
}
