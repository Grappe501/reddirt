import type { EventItem } from "@/content/types";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";
import { findInstantOnYmd, ymdInTimeZone } from "@/lib/calendar/public-event-format";
import { mergeMovementAndCalendarEvents } from "@/lib/events/calendar-to-movement-event";

export const CAMPAIGN_PLANNING_HOME_BASE = {
  label: "Rose Bud, Arkansas",
  note: "When nothing is on the public calendar, we assume home base in Rose Bud for travel math.",
} as const;

export type PlanningCalendarEvent = {
  id: string;
  title: string;
  locationLine: string;
  href: string;
  startAt: Date;
  endAt: Date;
};

export type PlanningDaySlice = {
  ymd: string;
  weekdayLabel: string;
  availability: "open" | "busy";
  events: Array<{ title: string; locationLine: string; href: string }>;
  anchor: "scheduled" | "home";
  /** One-line for hosts (travel / context). */
  summary: string;
};

export type PlanningAvailabilityResponse = {
  timezone: string;
  homeBase: typeof CAMPAIGN_PLANNING_HOME_BASE;
  proposedYmd: string;
  proposed: PlanningDaySlice;
  dayBefore: PlanningDaySlice;
  dayAfter: PlanningDaySlice;
};

const TZ = PUBLIC_CALENDAR_DEFAULT_TZ;

function addCalendarDaysYmd(ymd: string, delta: number): string {
  const t0 = findInstantOnYmd(ymd, TZ);
  const t1 = new Date(t0.getTime() + delta * 24 * 60 * 60 * 1000);
  return ymdInTimeZone(t1, TZ);
}

function dayBounds(ymd: string): { start: Date; endExclusive: Date } {
  const start = findInstantOnYmd(ymd, TZ);
  const endExclusive = findInstantOnYmd(addCalendarDaysYmd(ymd, 1), TZ);
  return { start, endExclusive };
}

function overlapsDay(ev: PlanningCalendarEvent, ymd: string): boolean {
  const { start, endExclusive } = dayBounds(ymd);
  return ev.startAt < endExclusive && ev.endAt > start;
}

function eventsOnDay(list: PlanningCalendarEvent[], ymd: string): PlanningCalendarEvent[] {
  return list.filter((e) => overlapsDay(e, ymd));
}

function weekdayLong(ymd: string): string {
  const t = findInstantOnYmd(ymd, TZ);
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long" }).format(t);
}

function formatDayPretty(ymd: string): string {
  const t = findInstantOnYmd(ymd, TZ);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(t);
}

function sliceForDay(
  ymd: string,
  list: PlanningCalendarEvent[],
  kind: "proposed" | "adjacent",
): PlanningDaySlice {
  const hits = eventsOnDay(list, ymd);
  const open = hits.length === 0;
  const anchor: "scheduled" | "home" = open ? "home" : "scheduled";
  let summary: string;
  if (hits.length === 0) {
    summary =
      kind === "proposed"
        ? `No published campaign stops that day (${formatDayPretty(ymd)})—calendar reads open for planning. We still confirm with organizers.`
        : `Nothing on the public calendar ${formatDayPretty(ymd)}—for travel we assume ${CAMPAIGN_PLANNING_HOME_BASE.label}.`;
  } else {
    const top = hits[0];
    const more = hits.length > 1 ? ` (+${hits.length - 1} more that day)` : "";
    summary =
      kind === "proposed"
        ? `That day has ${hits.length} published stop(s) on the calendar—${top.title} (${top.locationLine})${more}.`
        : `Calendar: ${top.title} — ${top.locationLine}${more}.`;
  }
  return {
    ymd,
    weekdayLabel: weekdayLong(ymd),
    availability: open ? "open" : "busy",
    events: hits.map((e) => ({ title: e.title, locationLine: e.locationLine, href: e.href })),
    anchor,
    summary,
  };
}

export function movementAndPublicToPlanningEvents(
  movement: EventItem[],
  publicRows: PublicCampaignEvent[],
): PlanningCalendarEvent[] {
  const merged = mergeMovementAndCalendarEvents(movement, publicRows);
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return merged
    .filter((e) => {
      const end = e.endsAt ? new Date(e.endsAt) : new Date(new Date(e.startsAt).getTime() + 2 * 3600000);
      return end >= now;
    })
    .map((e) => {
      const start = new Date(e.startsAt);
      const end = e.endsAt ? new Date(e.endsAt) : new Date(start.getTime() + 2 * 3600000);
      const href = e.detailHref ?? `/events/${e.slug}`;
      return {
        id: e.slug,
        title: e.title,
        locationLine: (e.locationLabel || "").trim() || "Location TBA",
        href,
        startAt: start,
        endAt: end,
      };
    });
}

export function computePlanningAvailability(
  proposedYmd: string,
  planningEvents: PlanningCalendarEvent[],
): PlanningAvailabilityResponse {
  const yBefore = addCalendarDaysYmd(proposedYmd, -1);
  const yAfter = addCalendarDaysYmd(proposedYmd, 1);
  return {
    timezone: TZ,
    homeBase: CAMPAIGN_PLANNING_HOME_BASE,
    proposedYmd,
    proposed: sliceForDay(proposedYmd, planningEvents, "proposed"),
    dayBefore: sliceForDay(yBefore, planningEvents, "adjacent"),
    dayAfter: sliceForDay(yAfter, planningEvents, "adjacent"),
  };
}

/** Compact digest for AI (next N calendar days in Central). */
export function buildBusyDayDigest(planningEvents: PlanningCalendarEvent[], horizonDays: number): string[] {
  const lines: string[] = [];
  let ymd = ymdInTimeZone(new Date(), TZ);
  for (let i = 0; i < horizonDays; i += 1) {
    const hits = eventsOnDay(planningEvents, ymd);
    if (hits.length > 0) {
      const locs = [...new Set(hits.map((h) => h.locationLine))].join("; ");
      lines.push(`${ymd}: busy (${hits.length}) — ${locs}`);
    } else {
      lines.push(`${ymd}: open (assume ${CAMPAIGN_PLANNING_HOME_BASE.label} if planning travel)`);
    }
    ymd = addCalendarDaysYmd(ymd, 1);
  }
  return lines;
}

export const planningDateParamRegex = /^\d{4}-\d{2}-\d{2}$/;
