import { CommsSendProvider } from "@prisma/client";
import type { CommunicationRecipientEventType } from "@prisma/client";
import { createHash } from "node:crypto";
import type { BounceKind, NormalizedRecipientEvent, SendgridEventLike } from "./ingestion-types";

/**
 * Classify SendGrid bounce payload for `applyRecipientEventToDeliveryHealth` / INVALID vs HARD.
 */
export function sendgridBounceKind(ev: SendgridEventLike): BounceKind {
  const t = (ev.type ?? ev.bounce_classification ?? "").toLowerCase();
  if (t === "block" || t === "blocked") return "block";
  if (t === "soft") return "soft";
  if (t === "hard") return "hard";
  if (t.includes("hard")) return "hard";
  return "unknown";
}

/**
 * Map a SendGrid Events API payload (single element) to a normalized recipient event, or `null` if ignored.
 */
export function mapSendgridEventToNormalized(ev: SendgridEventLike): {
  normalized: NormalizedRecipientEvent;
  deliveryHint?: { bounceKind?: BounceKind };
} | null {
  const et = (ev.event ?? "").toLowerCase();
  if (!et) return null;

  const tsSec = typeof ev.timestamp === "number" ? ev.timestamp : Math.floor(Date.now() / 1000);
  const occurredAt = new Date(tsSec * 1000);

  const idBase = [
    "sendgrid",
    ev.sg_event_id ?? "",
    ev["smtp-id"] ?? ev.sg_message_id ?? "",
    et,
    String(tsSec),
    ev.url ?? "",
  ].join(":");
  const providerEventId =
    ev.sg_event_id?.trim() ||
    `sg:sha:${createHash("sha256").update(idBase).digest("hex").slice(0, 32)}`;

  const base = {
    providerName: CommsSendProvider.SENDGRID,
    providerEventId,
    occurredAt,
    metadataJson: {
      event: ev.event,
      reason: ev.reason,
      type: ev.type,
    } as Record<string, unknown>,
  };

  if (et === "delivered") {
    return {
      normalized: { ...base, eventType: "DELIVERED" as CommunicationRecipientEventType },
    };
  }
  if (et === "open") {
    return { normalized: { ...base, eventType: "OPENED" } };
  }
  if (et === "click") {
    return {
      normalized: {
        ...base,
        eventType: "CLICKED" as CommunicationRecipientEventType,
        linkUrl: ev.url?.trim() ?? null,
        linkLabel: null,
      },
    };
  }
  if (et === "bounce") {
    return {
      normalized: { ...base, eventType: "BOUNCED" as CommunicationRecipientEventType },
      deliveryHint: { bounceKind: sendgridBounceKind(ev) },
    };
  }
  if (et === "dropped" || et === "deferred") {
    if (et === "deferred") return null;
    return { normalized: { ...base, eventType: "FAILED" } };
  }
  if (et === "spamreport") {
    return { normalized: { ...base, eventType: "UNSUBSCRIBED" } };
  }
  if (et === "unsubscribe" || et === "group_unsubscribe" || et === "asm_unsubscribe") {
    return { normalized: { ...base, eventType: "UNSUBSCRIBED" } };
  }
  if (et === "processed" || et === "sent") {
    return { normalized: { ...base, eventType: "SENT" } };
  }
  return null;
}

/**
 * Map Twilio status callback `MessageStatus` to normalized recipient events. Returns `null` if no mapping.
 */
export function mapTwilioStatusToNormalized(params: {
  messageSid: string;
  messageStatus: string;
  errorCode?: string;
  errorMessage?: string;
}): { normalized: NormalizedRecipientEvent; deliveryHint?: { bounceKind?: BounceKind } } | null {
  const m = (params.messageStatus ?? "").toLowerCase();
  if (!m) return null;

  const errorCode = params.errorCode?.trim() ?? "";
  const isSmsOptOut = errorCode === "21610" || m === "failed" && /opt.?out|stop/i.test(params.errorMessage ?? "");

  const providerEventId = `tw:${params.messageSid}:${m}:${errorCode || "0"}`;

  const base = {
    providerName: CommsSendProvider.TWILIO,
    providerEventId,
    occurredAt: new Date(),
    metadataJson: {
      messageStatus: params.messageStatus,
      errorCode: params.errorCode,
      errorMessage: params.errorMessage,
    } as Record<string, unknown>,
  };

  if (isSmsOptOut) {
    return { normalized: { ...base, eventType: "OPTED_OUT_SMS" } };
  }
  if (m === "delivered" || m === "received" || m === "read") {
    return { normalized: { ...base, eventType: "DELIVERED" as CommunicationRecipientEventType } };
  }
  if (m === "sent" || m === "queued" || m === "accepted" || m === "sending") {
    return { normalized: { ...base, eventType: "SENT" } };
  }
  if (m === "failed" || m === "undelivered" || m === "canceled") {
    return { normalized: { ...base, eventType: "FAILED" } };
  }
  return null;
}

/**
 * Webhook + execution bridge: one place to describe "what a normalized event means" for the packet doc.
 * Persistence is in `ingestion.ts` via `recordCommunicationRecipientEvent`.
 */
export function describeNormalizedRecipientEvent() {
  return "SendGrid and Twilio payloads map to CommunicationRecipientEventType; append-only with deduped providerEventId.";
}
