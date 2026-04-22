import { addDays, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TZ = "America/Chicago";

export type EventSchedulePreset = "all" | "today" | "this_week" | "upcoming";

/** Campaign-default Central Time windows for /events operations filters. */
export function eventMatchesSchedulePreset(
  startsAtIso: string,
  endsAtIso: string | undefined,
  preset: EventSchedulePreset,
): boolean {
  if (preset === "all") return true;
  const start = new Date(startsAtIso);
  const end = endsAtIso ? new Date(endsAtIso) : start;
  const now = new Date();

  if (preset === "upcoming") {
    return end >= now;
  }

  if (preset === "today") {
    const key = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    return key(start) === key(now);
  }

  if (preset === "this_week") {
    if (end < now) return false;
    const zNow = toZonedTime(now, TZ);
    const dayStart = startOfDay(zNow);
    const weekEnd = addDays(dayStart, 7);
    const zStart = toZonedTime(start, TZ);
    return zStart >= dayStart && zStart < weekEnd;
  }

  return true;
}
