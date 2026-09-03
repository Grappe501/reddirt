import type { EventItem } from "@/content/types";
import {
  ARKANSAS_COUNTIES,
  type ArkansasCountyName,
} from "@/data/kelly-county-visits/arkansas-counties";
import { parseEventInstant, resolveEventStatus } from "@/lib/format/eventDisplay";
import {
  arkansasCountyKey,
  arkansasCountySlugFromKey,
  countyNameFromAnySlug,
  eventCountySlugs,
} from "@/lib/events/county-key";
import { formatMapEventLine } from "@/lib/events/public-event-county";
import type { CountyVisitLedger } from "@/lib/events/county-visit-ledger";

export type CountyCampaignState =
  | "visited"
  | "confirmed_upcoming"
  | "tentative_upcoming"
  | "neutral";

export type CountyUpcomingIndicator = "confirmed" | "tentative" | null;

export type PublicEventSummary = {
  slug: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  timezone: string;
  city?: string;
  fieldAttendance: "confirmed" | "tentative";
  href: string;
  timeTbd?: boolean;
  line: string;
};

export type CountyCampaignSummary = {
  countyName: ArkansasCountyName;
  countySlug: string;
  countyKey: string;
  visited: boolean;
  visitCount: number;
  firstVisitAt?: string;
  latestVisitAt?: string;
  confirmedUpcomingEvents: PublicEventSummary[];
  tentativeUpcomingEvents: PublicEventSummary[];
  publicState: CountyCampaignState;
  upcomingIndicator: CountyUpcomingIndicator;
};

const VIRTUAL_HINT = /\b(virtual|zoom|webinar|livestream)\b/i;

export function drivesPublicCountyMap(event: EventItem): boolean {
  if (event.statewideVirtual) return false;
  if (event.qualifiesAsVisit === false) return false;
  if (event.opsFlags?.missingCounty) return false;
  if (
    event.fieldAttendance === "unscheduled" ||
    event.fieldAttendance === "suggested" ||
    event.fieldAttendance === "surrogate"
  ) {
    return false;
  }
  if (VIRTUAL_HINT.test(`${event.locationLabel} ${event.addressLine ?? ""} ${event.title}`)) return false;
  if (eventCountySlugs(event).every((slug) => !countyNameFromAnySlug(slug))) return false;
  return event.campaignTrail === true || event.eventSource === "calendar";
}

export function isMapUpcomingAttendance(event: EventItem): "confirmed" | "tentative" | null {
  if (event.fieldAttendance === "tentative") return "tentative";
  if (event.fieldAttendance === "confirmed" || event.fieldAttendance == null) return "confirmed";
  return null;
}

function toSummary(event: EventItem, attendance: "confirmed" | "tentative"): PublicEventSummary {
  return {
    slug: event.slug,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    timezone: event.timezone,
    city: event.city?.trim() || event.locationLabel,
    fieldAttendance: attendance,
    href: event.detailHref ?? `/events/${event.slug}`,
    timeTbd: event.opsFlags?.timeTbd,
    line: formatMapEventLine(event),
  };
}

function sortByStart(a: PublicEventSummary, b: PublicEventSummary): number {
  return a.startsAt.localeCompare(b.startsAt);
}

export function countyMapHref(summary: CountyCampaignSummary): string | null {
  const upcoming = [...summary.confirmedUpcomingEvents, ...summary.tentativeUpcomingEvents].sort(sortByStart);
  if (upcoming.length === 0) return null;
  if (upcoming.length === 1) return upcoming[0].href;
  return `/events/county/${summary.countyKey}`;
}

export function countyAriaLabel(summary: CountyCampaignSummary): string {
  const name = `${summary.countyName} County`;
  const next = [...summary.confirmedUpcomingEvents, ...summary.tentativeUpcomingEvents].sort(sortByStart)[0];
  if (summary.visited && next) {
    const kind = next.fieldAttendance === "tentative" ? "tentative" : "confirmed";
    return `${name} — visited, ${kind} campaign stop ${next.line.split(" — ")[0]}`;
  }
  if (summary.visited) return `${name} — visited`;
  if (next) {
    const kind = next.fieldAttendance === "tentative" ? "tentative" : "confirmed";
    return `${name} — ${kind} campaign stop ${next.line.split(" — ")[0]}`;
  }
  return `${name} — not yet visited`;
}

export function buildCountyCampaignSummaries(input: {
  ledger: CountyVisitLedger;
  events: EventItem[];
  now?: Date;
}): CountyCampaignSummary[] {
  const now = input.now ?? new Date();
  const visitedByName = new Map(input.ledger.visited.map((row) => [row.countyName, row]));

  const confirmed = new Map<ArkansasCountyName, PublicEventSummary[]>();
  const tentative = new Map<ArkansasCountyName, PublicEventSummary[]>();

  for (const event of input.events) {
    if (!drivesPublicCountyMap(event)) continue;
    if (resolveEventStatus(event, now) !== "upcoming") continue;
    const attendance = isMapUpcomingAttendance(event);
    if (!attendance) continue;
    const row = toSummary(event, attendance);
    const bucket = attendance === "tentative" ? tentative : confirmed;
    for (const slug of eventCountySlugs(event)) {
      const name = countyNameFromAnySlug(slug);
      if (!name) continue;
      const list = bucket.get(name) ?? [];
      list.push(row);
      bucket.set(name, list);
    }
  }

  return ARKANSAS_COUNTIES.map((countyName) => {
    const key = arkansasCountyKey(countyName);
    const visit = visitedByName.get(countyName);
    const visited = Boolean(visit && visit.visitCount > 0);
    const confirmedUpcomingEvents = (confirmed.get(countyName) ?? []).sort(sortByStart);
    const tentativeUpcomingEvents = (tentative.get(countyName) ?? []).sort(sortByStart);
    const upcomingIndicator: CountyUpcomingIndicator = confirmedUpcomingEvents.length
      ? "confirmed"
      : tentativeUpcomingEvents.length
        ? "tentative"
        : null;
    let publicState: CountyCampaignState = "neutral";
    if (visited) publicState = "visited";
    else if (upcomingIndicator === "confirmed") publicState = "confirmed_upcoming";
    else if (upcomingIndicator === "tentative") publicState = "tentative_upcoming";

    return {
      countyName,
      countySlug: arkansasCountySlugFromKey(key),
      countyKey: key,
      visited,
      visitCount: visit?.visitCount ?? 0,
      firstVisitAt: visit?.firstVisitAt ?? undefined,
      latestVisitAt: visit?.latestVisitAt ?? undefined,
      confirmedUpcomingEvents,
      tentativeUpcomingEvents,
      publicState,
      upcomingIndicator,
    };
  });
}

export function statewideVisitedCount(summaries: CountyCampaignSummary[]): number {
  return summaries.filter((s) => s.visited).length;
}
