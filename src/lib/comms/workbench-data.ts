import {
  CommunicationActionType,
  CommunicationCampaignAutomationStatus,
  CommunicationCampaignStatus,
  CommsQueueStatus,
  CommunicationThreadStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { isCalendarCommsType } from "@/lib/calendar/queue-helpers";
import { getEffectivePreferenceForThread, type ContactPreferenceRow } from "@/lib/comms/preferences";
import { threadListInclude, type ThreadListItem } from "./threads";

export type CommsSummary = {
  needsReplyCount: number;
  unreadThreadCount: number;
  pendingQueueCount: number;
  messagesTodayCount: number;
  /** Calendar `CommunicationActionType` (CAL_*) not yet done */
  calendarQueuePending: number;
  /** Tier 3B: auto-generated campaign shells awaiting review (draft/approval). */
  automationShellCount: number;
};

export type OrchestrationShellRow = {
  id: string;
  name: string;
  status: CommunicationCampaignStatus;
  campaignType: string;
  eventId: string | null;
  eventTitle: string | null;
};

export type CommsWorkbenchData = {
  summary: CommsSummary;
  priorityQueue: Awaited<ReturnType<typeof listPriorityQueue>>;
  unreadThreads: ThreadListItem[];
  orchestrationShells: OrchestrationShellRow[];
};

export type WorkbenchFilters = { countyId?: string | null; lane?: "all" | "calendar" | "orchestration" };

function dayStart(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayEnd(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export async function getCommsSummary(filters: WorkbenchFilters): Promise<CommsSummary> {
  const now = new Date();
  const t0 = dayStart(now);
  const t1 = dayEnd(now);
  const county = filters.countyId ? { countyId: filters.countyId } : {};

  const shellStatusList: CommunicationCampaignStatus[] = [
    CommunicationCampaignStatus.DRAFT,
    CommunicationCampaignStatus.APPROVAL_NEEDED,
  ];
  const shellWhere = {
    automationStatus: CommunicationCampaignAutomationStatus.SHELL,
    status: { in: shellStatusList },
    ...(filters.countyId
      ? { event: { is: { countyId: filters.countyId } } }
      : {}),
  };

  const [needsReplyCount, unreadThreadCount, pendingQueueCount, messagesTodayCount, calendarQueuePending, automationShellCount] =
    await Promise.all([
    prisma.communicationThread.count({
      where: { ...county, threadStatus: CommunicationThreadStatus.NEEDS_REPLY },
    }),
    prisma.communicationThread.count({
      where: { ...county, unreadCount: { gt: 0 } },
    }),
    prisma.communicationActionQueue.count({
      where: { queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] } },
    }),
    prisma.communicationMessage.count({
      where: {
        createdAt: { gte: t0, lte: t1 },
        ...(filters.countyId
          ? { thread: { is: { countyId: filters.countyId } } }
          : {}),
      },
    }),
    prisma.communicationActionQueue.count({
      where: {
        queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] },
        eventId: { not: null },
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
        ...(filters.countyId
          ? { event: { is: { countyId: filters.countyId } } }
          : {}),
      },
    }),
    prisma.communicationCampaign.count({ where: shellWhere }),
  ]);

  return {
    needsReplyCount,
    unreadThreadCount,
    pendingQueueCount,
    messagesTodayCount,
    calendarQueuePending,
    automationShellCount,
  };
}

const queueItemInclude = {
  thread: { select: { id: true, primaryPhone: true, primaryEmail: true, threadStatus: true } },
  event: { select: { id: true, title: true, startAt: true, eventWorkflowState: true, countyId: true } },
} as const;

export async function listPriorityQueue(take: number) {
  return prisma.communicationActionQueue.findMany({
    where: { queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] } },
    orderBy: [{ queueStatus: "asc" }, { scheduledAt: "asc" }, { createdAt: "asc" }],
    take,
    include: queueItemInclude,
  });
}

/** Workbench "Calendar ops" lane: event-linked `CAL_*` actions only. */
export async function listCalendarCommsOnlyQueue(take: number, countyId: string | null) {
  const all = await prisma.communicationActionQueue.findMany({
    where: {
      queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] },
      eventId: { not: null },
    },
    orderBy: [{ queueStatus: "asc" }, { scheduledAt: "asc" }, { createdAt: "asc" }],
    take: take * 2,
    include: queueItemInclude,
  });
  return all
    .filter((i) => isCalendarCommsType(i.actionType) && i.event)
    .filter((i) => (countyId ? i.event?.countyId === countyId : true))
    .slice(0, take);
}

export async function listUnreadThreads(countyId: string | null, take: number) {
  return prisma.communicationThread.findMany({
    where: {
      OR: [{ unreadCount: { gt: 0 } }, { threadStatus: CommunicationThreadStatus.NEEDS_REPLY }],
      ...(countyId ? { countyId } : {}),
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take,
    include: threadListInclude,
  });
}

export async function listRecentThreads(countyId: string | null, take: number) {
  return prisma.communicationThread.findMany({
    where: {
      ...(countyId ? { countyId } : {}),
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take,
    include: threadListInclude,
  });
}

export async function listOrchestrationShellCampaigns(
  take: number,
  countyId: string | null
): Promise<OrchestrationShellRow[]> {
  const rows = await prisma.communicationCampaign.findMany({
    where: {
      automationStatus: CommunicationCampaignAutomationStatus.SHELL,
      status: { in: [CommunicationCampaignStatus.DRAFT, CommunicationCampaignStatus.APPROVAL_NEEDED] },
      ...(countyId ? { event: { is: { countyId } } } : {}),
    },
    take,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      campaignType: true,
      eventId: true,
      event: { select: { title: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    campaignType: r.campaignType,
    eventId: r.eventId,
    eventTitle: r.event?.title ?? null,
  }));
}

export async function getCommsWorkbenchData(filters: WorkbenchFilters): Promise<CommsWorkbenchData> {
  const [summary, priorityQueue, unreadThreads, orchestrationShells] = await Promise.all([
    getCommsSummary(filters),
    filters.lane === "orchestration"
      ? Promise.resolve([] as Awaited<ReturnType<typeof listPriorityQueue>>)
      : filters.lane === "calendar"
        ? listCalendarCommsOnlyQueue(40, filters.countyId ?? null)
        : listPriorityQueue(40),
    listUnreadThreads(filters.countyId ?? null, 50),
    listOrchestrationShellCampaigns(20, filters.countyId ?? null),
  ]);
  return { summary, priorityQueue, unreadThreads, orchestrationShells };
}

const threadWorkbenchInclude = {
  ...threadListInclude,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      linkedVoterRecordId: true,
      linkedVoterRecord: {
        select: { id: true, countySlug: true, firstName: true, lastName: true, city: true, precinct: true },
      },
    },
  },
  volunteerProfile: {
    select: {
      id: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  },
} as const;

export async function getThreadForWorkbench(threadId: string) {
  const t = await prisma.communicationThread.findUnique({
    where: { id: threadId },
    include: {
      ...threadWorkbenchInclude,
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
      actionQueue: {
        where: { queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!t) return null;
  const effectivePreference: ContactPreferenceRow | null = await getEffectivePreferenceForThread(t);
  return { ...t, effectivePreference };
}

const queueChannelHint: Record<CommunicationActionType, string> = {
  SEND_SMS: "SMS",
  SEND_EMAIL: "Email",
  SEND_REMINDER: "Reminder",
  AI_SUGGEST_FOLLOWUP: "AI",
  CAL_REMINDER_DUE: "Cal · Reminder",
  CAL_EVENT_CHANGED: "Cal · Changed",
  CAL_CANCELLATION_NOTICE: "Cal · Cancel",
  CAL_RSVP_FOLLOWUP: "Cal · RSVP",
  CAL_THANK_YOU_FOLLOWUP: "Cal · Thanks",
  CAL_COUNTY_LEAD_MISSING: "Cal · County",
  CAL_MEDIA_CAPTURE_MISSING: "Cal · Media",
  CAL_COMMS_PREP_MISSING: "Cal · Prep",
  CAL_STAFFING_GAP: "Cal · Staff",
};

export function formatQueueItemLabel(
  item: {
    actionType: CommunicationActionType;
    thread: { primaryPhone: string | null; primaryEmail: string | null } | null;
    event?: { title: string; startAt: Date } | null;
  }
) {
  const ch = queueChannelHint[item.actionType] ?? item.actionType;
  if (item.event) {
    return `${ch} · ${item.event.title} · ${item.event.startAt.toLocaleDateString()}`;
  }
  const who = item.thread
    ? (item.thread.primaryPhone ?? item.thread.primaryEmail ?? "Open thread")
    : "Unassigned";
  return `${ch} · ${who}`;
}
