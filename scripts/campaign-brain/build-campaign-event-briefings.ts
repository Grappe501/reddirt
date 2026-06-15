/**
 * Build dense field briefings for every public campaign calendar event.
 *
 * Usage: npm run campaign-brain:event-briefings:build
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import { CampaignEventType } from "@prisma/client";

import {
  type CampaignEventBriefing,
  type CampaignEventBriefingSnapshot,
  BRIEFING_PENDING,
} from "../../src/lib/calendar/campaign-event-briefing-types";
import { campaignEventSlug } from "../../src/lib/calendar/campaign-event-slug";
import {
  FOUR_LANE_STRATEGY_SUMMARY,
  laneDescriptiveLabelByNumber,
} from "../../src/lib/election-plan/four-lanes-labels";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "../../src/lib/calendar/public-event-types";
import { findInstantOnYmd } from "../../src/lib/calendar/public-event-format";
import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";

const ROOT = process.cwd();
const EXEC_PATH = path.join(ROOT, "docs/campaign-brain/executive-calendar/executive-calendar.json");
const LOCKED_PATH = path.join(ROOT, "docs/campaign-brain/calendar-settlement/locked-events.normalized.json");
const QUEUE_PATH = path.join(ROOT, "data/campaign-brain/upcoming-stops-activation-queue.json");
const OPPS_PATH = path.join(ROOT, "data/calendar-command-center/community-opportunities-2026.normalized.json");
const OVERRIDES_PATH = path.join(ROOT, "data/calendar-command-center/campaign-event-briefings.overrides.json");
const OUT_PATH = path.join(ROOT, "data/calendar-command-center/campaign-event-briefings.snapshot.json");

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

type LockedRow = {
  id: string;
  eventName: string;
  date: string;
  dateEnd: string | null;
  city: string;
  county: string;
  eventType: string;
  lockedStatus: string;
  timeKnown?: boolean;
  notes?: string;
  travelClass?: string;
  driveMinutesFromRoseBud?: number;
  overnightLikely?: boolean;
};

function readJson<T>(p: string): T | null {
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function defaultTimes(startDate: string, endDate: string | null) {
  const tz = PUBLIC_CALENDAR_DEFAULT_TZ;
  const startBase = findInstantOnYmd(startDate, tz);
  const startAt = new Date(startBase.getTime() + 10 * 60 * 60 * 1000);
  const endYmd = endDate && endDate >= startDate ? endDate : startDate;
  const endBase = findInstantOnYmd(endYmd, tz);
  const endAt = new Date(endBase.getTime() + 18 * 60 * 60 * 1000);
  return {
    startAt: startAt.toISOString(),
    endAt: (endAt <= startAt ? new Date(startAt.getTime() + 2 * 60 * 60 * 1000) : endAt).toISOString(),
  };
}

function mapEventTypeEnum(eventType?: string, label?: string): CampaignEventType {
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
  if (t === "fundraiser") return CampaignEventType.FUNDRAISER;
  return CampaignEventType.OTHER;
}

function countySlug(county: string): string | null {
  const raw = county.replace(/\s+County$/i, "").trim();
  if (!raw || raw === "—" || raw === "Statewide") return null;
  const first = raw.split(" · ")[0]?.trim() ?? raw;
  const hit = ARKANSAS_COUNTY_REGISTRY.find(
    (c) => c.displayName.replace(/\s+County$/i, "").toLowerCase() === first.toLowerCase(),
  );
  return hit?.slug ?? null;
}

function parseHostFromNotes(notes?: string): string | null {
  if (!notes) return null;
  const host = notes.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+host/i);
  if (host) return host[1];
  const assignee = notes.match(/Assignee:\s*(.+)/i);
  if (assignee) return assignee[1].trim();
  return null;
}

function defaultRunOfShow(category: ExecEntry["category"], eventType?: string): CampaignEventBriefing["runOfShow"] {
  const base = [
    { time: "T-14d", activity: "Confirm date, time, venue, and local contact", owner: "Field director", notes: null },
    { time: "T-7d", activity: "Volunteer shift draft in Mobilize (approval before publish)", owner: "People Power", notes: null },
    { time: "T-1d", activity: "Pack kit: signs, Po5 cards, merch, literature", owner: "Logistics", notes: null },
  ];
  if (/fair|festival/i.test(eventType ?? "")) {
    return [
      ...base,
      { time: "Day · AM", activity: "Travel / arrival · scout parking & booth", owner: "Driver + field", notes: null },
      { time: "Day · event", activity: "Kelly walk · booth · conversations · photos", owner: "Kelly + volunteers", notes: null },
      { time: "Day · PM", activity: "Debrief · story capture · Po5 log", owner: "Comms", notes: null },
    ];
  }
  if (category === "proposed") {
    return [{ time: null, activity: "Proposed — build run of show after leadership lock", owner: null, notes: null }];
  }
  return [
    ...base,
    { time: "Day of", activity: "Execute visit per locked schedule", owner: "Kelly", notes: null },
    { time: "Day +1", activity: "Thank-you follow-up · outcome report", owner: "Field", notes: null },
  ];
}

function campaignGoalFor(entry: ExecEntry): CampaignEventBriefing["campaignGoal"] {
  const county = entry.county.replace(/\s+County$/i, "");
  const et = (entry.eventType ?? "").toLowerCase();
  let primary = `Build relationships and visibility in ${county || "Arkansas"}.`;
  const metrics: string[] = ["Po5 conversations logged", "Volunteer signups", "Story captured for Substack/social"];
  if (/fair|festival|sherwood/i.test(et + entry.label)) {
    primary = `County fair/festival presence · voter contact · local validator introductions in ${county}.`;
    metrics.push("Booth traffic · VIP/donor touches");
  }
  if (/forum|town hall/i.test(et + entry.label)) {
    primary = "Earned credibility · Q&A · local press · persuasion audience.";
  }
  if (/gotv|canvass/i.test(et + entry.label)) {
    primary = "Turnout activation · registration checks · ride-to-polls relationships.";
  }
  if (/volunteer/i.test(et + entry.label)) {
    primary = "Volunteer leadership pipeline · county captain recruitment.";
  }
  if (/election/i.test(et + entry.label)) {
    primary = "Election Day operations · vote protection visibility · statewide closure.";
  }
  return {
    primary,
    successMetrics: metrics,
    volunteerAsk: "Shift signup via Mobilize once event is published.",
    registrationGoal: county ? `County registration goal — see /election-plan/registration-goals` : null,
  };
}

function whyFor(entry: ExecEntry): CampaignEventBriefing["why"] {
  const lanes: string[] = [];
  const et = (entry.eventType ?? "").toLowerCase();
  if (/fair|forum|community|visit/i.test(et)) {
    lanes.push(laneDescriptiveLabelByNumber(2), laneDescriptiveLabelByNumber(4));
  }
  if (/gotv|election/i.test(et)) {
    lanes.push(laneDescriptiveLabelByNumber(1), laneDescriptiveLabelByNumber(3));
  }
  if (/volunteer|registration/i.test(et + entry.label)) {
    lanes.push(laneDescriptiveLabelByNumber(3));
  }
  if (entry.source === "twenty-week-plan") lanes.push("20-week operating plan milestone");
  return {
    campaignRationale: entry.notes ?? null,
    strategicGoal: entry.category === "locked" ? "Leadership-locked backbone event." : null,
    laneFocus: lanes.length ? lanes : [FOUR_LANE_STRATEGY_SUMMARY],
  };
}

function kellyRoleFor(entry: ExecEntry, locked?: LockedRow): CampaignEventBriefing["kelly"] {
  const et = (entry.eventType ?? locked?.eventType ?? "").toLowerCase();
  let role = "Candidate presence · conversations · photos · short remarks if invited.";
  if (/fair|festival/i.test(et)) role = "Walk the fair · booth · livestock/parade visibility as appropriate · 45–120 min.";
  if (/fundraiser/i.test(et)) role = "Headline · host thank-yous · ask · relationship time.";
  if (/forum|town hall/i.test(et)) role = "Featured speaker · Q&A · stay for mingling.";
  if (/gotv/i.test(et)) role = "Energy · visibility · volunteer rally · media if available.";
  if (/volunteer|zoom/i.test(et + entry.label)) role = "Leadership voice · vision · assign county missions.";
  return {
    role,
    visibility: entry.category === "proposed" ? "TBD pending lock" : "Public · campaign-branded",
    assignment: locked?.lockedStatus ?? entry.status,
    talkingPoints: [
      "People over Politics · competent SOS administration",
      "Fair elections · accessible government · all 75 counties",
    ],
    boothOrStage: /fair|festival/i.test(et) ? "Confirm booth vs stage vs walk-only with local team" : null,
  };
}

function findOpportunity(title: string, county: string, opps: Array<{ title: string; county: string; notes?: string; campaignValue?: string; recommendedCoverage?: string; audienceTags?: string[] }>) {
  const cShort = county.replace(/\s+County$/i, "").toLowerCase();
  const tLow = title.toLowerCase();
  return opps.find((o) => {
    const oc = o.county.toLowerCase();
    const ot = o.title.toLowerCase();
    return (oc === cShort || tLow.includes(oc)) && (ot.includes(tLow.slice(0, 12)) || tLow.includes(ot.slice(0, 12)));
  });
}

function dataGapsFor(b: CampaignEventBriefing): string[] {
  const gaps: string[] = [];
  if (!b.when.timeKnown) gaps.push("Exact start/end time");
  if (!b.where.address) gaps.push("Street address / GPS");
  if (!b.localContact.name) gaps.push("Local contact name & phone");
  if (!b.trip.lodging && b.trip.overnight) gaps.push("Overnight lodging");
  if (!b.onlineIntel.sources.length) gaps.push("Official event website / social");
  if (b.runOfShow.length < 3) gaps.push("Detailed run of show");
  if (!b.kelly.boothOrStage && /fair|festival/i.test(b.what.eventType)) gaps.push("Booth vs stage assignment");
  return gaps;
}

function mergeBriefing(base: CampaignEventBriefing, patch: Partial<CampaignEventBriefing>): CampaignEventBriefing {
  return {
    ...base,
    ...patch,
    who: { ...base.who, ...patch.who },
    what: { ...base.what, ...patch.what },
    when: { ...base.when, ...patch.when },
    where: { ...base.where, ...patch.where },
    why: { ...base.why, ...patch.why },
    campaignGoal: { ...base.campaignGoal, ...patch.campaignGoal },
    onlineIntel: { ...base.onlineIntel, ...patch.onlineIntel },
    localContact: { ...base.localContact, ...patch.localContact },
    trip: { ...base.trip, ...patch.trip },
    kelly: { ...base.kelly, ...patch.kelly },
    logistics: { ...base.logistics, ...patch.logistics },
    volunteer: { ...base.volunteer, ...patch.volunteer },
    story: { ...base.story, ...patch.story },
    runOfShow: patch.runOfShow ?? base.runOfShow,
    openItems: patch.openItems ?? base.openItems,
    dataGaps: patch.dataGaps ?? base.dataGaps,
  };
}

function buildBriefing(
  entry: ExecEntry,
  lockedById: Map<string, LockedRow>,
  opps: Array<{ title: string; county: string; notes?: string; campaignValue?: string; recommendedCoverage?: string; audienceTags?: string[] }>,
): CampaignEventBriefing {
  const slug = campaignEventSlug(entry.label, entry.startDate);
  const locked = lockedById.get(entry.id);
  const { startAt, endAt } = defaultTimes(entry.startDate, entry.endDate);
  const host = parseHostFromNotes(entry.notes ?? locked?.notes);
  const opp = findOpportunity(entry.label, entry.county, opps);
  const etLabel = entry.eventType ?? locked?.eventType ?? "event";

  const briefing: CampaignEventBriefing = {
    slug,
    eventId: entry.id,
    calendarCategory:
      entry.category === "locked"
        ? "locked"
        : entry.category === "scheduled"
          ? "scheduled"
          : entry.category === "proposed"
            ? "proposed"
            : entry.source === "twenty-week-plan"
              ? "plan"
              : "unknown",
    verificationStatus: locked?.lockedStatus ?? entry.status,

    who: {
      audience: opp?.audienceTags?.join(" · ") ?? null,
      host,
      organizers: opp?.recommendedCoverage ? `Recommended coverage: ${opp.recommendedCoverage}` : null,
      expectedAttendance: null,
    },
    what: {
      title: entry.label,
      eventType: etLabel,
      eventTypeEnum: mapEventTypeEnum(entry.eventType, entry.label),
      description: entry.notes ?? opp?.notes ?? null,
    },
    when: {
      startAt,
      endAt,
      timezone: PUBLIC_CALENDAR_DEFAULT_TZ,
      timeKnown: locked?.timeKnown ?? entry.category === "locked",
      dateEnd: entry.endDate,
    },
    where: {
      venue: entry.city ? `${entry.city}${entry.county !== "—" ? ` · ${entry.county}` : ""}` : entry.county,
      address: null,
      city: entry.city,
      county: entry.county !== "—" ? entry.county : null,
      countySlug: countySlug(entry.county),
    },
    why: whyFor(entry),
    campaignGoal: campaignGoalFor(entry),
    onlineIntel: {
      lastResearched: opp ? "2026-05-13" : null,
      sources: opp
        ? [{ label: "Community opportunities inventory", url: null, snippet: opp.notes?.slice(0, 280) ?? null }]
        : [],
      officialSiteNotes: opp?.notes ?? null,
    },
    localContact: {
      name: host,
      role: host ? "Local host / validator" : null,
      phone: null,
      email: null,
      notes: locked?.notes ?? entry.notes ?? null,
    },
    trip: {
      travelClass: locked?.travelClass ?? null,
      driveMinutes: locked?.driveMinutesFromRoseBud ?? null,
      overnight: locked?.overnightLikely ?? null,
      lodging: locked?.overnightLikely ? BRIEFING_PENDING : null,
      departureBase: "Sherwood / Central Arkansas (default)",
      companions: null,
      outsideEventPlans: [],
    },
    runOfShow: defaultRunOfShow(entry.category, etLabel),
    kelly: kellyRoleFor(entry, locked),
    logistics: {
      parking: BRIEFING_PENDING,
      loadIn: null,
      avNeeds: null,
      merchAndSignage: "Standard field kit",
      dressCode: "Business casual · Kelly campaign shirt available",
    },
    volunteer: {
      lead: null,
      shifts: ["Setup", "Booth / crowd", "Po5 signup", "Breakdown"],
      mobilizeNotes: "Publish Mobilize event only after leadership approval.",
    },
    story: {
      capturePlan: "Same-day social draft · Substack within 72h if story warrants.",
      substackAngle: `${entry.county} community · real Arkansans · not staged politics`,
      socialHooks: [],
    },
    openItems: [
      ...(entry.category === "proposed" ? ["Leadership approval required"] : []),
      ...(locked?.timeKnown === false ? ["Verify exact time with county team"] : []),
    ],
    dataGaps: [],
    internalNotes: entry.source ? `Source: ${entry.source}` : null,
  };

  briefing.dataGaps = dataGapsFor(briefing);
  return briefing;
}

export function buildCampaignEventBriefingsSnapshot(): { path: string; count: number } {
  const exec = readJson<{ entries: ExecEntry[] }>(EXEC_PATH);
  const locked = readJson<{ events: LockedRow[] }>(LOCKED_PATH);
  const opps = readJson<{ rows?: Array<{ title: string; county: string; notes?: string; campaignValue?: string; recommendedCoverage?: string; audienceTags?: string[] }> }>(OPPS_PATH);
  const overridesFile = readJson<{ overrides?: Record<string, Partial<CampaignEventBriefing>> }>(OVERRIDES_PATH);

  const lockedById = new Map((locked?.events ?? []).map((e) => [e.id, e]));
  const ELECTION_DAY = "2026-11-03";

  const entries = (exec?.entries ?? []).filter(
    (e) => e.category !== "past_visit" && e.startDate <= ELECTION_DAY,
  );

  const briefings: Record<string, CampaignEventBriefing> = {};
  for (const entry of entries) {
    const b = buildBriefing(entry, lockedById, opps?.rows ?? []);
    const patch = overridesFile?.overrides?.[b.slug];
    briefings[b.slug] = patch ? mergeBriefing(b, patch) : b;
  }

  const payload: CampaignEventBriefingSnapshot = {
    generatedAt: new Date().toISOString(),
    version: 1,
    briefings,
  };

  mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));
  return { path: OUT_PATH, count: Object.keys(briefings).length };
}

const invokedDirectly = process.argv[1]?.replace(/\\/g, "/").endsWith("build-campaign-event-briefings.ts");
if (invokedDirectly) {
  const { path: out, count } = buildCampaignEventBriefingsSnapshot();
  console.log(`Campaign event briefings: ${count} events → ${out}`);
}
