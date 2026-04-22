import {
  CampaignEventStatus,
  CampaignEventType,
  CommunicationActionType,
  CommsQueueStatus,
  EventReadinessStatus,
  EventSyncLogStatus,
  EventWorkflowState,
  GoogleEventSyncState,
} from "@prisma/client";
import { EVENT_TRIGGER_SOURCE } from "@/lib/calendar/event-task-engine";
import { prisma } from "@/lib/db";
import { emptyCalendarFilters, whereForCalendar, type CalendarHqFilters } from "@/lib/calendar/hq-filters";
import { countScheduleConflicts, type EventLine } from "@/lib/calendar/ai-insights";

const day0 = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const day7 = (d: Date) => {
  const x = new Date(d);
  x.setDate(x.getDate() + 7);
  return x;
};

export type { CalendarHqFilters } from "@/lib/calendar/hq-filters";

export async function getCalendarSources() {
  return prisma.calendarSource.findMany({
    orderBy: { label: "asc" },
    include: { _count: { select: { events: true } } },
  });
}

export async function getCalendarHqSummary(f: CalendarHqFilters) {
  const now = new Date();
  const t0 = day0(now);
  const t1 = day7(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const base = whereForCalendar(f);
  const weekEv = await prisma.campaignEvent.findMany({
    where: { ...base, startAt: { gte: now, lte: t1 } },
    select: { title: true, startAt: true, endAt: true },
    take: 200,
  });
  const lines: EventLine[] = weekEv.map((e) => ({ title: e.title, startAt: e.startAt, endAt: e.endAt }));
  const conflictCount = countScheduleConflicts(lines);

  const [todayCount, weekCount, pendingApproval, cancelWeek, cancelMonth, commsPending, sources, stageGroups, googleSyncErrors, recentSync] = await Promise.all([
    prisma.campaignEvent.count({
      where: { ...base, startAt: { gte: t0, lt: new Date(t0.getTime() + 86400000) } },
    }),
    prisma.campaignEvent.count({
      where: { ...base, startAt: { gte: now, lte: t1 } },
    }),
    prisma.campaignEvent.count({
      where: { ...base, eventWorkflowState: EventWorkflowState.PENDING_APPROVAL },
    }),
    prisma.campaignEvent.count({
      where: { ...base, status: CampaignEventStatus.CANCELLED, updatedAt: { gte: t0 } },
    }),
    prisma.campaignEvent.count({
      where: { ...base, status: CampaignEventStatus.CANCELLED, updatedAt: { gte: monthStart } },
    }),
    prisma.communicationActionQueue.count({
      where: {
        queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] },
        actionType: {
          in: [
            CommunicationActionType.CAL_REMINDER_DUE,
            CommunicationActionType.CAL_EVENT_CHANGED,
            CommunicationActionType.CAL_CANCELLATION_NOTICE,
            CommunicationActionType.CAL_RSVP_FOLLOWUP,
            CommunicationActionType.CAL_THANK_YOU_FOLLOWUP,
            CommunicationActionType.CAL_COUNTY_LEAD_MISSING,
            CommunicationActionType.CAL_MEDIA_CAPTURE_MISSING,
            CommunicationActionType.CAL_COMMS_PREP_MISSING,
            CommunicationActionType.CAL_STAFFING_GAP,
          ],
        },
      },
    }),
    prisma.calendarSource.findMany({ where: { isActive: true }, orderBy: { label: "asc" } }),
    prisma.campaignEvent.groupBy({
      by: ["eventWorkflowState"],
      where: base,
      _count: { _all: true },
    }),
    prisma.campaignEvent.count({ where: { ...base, googleSyncState: GoogleEventSyncState.ERROR } }),
    prisma.eventSyncLog.findMany({
      where: { status: { in: [EventSyncLogStatus.OK, EventSyncLogStatus.ERROR, EventSyncLogStatus.SKIPPED] } },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { calendarSource: { select: { label: true, displayName: true } }, event: { select: { title: true } } },
    }),
  ]);

  const stageCounts: Partial<Record<EventWorkflowState, number>> = {};
  for (const g of stageGroups) {
    stageCounts[g.eventWorkflowState] = g._count._all;
  }
  return {
    todayCount,
    weekCount,
    pendingApproval,
    conflictCount,
    cancellationsWeek: cancelWeek,
    cancellationsMonth: cancelMonth,
    calendarCommsQueue: commsPending,
    sources,
    stageCounts,
    googleSyncErrorCount: googleSyncErrors,
    recentSyncLogs: recentSync,
  };
}

export async function listAgendaEvents(f: CalendarHqFilters, from: Date, to: Date) {
  return prisma.campaignEvent.findMany({
    where: {
      ...whereForCalendar(f),
      startAt: { gte: from, lte: to },
    },
    orderBy: { startAt: "asc" },
    take: 200,
    include: {
      county: { select: { displayName: true } },
      calendarSource: { select: { label: true, color: true } },
    },
  });
}

export async function listPendingApprovals(f: CalendarHqFilters = emptyCalendarFilters()) {
  return prisma.campaignEvent.findMany({
    where: { ...whereForCalendar(f), eventWorkflowState: EventWorkflowState.PENDING_APPROVAL },
    orderBy: { startAt: "asc" },
    take: 50,
    include: { county: { select: { displayName: true } } },
  });
}

type CalendarEventCommsFields = {
  reminderPlanStatus: EventReadinessStatus;
  attendeeCommsStatus: EventReadinessStatus;
  followupCommsStatus: EventReadinessStatus;
  lastReminderSentAt: Date | null;
  nextReminderDueAt: Date | null;
  lastAttendeeNoticeAt: Date | null;
  lastCancellationNoticeAt: Date | null;
  thankYouQueuedAt: Date | null;
};

export async function getEventOrNull(id: string) {
  const row = await prisma.campaignEvent.findUnique({
    where: { id },
    include: {
      county: true,
      calendarSource: true,
      ownerUser: { select: { id: true, name: true, email: true } },
      approvedByUser: { select: { id: true, name: true, email: true } },
      signups: { take: 20, orderBy: { createdAt: "desc" } },
      eventApprovals: { orderBy: { createdAt: "desc" }, take: 12 },
      stageChangeLogs: { orderBy: { createdAt: "desc" }, take: 40, include: { actor: { select: { name: true, email: true } } } },
      syncLogs: {
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          direction: true,
          status: true,
          message: true,
          createdAt: true,
          detailJson: true,
        },
      },
      commsQueueItems: {
        where: { queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] } },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          actionType: true,
          queueStatus: true,
          scheduledAt: true,
          createdAt: true,
          createdBy: { select: { name: true, email: true } },
        },
      },
      tasks: {
        take: 80,
        orderBy: [{ status: "asc" }, { dueAt: "asc" }],
        select: {
          id: true,
          eventId: true,
          title: true,
          description: true,
          status: true,
          taskType: true,
          priority: true,
          dueAt: true,
          completedAt: true,
          timeMatrixQuadrant: true,
          blocksReadiness: true,
          sourceTemplateTaskKey: true,
          assignedUserId: true,
          assignedRole: true,
          workflowRunId: true,
          assignee: { select: { id: true, name: true, email: true } },
          workflowRun: {
            select: {
              id: true,
              status: true,
              workflowTemplate: { select: { id: true, key: true, title: true } },
            },
          },
        },
      },
    },
  });
  return row as (NonNullable<typeof row> & CalendarEventCommsFields) | null;
}

export type CalendarHqEventDetail = NonNullable<Awaited<ReturnType<typeof getEventOrNull>>> & CalendarEventCommsFields;

export async function listCalendarQueueItems() {
  return prisma.communicationActionQueue.findMany({
    where: {
      queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] },
      actionType: {
        in: [
          CommunicationActionType.CAL_REMINDER_DUE,
          CommunicationActionType.CAL_EVENT_CHANGED,
          CommunicationActionType.CAL_CANCELLATION_NOTICE,
          CommunicationActionType.CAL_RSVP_FOLLOWUP,
          CommunicationActionType.CAL_THANK_YOU_FOLLOWUP,
          CommunicationActionType.CAL_COUNTY_LEAD_MISSING,
          CommunicationActionType.CAL_MEDIA_CAPTURE_MISSING,
          CommunicationActionType.CAL_COMMS_PREP_MISSING,
          CommunicationActionType.CAL_STAFFING_GAP,
        ],
      },
    },
    orderBy: { createdAt: "asc" },
    take: 40,
    include: { event: { select: { id: true, title: true, startAt: true, slug: true } } },
  });
}

export async function listCountiesForCalendarFilters() {
  return prisma.county.findMany({ orderBy: { displayName: "asc" }, select: { id: true, displayName: true } });
}

export async function listUsersForOwnerFilter() {
  return prisma.user.findMany({ orderBy: { email: "asc" }, select: { id: true, name: true, email: true }, take: 400 });
}

export async function listEventWorkflowTemplateChoices(eventType: CampaignEventType) {
  return prisma.workflowTemplate.findMany({
    where: {
      isActive: true,
      key: { startsWith: "s4_event_" },
      OR: [{ campaignEventType: eventType }, { campaignEventType: null }],
    },
    orderBy: [{ title: "asc" }],
    select: { id: true, key: true, title: true, description: true, campaignEventType: true },
  });
}

export async function listWorkflowRunsForEvent(eventId: string) {
  return prisma.workflowRun.findMany({
    where: { triggerSourceType: EVENT_TRIGGER_SOURCE, triggerSourceId: eventId },
    orderBy: { createdAt: "asc" },
    include: { workflowTemplate: { select: { id: true, key: true, title: true } } },
  });
}

export async function rollupAnalyticsSnapshot() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const byState = await prisma.campaignEvent.groupBy({
    by: ["eventWorkflowState"],
    _count: { _all: true },
    where: { createdAt: { gte: start } },
  });
  return { monthStart: start, byState };
}
