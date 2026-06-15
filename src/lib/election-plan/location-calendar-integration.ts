import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import type { ElectionPlanCity } from "@/lib/election-plan/types";

export function normalizeCountyName(county: string): string {
  return county.replace(/\s+County$/i, "").trim();
}

export function buildCitySlugLookup(cities: ElectionPlanCity[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const city of cities) {
    map.set(city.name.toLowerCase(), city.slug);
    map.set(city.slug, city.slug);
  }
  return map;
}

export function resolveCitySlug(
  city: string | null | undefined,
  lookup: Map<string, string>,
): string | undefined {
  if (!city || city === "TBD") return undefined;
  return lookup.get(city.trim().toLowerCase());
}

export function calendarEntriesForCounty(
  entries: ExecutiveCalendarEntry[],
  countyName: string,
): ExecutiveCalendarEntry[] {
  const norm = normalizeCountyName(countyName).toLowerCase();
  return entries.filter((e) => normalizeCountyName(e.county).toLowerCase() === norm);
}

export function calendarEntriesForCity(
  entries: ExecutiveCalendarEntry[],
  cityName: string,
  countyName: string,
): ExecutiveCalendarEntry[] {
  const countyNorm = normalizeCountyName(countyName).toLowerCase();
  const cityNorm = cityName.trim().toLowerCase();
  return entries.filter(
    (e) =>
      normalizeCountyName(e.county).toLowerCase() === countyNorm &&
      e.city?.trim().toLowerCase() === cityNorm,
  );
}

export function sortCalendarEntries(entries: ExecutiveCalendarEntry[]): ExecutiveCalendarEntry[] {
  return [...entries].sort((a, b) => a.startDate.localeCompare(b.startDate) || a.label.localeCompare(b.label));
}

export function upcomingCalendarEntries(
  entries: ExecutiveCalendarEntry[],
  referenceDate: string,
  limit = 8,
): ExecutiveCalendarEntry[] {
  return sortCalendarEntries(entries)
    .filter((e) => e.startDate >= referenceDate)
    .slice(0, limit);
}

export function recentCalendarEntries(
  entries: ExecutiveCalendarEntry[],
  referenceDate: string,
  limit = 5,
): ExecutiveCalendarEntry[] {
  return sortCalendarEntries(entries)
    .filter((e) => e.startDate < referenceDate)
    .reverse()
    .slice(0, limit);
}

export function fieldEventsForLocation(
  allEntries: ExecutiveCalendarEntry[],
  opts: { countyName: string; cityName?: string; referenceDate: string; limit?: number },
): {
  upcoming: ExecutiveCalendarEntry[];
  recent: ExecutiveCalendarEntry[];
  totalInCounty: number;
  cityScoped: boolean;
} {
  const countyEntries = calendarEntriesForCounty(allEntries, opts.countyName);
  let scoped = countyEntries;
  let cityScoped = false;
  if (opts.cityName) {
    const cityEntries = calendarEntriesForCity(allEntries, opts.cityName, opts.countyName);
    if (cityEntries.length > 0) {
      scoped = cityEntries;
      cityScoped = true;
    }
  }
  const limit = opts.limit ?? 6;
  return {
    upcoming: upcomingCalendarEntries(scoped, opts.referenceDate, limit),
    recent: recentCalendarEntries(scoped, opts.referenceDate, Math.min(3, limit)),
    totalInCounty: countyEntries.length,
    cityScoped,
  };
}
