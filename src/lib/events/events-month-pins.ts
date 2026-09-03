import type { EventItem } from "@/content/types";
import { eventCalendarDayKey } from "@/lib/format/eventDisplay";

export type EventsMonthPin = {
  slug: string;
  href: string;
  ymd: string;
  location: string;
};

function pinLocation(event: EventItem): string {
  const city = event.city?.trim();
  if (city) return city;
  const raw = event.locationLabel?.trim() || "Arkansas";
  return raw.split(/\s+[—–-]\s+|,\s*/)[0]?.trim() || raw;
}

export function eventsToMonthPins(events: EventItem[]): EventsMonthPin[] {
  return events
    .filter((event) => event.fieldAttendance !== "suggested" && event.fieldAttendance !== "unscheduled")
    .map((event) => ({
      slug: event.slug,
      href: event.detailHref || `/events/${event.slug}`,
      ymd: eventCalendarDayKey(event),
      location: pinLocation(event),
    }));
}
