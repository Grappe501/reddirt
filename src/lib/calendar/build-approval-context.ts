/**
 * Deterministic Kelly approval context — all facts computed here; AI must not invent these fields.
 */
import { addDays } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import type { CampaignCalendarItem } from "./campaign-calendar-item";

const TZ = "America/Chicago";
export const KELLY_HOME_BASE = "Rose Bud, Arkansas" as const;
const ROSE_BUD = { lat: 35.3261, lon: -92.0804 };

/** Approximate county-seat coordinates for drive estimates from Rose Bud (not geocoded addresses). */
const COUNTY_SEAT: Record<string, { lat: number; lon: number; seat: string }> = {
  pulaski: { lat: 34.7465, lon: -92.2896, seat: "Little Rock" },
  saline: { lat: 34.5645, lon: -92.5868, seat: "Benton" },
  faulkner: { lat: 35.0887, lon: -92.4425, seat: "Conway" },
  washington: { lat: 36.0626, lon: -94.1574, seat: "Fayetteville" },
  benton: { lat: 36.3729, lon: -94.2088, seat: "Bentonville" },
  craighead: { lat: 35.8423, lon: -90.7043, seat: "Jonesboro" },
  garland: { lat: 34.5037, lon: -93.0552, seat: "Hot Springs" },
  white: { lat: 35.2509, lon: -91.7361, seat: "Searcy" },
  independence: { lat: 35.8717, lon: -91.4092, seat: "Batesville" },
  sebastian: { lat: 35.3859, lon: -94.3986, seat: "Fort Smith" },
  crawford: { lat: 35.4597, lon: -94.0033, seat: "Van Buren" },
  jefferson: { lat: 34.2284, lon: -92.0032, seat: "Pine Bluff" },
  crittenden: { lat: 35.146, lon: -90.1848, seat: "Marion" },
  union: { lat: 33.211, lon: -92.6657, seat: "El Dorado" },
  columbia: { lat: 33.2157, lon: -93.236, seat: "Magnolia" },
  ashley: { lat: 33.1093, lon: -91.2629, seat: "Hamburg" },
  baxter: { lat: 36.3345, lon: -92.4602, seat: "Mountain Home" },
  carroll: { lat: 36.2615, lon: -93.6119, seat: "Berryville" },
  clark: { lat: 34.0364, lon: -93.051, seat: "Arkadelphia" },
  cleburne: { lat: 35.5134, lon: -92.0316, seat: "Heber Springs" },
  conway: { lat: 35.5154, lon: -92.7446, seat: "Morrilton" },
  cross: { lat: 35.2245, lon: -90.7821, seat: "Wynne" },
  desha: { lat: 33.8773, lon: -91.3937, seat: "Arkansas City" },
  drew: { lat: 33.589, lon: -91.5526, seat: "Monticello" },
  franklin: { lat: 35.5023, lon: -93.848, seat: "Ozark" },
  greene: { lat: 36.0604, lon: -90.5053, seat: "Paragould" },
  hempstead: { lat: 33.6668, lon: -93.5966, seat: "Hope" },
  hot_spring: { lat: 34.3623, lon: -92.8129, seat: "Malvern" },
  johnson: { lat: 35.5677, lon: -93.7355, seat: "Clarksville" },
  lawrence: { lat: 36.0592, lon: -91.4979, seat: "Walnut Ridge" },
  logan: { lat: 35.2134, lon: -93.7238, seat: "Paris" },
  lonoke: { lat: 34.7842, lon: -91.9779, seat: "Lonoke" },
  madison: { lat: 36.3809, lon: -93.7385, seat: "Huntsville" },
  marion: { lat: 36.2612, lon: -92.6841, seat: "Yellville" },
  mississippi: { lat: 35.9273, lon: -89.9187, seat: "Blytheville" },
  monroe: { lat: 34.7476, lon: -91.3965, seat: "Clarendon" },
  montgomery: { lat: 34.5379, lon: -93.6316, seat: "Mount Ida" },
  nevada: { lat: 33.6669, lon: -93.2402, seat: "Prescott" },
  newton: { lat: 35.8526, lon: -93.3235, seat: "Jasper" },
  ouachita: { lat: 33.589, lon: -92.8366, seat: "Camden" },
  perry: { lat: 35.0473, lon: -92.7963, seat: "Perryville" },
  phillips: { lat: 34.5281, lon: -90.59, seat: "Helena-West Helena" },
  poinsett: { lat: 35.5657, lon: -90.7382, seat: "Harrisburg" },
  polk: { lat: 34.5851, lon: -94.2374, seat: "Mena" },
  pope: { lat: 35.2784, lon: -93.1338, seat: "Russellville" },
  prairie: { lat: 34.829, lon: -91.5521, seat: "Des Arc" },
  randolph: { lat: 36.2529, lon: -91.0835, seat: "Pocahontas" },
  scott: { lat: 34.774, lon: -94.1319, seat: "Waldron" },
  searcy: { lat: 35.2473, lon: -92.6646, seat: "Marshall" },
  sharp: { lat: 36.3156, lon: -91.5518, seat: "Ash Flat" },
  st_francis: { lat: 35.0215, lon: -90.7826, seat: "Forrest City" },
  stone: { lat: 35.8642, lon: -92.2993, seat: "Mountain View" },
  van_buren: { lat: 35.5959, lon: -92.451, seat: "Clinton" },
  woodruff: { lat: 35.189, lon: -91.3343, seat: "Augusta" },
  yell: { lat: 35.002, lon: -93.4119, seat: "Dardanelle" },
};

const AR_CENTER = { lat: 34.9697, lon: -92.3731 };

const FILLER_COUNTIES = new Set(["pulaski", "saline", "faulkner", "washington", "benton", "craighead"]);

export function normCountyKey(raw?: string | null): string | null {
  if (!raw) return null;
  return raw
    .toLowerCase()
    .replace(/\s+county\s*$/i, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function haversineMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 3958.7613;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function chicagoYmdFromIso(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function chicagoYmdAddWall(iso: string, deltaDays: number): string {
  const ymd = chicagoYmdFromIso(iso);
  const anchor = toDate(`${ymd}T12:00:00`, { timeZone: TZ });
  return formatInTimeZone(addDays(anchor, deltaDays), TZ, "yyyy-MM-dd");
}

/** Sunday = 0 … Saturday = 6 in America/Chicago for the calendar day of `iso`. */
function chicagoWeekdaySun0(iso: string): number {
  const ymd = chicagoYmdFromIso(iso);
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
}

function minutesSinceMidnightChicago(iso: string): number {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(d);
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hh * 60 + mm;
}

function destinationForItem(item: CampaignCalendarItem): {
  lat: number;
  lon: number;
  confidence: ApprovalContext["distanceConfidence"];
  label: string;
} {
  const key = normCountyKey(item.county);
  if (key && COUNTY_SEAT[key]) {
    const s = COUNTY_SEAT[key]!;
    return { lat: s.lat, lon: s.lon, confidence: "county_seat_estimate", label: `${s.seat} (${item.county})` };
  }
  return { lat: AR_CENTER.lat, lon: AR_CENTER.lon, confidence: "unknown", label: "Arkansas (centroid estimate)" };
}

export type WorkScheduleSummary =
  | "during_work_hours"
  | "requires_work_exception"
  | "can_be_done_after_work"
  | "night_before_travel_recommended"
  | "no_issue";

export type ApprovalContextHints = {
  strategicClass?: string;
  pastTouchesSinceNov1?: number;
  nextScheduledAnchor?: string;
  prioritySnapshotTier?: string;
};

export type ApprovalContext = {
  calendarItemId: string;
  title: string;
  date: string;
  start: string;
  end?: string;
  county?: string;
  city?: string;
  location?: string;
  eventType: string;
  source: string;
  verificationStatus: string;
  priorityTier?: string;
  countyTouchCount?: number;
  whoSummary?: string;
  whyThisMatters: string;

  homeBase: typeof KELLY_HOME_BASE;
  /** Miles from resolved travel origin (prior anchor or Rose Bud) to this event destination estimate. */
  estimatedDistanceMiles?: number;
  /** When travel origin is not Rose Bud, distance from Rose Bud to destination for reference. */
  estimatedDistanceMilesFromRoseBud?: number;
  estimatedDriveMinutes?: number;
  distanceConfidence: "exact" | "county_seat_estimate" | "unknown";
  travelOriginLabel: string;
  travelOriginKind: "rose_bud" | "same_day_prior_event" | "prior_night_overnight";

  workWindowConflict: boolean;
  workWindowNote: string;
  workScheduleSummary: WorkScheduleSummary;
  workScheduleDetail: string;

  tuesdayLittleRockConflict: boolean;
  tuesdayLittleRockNote: string;

  conflicts: Array<{
    calendarItemId: string;
    title: string;
    start: string;
    end?: string;
    conflictType: "overlap" | "tight_turnaround" | "impossible_travel" | "work_window";
    note: string;
  }>;

  countySeatOpportunity: boolean;
  countyClerkSuggestion?: string;
  courthousePhotoSuggestion?: string;
  localCivicStopSuggestion?: string;

  noonLunchOpportunity: boolean;
  lunchSuggestion?: string;
  lunchWindowLabel: "lunch_slot_available" | "no_lunch_window";

  overnightRecommended: boolean;
  overnightReason?: string;

  localCoverageAvailable: boolean;
  localCoverageNote?: string;

  staffNotes?: string;
};

function overlapsWorkWindow(item: CampaignCalendarItem): { conflict: boolean; note: string } {
  if (item.allDay) {
    return {
      conflict: false,
      note: "All-day block — work overlap not auto-flagged (confirm intent).",
    };
  }
  const sun0 = chicagoWeekdaySun0(item.start);
  if (sun0 === 0 || sun0 === 6) {
    return { conflict: false, note: "Weekend event — 8–5 work rule not applied." };
  }
  const startM = minutesSinceMidnightChicago(item.start);
  const endM = item.end ? minutesSinceMidnightChicago(item.end) : startM + 60;
  const workStart = 8 * 60;
  const workEnd = 17 * 60;
  const overlap = startM < workEnd && endM > workStart;
  return {
    conflict: overlap,
    note: overlap
      ? "Timed event overlaps Kelly’s usual 8:00–17:00 work window (Central, weekdays)."
      : "Timed event is outside the usual 8:00–17:00 weekday work window.",
  };
}

function tuesdayLittleRock(item: CampaignCalendarItem): { conflict: boolean; note: string } {
  const sun0 = chicagoWeekdaySun0(item.start);
  if (sun0 !== 2) {
    return { conflict: false, note: "Not a Tuesday (Central) — Tuesday Little Rock rule not triggered." };
  }
  if (item.drillDown?.plannedTuesdayWorkException) {
    return {
      conflict: false,
      note: "Tuesday — planned workday exception is flagged on this item (confirm in workbook).",
    };
  }
  if (item.eventType === "virtual_statewide") {
    return { conflict: false, note: "Virtual / statewide — Tuesday rule relaxed." };
  }
  const c = (item.county ?? "").toLowerCase();
  const loc = `${item.location ?? ""} ${item.title}`.toLowerCase();
  const inPulaski = c.includes("pulaski") || loc.includes("little rock") || loc.includes("pulaski");
  if (inPulaski) {
    return { conflict: false, note: "Tuesday in Pulaski / Little Rock area — aligns with daytime LR work." };
  }
  return {
    conflict: true,
    note: "Tuesday daytime travel outside Pulaski / Little Rock — verify explicit exception vs LR work rule.",
  };
}

function findOverlaps(
  item: CampaignCalendarItem,
  all: CampaignCalendarItem[],
): ApprovalContext["conflicts"] {
  const out: ApprovalContext["conflicts"] = [];
  if (!item.end || item.allDay) return out;
  const day = chicagoYmdFromIso(item.start);
  const as = new Date(item.start).getTime();
  const ae = new Date(item.end).getTime();
  for (const o of all) {
    if (o.id === item.id || o.allDay || !o.end) continue;
    if (chicagoYmdFromIso(o.start) !== day) continue;
    const bs = new Date(o.start).getTime();
    const be = new Date(o.end).getTime();
    if (as < be && bs < ae) {
      out.push({
        calendarItemId: o.id,
        title: o.title,
        start: o.start,
        end: o.end,
        conflictType: "overlap",
        note: "Overlapping timed blocks the same calendar day (Central).",
      });
    }
  }
  return out;
}

function countySeatOpportunityHeuristic(item: CampaignCalendarItem, seatName: string | undefined): boolean {
  if (!seatName || !item.county) return false;
  const city = (item.city ?? "").toLowerCase();
  const loc = (item.location ?? "").toLowerCase();
  const seat = seatName.toLowerCase();
  return city.includes(seat) || loc.includes(seat);
}

function lunchHeuristic(item: CampaignCalendarItem): { ok: boolean; note?: string } {
  if (item.allDay) {
    return {
      ok: true,
      note: "All-day county work — if logistics allow, consider a noon lunch with a local host (not scheduled automatically).",
    };
  }
  const startM = minutesSinceMidnightChicago(item.start);
  const endM = item.end ? minutesSinceMidnightChicago(item.end) : startM + 60;
  const lunchStart = 11 * 60 + 30;
  const lunchEnd = 13 * 60;
  const busyLunch = startM < lunchEnd && endM > lunchStart;
  if (busyLunch) {
    return { ok: false, note: "Event overlaps 11:30–13:00 — noon lunch window not clearly open." };
  }
  if (endM <= lunchStart) {
    return {
      ok: true,
      note: "Ends before ~11:30 — optional noon lunch with a local could follow (staff to schedule).",
    };
  }
  if (startM >= lunchEnd) {
    return {
      ok: true,
      note: "Starts after ~13:00 — optional noon lunch with a local could precede (staff to schedule).",
    };
  }
  return { ok: true, note: "Mid-day gap may allow a noon lunch — confirm with host." };
}

type TravelOrigin = {
  lat: number;
  lon: number;
  label: string;
  kind: "rose_bud" | "same_day_prior_event" | "prior_night_overnight";
  confidence: ApprovalContext["distanceConfidence"];
};

function resolveTravelOrigin(item: CampaignCalendarItem, all: CampaignCalendarItem[]): TravelOrigin {
  const rose: TravelOrigin = {
    lat: ROSE_BUD.lat,
    lon: ROSE_BUD.lon,
    label: KELLY_HOME_BASE,
    kind: "rose_bud",
    confidence: "exact",
  };
  const day = chicagoYmdFromIso(item.start);
  const itemStart = new Date(item.start).getTime();
  const sameDay = all
    .filter((o) => o.id !== item.id && chicagoYmdFromIso(o.start) === day)
    .filter((o) => new Date(o.end ?? o.start).getTime() <= itemStart)
    .sort((a, b) => new Date(b.end ?? b.start).getTime() - new Date(a.end ?? a.start).getTime());
  for (const o of sameDay) {
    const d = destinationForItem(o);
    if (d.confidence !== "unknown" || normCountyKey(o.county)) {
      return {
        lat: d.lat,
        lon: d.lon,
        label: `After “${o.title}” (${d.label})`,
        kind: "same_day_prior_event",
        confidence: d.confidence,
      };
    }
  }
  const prevYmd = chicagoYmdAddWall(item.start, -1);
  const prevCands = all.filter((o) => {
    if (o.id === item.id) return false;
    const onPrev = chicagoYmdFromIso(o.start) === prevYmd || (o.end ? chicagoYmdFromIso(o.end) === prevYmd : false);
    const overnightish =
      o.eventType === "overnight" ||
      Boolean(o.overnightRequired) ||
      /overnight/i.test(o.title) ||
      /stay/i.test(o.overnightCity ?? "");
    return onPrev && overnightish;
  });
  prevCands.sort((a, b) => new Date(b.end ?? b.start).getTime() - new Date(a.end ?? a.start).getTime());
  const pick = prevCands[0];
  if (pick) {
    const d = destinationForItem(pick);
    return {
      lat: d.lat,
      lon: d.lon,
      label: `Night prior: “${pick.title}” (${d.label})`,
      kind: "prior_night_overnight",
      confidence: d.confidence,
    };
  }
  return rose;
}

function classifyWorkSchedule(
  item: CampaignCalendarItem,
  args: {
    work: ReturnType<typeof overlapsWorkWindow>;
    tue: ReturnType<typeof tuesdayLittleRock>;
    overnightRecommended: boolean;
  },
): { summary: WorkScheduleSummary; detail: string } {
  const sun0 = chicagoWeekdaySun0(item.start);
  const weekend = sun0 === 0 || sun0 === 6;
  if (weekend) {
    return { summary: "no_issue", detail: "Weekend — weekday 8–5 work schedule not applied." };
  }
  if (item.allDay) {
    return {
      summary: "during_work_hours",
      detail: "Weekday all-day block — assume normal workday unless an exception is on file.",
    };
  }
  const tueEx = Boolean(item.drillDown?.plannedTuesdayWorkException);
  if (args.tue.conflict && !tueEx) {
    return { summary: "requires_work_exception", detail: args.tue.note };
  }
  const startM = minutesSinceMidnightChicago(item.start);
  const endM = item.end ? minutesSinceMidnightChicago(item.end) : startM + 60;
  if (args.overnightRecommended && startM <= 11 * 60) {
    return {
      summary: "night_before_travel_recommended",
      detail: "Early-day or long leg — confirm overnight staging the night before.",
    };
  }
  if (startM >= 17 * 60) {
    return { summary: "can_be_done_after_work", detail: "Starts at or after ~5:00 p.m. Central." };
  }
  if (endM <= 8 * 60) {
    return { summary: "no_issue", detail: "Ends at or before 8:00 a.m. — outside standard work hours." };
  }
  if (args.work.conflict) {
    return { summary: "during_work_hours", detail: args.work.note };
  }
  if (args.tue.conflict && tueEx) {
    return { summary: "no_issue", detail: "Tuesday exception is flagged — still confirm logistics." };
  }
  return { summary: "no_issue", detail: "Timed outside the usual 8–5 overlap window." };
}

function buildWhyThisMatters(item: CampaignCalendarItem, hints?: ApprovalContextHints): string {
  const parts: string[] = [];
  if (item.priorityTier) parts.push(`Workbook tier: ${item.priorityTier}.`);
  if (hints?.prioritySnapshotTier) parts.push(`County snapshot tier: ${hints.prioritySnapshotTier}.`);
  if (hints?.strategicClass) parts.push(`Strategic note: ${hints.strategicClass}`);
  if (typeof hints?.pastTouchesSinceNov1 === "number") parts.push(`Past touches since Nov 1 (workbook): ${hints.pastTouchesSinceNov1}.`);
  if (hints?.nextScheduledAnchor) parts.push(`Next anchor in snapshot: ${hints.nextScheduledAnchor}`);
  if (item.notes?.trim()) parts.push(item.notes.trim().slice(0, 280));
  if (!parts.length) parts.push("County priority + travel workbook — confirm value with staff.");
  return parts.join(" ");
}

function whoSummaryFromItem(item: CampaignCalendarItem): string | undefined {
  const dd = item.drillDown;
  if (!dd) return undefined;
  const bits = [dd.kellyRole && `Kelly: ${dd.kellyRole}`, dd.host && `Host: ${dd.host}`, dd.contacts && `Contacts: ${dd.contacts}`].filter(
    Boolean,
  ) as string[];
  return bits.length ? bits.join(" · ") : undefined;
}

export function buildApprovalContext(
  item: CampaignCalendarItem,
  allItems: CampaignCalendarItem[],
  hints?: ApprovalContextHints,
): ApprovalContext {
  const dest = destinationForItem(item);
  const origin = resolveTravelOrigin(item, allItems);
  const milesFromOrigin = haversineMiles({ lat: origin.lat, lon: origin.lon }, dest);
  const milesHome = haversineMiles(ROSE_BUD, dest);
  const driveMin = Math.round((milesFromOrigin / 55) * 60);
  const key = normCountyKey(item.county);
  const seatRow = key && COUNTY_SEAT[key] ? COUNTY_SEAT[key] : undefined;
  const seatOpp = countySeatOpportunityHeuristic(item, seatRow?.seat);
  const lunch = lunchHeuristic(item);
  const work = overlapsWorkWindow(item);
  const tue = tuesdayLittleRock(item);
  const overlaps = findOverlaps(item, allItems);

  const overnightRecommended =
    Boolean(item.overnightRequired) || milesFromOrigin > 140 || driveMin > 150 || overlaps.length > 0;
  const overnightReason = item.overnightRequired
    ? "Workbook flagged overnight."
    : milesFromOrigin > 140
      ? "Long drive from travel origin — consider overnight staging."
      : overlaps.length
        ? "Overlapping schedule may require split days / overnight."
        : undefined;

  const ws = classifyWorkSchedule(item, { work, tue, overnightRecommended });
  const courthousePhoto =
    seatOpp && seatRow
      ? `Courthouse / county-office area photo stop near ${seatRow.seat} if schedule and safety allow (no staged crowd shots without consent).`
      : undefined;
  const localCivic =
    seatOpp && seatRow
      ? `Optional civic stop near ${seatRow.seat} (chamber / Rotary / library) — confirm invites; do not invent meeting times.`
      : undefined;

  return {
    calendarItemId: item.id,
    title: item.title,
    date: chicagoYmdFromIso(item.start),
    start: item.start,
    end: item.end,
    county: item.county,
    city: item.city,
    location: item.location,
    eventType: item.eventType,
    source: item.source,
    verificationStatus: item.calendarStatus,
    priorityTier: item.priorityTier,
    countyTouchCount: item.countyTouchCounts ? 1 : 0,
    whoSummary: whoSummaryFromItem(item),
    whyThisMatters: buildWhyThisMatters(item, hints),
    homeBase: KELLY_HOME_BASE,
    estimatedDistanceMiles: Math.round(milesFromOrigin * 10) / 10,
    estimatedDistanceMilesFromRoseBud:
      origin.kind === "rose_bud" ? undefined : Math.round(milesHome * 10) / 10,
    estimatedDriveMinutes: driveMin,
    distanceConfidence: dest.confidence,
    travelOriginLabel: origin.label,
    travelOriginKind: origin.kind,
    workWindowConflict: work.conflict,
    workWindowNote: work.note,
    workScheduleSummary: ws.summary,
    workScheduleDetail: ws.detail,
    tuesdayLittleRockConflict: tue.conflict,
    tuesdayLittleRockNote: tue.note,
    conflicts: overlaps,
    countySeatOpportunity: seatOpp,
    countyClerkSuggestion: seatOpp
      ? `County seat area (${seatRow?.seat ?? "seat"}) — optional county clerk visit if schedule allows (confirm hours).`
      : undefined,
    courthousePhotoSuggestion: courthousePhoto,
    localCivicStopSuggestion: localCivic,
    noonLunchOpportunity: lunch.ok,
    lunchSuggestion: lunch.note,
    lunchWindowLabel: lunch.ok ? "lunch_slot_available" : "no_lunch_window",
    overnightRecommended,
    overnightReason,
    localCoverageAvailable: milesFromOrigin > 85 || Boolean(overlaps.length) || tue.conflict,
    localCoverageNote:
      milesFromOrigin > 85 || overlaps.length
        ? "Distance or overlap suggests considering surrogate coverage if Kelly cannot attend."
        : tue.conflict
          ? "Tuesday rule conflict — staff may coordinate local presence or reschedule."
          : "Default path is Kelly attendance unless logistics require a surrogate.",
    staffNotes: item.notes,
  };
}

/** Lower score sorts earlier (higher priority). */
export function approvalPriorityScore(item: import("./kelly-cockpit-types").EnrichedCalendarItem, ctx: ApprovalContext): number {
  let score = 0;
  if (ctx.conflicts.length) score -= 5000;
  const h = (new Date(item.start).getTime() - Date.now()) / 3600000;
  if (h > 0 && h <= 72) score -= 3500 - Math.min(72, h) * 10;
  if (ctx.workWindowConflict) score -= 2800;
  if (ctx.tuesdayLittleRockConflict) score -= 2800;
  if (item.calendarStatus === "conflict") score -= 2000;
  if (item.overnightRequired || ctx.overnightRecommended) score -= 400;
  if (item.kellyApprovalState === "needs_kelly_review") score -= 600;
  const ck = normCountyKey(item.county);
  if (ck && FILLER_COUNTIES.has(ck)) score += 150;
  else score -= 200;
  if (item.cardBadge === "send_local" || item.hasOpenLocalCoverage) score -= 320;
  if (item.priorityTier === "Tier 1") score -= 120;
  return score;
}
