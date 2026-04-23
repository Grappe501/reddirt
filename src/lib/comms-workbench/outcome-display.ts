import type { CommsSendProvider, CommsWorkbenchChannel } from "@prisma/client";
import type { CommsSendOperatorRetryView } from "./dto";
import { isOutcomeSummaryV1 } from "./send-execution-outcome";

const DEFAULT_TRUNCATE = 160;
const FAILURE_TRUNCATE = 200;

export type CommsOutcomeDisplay = {
  provider: CommsSendProvider | null;
  channel: CommsWorkbenchChannel | null;
  providerStatus: string | null;
  success: boolean | null;
  errorCode: string | null;
  errorMessage: string | null;
  executionAttemptedAt: string | null;
  webhookPending: boolean | null;
  gatingReason: string | null;
  lastWebhookAt: string | null;
  lastWebhookEvent: string | null;
};

const emptyDisplay: CommsOutcomeDisplay = {
  provider: null,
  channel: null,
  providerStatus: null,
  success: null,
  errorCode: null,
  errorMessage: null,
  executionAttemptedAt: null,
  webhookPending: null,
  gatingReason: null,
  lastWebhookAt: null,
  lastWebhookEvent: null,
};

/** Consistent truncation for operator-facing strings (not raw JSON). */
export function truncateCommsDisplayText(message: string, max = DEFAULT_TRUNCATE): string {
  if (message.length <= max) return message;
  return `${message.slice(0, Math.max(0, max - 1))}…`;
}

/**
 * Read normalized outcome fields for UI (no raw JSON).
 */
export function parseCommsOutcomeDisplay(outcomeSummaryJson: unknown): CommsOutcomeDisplay {
  if (!isOutcomeSummaryV1(outcomeSummaryJson)) {
    return { ...emptyDisplay };
  }
  const o = outcomeSummaryJson;
  return {
    provider: o.provider ?? null,
    channel: o.channel ?? null,
    providerStatus: o.providerStatus ?? null,
    success: o.success,
    errorCode: o.errorCode ?? null,
    errorMessage: o.errorMessage ?? null,
    executionAttemptedAt: o.executionAttemptedAt,
    webhookPending: o.webhookPending ?? null,
    gatingReason: o.gatingReason ?? null,
    lastWebhookAt: o.lastWebhookAt ?? null,
    lastWebhookEvent: o.lastWebhookEvent ?? null,
  };
}

/**
 * One-line label for list panels (dashboard, sends table) — no JSON dump.
 * Distinguishes execution acceptance vs delivery lifecycle uncertainty (webhooks).
 */
export function formatCommsOutcomeSummaryLine(
  outcomeSummaryJson: unknown,
  opts?: { includeWebhookPending?: boolean }
): string {
  const d = parseCommsOutcomeDisplay(outcomeSummaryJson);
  if (
    d.provider == null &&
    d.success == null &&
    d.errorMessage == null &&
    d.gatingReason == null &&
    d.providerStatus == null
  ) {
    return "";
  }
  const parts: string[] = [];
  if (d.provider) parts.push(String(d.provider));
  if (d.channel) parts.push(String(d.channel));

  if (d.success === true && d.webhookPending) {
    parts.push("Provider accepted; final delivery may still update via webhooks");
  } else if (d.success != null) {
    parts.push(d.success ? "Execution completed" : "Execution did not complete");
  }

  if (d.gatingReason) parts.push(d.gatingReason);
  if (d.errorCode) parts.push(d.errorCode);
  if (d.errorMessage) {
    parts.push(truncateCommsDisplayText(d.errorMessage, DEFAULT_TRUNCATE));
  }
  if (d.providerStatus) parts.push(`Provider status: ${d.providerStatus}`);
  if (opts?.includeWebhookPending && d.webhookPending && d.success !== true) {
    parts.push("Awaiting webhook updates");
  }
  if (d.lastWebhookEvent) parts.push(`Last event: ${truncateCommsDisplayText(d.lastWebhookEvent, 80)}`);
  return parts.join(" · ");
}

/**
 * Concise operator-facing failure text (failed sends, plan execution block).
 * Precedence: gating (approval / channel) → user-facing error → code → provider status → generic.
 */
export function formatCommsFailureReasonSummary(outcomeSummaryJson: unknown): string {
  const d = parseCommsOutcomeDisplay(outcomeSummaryJson);
  if (d.gatingReason) return truncateCommsDisplayText(d.gatingReason, FAILURE_TRUNCATE);
  if (d.errorMessage) {
    return truncateCommsDisplayText(d.errorMessage, FAILURE_TRUNCATE);
  }
  if (d.errorCode) return d.errorCode;
  if (d.providerStatus) return `Provider status: ${d.providerStatus}`;
  const line = formatCommsOutcomeSummaryLine(outcomeSummaryJson);
  if (line) return line;
  return "Failed — no outcome details recorded yet.";
}

export function getLatestProviderStatusFromOutcome(outcomeSummaryJson: unknown): string | null {
  const d = parseCommsOutcomeDisplay(outcomeSummaryJson);
  return d.providerStatus;
}

/** One line for workbench list rows: retry budget + last re-queue + policy (uses centralized DTO; no new classification). */
export function formatCommsOperatorRetryStateLine(v: CommsSendOperatorRetryView): string {
  const parts: string[] = [`Operator retries: ${v.retryCount}/${v.retryLimit}`];
  if (v.lastRetryAt) {
    const who = v.lastRetryBy
      ? (v.lastRetryBy.nameLabel?.trim() || v.lastRetryBy.email) || "operator"
      : "operator";
    parts.push(`last re-queue ${new Date(v.lastRetryAt).toLocaleString()} · ${who}`);
  }
  if (v.retryBlockedReason) {
    parts.push(v.retryBlockedReason);
  } else if (v.canRetry) {
    parts.push(`Class ${v.retryCategory} — re-queue allowed.`);
  } else {
    parts.push(`Class ${v.lastFailureCategory}.`);
  }
  return parts.join(" · ");
}
