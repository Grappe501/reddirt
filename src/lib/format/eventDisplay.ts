import type { EventItem, EventStatus } from "@/content/types";

function calendarDayInZone(iso: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(iso);
}

/**
 * “Timing” line: always includes month (and day) in the event time zone, plus clock times.
 */
export function formatEventWhen(ev: EventItem): { primary: string; secondary?: string } {
  const start = new Date(ev.startsAt);
  const end = ev.endsAt ? new Date(ev.endsAt) : null;
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

export function parseEventInstant(iso: string, _timeZone?: string): Date {
  return new Date(iso);
}

export function resolveEventStatus(event: EventItem, now: Date = new Date()): EventStatus {
  const end = parseEventInstant(event.endsAt ?? event.startsAt, event.timezone);
  if (Number.isNaN(end.getTime())) return event.status;
  return end.getTime() < now.getTime() ? "past" : "upcoming";
}

export function stripPublicMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}

export function eventCalendarDayKey(event: EventItem): string {
  return calendarDayInZone(parseEventInstant(event.startsAt, event.timezone), event.timezone || "America/Chicago");
}

export function compareEventsForHub(a: EventItem, b: EventItem, _now?: Date): number {
  return a.startsAt.localeCompare(b.startsAt) || a.title.localeCompare(b.title);
}
