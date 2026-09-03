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
  const pins: EventsMonthPin[] = [];
  for (const event of events) {
    if (event.fieldAttendance === "suggested" || event.fieldAttendance === "unscheduled") continue;
    try {
      pins.push({
        slug: event.slug,
        href: event.detailHref || `/events/${event.slug}`,
        ymd: eventCalendarDayKey(event),
        location: pinLocation(event),
      });
    } catch {
      // Skip a bad clock rather than take down /events.
    }
  }
  return pins;
}
