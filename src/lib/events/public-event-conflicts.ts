import type { EventItem } from "@/content/types";
import { eventCalendarDayKey, parseEventInstant, resolveEventStatus } from "@/lib/format/eventDisplay";
import { isKellyNotAttending } from "@/lib/events/public-event-kind";

function countsTowardKellyConflict(event: EventItem, now: Date): boolean {
  if (resolveEventStatus(event, now) !== "upcoming") return false;
  if (isKellyNotAttending(event)) return false;
  if (event.statewideVirtual) return false;
  if (event.fieldAttendance === "suggested" || event.fieldAttendance === "unscheduled") return false;
  return true;
}

function placeKey(event: EventItem): string {
  return (event.countySlug || event.city?.trim() || event.locationLabel || event.slug).trim().toLowerCase();
}

function windowsOverlap(a: EventItem, b: EventItem): boolean {
  const aStart = parseEventInstant(a.startsAt, a.timezone).getTime();
  const aEnd = parseEventInstant(a.endsAt ?? a.startsAt, a.timezone).getTime();
  const bStart = parseEventInstant(b.startsAt, b.timezone).getTime();
  const bEnd = parseEventInstant(b.endsAt ?? b.startsAt, b.timezone).getTime();
  return aStart < bEnd && bStart < aEnd;
}

/** Same-day public stops Kelly might attend in more than one place, or overlapping clocks. */
export function publicEventConflictSlugs(events: EventItem[], now: Date = new Date()): Set<string> {
  const byDay = new Map<string, EventItem[]>();
  for (const event of events) {
    if (!countsTowardKellyConflict(event, now)) continue;
    const day = eventCalendarDayKey(event);
    const list = byDay.get(day) ?? [];
    list.push(event);
    byDay.set(day, list);
  }

  const out = new Set<string>();
  for (const dayEvents of byDay.values()) {
    if (dayEvents.length < 2) continue;
    const places = new Set(dayEvents.map(placeKey));
    const counties = new Set(dayEvents.map((e) => e.countySlug).filter(Boolean));
    const stackedPlaces = places.size >= 2 || counties.size >= 2;
    const stackedClocks = dayEvents.some((a, i) => dayEvents.slice(i + 1).some((b) => windowsOverlap(a, b)));
    if (!stackedPlaces && !stackedClocks) continue;
    for (const event of dayEvents) out.add(event.slug);
  }
  return out;
}
