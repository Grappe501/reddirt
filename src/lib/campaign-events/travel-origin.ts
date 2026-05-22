/**
 * Travel origin defaults for mileage (city-level; address optional).
 * Tue/Fri → Little Rock work base; other weekdays → Rose Bud unless overnight staging applies.
 */
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { TravelOriginHint } from "./types";

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

export function resolveDefaultTravelOrigin(item: CampaignCalendarItem): TravelOriginHint {
  if (item.overnightCity?.trim()) {
    const city = item.overnightCity.trim();
    return {
      originCity: city,
      originLabel: `${city} (prior overnight / staging)`,
      rule: "calendar_overnight",
      note: "Calendar lists overnight staging — confirm before locking mileage.",
    };
  }

  const sun0 = chicagoWeekdaySun0(item.start);
  if (sun0 === 2 || sun0 === 5) {
    return {
      originCity: "Little Rock",
      originLabel: "Little Rock, AR (Tuesday/Friday work rule)",
      rule: "little_rock_tue_fri",
      note: "Kelly works in Little Rock every Tuesday and Friday — default mileage origin for those days.",
    };
  }

  return {
    originCity: "Rose Bud",
    originLabel: "Rose Bud, AR (home base)",
    rule: "rose_bud_home",
    note: "Default origin when not Tuesday/Friday and no overnight staging is on file.",
  };
}
