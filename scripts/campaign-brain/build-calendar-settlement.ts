/**
 * Calendar Settlement Sprint — turn locked backbone + coverage audit into executable plan artifacts.
 *
 * Usage: npm run campaign-brain:calendar-settlement:build
 *
 * Outputs: docs/campaign-brain/calendar-settlement/
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { approxCountyCenter, ROSE_BUD } from "../../src/lib/opportunities/approx-county-center";
import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const OUT = path.join(BRAIN_ROOT, "calendar-settlement");
const AUDIT_PATH = path.join(BRAIN_ROOT, "routing/county-coverage-reality-audit.json");
const LOCKED_PATH = path.join(BRAIN_DATA, "locked-events-steve.json");

const WINDOW_START = "2026-06-15";
const WINDOW_END = "2026-10-19";
const EARLY_VOTING = "2026-10-20";
const DEBATE_PREP_START = "2026-06-24";
const DEBATE_DATE = "2026-06-26";

const DELTA_CORRIDOR = [
  "Crittenden",
  "Mississippi",
  "St. Francis",
  "Phillips",
  "Monroe",
  "Chicot",
  "Ashley",
  "Lincoln",
];

const TIER1_TRACK = [
  "Pulaski",
  "Benton",
  "Washington",
  "Faulkner",
  "Saline",
  "Sebastian",
  "Jefferson",
  "Garland",
  "Craighead",
  "Lonoke",
  "White",
  "Pope",
];

const WORK_EXCEPTION_TYPES = new Set(["media", "fundraiser", "forum", "coalition", "debate", "gotv"]);

type LockedEvent = {
  id: string;
  eventName: string;
  date: string;
  dateEnd?: string | null;
  city: string;
  county: string;
  eventType: string;
  lockedStatus: string;
  timeKnown: boolean;
  notes?: string;
};

type AuditRow = {
  county: string;
  vciRank?: number | null;
  visitCount?: number;
  lastVisitDate?: string | null;
  daysSinceLastVisit?: number | null;
  priorityScore?: number;
  planningCategory?: string;
  recommendedAction?: string;
  isDeltaCounty?: boolean;
};

type Audit = {
  referenceDate?: string;
  summary?: {
    visitedCounties?: number;
    neverVisitedCounties?: number;
    deltaCountiesNeverVisited?: number;
    tier1RevisitDue?: number;
  };
  visitedCounties?: AuditRow[];
  neverVisitedCounties?: AuditRow[];
  deltaGapCounties?: AuditRow[];
  tier1RevisitQueue?: AuditRow[];
  priorityQueue?: AuditRow[];
};

type NormalizedLocked = LockedEvent & {
  travelClass: "local" | "regional" | "immersion";
  driveMinutesFromRoseBud: number;
  overnightLikely: boolean;
};

type DayStatus = "locked" | "open" | "protected_work" | "do_not_fill";

type OpenDayRec = {
  date: string;
  weekday: string;
  status: DayStatus;
  reason?: string;
  options: Array<{
    label: string;
    city: string;
    county: string;
    score: number;
    travelClass: string;
    driveMinutes: number;
    rationale: string;
  }>;
};

function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fmtYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(ymd: string, n: number): string {
  const d = parseYmd(ymd);
  d.setUTCDate(d.getUTCDate() + n);
  return fmtYmd(d);
}

function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

function weekdayLabel(ymd: string): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseYmd(ymd).getUTCDay()]!;
}

function isWeekday(ymd: string): boolean {
  const d = parseYmd(ymd).getUTCDay();
  return d >= 1 && d <= 5;
}

function haversineMinutes(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const R = 3958.8;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const miles = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((miles / 55) * 60);
}

function travelClass(minutes: number): "local" | "regional" | "immersion" {
  if (minutes < 60) return "local";
  if (minutes <= 90) return "regional";
  return "immersion";
}

function originForDay(ymd: string): { lat: number; lng: number; label: string } {
  const wd = parseYmd(ymd).getUTCDay();
  if (wd === 2 || wd === 5) {
    return { ...approxCountyCenter("Pulaski"), label: "Little Rock (Tue/Fri work rule)" };
  }
  return { ...ROSE_BUD, label: "Rose Bud" };
}

function normalizeLocked(events: LockedEvent[]): NormalizedLocked[] {
  return events.map((e) => {
    const county = e.county?.trim() || "Unknown";
    const mins = county !== "Unknown" ? haversineMinutes(ROSE_BUD, approxCountyCenter(county)) : 120;
    const tc = travelClass(mins);
    const eveningTypes = new Set(["festival", "fundraiser", "forum", "debate", "gotv"]);
    const overnightLikely =
      tc === "immersion" ||
      (eveningTypes.has(e.eventType) && mins >= 75) ||
      Boolean(e.dateEnd && e.dateEnd !== e.date);
    return {
      ...e,
      travelClass: tc,
      driveMinutesFromRoseBud: mins,
      overnightLikely,
    };
  });
}

function occupiedDates(events: NormalizedLocked[]): Map<string, NormalizedLocked[]> {
  const map = new Map<string, NormalizedLocked[]>();
  for (const e of events) {
    const end = e.dateEnd && e.dateEnd >= e.date ? e.dateEnd : e.date;
    for (const day of eachDay(e.date, end)) {
      const list = map.get(day) ?? [];
      list.push(e);
      map.set(day, list);
    }
  }
  return map;
}

function scoreCountyOption(
  row: AuditRow,
  ymd: string,
  visitedSet: Set<string>,
  lockedCountyDates: Map<string, string[]>,
): { score: number; travelClass: string; driveMinutes: number; rationale: string } {
  const county = row.county;
  const origin = originForDay(ymd);
  const driveMinutes = haversineMinutes(origin, approxCountyCenter(county));
  const tc = travelClass(driveMinutes);
  let score = row.priorityScore ?? 50;

  if (!visitedSet.has(county)) score += 25;
  if (row.isDeltaCounty) score += 20;
  if (DELTA_CORRIDOR.includes(county)) score += 10;
  if (TIER1_TRACK.includes(county)) score += 8;
  if (tc === "local") score += 12;
  else if (tc === "regional") score += 5;
  else score -= 15;

  const scheduled = lockedCountyDates.get(county);
  if (scheduled?.some((d) => d >= ymd)) score -= 5;

  const rationale = [
    !visitedSet.has(county) ? "never visited" : "revisit",
    row.isDeltaCounty ? "Delta gap" : null,
    `${driveMinutes}m from ${origin.label}`,
    tc,
  ]
    .filter(Boolean)
    .join(" · ");

  return { score: Math.round(score), travelClass: tc, driveMinutes, rationale };
}

function cityForCounty(county: string): string {
  const seats: Record<string, string> = {
    Crittenden: "West Memphis",
    Phillips: "Helena",
    Jefferson: "Pine Bluff",
    Mississippi: "Blytheville",
    "St. Francis": "Forrest City",
    Monroe: "Clarendon",
    Chicot: "Lake Village",
    Ashley: "Crossett",
    Lincoln: "Star City",
    Craighead: "Jonesboro",
    Benton: "Bentonville",
    Washington: "Fayetteville",
    Sebastian: "Fort Smith",
    Garland: "Hot Springs",
    Saline: "Benton",
    Lonoke: "Lonoke",
    Faulkner: "Conway",
    Pope: "Russellville",
    White: "Searcy",
    Pulaski: "Little Rock",
  };
  return seats[county] ?? county;
}

function classifyDay(
  ymd: string,
  occupied: Map<string, NormalizedLocked[]>,
): { status: DayStatus; reason?: string; locked: NormalizedLocked[] } {
  const locked = occupied.get(ymd) ?? [];
  if (locked.length) return { status: "locked", locked };

  if (ymd >= DEBATE_PREP_START && ymd <= DEBATE_DATE) {
    return { status: "do_not_fill", reason: "Debate prep window — no new county routing", locked: [] };
  }

  if (ymd < DEBATE_DATE) {
    return { status: "do_not_fill", reason: "Pre-debate — locked backbone only until Jun 26 debate clears", locked: [] };
  }

  if (isWeekday(ymd)) {
    return {
      status: "protected_work",
      reason: "Mon–Fri 8 AM–5 PM protected unless major media, fundraiser, forum, or coalition meeting",
      locked: [],
    };
  }

  return { status: "open", locked: [] };
}

function buildOpenDayQueue(
  audit: Audit,
  occupied: Map<string, NormalizedLocked[]>,
  visitedSet: Set<string>,
  lockedCountyDates: Map<string, string[]>,
): OpenDayRec[] {
  const pool = [
    ...(audit.priorityQueue ?? []),
    ...(audit.deltaGapCounties ?? []),
    ...(audit.neverVisitedCounties ?? []),
  ];
  const byCounty = new Map<string, AuditRow>();
  for (const r of pool) {
    if (!byCounty.has(r.county)) byCounty.set(r.county, { ...r, isDeltaCounty: DELTA_CORRIDOR.includes(r.county) });
  }

  const days = eachDay(WINDOW_START, WINDOW_END);
  const recs: OpenDayRec[] = [];

  for (const ymd of days) {
    const { status, reason, locked } = classifyDay(ymd, occupied);
    if (status === "locked") {
      recs.push({
        date: ymd,
        weekday: weekdayLabel(ymd),
        status,
        reason: locked.map((e) => e.eventName).join(" · "),
        options: [],
      });
      continue;
    }

    if (status === "do_not_fill" || status === "protected_work") {
      recs.push({ date: ymd, weekday: weekdayLabel(ymd), status, reason, options: [] });
      continue;
    }

    const scored = [...byCounty.values()]
      .map((row) => {
        const s = scoreCountyOption(row, ymd, visitedSet, lockedCountyDates);
        return {
          label: `Option — ${cityForCounty(row.county)}`,
          city: cityForCounty(row.county),
          county: row.county,
          score: s.score,
          travelClass: s.travelClass,
          driveMinutes: s.driveMinutes,
          rationale: s.rationale,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    recs.push({ date: ymd, weekday: weekdayLabel(ymd), status, options: scored });
  }

  return recs;
}

function lockedCountySchedule(events: NormalizedLocked[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const e of events) {
    if (!e.county?.trim()) continue;
    const end = e.dateEnd && e.dateEnd >= e.date ? e.dateEnd : e.date;
    for (const day of eachDay(e.date, end)) {
      const list = map.get(e.county) ?? [];
      list.push(day);
      map.set(e.county, list);
    }
  }
  return map;
}

function projectedCoverage(
  audit: Audit,
  lockedCounties: Set<string>,
): {
  visitedBaseline: number;
  projectedAfterLocked: number;
  newlyTouchedByLocked: string[];
  stillMissing: string[];
} {
  const visited = new Set((audit.visitedCounties ?? []).map((r) => r.county));
  const never = (audit.neverVisitedCounties ?? []).map((r) => r.county);
  const newlyTouched = [...lockedCounties].filter((c) => !visited.has(c));
  const projected = new Set([...visited, ...lockedCounties]);
  const stillMissing = never.filter((c) => !projected.has(c));
  return {
    visitedBaseline: visited.size,
    projectedAfterLocked: projected.size,
    newlyTouchedByLocked: newlyTouched.sort(),
    stillMissing: stillMissing.sort(),
  };
}

function tier1Dashboard(events: NormalizedLocked[], audit: Audit): Array<{
  county: string;
  vciRank: number | null;
  lastVisitDate: string | null;
  nextLockedDate: string | null;
  nextLockedEvent: string | null;
  status: string;
}> {
  const lockedByCounty = new Map<string, NormalizedLocked>();
  for (const e of events) {
    if (!e.county) continue;
    const prev = lockedByCounty.get(e.county);
    if (!prev || e.date < prev.date) lockedByCounty.set(e.county, e);
  }
  const visitedMap = new Map((audit.visitedCounties ?? []).map((r) => [r.county, r]));

  return TIER1_TRACK.map((county) => {
    const v = visitedMap.get(county);
    const lock = lockedByCounty.get(county);
    let status = "needs_schedule";
    if (lock) status = "locked_planned";
    else if (v?.lastVisitDate) status = "revisit_unscheduled";
    return {
      county,
      vciRank: v?.vciRank ?? null,
      lastVisitDate: v?.lastVisitDate ?? null,
      nextLockedDate: lock?.date ?? null,
      nextLockedEvent: lock?.eventName ?? null,
      status,
    };
  });
}

function deltaCorridorPlan(audit: Audit, openRecs: OpenDayRec[]): string {
  const deltaRows = (audit.neverVisitedCounties ?? []).filter((r) => DELTA_CORRIDOR.includes(r.county));
  const lines: string[] = [
    "# Delta Corridor Plan",
    "",
    "> Dedicated routing for Arkansas Delta counties — stack multi-purpose trips, minimize single-objective long drives.",
    "",
    "## Corridor counties",
    "",
    ...DELTA_CORRIDOR.map((c) => `- ${c}`),
    "",
    "## Best routing combinations",
    "",
    "### Combination A — Memphis gateway (1 overnight)",
    "- **Day 1:** West Memphis (Crittenden) · Marion evening stack",
    "- **Day 2:** Blytheville (Mississippi) · Osceola adjacency · return via Jonesboro if NE stack follows",
    "- **Drive:** ~120m Rose Bud → West Memphis · overnight recommended",
    "",
    "### Combination B — Helena / Phillips anchor (1 overnight)",
    "- **Day 1:** Helena (Phillips) · Delta town hall · coalition intros",
    "- **Day 2:** Clarendon (Monroe) · Forrest City (St. Francis) · stack Ashley/Lincoln if fair season aligns",
    "- **Priority:** Phillips + Monroe never visited · highest Delta VCI",
    "",
    "### Combination C — South Delta fair stack (Sep window)",
    "- **Ashley** (Crossett fair Sep 4–5) + **Chicot** (Lake Village) + **Desha** adjacency",
    "- Align with locked fair season · do not duplicate Forward Motion tentative queue",
    "",
    "### Combination D — Pine Bluff hub (day trip from LR Tue/Fri)",
    "- **Jefferson** Tier 1 revisit · stack Lincoln + Cleveland adjacency on second day",
    "- Use Little Rock origin on Tuesday/Friday protected-work exception days",
    "",
    "## Delta counties still never visited",
    "",
  ];

  if (deltaRows.length === 0) lines.push("_None — all Delta corridor counties have leadership or locked coverage._");
  else {
    for (const r of deltaRows.sort((a, b) => (a.vciRank ?? 99) - (b.vciRank ?? 99))) {
      lines.push(`- **${r.county}** · VCI ${r.vciRank ?? "—"} · score ${r.priorityScore ?? "—"}`);
    }
  }

  const openDelta = openRecs
    .filter((d) => d.status === "open" && d.options.some((o) => DELTA_CORRIDOR.includes(o.county)))
    .slice(0, 5);
  if (openDelta.length) {
    lines.push("", "## Next open weekend slots with Delta options", "");
    for (const d of openDelta) {
      const top = d.options.find((o) => DELTA_CORRIDOR.includes(o.county));
      if (top) lines.push(`- **${d.date} (${d.weekday})** → ${top.city}, ${top.county} · score ${top.score}`);
    }
  }

  return lines.join("\n") + "\n";
}

function septemberReadiness(audit: Audit, coverage: ReturnType<typeof projectedCoverage>): string {
  const sep1 = "2026-09-01";
  const missingVisits = coverage.stillMissing.filter((c) => {
    const row = (audit.neverVisitedCounties ?? []).find((r) => r.county === c);
    return row && (row.vciRank ?? 99) <= 40;
  });
  const tier1Unscheduled = TIER1_TRACK.filter((c) => {
    const v = (audit.visitedCounties ?? []).find((r) => r.county === c);
    return v && (v.daysSinceLastVisit ?? 0) > 45;
  });

  return `# September Readiness Gap Report

> If September began tomorrow (${sep1}), where is the campaign weak?

## Executive answer

September readiness is **partial**. Locked backbone covers **${coverage.projectedAfterLocked}/75** counties strategically, but **${coverage.stillMissing.length}** counties remain without a locked or leadership-confirmed visit. Delta corridor and several Tier 1 revisits are the highest-risk gaps before persuasion season.

---

## Counties lacking visits (never visited · still unscheduled)

${coverage.stillMissing.length ? coverage.stillMissing.map((c) => `- ${c}`).join("\n") : "_None_"}

### High-VCI among missing

${missingVisits.length ? missingVisits.map((c) => `- **${c}**`).join("\n") : "_No top-40 VCI counties remain completely unscheduled._"}

---

## Top counties lacking revisits

${tier1Unscheduled.length ? tier1Unscheduled.map((c) => `- **${c}** — Tier 1 · revisit overdue before September forums`).join("\n") : "_All tracked Tier 1 counties have recent leadership history._"}

---

## Coalitions lacking meetings

| Network | Status |
|---------|--------|
| NAACP branches | Seed empty — no branch meetings logged |
| AEA / educators | Outreach initiated in plan · few confirmed meetings |
| Muslim community (Ali Khan) | Fundraiser locked Aug 10 · community list empty |
| Labor / union halls | River Valley targets · Sebastian immersion Jul 31 |
| NWA Senior Dems | Locked Aug 5 · coalition meeting |
| Pulaski County Dems | Locked Jun 28 |

---

## Volunteer leadership

- Founding team goal: **20** · current: **0** (pre–Jun 28 launch)
- Volunteer retreat locked Jun 28 – Jul 6 at Forevermost Farms
- **Gap:** County captains not assigned in strike team data for most counties

---

## Endorsements

- Endorsement acquisition queue exists · majority status \`not_requested\`
- **Gap:** Labor and educator validators need forum-season confirmations before September

---

## Public proof gaps

- Calendar Truth verified events below 300 goal
- Mobilize events linked: **0** on people-power network snapshot
- Substack stories published: **0**
- Forward Motion activation queue is planning intelligence — **not** public proof

---

## Coverage summary

| Metric | Value |
|--------|------:|
| Leadership-confirmed visited | ${coverage.visitedBaseline} |
| After locked backbone | ${coverage.projectedAfterLocked} |
| Still missing | ${coverage.stillMissing.length} |
| Delta gaps open | ${(audit.deltaGapCounties ?? []).length} |
`;
}

function main() {
  mkdirSync(OUT, { recursive: true });

  const lockedRaw = readJson<{ events: LockedEvent[] }>(LOCKED_PATH);
  const audit = readJson<Audit>(AUDIT_PATH);
  if (!lockedRaw?.events?.length) throw new Error("locked-events-steve.json missing events");
  if (!audit?.summary) throw new Error("Run campaign-brain:coverage-audit:build first");

  const normalized = normalizeLocked(lockedRaw.events);
  writeFileSync(
    path.join(OUT, "locked-events.normalized.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), events: normalized }, null, 2),
  );

  const occupied = occupiedDates(normalized);
  const visitedSet = new Set((audit.visitedCounties ?? []).map((r) => r.county));
  const lockedCounties = new Set(normalized.map((e) => e.county).filter(Boolean));
  const lockedCountyDates = lockedCountySchedule(normalized);
  const coverage = projectedCoverage(audit, lockedCounties);
  const openQueue = buildOpenDayQueue(audit, occupied, visitedSet, lockedCountyDates);
  const tier1 = tier1Dashboard(normalized, audit);

  const openDays = openQueue.filter((d) => d.status === "open");
  const protectedDays = openQueue.filter((d) => d.status === "protected_work");
  const doNotFill = openQueue.filter((d) => d.status === "do_not_fill");
  const lockedDays = openQueue.filter((d) => d.status === "locked");

  const topOpenRecs = openDays
    .flatMap((d) => d.options.map((o) => ({ ...o, date: d.date, weekday: d.weekday })))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const summary = {
    generatedAt: new Date().toISOString(),
    windowStart: WINDOW_START,
    windowEnd: WINDOW_END,
    earlyVotingStart: EARLY_VOTING,
    lockedEventCount: normalized.length,
    lockedDayCount: lockedDays.length,
    openDayCount: openDays.length,
    protectedWorkDayCount: protectedDays.length,
    doNotFillDayCount: doNotFill.length,
    visitedBaseline: coverage.visitedBaseline,
    projectedCountiesAfterLocked: coverage.projectedAfterLocked,
    stillMissingCount: coverage.stillMissing.length,
    stillMissingCounties: coverage.stillMissing,
    newlyTouchedByLocked: coverage.newlyTouchedByLocked,
    topOpenRecommendations: topOpenRecs,
    tier1RevisitStatus: tier1,
    deltaCorridorCounties: DELTA_CORRIDOR,
  };

  writeFileSync(path.join(OUT, "calendar-settlement.summary.json"), JSON.stringify(summary, null, 2));

  // CALENDAR-SETTLEMENT-REPORT.md
  const report = `# Calendar Settlement Report

> Generated ${new Date().toISOString().slice(0, 10)} · Window ${WINDOW_START} → ${WINDOW_END} · Early voting ${EARLY_VOTING}

## Mission

Turn the 20-week strategy into Kelly's executable travel calendar using **locked events only**, reconciled Coverage Reality (43/75 visited), travel rules, and protected weekday work hours.

**This is planning intelligence — not Google Calendar and not Forward Motion queue.**

---

## Locked events (${normalized.length})

| Date | Event | County | Type | Travel | Overnight |
|------|-------|--------|------|--------|-----------|
${normalized
  .sort((a, b) => a.date.localeCompare(b.date))
  .map(
    (e) =>
      `| ${e.date}${e.dateEnd && e.dateEnd !== e.date ? `–${e.dateEnd}` : ""} | ${e.eventName} | ${e.county} | ${e.eventType} | ${e.travelClass} (${e.driveMinutesFromRoseBud}m) | ${e.overnightLikely ? "likely" : "—"} |`,
  )
  .join("\n")}

---

## Protected work blocks

- **Monday–Friday · 8 AM–5 PM** protected for candidate work
- **Exceptions:** media, coalition meetings, fundraisers, candidate forums (see locked \`eventType\`)
- **Tuesday + Friday:** mileage origin defaults to **Little Rock** (not Rose Bud)
- **Debate prep:** ${DEBATE_PREP_START} → ${DEBATE_DATE} — no open-day county fill

---

## Travel / overnight assumptions

| Class | Drive time | Rule |
|-------|------------|------|
| Local | < 60 min | Day trip from origin |
| Regional | 60–90 min | Stack 2+ objectives |
| Immersion | 90+ min | Overnight when evening event or next-day morning activity |

Origin: Rose Bud (home) · Tue/Fri → Little Rock work base

---

## Open days summary

| Status | Days |
|--------|-----:|
| Locked (backbone) | ${lockedDays.length} |
| Open (weekends post-debate) | ${openDays.length} |
| Protected work (weekdays) | ${protectedDays.length} |
| Do not fill (pre-debate / prep) | ${doNotFill.length} |

---

## High-priority calendar gaps

${coverage.stillMissing
  .slice(0, 15)
  .map((c) => {
    const row = (audit.neverVisitedCounties ?? []).find((r) => r.county === c);
    return `- **${c}** · VCI ${row?.vciRank ?? "—"} · ${row?.planningCategory?.replace(/_/g, " ") ?? "completion needed"}`;
  })
  .join("\n")}

### Tier 1 without locked date

${tier1
  .filter((t) => t.status !== "locked_planned")
  .map((t) => `- **${t.county}** · last visit ${t.lastVisitDate ?? "—"} · ${t.status.replace(/_/g, " ")}`)
  .join("\n")}

---

## County coverage projection

| Metric | Count |
|--------|------:|
| Leadership-confirmed visited | ${coverage.visitedBaseline} |
| After locked backbone | ${coverage.projectedAfterLocked} |
| New counties touched by locked trips | ${coverage.newlyTouchedByLocked.length} |
| Still missing | ${coverage.stillMissing.length} |

New from locked schedule: ${coverage.newlyTouchedByLocked.join(", ") || "—"}
`;

  writeFileSync(path.join(OUT, "CALENDAR-SETTLEMENT-REPORT.md"), report);

  // OPEN-DAY-RECOMMENDATION-QUEUE.md
  let openMd = `# Open Day Recommendation Queue

> ${WINDOW_START} → ${WINDOW_END} · Ranked county/cluster options for open weekends only · Weekdays marked protected work

`;
  for (const d of openQueue) {
    if (d.status === "locked") {
      openMd += `## ${d.date} (${d.weekday}) — LOCKED\n\n${d.reason}\n\n`;
      continue;
    }
    if (d.status === "do_not_fill") {
      openMd += `## ${d.date} (${d.weekday}) — DO NOT FILL\n\n${d.reason}\n\n`;
      continue;
    }
    if (d.status === "protected_work") {
      openMd += `## ${d.date} (${d.weekday}) — PROTECTED WORK\n\n${d.reason}\n\n`;
      continue;
    }
    openMd += `## ${d.date} (${d.weekday})\n\n`;
    d.options.forEach((o, i) => {
      const letter = String.fromCharCode(65 + i);
      openMd += `**Option ${letter}**\n${o.city}\n${o.county} County\nScore ${o.score}\n\n`;
    });
  }
  writeFileSync(path.join(OUT, "OPEN-DAY-RECOMMENDATION-QUEUE.md"), openMd);

  // COUNTY-COMPLETION-ROADMAP.md
  const completionRate = openDays.length > 0 ? coverage.stillMissing.length / openDays.length : 0;
  const weeksRemaining = Math.ceil(coverage.stillMissing.length / Math.max(1, Math.floor(openDays.length / 10)));
  const projectedDate =
    coverage.stillMissing.length === 0
      ? WINDOW_END
      : addDays(WINDOW_START, Math.min(126, weeksRemaining * 7 + 60));

  const completionMd = `# County Completion Roadmap

## Current state

| Metric | Value |
|--------|------:|
| Visited (leadership-confirmed) | ${coverage.visitedBaseline} |
| Never visited | ${audit.summary?.neverVisitedCounties ?? 32} |
| After locked backbone | ${coverage.projectedAfterLocked} / 75 |
| Still missing after locked schedule | ${coverage.stillMissing.length} |

## Projected completion

At current open-weekend capacity (~${openDays.length} open days in window), filling **${coverage.stillMissing.length}** remaining counties requires stacked multi-county trips.

**Projected completion date (estimate):** ${projectedDate}

> Estimate assumes 2–3 counties per open weekend immersion trip · not calendar-locked until leadership approves fill pass.

## Counties still missing after locked schedule

${coverage.stillMissing.map((c) => `- ${c}`).join("\n")}

## Suggested completion routes

### Route 1 — Delta overnight (Crittenden · Phillips · Monroe · St. Francis)
Single overnight from Rose Bud · highest strategic priority per coverage audit.

### Route 2 — South AR (Howard · Nevada · Ouachita · Calhoun)
Stack with Union immersion Jul 25–29 or Sep fair circuit.

### Route 3 — North Ozarks completion (Newton · Searcy · Stone · Izard)
Combine with Harrison Balloon Sep 28 or Baxter/Marion locked events.

### Route 4 — Central gap fill (Hot Spring · Montgomery · Perry · Conway revisits)
Use Tue/Fri LR origin for same-day regional stacks.

## New counties from locked backbone

${coverage.newlyTouchedByLocked.map((c) => `- ${c}`).join("\n") || "_No new counties beyond leadership baseline._"}
`;
  writeFileSync(path.join(OUT, "COUNTY-COMPLETION-ROADMAP.md"), completionMd);

  // TIER-1-REVISIT-DASHBOARD.md
  const tierMd = `# Tier 1 Revisit Dashboard

> Track next confirmed/planned visit for top VCI counties

| County | VCI | Last visit | Next locked | Event | Status |
|--------|----:|------------|-------------|-------|--------|
${tier1
  .map(
    (t) =>
      `| ${t.county} | ${t.vciRank ?? "—"} | ${t.lastVisitDate ?? "—"} | ${t.nextLockedDate ?? "—"} | ${t.nextLockedEvent ?? "—"} | ${t.status.replace(/_/g, " ")} |`,
  )
  .join("\n")}

## Notes

- **locked_planned** — leadership backbone includes a trip touching this county
- **revisit_unscheduled** — visited historically but no locked revisit in window
- **needs_schedule** — no leadership visit on file and no locked trip
`;
  writeFileSync(path.join(OUT, "TIER-1-REVISIT-DASHBOARD.md"), tierMd);

  writeFileSync(path.join(OUT, "DELTA-CORRIDOR-PLAN.md"), deltaCorridorPlan(audit, openQueue));
  writeFileSync(path.join(OUT, "SEPTEMBER-READINESS-GAP-REPORT.md"), septemberReadiness(audit, coverage));

  console.log(
    `Calendar settlement: ${normalized.length} locked events · ${openDays.length} open days · ${coverage.projectedAfterLocked}/75 projected · ${coverage.stillMissing.length} still missing`,
  );
}

main();
