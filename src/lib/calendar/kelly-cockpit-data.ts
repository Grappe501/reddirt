import type { LocalCoverageRequest } from "@prisma/client";
import {
  CalendarAlertChannel,
  CalendarAlertSeverity,
  CalendarAlertStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { loadTravelCalendarItems } from "./load-travel-calendar-data";
import { alertsToDto, mergeKellyCockpitData, sortApprovalQueue, todayTomorrowWeekKeys } from "./kelly-cockpit-merge";
import type { CalendarAlertDto, EnrichedCalendarItem } from "./kelly-cockpit-types";

export type KellyCockpitBundle = {
  enriched: EnrichedCalendarItem[];
  alerts: CalendarAlertDto[];
  hasDb: boolean;
  dbError?: string;
  todayYmd: string;
  tomorrowYmd: string;
  weekEndYmd: string;
};

async function bootstrapConflictAndUrgencyAlerts(items: EnrichedCalendarItem[]): Promise<void> {
  const caps = 80;
  let n = 0;
  for (const it of items) {
    if (n >= caps) break;
    if (it.calendarStatus === "conflict") {
      const dedupeKey = `conflict-${it.id}`;
      await prisma.calendarAlert.upsert({
        where: { dedupeKey },
        create: {
          calendarItemId: it.id,
          alertType: "CALENDAR_CONFLICT",
          severity: CalendarAlertSeverity.HIGH,
          title: "Schedule conflict",
          body: `Overlapping or conflicting block: ${it.title}`,
          channel: CalendarAlertChannel.IN_APP,
          status: CalendarAlertStatus.PENDING,
          dedupeKey,
        },
        update: { status: CalendarAlertStatus.PENDING },
      });
      n++;
    }
    const hours = (new Date(it.start).getTime() - Date.now()) / 3600000;
    if (it.kellyApprovalState === "needs_kelly_review" && hours > 0 && hours <= 72) {
      const day = it.start.slice(0, 10);
      const dedupeKey = `kelly-urgent-${it.id}-${day}`;
      await prisma.calendarAlert.upsert({
        where: { dedupeKey },
        create: {
          calendarItemId: it.id,
          alertType: "KELLY_APPROVAL_URGENT",
          severity: CalendarAlertSeverity.CRITICAL,
          title: "Needs Kelly approval (within 72h)",
          body: it.title,
          dueAt: new Date(it.start),
          channel: CalendarAlertChannel.IN_APP,
          status: CalendarAlertStatus.PENDING,
          dedupeKey,
        },
        update: {},
      });
      n++;
    }
  }
}

export async function loadKellyCockpitBundle(): Promise<KellyCockpitBundle> {
  const { todayYmd, tomorrowYmd, weekEndYmd } = todayTomorrowWeekKeys();
  const items = loadTravelCalendarItems().filter((i) => !i.excludeFromKellyCockpit);
  try {
    const ids = items.map((i) => i.id);
    if (ids.length === 0) {
      return { enriched: [], alerts: [], hasDb: true, todayYmd, tomorrowYmd, weekEndYmd };
    }
    const [decisions, locals, promotions, pendingAlerts] = await Promise.all([
      prisma.kellyCalendarDecision.findMany({
        where: { calendarItemId: { in: ids } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.localCoverageRequest.findMany({
        where: { calendarItemId: { in: ids } },
      }),
      prisma.kellyCalendarPromotion.findMany({
        where: { calendarItemId: { in: ids } },
      }),
      prisma.calendarAlert.findMany({
        where: { calendarItemId: { in: ids }, status: { in: [CalendarAlertStatus.PENDING, CalendarAlertStatus.SNOOZED] } },
        orderBy: { createdAt: "desc" },
        take: 400,
      }),
    ]);
    const promoted = new Set(promotions.map((p) => p.calendarItemId));
    const localByItem = new Map<string, LocalCoverageRequest[]>();
    for (const r of locals) {
      const arr = localByItem.get(r.calendarItemId) ?? [];
      arr.push(r);
      localByItem.set(r.calendarItemId, arr);
    }
    let enriched = mergeKellyCockpitData(items, decisions, localByItem, promoted);
    enriched = sortApprovalQueue(enriched);
    await bootstrapConflictAndUrgencyAlerts(enriched).catch(() => {});
    const refreshed = await prisma.calendarAlert.findMany({
      where: { calendarItemId: { in: ids }, status: { in: [CalendarAlertStatus.PENDING, CalendarAlertStatus.SNOOZED] } },
      orderBy: { createdAt: "desc" },
      take: 400,
    });
    return {
      enriched,
      alerts: alertsToDto(refreshed),
      hasDb: true,
      todayYmd,
      tomorrowYmd,
      weekEndYmd,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const promoted = new Set<string>();
    const localByItem = new Map();
    const enriched = sortApprovalQueue(mergeKellyCockpitData(items, [], localByItem, promoted));
    return { enriched, alerts: [], hasDb: false, dbError: msg, todayYmd, tomorrowYmd, weekEndYmd };
  }
}
