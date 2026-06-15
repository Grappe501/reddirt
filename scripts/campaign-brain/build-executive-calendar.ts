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

function dedupeKey(e: CalendarEntry): string {
  return `${e.startDate}|${normalizeCounty(e.county)}|${e.label.toLowerCase()}`;
}

function categoryRank(c: CalendarEntry["category"]): number {
  if (c === "locked") return 4;
  if (c === "scheduled") return 3;
  if (c === "proposed") return 2;
  return 1;
}

function mergeEntries(entries: CalendarEntry[]): CalendarEntry[] {
  const byKey = new Map<string, CalendarEntry>();
  for (const e of entries) {
    const key = dedupeKey(e);
    const existing = byKey.get(key);
    if (!existing || categoryRank(e.category) > categoryRank(existing.category)) {
      byKey.set(key, e);
    }
  }
  return [...byKey.values()].sort((a, b) => {
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
