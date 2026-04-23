import type {
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
  SocialContentKind,
  SocialContentStatus,
  SocialMessageTacticMode,
  SocialMessageToneMode,
  SocialPerformanceDataSource,
  SocialPlatform,
  SocialSentimentType,
  SocialStrategicFollowupType,
  SocialVariantStatus,
} from "@prisma/client";
import type { MediaRefListItem } from "@/lib/media-library/dto";

/** Serializable list row for the workbench left queue. */
export type SocialWorkbenchListItem = {
  id: string;
  title: string | null;
  kind: SocialContentKind;
  status: SocialContentStatus;
  updatedAt: string;
  workflowIntakeTitle: string | null;
  campaignEventTitle: string | null;
  variantCount: number;
  taskCount: number;
};

export type SocialAccountOption = {
  id: string;
  label: string;
  handle: string | null;
  platform: SocialPlatform;
};

export type SocialPlatformVariantDetail = {
  id: string;
  platform: SocialPlatform;
  socialAccountId: string | null;
  copyText: string | null;
  status: SocialVariantStatus;
  scheduledAt: string | null;
  accountLabel: string | null;
  accountHandle: string | null;
};

export type WorkbenchTaskRow = {
  id: string;
  title: string;
  status: CampaignTaskStatus;
  taskType: CampaignTaskType;
  priority: CampaignTaskPriority;
  dueAt: string | null;
  assigneeName: string | null;
  assigneeId: string | null;
  updatedAt: string;
};

/** Author Studio–saved compose text (`SocialContentDraft`) for a work item. */
export type SocialContentDraftListItem = {
  id: string;
  socialContentItemId: string;
  title: string | null;
  sourceRoute: string | null;
  sourceIntent: string | null;
  bodyCopy: string;
  createdByUserId: string | null;
  createdByName: string | null;
  createdByEmail: string | null;
  createdAt: string;
  updatedAt: string;
  isApplied: boolean;
};

/** One `SocialPerformanceSnapshot` row, JSON-safe for the workbench. */
export type SocialPerformanceSnapshotDto = {
  id: string;
  periodStart: string;
  periodEnd: string;
  socialPlatformVariantId: string | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clickThroughs: number | null;
  clickThroughRate: number | null;
  videoCompletionRate: number | null;
  engagementQualityScore: number | null;
  dominantSentiment: SocialSentimentType | null;
  sentimentBreakdown: Record<string, number> | null;
  conversionCampaignEventId: string | null;
  conversionEventTitle: string | null;
  volunteerLeadCount: number | null;
  dataSource: SocialPerformanceDataSource;
  notes: string | null;
};

export type SocialStrategicInsightDto = {
  timingInsight: string | null;
  tonePerformance: string | null;
  retentionSignal: string | null;
  conversionSignal: string | null;
  aiCommentClassifyStub: string | null;
  aiSummarizePerformanceStub: string | null;
  aiSuggestImprovementsStub: string | null;
  lastAiRunAt: string | null;
  updatedAt: string;
  /** Structured, campaign-safe recommendations (see `upsert` + heuristics). */
  recommendedNextTone: SocialMessageToneMode | null;
  recommendedBestWindow: string | null;
  recommendedFollowupType: SocialStrategicFollowupType;
  recommendedCountyFocus: string | null;
  recommendedCtaType: string | null;
  confidenceScore: number | null;
};

/** Full detail for the selected work item. */
export type SocialContentWorkbenchDetail = {
  id: string;
  title: string | null;
  bodyCopy: string | null;
  kind: SocialContentKind;
  status: SocialContentStatus;
  messageToneMode: SocialMessageToneMode | null;
  messageTacticMode: SocialMessageTacticMode | null;
  createdAt: string;
  updatedAt: string;
  workflowIntakeId: string | null;
  campaignEventId: string | null;
  workflowIntakeTitle: string | null;
  campaignEventTitle: string | null;
  platformVariants: SocialPlatformVariantDetail[];
  tasks: WorkbenchTaskRow[];
  performanceSnapshots: SocialPerformanceSnapshotDto[];
  strategicInsight: SocialStrategicInsightDto | null;
  /** `OwnedMediaAsset` ↔ work item via `SocialContentMediaRef` (authoritative link layer). */
  mediaRefs: MediaRefListItem[];
  /** Saved Author Studio drafts (most recent first). */
  drafts: SocialContentDraftListItem[];
};

/** Drives the Social Workbench right-rail (real selected work item state, not mock engagement). */
export type WorkbenchOperationalSnapshot = {
  socialContentItemId: string;
  title: string | null;
  kindLabel: string;
  /** Raw `SocialContentStatus` for client checks (the queue uses enum values). */
  status: SocialContentStatus;
  statusLabel: string;
  variantCount: number;
  taskCount: number;
  tasksOpen: number;
  variantsScheduled: number;
  hasBodyCopy: boolean;
  campaignEventId: string | null;
  campaignEventTitle: string | null;
  workflowIntakeId: string | null;
  workflowIntakeTitle: string | null;
  /** High-level publish-readiness; driven by work item + variant + task heuristics. */
  readinessChecklist: { id: string; label: string; done: boolean }[];
};
