import type { EventItem } from "@/content/types";
import { eventCalendarDayKey, parseEventInstant, resolveEventStatus } from "@/lib/format/eventDisplay";
import { isPublicCalendarEvent } from "@/lib/events/campaign-approach";
import { isKellyNotAttending } from "@/lib/events/public-event-kind";

function countsTowardKellyConflict(event: EventItem, now: Date): boolean {
  if (resolveEventStatus(event, now) !== "upcoming") return false;
  if (isKellyNotAttending(event)) return false;
  if (event.statewideVirtual) return false;
  if (!isPublicCalendarEvent(event)) return false;
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

/** Steve-locked same-day runs — not “pick one.” */
const PLANNED_TRAVEL_DAYS: readonly ReadonlySet<string>[] = [
  new Set(["stuttgart-sep-12-2026", "cleveland-county-meet-and-greet-2026"]),
  new Set(["beatles-on-the-ridge-2026", "hot-spring-county-cookout-2026"]),
  new Set([
    "clark-county-multi-church-tour-2026-09-20",
    "dequeen-sep-20-2026",
    "beckys-texarkana-2026-09-20",
  ]),
  new Set(["marche-day-2026", "greene-county-candidate-forum-2026-09-26"]),
  new Set([
    "hot-springs-chili-cookout-2026",
    "ayc-karaoke-hot-springs-2026-10-11",
    "hot-springs-film-festival-2026-10-11",
    "hot-springs-church-naacp-braver-angels-2026-10-11",
  ]),
];

function isPlannedTravelDay(dayEvents: EventItem[]): boolean {
  const slugs = new Set(dayEvents.map((e) => e.slug));
  return PLANNED_TRAVEL_DAYS.some((planned) => [...planned].filter((slug) => slugs.has(slug)).length >= 2);
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
    if (isPlannedTravelDay(dayEvents)) continue;
    const places = new Set(dayEvents.map(placeKey));
    const counties = new Set(dayEvents.map((e) => e.countySlug).filter(Boolean));
    const stackedPlaces = places.size >= 2 || counties.size >= 2;
    const stackedClocks = dayEvents.some((a, i) => dayEvents.slice(i + 1).some((b) => windowsOverlap(a, b)));
    if (!stackedPlaces && !stackedClocks) continue;
    for (const event of dayEvents) out.add(event.slug);
  }
  return out;
}
