/**
 * Broader import from multiple Kelly Grappe Google Calendar screenshots (Apr 2026 – Nov 2026).
 * Idempotent (stable slugs). Publishes selected rows to /campaign-calendar; others are staff-only.
 * Migrates legacy `jacksonville-win-event-2026-05-01` → `jacksonville-win-event-2026-04-30` if present.
 *
 *   npx tsx scripts/import-kelly-calendar-2026-sweep.ts
 *
 * Does not replace: run `import-kelly-calendar-may-2026-snapshot.ts` for May 1–2 bundle if you use that
 * script in isolation; this sweep can be run after and will align Jacksonville + add the rest.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CampaignEventStatus,
  CampaignEventType,
  CampaignEventVisibility,
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
  EventWorkflowState,
} from "@prisma/client";
import { prisma } from "../src/lib/db";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

const TZ_NOTE = "America/Chicago";
const BATCH = "Kelly Grappe Google Calendar screenshots, imported 2026-04-22 batch.";
const TASK_PREFIX = "[Kelly calendar 2026 import]";

type U = {
  slug: string;
  title: string;
  startAt: Date;
  endAt: Date;
  eventType: CampaignEventType;
  countySlug: string | null;
  locationName: string | null;
  address: string | null;
  publicSummary: string | null;
  description: string | null;
  internalSummary: string | null;
  publishToWebsite: boolean;
  notes: string | null;
  skipTask?: boolean;
};

const STUB_COUNTIES: Array<{
  slug: string;
  fips: string;
  displayName: string;
  regionLabel: string;
  sortOrder: number;
}> = [
  { slug: "ashley-county", fips: "05001", displayName: "Ashley County", regionLabel: "South", sortOrder: 200 },
  { slug: "baxter-county", fips: "05005", displayName: "Baxter County", regionLabel: "North Central", sortOrder: 201 },
  { slug: "benton-county", fips: "05007", displayName: "Benton County", regionLabel: "Northwest", sortOrder: 202 },
  { slug: "carroll-county", fips: "05015", displayName: "Carroll County", regionLabel: "Northwest", sortOrder: 203 },
  { slug: "cross-county", fips: "05037", displayName: "Cross County", regionLabel: "Northeast", sortOrder: 204 },
  { slug: "desha-county", fips: "05041", displayName: "Desha County", regionLabel: "Southeast", sortOrder: 205 },
  { slug: "garland-county", fips: "05051", displayName: "Garland County", regionLabel: "Central", sortOrder: 206 },
  { slug: "marion-county", fips: "05089", displayName: "Marion County", regionLabel: "North Central", sortOrder: 207 },
  { slug: "montgomery-county", fips: "05097", displayName: "Montgomery County", regionLabel: "West Central", sortOrder: 208 },
  { slug: "pulaski-county", fips: "05119", displayName: "Pulaski County", regionLabel: "Central", sortOrder: 209 },
  { slug: "saline-county", fips: "05125", displayName: "Saline County", regionLabel: "Central", sortOrder: 210 },
  { slug: "conway-county", fips: "05029", displayName: "Conway County", regionLabel: "North Central", sortOrder: 211 },
];

const SWEEP: U[] = [
  // —— Late April (week of Apr 26) ——
  {
    slug: "neighbors-better-ark-lowell-2026-04-26",
    title: "Neighbors for a better Arkansas — Lowell",
    startAt: new Date("2026-04-26T19:00:00.000Z"),
    endAt: new Date("2026-04-26T22:00:00.000Z"),
    eventType: CampaignEventType.CANVASS,
    countySlug: "benton-county",
    locationName: "Lowell, AR (confirm staging)",
    address: "Lowell, AR",
    publicSummary: "Planted community / neighbor-outreach block — exact host and public details TBD.",
    description: "Calendar label included “(darecca)”. 2:00–5:00pm Central Apr 26, 2026.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Confirm partner org and any Meet link use (coordination vs in-person).",
  },
  {
    slug: "spend-night-nwar-2026-04-26",
    title: "Spend night in NWAR (calendar block)",
    startAt: new Date("2026-04-26T23:00:00.000Z"),
    endAt: new Date("2026-04-27T00:00:00.000Z"),
    eventType: CampaignEventType.OTHER,
    countySlug: null,
    locationName: "NWA (scope TBD)",
    address: null,
    publicSummary: null,
    description: "6:00–7:00pm — title suggests overnight logistics; 1h hold may be planning call. Clarify with Kelly.",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: "Reconcile 1h window vs “spend night” phrasing; update title when intent is clear.",
  },
  {
    slug: "wflr-hold-2026-04-28",
    title: "Wf lr (calendar hold — confirm)",
    startAt: new Date("2026-04-28T12:00:00.000Z"),
    endAt: new Date("2026-04-28T13:00:00.000Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: null,
    locationName: null,
    address: null,
    publicSummary: null,
    description: "7:00–8:00am Central. Abbreviation unclear.",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: "Decode label before any public use.",
  },
  {
    slug: "dr-lauras-funeral-2026-04-28",
    title: "Dr. Laura’s funeral",
    startAt: new Date("2026-04-28T15:00:00.000Z"),
    endAt: new Date("2026-04-28T18:00:00.000Z"),
    eventType: CampaignEventType.OTHER,
    countySlug: null,
    locationName: null,
    address: null,
    publicSummary: null,
    description: "Private memorial — 10:00am–1:00pm Central. Staff scheduling only; not a public campaign event.",
    internalSummary: `${BATCH} Do not use in voter-facing comms.`,
    publishToWebsite: false,
    notes: "Respect family privacy; mark staff OOO in ops.",
    skipTask: true,
  },
  {
    slug: "beans-cornbread-vck-2026-04-29",
    title: "Beans & cornbread — VCK",
    startAt: new Date("2026-04-29T22:00:00.000Z"),
    endAt: new Date("2026-04-30T01:00:00.000Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: "garland-county",
    locationName: "Hot Springs / VCK venue (TBD)",
    address: "Hot Springs, AR",
    publicSummary: "Village or community program — exact venue, format, and co-hosts TBD.",
    description: "5:00–8:00pm Central Apr 29, 2026. Confirm address and public listing policy with host.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "VCK = confirm local naming and whether this is a public table talk.",
  },
  // —— May (additional weeks) ——
  {
    slug: "peter-bernhardt-2026-05-11",
    title: "Peter Bernhardt",
    startAt: new Date("2026-05-11T23:00:00.000Z"),
    endAt: new Date("2026-05-12T00:00:00.000Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: null,
    locationName: null,
    address: null,
    publicSummary: null,
    description: "6:00–7:00pm Central May 11. One-on-one or small meeting — confirm public vs private.",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: "Clarify relationship to campaign comms and whether to publish.",
  },
  {
    slug: "kickin-blue-saline-2026-05-16",
    title: "Kickin Blue — Saline County",
    startAt: new Date("2026-05-16T22:00:00.000Z"),
    endAt: new Date("2026-05-17T02:00:00.000Z"),
    eventType: CampaignEventType.FESTIVAL,
    countySlug: "saline-county",
    locationName: "Saline County, AR (venue TBD)",
    address: null,
    publicSummary: "Local festival / music-style event (title from calendar) — details TBD.",
    description: "5:00–9:00pm Central May 16, 2026.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Confirm full official name, ticket policy, and appearance rules.",
  },
  {
    slug: "tabernacle-faith-wynne-2026-05-17",
    title: "Tabernacle of faith — Wynne",
    startAt: new Date("2026-05-17T20:00:00.000Z"),
    endAt: new Date("2026-05-17T23:00:00.000Z"),
    eventType: CampaignEventType.APPEARANCE,
    countySlug: "cross-county",
    locationName: "Wynne, AR (venue TBD)",
    address: "Wynne, AR",
    publicSummary: "Faith community event — format and public messaging TBD with host.",
    description: "3:00–6:00pm Central May 17, 2026.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Respectful tone; confirm with pastor/host before public posting.",
  },
  {
    slug: "follow-up-frank-guinn-2026-05-18",
    title: "Follow up with Frank Guinn",
    startAt: new Date("2026-05-18T22:00:00.000Z"),
    endAt: new Date("2026-05-18T23:00:00.000Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: null,
    locationName: null,
    address: null,
    publicSummary: null,
    description: "5:00–6:00pm Central May 18 — private follow-up; not public calendar.",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: null,
  },
  {
    slug: "arkansas-dems-virtual-2026-05-19",
    title: "Arkansas Democrats — virtual (5:00 PM block)",
    startAt: new Date("2026-05-19T22:00:00.000Z"),
    endAt: new Date("2026-05-20T00:00:00.000Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: null,
    locationName: "Virtual (link on invite)",
    address: null,
    publicSummary: null,
    description:
      "Two overlapping 5:00pm items on the calendar; consolidate into one operational row. Virtual — links from Google Calendar.",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: "Deduplicate if both invites are the same call.",
  },
  {
    slug: "campaign-prayer-time-2026-05-20",
    title: "Campaign prayer time",
    startAt: new Date("2026-05-20T12:15:00.000Z"),
    endAt: new Date("2026-05-20T12:45:00.000Z"),
    eventType: CampaignEventType.OTHER,
    countySlug: null,
    locationName: null,
    address: null,
    publicSummary: null,
    description: "7:15am Central May 20 — staff/volunteer internal unless Kelly chooses to publicize.",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: null,
  },
  {
    slug: "marion-county-field-2026-05-23",
    title: "Marion County (field / travel block)",
    startAt: new Date("2026-05-23T13:00:00.000Z"),
    endAt: new Date("2026-05-24T01:00:00.000Z"),
    eventType: CampaignEventType.CANVASS,
    countySlug: "marion-county",
    locationName: "Marion County, AR (TBD)",
    address: null,
    publicSummary: "All-day / long field block — public stops TBD; confirm with field director.",
    description: "8:00am–8:00pm Central May 23 (from event card).",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Long block may include drive time; split into public stops in Calendar HQ as needed.",
  },
  {
    slug: "desha-county-memorial-2026-05-23",
    title: "Desha County Memorial Day (event label)",
    startAt: new Date("2026-05-23T13:00:00.000Z"),
    endAt: new Date("2026-05-23T19:00:00.000Z"),
    eventType: CampaignEventType.APPEARANCE,
    countySlug: "desha-county",
    locationName: "Desha County, AR (TBD)",
    address: null,
    publicSummary: "Community Memorial Day–period event — not necessarily May 25 federal holiday. Confirm with host/chamber.",
    description: "8:00am–2:00pm Central May 23. Same day as other holds in calendar; verify physical location.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "If this overlaps another county block, confirm attendance vs conflict.",
  },
  {
    slug: "vif-hot-springs-2026-05-26",
    title: "vif — Hot Springs (calendar label)",
    startAt: new Date("2026-05-26T13:00:00.000Z"),
    endAt: new Date("2026-05-26T14:00:00.000Z"),
    eventType: CampaignEventType.OTHER,
    countySlug: "garland-county",
    locationName: "Hot Springs, AR (TBD)",
    address: null,
    publicSummary: null,
    description: "8:00–9:00am May 26 — “vif” abbrev. unclear. Internal until clarified.",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: "Decode vif; may be venue walk-through.",
  },
  {
    slug: "hot-springs-election-vck-2026-05-26",
    title: "Hot Springs — Elections conversation (VCK)",
    startAt: new Date("2026-05-26T22:00:00.000Z"),
    endAt: new Date("2026-05-27T02:00:00.000Z"),
    eventType: CampaignEventType.PRESS,
    countySlug: "garland-county",
    locationName: "Hot Springs, AR (VCK / venue TBD)",
    address: "Hot Springs, AR",
    publicSummary:
      "Proposed program title from invite notes: “Elections: Fair and Secure?” — 5:30pm arrival, program 6:00pm (confirm). Photo + short bio for graphic still needed.",
    description:
      "5:00–9:00pm block on calendar. Invite text: 5:30 with program at 6:00. Google Meet on original invite; confirm in-person vs hybrid for public page.",
    internalSummary: `${BATCH} Kelly organizer.`,
    publishToWebsite: true,
    notes: "Reconcile 5:00 block vs 5:30/6:00 start in one public-facing time range on the event record.",
  },
  {
    slug: "jones-fundraiser-danas-2026-05-28",
    title: "Jones fundraiser at Dana’s",
    startAt: new Date("2026-05-28T22:30:00.000Z"),
    endAt: new Date("2026-05-29T00:30:00.000Z"),
    eventType: CampaignEventType.FUNDRAISER,
    countySlug: null,
    locationName: "Dana’s (address TBD)",
    address: null,
    publicSummary: null,
    description: "5:30–7:30pm Central May 28 — **staff-only** unless finance approves a public line.",
    internalSummary: `${BATCH} Do not use for public calendar without compliance review.`,
    publishToWebsite: false,
    notes: "Confirm venue address and disclosure rules; Meet link for remote attendance.",
  },
  {
    slug: "wynne-farm-fest-2026-05-28",
    title: "Wynne Farm Fest (multi-day)",
    startAt: new Date("2026-05-28T05:00:00.000Z"),
    endAt: new Date("2026-05-31T04:59:59.999Z"),
    eventType: CampaignEventType.FESTIVAL,
    countySlug: "cross-county",
    locationName: "Wynne, AR",
    address: "Wynne, AR",
    publicSummary: "Cross County / Wynne area farm & music tradition — which days/times the campaign is on-site TBD.",
    description: "May 28–30, 2026 (all-day band on calendar).",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Layer booth / speaking windows under this parent event or as child tasks.",
  },
  // —— June ——
  {
    slug: "ext-homemakers-convention-2026-06-03",
    title: "Extension Homemakers — club convention (multi-day)",
    startAt: new Date("2026-06-03T05:00:00.000Z"),
    endAt: new Date("2026-06-06T04:59:59.999Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: null,
    locationName: "TBD (state or regional)",
    address: null,
    publicSummary: null,
    description: "Daily through Jun 5, 2026. Internal unless Kelly is a listed speaker (confirm).",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: "Get venue + county when available.",
  },
  {
    slug: "girls-weekend-ok-2026-06-12",
    title: "Girls weekend in OK (personal block)",
    startAt: new Date("2026-06-12T05:00:00.000Z"),
    endAt: new Date("2026-06-14T04:59:59.999Z"),
    eventType: CampaignEventType.OTHER,
    countySlug: null,
    locationName: null,
    address: null,
    publicSummary: null,
    description: "Jun 12–13; note: may drive in from NWA for a few hours. Staff scheduling, not a public event.",
    internalSummary: `${BATCH} Personal; do not publicize.`,
    publishToWebsite: false,
    notes: null,
  },
  {
    slug: "berryville-ice-cream-social-2026-06-12",
    title: "Berryville — ice cream social",
    startAt: new Date("2026-06-12T22:00:00.000Z"),
    endAt: new Date("2026-06-12T23:00:00.000Z"),
    eventType: CampaignEventType.APPEARANCE,
    countySlug: "carroll-county",
    locationName: "Berryville, AR (TBD)",
    address: "Berryville, AR",
    publicSummary: "Community drop-by — time and public location confirmed from host.",
    description: "5:00–6:00pm Central Jun 12. Same day as “girls weekend” block — check travel in calendar.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Confirm hybrid / Meet if still on invite.",
  },
  {
    slug: "arkansas-dems-virtual-2026-06-16",
    title: "Arkansas Democrats — 5:00 PM (June)",
    startAt: new Date("2026-06-16T22:00:00.000Z"),
    endAt: new Date("2026-06-16T23:00:00.000Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: null,
    locationName: "Virtual",
    address: null,
    publicSummary: null,
    description: "Screen showed two 5:00pm entries Jun 16 — merge operationally with party calendar.",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: null,
  },
  {
    slug: "montgomery-county-ar-meeting-2026-06-17",
    title: "Montgomery County — meeting (5:00 – 8:00 PM)",
    startAt: new Date("2026-06-17T22:00:00.000Z"),
    endAt: new Date("2026-06-18T01:00:00.000Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: "montgomery-county",
    locationName: "Montgomery County, AR (venue TBD)",
    address: null,
    publicSummary: "County / regional meeting — public listing after venue confirmed.",
    description: "5:00–8:00pm Central Jun 17, 2026 (from “Montgo… meeting” on calendar).",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Verify town and physical address; title truncated in snapshot.",
  },
  {
    slug: "juneteenth-morrilton-2026-06-19",
    title: "Juneteenth — Morrilton (calendar block)",
    startAt: new Date("2026-06-19T13:00:00.000Z"),
    endAt: new Date("2026-06-20T01:00:00.000Z"),
    eventType: CampaignEventType.FESTIVAL,
    countySlug: "conway-county",
    locationName: "Morrilton, AR (TBD)",
    address: "Morrilton, AR",
    publicSummary: "Juneteenth observance in Morrilton — public schedule and role TBD.",
    description: "8:00am–6:00pm Central Jun 19, 2026. Title included “c5” on calendar; clarify.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Align with local organizer and any parade/venue map.",
  },
  {
    slug: "menifee-juneteenth-2026-06-20",
    title: "Menifee — Juneteenth",
    startAt: new Date("2026-06-20T17:00:00.000Z"),
    endAt: new Date("2026-06-21T00:00:00.000Z"),
    eventType: CampaignEventType.FESTIVAL,
    countySlug: "conway-county",
    locationName: "Menifee, AR (TBD)",
    address: "Menifee, AR",
    publicSummary: "Community Juneteenth — Menifee, Conway County.",
    description: "12:00–7:00pm Central Jun 20, 2026.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Coordinate with Juneteenth Morrilton block if same-day travel applies.",
  },
  {
    slug: "sos-debate-press-eureka-2026-06-26",
    title: "SOS debate — Annual Press Convention (Eureka Springs)",
    startAt: new Date("2026-06-26T16:00:00.000Z"),
    endAt: new Date("2026-06-26T22:00:00.000Z"),
    eventType: CampaignEventType.PRESS,
    countySlug: "carroll-county",
    locationName: "Eureka Springs, AR (venue TBD)",
    address: "Eureka Springs, AR",
    publicSummary:
      "Secretary of State race / press convention week — 11:00am–5:00pm Central (from email invite; confirm vs Google).",
    description:
      "Imported from comms, not the Jun 27 week screenshot. **Reconcile** with master calendar: some views did not show Jun 26.",
    internalSummary: "Some calendar views omitted this block; keep one canonical row in CampaignOS.",
    publishToWebsite: true,
    notes: "If Google has different time/place, update this event and campaign brain.",
  },
  {
    slug: "king-kennedy-dinner-2026-06-27",
    title: "King Kennedy dinner",
    startAt: new Date("2026-06-27T21:30:00.000Z"),
    endAt: new Date("2026-06-28T02:30:00.000Z"),
    eventType: CampaignEventType.FUNDRAISER,
    countySlug: null,
    locationName: "Venue TBD (Meet on invite)",
    address: null,
    publicSummary: "Major event — public listing only after host confirms disclosure and program.",
    description: "4:30–9:30pm Central Jun 27, 2026. Guests incl. John Duke on RSVP card per screenshot.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: "Confirm whether in-person, hybrid, or both; set venue and county when known.",
  },
  // —— July ——
  {
    slug: "hillcrest-first-thursday-july-2026-07-02",
    title: "Hillcrest — first Thursday (lead-in to July 4)",
    startAt: new Date("2026-07-02T22:00:00.000Z"),
    endAt: new Date("2026-07-03T00:00:00.000Z"),
    eventType: CampaignEventType.APPEARANCE,
    countySlug: "pulaski-county",
    locationName: "Hillcrest / Little Rock (TBD)",
    address: "Little Rock, AR",
    publicSummary: "Neighborhood event — 5:00–7:00pm Central; confirm with hosts.",
    description: "Jul 2, 2026. Calendar label referenced July 4 weekend; not the federal holiday events themselves.",
    internalSummary: BATCH,
    publishToWebsite: true,
    notes: null,
  },
  // —— October / November (milestones) ——
  {
    slug: "early-voting-begins-2026-10-19",
    title: "Early voting begins (Arkansas — calendar milestone)",
    startAt: new Date("2026-10-19T05:00:00.000Z"),
    endAt: new Date("2026-10-20T04:59:59.999Z"),
    eventType: CampaignEventType.DEADLINE,
    countySlug: null,
    locationName: "Statewide (poll sites vary)",
    address: "Arkansas",
    publicSummary: "First day of early / in-person voting per typical cycle — **verify** for 2026 with SoS and county clerks before heavy promotion.",
    description: "All-day Google Calendar event with Kelly and John Duke RSVP on screenshot. Adjust if official 2026 dates differ.",
    internalSummary: `${BATCH} Milestone, not a single venue.`,
    publishToWebsite: true,
    notes: "Cross-check 2026 election administration calendar; update startAt/endAt if needed.",
  },
  {
    slug: "arkansas-dems-virtual-2026-10-20",
    title: "Arkansas Democrats — 5:00 PM (Oct)",
    startAt: new Date("2026-10-20T22:00:00.000Z"),
    endAt: new Date("2026-10-20T23:00:00.000Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: null,
    locationName: "Virtual",
    address: null,
    publicSummary: null,
    description: "Two 5:00pm entries in Oct week snapshot — same dedup note as other ADP entries.",
    internalSummary: BATCH,
    publishToWebsite: false,
    notes: null,
  },
  {
    slug: "general-election-2026-11-03",
    title: "General Election 2026 — Arkansas",
    startAt: new Date("2026-11-03T06:00:00.000Z"),
    endAt: new Date("2026-11-04T05:59:59.999Z"),
    eventType: CampaignEventType.DEADLINE,
    countySlug: null,
    locationName: "Statewide",
    address: "Arkansas",
    publicSummary: "Election Day 2026 — use as campaign milestone. Poll hours vary by site.",
    description: "All-day, Central Time. Distinguish on site from U.S. Holiday calendar duplicate.",
    internalSummary: `${BATCH} SoS and down-ballot races; verify poll hours in voter hub.`,
    publishToWebsite: true,
    notes: "If early/Election Day 2026 rules differ, update copy.",
  },
];

async function ensureStubCounties() {
  for (const s of STUB_COUNTIES) {
    await prisma.county.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        fips: s.fips,
        displayName: s.displayName,
        regionLabel: s.regionLabel,
        sortOrder: s.sortOrder,
        showOnStatewideMap: true,
        published: false,
      },
      update: { displayName: s.displayName, regionLabel: s.regionLabel },
    });
  }
}

async function countyIdFor(slug: string | null) {
  if (!slug) return null;
  const c = await prisma.county.findUnique({ where: { slug }, select: { id: true } });
  return c?.id ?? null;
}

/** Legacy row from first import: wrong date slug. */
async function migrateJacksonvilleLegacySlug() {
  const newSlug = "jacksonville-win-event-2026-04-30";
  const old = await prisma.campaignEvent.findUnique({ where: { slug: "jacksonville-win-event-2026-05-01" } });
  const nu = await prisma.campaignEvent.findUnique({ where: { slug: newSlug } });
  if (!old) return "noop";
  if (nu) {
    await prisma.campaignEvent.delete({ where: { id: old.id } });
    return "deleted-duplicate-old";
  }
  await prisma.campaignEvent.update({
    where: { id: old.id },
    data: {
      slug: newSlug,
      startAt: new Date("2026-04-30T23:00:00.000Z"),
      endAt: new Date("2026-05-01T01:00:00.000Z"),
      description:
        "Imported from calendar: Thu **Apr 30** 2026, 6–8pm Central (week-of–Apr-26 view). Migrated from legacy slug `jacksonville-win-event-2026-05-01`.",
    },
  });
  return "migrated";
}

async function ensureTask(
  eventId: string,
  title: string,
  description: string,
  dueAt: Date
): Promise<"created" | "exists"> {
  const existing = await prisma.campaignTask.findFirst({ where: { eventId, title } });
  if (existing) return "exists";
  await prisma.campaignTask.create({
    data: {
      title,
      description,
      eventId,
      status: CampaignTaskStatus.TODO,
      taskType: CampaignTaskType.ADMIN,
      priority: CampaignTaskPriority.MEDIUM,
      dueAt,
    },
  });
  return "created";
}

async function ensureSosReconcileTask(): Promise<"created" | "exists"> {
  const title = `${TASK_PREFIX} Reconcile June 26 SOS debate (Eureka) vs Google — one canonical schedule`;
  const existing = await prisma.campaignTask.findFirst({ where: { title } });
  if (existing) return "exists";
  const ev = await prisma.campaignEvent.findUnique({ where: { slug: "sos-debate-press-eureka-2026-06-26" } });
  await prisma.campaignTask.create({
    data: {
      title,
      description:
        "Some week views did not show a Jun 26 block. Confirm time (11a–5p Central in email), place (Eureka / Press Convention), and Meet/hybrid, then align Google + CampaignOS.",
      status: CampaignTaskStatus.TODO,
      taskType: CampaignTaskType.ADMIN,
      priority: CampaignTaskPriority.HIGH,
      dueAt: new Date("2026-06-20T12:00:00.000Z"),
      eventId: ev?.id ?? null,
    },
  });
  return "created";
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  await ensureStubCounties();
  const migration = await migrateJacksonvilleLegacySlug();

  const out: { slug: string; id: string; public: boolean; task: string }[] = [];
  for (const ev of SWEEP) {
    const countyId = await countyIdFor(ev.countySlug);
    if (ev.countySlug && !countyId) {
      // eslint-disable-next-line no-console
      console.warn("County not found:", ev.countySlug, ev.slug);
    }
    const published = ev.publishToWebsite;
    const row = await prisma.campaignEvent.upsert({
      where: { slug: ev.slug },
      create: {
        slug: ev.slug,
        title: ev.title,
        description: ev.description,
        eventType: ev.eventType,
        status: CampaignEventStatus.SCHEDULED,
        visibility: published ? CampaignEventVisibility.PUBLIC_STAFF : CampaignEventVisibility.INTERNAL,
        countyId: countyId ?? null,
        locationName: ev.locationName,
        address: ev.address,
        startAt: ev.startAt,
        endAt: ev.endAt,
        timezone: "America/Chicago",
        notes: ev.notes,
        eventWorkflowState: published ? EventWorkflowState.PUBLISHED : EventWorkflowState.APPROVED,
        isPublicOnWebsite: published,
        publicSummary: ev.publicSummary,
        internalSummary: ev.internalSummary,
        submittedForReviewAt: published ? new Date() : null,
        approvedAt: new Date(),
      },
      update: {
        title: ev.title,
        description: ev.description,
        eventType: ev.eventType,
        status: CampaignEventStatus.SCHEDULED,
        visibility: published ? CampaignEventVisibility.PUBLIC_STAFF : CampaignEventVisibility.INTERNAL,
        countyId: countyId ?? null,
        locationName: ev.locationName,
        address: ev.address,
        startAt: ev.startAt,
        endAt: ev.endAt,
        notes: ev.notes,
        eventWorkflowState: published ? EventWorkflowState.PUBLISHED : EventWorkflowState.APPROVED,
        isPublicOnWebsite: published,
        publicSummary: ev.publicSummary,
        internalSummary: ev.internalSummary,
      },
    });

    if (!ev.skipTask) {
      const taskTitle = `${TASK_PREFIX} Complete details: ${ev.title}`;
      const taskBody = [TZ_NOTE, ev.notes, BATCH].filter(Boolean).join(" ");
      const taskDue = new Date(row.startAt.getTime() - 3 * 24 * 60 * 60 * 1000);
      const t = await ensureTask(row.id, taskTitle, taskBody, taskDue);
      out.push({ slug: ev.slug, id: row.id, public: published, task: t });
    } else {
      out.push({ slug: ev.slug, id: row.id, public: published, task: "skipped" });
    }
  }

  const sosT = await ensureSosReconcileTask();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, migration, events: out, sosReconcileTask: sosT }, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
