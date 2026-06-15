/**
 * County Coverage Index — ensure all 75 counties receive meaningful attention.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../../src/lib/county/arkansas-county-registry";
import { shortCountyName } from "./inputs";

export const NO_COUNTY_LEFT_BEHIND_DAYS = 45;

export type ContactType =
  | "kelly_visit"
  | "surrogate_visit"
  | "county_chair"
  | "clerk_meeting"
  | "faith_outreach"
  | "volunteer_event";

export type CountyVisit = {
  county: string;
  date: string;
  eventId?: string;
  assignee?: string;
  contactType?: ContactType;
  source: "field" | "outcome" | "manual" | "touch_summary";
};

export type CountyCoverageRow = {
  county: string;
  lastVisitDate: string | null;
  daysSinceVisit: number | null;
  visitCount: number;
  coverageNeedScore: number;
  coverageBonus: number;
  status: "never_visited" | "neglected" | "due" | "recent" | "saturated";
  guardrailStatus: "ok" | "warning" | "violation";
  daysUntilViolation: number | null;
};

export type NoCountyLeftBehindAlert = {
  county: string;
  daysSinceContact: number | null;
  lastContactDate: string | null;
  severity: "critical" | "warning";
  message: string;
};

export type CountyCoverageIndex = {
  generatedAt: string;
  referenceDate: string;
  guardrailDays: number;
  totalCounties: number;
  visitedThisCycle: number;
  neverVisited: number;
  remaining: number;
  averageDaysSinceVisit: number;
  guardrailViolations: number;
  guardrailWarnings: number;
  counties: CountyCoverageRow[];
  uncoveredAlerts: string[];
  noCountyLeftBehindAlerts: NoCountyLeftBehindAlert[];
};

export function parseDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00.000Z`);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function coverageNeedScore(daysSince: number | null): number {
  if (daysSince === null) return 10;
  if (daysSince > 60) return 10;
  if (daysSince > 30) return 7;
  if (daysSince > 14) return 4;
  return 1;
}

/** +20 if no visit in 60d, +10 if no visit in 30d, -15 if visited within 14d. */
export function coverageBonusPoints(daysSince: number | null): number {
  if (daysSince === null) return 30;
  let bonus = 0;
  if (daysSince > 60) bonus += 20;
  else if (daysSince > 30) bonus += 10;
  if (daysSince <= 14) bonus -= 15;
  return bonus;
}

function coverageStatus(daysSince: number | null): CountyCoverageRow["status"] {
  if (daysSince === null) return "never_visited";
  if (daysSince > 60) return "neglected";
  if (daysSince > 30) return "due";
  if (daysSince <= 14) return "saturated";
  return "recent";
}

function guardrailStatus(daysSince: number | null): CountyCoverageRow["guardrailStatus"] {
  if (daysSince === null) return "violation";
  if (daysSince > NO_COUNTY_LEFT_BEHIND_DAYS) return "violation";
  if (daysSince > NO_COUNTY_LEFT_BEHIND_DAYS - 10) return "warning";
  return "ok";
}

export function allCountyNames(): string[] {
  return ARKANSAS_COUNTY_REGISTRY.map((r) => shortCountyName(r.displayName));
}

/** Merge campaign-brain visit log with calendar county-touch-summary. */
export function loadAllCountyVisits(brainDataDir: string): CountyVisit[] {
  const logPath = path.join(brainDataDir, "county-visit-log.json");
  const log = existsSync(logPath)
    ? (JSON.parse(readFileSync(logPath, "utf8")) as { visits?: CountyVisit[] })
    : { visits: [] };

  const touchPath = path.join(process.cwd(), "data/calendar-command-center/county-touch-summary.json");
  const touchVisits: CountyVisit[] = [];
  if (existsSync(touchPath)) {
    const touch = JSON.parse(readFileSync(touchPath, "utf8")) as Array<
      [string, { touches: number; lastYmd: string }]
    >;
    for (const [county, row] of touch) {
      if (county === "Van Buren") continue; // city entry, not county
      touchVisits.push({
        county,
        date: row.lastYmd,
        contactType: "kelly_visit",
        source: "touch_summary",
      });
    }
  }

  const seen = new Set<string>();
  const merged: CountyVisit[] = [];
  for (const v of [...(log.visits ?? []), ...touchVisits]) {
    const key = `${v.county}|${v.date}|${v.eventId ?? ""}|${v.source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(v);
  }
  return merged;
}

export function buildCountyCoverageIndex(
  visits: CountyVisit[],
  referenceDate = new Date(),
  guardrailDays = NO_COUNTY_LEFT_BEHIND_DAYS,
): CountyCoverageIndex {
  const ref = referenceDate;
  const byCounty = new Map<string, CountyVisit[]>();

  for (const v of visits) {
    const list = byCounty.get(v.county) ?? [];
    list.push(v);
    byCounty.set(v.county, list);
  }

  const counties: CountyCoverageRow[] = [];
  let visitedCount = 0;
  let neverVisited = 0;
  let daysSum = 0;
  let daysCount = 0;
  let violations = 0;
  let warnings = 0;

  for (const county of allCountyNames()) {
    const countyVisits = (byCounty.get(county) ?? []).sort((a, b) => b.date.localeCompare(a.date));
    const last = countyVisits[0];
    const daysSince = last ? daysBetween(parseDate(last.date), ref) : null;
    const guard = guardrailStatus(daysSince);

    if (guard === "violation") violations++;
    if (guard === "warning") warnings++;

    if (last) {
      visitedCount++;
      daysSum += daysSince ?? 0;
      daysCount++;
    } else {
      neverVisited++;
    }

    counties.push({
      county,
      lastVisitDate: last?.date ?? null,
      daysSinceVisit: daysSince,
      visitCount: countyVisits.length,
      coverageNeedScore: coverageNeedScore(daysSince),
      coverageBonus: coverageBonusPoints(daysSince),
      status: coverageStatus(daysSince),
      guardrailStatus: guard,
      daysUntilViolation:
        daysSince === null ? 0 : Math.max(0, guardrailDays - daysSince),
    });
  }

  counties.sort((a, b) => (b.daysSinceVisit ?? 999) - (a.daysSinceVisit ?? 999));

  const uncoveredAlerts = counties
    .filter((c) => c.status === "never_visited" || c.status === "neglected")
    .slice(0, 20)
    .map((c) => c.county);

  const noCountyLeftBehindAlerts: NoCountyLeftBehindAlert[] = counties
    .filter((c) => c.guardrailStatus !== "ok")
    .map((c) => ({
      county: c.county,
      daysSinceContact: c.daysSinceVisit,
      lastContactDate: c.lastVisitDate,
      severity: c.guardrailStatus === "violation" ? "critical" : "warning",
      message:
        c.daysSinceVisit === null
          ? `No campaign contact recorded — ${guardrailDays}-day guardrail violated`
          : c.daysSinceVisit > guardrailDays
            ? `${c.daysSinceVisit} days since contact — exceeds ${guardrailDays}-day limit`
            : `${c.daysSinceVisit} days since contact — ${guardrailDays - c.daysSinceVisit} days until violation`,
    }));

  return {
    generatedAt: new Date().toISOString(),
    referenceDate: ref.toISOString().slice(0, 10),
    guardrailDays,
    totalCounties: counties.length,
    visitedThisCycle: visitedCount,
    neverVisited,
    remaining: neverVisited + counties.filter((c) => c.status === "neglected").length,
    averageDaysSinceVisit: daysCount ? Math.round(daysSum / daysCount) : 0,
    guardrailViolations: violations,
    guardrailWarnings: warnings,
    counties,
    uncoveredAlerts,
    noCountyLeftBehindAlerts,
  };
}

/** Planned contacts by opportunity tier. */
export function plannedContactsByTier(tier?: string): number {
  switch (tier) {
    case "A":
      return 5;
    case "B":
      return 3;
    case "C":
      return 2;
    default:
      return 1;
  }
}
