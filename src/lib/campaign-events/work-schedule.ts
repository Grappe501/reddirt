/**
 * Kelly weekday work blocks: Mon–Fri 8:00–12:00 and 1:00–5:00 (America/Chicago).
 * Lunch gap 12:00–1:00 is not a work block — campaign events there may not need override.
 */
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { WorkHoursWarning } from "./types";

const TZ = "America/Chicago";

function chicagoWeekdaySun0(iso: string): number {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
}

function minutesSinceMidnightChicago(iso: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date(iso));
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hh * 60 + mm;
}

function overlapsBlock(startM: number, endM: number, blockStart: number, blockEnd: number): boolean {
  return startM < blockEnd && endM > blockStart;
}

export function evaluateWorkHoursWarning(item: CampaignCalendarItem): WorkHoursWarning {
  const sun0 = chicagoWeekdaySun0(item.start);
  if (sun0 === 0 || sun0 === 6) {
    return {
      show: false,
      badge: "Weekend",
      detail: "Weekday work-hour blocks do not apply on weekends.",
    };
  }

  if (item.allDay) {
    return {
      show: true,
      badge: "Work-hours override may be required",
      detail: "All-day weekday block — confirm this is intentional campaign time vs employer schedule.",
    };
  }

  const startM = minutesSinceMidnightChicago(item.start);
  const endM = item.end ? minutesSinceMidnightChicago(item.end) : startM + 60;
  const morning = overlapsBlock(startM, endM, 8 * 60, 12 * 60);
  const afternoon = overlapsBlock(startM, endM, 13 * 60, 17 * 60);
  const inWorkBlock = morning || afternoon;

  if (!inWorkBlock) {
    return {
      show: false,
      badge: "Outside work blocks",
      detail: "Timed outside Mon–Fri 8:00–12:00 and 1:00–5:00 (Central). Lunch hour 12:00–1:00 is open.",
    };
  }

  const blocks = [morning && "8:00–12:00", afternoon && "1:00–5:00"].filter(Boolean).join(" and ");
  return {
    show: true,
    badge: "Work-hours override may be required",
    detail: `Event overlaps Kelly’s ${blocks} work block(s) (Central). Future: flag explicit campaign override.`,
  };
}
