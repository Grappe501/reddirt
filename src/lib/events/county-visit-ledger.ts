import type { CampaignEventType } from "@prisma/client";
import {
  ARKANSAS_COUNTIES,
  ARKANSAS_COUNTY_COUNT,
  type ArkansasCountyName,
} from "@/data/kelly-county-visits/arkansas-counties";
import {
  HISTORICAL_VISIT_SNAPSHOT_AS_OF,
  HISTORICAL_VISITED_COUNTIES,
  isHistoricalUnvisitedCounty,
  isHistoricalVisitedCounty,
} from "@/data/kelly-county-visits/historical-visited-seed";
import type { KellyCampaignStop } from "@/data/kelly-county-visits/types";
import { inferPublicVenueMode } from "@/lib/calendar/public-event-format";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";
import { parseEventInstant } from "@/lib/format/eventDisplay";
import { eventCountySlugs } from "@/lib/events/county-key";
import type { EventItem } from "@/content/types";

const TZ = PUBLIC_CALENDAR_DEFAULT_TZ;

/** Staff/volunteer activity that is not a Kelly in-person appearance. */
const NON_APPEARANCE_TYPES = new Set<CampaignEventType>([
  "TRAINING",
  "ORIENTATION",
  "CANVASS",
  "PHONE_BANK",
  "DEADLINE",
]);

export type CountyVisitRecord = {
  countyName: ArkansasCountyName;
  countySlug: string;
  visitCount: number;
  firstVisitAt: string | null;
  latestVisitAt: string | null;
  qualifyingEventIds: string[];
  sources: Array<"seed" | "campaign-event" | "movement-event">;
};

export type CountyVisitDisagreement = {
  severity: "conflict" | "gap";
  countyName: ArkansasCountyName;
  message: string;
  eventIds: string[];
};

export type CountyVisitLedger = {
  asOfIso: string;
  asOfYmd: string;
  totalCounties: number;
  visited: CountyVisitRecord[];
  unvisitedNames: ArkansasCountyName[];
  disagreements: CountyVisitDisagreement[];
};

export type CampaignAppearanceRow = {
  id: string;
  slug?: string | null;
  startAt: Date;
  endAt: Date;
  timezone?: string | null;
  eventType: CampaignEventType;
  attendanceType?: string | null;
  isTravelLeg?: boolean | null;
  status?: string | null;
  locationName?: string | null;
  address?: string | null;
  countyDisplayName?: string | null;
  countySlug?: string | null;
};

function ymdInChicago(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function arkansasCountySlug(name: ArkansasCountyName): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-county`;
}

export function normalizeArkansasCountyName(raw: string | null | undefined): ArkansasCountyName | null {
  if (!raw?.trim()) return null;
  let s = raw.trim();
  s = s.replace(/,?\s*AR(kansas)?\.?$/i, "").trim();
  s = s.replace(/\s+County$/i, "").trim();
  s = s.replace(/^Saint\s+/i, "St. ");
  s = s.replace(/^St\s+(?=[A-Z])/i, "St. ");
  const lower = s.toLowerCase();
  const hit = ARKANSAS_COUNTIES.find((c) => c.toLowerCase() === lower);
  if (hit) return hit;
  const fromSlug = s.toLowerCase().replace(/-county$/, "").replace(/-/g, " ");
  return ARKANSAS_COUNTIES.find((c) => c.toLowerCase() === fromSlug) ?? null;
}

export function countyNameFromSlug(slug: string | null | undefined): ArkansasCountyName | null {
  if (!slug?.trim()) return null;
  const base = slug
    .trim()
    .toLowerCase()
    .replace(/-county$/, "")
    .replace(/-/g, " ")
    .replace(/^st\s/, "st. ");
  return ARKANSAS_COUNTIES.find((c) => c.toLowerCase() === base) ?? null;
}

function emptyRecord(name: ArkansasCountyName, source: CountyVisitRecord["sources"][number]): CountyVisitRecord {
  return {
    countyName: name,
    countySlug: arkansasCountySlug(name),
    visitCount: 0,
    firstVisitAt: null,
    latestVisitAt: null,
    qualifyingEventIds: [],
    sources: [source],
  };
}

function addVisit(record: CountyVisitRecord, eventId: string, ymd: string, source: CountyVisitRecord["sources"][number]) {
  if (record.qualifyingEventIds.includes(eventId)) return;
  record.qualifyingEventIds.push(eventId);
  record.visitCount += 1;
  if (!record.firstVisitAt || ymd < record.firstVisitAt) record.firstVisitAt = ymd;
  if (!record.latestVisitAt || ymd > record.latestVisitAt) record.latestVisitAt = ymd;
  if (!record.sources.includes(source)) record.sources.push(source);
}

const BLOCKED_STOP_STATUSES = new Set(["virtual", "private", "canceled", "declined", "duplicate"]);

export function isQualifyingHistoricalStop(stop: KellyCampaignStop, asOfYmd: string): boolean {
  if (!stop.includeOnPublicPage) return false;
  if (BLOCKED_STOP_STATUSES.has(stop.status)) return false;
  if (!stop.counties.length) return false;
  if (stop.date > asOfYmd) return false;
  if (stop.status === "completed") return true;
  if (stop.status === "needs-review" && stop.date < asOfYmd) return true;
  return false;
}

export function isQualifyingCampaignAppearance(row: CampaignAppearanceRow, now: Date): boolean {
  if (row.isTravelLeg) return false;
  const status = (row.status ?? "").toUpperCase();
  if (status === "TENTATIVE" || status === "DRAFT" || status === "CANCELLED" || status === "CANCELED") return false;
  if (NON_APPEARANCE_TYPES.has(row.eventType)) return false;
  if (row.endAt.getTime() >= now.getTime()) return false;
  const venue = inferPublicVenueMode({
    eventType: row.eventType,
    locationName: row.locationName ?? null,
    address: row.address ?? null,
  });
  if (venue === "virtual") return false;
  return Boolean(normalizeArkansasCountyName(row.countyDisplayName) || countyNameFromSlug(row.countySlug));
}

const VIRTUAL_HINT = /\b(virtual|zoom|webinar|livestream)\b/i;

export function isQualifyingMovementAppearance(event: EventItem, now: Date): boolean {
  if (event.statewideVirtual) return false;
  if (event.qualifiesAsVisit === false) return false;
  if (
    event.fieldAttendance === "tentative" ||
    event.fieldAttendance === "suggested" ||
    event.fieldAttendance === "unscheduled" ||
    event.fieldAttendance === "surrogate" ||
    event.fieldAttendance === "caution"
  ) {
    return false;
  }
  if (event.campaignTrail !== true && event.eventSource !== "calendar") return false;
  const slugs = eventCountySlugs(event);
  if (slugs.length === 0) return false;
  if (event.opsFlags?.missingCounty) return false;
  if (event.type === "Volunteer Training" || event.type === "Immersion") return false;
  if (VIRTUAL_HINT.test(`${event.locationLabel} ${event.addressLine ?? ""} ${event.title}`)) return false;
  const tz = event.timezone || TZ;
  const end = parseEventInstant(event.endsAt ?? event.startsAt, tz);
  if (end.getTime() >= now.getTime()) return false;
  return slugs.some((slug) => countyNameFromSlug(slug) != null);
}

function chicagoYmdFromStopDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export function buildCountyVisitLedger(input: {
  now?: Date;
  historicalStops: KellyCampaignStop[];
  campaignEvents: CampaignAppearanceRow[];
  movementEvents: EventItem[];
}): CountyVisitLedger {
  const now = input.now ?? new Date();
  const asOfYmd = ymdInChicago(now);
  const byCounty = new Map<ArkansasCountyName, CountyVisitRecord>();
  const disagreements: CountyVisitDisagreement[] = [];

  for (const name of HISTORICAL_VISITED_COUNTIES) {
    byCounty.set(name, emptyRecord(name, "seed"));
  }

  for (const stop of input.historicalStops) {
    if (!isQualifyingHistoricalStop(stop, HISTORICAL_VISIT_SNAPSHOT_AS_OF)) continue;
    const ymd = chicagoYmdFromStopDate(stop.date);
    for (const raw of stop.counties) {
      const name = normalizeArkansasCountyName(raw);
      if (!name || !isHistoricalVisitedCounty(name)) continue;
      const rec = byCounty.get(name) ?? emptyRecord(name, "seed");
      addVisit(rec, stop.id, ymd, "seed");
      byCounty.set(name, rec);
    }
  }

  const seenEventKeys = new Set<string>();

  const considerAppearance = (
    countyName: ArkansasCountyName,
    eventId: string,
    endAt: Date,
    source: "campaign-event" | "movement-event",
  ) => {
    const dedupe = `${countyName}|${eventId}`;
    if (seenEventKeys.has(dedupe)) return;
    seenEventKeys.add(dedupe);
    const ymd = ymdInChicago(endAt);

    if (isHistoricalUnvisitedCounty(countyName) && ymd < HISTORICAL_VISIT_SNAPSHOT_AS_OF) {
      disagreements.push({
        severity: "conflict",
        countyName,
        eventIds: [eventId],
        message: `${source} ${eventId} claims ${countyName} on ${ymd}, before the ${HISTORICAL_VISIT_SNAPSHOT_AS_OF} snapshot where ${countyName} is unvisited. Public count was not changed.`,
      });
      return;
    }

    const rec = byCounty.get(countyName) ?? emptyRecord(countyName, source);
    addVisit(rec, eventId, ymd, source);
    byCounty.set(countyName, rec);
  };

  for (const row of input.campaignEvents) {
    if (!isQualifyingCampaignAppearance(row, now)) continue;
    const name = normalizeArkansasCountyName(row.countyDisplayName) ?? countyNameFromSlug(row.countySlug);
    if (!name) continue;
    considerAppearance(name, row.id, row.endAt, "campaign-event");
  }

  for (const ev of input.movementEvents) {
    if (!isQualifyingMovementAppearance(ev, now)) continue;
    const end = parseEventInstant(ev.endsAt ?? ev.startsAt, ev.timezone || TZ);
    for (const slug of eventCountySlugs(ev)) {
      const name = countyNameFromSlug(slug);
      if (!name) continue;
      considerAppearance(name, ev.slug, end, "movement-event");
    }
  }

  for (const name of HISTORICAL_VISITED_COUNTIES) {
    const rec = byCounty.get(name);
    const hasCampaign = rec?.sources.includes("campaign-event");
    if (!hasCampaign) {
      disagreements.push({
        severity: "gap",
        countyName: name,
        eventIds: rec?.qualifyingEventIds ?? [],
        message: `${name} is in the historical visited seed; CampaignOS has no qualifying ended appearance yet.`,
      });
    }
  }

  const visited = [...byCounty.values()]
    .filter((r) => r.visitCount > 0 || isHistoricalVisitedCounty(r.countyName))
    .sort((a, b) => a.countyName.localeCompare(b.countyName));

  // Seed counties stay visited even if stop rows were thin.
  for (const rec of visited) {
    if (isHistoricalVisitedCounty(rec.countyName) && rec.visitCount === 0) {
      rec.visitCount = 1;
      rec.sources = ["seed"];
    }
  }

  const visitedNames = new Set(visited.map((r) => r.countyName));
  const unvisitedNames = ARKANSAS_COUNTIES.filter((c) => !visitedNames.has(c));

  return {
    asOfIso: now.toISOString(),
    asOfYmd,
    totalCounties: ARKANSAS_COUNTY_COUNT,
    visited,
    unvisitedNames,
    disagreements,
  };
}

export function publicVisitedCountyNames(ledger: CountyVisitLedger): ArkansasCountyName[] {
  return ledger.visited.map((r) => r.countyName);
}
