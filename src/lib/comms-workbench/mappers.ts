import type {
  CommunicationDraftStatus,
  CommunicationObjective,
  CommunicationPlanStatus,
  CommunicationReviewDecision,
  CommunicationSendStatus,
  CommunicationVariantStatus,
  CommsWorkbenchChannel,
  SocialMessageTacticMode,
  SocialMessageToneMode,
} from "@prisma/client";
import type {
  CommunicationDraftDetail,
  CommunicationDraftListItem,
  CommunicationPlanExecutionSummary,
  CommunicationPlanListItem,
  CommunicationPlanOpsSummary,
  CommunicationPlanRecentSendOutcome,
  CommunicationReviewSummary,
  CommunicationSendListItem,
  CommunicationSendSummary,
  CommunicationSourceRef,
  CommunicationSourceSummary,
  CommunicationUserSummary,
  CommunicationVariantListItem,
  PlanSourceShape,
} from "./dto";
import { getCommunicationSendRetryState } from "./send-retry-policy";
import {
  formatCommsFailureReasonSummary,
  formatCommsOutcomeSummaryLine,
  getLatestProviderStatusFromOutcome,
} from "./outcome-display";
import { getSendStatusDisplay } from "./status-display";
import { formatCommsFieldLabel } from "./ui-labels";

type UserRow = { id: string; name: string | null; email: string } | null | undefined;

export function mapCommunicationUserSummary(u: UserRow): CommunicationUserSummary | null {
  if (!u) return null;
  const nameLabel = u.name?.trim() || null;
  return { id: u.id, nameLabel, email: u.email };
}

function refIntake(row: NonNullable<PlanSourceShape["sourceWorkflowIntake"]>): CommunicationSourceRef {
  const subtitle = [row.status, row.source].filter(Boolean).join(" · ") || null;
  return {
    kind: "WORKFLOW_INTAKE",
    id: row.id,
    sourceLabel: row.title?.trim() || "Workflow intake",
    sourceSubtitle: subtitle,
  };
}

function refTask(row: NonNullable<PlanSourceShape["sourceCampaignTask"]>): CommunicationSourceRef {
  return {
    kind: "CAMPAIGN_TASK",
    id: row.id,
    sourceLabel: row.title.trim(),
    sourceSubtitle: row.status,
  };
}

function refEvent(row: NonNullable<PlanSourceShape["sourceEvent"]>): CommunicationSourceRef {
  const start = row.startAt.toISOString().slice(0, 10);
  return {
    kind: "CAMPAIGN_EVENT",
    id: row.id,
    sourceLabel: row.title,
    sourceSubtitle: `${start} · ${row.status}`,
  };
}

function refSocial(row: NonNullable<PlanSourceShape["sourceSocialContentItem"]>): CommunicationSourceRef {
  return {
    kind: "SOCIAL_CONTENT",
    id: row.id,
    sourceLabel: row.title?.trim() || "Social content item",
    sourceSubtitle: `${row.kind} · ${row.status}`,
  };
}

export function mapCommunicationSourceSummary(
  sourceType: string | null | undefined,
  shape: PlanSourceShape
): CommunicationSourceSummary {
  const all: CommunicationSourceRef[] = [];
  if (shape.sourceWorkflowIntake) all.push(refIntake(shape.sourceWorkflowIntake));
  if (shape.sourceCampaignTask) all.push(refTask(shape.sourceCampaignTask));
  if (shape.sourceEvent) all.push(refEvent(shape.sourceEvent));
  if (shape.sourceSocialContentItem) all.push(refSocial(shape.sourceSocialContentItem));
  const primary = all[0] ?? null;
  return { sourceType: sourceType ?? null, primary, all };
}

type DraftLite = {
  status: CommunicationDraftStatus;
  reviewRequestedAt: Date | null;
  reviewedAt: Date | null;
  reviewDecision: CommunicationReviewDecision | null;
};

type VariantReviewLite = {
  status: CommunicationVariantStatus;
  reviewRequestedAt: Date | null;
  reviewedAt: Date | null;
  reviewDecision: CommunicationReviewDecision | null;
};

function variantInReviewQueue(s: CommunicationVariantStatus): boolean {
  return s === "READY_FOR_REVIEW" || s === "READY";
}

export function buildCommunicationReviewSummary(
  drafts: DraftLite[],
  variants: VariantReviewLite[] = []
): CommunicationReviewSummary {
  let approvedDraftCount = 0;
  let rejectedDraftCount = 0;
  let hasDraftsReadyForReview = false;
  let approvedVariantCount = 0;
  let rejectedVariantCount = 0;
  let hasVariantsReadyForReview = false;
  let latestReviewRequestedAt: Date | null = null;
  let latestReviewedAt: Date | null = null;

  for (const d of drafts) {
    if (d.status === "READY_FOR_REVIEW") hasDraftsReadyForReview = true;
    if (d.status === "APPROVED") approvedDraftCount += 1;
    if (d.status === "REJECTED") rejectedDraftCount += 1;
    if (d.reviewRequestedAt && (!latestReviewRequestedAt || d.reviewRequestedAt > latestReviewRequestedAt)) {
      latestReviewRequestedAt = d.reviewRequestedAt;
    }
    if (d.reviewedAt && (!latestReviewedAt || d.reviewedAt > latestReviewedAt)) {
      latestReviewedAt = d.reviewedAt;
    }
  }

  for (const v of variants) {
    if (variantInReviewQueue(v.status)) hasVariantsReadyForReview = true;
    if (v.status === "APPROVED") approvedVariantCount += 1;
    if (v.status === "REJECTED") rejectedVariantCount += 1;
    if (v.reviewRequestedAt && (!latestReviewRequestedAt || v.reviewRequestedAt > latestReviewRequestedAt)) {
      latestReviewRequestedAt = v.reviewRequestedAt;
    }
    if (v.reviewedAt && (!latestReviewedAt || v.reviewedAt > latestReviewedAt)) {
      latestReviewedAt = v.reviewedAt;
    }
  }

  return {
    hasDraftsReadyForReview,
    approvedDraftCount,
    rejectedDraftCount,
    hasVariantsReadyForReview,
    approvedVariantCount,
    rejectedVariantCount,
    latestReviewRequestedAt: latestReviewRequestedAt?.toISOString() ?? null,
    latestReviewedAt: latestReviewedAt?.toISOString() ?? null,
  };
}

export function buildCommunicationSendSummary(
  sends: {
    status: CommunicationSendStatus;
    scheduledAt: Date | null;
    sentAt: Date | null;
  }[]
): CommunicationSendSummary {
  const out: CommunicationSendSummary = {
    sendCount: sends.length,
    queuedCount: 0,
    scheduledCount: 0,
    sendingCount: 0,
    sentCount: 0,
    partiallySentCount: 0,
    failedCount: 0,
    canceledCount: 0,
    draftSendCount: 0,
    nextScheduledAt: null,
    lastSentAt: null,
  };

  const now = Date.now();
  let minFuture: Date | null = null;
  let maxSent: Date | null = null;

  for (const s of sends) {
    switch (s.status) {
      case "QUEUED":
        out.queuedCount += 1;
        break;
      case "SCHEDULED":
        out.scheduledCount += 1;
        break;
      case "SENDING":
        out.sendingCount += 1;
        break;
      case "SENT":
        out.sentCount += 1;
        break;
      case "PARTIALLY_SENT":
        out.partiallySentCount += 1;
        break;
      case "FAILED":
        out.failedCount += 1;
        break;
      case "CANCELED":
        out.canceledCount += 1;
        break;
      case "DRAFT":
        out.draftSendCount += 1;
        break;
      default:
        break;
    }

    if (s.scheduledAt) {
      const t = s.scheduledAt.getTime();
      if (t >= now && s.status !== "CANCELED" && s.status !== "SENT" && s.status !== "FAILED") {
        if (!minFuture || s.scheduledAt < minFuture) minFuture = s.scheduledAt;
      }
    }
    if (s.sentAt) {
      if (!maxSent || s.sentAt > maxSent) maxSent = s.sentAt;
    }
  }

  out.nextScheduledAt = minFuture?.toISOString() ?? null;
  out.lastSentAt = maxSent?.toISOString() ?? null;

  return out;
}

function maxIsoString(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}

/**
 * Plan-level execution rollups and failure visibility from list-shaped sends (Packet 11A).
 */
export function buildCommunicationPlanExecutionSummary(
  sends: CommunicationSendListItem[]
): CommunicationPlanExecutionSummary {
  const base = buildCommunicationSendSummary(
    sends.map((s) => ({
      status: s.status,
      scheduledAt: s.scheduledAt ? new Date(s.scheduledAt) : null,
      sentAt: s.sentAt ? new Date(s.sentAt) : null,
    }))
  );

  const byStatus: Partial<Record<CommunicationSendStatus, number>> = {};
  for (const s of sends) {
    byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
  }

  let lastFailureAt: string | null = null;
  const failedSends = sends.filter((s) => s.status === "FAILED");
  for (const s of failedSends) {
    lastFailureAt = maxIsoString(lastFailureAt, s.updatedAt);
  }

  const failedOrdered = [...failedSends].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const latestFailed = failedOrdered[0];
  const latestFailureSummary = latestFailed
    ? formatCommsFailureReasonSummary(latestFailed.outcomeSummaryJson)
    : null;
  const latestProviderStatus = latestFailed
    ? getLatestProviderStatusFromOutcome(latestFailed.outcomeSummaryJson)
    : null;

  let lastQueuedAt: string | null = null;
  let lastSendingAt: string | null = null;
  let lastSentAt: string | null = null;
  let lastExecutionAt: string | null = null;

  for (const s of sends) {
    if (s.queuedAt) lastQueuedAt = maxIsoString(lastQueuedAt, s.queuedAt);
    if (s.status === "SENDING") lastSendingAt = maxIsoString(lastSendingAt, s.updatedAt);
    if (s.sentAt) {
      lastSentAt = maxIsoString(lastSentAt, s.sentAt);
    }
    for (const c of [s.updatedAt, s.sentAt, s.completedAt, s.queuedAt] as const) {
      if (c) lastExecutionAt = maxIsoString(lastExecutionAt, c);
    }
  }

  const recentSorted = [...sends].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const recentSendOutcomes: CommunicationPlanRecentSendOutcome[] = recentSorted.slice(0, 8).map((s) => {
    const line = formatCommsOutcomeSummaryLine(s.outcomeSummaryJson, { includeWebhookPending: true });
    const outcomeLabel = line || getSendStatusDisplay(s.status).label;
    return {
      sendId: s.id,
      status: s.status,
      channel: s.channel,
      updatedAt: s.updatedAt,
      outcomeLabel,
    };
  });

  return {
    totalSends: base.sendCount,
    byStatus,
    queuedCount: base.queuedCount,
    sendingCount: base.sendingCount,
    sentCount: base.sentCount,
    partiallySentCount: base.partiallySentCount,
    failedCount: base.failedCount,
    scheduledCount: base.scheduledCount,
    canceledCount: base.canceledCount,
    draftSendCount: base.draftSendCount,
    lastExecutionAt,
    lastFailureAt,
    lastQueuedAt,
    lastSendingAt,
    lastSentAt: lastSentAt ?? base.lastSentAt,
    latestFailureSummary,
    latestProviderStatus,
    recentSendOutcomes,
  };
}

/**
 * Derived operator flags for plan detail (send creation, queue, attention).
 */
export function buildCommunicationPlanOpsSummary(
  drafts: CommunicationDraftDetail[],
  review: CommunicationReviewSummary,
  sendSummary: CommunicationSendSummary,
  sends: CommunicationSendListItem[]
): CommunicationPlanOpsSummary {
  let approvedDraftCount = 0;
  let approvedVariantCount = 0;
  for (const d of drafts) {
    if (d.status === "APPROVED") approvedDraftCount += 1;
    for (const v of d.variants) {
      if (v.status === "APPROVED") approvedVariantCount += 1;
    }
  }
  const variantRowCount = drafts.reduce((acc, d) => acc + d.variants.length, 0);
  const hasAnyDraftOrVariantRow = drafts.length > 0 || variantRowCount > 0;
  const hasApprovedAssetForSend = approvedDraftCount > 0 || approvedVariantCount > 0;
  let failedSendOperatorRetryableCount = 0;
  let failedSendOperatorRetriesExhaustedCount = 0;
  for (const s of sends) {
    if (s.status !== "FAILED") continue;
    if (s.operatorRetry.canRetry) failedSendOperatorRetryableCount += 1;
    if (s.retryCount >= s.operatorRetry.retryLimit) failedSendOperatorRetriesExhaustedCount += 1;
  }
  return {
    approvedDraftCount,
    approvedVariantCount,
    hasApprovedAssetForSend,
    needsReviewAttention: review.hasDraftsReadyForReview || review.hasVariantsReadyForReview,
    hasExecutionFailures: sendSummary.failedCount > 0,
    queuedSendCount: sends.filter((s) => s.status === "QUEUED").length,
    hasDraftOrVariantWorkButNoApprovedSendSource: hasAnyDraftOrVariantRow && !hasApprovedAssetForSend,
    failedSendOperatorRetryableCount,
    failedSendOperatorRetriesExhaustedCount,
  };
}

function uniqueChannels(
  draftChannels: CommsWorkbenchChannel[],
  sendChannels: CommsWorkbenchChannel[]
): CommsWorkbenchChannel[] {
  const set = new Set<CommsWorkbenchChannel>([...draftChannels, ...sendChannels]);
  return Array.from(set);
}

function needsActionHeuristic(
  status: CommunicationPlanStatus,
  review: CommunicationReviewSummary,
  hasFailedSend: boolean
): boolean {
  if (["DRAFT", "PLANNING", "READY_FOR_REVIEW"].includes(status)) return true;
  if (review.hasDraftsReadyForReview || review.hasVariantsReadyForReview) return true;
  if (status === "APPROVED" && hasFailedSend) return true;
  return false;
}

export type PlanListRowShape = PlanSourceShape & {
  id: string;
  title: string;
  objective: CommunicationObjective;
  status: CommunicationPlanStatus;
  priority: CommunicationPlanListItem["priority"];
  summary: string | null;
  sourceType: string | null;
  dueAt: Date | null;
  scheduledAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  ownerUser: UserRow;
  requestedByUser: UserRow;
  _count: { drafts: number; sends: number };
  drafts: {
    channel: CommsWorkbenchChannel;
    status: CommunicationDraftStatus;
    reviewRequestedAt: Date | null;
    reviewedAt: Date | null;
    reviewDecision: CommunicationReviewDecision | null;
    _count: { variants: number };
    variants: {
      status: CommunicationVariantStatus;
      reviewRequestedAt: Date | null;
      reviewedAt: Date | null;
      reviewDecision: CommunicationReviewDecision | null;
    }[];
  }[];
  sends: {
    channel: CommsWorkbenchChannel;
    scheduledAt: Date | null;
    sentAt: Date | null;
    status: CommunicationSendStatus;
  }[];
};

export function mapCommunicationPlanListItem(row: PlanListRowShape): CommunicationPlanListItem {
  const source = mapCommunicationSourceSummary(row.sourceType, row);
  const review = buildCommunicationReviewSummary(
    row.drafts,
    row.drafts.flatMap((d) => d.variants)
  );
  const sendRollupFull = buildCommunicationSendSummary(row.sends);
  const variantCount = row.drafts.reduce((acc, d) => acc + d._count.variants, 0);
  const channelsOnPlan = uniqueChannels(
    row.drafts.map((d) => d.channel),
    row.sends.map((s) => s.channel)
  );
  const hasFailedSend = row.sends.some((s) => s.status === "FAILED");
  return {
    id: row.id,
    title: row.title,
    objective: row.objective,
    status: row.status,
    priority: row.priority,
    summary: row.summary,
    source,
    owner: mapCommunicationUserSummary(row.ownerUser),
    requester: mapCommunicationUserSummary(row.requestedByUser),
    linkedEventTitle: row.sourceEvent?.title ?? null,
    linkedEventId: row.sourceEvent?.id ?? null,
    draftCount: row._count.drafts,
    variantCount,
    sendCount: row._count.sends,
    review,
    sendRollup: {
      nextScheduledAt: sendRollupFull.nextScheduledAt,
      lastSentAt: sendRollupFull.lastSentAt,
      sendCount: sendRollupFull.sendCount,
      failedCount: sendRollupFull.failedCount,
      scheduledCount: sendRollupFull.scheduledCount,
      queuedCount: sendRollupFull.queuedCount,
      sendingCount: sendRollupFull.sendingCount,
      sentCount: sendRollupFull.sentCount,
    },
    channelsOnPlan,
    needsAction: needsActionHeuristic(row.status, review, hasFailedSend),
    dueAt: row.dueAt?.toISOString() ?? null,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

type VariantRow = {
  id: string;
  communicationDraftId: string;
  variantType: CommunicationVariantListItem["variantType"];
  targetSegmentId: string | null;
  targetSegmentLabel: string | null;
  channelOverride: CommsWorkbenchChannel | null;
  subjectLineOverride: string | null;
  bodyCopyOverride: string | null;
  ctaOverride: string | null;
  status: CommunicationVariantListItem["status"];
  reviewRequestedAt: Date | null;
  reviewedAt: Date | null;
  reviewDecision: CommunicationReviewDecision | null;
  reviewNotes: string | null;
  reviewRequestedByUser: UserRow;
  reviewedByUser: UserRow;
  createdAt: Date;
  updatedAt: Date;
};

function mapVariantItem(v: VariantRow): CommunicationVariantListItem {
  return {
    id: v.id,
    communicationDraftId: v.communicationDraftId,
    variantType: v.variantType,
    targetSegmentId: v.targetSegmentId,
    targetSegmentLabel: v.targetSegmentLabel,
    channelOverride: v.channelOverride,
    subjectLineOverride: v.subjectLineOverride,
    bodyCopyOverride: v.bodyCopyOverride,
    ctaOverride: v.ctaOverride,
    status: v.status,
    reviewRequestedAt: v.reviewRequestedAt?.toISOString() ?? null,
    reviewRequestedBy: mapCommunicationUserSummary(v.reviewRequestedByUser),
    reviewedAt: v.reviewedAt?.toISOString() ?? null,
    reviewedBy: mapCommunicationUserSummary(v.reviewedByUser),
    reviewDecision: v.reviewDecision,
    reviewNotes: v.reviewNotes,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

type DraftRowForDetail = {
  id: string;
  communicationPlanId: string;
  channel: CommsWorkbenchChannel;
  title: string | null;
  subjectLine: string | null;
  previewText: string | null;
  bodyCopy: string;
  shortCopy: string | null;
  messageToneMode: SocialMessageToneMode | null;
  messageTacticMode: SocialMessageTacticMode | null;
  ctaType: string | null;
  status: CommunicationDraftStatus;
  isPrimary: boolean;
  reviewNotes: string | null;
  reviewRequestedAt: Date | null;
  reviewedAt: Date | null;
  reviewDecision: CommunicationReviewDecision | null;
  createdAt: Date;
  updatedAt: Date;
  createdByUser: UserRow;
  updatedByUser: UserRow;
  reviewRequestedByUser: UserRow;
  reviewedByUser: UserRow;
  variants: VariantRow[];
  _count: { variants: number };
};

export function mapCommunicationDraftListItem(d: DraftRowForDetail): CommunicationDraftListItem {
  return {
    id: d.id,
    communicationPlanId: d.communicationPlanId,
    channel: d.channel,
    title: d.title,
    status: d.status,
    isPrimary: d.isPrimary,
    messageToneMode: d.messageToneMode ?? null,
    messageTacticMode: d.messageTacticMode ?? null,
    createdBy: mapCommunicationUserSummary(d.createdByUser),
    updatedBy: mapCommunicationUserSummary(d.updatedByUser),
    reviewRequestedAt: d.reviewRequestedAt?.toISOString() ?? null,
    reviewedAt: d.reviewedAt?.toISOString() ?? null,
    reviewDecision: d.reviewDecision,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    variantCount: d._count.variants,
  };
}

export function mapCommunicationDraftDetail(
  d: DraftRowForDetail
): CommunicationDraftDetail {
  const base = mapCommunicationDraftListItem(d);
  return {
    ...base,
    subjectLine: d.subjectLine,
    previewText: d.previewText,
    bodyCopy: d.bodyCopy,
    shortCopy: d.shortCopy,
    ctaType: d.ctaType,
    reviewNotes: d.reviewNotes,
    reviewRequestedBy: mapCommunicationUserSummary(d.reviewRequestedByUser),
    reviewedBy: mapCommunicationUserSummary(d.reviewedByUser),
    variants: d.variants.map(mapVariantItem),
  };
}

export function mapCommunicationSendListItem(
  s: {
    id: string;
    communicationPlanId: string;
    communicationDraftId: string;
    communicationVariantId: string | null;
    channel: CommsWorkbenchChannel;
    sendType: CommunicationSendListItem["sendType"];
    targetSegmentId: string | null;
    status: CommunicationSendStatus;
    scheduledAt: Date | null;
    sentAt: Date | null;
    completedAt: Date | null;
    providerMessageId: string | null;
    outcomeSummaryJson: unknown;
    sentByUser: UserRow;
    retryCount: number;
    lastRetriedAt: Date | null;
    lastRetriedByUser: UserRow;
    createdAt: Date;
    updatedAt: Date;
  } & {
    draft: { id: string; title: string | null; channel: CommsWorkbenchChannel; status: CommunicationDraftStatus };
    variant: {
      id: string;
      targetSegmentLabel: string | null;
      status: CommunicationVariantStatus;
      channelOverride: CommsWorkbenchChannel | null;
    } | null;
    queuedByUser: UserRow;
    queuedAt: Date | null;
  }
): CommunicationSendListItem {
  const lastRetriedBy = mapCommunicationUserSummary(s.lastRetriedByUser);
  const operatorRetry = getCommunicationSendRetryState({
    status: s.status,
    channel: s.channel,
    retryCount: s.retryCount,
    lastRetriedAt: s.lastRetriedAt,
    lastRetriedBy,
    draftStatus: s.draft.status,
    variant: s.variant,
    outcomeSummaryJson: s.outcomeSummaryJson,
  });
  return {
    id: s.id,
    communicationPlanId: s.communicationPlanId,
    communicationDraftId: s.communicationDraftId,
    communicationVariantId: s.communicationVariantId,
    channel: s.channel,
    sendType: s.sendType,
    targetSegmentId: s.targetSegmentId,
    status: s.status,
    scheduledAt: s.scheduledAt?.toISOString() ?? null,
    sentAt: s.sentAt?.toISOString() ?? null,
    completedAt: s.completedAt?.toISOString() ?? null,
    sentBy: mapCommunicationUserSummary(s.sentByUser),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    sourceKind: s.communicationVariantId ? "variant" : "draft",
    draftTitle: s.draft.title,
    variantLabel: s.variant?.targetSegmentLabel ?? null,
    queuedAt: s.queuedAt?.toISOString() ?? null,
    queuedBy: mapCommunicationUserSummary(s.queuedByUser),
    providerMessageId: s.providerMessageId ?? null,
    outcomeSummaryJson: s.outcomeSummaryJson ?? null,
    retryCount: s.retryCount,
    lastRetriedAt: s.lastRetriedAt?.toISOString() ?? null,
    lastRetriedBy,
    operatorRetry,
  };
}
