import { CommunicationSendStatus, CommsSendProvider, type CommsWorkbenchChannel } from "@prisma/client";
import type { CommsSendOutcomeSummaryV1 } from "./send-execution-outcome";
import { isOutcomeSummaryV1 } from "./send-execution-outcome";

export function buildInitialOutcomeSummaryV1(params: {
  provider: CommsSendProvider;
  channel: CommsWorkbenchChannel;
  providerStatus: string | null;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  webhookPending?: boolean;
  gatingReason?: string;
}): CommsSendOutcomeSummaryV1 {
  return {
    version: 1,
    executionAttemptedAt: new Date().toISOString(),
    provider: params.provider,
    channel: params.channel,
    providerStatus: params.providerStatus,
    success: params.success,
    ...(params.errorCode ? { errorCode: params.errorCode } : {}),
    ...(params.errorMessage ? { errorMessage: params.errorMessage } : {}),
    ...(params.webhookPending != null ? { webhookPending: params.webhookPending } : {}),
    ...(params.gatingReason ? { gatingReason: params.gatingReason } : {}),
  };
}

function mergeOutcomeWithWebhook(
  existing: unknown,
  patch: Partial<CommsSendOutcomeSummaryV1>
): CommsSendOutcomeSummaryV1 {
  if (isOutcomeSummaryV1(existing)) {
    return { ...existing, ...patch, version: 1 };
  }
  return {
    version: 1,
    executionAttemptedAt: new Date().toISOString(),
    provider: CommsSendProvider.SENDGRID,
    channel: "EMAIL",
    providerStatus: null,
    success: true,
    ...patch,
  };
}

/**
 * Map SendGrid event to whether the workbench send should be marked FAILED.
 */
export function sendgridEventImpliesFailure(event: string | undefined): boolean {
  if (!event) return false;
  const e = event.toLowerCase();
  return e === "dropped" || e === "bounce" || e === "spamreport";
}

/**
 * Inbound SendGrid event → refresh `outcomeSummaryJson` and (for hard bounces) mark FAILED.
 */
export function applySendgridEventToCommsSendOutcome(
  currentOutcome: unknown,
  event: { event?: string; reason?: string }
): { outcome: CommsSendOutcomeSummaryV1; newStatus: CommunicationSendStatus | null } {
  const at = new Date().toISOString();
  const ev = event.event?.toLowerCase() ?? "";
  const lastPatch: Partial<CommsSendOutcomeSummaryV1> = {
    lastWebhookAt: at,
    lastWebhookEvent: event.event,
    providerStatus: event.event ?? null,
  };

  if (sendgridEventImpliesFailure(event.event)) {
    return {
      outcome: mergeOutcomeWithWebhook(currentOutcome, {
        ...lastPatch,
        success: false,
        errorMessage: event.reason ?? event.event ?? "sendgrid_event",
        webhookPending: false,
      }),
      newStatus: CommunicationSendStatus.FAILED,
    };
  }
  if (ev === "delivered") {
    return {
      outcome: mergeOutcomeWithWebhook(currentOutcome, { ...lastPatch, success: true, webhookPending: false }),
      newStatus: null,
    };
  }
  if (ev === "open" || ev === "click" || ev === "processed" || ev === "sent") {
    return { outcome: mergeOutcomeWithWebhook(currentOutcome, { ...lastPatch, webhookPending: true }), newStatus: null };
  }
  return { outcome: mergeOutcomeWithWebhook(currentOutcome, { ...lastPatch, webhookPending: true }), newStatus: null };
}

/**
 * Inbound Twilio `MessageStatus` → enrich outcome; terminal failures set FAILED.
 */
export function applyTwilioStatusToCommsSendOutcome(
  currentOutcome: unknown,
  messageStatus: string | undefined,
  errorMessage: string | null
): { outcome: CommsSendOutcomeSummaryV1; newStatus: CommunicationSendStatus | null } {
  const at = new Date().toISOString();
  const m = (messageStatus ?? "").toLowerCase();
  const lastPatch: Partial<CommsSendOutcomeSummaryV1> = {
    lastWebhookAt: at,
    lastWebhookEvent: messageStatus,
    providerStatus: messageStatus ?? null,
  };
  if (m === "failed" || m === "undelivered" || m === "canceled") {
    return {
      outcome: mergeOutcomeWithWebhook(currentOutcome, {
        ...lastPatch,
        success: false,
        errorMessage: errorMessage ?? messageStatus,
        webhookPending: false,
      }),
      newStatus: CommunicationSendStatus.FAILED,
    };
  }
  if (m === "delivered" || m === "received" || m === "read") {
    return {
      outcome: mergeOutcomeWithWebhook(currentOutcome, { ...lastPatch, success: true, webhookPending: false }),
      newStatus: null,
    };
  }
  return { outcome: mergeOutcomeWithWebhook(currentOutcome, { ...lastPatch, webhookPending: true }), newStatus: null };
}
