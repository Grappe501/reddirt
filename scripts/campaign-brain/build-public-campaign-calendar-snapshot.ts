/**
 * Public campaign calendar snapshot — supplements Prisma events through Election Day.
 * Built from executive-calendar.json (locked, scheduled, plan milestones).
 *
 * Usage: npm run campaign-brain:public-calendar-snapshot:build
 * (Also invoked at end of executive-calendar build.)
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import { CampaignEventType } from "@prisma/client";

import { PUBLIC_CALENDAR_DEFAULT_TZ } from "../../src/lib/calendar/public-event-types";
import { findInstantOnYmd } from "../../src/lib/calendar/public-event-format";
import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";

const ELECTION_DAY = "2026-11-03";
const EXEC_PATH = path.join(process.cwd(), "docs/campaign-brain/executive-calendar/executive-calendar.json");
const OUT_DIR = path.join(process.cwd(), "data/calendar-command-center");
const OUT_PATH = path.join(OUT_DIR, "public-campaign-calendar.snapshot.json");

type ExecEntry = {
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

export type PublicCalendarSnapshotEvent = {
  id: string;
  slug: string;
  title: string;
  publicSummary: string | null;
  startAt: string;
  endAt: string;
  timezone: string;
  locationName: string | null;
  address: string | null;
  eventType: CampaignEventType;
  county: { displayName: string; slug: string } | null;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function mapEventType(eventType?: string, label?: string): CampaignEventType {
  const t = (eventType ?? "").toLowerCase();
  const blob = `${label ?? ""}`.toLowerCase();
  if (t === "fair" || t === "sherwood" || /fair|festival|fireworks|pops on the river/i.test(blob)) {
    return CampaignEventType.FESTIVAL;
  }
  if (t === "forum" || /forum|town hall/i.test(blob)) return CampaignEventType.APPEARANCE;
  if (t === "volunteer" || /volunteer|training|zoom/i.test(blob)) return CampaignEventType.TRAINING;
  if (t === "gotv" || /gotv|canvass/i.test(blob)) return CampaignEventType.CANVASS;
  if (t === "election" || /election day/i.test(blob)) return CampaignEventType.DEADLINE;
  if (/rally/i.test(blob)) return CampaignEventType.RALLY;
  return CampaignEventType.OTHER;
}

function resolveCounty(county: string): { displayName: string; slug: string } | null {
  const raw = county.replace(/\s+County$/i, "").trim();
  if (!raw || raw === "—" || raw === "Statewide") return null;
  const first = raw.split(" · ")[0]?.trim() ?? raw;
  const hit = ARKANSAS_COUNTY_REGISTRY.find(
    (c) =>
      c.displayName.replace(/\s+County$/i, "").toLowerCase() === first.toLowerCase() ||
      c.slug === slugify(first),
  );
  if (!hit) return null;
  return { displayName: hit.displayName, slug: hit.slug };
}

function defaultTimes(startDate: string, endDate: string | null): { startAt: Date; endAt: Date } {
  const tz = PUBLIC_CALENDAR_DEFAULT_TZ;
  const startBase = findInstantOnYmd(startDate, tz);
  const startAt = new Date(startBase.getTime() + 10 * 60 * 60 * 1000);
  const endYmd = endDate && endDate >= startDate ? endDate : startDate;
  const endBase = findInstantOnYmd(endYmd, tz);
  const endAt = new Date(endBase.getTime() + 18 * 60 * 60 * 1000);
  if (endAt <= startAt) {
    return { startAt, endAt: new Date(startAt.getTime() + 2 * 60 * 60 * 1000) };
  }
  return { startAt, endAt };
}

function buildLocation(entry: ExecEntry): string | null {
  const parts = [entry.city, entry.county !== "—" && entry.county !== "Statewide" ? entry.county : null]
    .filter(Boolean)
    .map(String);
  return parts.length ? parts.join(" · ") : entry.county === "Statewide" ? "Arkansas" : null;
}

function toSnapshotEvent(entry: ExecEntry): PublicCalendarSnapshotEvent {
  const { startAt, endAt } = defaultTimes(entry.startDate, entry.endDate);
  const slug = slugify(`${entry.label}-${entry.startDate}`);
  const locationName = buildLocation(entry);
  const county = resolveCounty(entry.county);
  const eventType = mapEventType(entry.eventType, entry.label);
  const summary =
    entry.category === "proposed"
      ? "Proposed stop — schedule subject to confirmation."
      : entry.source === "twenty-week-plan"
        ? "From the 20-week operating plan."
        : null;

  return {
    id: `snap-${entry.id}`,
    slug,
    title: entry.label,
    publicSummary: summary,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    timezone: PUBLIC_CALENDAR_DEFAULT_TZ,
    locationName,
    address: null,
    eventType,
    county,
  };
}

export function buildPublicCampaignCalendarSnapshot(): { path: string; count: number } {
  const exec = JSON.parse(readFileSync(EXEC_PATH, "utf8")) as { entries: ExecEntry[] };

  const events = exec.entries
    .filter((e) => e.category !== "past_visit" && e.startDate <= ELECTION_DAY)
    .map(toSnapshotEvent)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        horizonEnd: ELECTION_DAY,
        source: "executive-calendar",
        events,
      },
      null,
      2,
    ),
  );

  return { path: OUT_PATH, count: events.length };
}

const invokedDirectly = process.argv[1]?.replace(/\\/g, "/").endsWith("build-public-campaign-calendar-snapshot.ts");
if (invokedDirectly) {
  const { path: out, count } = buildPublicCampaignCalendarSnapshot();
  console.log(`Public campaign calendar snapshot: ${count} events → ${out}`);
}
