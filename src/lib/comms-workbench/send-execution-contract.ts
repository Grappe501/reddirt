import type {
  CommunicationSendType,
  CommsWorkbenchChannel,
} from "@prisma/client";

/**
 * Normalized handoff shape for a future execution worker. Pure data — no I/O, no providers, no audience expansion.
 * Packet 9 defines the contract; Packet 10+ may consume it from a queue.
 */
export type CommunicationSendExecutionContract = {
  version: 1;
  sendId: string;
  planId: string;
  channel: CommsWorkbenchChannel;
  sendType: CommunicationSendType | null;
  scheduledAt: string | null;
  targetSegmentId: string | null;
  source: {
    type: "draft" | "variant";
    draftId: string;
    variantId: string | null;
  };
  content: {
    resolvedSubject: string | null;
    resolvedPreviewText: string | null;
    resolvedBody: string;
    resolvedShortCopy: string | null;
    resolvedCta: string | null;
  };
  metadataJson: unknown;
};

type DraftForContract = {
  id: string;
  subjectLine: string | null;
  previewText: string | null;
  bodyCopy: string;
  shortCopy: string | null;
  ctaType: string | null;
};

type VariantForContract = {
  id: string;
  subjectLineOverride: string | null;
  bodyCopyOverride: string | null;
  ctaOverride: string | null;
} | null;

type SendForContract = {
  id: string;
  communicationPlanId: string;
  communicationDraftId: string;
  communicationVariantId: string | null;
  channel: CommsWorkbenchChannel;
  sendType: CommunicationSendType | null;
  scheduledAt: Date | null;
  targetSegmentId: string | null;
  metadataJson: unknown;
};

/**
 * Build the execution handoff object from a send row plus draft (and optional variant) copy.
 * Does not load from DB; callers pass Prisma results or DTOs.
 */
export function buildCommunicationSendExecutionContract(
  send: SendForContract,
  draft: DraftForContract,
  variant: VariantForContract
): CommunicationSendExecutionContract {
  const v = send.communicationVariantId != null && variant != null ? variant : null;
  const sourceType: "draft" | "variant" = v ? "variant" : "draft";
  return {
    version: 1,
    sendId: send.id,
    planId: send.communicationPlanId,
    channel: send.channel,
    sendType: send.sendType,
    scheduledAt: send.scheduledAt?.toISOString() ?? null,
    targetSegmentId: send.targetSegmentId,
    source: {
      type: sourceType,
      draftId: send.communicationDraftId,
      variantId: v ? v.id : null,
    },
    content: {
      resolvedSubject: v ? (v.subjectLineOverride ?? draft.subjectLine) : draft.subjectLine,
      resolvedPreviewText: draft.previewText,
      resolvedBody: v ? (v.bodyCopyOverride ?? draft.bodyCopy) : draft.bodyCopy,
      resolvedShortCopy: draft.shortCopy,
      resolvedCta: v ? (v.ctaOverride ?? draft.ctaType) : draft.ctaType,
    },
    metadataJson: send.metadataJson,
  };
}
