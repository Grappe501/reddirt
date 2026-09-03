import { events } from "@/content/events";
import { findInstantOnYmd, ymdInTimeZone } from "@/lib/calendar/public-event-format";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";
import { eventCalendarDayKey } from "@/lib/format/eventDisplay";
import { isPrismaLiveDataUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";
import { addYmd } from "@/lib/scheduler/calendar-range";
import {
  listSchedulerOwnedSlugs,
  loadSchedulerDbRowsBetween,
  syntheticPublicRow,
  type SchedulerQueueRow,
} from "@/lib/scheduler/load-queue";

export async function loadSchedulerCalendarRows(fromYmd: string, toYmd: string): Promise<SchedulerQueueRow[]> {
  const from = findInstantOnYmd(fromYmd, PUBLIC_CALENDAR_DEFAULT_TZ);
  const toExclusive = findInstantOnYmd(addYmd(toYmd, 1), PUBLIC_CALENDAR_DEFAULT_TZ);

  try {
    const dbRows = await loadSchedulerDbRowsBetween(from, toExclusive);
    const staticInRange = events.filter((event) => {
      const ymd = eventCalendarDayKey(event);
      return ymd >= fromYmd && ymd <= toYmd && event.fieldAttendance !== "suggested" && event.fieldAttendance !== "unscheduled";
    });
    const owned = await listSchedulerOwnedSlugs(staticInRange.map((event) => event.slug));
    const leftover = staticInRange.filter((event) => !owned.has(event.slug)).map(syntheticPublicRow);
    return [...dbRows, ...leftover].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  } catch (e) {
    if (!isPrismaLiveDataUnavailable(e)) throw e;
    logPrismaDatabaseUnavailable("loadSchedulerCalendarRows", e);
    return events
      .filter((event) => {
        const ymd = eventCalendarDayKey(event);
        return ymd >= fromYmd && ymd <= toYmd && event.fieldAttendance !== "suggested" && event.fieldAttendance !== "unscheduled";
      })
      .map(syntheticPublicRow);
  }
}

export function groupSchedulerRowsByYmd(rows: SchedulerQueueRow[]): Map<string, SchedulerQueueRow[]> {
  const groups = new Map<string, SchedulerQueueRow[]>();
  for (const row of rows) {
    const ymd = ymdInTimeZone(row.startAt, PUBLIC_CALENDAR_DEFAULT_TZ);
    const list = groups.get(ymd) ?? [];
    list.push(row);
    groups.set(ymd, list);
  }
  return groups;
}
