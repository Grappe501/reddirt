import {
  CommunicationCampaignAutomationStatus,
  CommunicationCampaignChannel,
  CommunicationCampaignStatus,
  CommunicationCampaignType,
  CommunicationChannel,
  CommunicationTemplateType,
  type CampaignEventType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { type AudienceDefinition, defaultAudienceDefinition } from "./audience-definition";

const TRIGGER_EVENT = "EVENT";

export type EventAutomationKind = "PUBLISH_REMINDER" | "CANCEL_NOTICE" | "COMPLETE_THANKS";

const KIND_TO_KEY: Record<EventAutomationKind, string> = {
  PUBLISH_REMINDER: "event.publish.reminder",
  CANCEL_NOTICE: "event.cancel.notice",
  COMPLETE_THANKS: "event.complete.thanks",
};

function idempotencyKey(eventId: string, kind: EventAutomationKind) {
  return `event:${eventId}:${kind}`;
}

function campaignTypeFor(kind: EventAutomationKind): CommunicationCampaignType {
  if (kind === "PUBLISH_REMINDER") return CommunicationCampaignType.EVENT_REMINDER;
  if (kind === "CANCEL_NOTICE") return CommunicationCampaignType.EVENT_CANCELLATION;
  return CommunicationCampaignType.EVENT_THANK_YOU;
}

function defaultChannel(): CommunicationCampaignChannel {
  return CommunicationCampaignChannel.MIXED;
}

/** Templates are stored with `EMAIL` or `SMS`; use email copy when the campaign is `MIXED`. */
function templateChannel(c: CommunicationCampaignChannel): CommunicationChannel {
  if (c === CommunicationCampaignChannel.MIXED) return CommunicationChannel.EMAIL;
  if (c === CommunicationCampaignChannel.SMS) return CommunicationChannel.SMS;
  return CommunicationChannel.EMAIL;
}

function buildAudienceForEvent(event: {
  id: string;
  countyId: string | null;
}): AudienceDefinition {
  return {
    ...defaultAudienceDefinition(),
    eventIdForSignups: event.id,
    countyIds: event.countyId ? [event.countyId] : undefined,
    applyPreferenceSuppression: true,
  };
}

async function pickTemplate(params: {
  eventType: CampaignEventType;
  kind: EventAutomationKind;
  channel: CommunicationCampaignChannel;
}) {
  const ch = templateChannel(params.channel);
  const wantType =
    params.kind === "PUBLISH_REMINDER" ? CommunicationTemplateType.EVENT_REMINDER : CommunicationTemplateType.BROADCAST;
  const matchEvent = await prisma.communicationTemplate.findFirst({
    where: {
      templateType: wantType,
      channel: ch,
      eventType: params.eventType,
    },
    orderBy: { updatedAt: "desc" },
  });
  if (matchEvent) return matchEvent;
  return prisma.communicationTemplate.findFirst({
    where: {
      templateType: wantType,
      channel: ch,
      eventType: null,
    },
    orderBy: { updatedAt: "desc" },
  });
}

function defaultCopy(event: { title: string; startAt: Date; locationName: string | null }, kind: EventAutomationKind) {
  const when = event.startAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  if (kind === "PUBLISH_REMINDER") {
    return {
      subject: `Reminder: ${event.title}`,
      body: `Hi — this is a reminder about our event: ${event.title}\n\nWhen: ${when}${event.locationName ? `\nWhere: ${event.locationName}` : ""}\n\nWe will follow up with any updates. Reply if you have questions.`,
    };
  }
  if (kind === "CANCEL_NOTICE") {
    return {
      subject: `Update: ${event.title} has been canceled`,
      body: `We need to let you know that the following event is canceled:\n\n${event.title}\nScheduled for: ${when}\n\nWe are sorry for the inconvenience and will share next steps if applicable.`,
    };
  }
  return {
    subject: `Thank you — ${event.title}`,
    body: `Thank you for being part of ${event.title}. We appreciate you showing up for the campaign.\n\n— Team`,
  };
}

/**
 * Creates a non-sending campaign shell (DRAFT or APPROVAL_NEEDED) linked to an event, if not already present.
 * Does not queue or send.
 */
export async function ensureEventAutomationCampaignShell(params: {
  eventId: string;
  kind: EventAutomationKind;
  /** When true, created row uses `APPROVAL_NEEDED` (default). When false, `DRAFT`. */
  requireApproval?: boolean;
  actorUserId?: string | null;
}): Promise<{ created: boolean; campaignId?: string; skipped?: string }> {
  const { eventId, kind } = params;
  const requireApproval = params.requireApproval !== false;
  const idem = idempotencyKey(eventId, kind);
  const existing = await prisma.communicationCampaign.findFirst({
    where: { orchestrationIdempotencyKey: idem },
    select: { id: true },
  });
  if (existing) return { created: false, skipped: "already exists", campaignId: existing.id };

  const event = await prisma.campaignEvent.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      eventType: true,
      countyId: true,
      locationName: true,
      eventWorkflowState: true,
    },
  });
  if (!event) return { created: false, skipped: "event not found" };

  const channel = defaultChannel();
  const tpl = await pickTemplate({ eventType: event.eventType, kind, channel });
  const audience = buildAudienceForEvent({ id: event.id, countyId: event.countyId });
  const copy = defaultCopy(
    { title: event.title, startAt: event.startAt, locationName: event.locationName },
    kind
  );

  const campaignType = campaignTypeFor(kind);
  const status = requireApproval ? CommunicationCampaignStatus.APPROVAL_NEEDED : CommunicationCampaignStatus.DRAFT;

  const c = await prisma.communicationCampaign.create({
    data: {
      name: `[Auto] ${kind === "PUBLISH_REMINDER" ? "Reminder" : kind === "CANCEL_NOTICE" ? "Cancellation" : "Thanks"} · ${event.title}`.slice(
        0,
        240
      ),
      channel,
      campaignType,
      status,
      templateId: tpl?.id ?? undefined,
      audienceDefinitionJson: audience as object,
      subjectText: tpl?.subjectTemplate?.trim() || copy.subject,
      bodyText: tpl?.bodyTemplate?.trim() || copy.body,
      eventId: event.id,
      createdByUserId: params.actorUserId ?? undefined,
      automationStatus: CommunicationCampaignAutomationStatus.SHELL,
      triggerSourceType: TRIGGER_EVENT,
      triggerSourceId: event.id,
      generatedFromTemplateKey: KIND_TO_KEY[kind],
      orchestrationIdempotencyKey: idem,
      notes: `Auto-generated shell (Tier 3B). Review copy and audience before queueing. Event stage: ${event.eventWorkflowState}.`,
    },
  });

  revalidatePath("/admin/workbench");
  revalidatePath("/admin/workbench/comms/broadcasts");
  revalidatePath(`/admin/events/${eventId}`);

  return { created: true, campaignId: c.id };
}

export async function createShellsForPublishedEvent(
  eventId: string,
  actorUserId: string | null
): Promise<void> {
  await ensureEventAutomationCampaignShell({ eventId, kind: "PUBLISH_REMINDER", actorUserId });
}

export async function createShellsForCanceledEvent(eventId: string, actorUserId: string | null): Promise<void> {
  await ensureEventAutomationCampaignShell({ eventId, kind: "CANCEL_NOTICE", actorUserId });
}

export async function createShellsForCompletedEvent(eventId: string, actorUserId: string | null): Promise<void> {
  await ensureEventAutomationCampaignShell({ eventId, kind: "COMPLETE_THANKS", actorUserId });
}
