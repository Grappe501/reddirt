import type { EventItem, FieldAttendance } from "@/content/types";
import { eachDayOfInterval } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";

const TZ = "America/Chicago";
const STAY_MS = 2 * 60 * 60 * 1000;
/** ~43 mph — rural / connector roads, not all interstate */
const ROAD_FACTOR = 1.38;
const AVG_KMH = 68;
const R_KM = 6371;
const MIN_VISIT_MS = 10 * 60 * 1000;

type Stop = {
  slug: string;
  start: number;
  end: number;
  lat: number;
  lng: number;
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(sa)));
}

function travelMs(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  return (haversineKm(a, b) * ROAD_FACTOR) / AVG_KMH * 3600 * 1000;
}

/**
 * A can precede B in a same-day run if, after a minimum visit at A, drive time allows
 * a minimum visit at B before B closes.
 */
function canFollow(a: Stop, b: Stop): boolean {
  const stayA = Math.min(STAY_MS, a.end - a.start);
  if (stayA < MIN_VISIT_MS) return false;
  const leaveA = a.start + stayA;
  if (leaveA > a.end) return false;
  const t = travelMs(a, b);
  let arriveB = leaveA + t;
  if (arriveB < b.start) arriveB = b.start;
  const stayB = Math.min(STAY_MS, b.end - b.start);
  if (stayB < MIN_VISIT_MS) return false;
  return arriveB + stayB <= b.end;
}

/**
 * For one calendar day (Central), use each event’s window intersected with that day
 * (if the event runs that day) so we can chain multi-day fests with same-day single-day fests.
 */
function clampStopsForDay(candidates: EventItem[], d: string): Stop[] {
  const stops: Stop[] = [];
  const dStart = toDate(`${d}T00:00:00`, { timeZone: TZ }).getTime();
  const dEnd = toDate(`${d}T23:59:59.999`, { timeZone: TZ }).getTime();
  for (const e of candidates) {
    if (!e.mapCoordinates || e.endsAt == null) continue;
    const t0 = new Date(e.startsAt).getTime();
    const t1 = new Date(e.endsAt).getTime();
    if (t1 < t0) continue;
    const s = Math.max(t0, dStart);
    const en = Math.min(t1, dEnd);
    if (en - s < MIN_VISIT_MS) continue;
    stops.push({
      slug: e.slug,
      start: s,
      end: en,
      lat: e.mapCoordinates.lat,
      lng: e.mapCoordinates.lng,
    });
  }
  return stops;
}

function longestChainSlugsForDay(stops: Stop[]): string[] {
  if (stops.length === 0) return [];
  const sorted = [...stops].sort((a, b) => a.start - b.start);
  const n = sorted.length;
  const dp: number[] = new Array(n).fill(0);
  const parent: number[] = new Array(n).fill(-1);
  for (let i = 0; i < n; i++) {
    dp[i] = 1;
    for (let j = 0; j < i; j++) {
      if (canFollow(sorted[j], sorted[i]) && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        parent[i] = j;
      }
    }
  }
  let best = 0;
  for (let i = 1; i < n; i++) {
    if (dp[i] >= dp[best]) best = i;
  }
  const slugs: string[] = [];
  for (let i = best; i >= 0; ) {
    slugs.push(sorted[i].slug);
    i = parent[i];
  }
  return slugs.reverse();
}

/**
 * Picks, per calendar day, a dense same-day run (2h on-site + drive time) and returns the union
 * of all events that appear in at least one maximum-length daily chain. Those get `suggested`
 * (unless the row is already `tentative` or `confirmed`).
 */
export function computeSuggestedFestivalSlugs(fairs: EventItem[]): Set<string> {
  const withCoords = fairs.filter(
    (e) => e.type === "Fairs and Festivals" && e.mapCoordinates && e.status === "upcoming" && e.endsAt,
  );
  if (withCoords.length === 0) return new Set();
  const byDay = new Map<string, EventItem[]>();
  for (const e of withCoords) {
    const start = new Date(e.startsAt);
    const end = new Date(e.endsAt!);
    for (const dayDate of eachDayOfInterval({ start, end })) {
      const d = formatInTimeZone(dayDate, TZ, "yyyy-MM-dd");
      byDay.set(d, [...(byDay.get(d) ?? []), e]);
    }
  }
  const all = new Set<string>();
  for (const d of byDay.keys()) {
    const stops = clampStopsForDay(byDay.get(d) ?? [], d);
    for (const s of longestChainSlugsForDay(stops)) {
      all.add(s);
    }
  }
  return all;
}

function isManualAttendance(a: FieldAttendance | undefined): boolean {
  return a === "tentative" || a === "confirmed";
}

/**
 * Fills in `suggested` for fairs that appear in a computed run; leaves `tentative` and `confirmed` alone.
 */
export function markSuggestedFestivalPath(events: EventItem[]): EventItem[] {
  const fairs = events.filter(
    (e) => e.type === "Fairs and Festivals" && e.mapCoordinates && e.status === "upcoming" && e.endsAt,
  );
  const suggested = computeSuggestedFestivalSlugs(fairs);
  return events.map((e) => {
    if (e.type !== "Fairs and Festivals") return e;
    if (isManualAttendance(e.fieldAttendance)) return e;
    if (suggested.has(e.slug)) {
      return { ...e, fieldAttendance: "suggested" as const };
    }
    return { ...e, fieldAttendance: "unscheduled" as const };
  });
}
