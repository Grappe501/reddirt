import {
  CommsSendProvider,
  type CommsSendProvider as CommsSendProviderT,
  type CommunicationRecipientEventType,
  type CommsWorkbenchChannel,
} from "@prisma/client";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { normalizeUsPhone } from "@/lib/comms/phone";
import { applyRecipientEventToDeliveryHealth, applyRecipientEventToRecipientStatus } from "./recipient-status-updates";
import type { BounceKind } from "./ingestion-types";
import { mapSendgridEventToNormalized, mapTwilioStatusToNormalized } from "./provider-normalization";
import type { SendgridEventLike } from "./ingestion-types";

/**
 * Single-address normalization to match the expansion unique `@@(communicationSendId, channel, addressUsed)`.
 */
export function normalizeWorkbenchRecipientAddress(
  channel: CommsWorkbenchChannel,
  toEmail: string | null,
  toPhone: string | null
): string {
  if (channel === "EMAIL" && toEmail) return toEmail.trim().toLowerCase();
  if (channel === "SMS" && toPhone) {
    return normalizeUsPhone(toPhone) ?? toPhone.trim();
  }
  return (toEmail ?? toPhone ?? "").trim();
}

function buildFallbackProviderEventId(p: {
  communicationRecipientId: string;
  eventType: CommunicationRecipientEventType;
  occurredAt: Date;
  providerName: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
}): string {
  const raw = [p.communicationRecipientId, p.eventType, p.occurredAt.toISOString(), p.providerName ?? "", p.linkUrl ?? "", p.linkLabel ?? ""].join(
    "|"
  );
  return `ce3:sha256:${createHash("sha256").update(raw).digest("hex")}`;
}

/**
 * Appends a normalized `CommunicationRecipientEvent` and updates the parent row
 * (status + `deliveryHealthStatus`) with conservative, out-of-order–safe rules.
 * Idempotent: same `providerEventId` (or identical synthetic) does not create a second row.
 */
export async function recordCommunicationRecipientEvent(input: {
  communicationRecipientId: string;
  eventType: CommunicationRecipientEventType;
  occurredAt: Date;
  providerName: CommsSendProviderT | null;
  /** Preferred when the provider offers a stable per-event or per-callback id. */
  providerEventId?: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
  /** Safe small JSON, never a raw provider blob. */
  metadataJson?: Record<string, unknown>;
  bounceKind?: BounceKind;
}): Promise<{ created: boolean; communicationRecipientEventId: string; duplicate: boolean }> {
  const effectiveProviderId = (input.providerEventId?.trim() || buildFallbackProviderEventId(input)).slice(0, 500);

  const existing = await prisma.communicationRecipientEvent.findFirst({
    where: {
      communicationRecipientId: input.communicationRecipientId,
      providerEventId: effectiveProviderId,
    },
  });
  if (existing) {
    return { created: false, communicationRecipientEventId: existing.id, duplicate: true };
  }

  const rec = await prisma.communicationRecipient.findUnique({
    where: { id: input.communicationRecipientId },
  });
  if (!rec) {
    return { created: false, communicationRecipientEventId: "", duplicate: true };
  }

  const nextStatus = applyRecipientEventToRecipientStatus(rec.status, input.eventType);
  const nextHealth = applyRecipientEventToDeliveryHealth(rec.deliveryHealthStatus, input.eventType, {
    bounceKind: input.bounceKind,
  });

  const created = await prisma.$transaction(async (tx) => {
    const ev = await tx.communicationRecipientEvent.create({
      data: {
        communicationRecipientId: input.communicationRecipientId,
        eventType: input.eventType,
        occurredAt: input.occurredAt,
        providerEventId: effectiveProviderId,
        providerName: input.providerName,
        linkUrl: input.linkUrl,
        linkLabel: input.linkLabel,
        metadataJson: (input.metadataJson ?? {}) as object,
      },
    });
    await tx.communicationRecipient.update({
      where: { id: input.communicationRecipientId },
      data: {
        status: nextStatus,
        deliveryHealthStatus: nextHealth,
      },
    });
    return ev;
  });

  return { created: true, communicationRecipientEventId: created.id, duplicate: false };
}

export type CommsSendExpansionContext = {
  communicationSendId: string;
  communicationPlanId: string;
  channel: CommsWorkbenchChannel;
  toEmail: string | null;
  toPhone: string | null;
  preferenceThreadId: string | null;
  targetSegmentId: string | null;
};

/**
 * Creates or updates the workbench `CommunicationRecipient` for the current
 * “single target” send model. Safe to re-run: upserts on send+channel+address.
 * Identity comes from the communication thread (when set) and optional plan-audience segment.
 */
export async function expandCommunicationSendToRecipients(
  ctx: CommsSendExpansionContext
): Promise<{ recipientId: string; created: boolean }> {
  const addressUsed = normalizeWorkbenchRecipientAddress(ctx.channel, ctx.toEmail, ctx.toPhone);
  if (!addressUsed) {
    throw new Error("expandCommunicationSendToRecipients: empty address");
  }

  const prior = await prisma.communicationRecipient.findUnique({
    where: {
      communicationSendId_channel_addressUsed: {
        communicationSendId: ctx.communicationSendId,
        channel: ctx.channel,
        addressUsed,
      },
    },
    select: { id: true },
  });

  const [thread, segment] = await Promise.all([
    ctx.preferenceThreadId
      ? prisma.communicationThread.findUnique({
          where: { id: ctx.preferenceThreadId },
          select: { id: true, userId: true, volunteerProfileId: true },
        })
      : null,
    ctx.targetSegmentId
      ? prisma.commsPlanAudienceSegment.findFirst({
          where: { id: ctx.targetSegmentId, communicationPlanId: ctx.communicationPlanId },
          select: { id: true, name: true },
        })
      : null,
  ]);

  const upserted = await prisma.communicationRecipient.upsert({
    where: {
      communicationSendId_channel_addressUsed: {
        communicationSendId: ctx.communicationSendId,
        channel: ctx.channel,
        addressUsed,
      },
    },
    create: {
      communicationSendId: ctx.communicationSendId,
      channel: ctx.channel,
      addressUsed,
      comsPlanAudienceSegmentId: segment?.id ?? null,
      crmContactKey: null,
      userId: thread?.userId ?? null,
      volunteerProfileId: thread?.volunteerProfileId ?? null,
      communicationThreadId: thread?.id ?? null,
      targetSegmentId: ctx.targetSegmentId,
      targetSegmentLabel: segment?.name ?? ctx.targetSegmentId,
      status: "PLANNED",
      deliveryHealthStatus: "UNKNOWN",
      metadataJson: {
        ce3Expansion: {
          hasThread: Boolean(ctx.preferenceThreadId),
          hasSegment: Boolean(segment),
        },
      },
    },
    update: {
      comsPlanAudienceSegmentId: segment?.id ?? null,
      userId: thread?.userId ?? null,
      volunteerProfileId: thread?.volunteerProfileId ?? null,
      communicationThreadId: thread?.id ?? null,
      targetSegmentId: ctx.targetSegmentId,
      targetSegmentLabel: segment?.name ?? ctx.targetSegmentId,
    },
  });

  return { recipientId: upserted.id, created: !prior };
}

/**
 * Provider “immediate” status for Twilio may already be `delivered`; SendGrid acceptance is modeled as `SENT` (delivery via webhooks).
 */
export function getWorkbenchExecutionCompletionEventType(
  channel: CommsWorkbenchChannel,
  provider: CommsSendProvider,
  providerStatus: string | null
): CommunicationRecipientEventType {
  if (channel === "SMS" && provider === CommsSendProvider.TWILIO) {
    const s = (providerStatus ?? "").toLowerCase();
    if (s === "delivered" || s === "received" || s === "read") return "DELIVERED";
  }
  return "SENT";
}

/**
 * After provider dispatch, align recipient row + append normalized execution events
 * (single-recipient / single-row model).
 */
export async function normalizeSendExecutionToRecipientEvent(params: {
  communicationSendId: string;
  channel: CommsWorkbenchChannel;
  provider: CommsSendProvider;
  /** Provider message / sid — stored on the recipient for webhook correlation. */
  providerMessageId: string;
  success: boolean;
  /** Drives the initial normalized event: SendGrid is typically `SENT`; Twilio can be `DELIVERED` or `SENT` based on the immediate status. */
  sendCompletionEvent: CommunicationRecipientEventType;
  errorMessage?: string | null;
}): Promise<void> {
  const r = await prisma.communicationRecipient.findFirst({
    where: { communicationSendId: params.communicationSendId, channel: params.channel },
  });
  if (!r) return;

  await prisma.communicationRecipient.update({
    where: { id: r.id },
    data: { providerRecipientId: params.providerMessageId },
  });

  if (!params.success) {
    await recordCommunicationRecipientEvent({
      communicationRecipientId: r.id,
      eventType: "FAILED",
      occurredAt: new Date(),
      providerName: params.provider,
      providerEventId: `exec:fail:${params.communicationSendId}`,
      metadataJson: { errorMessage: params.errorMessage ?? null },
    });
    return;
  }

  await recordCommunicationRecipientEvent({
    communicationRecipientId: r.id,
    eventType: params.sendCompletionEvent,
    occurredAt: new Date(),
    providerName: params.provider,
    providerEventId: `exec:ok:${params.communicationSendId}:${params.sendCompletionEvent}`,
    metadataJson: { providerMessageId: params.providerMessageId },
  });
}

/**
 * If execution ended in `failSend` after expansion, record a recipient-level `FAILED` event once.
 */
export async function recordWorkbenchSendFailureToRecipients(communicationSendId: string, errorMeta: { errorCode?: string; errorMessage?: string }): Promise<void> {
  const rows = await prisma.communicationRecipient.findMany({ where: { communicationSendId } });
  for (const r of rows) {
    const base = [r.id, "FAIL", errorMeta.errorCode ?? "", errorMeta.errorMessage ?? "exec"].join(":");
    await recordCommunicationRecipientEvent({
      communicationRecipientId: r.id,
      eventType: "FAILED",
      occurredAt: new Date(),
      providerName: null,
      providerEventId: `ce3:failhash:${createHash("sha256").update(base).digest("hex").slice(0, 32)}`,
      metadataJson: { errorCode: errorMeta.errorCode, errorMessage: errorMeta.errorMessage },
    });
  }
}

// --- Webhook ingestion (SendGrid + Twilio) — locate recipient from send, map, record. ---

export async function ingestSendgridCommsWorkbenchEvent(ev: SendgridEventLike): Promise<void> {
  const sendId = ev.commsWorkbenchSendId?.trim();
  if (!sendId) return;
  const mapped = mapSendgridEventToNormalized(ev);
  if (!mapped) return;

  const { normalized, deliveryHint } = mapped;
  const send = await prisma.communicationSend.findFirst({
    where: { id: sendId, channel: "EMAIL" },
    select: { id: true, channel: true },
  });
  if (!send) return;

  const r = await prisma.communicationRecipient.findFirst({
    where: { communicationSendId: send.id, channel: send.channel },
  });
  if (!r) return;

  await recordCommunicationRecipientEvent({
    communicationRecipientId: r.id,
    eventType: normalized.eventType,
    occurredAt: normalized.occurredAt,
    providerName: CommsSendProvider.SENDGRID,
    providerEventId: normalized.providerEventId,
    linkUrl: normalized.linkUrl,
    linkLabel: normalized.linkLabel,
    metadataJson: normalized.metadataJson,
    bounceKind: deliveryHint?.bounceKind,
  });
}

export async function ingestTwilioCommsWorkbenchStatus(params: {
  messageSid: string;
  messageStatus: string;
  errorCode?: string;
  errorMessage?: string;
}): Promise<void> {
  const mapped = mapTwilioStatusToNormalized(params);
  if (!mapped) return;
  const { normalized } = mapped;
  const send = await prisma.communicationSend.findFirst({
    where: { providerMessageId: params.messageSid, channel: "SMS" },
    select: { id: true, channel: true },
  });
  if (!send) return;

  const r = await prisma.communicationRecipient.findFirst({
    where: { communicationSendId: send.id, channel: send.channel },
  });
  if (!r) return;

  await recordCommunicationRecipientEvent({
    communicationRecipientId: r.id,
    eventType: normalized.eventType,
    occurredAt: normalized.occurredAt,
    providerName: CommsSendProvider.TWILIO,
    providerEventId: normalized.providerEventId,
    metadataJson: normalized.metadataJson,
  });
}

/**
 * `normalizeProviderWebhookToRecipientEvent` — thin router used so webhook code has one named entry.
 */
export async function normalizeProviderWebhookToRecipientEvent(input: { provider: "sendgrid"; payload: SendgridEventLike } | { provider: "twilio"; payload: { messageSid: string; messageStatus: string; errorCode?: string; errorMessage?: string } }): Promise<void> {
  if (input.provider === "sendgrid") {
    await ingestSendgridCommsWorkbenchEvent(input.payload);
    return;
  }
  await ingestTwilioCommsWorkbenchStatus({
    messageSid: input.payload.messageSid,
    messageStatus: input.payload.messageStatus,
    errorCode: input.payload.errorCode,
    errorMessage: input.payload.errorMessage,
  });
}
