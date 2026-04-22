import type { CampaignEventType } from "@prisma/client";
import { PUBLIC_CALENDAR_DEFAULT_TZ, type PublicVenueMode } from "@/lib/calendar/public-event-types";

const TYPE_LABEL: Record<CampaignEventType, string> = {
  RALLY: "Rally",
  APPEARANCE: "Appearance",
  TRAINING: "Training",
  MEETING: "Meeting",
  CANVASS: "Canvass",
  PHONE_BANK: "Phone bank",
  FUNDRAISER: "Fundraiser",
  PRESS: "Press",
  DEADLINE: "Deadline",
  ORIENTATION: "Orientation",
  FESTIVAL: "Fair / festival",
  OTHER: "Event",
};

export function formatPublicEventType(t: CampaignEventType): string {
  return TYPE_LABEL[t] ?? t;
}

const VIRTUAL_HINT = /\b(virtual|zoom|online|webinar|livestream|teams\.microsoft|meet\.google|webex|\.zoom\.us)\b/i;

export function inferPublicVenueMode(input: {
  eventType: CampaignEventType;
  locationName: string | null;
  address: string | null;
}): PublicVenueMode {
  if (input.eventType === "PHONE_BANK") return "virtual";
  const blob = `${input.locationName ?? ""} ${input.address ?? ""}`;
  if (VIRTUAL_HINT.test(blob)) return "virtual";
  if (input.locationName?.trim() || input.address?.trim()) return "in_person";
  return "unspecified";
}

/** Format range line for list cards: date + time in event timezone. */
export function formatPublicEventWhenRange(
  startAt: Date,
  endAt: Date,
  timeZone: string
): { dateLine: string; timeLine: string } {
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || PUBLIC_CALENDAR_DEFAULT_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || PUBLIC_CALENDAR_DEFAULT_TZ,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const tz = timeZone || PUBLIC_CALENDAR_DEFAULT_TZ;
  return {
    dateLine: dateFmt.format(startAt),
    timeLine: `${timeFmt.format(startAt)} – ${timeFmt.format(endAt)}`,
  };
}

/**
 * YYYY-MM-DD in a given IANA zone for an instant.
 */
export function ymdInTimeZone(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || PUBLIC_CALENDAR_DEFAULT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(d)
    .replace(/\//g, "-");
}

export function isSameCalendarMonthInZone(
  d: Date,
  timeZone: string,
  year: number,
  month1: number
): boolean {
  const s = ymdInTimeZone(d, timeZone);
  const [y, m] = s.split("-").map((p) => parseInt(p, 10));
  return y === year && m === month1;
}

/** Location line for public display (no internal notes). */
export function buildPublicLocationLine(
  locationName: string | null,
  address: string | null,
  venueMode: PublicVenueMode
): string {
  if (venueMode === "virtual") {
    const one = (locationName || address || "").trim();
    return one || "Virtual";
  }
  const parts = [locationName, address].map((p) => (p || "").trim()).filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return venueMode === "unspecified" ? "Location TBA" : "";
}

export function daysInGregorianMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

/** Find a concrete instant on `ymd` in the given IANA zone (scans a narrow UTC window). */
export function findInstantOnYmd(ymd: string, timeZone: string): Date {
  const [Y, M, D] = ymd.split("-").map((p) => parseInt(p, 10));
  for (let dOff = 0; dOff < 2; dOff += 1) {
    for (let h = 0; h < 24; h += 1) {
      const t = new Date(Date.UTC(Y, M - 1, D + dOff, h, 0, 0, 0));
      if (ymdInTimeZone(t, timeZone) === ymd) return t;
    }
  }
  return new Date();
}

const W_ORDER = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

/**
 * Sunday=0..Saturday=6, weekday in `timeZone` for the calendar `ymd` in that zone.
 */
export function weekday0SundayYmd(ymd: string, timeZone: string): number {
  const t = findInstantOnYmd(ymd, timeZone);
  const w = t
    .toLocaleString("en-US", { timeZone, weekday: "short" })
    .toUpperCase()
    .replace(/\./g, "");
  const i = W_ORDER.findIndex((x) => w === x || w.startsWith(x));
  return i === -1 ? 0 : i;
}
