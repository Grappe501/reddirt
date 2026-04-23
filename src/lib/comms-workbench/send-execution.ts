import {
  CommunicationDraftStatus,
  CommunicationSendStatus,
  CommunicationSendType,
  CommunicationVariantStatus,
  CommsSendProvider,
  CommsWorkbenchChannel,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { isExecutableCommsWorkbenchChannel } from "./constants";
import { buildCommunicationSendExecutionContract } from "./send-execution-contract";
import { canUseDirectExecutionAddress, parseCommsExecutionMetadata } from "./send-execution-metadata";
import { buildInitialOutcomeSummaryV1 } from "./send-status-updates";
import { dispatchWorkbenchSend, selectProviderForWorkbenchChannel } from "./send-provider-adapters";
import {
  expandCommunicationSendToRecipients,
  getWorkbenchExecutionCompletionEventType,
  normalizeSendExecutionToRecipientEvent,
  recordWorkbenchSendFailureToRecipients,
} from "@/lib/contact-engagement/ingestion";
import {
  isOutcomeSummaryV1,
  mergeCommsOutcomeWithPolicyRetryHistory,
  type CommsSendOutcomeSummaryV1,
} from "./send-execution-outcome";

function logCommsExecution(payload: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: "comms_workbench_execution",
      ...payload,
    })
  );
}

function isSourceApproved(
  draftStatus: CommunicationDraftStatus,
  variant: { status: CommunicationVariantStatus } | null
): boolean {
  if (variant) {
    return variant.status === CommunicationVariantStatus.APPROVED;
  }
  return draftStatus === CommunicationDraftStatus.APPROVED;
}

/**
 * Atomic claim: `QUEUED` → `SENDING` only if still queued.
 * Idempotent: if the send is already `SENDING` for the same id, returns ok (worker retry).
 */
export async function claimQueuedCommunicationSendForExecution(
  communicationSendId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await prisma.communicationSend.updateMany({
    where: { id: communicationSendId, status: CommunicationSendStatus.QUEUED },
    data: { status: CommunicationSendStatus.SENDING },
  });
  if (r.count > 0) {
    const row = await prisma.communicationSend.findUnique({
      where: { id: communicationSendId },
      select: { communicationPlanId: true, channel: true, status: true },
    });
    logCommsExecution({
      event: "claim",
      sendId: communicationSendId,
      planId: row?.communicationPlanId,
      channel: row?.channel,
      statusTransition: "QUEUED->SENDING",
    });
    return { ok: true };
  }
  const cur = await prisma.communicationSend.findUnique({
    where: { id: communicationSendId },
    select: { status: true, communicationPlanId: true, channel: true },
  });
  if (cur?.status === CommunicationSendStatus.SENDING) {
    logCommsExecution({
      event: "claim_noop",
      sendId: communicationSendId,
      planId: cur.communicationPlanId,
      channel: cur.channel,
      note: "already_sending",
    });
    return { ok: true };
  }
  return { ok: false, error: "Send is not queued for execution; claim was skipped." };
}

type SendRow = NonNullable<Awaited<ReturnType<typeof loadSendForExecution>>>;

async function loadSendForExecution(communicationSendId: string) {
  return prisma.communicationSend.findUnique({
    where: { id: communicationSendId },
    include: {
      draft: {
        select: {
          id: true,
          status: true,
          subjectLine: true,
          previewText: true,
          bodyCopy: true,
          shortCopy: true,
          ctaType: true,
        },
      },
      variant: {
        select: {
          id: true,
          status: true,
          subjectLineOverride: true,
          bodyCopyOverride: true,
          ctaOverride: true,
        },
      },
    },
  });
}

/**
 * Resolve recipient for EMAIL/SMS using `metadataJson.commsExecution` and optional non-persisted overrides.
 */
export async function resolveExecutionRecipientForSend(params: {
  send: {
    channel: CommsWorkbenchChannel;
    sendType: CommunicationSendType | null;
    metadataJson: unknown;
  };
  overrides: { toEmail?: string; toPhone?: string };
}): Promise<
  | { ok: true; toEmail: string | null; toPhone: string | null; preferenceThreadId: string | null }
  | { ok: false; error: string }
> {
  const meta = parseCommsExecutionMetadata(params.send.metadataJson);
  const o = params.overrides;

  if (meta.executionThreadId) {
    const thread = await prisma.communicationThread.findUnique({
      where: { id: meta.executionThreadId },
      select: { id: true, primaryEmail: true, primaryPhone: true },
    });
    if (!thread) {
      return {
        ok: false,
        error: "metadata.commsExecution.executionThreadId does not reference a valid thread.",
      };
    }
    if (params.send.channel === CommsWorkbenchChannel.EMAIL) {
      const em = thread.primaryEmail?.trim();
      if (!em) {
        return { ok: false, error: "Thread has no primary email; cannot execute EMAIL send." };
      }
      return { ok: true, toEmail: em, toPhone: null, preferenceThreadId: thread.id };
    }
    if (params.send.channel === CommsWorkbenchChannel.SMS) {
      const ph = thread.primaryPhone?.trim();
      if (!ph) {
        return { ok: false, error: "Thread has no primary phone; cannot execute SMS send." };
      }
      return { ok: true, toEmail: null, toPhone: ph, preferenceThreadId: thread.id };
    }
    return { ok: false, error: "Unsupported channel for thread-based execution." };
  }

  if (o.toEmail || o.toPhone) {
    if (params.send.channel === CommsWorkbenchChannel.EMAIL && o.toEmail) {
      return { ok: true, toEmail: o.toEmail.trim(), toPhone: null, preferenceThreadId: null };
    }
    if (params.send.channel === CommsWorkbenchChannel.SMS && o.toPhone) {
      return { ok: true, toEmail: null, toPhone: o.toPhone.trim(), preferenceThreadId: null };
    }
  }

  if (meta.toEmail || meta.toPhone) {
    const allow = canUseDirectExecutionAddress({ sendType: params.send.sendType, meta });
    if (!allow) {
      return {
        ok: false,
        error:
          "Direct address in metadata requires send type TEST or `executionAllowDirectAddress` in `metadata.commsExecution`.",
      };
    }
    if (params.send.channel === CommsWorkbenchChannel.EMAIL && meta.toEmail) {
      return { ok: true, toEmail: meta.toEmail.trim(), toPhone: null, preferenceThreadId: null };
    }
    if (params.send.channel === CommsWorkbenchChannel.SMS && meta.toPhone) {
      return { ok: true, toEmail: null, toPhone: meta.toPhone.trim(), preferenceThreadId: null };
    }
  }

  return {
    ok: false,
    error:
      "No recipient: set `metadata.commsExecution.executionThreadId`, or (TEST / flagged) toEmail / toPhone, or pass overrides from the execute action.",
  };
}

/**
 * Run provider dispatch for a claimed send. Requires `SENDING` status, canonical contract, and an executable channel.
 * Idempotent: if already `SENT`, no-ops; if `SENDING` with `providerMessageId`, finalizes to `SENT` without re-calling the provider.
 */
export async function executeCommunicationSend(params: {
  communicationSendId: string;
  sentByUserId: string | null;
  recipientOverride?: { toEmail?: string; toPhone?: string };
}): Promise<{ ok: true; noop?: boolean } | { ok: false; error: string }> {
  const send = await loadSendForExecution(params.communicationSendId);
  if (!send) return { ok: false, error: "Send not found." };

  if (send.status === CommunicationSendStatus.SENT) {
    return { ok: true, noop: true };
  }

  if (send.status === CommunicationSendStatus.SENDING && send.providerMessageId) {
    const outcome = buildTerminalOutcomeFromExisting(send.outcomeSummaryJson, send);
    await prisma.communicationSend.update({
      where: { id: send.id },
      data: {
        status: CommunicationSendStatus.SENT,
        sentAt: send.sentAt ?? new Date(),
        completedAt: new Date(),
        sentByUserId: params.sentByUserId ?? undefined,
        outcomeSummaryJson: outcome ?? send.outcomeSummaryJson ?? undefined,
      },
    });
    const addr = await resolveExecutionRecipientForSend({
      send: { channel: send.channel, sendType: send.sendType, metadataJson: send.metadataJson },
      overrides: params.recipientOverride ?? {},
    });
    if (addr.ok) {
      await expandCommunicationSendToRecipients({
        communicationSendId: send.id,
        communicationPlanId: send.communicationPlanId,
        channel: send.channel,
        toEmail: addr.toEmail,
        toPhone: addr.toPhone,
        preferenceThreadId: addr.preferenceThreadId,
        targetSegmentId: send.targetSegmentId,
      });
      const p = selectProviderForWorkbenchChannel(send.channel) ?? CommsSendProvider.SENDGRID;
      const completion = getWorkbenchExecutionCompletionEventType(send.channel, p, "finalized");
      await normalizeSendExecutionToRecipientEvent({
        communicationSendId: send.id,
        channel: send.channel,
        provider: p,
        providerMessageId: send.providerMessageId,
        success: true,
        sendCompletionEvent: completion,
      });
    }
    logCommsExecution({
      event: "execute_repair",
      sendId: send.id,
      planId: send.communicationPlanId,
      channel: send.channel,
      providerMessageId: send.providerMessageId,
    });
    return { ok: true, noop: true };
  }

  if (send.status !== CommunicationSendStatus.SENDING) {
    return { ok: false, error: "Send is not in SENDING status; execute cannot run." };
  }

  if (!isExecutableCommsWorkbenchChannel(send.channel)) {
    const failOutcome = buildInitialOutcomeSummaryV1({
      provider: CommsSendProvider.MANUAL,
      channel: send.channel,
      providerStatus: null,
      success: false,
      errorCode: "CHANNEL_NOT_EXECUTABLE",
      errorMessage: "This channel is planning-only until a delivery provider is available.",
    });
    await failSend(send, failOutcome, params.sentByUserId);
    logCommsExecution({
      event: "execute_channel_blocked",
      sendId: send.id,
      planId: send.communicationPlanId,
      channel: send.channel,
      error: "non_executable_channel",
    });
    return { ok: false, error: "This channel is not executable yet (EMAIL and SMS are supported)." };
  }

  if (!isSourceApproved(send.draft.status, send.variant)) {
    const failOutcome = buildInitialOutcomeSummaryV1({
      provider: selectProviderForWorkbenchChannel(send.channel) ?? CommsSendProvider.SENDGRID,
      channel: send.channel,
      providerStatus: null,
      success: false,
      errorCode: "SOURCE_NOT_APPROVED",
      gatingReason: "The draft or variant is no longer APPROVED; execution was blocked.",
    });
    await failSend(send, failOutcome, params.sentByUserId);
    logCommsExecution({
      event: "execute_gated",
      sendId: send.id,
      planId: send.communicationPlanId,
      channel: send.channel,
      gating: "source_not_approved",
    });
    return { ok: false, error: "Source asset is no longer approved; send marked FAILED." };
  }

  const contract = buildCommunicationSendExecutionContract(
    {
      id: send.id,
      communicationPlanId: send.communicationPlanId,
      communicationDraftId: send.communicationDraftId,
      communicationVariantId: send.communicationVariantId,
      channel: send.channel,
      sendType: send.sendType,
      scheduledAt: send.scheduledAt,
      targetSegmentId: send.targetSegmentId,
      metadataJson: send.metadataJson,
    },
    send.draft,
    send.variant
  );

  const provider = selectProviderForWorkbenchChannel(send.channel);
  if (!provider) {
    const failOutcome = buildInitialOutcomeSummaryV1({
      provider: CommsSendProvider.MANUAL,
      channel: send.channel,
      providerStatus: null,
      success: false,
      errorCode: "NO_PROVIDER",
    });
    await failSend(send, failOutcome, params.sentByUserId);
    return { ok: false, error: "No provider for this channel." };
  }

  const addr = await resolveExecutionRecipientForSend({
    send: { channel: send.channel, sendType: send.sendType, metadataJson: send.metadataJson },
    overrides: params.recipientOverride ?? {},
  });
  if (!addr.ok) {
    const failOutcome = buildInitialOutcomeSummaryV1({
      provider,
      channel: send.channel,
      providerStatus: null,
      success: false,
      errorCode: "MISSING_RECIPIENT",
      errorMessage: addr.error,
    });
    await failSend(send, failOutcome, params.sentByUserId);
    return { ok: false, error: addr.error };
  }

  await expandCommunicationSendToRecipients({
    communicationSendId: send.id,
    communicationPlanId: send.communicationPlanId,
    channel: send.channel,
    toEmail: addr.toEmail,
    toPhone: addr.toPhone,
    preferenceThreadId: addr.preferenceThreadId,
    targetSegmentId: send.targetSegmentId,
  });

  logCommsExecution({
    event: "execute_dispatch",
    sendId: send.id,
    planId: send.communicationPlanId,
    channel: send.channel,
    provider,
  });

  const result = await dispatchWorkbenchSend({
    contract,
    provider,
    toEmail: addr.toEmail,
    toPhone: addr.toPhone,
    preferenceThreadId: addr.preferenceThreadId,
  });

  if (!result.ok) {
    const failOutcome = buildInitialOutcomeSummaryV1({
      provider: result.provider,
      channel: send.channel,
      providerStatus: null,
      success: false,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
    });
    await failSend(send, failOutcome, params.sentByUserId);
    logCommsExecution({
      event: "execute_provider_failed",
      sendId: send.id,
      planId: send.communicationPlanId,
      channel: send.channel,
      provider: result.provider,
      error: result.errorMessage,
    });
    return { ok: false, error: result.errorMessage };
  }

  const successOutcome = buildInitialOutcomeSummaryV1({
    provider: result.provider,
    channel: send.channel,
    providerStatus: result.providerStatus,
    success: true,
    webhookPending: result.webhookPending,
  });

  const now = new Date();
  const successWithHistory = mergeCommsOutcomeWithPolicyRetryHistory(successOutcome, send.outcomeSummaryJson);
  await prisma.communicationSend.update({
    where: { id: send.id },
    data: {
      status: CommunicationSendStatus.SENT,
      sentAt: now,
      completedAt: now,
      sentByUser: params.sentByUserId ? { connect: { id: params.sentByUserId } } : undefined,
      providerMessageId: result.providerMessageId,
      outcomeSummaryJson: successWithHistory as object,
    },
  });

  const completionEvent = getWorkbenchExecutionCompletionEventType(
    send.channel,
    result.provider,
    result.providerStatus
  );
  await normalizeSendExecutionToRecipientEvent({
    communicationSendId: send.id,
    channel: send.channel,
    provider: result.provider,
    providerMessageId: result.providerMessageId,
    success: true,
    sendCompletionEvent: completionEvent,
  });

  logCommsExecution({
    event: "execute_success",
    sendId: send.id,
    planId: send.communicationPlanId,
    channel: send.channel,
    provider: result.provider,
    providerMessageId: result.providerMessageId,
    statusTransition: "SENDING->SENT",
  });

  return { ok: true };
}

function buildTerminalOutcomeFromExisting(
  existing: unknown,
  send: { channel: CommsWorkbenchChannel; outcomeSummaryJson: unknown }
): CommsSendOutcomeSummaryV1 | null {
  if (isOutcomeSummaryV1(existing)) return existing;
  return buildInitialOutcomeSummaryV1({
    provider: selectProviderForWorkbenchChannel(send.channel) ?? CommsSendProvider.SENDGRID,
    channel: send.channel,
    providerStatus: "finalized",
    success: true,
    webhookPending: true,
  });
}

async function failSend(
  send: SendRow,
  outcome: CommsSendOutcomeSummaryV1,
  sentByUserId: string | null
) {
  const now = new Date();
  const withHistory = mergeCommsOutcomeWithPolicyRetryHistory(outcome, send.outcomeSummaryJson);
  await prisma.communicationSend.update({
    where: { id: send.id },
    data: {
      status: CommunicationSendStatus.FAILED,
      completedAt: now,
      sentByUser: sentByUserId ? { connect: { id: sentByUserId } } : undefined,
      outcomeSummaryJson: withHistory as object,
    },
  });
  await recordWorkbenchSendFailureToRecipients(send.id, {
    errorCode: outcome.errorCode,
    errorMessage: outcome.errorMessage,
  });
}

/**
 * Picks the oldest queued send in a plan (by `queuedAt`, then `createdAt`) for worker-style use.
 */
export async function findNextQueuedCommunicationSendInPlan(communicationPlanId: string) {
  return prisma.communicationSend.findFirst({
    where: { communicationPlanId, status: CommunicationSendStatus.QUEUED },
    orderBy: [{ queuedAt: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
}
