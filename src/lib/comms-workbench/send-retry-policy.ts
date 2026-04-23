import {
  CommunicationDraftStatus,
  CommsSendProvider,
  CommunicationSendStatus,
  CommunicationVariantStatus,
  type CommsWorkbenchChannel,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type {
  CommsSendOperatorRetryView,
  CommsSendRetryCategory,
  CommunicationUserSummary,
} from "./dto";
import { isExecutableCommsWorkbenchChannel } from "./constants";
import { formatCommsFailureReasonSummary, parseCommsOutcomeDisplay, truncateCommsDisplayText } from "./outcome-display";
import { isOutcomeSummaryV1, type CommsSendOutcomeSummaryV1 } from "./send-execution-outcome";

/** Max operator re-queues after the initial failed execution (not counting the first attempt). */
export const MAX_COMMS_SEND_OPERATOR_RETRIES = 3;

export const COMMS_SEND_RETRY_CATEGORIES: CommsSendRetryCategory[] = [
  "PROVIDER_TRANSIENT",
  "WEBHOOK_PENDING_TIMEOUT",
  "MISSING_RECIPIENT",
  "SOURCE_NOT_APPROVED",
  "CHANNEL_NOT_EXECUTABLE",
  "PROVIDER_PERMANENT",
  "UNKNOWN",
];

export type CommunicationSendRetryEligibility = {
  canRetry: boolean;
  retryCategory: CommsSendRetryCategory;
  retryReason: string;
  retryBlockedReason: string;
  nextRetryStatus: "QUEUED" | null;
  requiresOperatorReview: boolean;
};

export function isCommsSendSourceApprovedForExecution(
  draftStatus: CommunicationDraftStatus,
  variant: { status: CommunicationVariantStatus } | null
): boolean {
  if (variant) {
    return variant.status === CommunicationVariantStatus.APPROVED;
  }
  return draftStatus === CommunicationDraftStatus.APPROVED;
}

const transientLike = /\b(5\d\d|timeout|timed out|econn|enotfound|eai_|network|throttl|rate limit|temporar|unavailable|502|503|504|429|connect)\b/i;
const permanentLike =
  /\b(4[0-9][0-9](?!\d)|invalid|permanent|suppressed|hard[\s-]?bounc|unsubscrib|blacklist|rejected content|not valid)\b/i;
const missingRecipientLike =
  /\b(recipient|addressee|to email|to phone|no email|no phone|missing (destination|address)|destination)\b/i;
const approvalLike = /\b(not approved|approval gating|awaiting approval|source not approved|draft not approved|variant not approved)\b/i;

/**
 * Classify the last failed execution from stored outcome. When `ignoreStaleApprovalGating` is true,
 * gating lines that only describe approval are ignored so current draft/variant approval wins.
 */
export function inferCommsSendRetryCategoryFromOutcome(
  outcomeSummaryJson: unknown,
  opts: { ignoreStaleApprovalGating: boolean; channel: CommsWorkbenchChannel }
): CommsSendRetryCategory {
  const d = parseCommsOutcomeDisplay(outcomeSummaryJson);
  const combined = [d.gatingReason, d.errorMessage, d.errorCode, d.providerStatus].filter(Boolean).join(" ");
  const gating = d.gatingReason;
  const ignoreApproval =
    opts.ignoreStaleApprovalGating && gating != null && gating.length > 0 && approvalLike.test(gating);

  if (!isExecutableCommsWorkbenchChannel(opts.channel)) {
    return "CHANNEL_NOT_EXECUTABLE";
  }
  if (!ignoreApproval && gating && approvalLike.test(gating) && d.success === false) {
    return "SOURCE_NOT_APPROVED";
  }
  if (gating && missingRecipientLike.test(gating) && d.success === false) {
    return "MISSING_RECIPIENT";
  }
  if (d.errorMessage && missingRecipientLike.test(d.errorMessage)) {
    return "MISSING_RECIPIENT";
  }
  if (d.success === false && (combined.includes("webhook") && transientLike.test(combined))) {
    return "WEBHOOK_PENDING_TIMEOUT";
  }
  if (d.success === false && permanentLike.test(combined)) {
    return "PROVIDER_PERMANENT";
  }
  if (d.success === false && transientLike.test(combined)) {
    return "PROVIDER_TRANSIENT";
  }
  if (d.success === true && d.webhookPending) {
    return "PROVIDER_TRANSIENT";
  }
  if (d.errorMessage == null && d.gatingReason == null && d.errorCode == null && d.providerStatus == null) {
    return "UNKNOWN";
  }
  if (d.success === false) {
    return "UNKNOWN";
  }
  return "UNKNOWN";
}

export function determineCommunicationSendRetryEligibility(input: {
  status: CommunicationSendStatus;
  channel: CommsWorkbenchChannel;
  retryCount: number;
  draftStatus: CommunicationDraftStatus;
  variant: { status: CommunicationVariantStatus } | null;
  outcomeSummaryJson: unknown;
}): CommunicationSendRetryEligibility {
  const nextRetryStatus: "QUEUED" | null = "QUEUED";
  const sourceOk = isCommsSendSourceApprovedForExecution(input.draftStatus, input.variant);
  const category = inferCommsSendRetryCategoryFromOutcome(input.outcomeSummaryJson, {
    ignoreStaleApprovalGating: sourceOk,
    channel: input.channel,
  });

  if (input.status !== CommunicationSendStatus.FAILED) {
    return {
      canRetry: false,
      retryCategory: category,
      retryReason: "Only a FAILED send can be re-queued by an operator for retry.",
      retryBlockedReason: "Re-queue is only available when the send is in the FAILED state.",
      nextRetryStatus: null,
      requiresOperatorReview: true,
    };
  }
  if (input.retryCount >= MAX_COMMS_SEND_OPERATOR_RETRIES) {
    return {
      canRetry: false,
      retryCategory: category,
      retryReason: "Maximum operator retries for this send have been used.",
      retryBlockedReason: `The retry limit is ${MAX_COMMS_SEND_OPERATOR_RETRIES} re-queue events after the initial failure.`,
      nextRetryStatus: null,
      requiresOperatorReview: true,
    };
  }
  if (!isExecutableCommsWorkbenchChannel(input.channel)) {
    return {
      canRetry: false,
      retryCategory: "CHANNEL_NOT_EXECUTABLE",
      retryReason: "This channel has no direct provider run in the workbench.",
      retryBlockedReason: "Re-queue is not available for planning-only channels — change the send or add a different delivery path.",
      nextRetryStatus: null,
      requiresOperatorReview: true,
    };
  }
  if (!sourceOk) {
    return {
      canRetry: false,
      retryCategory: "SOURCE_NOT_APPROVED",
      retryReason: "The draft or variant must be approved before execution.",
      retryBlockedReason: "Re-queue is blocked until the linked draft (or variant) is approved again.",
      nextRetryStatus: null,
      requiresOperatorReview: true,
    };
  }
  if (category === "SOURCE_NOT_APPROVED" || category === "MISSING_RECIPIENT") {
    return {
      canRetry: false,
      retryCategory: category,
      retryReason: "The failure is tied to a missing recipient or approval issue that a blind re-run will not fix.",
      retryBlockedReason:
        category === "MISSING_RECIPIENT"
          ? "Add or fix the recipient in execution metadata (or thread resolution) before retrying."
          : "Re-queue is blocked until the linked asset is approved (and outcome reflects that).",
      nextRetryStatus: null,
      requiresOperatorReview: true,
    };
  }
  if (category === "CHANNEL_NOT_EXECUTABLE") {
    return {
      canRetry: false,
      retryCategory: category,
      retryReason: "Channel is not executable.",
      retryBlockedReason: "Re-queue is not available for this channel in the workbench execution path.",
      nextRetryStatus: null,
      requiresOperatorReview: true,
    };
  }
  if (category === "PROVIDER_PERMANENT") {
    return {
      canRetry: false,
      retryCategory: category,
      retryReason: "The provider indicated a permanent or invalid-address class failure.",
      retryBlockedReason: "Automatic operator retry is not allowed for a classified permanent failure. Fix the address or copy and create a new send if needed.",
      nextRetryStatus: null,
      requiresOperatorReview: true,
    };
  }
  if (category === "UNKNOWN") {
    return {
      canRetry: false,
      retryCategory: category,
      retryReason: "Failure is not clearly transient; retry is blocked for safety until details exist.",
      retryBlockedReason: "Re-queue is not allowed without a clear outcome. Inspect logs or re-run a test to capture an error when possible.",
      nextRetryStatus: null,
      requiresOperatorReview: true,
    };
  }

  if (category === "PROVIDER_TRANSIENT" || category === "WEBHOOK_PENDING_TIMEOUT") {
    return {
      canRetry: true,
      retryCategory: category,
      retryReason: "The last failure is classified as retryable (transient / webhook-lifecycle).",
      retryBlockedReason: "",
      nextRetryStatus,
      requiresOperatorReview: false,
    };
  }
  return {
    canRetry: false,
    retryCategory: category,
    retryReason: "Retry is not available for this failure category.",
    retryBlockedReason: "This failure cannot be re-queued under the current operator retry policy.",
    nextRetryStatus: null,
    requiresOperatorReview: true,
  };
}

export function getCommunicationSendRetryState(input: {
  status: CommunicationSendStatus;
  channel: CommsWorkbenchChannel;
  retryCount: number;
  lastRetriedAt: Date | null;
  lastRetriedBy: CommunicationUserSummary | null;
  draftStatus: CommunicationDraftStatus;
  variant: { status: CommunicationVariantStatus } | null;
  outcomeSummaryJson: unknown;
}): CommsSendOperatorRetryView {
  const eligibility = determineCommunicationSendRetryEligibility({
    status: input.status,
    channel: input.channel,
    retryCount: input.retryCount,
    draftStatus: input.draftStatus,
    variant: input.variant,
    outcomeSummaryJson: input.outcomeSummaryJson,
  });
  const lastFailureCategory = inferCommsSendRetryCategoryFromOutcome(input.outcomeSummaryJson, {
    ignoreStaleApprovalGating: isCommsSendSourceApprovedForExecution(input.draftStatus, input.variant),
    channel: input.channel,
  });
  const forFailed = input.status === CommunicationSendStatus.FAILED;
  return {
    retryCount: input.retryCount,
    retryLimit: MAX_COMMS_SEND_OPERATOR_RETRIES,
    canRetry: eligibility.canRetry,
    lastFailureCategory,
    retryCategory: eligibility.retryCategory,
    retryReason: forFailed ? eligibility.retryReason : "",
    retryBlockedReason: forFailed ? eligibility.retryBlockedReason : "",
    lastRetryAt: input.lastRetriedAt?.toISOString() ?? null,
    lastRetryBy: input.lastRetriedBy,
    requiresOperatorReview: forFailed ? eligibility.requiresOperatorReview : false,
    nextRetryStatus: eligibility.nextRetryStatus,
  };
}

/**
 * Merges prior outcome with a new audit entry; does not clear operator-visible history in `policyRetryAudit`.
 * Top-level `providerMessageId` is cleared in the database separately on re-queue; this string is carried for audit.
 */
export function buildOutcomeJsonForOperatorRequeue(
  previous: unknown,
  params: {
    channel: CommsWorkbenchChannel;
    priorProviderMessageId: string | null;
    priorCategory: CommsSendRetryCategory;
    nowIso: string;
    actorUserId: string;
  }
): Prisma.InputJsonValue {
  const d = parseCommsOutcomeDisplay(previous);
  const priorExcerpt = truncateCommsDisplayText(formatCommsFailureReasonSummary(previous), 220);
  const priorAudit: CommsSendOutcomeSummaryV1["policyRetryAudit"] = isOutcomeSummaryV1(previous)
    ? (previous.policyRetryAudit ?? [])
    : [];
  const nextAudit: NonNullable<CommsSendOutcomeSummaryV1["policyRetryAudit"]> = [
    ...priorAudit,
    {
      at: params.nowIso,
      byUserId: params.actorUserId,
      priorProviderMessageId: params.priorProviderMessageId,
      priorCategory: params.priorCategory,
      priorErrorExcerpt: priorExcerpt || null,
      priorExecutionAttemptedAt: d.executionAttemptedAt ?? params.nowIso,
    },
  ];

  const base: CommsSendOutcomeSummaryV1 = isOutcomeSummaryV1(previous)
    ? { ...previous, policyRetryAudit: nextAudit, operatorRetryPending: true }
    : {
        version: 1,
        executionAttemptedAt: params.nowIso,
        provider: d.provider ?? CommsSendProvider.SENDGRID,
        channel: params.channel,
        providerStatus: d.providerStatus,
        success: false,
        policyRetryAudit: nextAudit,
        operatorRetryPending: true,
      };

  return {
    ...base,
    errorCode: undefined,
    errorMessage: undefined,
    webhookPending: false,
    gatingReason: "Operator re-queued; awaiting the next execution attempt. Prior errors are in policyRetryAudit.",
    success: false,
  };
}

export function logCommsSendRetryAttempt(payload: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: "comms_workbench_send_retry",
      ...payload,
    })
  );
}
