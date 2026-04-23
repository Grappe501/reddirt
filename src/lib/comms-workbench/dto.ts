import type {
  CampaignEventStatus,
  CampaignEventType,
  CampaignTaskPriority,
  CampaignTaskStatus,
  CommsSendProvider,
  CommsWorkbenchChannel,
  CommunicationDraftStatus,
  CommunicationObjective,
  CommunicationPlanStatus,
  CommunicationReviewDecision,
  CommunicationSendStatus,
  CommunicationSendType,
  CommunicationVariantStatus,
  CommunicationVariantType,
  ConversationUrgency,
  MediaOutreachItemType,
  MediaOutreachStatus,
  SocialContentKind,
  SocialContentStatus,
  SocialMessageTacticMode,
  SocialMessageToneMode,
  WorkflowIntakeStatus,
} from "@prisma/client";
import type {
  CommsPlanAudienceSegmentListItem,
  CommunicationPlanEngagementSummary,
} from "../contact-engagement/dto";

/** Serializable user chip for workbench DTOs. */
export type CommunicationUserSummary = {
  id: string;
  nameLabel: string | null;
  email: string;
};

/** One provenance link; order in `CommunicationSourceSummary.all` is stable (intake → task → event → social). */
export type CommunicationSourceRef = {
  kind: "WORKFLOW_INTAKE" | "CAMPAIGN_TASK" | "CAMPAIGN_EVENT" | "SOCIAL_CONTENT";
  id: string;
  sourceLabel: string;
  sourceSubtitle: string | null;
};

export type CommunicationSourceSummary = {
  /** Plan `sourceType` string when set (e.g. INTAKE). */
  sourceType: string | null;
  /** First available source in provenance order; convenience for list UIs. */
  primary: CommunicationSourceRef | null;
  /** All linked sources (non-null FKs). */
  all: CommunicationSourceRef[];
};

export type CommunicationReviewSummary = {
  hasDraftsReadyForReview: boolean;
  approvedDraftCount: number;
  rejectedDraftCount: number;
  hasVariantsReadyForReview: boolean;
  approvedVariantCount: number;
  rejectedVariantCount: number;
  /** Max over drafts and variants; ISO string. */
  latestReviewRequestedAt: string | null;
  /** Max over drafts and variants; ISO string. */
  latestReviewedAt: string | null;
};

/** Rollup over `CommunicationSend` rows for a plan. */
export type CommunicationSendSummary = {
  sendCount: number;
  queuedCount: number;
  scheduledCount: number;
  sendingCount: number;
  sentCount: number;
  partiallySentCount: number;
  failedCount: number;
  canceledCount: number;
  draftSendCount: number;
  /** Earliest future `scheduledAt` among pending-ish sends; ISO. */
  nextScheduledAt: string | null;
  /** Latest `sentAt` set; ISO. */
  lastSentAt: string | null;
};

/**
 * A derivative of a `CommunicationDraft` for a targeting context (audience, channel, copy alt).
 * Override fields: when null, UI/read layers fall back to the base draft; no merge engine in Packet 6.
 */
export type CommunicationVariantListItem = {
  id: string;
  communicationDraftId: string;
  variantType: CommunicationVariantType;
  targetSegmentId: string | null;
  targetSegmentLabel: string | null;
  channelOverride: CommsWorkbenchChannel | null;
  subjectLineOverride: string | null;
  bodyCopyOverride: string | null;
  ctaOverride: string | null;
  status: CommunicationVariantStatus;
  reviewRequestedAt: string | null;
  reviewRequestedBy: CommunicationUserSummary | null;
  reviewedAt: string | null;
  reviewedBy: CommunicationUserSummary | null;
  reviewDecision: CommunicationReviewDecision | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommunicationDraftListItem = {
  id: string;
  communicationPlanId: string;
  channel: CommsWorkbenchChannel;
  title: string | null;
  status: CommunicationDraftStatus;
  isPrimary: boolean;
  messageToneMode: SocialMessageToneMode | null;
  messageTacticMode: SocialMessageTacticMode | null;
  createdBy: CommunicationUserSummary | null;
  updatedBy: CommunicationUserSummary | null;
  reviewRequestedAt: string | null;
  reviewedAt: string | null;
  reviewDecision: CommunicationReviewDecision | null;
  createdAt: string;
  updatedAt: string;
  variantCount: number;
};

/** Classified last failure for operator retry (Packet 12A). */
export type CommsSendRetryCategory =
  | "PROVIDER_TRANSIENT"
  | "WEBHOOK_PENDING_TIMEOUT"
  | "MISSING_RECIPIENT"
  | "SOURCE_NOT_APPROVED"
  | "CHANNEL_NOT_EXECUTABLE"
  | "PROVIDER_PERMANENT"
  | "UNKNOWN";

/** Derived state for list/detail UI and retry action gating. */
export type CommsSendOperatorRetryView = {
  retryCount: number;
  retryLimit: number;
  canRetry: boolean;
  lastFailureCategory: CommsSendRetryCategory;
  retryCategory: CommsSendRetryCategory;
  retryReason: string;
  retryBlockedReason: string;
  lastRetryAt: string | null;
  lastRetryBy: CommunicationUserSummary | null;
  requiresOperatorReview: boolean;
  nextRetryStatus: "QUEUED" | null;
};

export type CommunicationSendListItem = {
  id: string;
  communicationPlanId: string;
  communicationDraftId: string;
  communicationVariantId: string | null;
  channel: CommsWorkbenchChannel;
  sendType: CommunicationSendType | null;
  targetSegmentId: string | null;
  status: CommunicationSendStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  completedAt: string | null;
  sentBy: CommunicationUserSummary | null;
  createdAt: string;
  updatedAt: string;
  /** The approved asset the send is planned from. */
  sourceKind: "draft" | "variant";
  /** Base draft title (always present for context). */
  draftTitle: string | null;
  /** Present when this send targets a variant. */
  variantLabel: string | null;
  /** When the send was marked ready for execution (Packet 9). */
  queuedAt: string | null;
  /** Operator who last queued; null if never queued. */
  queuedBy: CommunicationUserSummary | null;
  /** Set after successful provider call (SendGrid / Twilio). */
  providerMessageId: string | null;
  /** Normalized execution + webhook reconciliation (Packet 10). */
  outcomeSummaryJson: unknown;
  /** Operator re-queue attempts after FAILED (not counting the first run). */
  retryCount: number;
  lastRetriedAt: string | null;
  lastRetriedBy: CommunicationUserSummary | null;
  /** Centralized retry gating and display (Packet 12A). */
  operatorRetry: CommsSendOperatorRetryView;
};

/** List row for plan index / workbench queue. */
export type CommunicationPlanListItem = {
  id: string;
  title: string;
  objective: CommunicationObjective;
  status: CommunicationPlanStatus;
  priority: CampaignTaskPriority;
  summary: string | null;
  source: CommunicationSourceSummary;
  owner: CommunicationUserSummary | null;
  requester: CommunicationUserSummary | null;
  linkedEventTitle: string | null;
  linkedEventId: string | null;
  draftCount: number;
  variantCount: number;
  sendCount: number;
  review: CommunicationReviewSummary;
  sendRollup: Pick<
    CommunicationSendSummary,
    | "nextScheduledAt"
    | "lastSentAt"
    | "sendCount"
    | "failedCount"
    | "scheduledCount"
    | "queuedCount"
    | "sendingCount"
    | "sentCount"
  >;
  channelsOnPlan: CommsWorkbenchChannel[];
  needsAction: boolean;
  dueAt: string | null;
  scheduledAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommunicationDraftDetail = CommunicationDraftListItem & {
  subjectLine: string | null;
  previewText: string | null;
  bodyCopy: string;
  shortCopy: string | null;
  ctaType: string | null;
  reviewNotes: string | null;
  reviewRequestedBy: CommunicationUserSummary | null;
  reviewedBy: CommunicationUserSummary | null;
  variants: CommunicationVariantListItem[];
};

/** Per-plan execution health (Packet 11A), derived from sends + outcomeSummaryJson. */
export type CommunicationPlanRecentSendOutcome = {
  sendId: string;
  status: CommunicationSendStatus;
  channel: CommsWorkbenchChannel;
  updatedAt: string;
  /** Normalized one-line; never raw JSON. */
  outcomeLabel: string;
};

export type CommunicationPlanExecutionSummary = {
  totalSends: number;
  byStatus: Partial<Record<CommunicationSendStatus, number>>;
  queuedCount: number;
  sendingCount: number;
  sentCount: number;
  partiallySentCount: number;
  failedCount: number;
  scheduledCount: number;
  canceledCount: number;
  draftSendCount: number;
  /** Latest of sentAt / completedAt / execution-related activity. */
  lastExecutionAt: string | null;
  lastFailureAt: string | null;
  lastQueuedAt: string | null;
  lastSendingAt: string | null;
  lastSentAt: string | null;
  latestFailureSummary: string | null;
  latestProviderStatus: string | null;
  recentSendOutcomes: CommunicationPlanRecentSendOutcome[];
};

/**
 * Small derived flags for plan detail + sends panel (Hardening pass 2).
 * Avoids duplicating “can create send / needs review” logic across client components.
 */
export type CommunicationPlanOpsSummary = {
  approvedDraftCount: number;
  approvedVariantCount: number;
  hasApprovedAssetForSend: boolean;
  needsReviewAttention: boolean;
  hasExecutionFailures: boolean;
  /** Sends in `QUEUED` (eligible for “run next” / execution). */
  queuedSendCount: number;
  /** At least one draft or variant row exists but none are approved. */
  hasDraftOrVariantWorkButNoApprovedSendSource: boolean;
  /** FAILED sends that are allowed to be re-queued by policy. */
  failedSendOperatorRetryableCount: number;
  /** FAILED sends that already reached the max operator retry count. */
  failedSendOperatorRetriesExhaustedCount: number;
};

export type CommunicationPlanDetail = {
  id: string;
  title: string;
  objective: CommunicationObjective;
  status: CommunicationPlanStatus;
  priority: CampaignTaskPriority;
  summary: string | null;
  sourceType: string | null;
  source: CommunicationSourceSummary;
  owner: CommunicationUserSummary | null;
  requester: CommunicationUserSummary | null;
  dueAt: string | null;
  scheduledAt: string | null;
  approvedAt: string | null;
  metadataJson: unknown;
  createdAt: string;
  updatedAt: string;
  review: CommunicationReviewSummary;
  sendSummary: CommunicationSendSummary;
  executionSummary: CommunicationPlanExecutionSummary;
  /** Operator affordances: approved assets, review queue, execution failures, queued work. */
  opsSummary: CommunicationPlanOpsSummary;
  draftCount: number;
  variantCount: number;
  drafts: CommunicationDraftDetail[];
  sends: CommunicationSendListItem[];
  mediaOutreach: MediaOutreachListItem[];
  /** CE-2: per-plan recipient + event rollups (empty plans yield zeros; no extra round-trip for callers of plan detail). */
  planEngagementSummary: CommunicationPlanEngagementSummary;
  /** CE-4: plan-scoped audience segments (composable groups; not broadcast `AudienceSegment`). */
  audienceSegments: CommsPlanAudienceSegmentListItem[];
};

export type CommsWorkbenchStatusCounts = {
  byStatus: Partial<Record<CommunicationPlanStatus, number>>;
  total: number;
};

/** Channel-level send stats for workbench delivery intelligence (compact). */
export type CommsExecutionChannelStat = {
  channel: CommsWorkbenchChannel;
  sentCount: number;
  failedCount: number;
  queuedCount: number;
  sendingCount: number;
};

export type CommsPlanExecutionAttentionRow = {
  planId: string;
  planTitle: string;
  planStatus: CommunicationPlanStatus;
  objective: CommunicationObjective;
  failedCount: number;
  queuedCount: number;
  sendingCount: number;
  updatedAt: string;
};

export type CommunicationFailedSendListItem = {
  id: string;
  communicationPlanId: string;
  planTitle: string;
  channel: CommsWorkbenchChannel;
  sourceKind: "draft" | "variant";
  providerMessageId: string | null;
  failureReason: string;
  status: CommunicationSendStatus;
  updatedAt: string;
  provider: CommsSendProvider | null;
};

export type CommunicationExecutionActivityListItem = {
  sendId: string;
  communicationPlanId: string;
  planTitle: string;
  channel: CommsWorkbenchChannel;
  sourceKind: "draft" | "variant";
  status: CommunicationSendStatus;
  /** Short context, e.g. status + optional outcome line. */
  activityLabel: string;
  updatedAt: string;
};

export type CommsExecutionDashboardData = {
  totalPlannedSends: number;
  queuedCount: number;
  sendingCount: number;
  sentCount: number;
  partiallySentCount: number;
  failedCount: number;
  scheduledCount: number;
  canceledCount: number;
  draftSendCount: number;
  plansWithFailuresCount: number;
  plansWithQueuedSendsCount: number;
  /** Distinct plans with at least one send in QUEUED or SENDING. */
  plansWithActiveExecutionCount: number;
  /** FAILED + policy allows operator retry re-queue (scanned across all current failures). */
  failedSendOperatorRetryableCount: number;
  /** FAILED + `retryCount` >= limit (operator retries exhausted for this send row). */
  failedSendOperatorRetriesExhaustedCount: number;
  recentExecutionActivity: CommunicationExecutionActivityListItem[];
  recentFailedSends: CommunicationFailedSendListItem[];
  channelBreakdown: CommsExecutionChannelStat[];
  /** Plans with failures or in-flight execution — attention queue. */
  recentPlanExecutionRows: CommsPlanExecutionAttentionRow[];
};

export type CommsWorkbenchDashboardData = {
  plansNeedingAction: CommunicationPlanListItem[];
  plansReadyForReview: CommunicationPlanListItem[];
  scheduledSoon: CommunicationPlanListItem[];
  activeRapidResponsePlans: CommunicationPlanListItem[];
  activeVolunteerRecruitmentPlans: CommunicationPlanListItem[];
  recentMediaOutreachFollowupsDue: MediaOutreachListItem[];
  newestUpdatedPlanRows: CommunicationPlanListItem[];
  statusCounts: CommsWorkbenchStatusCounts;
  execution: CommsExecutionDashboardData;
};

export type MediaOutreachListItem = {
  id: string;
  title: string;
  type: MediaOutreachItemType;
  status: MediaOutreachStatus;
  urgency: ConversationUrgency | null;
  contactName: string | null;
  outletName: string | null;
  linkedPlanTitle: string | null;
  linkedPlanId: string | null;
  linkedIntakeTitle: string | null;
  linkedIntakeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaOutreachDetail = MediaOutreachListItem & {
  notes: string | null;
  metadataJson: unknown;
  linkedCommunicationPlan: Pick<CommunicationPlanListItem, "id" | "title" | "status" | "objective"> | null;
  linkedWorkflowIntake: {
    id: string;
    title: string | null;
    status: WorkflowIntakeStatus;
  } | null;
  linkedConversationOpportunity: { id: string; title: string } | null;
};

/** Internal: rich source rows for mapper (subset of Prisma includes). */
export type PlanSourceShape = {
  sourceWorkflowIntake: {
    id: string;
    title: string | null;
    status: WorkflowIntakeStatus;
    source: string | null;
  } | null;
  sourceCampaignTask: {
    id: string;
    title: string;
    status: CampaignTaskStatus;
  } | null;
  sourceEvent: {
    id: string;
    title: string;
    slug: string;
    status: CampaignEventStatus;
    eventType: CampaignEventType;
    startAt: Date;
  } | null;
  sourceSocialContentItem: {
    id: string;
    title: string | null;
    kind: SocialContentKind;
    status: SocialContentStatus;
  } | null;
};
