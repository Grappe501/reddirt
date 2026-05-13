import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const p = path.join(process.cwd(), "data", "calendar-command-center", "calendar-items.normalized.json");
const items = JSON.parse(readFileSync(p, "utf8"));

const add = [
  {
    id: "cockpit-2026-06-01-pulaski-dems-kelly-speaking",
    source: "manual",
    title: "Pulaski County Democrats meeting — Kelly speaking",
    start: "2026-06-02T00:00:00.000Z",
    end: "2026-06-02T02:30:00.000Z",
    allDay: false,
    county: "Pulaski",
    city: "Little Rock",
    location: "Venue TBD (Little Rock)",
    eventType: "campaign_event",
    calendarStatus: "recommended",
    publishStatus: "private_admin_only",
    countyTouchCounts: true,
    priorityTier: "Tier 2",
    overnightRequired: false,
    verificationConfidence: 0.78,
    notes:
      "Monday evening (Central) — Kelly speaking. After the program, plan travel toward Prescott (Nevada County); see linked travel + overnight rows. No auto Google write — stage in Calendar HQ when ready.",
    drillDown: {
      kellyRole: "Featured speaker",
      host: "Pulaski County Democrats",
      spreadsheetTab: "Kelly Cockpit V1",
      rowHint: "Monday night LR — not Tuesday LR rule",
    },
  },
  {
    id: "cockpit-2026-06-02-travel-lr-to-prescott",
    source: "manual",
    title: "Travel: Little Rock → Prescott (Nevada County)",
    start: "2026-06-02T03:00:00.000Z",
    end: "2026-06-02T07:00:00.000Z",
    allDay: false,
    county: "Pulaski",
    city: "Little Rock",
    location: "Road leg toward Prescott",
    eventType: "travel",
    calendarStatus: "recommended",
    publishStatus: "private_admin_only",
    countyTouchCounts: false,
    overnightRequired: true,
    overnightCity: "Prescott, AR",
    verificationConfidence: 0.65,
    notes: "Late-night / early-morning leg after Pulaski program — confirm fatigue policy and driver rotation.",
    drillDown: {
      travelRequirement: "Post-Pulaski-Dems → southwest Arkansas",
      spreadsheetTab: "Kelly Cockpit V1",
    },
  },
  {
    id: "cockpit-2026-06-02-overnight-prescott",
    source: "manual",
    title: "Overnight — Prescott (Nevada County)",
    start: "2026-06-02T07:00:00.000Z",
    end: "2026-06-02T16:00:00.000Z",
    allDay: false,
    county: "Nevada",
    city: "Prescott",
    location: "Lodging TBD — Prescott",
    eventType: "overnight",
    calendarStatus: "recommended",
    publishStatus: "private_admin_only",
    countyTouchCounts: true,
    overnightRequired: true,
    overnightCity: "Prescott, AR",
    verificationConfidence: 0.7,
    notes: "Rest / staging before Tuesday Nevada County day.",
    drillDown: {
      spreadsheetTab: "Kelly Cockpit V1",
    },
  },
  {
    id: "cockpit-2026-06-02-rotary-prescott-lunch",
    source: "manual",
    title: "Rotary — Prescott lunch program (Nevada County)",
    start: "2026-06-02T16:30:00.000Z",
    end: "2026-06-02T18:00:00.000Z",
    allDay: false,
    county: "Nevada",
    city: "Prescott",
    location: "Prescott / Nevada County (venue TBD)",
    eventType: "community_event",
    calendarStatus: "recommended",
    publishStatus: "private_admin_only",
    countyTouchCounts: true,
    priorityTier: "Tier 1",
    overnightRequired: false,
    verificationConfidence: 0.72,
    notes:
      "Tuesday daytime is normally Little Rock / work — this block is a planned exception for Nevada County swing. County clerk / courthouse-area opportunities if schedule allows. Courthouse photo stop only with safety + consent discipline.",
    drillDown: {
      kellyRole: "Speaker / guest",
      host: "Rotary (Prescott area)",
      plannedTuesdayWorkException: true,
      spreadsheetTab: "Kelly Cockpit V1",
      rowHint: "Tuesday work exception flagged — confirm with staff",
    },
  },
  {
    id: "cockpit-2026-06-02-elaine-house-party",
    source: "manual",
    title: "House party — Elaine Williams host (Prescott)",
    start: "2026-06-02T23:30:00.000Z",
    end: "2026-06-03T02:00:00.000Z",
    allDay: false,
    county: "Nevada",
    city: "Prescott",
    location: "Private residence (admin-only logistics)",
    eventType: "fundraiser",
    calendarStatus: "recommended",
    publishStatus: "private_admin_only",
    countyTouchCounts: true,
    overnightRequired: false,
    verificationConfidence: 0.7,
    notes:
      "Elaine is lining up one-on-one conversations before/around the house party. Admin-only phone for Kelly/staff tap-to-call in cockpit.",
    drillDown: {
      host: "Elaine Williams",
      adminLocalGuide: {
        displayName: "Elaine Williams",
        phone: "+18702993325",
        notes: "Local guide / host — admin only",
      },
      spreadsheetTab: "Kelly Cockpit V1",
    },
  },
  {
    id: "cockpit-2026-06-07-nea-paragould-proximity",
    source: "manual",
    title: "NEA positioning — Paragould / Greene County proximity (Sunday)",
    start: "2026-06-07T17:00:00.000Z",
    end: "2026-06-07T17:00:00.000Z",
    allDay: true,
    county: "Greene",
    city: "Paragould",
    location: "Northeast Arkansas — staff-built cluster (no fixed events yet)",
    eventType: "community_event",
    calendarStatus: "needs_verification",
    publishStatus: "private_admin_only",
    countyTouchCounts: false,
    overnightRequired: false,
    verificationConfidence: 0.45,
    notes:
      "June 8 Greene County Dems invite is Monday evening — use Sunday June 7 to position near Paragould if possible. Saturday June 6 already has a Clark County workbook anchor (Arkadelphia area) per calendar — staff must decide tradeoffs. Burt checklist: Burt fairs/festivals DB, Paragould Chamber, Discover Paragould, Jonesboro/Craighead calendars, nearby county fairs, county party meetings, civic clubs.",
    drillDown: {
      spreadsheetTab: "Kelly Cockpit V1",
      rowHint: "Competes for attention with statewide June 6 anchors — do not invent events",
    },
  },
  {
    id: "cockpit-2026-06-08-greene-county-dems-kelly-speaking-invitation",
    source: "manual",
    title: "Greene County Democrats — Kelly speaking invitation",
    start: "2026-06-09T00:00:00.000Z",
    end: "2026-06-09T02:00:00.000Z",
    allDay: false,
    county: "Greene",
    city: "Paragould",
    location: "Paragould / Greene County (venue TBD)",
    eventType: "county_party_meeting",
    calendarStatus: "recommended",
    publishStatus: "private_admin_only",
    countyTouchCounts: true,
    priorityTier: "Tier 1",
    overnightRequired: false,
    verificationConfidence: 0.55,
    notes:
      "Greene County Dems invite: 2nd Monday monthly June–Sept. Preferred: June 8, 2026 (first). Backups: July 13, Aug 10, Sept 14, 2026. Trip shape: NEA arrival Friday PM or Saturday AM; build weekend around Paragould / Jonesboro / Clay / Lawrence / Randolph / Craighead; Monday evening county meeting; drive home to Rose Bud after Monday night if safe, else overnight and return Tuesday AM if work allows. June 6–7: stay close to Paragould if possible — June 6 Clark County anchor elsewhere in state competes (see workbook). AI staff note: approve June if no conflict and weekend anchor can be found; otherwise hold for July with stronger NEA cluster. Do not invent a large Paragould festival.",
    drillDown: {
      host: "Greene County Democrats",
      kellyRole: "Invited speaker — needs scheduling confirmation",
      spreadsheetTab: "Kelly Cockpit V1",
    },
  },
];

const existing = new Set(items.map((x) => x.id));
let n = 0;
for (const row of add) {
  if (!existing.has(row.id)) {
    items.push(row);
    existing.add(row.id);
    n++;
  }
}
writeFileSync(p, JSON.stringify(items, null, 2), "utf8");
console.log("appended", n, "rows");
