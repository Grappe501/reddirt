import type { EventItem } from "@/content/types";
import { parseEventInstant } from "@/lib/format/eventDisplay";
import {
  COUNTY_TO_VERIFY_EYEBROW,
  STATEWIDE_VIRTUAL_EYEBROW,
  countyNameFromAnySlug,
  eventCountySlugs,
  formatCountyEyebrow,
} from "@/lib/events/county-key";

const VIRTUAL_HINT = /\b(virtual|zoom|webinar|livestream)\b/i;

export function isStatewideVirtualEvent(event: EventItem): boolean {
  if (event.statewideVirtual) return true;
  const blob = `${event.locationLabel} ${event.addressLine ?? ""} ${event.title}`;
  return VIRTUAL_HINT.test(blob) && !event.countySlug;
}

export function publicCountyEyebrow(event: EventItem): string {
  if (isStatewideVirtualEvent(event) || event.statewideVirtual) return STATEWIDE_VIRTUAL_EYEBROW;
  if (event.opsFlags?.missingCounty) return COUNTY_TO_VERIFY_EYEBROW;
  const names = eventCountySlugs(event)
    .map((slug) => countyNameFromAnySlug(slug))
    .filter((name): name is NonNullable<typeof name> => Boolean(name));
  if (names.length === 0) return COUNTY_TO_VERIFY_EYEBROW;
  return names.map((name) => formatCountyEyebrow(name)).join(" · ");
}

export function publicEventCityLine(event: EventItem): string {
  if (event.statewideVirtual || isStatewideVirtualEvent(event)) return "Virtual";
  const city = event.city?.trim();
  if (city) return city.replace(/,\s*AR\b.*$/i, "").trim();
  return event.locationLabel.replace(/,\s*AR\b.*$/i, "").trim();
}

/** County-first meta: `Paragould · September 26 · 2:00 PM` */
export function formatCountyFirstMeta(event: EventItem): string {
  const city = publicEventCityLine(event);
  const start = parseEventInstant(event.startsAt, event.timezone);
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    timeZone: event.timezone,
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: event.timezone,
  });
  const date = dateFmt.format(start);
  if (event.opsFlags?.timeTbd) return `${city} · ${date} · Time TBA`;
  if (event.endsAt) {
    const end = parseEventInstant(event.endsAt, event.timezone);
    const startDay = new Intl.DateTimeFormat("en-CA", { timeZone: event.timezone }).format(start);
    const endDay = new Intl.DateTimeFormat("en-CA", { timeZone: event.timezone }).format(end);
    if (startDay === endDay) {
      return `${city} · ${date} · ${timeFmt.format(start)}–${timeFmt.format(end)}`;
    }
  }
  return `${city} · ${date} · ${timeFmt.format(start)}`;
}

export function formatMapEventLine(event: Pick<EventItem, "title" | "startsAt" | "timezone" | "opsFlags">): string {
  const start = parseEventInstant(event.startsAt, event.timezone);
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: event.timezone,
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: event.timezone,
  });
  const date = dateFmt.format(start);
  if (event.opsFlags?.timeTbd) return `${date} — ${event.title}`;
  return `${date} — ${event.title} · ${timeFmt.format(start)}`;
}
