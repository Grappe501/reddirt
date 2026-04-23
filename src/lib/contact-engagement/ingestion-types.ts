import type {
  CommunicationRecipientEventType,
  CommsSendProvider,
} from "@prisma/client";

/**
 * Outcome of mapping a provider or execution signal into a normalized recipient event
 * (before dedupe and persistence).
 */
export type NormalizedRecipientEvent = {
  eventType: CommunicationRecipientEventType;
  /** Prefer provider-native ids (SendGrid `sg_event_id`, Twilio `MessageSid+status`). */
  providerEventId: string;
  providerName: CommsSendProvider;
  occurredAt: Date;
  linkUrl?: string | null;
  linkLabel?: string | null;
  /** Small, non-sensitive hints for operators (not raw webhooks). */
  metadataJson?: Record<string, unknown>;
};

/**
 * Bounce sub-type hints (SendGrid `bounce` event may include `type` / `reason`).
 */
export type BounceKind = "hard" | "soft" | "block" | "unknown";

export type SendgridEventLike = {
  event?: string;
  email?: string;
  timestamp?: number;
  reason?: string;
  url?: string;
  sg_event_id?: string;
  sg_message_id?: string;
  "smtp-id"?: string;
  commsWorkbenchSendId?: string;
  type?: string;
  bounce_classification?: string;
};
