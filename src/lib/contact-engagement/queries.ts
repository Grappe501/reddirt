import type { Prisma } from "@prisma/client";
import {
  type CommunicationRecipientEventType,
  type CommunicationRecipientStatus,
  type CommsDeliveryHealthStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { mapCommunicationUserSummary } from "../comms-workbench/mappers";
import type {
  CommunicationPlanEngagementSummary,
  CommunicationRecipientDetail,
  CommunicationRecipientEventListItem,
  CommunicationRecipientListItem,
  CommunicationSendEngagementSummary,
  CommsPlanAudienceSegmentDetail,
  CommsPlanAudienceSegmentListItem,
  ContactEngagementRecentSend,
  ContactEngagementSummary,
} from "./dto";
import type { CommunicationRecipientListFilters, CommsPlanAudienceSegmentListFilters, ContactEngagementSummaryQuery } from "./types";
import {
  attachLatestEventSummary,
  buildCommunicationPlanEngagementSummary,
  buildCommunicationRecipientEventRollup,
  buildCommunicationSendEngagementSummary,
  buildContactEngagementSummary,
  mapCommsPlanAudienceSegmentListItem,
  mapCommsPlanAudienceSegmentMemberListItem,
  mapCommunicationRecipientDetail,
  mapCommunicationRecipientEventListItem,
  mapCommunicationRecipientIdentitySummary,
  mapCommunicationRecipientListItem,
  mapRuleDefinitionToView,
} from "./mappers";
import { formatRecipientEventSummaryLine } from "./display";

const userSelect = { id: true, name: true, email: true, phone: true } as const;

const recipientInclude = {
  user: { select: userSelect },
  volunteerProfile: { include: { user: { select: userSelect } } },
  thread: { select: { id: true, primaryEmail: true, primaryPhone: true } },
} as const;

function toStatusCounts(
  arr: { status: CommunicationRecipientStatus; _count: { _all: number } }[]
): Partial<Record<CommunicationRecipientStatus, number>> {
  const o: Partial<Record<CommunicationRecipientStatus, number>> = {};
  for (const g of arr) o[g.status] = g._count._all;
  return o;
}

function toHealthCounts(
  arr: { deliveryHealthStatus: CommsDeliveryHealthStatus; _count: { _all: number } }[]
): Partial<Record<CommsDeliveryHealthStatus, number>> {
  const o: Partial<Record<CommsDeliveryHealthStatus, number>> = {};
  for (const g of arr) o[g.deliveryHealthStatus] = g._count._all;
  return o;
}

function toEventTypeCounts(
  arr: { eventType: CommunicationRecipientEventType; _count: { _all: number } }[]
): Partial<Record<CommunicationRecipientEventType, number>> {
  const o: Partial<Record<CommunicationRecipientEventType, number>> = {};
  for (const g of arr) o[g.eventType] = g._count._all;
  return o;
}

/**
 * Recipients for a workbench send with identity, event rollups, and latest-event one-liner.
 */
export async function listCommunicationRecipientsForSend(
  communicationSendId: string,
  filters: CommunicationRecipientListFilters = {},
  options: { take?: number } = {}
): Promise<CommunicationRecipientListItem[]> {
  const take = Math.min(Math.max(options.take ?? 500, 1), 2000);

  const and: Prisma.CommunicationRecipientWhereInput[] = [{ communicationSendId }];

  if (filters.status) and.push({ status: filters.status });
  if (filters.deliveryHealthStatus) and.push({ deliveryHealthStatus: filters.deliveryHealthStatus });
  if (filters.channel) and.push({ channel: filters.channel });
  if (filters.hasEvents === true) and.push({ events: { some: {} } });
  if (filters.hasEvents === false) and.push({ events: { none: {} } });
  if (filters.eventType) and.push({ events: { some: { eventType: filters.eventType } } });

  const q = filters.searchText?.trim();
  if (q) {
    and.push({
      OR: [
        { addressUsed: { contains: q, mode: "insensitive" } },
        { crmContactKey: { contains: q, mode: "insensitive" } },
        { targetSegmentLabel: { contains: q, mode: "insensitive" } },
        { user: { is: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } } },
        { thread: { is: { OR: [{ primaryEmail: { contains: q, mode: "insensitive" } }, { primaryPhone: { contains: q, mode: "insensitive" } }] } } },
      ],
    });
  }

  const rows = await prisma.communicationRecipient.findMany({
    where: { AND: and },
    take,
    orderBy: { updatedAt: "desc" },
    include: recipientInclude,
  });

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const allEvents = await prisma.communicationRecipientEvent.findMany({
    where: { communicationRecipientId: { in: ids } },
    select: {
      communicationRecipientId: true,
      eventType: true,
      occurredAt: true,
      providerName: true,
      linkLabel: true,
      linkUrl: true,
    },
  });

  const byRec = new Map<string, (typeof allEvents)[number][]>();
  for (const e of allEvents) {
    const n = byRec.get(e.communicationRecipientId) ?? [];
    n.push(e);
    byRec.set(e.communicationRecipientId, n);
  }

  const out: CommunicationRecipientListItem[] = [];
  for (const r of rows) {
    const recEv = byRec.get(r.id) ?? [];
    const evs = recEv.map((e) => ({ eventType: e.eventType, occurredAt: e.occurredAt }));
    const roll = buildCommunicationRecipientEventRollup(evs);
    const item = mapCommunicationRecipientListItem(r, roll);
    const latest = [...recEv].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())[0];
    if (latest) {
      out.push(
        attachLatestEventSummary(item, {
          eventType: latest.eventType,
          providerName: latest.providerName,
          linkLabel: latest.linkLabel,
          linkUrl: latest.linkUrl,
        })
      );
    } else {
      out.push(item);
    }
  }
  return out;
}

/**
 * One recipient with ordered event history and send/plan context.
 */
export async function getCommunicationRecipientDetail(
  communicationRecipientId: string
): Promise<CommunicationRecipientDetail | null> {
  const r = await prisma.communicationRecipient.findUnique({
    where: { id: communicationRecipientId },
    include: {
      ...recipientInclude,
      comsPlanAudienceSegment: { select: { name: true } },
      events: { orderBy: { occurredAt: "asc" } },
      send: { select: { status: true, plan: { select: { id: true, title: true } } } },
    },
  });
  if (!r) return null;
  return mapCommunicationRecipientDetail({
    id: r.id,
    communicationSendId: r.communicationSendId,
    channel: r.channel,
    addressUsed: r.addressUsed,
    status: r.status,
    deliveryHealthStatus: r.deliveryHealthStatus,
    targetSegmentId: r.targetSegmentId,
    targetSegmentLabel: r.targetSegmentLabel,
    crmContactKey: r.crmContactKey,
    providerRecipientId: r.providerRecipientId,
    comsPlanAudienceSegmentId: r.comsPlanAudienceSegmentId,
    comsPlanAudienceSegment: r.comsPlanAudienceSegment,
    userId: r.userId,
    user: r.user,
    volunteerProfileId: r.volunteerProfileId,
    volunteerProfile: r.volunteerProfile,
    communicationThreadId: r.communicationThreadId,
    thread: r.thread,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    send: r.send,
    events: r.events,
  });
}

/**
 * Event history for a recipient (newest first).
 */
export async function listCommunicationRecipientEvents(communicationRecipientId: string, take = 200): Promise<CommunicationRecipientEventListItem[]> {
  const rows = await prisma.communicationRecipientEvent.findMany({
    where: { communicationRecipientId },
    orderBy: { occurredAt: "desc" },
    take: Math.min(Math.max(take, 1), 1000),
  });
  return rows.map(mapCommunicationRecipientEventListItem);
}

/**
 * Per-send rollups: recipient row counts + event totals for all recipients of the send.
 */
export async function getCommunicationSendEngagementSummary(
  communicationSendId: string
): Promise<CommunicationSendEngagementSummary | null> {
  const send = await prisma.communicationSend.findUnique({
    where: { id: communicationSendId },
    select: { id: true },
  });
  if (!send) return null;

  const [total, bySt, byH, byEv, lastEvAgg, failEvent, linkClicks] = await Promise.all([
    prisma.communicationRecipient.count({ where: { communicationSendId } }),
    prisma.communicationRecipient.groupBy({
      by: ["status"],
      where: { communicationSendId },
      _count: { _all: true },
    }),
    prisma.communicationRecipient.groupBy({
      by: ["deliveryHealthStatus"],
      where: { communicationSendId },
      _count: { _all: true },
    }),
    prisma.communicationRecipientEvent.groupBy({
      by: ["eventType"],
      where: { recipient: { communicationSendId } },
      _count: { _all: true },
    }),
    prisma.communicationRecipientEvent.aggregate({
      where: { recipient: { communicationSendId } },
      _max: { occurredAt: true },
    }),
    prisma.communicationRecipientEvent.findFirst({
      where: { recipient: { communicationSendId }, eventType: { in: ["FAILED", "BOUNCED"] } },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.communicationRecipientEvent.count({
      where: { recipient: { communicationSendId }, eventType: "CLICKED" },
    }),
  ]);

  const stMap = toStatusCounts(bySt);
  const hMap = toHealthCounts(byH);
  const evMap = toEventTypeCounts(byEv);

  const latestFailureSummary = failEvent
    ? formatRecipientEventSummaryLine({
        eventType: failEvent.eventType,
        providerName: failEvent.providerName,
        linkLabel: failEvent.linkLabel,
        linkUrl: failEvent.linkUrl,
      })
    : null;

  return buildCommunicationSendEngagementSummary({
    communicationSendId: send.id,
    totalRecipients: total,
    countByStatus: stMap,
    countByDeliveryHealth: hMap,
    eventTypeCounts: evMap,
    lastEventAt: lastEvAgg._max.occurredAt?.toISOString() ?? null,
    latestFailureSummary,
    linkClickEventCount: linkClicks,
  });
}

/**
 * Plan-level recipient + event rollups (sum of all recipient rows under the plan’s sends).
 */
export async function getCommunicationPlanEngagementSummary(communicationPlanId: string): Promise<CommunicationPlanEngagementSummary> {
  const [total, sendsWith, bySt, byH, byEv, lastEvAgg, lastFail, byCh] = await Promise.all([
    prisma.communicationRecipient.count({ where: { send: { communicationPlanId } } }),
    prisma.communicationSend.count({ where: { communicationPlanId, communicationRecipients: { some: {} } } }),
    prisma.communicationRecipient.groupBy({
      by: ["status"],
      where: { send: { communicationPlanId } },
      _count: { _all: true },
    }),
    prisma.communicationRecipient.groupBy({
      by: ["deliveryHealthStatus"],
      where: { send: { communicationPlanId } },
      _count: { _all: true },
    }),
    prisma.communicationRecipientEvent.groupBy({
      by: ["eventType"],
      where: { recipient: { send: { communicationPlanId } } },
      _count: { _all: true },
    }),
    prisma.communicationRecipientEvent.aggregate({
      where: { recipient: { send: { communicationPlanId } } },
      _max: { occurredAt: true },
    }),
    prisma.communicationRecipientEvent.findFirst({
      where: {
        recipient: { send: { communicationPlanId } },
        eventType: { in: ["FAILED", "BOUNCED", "UNSUBSCRIBED"] },
      },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.communicationRecipient.groupBy({
      by: ["channel"],
      where: { send: { communicationPlanId } },
      _count: { _all: true },
    }),
  ]);

  const stMap = toStatusCounts(bySt);
  const hMap = toHealthCounts(byH);
  const evMap = toEventTypeCounts(byEv);
  const chMap: Partial<Record<import("@prisma/client").CommsWorkbenchChannel, number>> = {};
  for (const c of byCh) chMap[c.channel] = c._count._all;

  return buildCommunicationPlanEngagementSummary({
    communicationPlanId,
    totalRecipientRows: total,
    totalSendsWithRecipients: sendsWith,
    countByStatus: stMap,
    countByDeliveryHealth: hMap,
    eventTypeCounts: evMap,
    lastEventAt: lastEvAgg._max.occurredAt?.toISOString() ?? null,
    lastFailureEventAt: lastFail?.occurredAt.toISOString() ?? null,
    recipientRowsByChannel: chMap,
  });
}

/**
 * All segments for a plan with stored member count (static) or `memberCount: null` (dynamic, unevaluated).
 */
export async function listCommsPlanAudienceSegments(
  communicationPlanId: string,
  f: CommsPlanAudienceSegmentListFilters = {}
): Promise<CommsPlanAudienceSegmentListItem[]> {
  const rows = await prisma.commsPlanAudienceSegment.findMany({
    where: {
      communicationPlanId,
      ...(f.status && { status: f.status }),
      ...(f.segmentType && { segmentType: f.segmentType }),
      ...(f.isDynamic != null && { isDynamic: f.isDynamic }),
    },
    orderBy: { name: "asc" },
    include: {
      createdBy: { select: userSelect },
      updatedBy: { select: userSelect },
      _count: { select: { members: true } },
    },
  });
  return rows.map(mapCommsPlanAudienceSegmentListItem);
}

/**
 * One segment, members, and rule view (not executed).
 */
export async function getCommsPlanAudienceSegmentDetail(
  communicationPlanId: string,
  comsPlanAudienceSegmentId: string
): Promise<CommsPlanAudienceSegmentDetail | null> {
  const s = await prisma.commsPlanAudienceSegment.findFirst({
    where: { id: comsPlanAudienceSegmentId, communicationPlanId },
    include: {
      createdBy: { select: userSelect },
      updatedBy: { select: userSelect },
      _count: { select: { members: true } },
      members: {
        orderBy: { createdAt: "asc" },
        take: 5000,
        include: {
          addedBy: { select: userSelect },
          user: { select: userSelect },
          segmentVolunteerProfile: { include: { user: { select: userSelect } } },
        },
      },
    },
  });
  if (!s) return null;

  const list = mapCommsPlanAudienceSegmentListItem(s);
  const members = s.members.map((m) =>
    mapCommsPlanAudienceSegmentMemberListItem({
      id: m.id,
      comsPlanAudienceSegmentId: m.comsPlanAudienceSegmentId,
      sourceType: m.sourceType,
      createdAt: m.createdAt,
      addedByUser: m.addedBy,
      userId: m.userId,
      user: m.user,
      volunteerProfileId: m.volunteerProfileId,
      segmentVolunteerProfile: m.segmentVolunteerProfile,
      crmContactKey: m.crmContactKey,
    })
  );
  return {
    ...list,
    members,
    ruleView: mapRuleDefinitionToView(s.ruleDefinitionJson),
    ruleDefinitionJson: s.ruleDefinitionJson as unknown,
  };
}

/**
 * Read-only contact engagement for one identity channel (at most one of the four should be set).
 */
export async function getContactEngagementSummary(query: ContactEngagementSummaryQuery): Promise<ContactEngagementSummary | null> {
  const { userId, volunteerProfileId, communicationThreadId, crmContactKey } = query;
  const nSet = [userId, volunteerProfileId, communicationThreadId, crmContactKey].filter(Boolean).length;
  if (nSet !== 1) return null;

  const where: Prisma.CommunicationRecipientWhereInput = {};
  if (userId) where.userId = userId;
  else if (volunteerProfileId) where.volunteerProfileId = volunteerProfileId;
  else if (communicationThreadId) where.communicationThreadId = communicationThreadId;
  else if (crmContactKey) where.crmContactKey = crmContactKey;
  const rows = await prisma.communicationRecipient.findMany({
    where,
    take: 500,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: userSelect },
      volunteerProfile: { include: { user: { select: userSelect } } },
      thread: { select: { id: true, primaryEmail: true, primaryPhone: true } },
      send: { select: { id: true, status: true, channel: true, plan: { select: { id: true, title: true, status: true } } } },
    },
  });

  if (rows.length === 0) {
    if (userId) {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
      if (!u) return null;
      return buildContactEngagementSummary({
        query: { userId, volunteerProfileId: null, communicationThreadId: null, crmContactKey: null },
        primaryIdentity: mapCommunicationRecipientIdentitySummary({
          addressUsed: u.email,
          userId: u.id,
          user: u,
          volunteerProfileId: null,
          volunteerProfile: null,
          communicationThreadId: null,
          thread: null,
          crmContactKey: null,
        }),
        totalRecipientRows: 0,
        countByStatus: {},
        countByDeliveryHealth: {},
        eventTypeCounts: {},
        latestRecipientActivityAt: null,
        lastFailureSummary: null,
        recentSends: [],
        segmentMemberships: [],
        allHealth: [],
      });
    }
    return null;
  }

  const r0 = rows[0]!;
  const primaryIdentity = mapCommunicationRecipientIdentitySummary(r0);
  const recipientIds = rows.map((r) => r.id);
  const [bySt, byH, byEv, lastAct, failList] = await Promise.all([
    prisma.communicationRecipient.groupBy({
      by: ["status"],
      where: { id: { in: recipientIds } },
      _count: { _all: true },
    }),
    prisma.communicationRecipient.groupBy({
      by: ["deliveryHealthStatus"],
      where: { id: { in: recipientIds } },
      _count: { _all: true },
    }),
    prisma.communicationRecipientEvent.groupBy({
      by: ["eventType"],
      where: { communicationRecipientId: { in: recipientIds } },
      _count: { _all: true },
    }),
    prisma.communicationRecipientEvent.aggregate({
      where: { communicationRecipientId: { in: recipientIds } },
      _max: { occurredAt: true },
    }),
    prisma.communicationRecipientEvent.findMany({
      where: { communicationRecipientId: { in: recipientIds }, eventType: { in: ["FAILED", "BOUNCED", "UNSUBSCRIBED"] } },
      orderBy: { occurredAt: "desc" },
      take: 1,
    }),
  ]);

  const stMap = toStatusCounts(bySt);
  const hMap = toHealthCounts(byH);
  const evMap = toEventTypeCounts(byEv);
  const f0 = failList[0];
  const lastFailureSummary = f0
    ? formatRecipientEventSummaryLine({
        eventType: f0.eventType,
        providerName: f0.providerName,
        linkLabel: f0.linkLabel,
        linkUrl: f0.linkUrl,
      })
    : null;
  const healths = rows.map((r) => r.deliveryHealthStatus);
  const seenSend = new Map<string, (typeof rows)[0]>();
  for (const r of rows) {
    if (!seenSend.has(r.communicationSendId)) seenSend.set(r.communicationSendId, r);
  }
  const recentSends: ContactEngagementRecentSend[] = Array.from(seenSend.values())
    .slice(0, 10)
    .map((r) => ({
      communicationSendId: r.send.id,
      communicationPlanId: r.send.plan.id,
      planTitle: r.send.plan.title,
      channel: r.send.channel,
      sendStatus: r.send.status,
      recipientId: r.id,
      recipientStatus: r.status,
      lastActivityAt: lastAct._max.occurredAt?.toISOString() ?? null,
    }));

  const mOr: Prisma.CommsPlanAudienceSegmentMemberWhereInput[] = [];
  if (userId) mOr.push({ userId });
  if (volunteerProfileId) mOr.push({ volunteerProfileId });
  if (crmContactKey) mOr.push({ crmContactKey });
  if (communicationThreadId) {
    const th = await prisma.communicationThread.findUnique({
      where: { id: communicationThreadId },
      select: { userId: true },
    });
    if (th?.userId) mOr.push({ userId: th.userId });
  }

  const segmentMemberships =
    mOr.length > 0
      ? (
          await prisma.commsPlanAudienceSegmentMember.findMany({
            where: { OR: mOr },
            take: 50,
            include: { segment: { include: { plan: { select: { id: true, title: true } } } } },
          })
        ).map((m) => ({
          segmentId: m.segment.id,
          segmentName: m.segment.name,
          planId: m.segment.plan.id,
          planTitle: m.segment.plan.title,
        }))
      : [];

  return buildContactEngagementSummary({
    query: {
      userId: userId ?? null,
      volunteerProfileId: volunteerProfileId ?? null,
      communicationThreadId: communicationThreadId ?? null,
      crmContactKey: crmContactKey ?? null,
    },
    primaryIdentity,
    totalRecipientRows: rows.length,
    countByStatus: stMap,
    countByDeliveryHealth: hMap,
    eventTypeCounts: evMap,
    latestRecipientActivityAt: lastAct._max.occurredAt?.toISOString() ?? null,
    lastFailureSummary,
    recentSends,
    segmentMemberships,
    allHealth: healths,
  });
}
