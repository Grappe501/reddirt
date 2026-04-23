import { SocialContentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getMediaRefsForSocialContentItem } from "@/lib/media-library/queries";
import type {
  SocialContentWorkbenchDetail,
  SocialPerformanceSnapshotDto,
  SocialStrategicInsightDto,
  SocialWorkbenchListItem,
} from "./social-workbench-dto";

function parseSentimentBreakdown(json: Prisma.JsonValue | null | undefined): Record<string, number> | null {
  if (json == null || typeof json !== "object" || Array.isArray(json)) return null;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
    if (typeof v === "number" && !Number.isNaN(v)) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

const socialListInclude = {
  workflowIntake: { select: { id: true, status: true, title: true } },
  campaignEvent: { select: { id: true, title: true, startAt: true, slug: true } },
  _count: { select: { platformVariants: true, tasks: true } },
} as const;

export type SocialContentListRow = Prisma.SocialContentItemGetPayload<{ include: typeof socialListInclude }>;

export type SocialWorkbenchSummary = {
  /** Not yet terminal (published / archived / cancelled). */
  inPipeline: number;
  inReview: number;
  published: number;
};

export async function getSocialWorkbenchSummary(): Promise<SocialWorkbenchSummary> {
  try {
    const [inPipeline, inReview, published] = await Promise.all([
      prisma.socialContentItem.count({
        where: {
          status: {
            notIn: [SocialContentStatus.PUBLISHED, SocialContentStatus.ARCHIVED, SocialContentStatus.CANCELLED],
          },
        },
      }),
      prisma.socialContentItem.count({ where: { status: SocialContentStatus.IN_REVIEW } }),
      prisma.socialContentItem.count({ where: { status: SocialContentStatus.PUBLISHED } }),
    ]);
    return { inPipeline, inReview, published };
  } catch {
    return { inPipeline: 0, inReview: 0, published: 0 };
  }
}

export async function listRecentSocialContentItems(take: number): Promise<SocialContentListRow[]> {
  try {
    return prisma.socialContentItem.findMany({
      orderBy: { updatedAt: "desc" },
      take: Math.min(Math.max(take, 1), 100),
      include: socialListInclude,
    });
  } catch {
    return [];
  }
}

export async function listSocialAccountsActive() {
  try {
    return prisma.socialAccount.findMany({
      where: { isActive: true },
      orderBy: [{ platform: "asc" }, { label: "asc" }],
      select: { id: true, label: true, handle: true, platform: true },
    });
  } catch {
    return [];
  }
}

const workbenchDetailInclude = {
  workflowIntake: { select: { id: true, title: true } },
  campaignEvent: { select: { id: true, title: true } },
  platformVariants: {
    orderBy: [{ platform: "asc" as const }, { id: "asc" as const }],
    include: {
      socialAccount: { select: { id: true, label: true, handle: true, platform: true } },
    },
  },
  tasks: {
    orderBy: { updatedAt: "desc" as const },
    take: 100,
    include: { assignee: { select: { id: true, name: true, email: true } } },
  },
  performanceSnapshots: {
    orderBy: [{ periodEnd: "desc" as const }, { id: "desc" as const }],
    take: 12,
    include: {
      conversionCampaignEvent: { select: { id: true, title: true } },
    },
  },
  strategicInsight: true,
  drafts: {
    orderBy: { createdAt: "desc" as const },
    take: 50,
    include: { createdByUser: { select: { name: true, email: true } } },
  },
};

export type SocialContentWorkbenchRow = Prisma.SocialContentItemGetPayload<{ include: typeof workbenchDetailInclude }>;

export function socialListRowToWorkbenchItem(row: SocialContentListRow): SocialWorkbenchListItem {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
    workflowIntakeTitle: row.workflowIntake?.title ?? null,
    campaignEventTitle: row.campaignEvent?.title ?? null,
    variantCount: row._count.platformVariants,
    taskCount: row._count.tasks,
  };
}

function serializeStrategicInsight(row: SocialContentWorkbenchRow["strategicInsight"]): SocialStrategicInsightDto | null {
  if (!row) return null;
  return {
    timingInsight: row.timingInsight,
    tonePerformance: row.tonePerformance,
    retentionSignal: row.retentionSignal,
    conversionSignal: row.conversionSignal,
    aiCommentClassifyStub: row.aiCommentClassifyStub,
    aiSummarizePerformanceStub: row.aiSummarizePerformanceStub,
    aiSuggestImprovementsStub: row.aiSuggestImprovementsStub,
    lastAiRunAt: row.lastAiRunAt ? row.lastAiRunAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
    recommendedNextTone: row.recommendedNextTone,
    recommendedBestWindow: row.recommendedBestWindow,
    recommendedFollowupType: row.recommendedFollowupType,
    recommendedCountyFocus: row.recommendedCountyFocus,
    recommendedCtaType: row.recommendedCtaType,
    confidenceScore: row.confidenceScore,
  };
}

function serializeSnapshot(s: {
  id: string;
  periodStart: Date;
  periodEnd: Date;
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
  dominantSentiment: SocialPerformanceSnapshotDto["dominantSentiment"];
  sentimentBreakdownJson: Prisma.JsonValue | null;
  conversionCampaignEventId: string | null;
  volunteerLeadCount: number | null;
  dataSource: SocialPerformanceSnapshotDto["dataSource"];
  notes: string | null;
  conversionCampaignEvent: { id: string; title: string } | null;
}): SocialPerformanceSnapshotDto {
  return {
    id: s.id,
    periodStart: s.periodStart.toISOString(),
    periodEnd: s.periodEnd.toISOString(),
    socialPlatformVariantId: s.socialPlatformVariantId,
    impressions: s.impressions,
    likes: s.likes,
    comments: s.comments,
    shares: s.shares,
    saves: s.saves,
    clickThroughs: s.clickThroughs,
    clickThroughRate: s.clickThroughRate,
    videoCompletionRate: s.videoCompletionRate,
    engagementQualityScore: s.engagementQualityScore,
    dominantSentiment: s.dominantSentiment,
    sentimentBreakdown: parseSentimentBreakdown(s.sentimentBreakdownJson),
    conversionCampaignEventId: s.conversionCampaignEventId,
    conversionEventTitle: s.conversionCampaignEvent?.title ?? null,
    volunteerLeadCount: s.volunteerLeadCount,
    dataSource: s.dataSource,
    notes: s.notes,
  };
}

/** Draft rows from `workbenchDetailInclude.drafts` (relation name `drafts` on `SocialContentItem`). */
type WorkbenchDraftRow = {
  id: string;
  socialContentItemId: string;
  title: string | null;
  sourceRoute: string | null;
  sourceIntent: string | null;
  bodyCopy: string;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  isApplied: boolean;
  createdByUser: { name: string | null; email: string | null } | null;
};

function serializeDetail(row: SocialContentWorkbenchRow): Omit<SocialContentWorkbenchDetail, "mediaRefs"> {
  const draftRows = (row as unknown as { drafts?: WorkbenchDraftRow[] }).drafts ?? [];
  return {
    id: row.id,
    title: row.title,
    bodyCopy: row.bodyCopy,
    kind: row.kind,
    status: row.status,
    messageToneMode: row.messageToneMode,
    messageTacticMode: row.messageTacticMode,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    workflowIntakeId: row.workflowIntakeId,
    campaignEventId: row.campaignEventId,
    workflowIntakeTitle: row.workflowIntake?.title ?? null,
    campaignEventTitle: row.campaignEvent?.title ?? null,
    drafts: draftRows.map((d) => ({
      id: d.id,
      socialContentItemId: d.socialContentItemId,
      title: d.title,
      sourceRoute: d.sourceRoute,
      sourceIntent: d.sourceIntent,
      bodyCopy: d.bodyCopy,
      createdByUserId: d.createdByUserId,
      createdByName: d.createdByUser?.name ?? null,
      createdByEmail: d.createdByUser?.email ?? null,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      isApplied: d.isApplied,
    })),
    platformVariants: row.platformVariants.map((v) => ({
      id: v.id,
      platform: v.platform,
      socialAccountId: v.socialAccountId,
      copyText: v.copyText,
      status: v.status,
      scheduledAt: v.scheduledAt ? v.scheduledAt.toISOString() : null,
      accountLabel: v.socialAccount?.label ?? null,
      accountHandle: v.socialAccount?.handle ?? null,
    })),
    tasks: row.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      taskType: t.taskType,
      priority: t.priority,
      dueAt: t.dueAt ? t.dueAt.toISOString() : null,
      assigneeName: t.assignee?.name ?? t.assignee?.email ?? null,
      assigneeId: t.assignedUserId,
      updatedAt: t.updatedAt.toISOString(),
    })),
    performanceSnapshots: (row.performanceSnapshots ?? []).map((s) => serializeSnapshot(s)),
    strategicInsight: serializeStrategicInsight(row.strategicInsight),
  };
}

/**
 * One selected-item payload for the Social Workbench (queue detail pane + studio binding).
 */
export async function getSocialContentWorkbenchDetail(id: string): Promise<SocialContentWorkbenchDetail | null> {
  if (!id) return null;
  try {
    const row = await prisma.socialContentItem.findUnique({
      where: { id },
      include: workbenchDetailInclude,
    });
    if (!row) return null;
    const mediaRefs = await getMediaRefsForSocialContentItem(id);
    return { ...serializeDetail(row), mediaRefs };
  } catch {
    return null;
  }
}
