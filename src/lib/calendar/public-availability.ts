import { addDays, parse } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";

const TZ = "America/Chicago";

export type PublicAvailabilityWindow = {
  startAt: string;
  endAt: string;
  status: "open" | "soft_conflict" | "blocked";
  publicReason?: "travel" | "already_scheduled" | "workday" | "staff_review";
};

function ymdInChicago(d: Date): string {
  return formatInTimeZone(d, TZ, "yyyy-MM-dd");
}

function isoStartOfDayChicago(ymd: string): string {
  const wall = parse(`${ymd} 00:00:00`, "yyyy-MM-dd HH:mm:ss", new Date());
  return fromZonedTime(wall, TZ).toISOString();
}

function isoEndOfDayChicago(ymd: string): string {
  const wall = parse(`${ymd} 23:59:59.999`, "yyyy-MM-dd HH:mm:ss.SSS", new Date());
  return fromZonedTime(wall, TZ).toISOString();
}

/**
 * Sanitized availability: uses calendar density and weekday patterns only.
 * Never exposes private event titles or internal labels.
 */
export function buildSanitizedPublicAvailability(
  travelItems: CampaignCalendarItem[],
  opts?: { horizonDays?: number; anchorYmd?: string },
): PublicAvailabilityWindow[] {
  const horizon = opts?.horizonDays ?? 21;
  const anchor = opts?.anchorYmd
    ? parse(opts.anchorYmd, "yyyy-MM-dd", new Date())
    : new Date();

  const counts = new Map<string, number>();
  for (const it of travelItems) {
    const ymd = formatInTimeZone(new Date(it.start), TZ, "yyyy-MM-dd");
    counts.set(ymd, (counts.get(ymd) ?? 0) + 1);
  }

  const windows: PublicAvailabilityWindow[] = [];
  for (let i = 0; i < horizon; i++) {
    const d = addDays(anchor, i);
    const ymd = ymdInChicago(d);
    const weekday = formatInTimeZone(d, TZ, "EEEE");
    const isWeekend = weekday === "Saturday" || weekday === "Sunday";
    const scheduled = counts.get(ymd) ?? 0;

    let status: PublicAvailabilityWindow["status"] = "open";
    let publicReason: PublicAvailabilityWindow["publicReason"] | undefined;

    if (!isWeekend && scheduled >= 6) {
      status = "blocked";
      publicReason = "already_scheduled";
    } else if (!isWeekend && scheduled >= 3) {
      status = "soft_conflict";
      publicReason = "already_scheduled";
    } else if (isWeekend && scheduled >= 8) {
      status = "soft_conflict";
      publicReason = "travel";
    } else if (!isWeekend && scheduled >= 1) {
      status = "soft_conflict";
      publicReason = "workday";
    }

    const prev = counts.get(formatInTimeZone(addDays(d, -1), TZ, "yyyy-MM-dd")) ?? 0;
    const next = counts.get(formatInTimeZone(addDays(d, 1), TZ, "yyyy-MM-dd")) ?? 0;
    if (prev >= 5 && next >= 5 && status === "open") {
      status = "soft_conflict";
      publicReason = "travel";
    }

    if (status === "open" && !isWeekend && scheduled === 0) {
      publicReason = undefined;
    }

    windows.push({
      startAt: isoStartOfDayChicago(ymd),
      endAt: isoEndOfDayChicago(ymd),
      status,
      publicReason,
    });
  }

  return windows;
}

export function classifyInstantAgainstAvailability(
  instantIso: string,
  windows: PublicAvailabilityWindow[],
): PublicAvailabilityWindow | null {
  const t = new Date(instantIso).getTime();
  for (const w of windows) {
    const a = new Date(w.startAt).getTime();
    const b = new Date(w.endAt).getTime();
    if (t >= a && t <= b) return w;
  }
  return null;
}
