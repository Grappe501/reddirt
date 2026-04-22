import {
  CampaignEventStatus,
  CampaignTaskStatus,
  CampaignTaskType,
  OwnedMediaReviewStatus,
  VolunteerAskStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCommsSummary } from "@/lib/comms/workbench-data";

const dayStart = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const dayEnd = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export type WorkbenchFilters = { countyId?: string | null };

const OPEN_TASK: CampaignTaskStatus[] = [
  CampaignTaskStatus.TODO,
  CampaignTaskStatus.IN_PROGRESS,
  CampaignTaskStatus.BLOCKED,
];

/** High-signal event-linked work for the workbench priority rail (Slice 4). */
export async function getEventTaskPriorityForWorkbench(countyId?: string | null) {
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 3600);
  return prisma.campaignTask.findMany({
    where: {
      eventId: { not: null },
      status: { in: OPEN_TASK },
      OR: [
        { dueAt: { lt: now } },
        { blocksReadiness: true, dueAt: { not: null, lte: in48h } },
        { taskType: CampaignTaskType.MEDIA, event: { endAt: { lt: now } } },
        { taskType: CampaignTaskType.FOLLOW_UP, dueAt: { lt: now } },
        { taskType: CampaignTaskType.PREP, event: { startAt: { gt: now } }, dueAt: { lt: now } },
      ],
      ...(countyId ? { countyId } : {}),
    },
    orderBy: { dueAt: "asc" },
    take: 20,
    include: {
      event: { select: { id: true, title: true, startAt: true, endAt: true, eventWorkflowState: true } },
    },
  });
}

export async function getWorkbenchData(filters: WorkbenchFilters) {
  const now = new Date();
  const today0 = dayStart(now);
  const today1 = dayEnd(now);

  const eventWhere = {
    status: { notIn: [CampaignEventStatus.CANCELLED, CampaignEventStatus.COMPLETED] },
    endAt: { gte: now },
    ...(filters.countyId ? { countyId: filters.countyId } : {}),
  };

  const taskBase = {
    ...(filters.countyId ? { countyId: filters.countyId } : {}),
  };

  const [
    tasksDueToday,
    tasksOverdue,
    upcomingEvents,
    recentSignups,
    activeAsks,
    recentBatches,
    pendingMediaReview,
    openTasks,
    pendingSignupIntakeRows,
    lowConfidenceSignupRows,
    signupRowsNoCandidates,
    commsSummary,
    eventTaskPriority,
  ] = await Promise.all([
    prisma.campaignTask.findMany({
      where: {
        ...taskBase,
        status: { in: [CampaignTaskStatus.TODO, CampaignTaskStatus.IN_PROGRESS, CampaignTaskStatus.BLOCKED] },
        dueAt: { gte: today0, lte: today1 },
      },
      orderBy: { dueAt: "asc" },
      take: 20,
      include: { event: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.campaignTask.findMany({
      where: {
        ...taskBase,
        status: { in: [CampaignTaskStatus.TODO, CampaignTaskStatus.IN_PROGRESS, CampaignTaskStatus.BLOCKED] },
        dueAt: { lt: now },
      },
      orderBy: { dueAt: "asc" },
      take: 20,
      include: { event: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.campaignEvent.findMany({
      where: eventWhere,
      orderBy: { startAt: "asc" },
      take: 10,
      include: { county: { select: { id: true, displayName: true, slug: true } } },
    }),
    prisma.eventSignup.findMany({
      where: {
        ...(filters.countyId ? { event: { countyId: filters.countyId } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { event: { select: { id: true, title: true, slug: true, startAt: true } } },
    }),
    prisma.volunteerAsk.findMany({
      where: {
        status: { in: [VolunteerAskStatus.ACTIVE, VolunteerAskStatus.DRAFT] },
        ...(filters.countyId ? { countyId: filters.countyId } : {}),
      },
      orderBy: [{ priority: "desc" }, { startsAt: "asc" }],
      take: 12,
    }),
    prisma.mediaIngestBatch.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.ownedMediaAsset.findMany({
      where: { reviewStatus: { in: [OwnedMediaReviewStatus.PENDING_REVIEW, OwnedMediaReviewStatus.DRAFT] } },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, title: true, fileName: true, reviewStatus: true, isPublic: true, createdAt: true },
    }),
    prisma.campaignTask.count({
      where: {
        ...taskBase,
        status: { in: [CampaignTaskStatus.TODO, CampaignTaskStatus.IN_PROGRESS] },
      },
    }),
    prisma.signupSheetEntry.count({
      where: { approvalStatus: "PENDING_REVIEW" },
    }),
    prisma.signupSheetEntry.count({
      where: {
        approvalStatus: "PENDING_REVIEW",
        confidenceScore: { not: null, lt: 0.5 },
      },
    }),
    prisma.signupSheetEntry.count({
      where: {
        approvalStatus: "PENDING_REVIEW",
        matchCandidates: { none: {} },
      },
    }),
    getCommsSummary({ countyId: filters.countyId ?? null }),
    getEventTaskPriorityForWorkbench(filters.countyId ?? null),
  ]);

  return {
    tasksDueToday,
    tasksOverdue,
    upcomingEvents,
    recentSignups,
    activeAsks,
    recentBatches,
    pendingMediaReview,
    openTaskCount: openTasks,
    pendingSignupIntakeRows,
    lowConfidenceSignupRows,
    signupRowsNoCandidates,
    commsSummary,
    eventTaskPriority,
  };
}

export async function getCountiesForOpsFilter() {
  return prisma.county.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, displayName: true, slug: true },
  });
}
