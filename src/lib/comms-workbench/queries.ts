import type { Prisma } from "@prisma/client";
import {
  CommunicationObjective,
  CommunicationPlanStatus,
  CommunicationSendStatus,
  CommsWorkbenchChannel,
  MediaOutreachStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  CommunicationPlanDetail,
  CommunicationPlanListItem,
  CommunicationExecutionActivityListItem,
  CommunicationFailedSendListItem,
  CommsExecutionChannelStat,
  CommsExecutionDashboardData,
  CommsPlanExecutionAttentionRow,
  CommsWorkbenchDashboardData,
  CommsWorkbenchStatusCounts,
  MediaOutreachDetail,
  MediaOutreachListItem,
} from "./dto";
import {
  buildCommunicationPlanExecutionSummary,
  buildCommunicationPlanOpsSummary,
  buildCommunicationReviewSummary,
  buildCommunicationSendSummary,
  mapCommunicationDraftDetail,
  mapCommunicationPlanListItem,
  mapCommunicationSendListItem,
  mapCommunicationSourceSummary,
  mapCommunicationUserSummary,
  type PlanListRowShape,
} from "./mappers";
import { formatCommsFailureReasonSummary, formatCommsOutcomeSummaryLine, parseCommsOutcomeDisplay } from "./outcome-display";
import { formatCommsFieldLabel } from "./ui-labels";
import { COMMS_WORKBENCH_CHANNELS } from "./constants";
import { getCommunicationPlanEngagementSummary, listCommsPlanAudienceSegments } from "../contact-engagement/queries";
import type { CommunicationPlanListQuery, CommsExecutionRecentSendsListQuery, MediaOutreachListQuery } from "./types";

export type {
  CommunicationPlanDetail,
  CommunicationPlanListItem,
  CommsExecutionDashboardData,
  CommsWorkbenchDashboardData,
  MediaOutreachDetail,
  MediaOutreachListItem,
} from "./dto";
export type {
  CommunicationPlanListQuery,
  CommsExecutionRecentSendsListQuery,
  MediaOutreachListFilters,
  MediaOutreachListQuery,
} from "./types";

const userSelect = { id: true, name: true, email: true } as const;

const commsSendListInclude = {
  sentByUser: { select: userSelect },
  queuedByUser: { select: userSelect },
  lastRetriedByUser: { select: userSelect },
  plan: { select: { id: true, title: true } },
  draft: { select: { id: true, title: true, channel: true, status: true } },
  variant: { select: { id: true, targetSegmentLabel: true, status: true, channelOverride: true } },
} as const;

const planListInclude = {
  ownerUser: { select: userSelect },
  requestedByUser: { select: userSelect },
  sourceWorkflowIntake: { select: { id: true, title: true, status: true, source: true } },
  sourceCampaignTask: { select: { id: true, title: true, status: true } },
  sourceEvent: { select: { id: true, title: true, slug: true, startAt: true, status: true, eventType: true } },
  sourceSocialContentItem: { select: { id: true, title: true, kind: true, status: true } },
  _count: { select: { drafts: true, sends: true } },
  drafts: {
    select: {
      channel: true,
      status: true,
      reviewRequestedAt: true,
      reviewedAt: true,
      reviewDecision: true,
      _count: { select: { variants: true } },
      variants: {
        select: {
          status: true,
          reviewRequestedAt: true,
          reviewedAt: true,
          reviewDecision: true,
        },
      },
    },
  },
  sends: {
    select: {
      channel: true,
      scheduledAt: true,
      sentAt: true,
      status: true,
    },
  },
};

function buildPlanWhere(f: CommunicationPlanListQuery): Prisma.CommunicationPlanWhereInput {
  const ands: Prisma.CommunicationPlanWhereInput[] = [];

  if (f.status) {
    ands.push({
      status: Array.isArray(f.status) ? { in: f.status } : f.status,
    });
  }
  if (f.objective) {
    ands.push({
      objective: Array.isArray(f.objective) ? { in: f.objective } : f.objective,
    });
  }
  if (f.ownerUserId) ands.push({ ownerUserId: f.ownerUserId });
  if (f.requestedByUserId) ands.push({ requestedByUserId: f.requestedByUserId });
  if (f.sourceWorkflowIntakeId) ands.push({ sourceWorkflowIntakeId: f.sourceWorkflowIntakeId });
  if (f.sourceCampaignTaskId) ands.push({ sourceCampaignTaskId: f.sourceCampaignTaskId });
  if (f.sourceEventId) ands.push({ sourceEventId: f.sourceEventId });
  if (f.sourceSocialContentItemId) ands.push({ sourceSocialContentItemId: f.sourceSocialContentItemId });

  if (f.scheduledFrom != null || f.scheduledTo != null) {
    ands.push({
      scheduledAt: {
        ...(f.scheduledFrom != null ? { gte: f.scheduledFrom } : {}),
        ...(f.scheduledTo != null ? { lte: f.scheduledTo } : {}),
      },
    });
  }

  if (f.channel) {
    ands.push({
      OR: [
        { drafts: { some: { channel: f.channel } } },
        { sends: { some: { channel: f.channel } } },
      ],
    });
  }

  if (f.search?.trim()) {
    const q = f.search.trim();
    ands.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (f.needsAction) {
    ands.push({
      OR: [
        {
          status: {
            in: [CommunicationPlanStatus.DRAFT, CommunicationPlanStatus.PLANNING, CommunicationPlanStatus.READY_FOR_REVIEW],
          },
        },
        { drafts: { some: { status: "READY_FOR_REVIEW" } } },
        {
          drafts: {
            some: { variants: { some: { OR: [{ status: "READY_FOR_REVIEW" }, { status: "READY" }] } } },
          },
        },
        { sends: { some: { status: "FAILED" } } },
      ],
    });
  }

  if (ands.length === 0) return {};
  if (ands.length === 1) return ands[0] as Prisma.CommunicationPlanWhereInput;
  return { AND: ands };
}

/**
 * Filtered, denormalized plan rows for workbench list views.
 */
export async function listCommunicationPlans(
  options: CommunicationPlanListQuery = {}
): Promise<CommunicationPlanListItem[]> {
  const take = Math.min(Math.max(options.take ?? 40, 1), 200);
  const skip = Math.max(options.skip ?? 0, 0);
  const orderByField = options.orderByField ?? "updatedAt";
  const orderDirection = options.orderDirection ?? "desc";

  const where = buildPlanWhere(options);

  const rows = await prisma.communicationPlan.findMany({
    where,
    take,
    skip,
    orderBy: { [orderByField]: orderDirection },
    include: planListInclude,
  });

  return rows.map((r) => mapCommunicationPlanListItem(r as unknown as PlanListRowShape));
}

const planDetailInclude = {
  ownerUser: { select: userSelect },
  requestedByUser: { select: userSelect },
  sourceWorkflowIntake: { select: { id: true, title: true, status: true, source: true } },
  sourceCampaignTask: { select: { id: true, title: true, status: true } },
  sourceEvent: { select: { id: true, title: true, slug: true, startAt: true, status: true, eventType: true } },
  sourceSocialContentItem: { select: { id: true, title: true, kind: true, status: true } },
  drafts: {
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
    include: {
      createdByUser: { select: userSelect },
      updatedByUser: { select: userSelect },
      reviewRequestedByUser: { select: userSelect },
      reviewedByUser: { select: userSelect },
      variants: {
        orderBy: { createdAt: "asc" as const },
        include: {
          reviewRequestedByUser: { select: userSelect },
          reviewedByUser: { select: userSelect },
        },
      },
      _count: { select: { variants: true } },
    },
  },
  sends: {
    orderBy: { createdAt: "desc" as const },
    include: {
      sentByUser: { select: userSelect },
      queuedByUser: { select: userSelect },
      lastRetriedByUser: { select: userSelect },
      draft: { select: { id: true, title: true, channel: true, status: true } },
      variant: { select: { id: true, targetSegmentLabel: true, status: true, channelOverride: true } },
    },
  },
  mediaOutreachItems: {
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      linkedWorkflowIntake: { select: { id: true, title: true, status: true } },
    },
  },
} satisfies Prisma.CommunicationPlanInclude;

type PlanDetailRow = Prisma.CommunicationPlanGetPayload<{ include: typeof planDetailInclude }>;

function mapMediaItemForPlanContext(
  m: PlanDetailRow["mediaOutreachItems"][0],
  planTitle: string,
  planId: string
): MediaOutreachListItem {
  return {
    id: m.id,
    title: m.title,
    type: m.type,
    status: m.status,
    urgency: m.urgency,
    contactName: m.contactName,
    outletName: m.outletName,
    linkedPlanTitle: planTitle,
    linkedPlanId: planId,
    linkedIntakeTitle: m.linkedWorkflowIntake?.title ?? null,
    linkedIntakeId: m.linkedWorkflowIntake?.id ?? null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

/**
 * Full plan DTO for a future detail page (stitched plan + drafts + variants + sends + linked media rows).
 */
export async function getCommunicationPlanDetail(id: string): Promise<CommunicationPlanDetail | null> {
  const row = await prisma.communicationPlan.findUnique({
    where: { id },
    include: planDetailInclude,
  });
  if (!row) return null;

  const source = mapCommunicationSourceSummary(row.sourceType, row);
  const review = buildCommunicationReviewSummary(
    row.drafts,
    row.drafts.flatMap((d) => d.variants)
  );
  const sendSummary = buildCommunicationSendSummary(row.sends);
  const variantCount = row.drafts.reduce((acc, d) => acc + d._count.variants, 0);

  const drafts: CommunicationPlanDetail["drafts"] = row.drafts.map((d) =>
    mapCommunicationDraftDetail({
      id: d.id,
      communicationPlanId: d.communicationPlanId,
      channel: d.channel,
      title: d.title,
      subjectLine: d.subjectLine,
      previewText: d.previewText,
      bodyCopy: d.bodyCopy,
      shortCopy: d.shortCopy,
      messageToneMode: d.messageToneMode,
      messageTacticMode: d.messageTacticMode,
      ctaType: d.ctaType,
      status: d.status,
      isPrimary: d.isPrimary,
      reviewNotes: d.reviewNotes,
      reviewRequestedAt: d.reviewRequestedAt,
      reviewedAt: d.reviewedAt,
      reviewDecision: d.reviewDecision,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      createdByUser: d.createdByUser,
      updatedByUser: d.updatedByUser,
      reviewRequestedByUser: d.reviewRequestedByUser,
      reviewedByUser: d.reviewedByUser,
      variants: d.variants,
      _count: d._count,
    })
  );

  const sends = row.sends.map((s) => mapCommunicationSendListItem(s));
  const executionSummary = buildCommunicationPlanExecutionSummary(sends);
  const mediaOutreach = row.mediaOutreachItems.map((m) => mapMediaItemForPlanContext(m, row.title, row.id));
  const opsSummary = buildCommunicationPlanOpsSummary(drafts, review, sendSummary, sends);
  const [planEngagementSummary, audienceSegments] = await Promise.all([
    getCommunicationPlanEngagementSummary(row.id),
    listCommsPlanAudienceSegments(row.id),
  ]);

  return {
    id: row.id,
    title: row.title,
    objective: row.objective,
    status: row.status,
    priority: row.priority,
    summary: row.summary,
    sourceType: row.sourceType,
    source,
    owner: mapCommunicationUserSummary(row.ownerUser),
    requester: mapCommunicationUserSummary(row.requestedByUser),
    dueAt: row.dueAt?.toISOString() ?? null,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    metadataJson: row.metadataJson as unknown,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    review,
    sendSummary,
    executionSummary,
    opsSummary,
    draftCount: row.drafts.length,
    variantCount,
    drafts,
    sends,
    mediaOutreach,
    planEngagementSummary,
    audienceSegments,
  };
}

async function getCommsStatusCounts(): Promise<CommsWorkbenchStatusCounts> {
  const [grouped, total] = await Promise.all([
    prisma.communicationPlan.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.communicationPlan.count(),
  ]);
  const byStatus: CommsWorkbenchStatusCounts["byStatus"] = {};
  for (const g of grouped) {
    byStatus[g.status] = g._count._all;
  }
  return { byStatus, total };
}

const executionActivityStatuses: CommunicationSendStatus[] = [
  CommunicationSendStatus.QUEUED,
  CommunicationSendStatus.SENDING,
  CommunicationSendStatus.SENT,
  CommunicationSendStatus.PARTIALLY_SENT,
  CommunicationSendStatus.FAILED,
];

function emptyCommsExecutionDashboardData(): CommsExecutionDashboardData {
  return {
    totalPlannedSends: 0,
    queuedCount: 0,
    sendingCount: 0,
    sentCount: 0,
    partiallySentCount: 0,
    failedCount: 0,
    scheduledCount: 0,
    canceledCount: 0,
    draftSendCount: 0,
    plansWithFailuresCount: 0,
    plansWithQueuedSendsCount: 0,
    plansWithActiveExecutionCount: 0,
    failedSendOperatorRetryableCount: 0,
    failedSendOperatorRetriesExhaustedCount: 0,
    recentExecutionActivity: [],
    recentFailedSends: [],
    channelBreakdown: [],
    recentPlanExecutionRows: [],
  };
}

function countFromStatusMap(
  m: Map<CommunicationSendStatus, number>,
  s: CommunicationSendStatus
): number {
  return m.get(s) ?? 0;
}

function buildChannelBreakdownFromRows(
  rows: { channel: CommsWorkbenchChannel; status: CommunicationSendStatus; _count: { _all: number } }[]
): CommsExecutionChannelStat[] {
  const byChannel = new Map<string, CommsExecutionChannelStat>();
  for (const ch of COMMS_WORKBENCH_CHANNELS) {
    byChannel.set(ch, { channel: ch, sentCount: 0, failedCount: 0, queuedCount: 0, sendingCount: 0 });
  }
  for (const r of rows) {
    const cur = byChannel.get(r.channel);
    if (!cur) continue;
    const n = r._count._all;
    if (r.status === "SENT" || r.status === "PARTIALLY_SENT") cur.sentCount += n;
    if (r.status === "FAILED") cur.failedCount += n;
    if (r.status === "QUEUED") cur.queuedCount += n;
    if (r.status === "SENDING") cur.sendingCount += n;
  }
  return Array.from(byChannel.values()).filter(
    (c) => c.sentCount + c.failedCount + c.queuedCount + c.sendingCount > 0
  );
}

async function getRecentPlanExecutionAttentionRows(take: number): Promise<CommsPlanExecutionAttentionRow[]> {
  const rows = await prisma.communicationPlan.findMany({
    where: {
      OR: [
        { sends: { some: { status: CommunicationSendStatus.FAILED } } },
        { sends: { some: { status: { in: [CommunicationSendStatus.QUEUED, CommunicationSendStatus.SENDING] } } } },
      ],
    },
    take,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      objective: true,
      updatedAt: true,
      sends: { select: { status: true } },
    },
  });
  return rows.map((p) => {
    let failedCount = 0;
    let queuedCount = 0;
    let sendingCount = 0;
    for (const s of p.sends) {
      if (s.status === "FAILED") failedCount += 1;
      if (s.status === "QUEUED") queuedCount += 1;
      if (s.status === "SENDING") sendingCount += 1;
    }
    return {
      planId: p.id,
      planTitle: p.title,
      planStatus: p.status,
      objective: p.objective,
      failedCount,
      queuedCount,
      sendingCount,
      updatedAt: p.updatedAt.toISOString(),
    };
  });
}

/**
 * Rollups + recent send rows for the Comms delivery intelligence dashboard (Packet 11A).
 */
export async function getCommsExecutionDashboardData(): Promise<CommsExecutionDashboardData> {
  const totalPlannedSends = await prisma.communicationSend.count();
  if (totalPlannedSends === 0) return emptyCommsExecutionDashboardData();

  const [statusGroups, planFailGroup, planQueuedGroup, planActiveGroup, byChannelStatus, recentFailed, recentActivity, attention, allFailedSends] =
    await Promise.all([
      prisma.communicationSend.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.communicationSend.groupBy({
        by: ["communicationPlanId"],
        where: { status: CommunicationSendStatus.FAILED },
        _count: { _all: true },
      }),
      prisma.communicationSend.groupBy({
        by: ["communicationPlanId"],
        where: { status: CommunicationSendStatus.QUEUED },
        _count: { _all: true },
      }),
      prisma.communicationSend.groupBy({
        by: ["communicationPlanId"],
        where: { status: { in: [CommunicationSendStatus.QUEUED, CommunicationSendStatus.SENDING] } },
        _count: { _all: true },
      }),
      prisma.communicationSend.groupBy({
        by: ["channel", "status"],
        _count: { _all: true },
      }),
      listRecentFailedCommunicationSends({ take: 10 }),
      listRecentCommunicationExecutionActivity({ take: 12 }),
      getRecentPlanExecutionAttentionRows(8),
      prisma.communicationSend.findMany({
        where: { status: CommunicationSendStatus.FAILED },
        include: commsSendListInclude,
      }),
    ]);

  const st = new Map<CommunicationSendStatus, number>();
  for (const g of statusGroups) {
    st.set(g.status, g._count._all);
  }

  let failedSendOperatorRetryableCount = 0;
  let failedSendOperatorRetriesExhaustedCount = 0;
  for (const r of allFailedSends) {
    const item = mapCommunicationSendListItem(r);
    if (item.operatorRetry.canRetry) failedSendOperatorRetryableCount += 1;
    if (item.retryCount >= item.operatorRetry.retryLimit) failedSendOperatorRetriesExhaustedCount += 1;
  }

  return {
    totalPlannedSends,
    queuedCount: countFromStatusMap(st, CommunicationSendStatus.QUEUED),
    sendingCount: countFromStatusMap(st, CommunicationSendStatus.SENDING),
    sentCount: countFromStatusMap(st, CommunicationSendStatus.SENT),
    partiallySentCount: countFromStatusMap(st, CommunicationSendStatus.PARTIALLY_SENT),
    failedCount: countFromStatusMap(st, CommunicationSendStatus.FAILED),
    scheduledCount: countFromStatusMap(st, CommunicationSendStatus.SCHEDULED),
    canceledCount: countFromStatusMap(st, CommunicationSendStatus.CANCELED),
    draftSendCount: countFromStatusMap(st, CommunicationSendStatus.DRAFT),
    plansWithFailuresCount: planFailGroup.length,
    plansWithQueuedSendsCount: planQueuedGroup.length,
    plansWithActiveExecutionCount: planActiveGroup.length,
    failedSendOperatorRetryableCount,
    failedSendOperatorRetriesExhaustedCount,
    recentExecutionActivity: recentActivity,
    recentFailedSends: recentFailed,
    channelBreakdown: buildChannelBreakdownFromRows(byChannelStatus),
    recentPlanExecutionRows: attention,
  };
}

/**
 * Recent failed sends for operators (read-only).
 */
export async function listRecentFailedCommunicationSends(
  options: CommsExecutionRecentSendsListQuery = {}
): Promise<CommunicationFailedSendListItem[]> {
  const want = Math.min(Math.max(options.take ?? 20, 1), 100);
  const where: Prisma.CommunicationSendWhereInput = {
    status: CommunicationSendStatus.FAILED,
    ...(options.since != null ? { updatedAt: { gte: options.since } } : {}),
    ...(options.channel != null ? { channel: options.channel } : {}),
  };

  const rows = await prisma.communicationSend.findMany({
    where,
    take: want * 3,
    orderBy: { updatedAt: "desc" },
    include: commsSendListInclude,
  });

  const out: CommunicationFailedSendListItem[] = [];
  for (const r of rows) {
    const item = mapCommunicationSendListItem(r);
    if (options.provider != null) {
      const p = parseCommsOutcomeDisplay(item.outcomeSummaryJson).provider;
      if (p !== options.provider) continue;
    }
    out.push({
      id: item.id,
      communicationPlanId: item.communicationPlanId,
      planTitle: r.plan.title,
      channel: item.channel,
      sourceKind: item.sourceKind,
      providerMessageId: item.providerMessageId,
      failureReason: formatCommsFailureReasonSummary(item.outcomeSummaryJson),
      status: item.status,
      updatedAt: item.updatedAt,
      provider: parseCommsOutcomeDisplay(item.outcomeSummaryJson).provider,
    });
    if (out.length >= want) break;
  }
  return out;
}

/**
 * Recent execution-related transitions (read-only feed).
 */
export async function listRecentCommunicationExecutionActivity(
  options: CommsExecutionRecentSendsListQuery = {}
): Promise<CommunicationExecutionActivityListItem[]> {
  const want = Math.min(Math.max(options.take ?? 20, 1), 100);
  const where: Prisma.CommunicationSendWhereInput = {
    status: { in: executionActivityStatuses },
    ...(options.since != null ? { updatedAt: { gte: options.since } } : {}),
    ...(options.channel != null ? { channel: options.channel } : {}),
  };

  const rows = await prisma.communicationSend.findMany({
    where,
    take: want * 2,
    orderBy: { updatedAt: "desc" },
    include: commsSendListInclude,
  });

  const out: CommunicationExecutionActivityListItem[] = [];
  for (const r of rows) {
    const s = mapCommunicationSendListItem(r);
    const line = formatCommsOutcomeSummaryLine(s.outcomeSummaryJson, { includeWebhookPending: true });
    const activityLabel = [formatCommsFieldLabel(s.status), line].filter((x) => x.length > 0).join(" — ");
    const item: CommunicationExecutionActivityListItem = {
      sendId: s.id,
      communicationPlanId: s.communicationPlanId,
      planTitle: r.plan.title,
      channel: s.channel,
      sourceKind: s.sourceKind,
      status: s.status,
      activityLabel,
      updatedAt: s.updatedAt,
    };
    if (options.provider != null && parseCommsOutcomeDisplay(s.outcomeSummaryJson).provider !== options.provider) {
      continue;
    }
    out.push(item);
    if (out.length >= want) break;
  }
  return out;
}

const activePlanStatuses: CommunicationPlanStatus[] = [
  CommunicationPlanStatus.PLANNING,
  CommunicationPlanStatus.READY_FOR_REVIEW,
  CommunicationPlanStatus.APPROVED,
  CommunicationPlanStatus.SCHEDULED,
  CommunicationPlanStatus.ACTIVE,
];

/**
 * Light rollups for a future workbench dashboard shell.
 */
export async function getCommsWorkbenchDashboardData(): Promise<CommsWorkbenchDashboardData> {
  const now = new Date();
  const weekOut = new Date(now);
  weekOut.setDate(weekOut.getDate() + 7);

  const [
    statusCounts,
    plansNeedingAction,
    plansReadyByStatus,
    byDraftReadyRows,
    scheduledSoon,
    activeRapidResponse,
    activeVolunteerRecruitment,
    mediaFollowups,
    newestRows,
    execution,
  ] = await Promise.all([
    getCommsStatusCounts(),
    listCommunicationPlans({ needsAction: true, take: 12, orderByField: "updatedAt", orderDirection: "desc" }),
    listCommunicationPlans({
      status: [CommunicationPlanStatus.READY_FOR_REVIEW],
      take: 12,
      orderByField: "updatedAt",
      orderDirection: "desc",
    }),
    prisma.communicationPlan.findMany({
      where: { drafts: { some: { status: "READY_FOR_REVIEW" } } },
      take: 12,
      orderBy: { updatedAt: "desc" },
      include: planListInclude,
    }),
    listCommunicationPlans({
      scheduledFrom: now,
      scheduledTo: weekOut,
      take: 12,
      orderByField: "scheduledAt",
      orderDirection: "asc",
    }),
    listCommunicationPlans({
      objective: CommunicationObjective.RAPID_RESPONSE,
      status: activePlanStatuses,
      take: 8,
      orderByField: "updatedAt",
      orderDirection: "desc",
    }),
    listCommunicationPlans({
      objective: CommunicationObjective.VOLUNTEER_RECRUITMENT,
      status: activePlanStatuses,
      take: 8,
      orderByField: "updatedAt",
      orderDirection: "desc",
    }),
    listMediaOutreachItems({
      status: MediaOutreachStatus.FOLLOW_UP_DUE,
      take: 8,
      orderByField: "updatedAt",
      orderDirection: "desc",
    }),
    listCommunicationPlans({ take: 8, orderByField: "updatedAt", orderDirection: "desc" }),
    getCommsExecutionDashboardData(),
  ]);

  const plansReadyFromDrafts = byDraftReadyRows.map((r) => mapCommunicationPlanListItem(r as unknown as PlanListRowShape));
  const plansReadyForReview = uniquePlanItems([...plansReadyByStatus, ...plansReadyFromDrafts]);

  return {
    plansNeedingAction,
    plansReadyForReview,
    scheduledSoon,
    activeRapidResponsePlans: activeRapidResponse,
    activeVolunteerRecruitmentPlans: activeVolunteerRecruitment,
    recentMediaOutreachFollowupsDue: mediaFollowups,
    newestUpdatedPlanRows: newestRows,
    statusCounts,
    execution,
  };
}

function uniquePlanItems(items: CommunicationPlanListItem[]): CommunicationPlanListItem[] {
  const seen = new Set<string>();
  const out: CommunicationPlanListItem[] = [];
  for (const p of items) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

function buildMediaWhere(f: MediaOutreachListQuery): Prisma.MediaOutreachItemWhereInput {
  const ands: Prisma.MediaOutreachItemWhereInput[] = [];
  if (f.status) ands.push({ status: Array.isArray(f.status) ? { in: f.status } : f.status });
  if (f.type) ands.push({ type: Array.isArray(f.type) ? { in: f.type } : f.type });
  if (f.urgency) ands.push({ urgency: Array.isArray(f.urgency) ? { in: f.urgency } : f.urgency });
  if (f.linkedCommunicationPlanId) ands.push({ linkedCommunicationPlanId: f.linkedCommunicationPlanId });
  if (f.linkedWorkflowIntakeId) ands.push({ linkedWorkflowIntakeId: f.linkedWorkflowIntakeId });
  if (f.search?.trim()) {
    const q = f.search.trim();
    ands.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { contactName: { contains: q, mode: "insensitive" } },
        { outletName: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (ands.length === 0) return {};
  if (ands.length === 1) return ands[0] as Prisma.MediaOutreachItemWhereInput;
  return { AND: ands };
}

const mediaListInclude = {
  linkedCommunicationPlan: { select: { id: true, title: true } },
  linkedWorkflowIntake: { select: { id: true, title: true } },
} as const;

/**
 * PR/media outreach list for future `/admin/workbench/...` media view.
 */
export async function listMediaOutreachItems(options: MediaOutreachListQuery = {}): Promise<MediaOutreachListItem[]> {
  const take = Math.min(Math.max(options.take ?? 40, 1), 200);
  const skip = Math.max(options.skip ?? 0, 0);
  const orderByField = options.orderByField ?? "updatedAt";
  const orderDirection = options.orderDirection ?? "desc";
  const where = buildMediaWhere(options);

  const rows = await prisma.mediaOutreachItem.findMany({
    where,
    take,
    skip,
    orderBy: { [orderByField]: orderDirection },
    include: mediaListInclude,
  });

  return rows.map((m) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    status: m.status,
    urgency: m.urgency,
    contactName: m.contactName,
    outletName: m.outletName,
    linkedPlanTitle: m.linkedCommunicationPlan?.title ?? null,
    linkedPlanId: m.linkedCommunicationPlan?.id ?? null,
    linkedIntakeTitle: m.linkedWorkflowIntake?.title ?? null,
    linkedIntakeId: m.linkedWorkflowIntake?.id ?? null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));
}

const mediaDetailInclude = {
  linkedCommunicationPlan: { select: { id: true, title: true, status: true, objective: true } },
  linkedWorkflowIntake: { select: { id: true, title: true, status: true } },
  linkedConversationOpportunity: { select: { id: true, title: true } },
} as const;

/**
 * One outreach row for a future detail drawer / page.
 */
export async function getMediaOutreachItemDetail(id: string): Promise<MediaOutreachDetail | null> {
  const m = await prisma.mediaOutreachItem.findUnique({
    where: { id },
    include: mediaDetailInclude,
  });
  if (!m) return null;

  const list = {
    id: m.id,
    title: m.title,
    type: m.type,
    status: m.status,
    urgency: m.urgency,
    contactName: m.contactName,
    outletName: m.outletName,
    linkedPlanTitle: m.linkedCommunicationPlan?.title ?? null,
    linkedPlanId: m.linkedCommunicationPlan?.id ?? null,
    linkedIntakeTitle: m.linkedWorkflowIntake?.title ?? null,
    linkedIntakeId: m.linkedWorkflowIntake?.id ?? null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };

  return {
    ...list,
    notes: m.notes,
    metadataJson: m.metadataJson as unknown,
    linkedCommunicationPlan: m.linkedCommunicationPlan,
    linkedWorkflowIntake: m.linkedWorkflowIntake,
    linkedConversationOpportunity: m.linkedConversationOpportunity,
  };
}
