/**
 * Executive Field Calendar — past visits + locked + scheduled + proposed.
 * Internal leadership calendar for election-plan workbench. NOT Google Calendar.
 *
 * Usage: npm run campaign-brain:executive-calendar:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";
import { loadAllCountyVisits } from "./lib/county-coverage";
import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import { buildPublicCampaignCalendarSnapshot } from "./build-public-campaign-calendar-snapshot";

const OUT = path.join(BRAIN_ROOT, "executive-calendar");
const REFERENCE_DATE = "2026-06-15";
const ELECTION_DAY = "2026-11-03";
const CALENDAR_HORIZON = ELECTION_DAY;

const DISCLAIMER =
  "Internal leadership calendar. Past visits, locked backbone, and scheduled stops. Not Kelly's Google Calendar. Not public /events.";

type CalendarEntry = {
  id: string;
  startDate: string;
  endDate: string | null;
  label: string;
  city: string | null;
  county: string;
  category: "past_visit" | "locked" | "scheduled" | "proposed";
  status: string;
  source: string;
  eventType?: string;
  notes?: string;
};

function normalizeCounty(c: string): string {
  return c.replace(/\s+County$/i, "").trim();
}

function primaryCounty(c: string): string {
  const first = normalizeCounty(c.split(" · ")[0] ?? c);
  return first === "—" ? "" : first.toLowerCase();
}

const LABEL_STOP_WORDS = new Set([
  "county",
  "in",
  "the",
  "and",
  "or",
  "at",
  "on",
  "for",
  "with",
  "a",
  "an",
  "day",
  "annual",
  "scheduled",
  "tbd",
  "verify",
  "schedule",
]);

/** Collapse punctuation and festival naming variants for fuzzy duplicate detection. */
function normalizeLabelForDedupe(label: string): string {
  return label
    .toLowerCase()
    .replace(/craft\s*fest/g, "craftfest")
    .replace(/freedom\s*fest/g, "freedomfest")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function labelTokens(label: string): string[] {
  return [
    ...new Set(
      normalizeLabelForDedupe(label)
        .split(" ")
        .filter((t) => t.length > 2 && !LABEL_STOP_WORDS.has(t)),
    ),
  ].sort();
}

const SHARED_EVENT_KEYWORDS = [
  "juneteenth",
  "craftfest",
  "freedomfest",
  "peach",
  "debate",
  "fireworks",
  "food",
  "trucks",
  "chicken",
  "fry",
  "fair",
  "rodeo",
  "immersion",
];

function sharesEventKeyword(a: string, b: string): boolean {
  const na = normalizeLabelForDedupe(a);
  const nb = normalizeLabelForDedupe(b);
  return SHARED_EVENT_KEYWORDS.some((kw) => na.includes(kw) && nb.includes(kw));
}

function countiesOverlap(a: string, b: string): boolean {
  const ca = primaryCounty(a);
  const cb = primaryCounty(b);
  if (!ca || !cb) return true;
  return ca === cb;
}

function labelsSimilar(a: string, b: string): boolean {
  const na = normalizeLabelForDedupe(a);
  const nb = normalizeLabelForDedupe(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  if (sharesEventKeyword(a, b)) return true;

  const ta = labelTokens(a);
  const tb = labelTokens(b);
  if (!ta.length || !tb.length) return false;

  const intersection = ta.filter((t) => tb.includes(t));
  const union = new Set([...ta, ...tb]);
  if (intersection.length / union.size >= 0.45) return true;

  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  return short.length >= 2 && short.every((t) => long.includes(t));
}

function categoryRank(c: CalendarEntry["category"]): number {
  if (c === "locked") return 4;
  if (c === "scheduled") return 3;
  if (c === "proposed") return 2;
  return 1;
}

/** Prefer locked backbone ids and richer rows when collapsing near-duplicates. */
function entryKeepScore(e: CalendarEntry): number {
  let score = categoryRank(e.category) * 1000;
  if (e.id.startsWith("anchor-")) score += 300;
  if (e.id.startsWith("lock-")) score += 200;
  if (e.id.startsWith("fair-")) score += 100;
  if (e.city) score += 20;
  score += Math.min(e.label.length, 80);
  return score;
}

function isDuplicateEntry(a: CalendarEntry, b: CalendarEntry): boolean {
  if (a.startDate !== b.startDate) return false;
  if (!countiesOverlap(a.county, b.county)) return false;
  return labelsSimilar(a.label, b.label);
}

function mergeEntries(entries: CalendarEntry[]): CalendarEntry[] {
  const sorted = [...entries].sort((a, b) => entryKeepScore(b) - entryKeepScore(a));
  const kept: CalendarEntry[] = [];

  for (const entry of sorted) {
    const duplicate = kept.some((existing) => isDuplicateEntry(existing, entry));
    if (!duplicate) kept.push(entry);
  }

  return kept.sort((a, b) => {
    const d = a.startDate.localeCompare(b.startDate);
    if (d !== 0) return d;
    return a.label.localeCompare(b.label);
  });
}

function loadEventTitleMap(): Map<string, string> {
  const rows =
    readJson<{ rows?: Array<{ id: string; title: string }> }>(
      path.join(process.cwd(), "data/calendar-command-center/community-opportunities-2026.normalized.json"),
    )?.rows ?? [];
  return new Map(rows.map((r) => [r.id, r.title]));
}

function buildPastVisits(titleMap: Map<string, string>): CalendarEntry[] {
  const visits = loadAllCountyVisits(BRAIN_DATA);
  return visits
    .filter((v) => v.date <= REFERENCE_DATE)
    .map((v, i) => {
      const title = v.eventId ? titleMap.get(v.eventId) : undefined;
      return {
        id: `past-${v.county}-${v.date}-${i}`,
        startDate: v.date,
        endDate: null,
        label: title ?? `${v.county} County visit`,
        city: null,
        county: v.county,
        category: "past_visit" as const,
        status: v.source === "touch_summary" ? "leadership_confirmed" : "logged",
        source: v.source,
        eventType: "visit",
        notes: v.assignee ? `Assignee: ${v.assignee}` : undefined,
      };
    });
}

function buildLockedEvents(): CalendarEntry[] {
  const locked =
    readJson<{
      events?: Array<{
        id: string;
        eventName: string;
        date: string;
        dateEnd: string | null;
        city: string;
        county: string;
        eventType: string;
        lockedStatus: string;
        notes?: string;
      }>;
    }>(path.join(BRAIN_ROOT, "calendar-settlement/locked-events.normalized.json")) ??
    readJson(path.join(BRAIN_DATA, "locked-events-steve.json"));

  return (locked?.events ?? []).map((e) => ({
    id: e.id,
    startDate: e.date,
    endDate: e.dateEnd,
    label: e.eventName,
    city: e.city,
    county: normalizeCounty(e.county),
    category: "locked" as const,
    status: e.lockedStatus,
    source: "locked-events-steve",
    eventType: e.eventType,
    notes: e.notes,
  }));
}

function buildScheduledStops(lockedIds: Set<string>): CalendarEntry[] {
  const queue = readJson<{
    stops?: Array<{
      eventId: string;
      eventName: string;
      county: string;
      city: string;
      date: string;
      verificationStatus: string;
      assignment: string;
      nextAction?: string;
    }>;
  }>(path.join(BRAIN_DATA, "upcoming-stops-activation-queue.json"));

  return (queue?.stops ?? [])
    .filter((s) => s.date >= REFERENCE_DATE && s.date <= CALENDAR_HORIZON && !lockedIds.has(s.eventId))
    .map((s) => ({
      id: s.eventId,
      startDate: s.date,
      endDate: null,
      label: s.eventName,
      city: s.city === "TBD" ? null : s.city,
      county: normalizeCounty(s.county),
      category: "scheduled" as const,
      status: s.verificationStatus,
      source: "upcoming-stops-activation-queue",
      eventType: "opportunity",
      notes: s.nextAction,
    }));
}

function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function inferCountyFromLabel(label: string): string {
  for (const c of ARKANSAS_COUNTY_REGISTRY) {
    const short = c.displayName.replace(/\s+County$/i, "");
    if (label.includes(short)) return short;
  }
  if (/statewide|election day|early voting|gotv/i.test(label)) return "Statewide";
  return "—";
}

function buildPlanTimelineEntries(): CalendarEntry[] {
  const plan = readJson<{
    timeline?: Array<{
      weekNumber: number;
      date: string;
      label: string;
      category: string;
      importance: string;
    }>;
  }>(path.join(process.cwd(), "data/election-plan/twenty-week-plan.json"));

  return (plan?.timeline ?? [])
    .filter((t) => t.date >= REFERENCE_DATE && t.date <= CALENDAR_HORIZON)
    .map((t) => ({
      id: `plan-${t.date}-${slugifyLabel(t.label)}`,
      startDate: t.date,
      endDate: null,
      label: t.label,
      city: null,
      county: inferCountyFromLabel(t.label),
      category: (t.category === "election" || t.category === "gotv" ? "locked" : "scheduled") as CalendarEntry["category"],
      status: t.importance === "major" ? "plan_major" : "plan_standard",
      source: "twenty-week-plan",
      eventType: t.category,
      notes: `Week ${t.weekNumber} · 20-week operating plan`,
    }));
}

function buildElectionAnchors(): CalendarEntry[] {
  return [
    {
      id: "anchor-early-voting-2026",
      startDate: "2026-10-20",
      endDate: null,
      label: "Early voting begins · Arkansas",
      city: null,
      county: "Statewide",
      category: "locked",
      status: "election_calendar",
      source: "gotv-operations-plan",
      eventType: "gotv",
      notes: "In-person early voting · county clerks",
    },
    {
      id: "anchor-election-day-2026",
      startDate: ELECTION_DAY,
      endDate: null,
      label: "Election Day · Secretary of State",
      city: null,
      county: "Statewide",
      category: "locked",
      status: "election_calendar",
      source: "gotv-operations-plan",
      eventType: "election",
      notes: "Win condition · ballots cast",
    },
  ];
}

function buildProposedBlocks(): CalendarEntry[] {
  const v2 = readJson<{
    proposedBlocksV2?: Array<{
      id: string;
      label: string;
      startDate: string;
      endDate: string;
      countiesNew: string[];
      countiesRevisit: string[];
      approvalStatus: string;
    }>;
  }>(path.join(BRAIN_ROOT, "calendar-fill/proposed-calendar-fill-v2.json"));

  return (v2?.proposedBlocksV2 ?? [])
    .filter((b) => b.startDate >= REFERENCE_DATE && b.startDate <= CALENDAR_HORIZON)
    .map((b) => ({
      id: b.id,
      startDate: b.startDate,
      endDate: b.endDate !== b.startDate ? b.endDate : null,
      label: b.label,
      city: null,
      county: [...b.countiesNew, ...b.countiesRevisit].join(" · ") || "—",
      category: "proposed" as const,
      status: b.approvalStatus,
      source: "calendar-fill-phase-c",
      eventType: "corridor_block",
      notes: "Phase C — leadership sign-off required",
    }));
}

function buildMarkdown(entries: CalendarEntry[]): string {
  const past = entries.filter((e) => e.category === "past_visit");
  const locked = entries.filter((e) => e.category === "locked");
  const scheduled = entries.filter((e) => e.category === "scheduled");
  const proposed = entries.filter((e) => e.category === "proposed");

  const section = (title: string, rows: CalendarEntry[]) => {
    if (!rows.length) return `## ${title}\n\n_None._\n`;
    return `## ${title}\n\n| Date | Location | County | Status |\n|------|----------|--------|--------|\n${rows
      .map((e) => {
        const dates =
          e.endDate && e.endDate !== e.startDate
            ? `${e.startDate} → ${e.endDate}`
            : e.startDate;
        const loc = e.city ? `${e.city}` : "—";
        return `| ${dates} | ${e.label}${loc !== "—" ? ` · ${loc}` : ""} | ${e.county} | ${e.status} |`;
      })
      .join("\n")}\n`;
  };

  return `# Executive Field Calendar

> ${DISCLAIMER}

**Reference date:** ${REFERENCE_DATE}

| Category | Count |
|----------|------:|
| Past visits | ${past.length} |
| Locked backbone | ${locked.length} |
| Scheduled opportunities | ${scheduled.length} |
| Proposed (Phase C) | ${proposed.length} |
| **Total entries** | **${entries.length}** |

${section("Past locations visited", past)}

${section("Locked — leadership backbone", locked)}

${section("Scheduled — upcoming opportunities", scheduled)}

${section("Proposed — Phase C blocks (not final)", proposed)}

Rebuild: \`npm run campaign-brain:executive-calendar:build\`
`;
}

function main() {
  mkdirSync(OUT, { recursive: true });

  const titleMap = loadEventTitleMap();
  const past = buildPastVisits(titleMap);
  const locked = buildLockedEvents().filter((e) => e.startDate <= CALENDAR_HORIZON);
  const lockedIds = new Set(locked.map((e) => e.id));
  const scheduled = buildScheduledStops(lockedIds);
  const proposed = buildProposedBlocks();
  const planTimeline = buildPlanTimelineEntries();
  const electionAnchors = buildElectionAnchors();

  const entries = mergeEntries([...past, ...locked, ...scheduled, ...proposed, ...planTimeline, ...electionAnchors]);
  const generatedAt = new Date().toISOString();

  const payload = {
    generatedAt,
    referenceDate: REFERENCE_DATE,
    disclaimer: DISCLAIMER,
    summary: {
      pastVisitCount: entries.filter((e) => e.category === "past_visit").length,
      lockedCount: entries.filter((e) => e.category === "locked").length,
      scheduledCount: entries.filter((e) => e.category === "scheduled").length,
      proposedCount: entries.filter((e) => e.category === "proposed").length,
      totalEntries: entries.length,
      countiesVisited: new Set(entries.filter((e) => e.category === "past_visit").map((e) => normalizeCounty(e.county)))
        .size,
      countiesScheduled: new Set(
        [...locked, ...scheduled].map((e) => normalizeCounty(e.county.split(" · ")[0] ?? e.county)),
      ).size,
    },
    entries,
  };

  writeFileSync(path.join(OUT, "executive-calendar.json"), JSON.stringify(payload, null, 2));
  writeFileSync(path.join(OUT, "executive-calendar.md"), buildMarkdown(entries));
  writeFileSync(
    path.join(OUT, "executive-calendar.summary.json"),
    JSON.stringify(
      {
        generatedAt,
        disclaimer: DISCLAIMER,
        ...payload.summary,
      },
      null,
      2,
    ),
  );

  console.log(
    `Executive calendar: ${payload.summary.totalEntries} entries · ${payload.summary.pastVisitCount} past · ${payload.summary.lockedCount} locked · ${payload.summary.scheduledCount} scheduled · ${payload.summary.proposedCount} proposed`,
  );

  const snap = buildPublicCampaignCalendarSnapshot();
  console.log(
    `Public calendar snapshot: ${snap.count} events · ${snap.briefingCount} field briefings through ${ELECTION_DAY}`,
  );
}

main();
