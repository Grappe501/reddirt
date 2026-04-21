import {
  CommunicationActionType,
  CommsQueueStatus,
  CommunicationThreadStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { threadListInclude, type ThreadListItem } from "./threads";

export type CommsSummary = {
  needsReplyCount: number;
  unreadThreadCount: number;
  pendingQueueCount: number;
  messagesTodayCount: number;
};

export type CommsWorkbenchData = {
  summary: CommsSummary;
  priorityQueue: Awaited<ReturnType<typeof listPriorityQueue>>;
  unreadThreads: ThreadListItem[];
};

export type WorkbenchFilters = { countyId?: string | null };

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

  const [needsReplyCount, unreadThreadCount, pendingQueueCount, messagesTodayCount] = await Promise.all([
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
  ]);

  return {
    needsReplyCount,
    unreadThreadCount,
    pendingQueueCount,
    messagesTodayCount,
  };
}

export async function listPriorityQueue(take: number) {
  return prisma.communicationActionQueue.findMany({
    where: { queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] } },
    orderBy: [{ queueStatus: "asc" }, { scheduledAt: "asc" }, { createdAt: "asc" }],
    take,
    include: {
      thread: { select: { id: true, primaryPhone: true, primaryEmail: true, threadStatus: true } },
    },
  });
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

export async function getCommsWorkbenchData(filters: WorkbenchFilters): Promise<CommsWorkbenchData> {
  const [summary, priorityQueue, unreadThreads] = await Promise.all([
    getCommsSummary(filters),
    listPriorityQueue(40),
    listUnreadThreads(filters.countyId ?? null, 50),
  ]);
  return { summary, priorityQueue, unreadThreads };
}

export async function getThreadForWorkbench(threadId: string) {
  return prisma.communicationThread.findUnique({
    where: { id: threadId },
    include: {
      ...threadListInclude,
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
      actionQueue: {
        where: { queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

const queueChannelHint: Record<CommunicationActionType, string> = {
  SEND_SMS: "SMS",
  SEND_EMAIL: "Email",
  SEND_REMINDER: "Reminder",
  AI_SUGGEST_FOLLOWUP: "AI",
};

export function formatQueueItemLabel(
  item: { actionType: CommunicationActionType; thread: { primaryPhone: string | null; primaryEmail: string | null } | null }
) {
  const ch = queueChannelHint[item.actionType] ?? item.actionType;
  const who = item.thread
    ? (item.thread.primaryPhone ?? item.thread.primaryEmail ?? "Open thread")
    : "Unassigned";
  return `${ch} · ${who}`;
}
