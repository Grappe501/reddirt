import { events } from "@/content/events";
import { ymdInTimeZone } from "@/lib/calendar/public-event-format";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import { PUBLIC_CALENDAR_DEFAULT_TZ, type PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { mergeMovementAndCalendarEvents } from "@/lib/events/calendar-to-movement-event";
import { compareEventsForHub, eventCalendarDayKey } from "@/lib/format/eventDisplay";
import { isPrismaLiveDataUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";
import { monthsOverlapping } from "@/lib/scheduler/calendar-range";
import { hydrateSchedulerRowsFromEvents, type SchedulerQueueRow } from "@/lib/scheduler/load-queue";

function uniquePublicEvents(rows: PublicCampaignEvent[]): PublicCampaignEvent[] {
  const bySlug = new Map<string, PublicCampaignEvent>();
  for (const row of rows) bySlug.set(row.slug, row);
  return [...bySlug.values()];
}

export async function loadSchedulerCalendarRows(fromYmd: string, toYmd: string): Promise<SchedulerQueueRow[]> {
  const now = new Date();
  let calendarRows: PublicCampaignEvent[] = [];
  try {
    const chunks = await Promise.all(
      monthsOverlapping(fromYmd, toYmd).map((monthYear) => queryPublicCampaignEvents({ monthYear }, { take: 200 })),
    );
    calendarRows = uniquePublicEvents(chunks.flat());
  } catch (e) {
    if (!isPrismaLiveDataUnavailable(e)) throw e;
    logPrismaDatabaseUnavailable("loadSchedulerCalendarRows", e);
  }

  const merged = mergeMovementAndCalendarEvents(events, calendarRows)
    .filter((event) => event.fieldAttendance !== "suggested" && event.fieldAttendance !== "unscheduled")
    .filter((event) => {
      const ymd = eventCalendarDayKey(event);
      return ymd >= fromYmd && ymd <= toYmd;
    })
    .sort((a, b) => compareEventsForHub(a, b, now));

  return hydrateSchedulerRowsFromEvents(merged);
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
