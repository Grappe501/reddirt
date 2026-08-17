import { fromZonedTime } from "date-fns-tz";
import type { EventItem, EventStatus } from "@/content/types";

function calendarDayInZone(iso: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(iso);
}

const HAS_EXPLICIT_OFFSET = /[zZ]$|[+-]\d{2}:\d{2}$/;

/**
 * Curated movement rows use naive ISO (`2026-04-25T09:00:00`) meaning wall clock in `timezone`.
 * CampaignOS rows use `toISOString()` (UTC with `Z`). Treat those as absolute instants.
 */
export function parseEventInstant(iso: string, timeZone: string): Date {
  const trimmed = iso.trim();
  if (HAS_EXPLICIT_OFFSET.test(trimmed)) {
    return new Date(trimmed);
  }
  return fromZonedTime(trimmed, timeZone);
}

export function resolveEventStatus(
  ev: Pick<EventItem, "startsAt" | "endsAt" | "timezone">,
  now: Date = new Date(),
): EventStatus {
  const tz = ev.timezone || "America/Chicago";
  const start = parseEventInstant(ev.startsAt, tz);
  const startYmd = calendarDayInZone(start, tz);
  const nowYmd = calendarDayInZone(now, tz);
  if (startYmd < nowYmd) return "past";
  const end = parseEventInstant(ev.endsAt ?? ev.startsAt, tz);
  return end.getTime() >= now.getTime() ? "upcoming" : "past";
}

export function withLiveEventStatus(event: EventItem, now: Date = new Date()): EventItem {
  return { ...event, status: resolveEventStatus(event, now) };
}

/** Strip leaked `**bold**` / `*italic*` markers from public card and detail copy. */
export function stripPublicMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}

export function compareEventsForHub(a: EventItem, b: EventItem, now: Date = new Date()): number {
  const aStatus = resolveEventStatus(a, now);
  const bStatus = resolveEventStatus(b, now);
  const aStart = parseEventInstant(a.startsAt, a.timezone).getTime();
  const bStart = parseEventInstant(b.startsAt, b.timezone).getTime();
  if (aStatus !== bStatus) return aStatus === "upcoming" ? -1 : 1;
  if (aStatus === "upcoming") return aStart - bStart;
  return bStart - aStart;
}

/**
 * “Timing” line: always includes month (and day) in the event time zone, plus clock times.
 */
export function formatEventWhen(ev: EventItem): { primary: string; secondary?: string } {
  const start = parseEventInstant(ev.startsAt, ev.timezone);
  const end = ev.endsAt ? parseEventInstant(ev.endsAt, ev.timezone) : null;
  const tz = ev.timezone;
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: tz,
  });
  const monthShortDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: tz });
  const timeOnly = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });
  const timeWithZone = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
    timeZoneName: "short",
  });
  const primary = dateFmt.format(start);

  if (ev.opsFlags?.timeTbd) {
    return { primary, secondary: `${monthShortDay.format(start)} · Time TBA` };
  }

  let secondary: string;
  if (!end) {
    secondary = `${monthShortDay.format(start)} · ${timeWithZone.format(start)}`;
  } else if (calendarDayInZone(start, tz) === calendarDayInZone(end, tz)) {
    secondary = `${monthShortDay.format(start)} · ${timeOnly.format(start)} – ${timeWithZone.format(end)}`;
  } else {
    secondary = `${monthShortDay.format(start)}, ${timeWithZone.format(start)} – ${monthShortDay.format(end)}, ${timeWithZone.format(end)}`;
  }
  return { primary, secondary };
}

/** YYYY-MM-DD in the event timezone — for grouping trail days. */
export function eventCalendarDayKey(ev: Pick<EventItem, "startsAt" | "timezone">): string {
  return calendarDayInZone(parseEventInstant(ev.startsAt, ev.timezone), ev.timezone);
}
