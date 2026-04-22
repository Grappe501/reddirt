import { EventWorkflowState, TimeMatrixQuadrant, CampaignEventStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { endOfWeekExclusive, weekStartDateFromKey } from "@/lib/calendar/weekly-time";
import type { CalendarHqFilters } from "@/lib/calendar/hq-filters";
import { whereForCalendar } from "@/lib/calendar/hq-filters";
import { countScheduleConflicts, detectOverpackedDays, detectScheduleOverlaps, type EventLine } from "@/lib/calendar/ai-insights";

export function whereForFilters(f: CalendarHqFilters) {
  return whereForCalendar(f);
}

export function computeTimeMatrixStats(
  events: { startAt: Date; endAt: Date; timeMatrixQuadrant: TimeMatrixQuadrant }[]
) {
  const acc = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, totalH: 0, q2Share: 0, reactiveUrgent: 0 };
  for (const e of events) {
    const h = Math.max(0, (+e.endAt - +e.startAt) / 36e5);
    acc.totalH += h;
    const k = e.timeMatrixQuadrant;
    if (k === "Q1") acc.Q1 += h;
    else if (k === "Q2") acc.Q2 += h;
    else if (k === "Q3") acc.Q3 += h;
    else acc.Q4 += h;
  }
  if (acc.totalH > 0) {
    acc.q2Share = acc.Q2 / acc.totalH;
    acc.reactiveUrgent = (acc.Q1 + acc.Q3) / acc.totalH;
  }
  return acc;
}

export function q2IsTooLow(stats: ReturnType<typeof computeTimeMatrixStats>, minQ2 = 0.25) {
  if (stats.totalH <= 0) return false;
  return stats.q2Share < minQ2;
}

export function isTooReactive(stats: ReturnType<typeof computeTimeMatrixStats>, thr = 0.45) {
  if (stats.totalH <= 0) return false;
  return stats.reactiveUrgent > thr;
}

function travelLabelForWeek(
  events: { startAt: Date; endAt: Date; countyId: string | null }[]
): { label: string; crossCountyDayCount: number } {
  const byDay = new Map<string, Set<string>>();
  for (const e of events) {
    if (!e.countyId) continue;
    const d = e.startAt.toDateString();
    if (!byDay.has(d)) byDay.set(d, new Set());
    byDay.get(d)!.add(e.countyId);
  }
  let cross = 0;
  for (const s of byDay.values()) {
    if (s.size >= 2) cross += 1;
  }
  const h = events.reduce((t, e) => t + Math.max(0, (+e.endAt - +e.startAt) / 36e5), 0);
  return {
    label: cross ? `${cross} multi-county day(s), ~${h.toFixed(1)}h in blocks` : `~${h.toFixed(1)}h scheduled (single-county days)`,
    crossCountyDayCount: cross,
  };
}

export async function getCountyNeglectNarrative(lookbackDays = 45) {
  const since = new Date();
  since.setDate(since.getDate() - lookbackDays);
  const withCounty = await prisma.campaignEvent.findMany({
    where: { startAt: { gte: since, lte: new Date() }, countyId: { not: null } },
    select: { countyId: true },
  });
  const touched = new Set(withCounty.map((c) => c.countyId!));
  const all = await prisma.county.findMany({ select: { id: true, displayName: true }, orderBy: { displayName: "asc" } });
  return all.filter((c) => !touched.has(c.id));
}

export async function listEventsForWeek(weekKey: string, f: CalendarHqFilters, quadrant: TimeMatrixQuadrant | "ALL" = "ALL") {
  const a = weekStartDateFromKey(weekKey);
  const b = endOfWeekExclusive(weekKey);
  const q =
    quadrant === "ALL" ? {} : { timeMatrixQuadrant: quadrant as TimeMatrixQuadrant };
  return prisma.campaignEvent.findMany({
    where: { ...whereForCalendar(f), startAt: { gte: a, lt: b }, ...q },
    orderBy: { startAt: "asc" },
    take: 500,
    include: {
      county: { select: { displayName: true, id: true } },
      ownerUser: { select: { id: true, name: true, email: true } },
      calendarSource: {
        select: {
          id: true,
          label: true,
          displayName: true,
          color: true,
          sourceType: true,
          isPublicFacing: true,
        },
      },
    },
  });
}

const planInclude = {
  bigRocks: {
    orderBy: { sortOrder: "asc" as const },
    include: { event: { select: { id: true, title: true, startAt: true, endAt: true, isBigRock: true, timeMatrixQuadrant: true, eventType: true } } },
  },
} as const;

export async function getOrCreateWeeklyPlan(weekKey: string) {
  const weekStart = weekStartDateFromKey(weekKey);
  return prisma.weeklyCampaignPlan.upsert({
    where: { weekStart },
    create: { weekStart },
    update: {},
    include: planInclude,
  });
}

const RIBBON = [
  EventWorkflowState.DRAFT,
  EventWorkflowState.PENDING_APPROVAL,
  EventWorkflowState.APPROVED,
  EventWorkflowState.PUBLISHED,
  EventWorkflowState.CANCELED,
  EventWorkflowState.COMPLETED,
] as const;

export async function listEventsForWeekByRibbon(weekKey: string, f: CalendarHqFilters) {
  const a = weekStartDateFromKey(weekKey);
  const b = endOfWeekExclusive(weekKey);
  const base = { ...whereForCalendar(f), startAt: { gte: a, lt: b } };
  const lists = await Promise.all(
    RIBBON.map((state) =>
      prisma.campaignEvent.findMany({
        where: { ...base, eventWorkflowState: state },
        orderBy: { startAt: "asc" },
        take: 40,
        include: {
          county: { select: { displayName: true } },
          ownerUser: { select: { name: true, email: true } },
        },
      })
    )
  );
  return Object.fromEntries(RIBBON.map((state, i) => [state, lists[i]!])) as Record<
    (typeof RIBBON)[number],
    (typeof lists)[0]
  >;
}

export type RibbonBucket = (typeof RIBBON)[number];

export async function getCommandStripMetrics(weekKey: string, f: CalendarHqFilters) {
  const a = weekStartDateFromKey(weekKey);
  const b = endOfWeekExclusive(weekKey);
  const base = { ...whereForCalendar(f), startAt: { gte: a, lt: b } };
  const events = await prisma.campaignEvent.findMany({
    where: base,
    select: { title: true, startAt: true, endAt: true, timeMatrixQuadrant: true, countyId: true },
  });
  const lines: EventLine[] = events.map((e) => ({
    title: e.title,
    startAt: e.startAt,
    endAt: e.endAt,
  }));
  const conflicts = countScheduleConflicts(lines);
  const overpacked = detectOverpackedDays(lines);
  const { label: travelLoad } = travelLabelForWeek(events);
  const [pendingApproval, cancellWeek, stageInWeek] = await Promise.all([
    prisma.campaignEvent.count({ where: { ...whereForCalendar(f), eventWorkflowState: EventWorkflowState.PENDING_APPROVAL } }),
    prisma.campaignEvent.count({
      where: { ...whereForCalendar(f), status: CampaignEventStatus.CANCELLED, updatedAt: { gte: a } },
    }),
    prisma.campaignEvent.groupBy({ by: ["eventWorkflowState"], where: base, _count: { _all: true } }),
  ]);
  const gaps = (await getCountyNeglectNarrative(45)).slice(0, 6);
  const weekStageCounts: Partial<Record<EventWorkflowState, number>> = {};
  for (const g of stageInWeek) {
    weekStageCounts[g.eventWorkflowState] = g._count._all;
  }
  return {
    conflicts,
    overpacked,
    travelLoad,
    pendingApproval,
    cancellWeek,
    matrix: computeTimeMatrixStats(events),
    countyGapCount: gaps.length,
    countyGaps: gaps,
    weekStageCounts,
  };
}

/** `ym` = YYYY-MM */
export async function listEventsForMonth(ym: string, f: CalendarHqFilters) {
  const parts = ym.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!y || !m || m < 1 || m > 12) return [];
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return prisma.campaignEvent.findMany({
    where: { ...whereForCalendar(f), startAt: { gte: start, lte: end } },
    orderBy: { startAt: "asc" },
    take: 600,
    include: { county: { select: { displayName: true } } },
  });
}

export async function getConflictLinesForWeek(weekKey: string, f: CalendarHqFilters) {
  const a = weekStartDateFromKey(weekKey);
  const b = endOfWeekExclusive(weekKey);
  const events = await prisma.campaignEvent.findMany({
    where: { ...whereForCalendar(f), startAt: { gte: a, lt: b } },
    select: { title: true, startAt: true, endAt: true },
  });
  const lines: EventLine[] = events.map((e) => ({ title: e.title, startAt: e.startAt, endAt: e.endAt }));
  return detectScheduleOverlaps(lines);
}
