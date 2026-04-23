import type { CommsSendProvider, CommsWorkbenchChannel } from "@prisma/client";

/**
 * Normalized `CommunicationSend.outcomeSummaryJson` (Packet 10).
 * Keep small — do not store raw provider payloads here.
 */
export type CommsSendOutcomeSummaryV1 = {
  version: 1;
  executionAttemptedAt: string;
  provider: CommsSendProvider;
  channel: CommsWorkbenchChannel;
  providerStatus: string | null;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  /** True when delivery lifecycle is expected via webhook (email/SMS). */
  webhookPending?: boolean;
  /** Last inbound reconciliation (webhook) */
  lastWebhookAt?: string;
  lastWebhookEvent?: string;
  gatingReason?: string;
  /**
   * Operator re-queue audit (Packet 12A). New execution overwrites top-level fields but history stays in this array.
   */
  policyRetryAudit?: {
    at: string;
    byUserId: string;
    priorProviderMessageId: string | null;
    priorCategory: string;
    priorErrorExcerpt: string | null;
    priorExecutionAttemptedAt: string;
  }[];
  /** True after FAILED → re-queue, until the next attempt writes a new outcome. */
  operatorRetryPending?: boolean;
};

export function isOutcomeSummaryV1(v: unknown): v is CommsSendOutcomeSummaryV1 {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as CommsSendOutcomeSummaryV1).version === 1 &&
    typeof (v as CommsSendOutcomeSummaryV1).executionAttemptedAt === "string"
  );
}

/** When re-executing after operator retry, keep `policyRetryAudit` on the new terminal outcome. */
export function mergeCommsOutcomeWithPolicyRetryHistory(
  newOutcome: CommsSendOutcomeSummaryV1,
  prior: unknown
): CommsSendOutcomeSummaryV1 {
  if (isOutcomeSummaryV1(prior) && prior.policyRetryAudit && prior.policyRetryAudit.length > 0) {
    return { ...newOutcome, policyRetryAudit: prior.policyRetryAudit };
  }
  return newOutcome;
}
