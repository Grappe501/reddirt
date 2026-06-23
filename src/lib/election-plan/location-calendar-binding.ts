import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import {
  calendarEntriesForCity,
  calendarEntriesForCounty,
  normalizeCountyName,
  sortCalendarEntries,
} from "@/lib/election-plan/location-calendar-integration";
import type { CityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import { buildCityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import type { ElectionPlanCity, ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";

export type RevisitBinding = {
  status: string;
  label: string;
  lastVisitDate: string | null;
  nextLockedDate: string | null;
  nextLockedEvent: string | null;
  inTier1Queue: boolean;
};

export type LocationEventApproval = {
  slug: string;
  title: string;
  date: string;
  county: string;
  city: string;
  status: string;
  kellyAttends: boolean;
  needsVolunteers: boolean;
  declined: boolean;
  verified: boolean;
};

export type LocationWeekPlanBinding = {
  weekNumber: number;
  range: string;
  status: string;
  cluster: string;
  focus: string;
  isCurrentWeek: boolean;
};

export type LocationCalendarBinding = {
  nextLockedVisit: ExecutiveCalendarEntry | null;
  revisit: RevisitBinding | null;
  eventApprovals: LocationEventApproval[];
  weekPlans: LocationWeekPlanBinding[];
  currentWeekPlan: LocationWeekPlanBinding | null;
};

export type BriefCompletionRollup = {
  total: number;
  scaffold: number;
  draft: number;
  review: number;
  approved: number;
  numericLocked: number;
  currentWeekCityCount: number;
  currentWeekBriefsReady: number;
  currentWeekRange: string;
  currentWeekNumber: number;
};

function revisitLabel(status: string): string {
  if (status === "locked_planned") return "Revisit scheduled";
  if (status === "revisit_unscheduled") return "Revisit due — not on calendar";
  if (status === "needs_schedule") return "Needs locked visit";
  return status.replace(/_/g, " ");
}

export function nextLockedVisitForLocation(
  entries: ExecutiveCalendarEntry[],
  opts: { cityName: string; countyName: string; referenceDate: string },
): ExecutiveCalendarEntry | null {
  const cityEntries = calendarEntriesForCity(entries, opts.cityName, opts.countyName).filter(
    (e) => e.startDate >= opts.referenceDate && (e.category === "locked" || e.category === "scheduled"),
  );
  const countyEntries = calendarEntriesForCounty(entries, opts.countyName).filter(
    (e) => e.startDate >= opts.referenceDate && (e.category === "locked" || e.category === "scheduled"),
  );
  const pool = cityEntries.length > 0 ? cityEntries : countyEntries;
  const locked = sortCalendarEntries(pool.filter((e) => e.category === "locked"));
  if (locked.length > 0) return locked[0];
  const scheduled = sortCalendarEntries(pool.filter((e) => e.category === "scheduled"));
  return scheduled[0] ?? null;
}

export function revisitBindingForCounty(
  data: ElectionPlanWorkbenchSnapshot,
  countyName: string,
): RevisitBinding | null {
  const norm = normalizeCountyName(countyName).toLowerCase();
  const tier1 = data.calendarSettlement?.tier1RevisitStatus ?? [];
  const row = tier1.find(
    (r) => r.county.toLowerCase() === norm,
  );
  if (!row) return null;
  const revisitQueue = data.coverageReality?.tier1RevisitQueue ?? [];
  const inTier1Queue = revisitQueue.some(
    (q) => q.county.toLowerCase() === norm,
  );
  return {
    status: row.status,
    label: revisitLabel(row.status),
    lastVisitDate: row.lastVisitDate,
    nextLockedDate: row.nextLockedDate,
    nextLockedEvent: row.nextLockedEvent,
    inTier1Queue,
  };
}

function approvalCountyMatches(itemCounty: string, countyName: string): boolean {
  return normalizeCountyName(itemCounty).toLowerCase() === normalizeCountyName(countyName).toLowerCase();
}

export function eventApprovalsForLocation(
  data: ElectionPlanWorkbenchSnapshot,
  opts: { cityName?: string; countyName: string; limit?: number },
): LocationEventApproval[] {
  const limit = opts.limit ?? 6;
  const items = data.eventApprovals?.items ?? [];
  const matched: LocationEventApproval[] = [];

  for (const item of items) {
    if (!item?.decision) continue;
    const countyMatch = approvalCountyMatches(item.county, opts.countyName);
    const cityMatch = opts.cityName
      ? item.city?.trim().toLowerCase() === opts.cityName.trim().toLowerCase() ||
        item.title.toLowerCase().includes(opts.cityName.toLowerCase())
      : false;
    if (!countyMatch && !cityMatch) continue;
    matched.push({
      slug: item.slug,
      title: item.title,
      date: item.date,
      county: item.county,
      city: item.city,
      status: item.status,
      kellyAttends: item.decision.kellyAttends,
      needsVolunteers: item.decision.needsVolunteers,
      declined: item.decision.declined,
      verified: item.decision.verified,
    });
    if (matched.length >= limit) break;
  }

  return matched.sort((a, b) => a.date.localeCompare(b.date));
}

export function weekPlansForLocation(
  data: ElectionPlanWorkbenchSnapshot,
  cityName: string,
): LocationWeekPlanBinding[] {
  const currentWeek = data.candidateDashboard?.currentWeek ?? 1;
  const weekPlans = data.weekPlans ?? [];
  return weekPlans
    .filter((w) => w.cities.some((c) => c.toLowerCase() === cityName.toLowerCase()))
    .map((w) => ({
      weekNumber: w.weekNumber,
      range: w.range,
      status: w.status,
      cluster: w.cluster,
      focus: w.focus,
      isCurrentWeek: w.weekNumber === currentWeek,
    }));
}

export function buildLocationCalendarBinding(
  data: ElectionPlanWorkbenchSnapshot,
  opts: { cityName: string; countyName: string; referenceDate: string },
): LocationCalendarBinding {
  const entries = data.executiveCalendar?.entries ?? [];
  const referenceDate = opts.referenceDate || data.executiveCalendar?.referenceDate || new Date().toISOString().slice(0, 10);
  const weekPlans = weekPlansForLocation(data, opts.cityName);
  return {
    nextLockedVisit: nextLockedVisitForLocation(entries, {
      cityName: opts.cityName,
      countyName: opts.countyName,
      referenceDate,
    }),
    revisit: revisitBindingForCounty(data, opts.countyName),
    eventApprovals: eventApprovalsForLocation(data, {
      cityName: opts.cityName,
      countyName: opts.countyName,
    }),
    weekPlans,
    currentWeekPlan: weekPlans.find((w) => w.isCurrentWeek) ?? null,
  };
}

export function buildCountyCalendarBinding(
  data: ElectionPlanWorkbenchSnapshot,
  countyName: string,
): Omit<LocationCalendarBinding, "weekPlans" | "currentWeekPlan"> & {
  weekPlans: LocationWeekPlanBinding[];
} {
  const ref = data.executiveCalendar?.referenceDate ?? new Date().toISOString().slice(0, 10);
  const entries = data.executiveCalendar?.entries ?? [];
  const countyEntries = calendarEntriesForCounty(entries, countyName).filter(
    (e) => e.startDate >= ref && (e.category === "locked" || e.category === "scheduled"),
  );
  const locked = sortCalendarEntries(countyEntries.filter((e) => e.category === "locked"));
  const nextLockedVisit = locked[0] ?? sortCalendarEntries(countyEntries)[0] ?? null;

  const currentWeek = data.candidateDashboard?.currentWeek ?? 1;
  const weekPlans = (data.weekPlans ?? [])
    .filter((w) => w.counties?.some((c) => c.toLowerCase() === countyName.toLowerCase()))
    .map((w) => ({
      weekNumber: w.weekNumber,
      range: w.range,
      status: w.status,
      cluster: w.cluster,
      focus: w.focus,
      isCurrentWeek: w.weekNumber === currentWeek,
    }));

  return {
    nextLockedVisit,
    revisit: revisitBindingForCounty(data, countyName),
    eventApprovals: eventApprovalsForLocation(data, { countyName }),
    weekPlans,
  };
}

export function computeBriefCompletionRollup(
  cities: ElectionPlanCity[],
  data: ElectionPlanWorkbenchSnapshot,
): BriefCompletionRollup {
  const briefs: CityLocationBrief[] = cities.map(buildCityLocationBrief);
  const currentWeekNumber = data.candidateDashboard?.currentWeek ?? 1;
  const weekRange = data.candidateDashboard?.weekRange ?? "—";
  const allWeekPlans = data.weekPlans ?? [];
  const currentWeek = allWeekPlans.find((w) => w.weekNumber === currentWeekNumber);
  const currentWeekCityNames = new Set(currentWeek?.cities.map((c) => c.toLowerCase()) ?? []);
  const currentWeekBriefs = briefs.filter((b) => currentWeekCityNames.has(b.name.toLowerCase()));
  const readyStatuses = new Set(["draft", "review", "approved"]);

  return {
    total: briefs.length,
    scaffold: briefs.filter((b) => b.status === "scaffold").length,
    draft: briefs.filter((b) => b.status === "draft").length,
    review: briefs.filter((b) => b.status === "review").length,
    approved: briefs.filter((b) => b.status === "approved").length,
    numericLocked: briefs.filter((b) => b.numericTargets?.locked).length,
    currentWeekCityCount: currentWeekBriefs.length,
    currentWeekBriefsReady: currentWeekBriefs.filter((b) => readyStatuses.has(b.status)).length,
    currentWeekRange: weekRange,
    currentWeekNumber,
  };
}

export function currentWeekPlanCities(data: ElectionPlanWorkbenchSnapshot): string[] {
  const currentWeekNumber = data.candidateDashboard?.currentWeek ?? 1;
  const week = (data.weekPlans ?? []).find((w) => w.weekNumber === currentWeekNumber);
  return week?.cities ?? [];
}
