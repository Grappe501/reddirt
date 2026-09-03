import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";
import { daysInGregorianMonth, findInstantOnYmd, weekday0SundayYmd, ymdInTimeZone } from "@/lib/calendar/public-event-format";

export const SCHEDULER_CAMPAIGN_END_YMD = "2026-11-03";

export type SchedulerCalendarView = "day" | "week" | "month" | "campaign";

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

export function chicagoTodayYmd(now = new Date()): string {
  return ymdInTimeZone(now, PUBLIC_CALENDAR_DEFAULT_TZ);
}

export function parseSchedulerCalendarView(raw: string | undefined): SchedulerCalendarView {
  if (raw === "day" || raw === "week" || raw === "month" || raw === "campaign") return raw;
  return "week";
}

export function parseSchedulerCalendarYmd(raw: string | undefined, fallbackYmd: string): string {
  if (!raw || !YMD.test(raw)) return fallbackYmd;
  return raw;
}

export function addYmd(ymd: string, days: number): string {
  const match = YMD.exec(ymd);
  if (!match) return ymd;
  const dt = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

export function startOfWeekSunday(ymd: string): string {
  return addYmd(ymd, -weekday0SundayYmd(ymd, PUBLIC_CALENDAR_DEFAULT_TZ));
}

export function monthStartYmd(ymd: string): string {
  return `${ymd.slice(0, 7)}-01`;
}

export function monthEndYmd(ymd: string): string {
  const year = Number(ymd.slice(0, 4));
  const month = Number(ymd.slice(5, 7));
  return `${ymd.slice(0, 7)}-${String(daysInGregorianMonth(year, month)).padStart(2, "0")}`;
}

export function addMonthsYmd(ymd: string, months: number): string {
  const year = Number(ymd.slice(0, 4));
  const month = Number(ymd.slice(5, 7));
  const day = Number(ymd.slice(8, 10));
  const dt = new Date(Date.UTC(year, month - 1 + months, 1));
  const last = daysInGregorianMonth(dt.getUTCFullYear(), dt.getUTCMonth() + 1);
  const clamped = Math.min(day, last);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}

export function shiftCalendarDate(view: SchedulerCalendarView, dateYmd: string, delta: -1 | 1): string {
  if (view === "day") return addYmd(dateYmd, delta);
  if (view === "week") return addYmd(dateYmd, delta * 7);
  if (view === "month") return addMonthsYmd(dateYmd, delta);
  return dateYmd;
}

export function campaignRemainingRange(todayYmd: string): { from: string; to: string } | null {
  if (todayYmd > SCHEDULER_CAMPAIGN_END_YMD) return null;
  return { from: todayYmd, to: SCHEDULER_CAMPAIGN_END_YMD };
}

export function resolveCalendarLoadRange(
  view: SchedulerCalendarView,
  dateYmd: string,
  todayYmd: string,
): { from: string; to: string } | null {
  if (view === "campaign") return campaignRemainingRange(todayYmd);
  if (view === "day") return { from: dateYmd, to: dateYmd };
  if (view === "week") {
    const start = startOfWeekSunday(dateYmd);
    return { from: start, to: addYmd(start, 6) };
  }
  const start = monthStartYmd(dateYmd);
  const end = monthEndYmd(dateYmd);
  return { from: startOfWeekSunday(start), to: addYmd(startOfWeekSunday(end), 6) };
}

export function monthsOverlapping(fromYmd: string, toYmd: string): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  let year = Number(fromYmd.slice(0, 4));
  let month = Number(fromYmd.slice(5, 7));
  const endYear = Number(toYmd.slice(0, 4));
  const endMonth = Number(toYmd.slice(5, 7));
  while (year < endYear || (year === endYear && month <= endMonth)) {
    out.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return out;
}

export function eachYmd(fromYmd: string, toYmd: string): string[] {
  const days: string[] = [];
  let cursor = fromYmd;
  while (cursor <= toYmd) {
    days.push(cursor);
    cursor = addYmd(cursor, 1);
  }
  return days;
}

export function formatYmdLong(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PUBLIC_CALENDAR_DEFAULT_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(findInstantOnYmd(ymd, PUBLIC_CALENDAR_DEFAULT_TZ));
}

export function formatYmdMedium(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PUBLIC_CALENDAR_DEFAULT_TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(findInstantOnYmd(ymd, PUBLIC_CALENDAR_DEFAULT_TZ));
}

export function formatMonthYear(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PUBLIC_CALENDAR_DEFAULT_TZ,
    month: "long",
    year: "numeric",
  }).format(findInstantOnYmd(monthStartYmd(ymd), PUBLIC_CALENDAR_DEFAULT_TZ));
}

export function formatSchedulerClock(at: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PUBLIC_CALENDAR_DEFAULT_TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(at);
}

export function calendarHeading(view: SchedulerCalendarView, dateYmd: string): string {
  if (view === "day") return formatYmdLong(dateYmd);
  if (view === "week") return `Week of ${formatYmdMedium(startOfWeekSunday(dateYmd))}`;
  if (view === "month") return formatMonthYear(dateYmd);
  return "Now through November 3, 2026";
}
