import { events, getEventBySlug } from "../src/content/events";
import { august2026CampaignStops } from "../src/content/events/august-2026-campaign-stops";
import { september2026CampaignStops } from "../src/content/events/september-2026-campaign-stops";
import { october2026CampaignStops } from "../src/content/events/october-2026-campaign-stops";
import {
  ARKANSAS_YOUTH_COALITION_HREF,
  FAITH_REFLECTION_FACEBOOK_HREF,
  recurringVirtualSeries,
} from "../src/content/events/recurring-virtual-series";
import { collapseRecurringSeriesToNextOccurrence } from "../src/lib/events/collapse-recurring-series";
import { eventCountySlugs } from "../src/lib/events/county-key";
import { publicCountyEyebrow } from "../src/lib/events/public-event-county";
import type { EventItem } from "../src/content/types";
import { ARKANSAS_COUNTY_COUNT } from "../src/data/kelly-county-visits/arkansas-counties";
import { ARKANSAS_COUNTY_SVG_PATHS } from "../src/data/kelly-county-visits/arkansas-county-svg-paths";
import { kellyCampaignStops } from "../src/data/kelly-county-visits/kelly-county-visits";
import {
  buildCountyCampaignSummaries,
  countyMapHref,
  type CountyCampaignSummary,
} from "../src/lib/events/county-campaign-summary";
import {
  arkansasCountyKey,
  countyNameFromKey,
  normalizeArkansasCountyKey,
} from "../src/lib/events/county-key";
import { buildCountyVisitLedger } from "../src/lib/events/county-visit-ledger";
import { parseEventInstant } from "../src/lib/format/eventDisplay";

function fail(message: string): never {
  throw new Error(message);
}

function summaryByName(rows: CountyCampaignSummary[], name: string): CountyCampaignSummary {
  return rows.find((r) => r.countyName === name) ?? fail(`Missing summary for ${name}`);
}

function baseEvent(partial: Partial<EventItem> & Pick<EventItem, "slug" | "title" | "startsAt">): EventItem {
  return {
    type: "Community Conversation",
    region: "Central Arkansas",
    status: "upcoming",
    timezone: "America/Chicago",
    locationLabel: "Test",
    summary: "Test",
    description: "Test",
    whatToExpect: [],
    whoItsFor: "Neighbors",
    organizerNote: "Test",
    relatedEventSlugs: [],
    relatedResourceHrefs: [],
    campaignTrail: true,
    fieldAttendance: "confirmed",
    ...partial,
  };
}

function build(now: Date, movementEvents: EventItem[], campaignEvents: Parameters<typeof buildCountyVisitLedger>[0]["campaignEvents"] = []) {
  const ledger = buildCountyVisitLedger({
    now,
    historicalStops: kellyCampaignStops,
    campaignEvents,
    movementEvents,
  });
  const summaries = buildCountyCampaignSummaries({ ledger, events: movementEvents, now });
  return { ledger, summaries };
}

const SNAPSHOT = new Date("2026-08-13T18:00:00-05:00");

if (ARKANSAS_COUNTY_SVG_PATHS.length !== 75) {
  fail(`SVG path count ${ARKANSAS_COUNTY_SVG_PATHS.length} !== 75`);
}
if (new Set(ARKANSAS_COUNTY_SVG_PATHS.map((p) => p.key)).size !== 75) {
  fail("SVG keys are not unique");
}

if (normalizeArkansasCountyKey("St. Francis") !== "st-francis") fail("St. Francis alias");
if (normalizeArkansasCountyKey("Saint Francis") !== "st-francis") fail("Saint Francis alias");
if (normalizeArkansasCountyKey("st-francis-county") !== "st-francis") fail("st-francis-county alias");
if (normalizeArkansasCountyKey("Hot Spring") !== "hot-spring") fail("Hot Spring key");
if (normalizeArkansasCountyKey("Hot Springs") !== null) fail("Hot Springs must not map to Hot Spring County");
if (countyNameFromKey("little-river") !== "Little River") fail("little-river name");
if (arkansasCountyKey("Van Buren") !== "van-buren") fail("van-buren key");

{
  const { summaries, ledger } = build(SNAPSHOT, []);
  const arkansas = summaryByName(summaries, "Arkansas");
  if (arkansas.publicState !== "visited") fail("Historical Arkansas should be visited");
  if (arkansas.upcomingIndicator !== null) fail("Arkansas should have no upcoming indicator in empty-event build");
  if (ledger.visited.length !== 51) fail(`Expected 51 visited, got ${ledger.visited.length}`);
}

{
  const { summaries } = build(SNAPSHOT, [
    baseEvent({
      slug: "randolph-first",
      title: "Breakfast",
      countySlug: "randolph-county",
      startsAt: "2026-08-15T09:00:00",
      endsAt: "2026-08-15T11:00:00",
    }),
  ]);
  const randolph = summaryByName(summaries, "Randolph");
  if (randolph.visited) fail("Randolph should still be unvisited before the event ends");
  if (randolph.publicState !== "confirmed_upcoming") fail("Unvisited confirmed upcoming");
}

{
  const { summaries } = build(SNAPSHOT, [
    baseEvent({
      slug: "calhoun-fair",
      title: "Calhoun County Fair",
      countySlug: "calhoun-county",
      startsAt: "2026-09-18T12:00:00",
      fieldAttendance: "tentative",
      opsFlags: { timeTbd: true },
    }),
  ]);
  const calhoun = summaryByName(summaries, "Calhoun");
  if (calhoun.publicState !== "tentative_upcoming") fail("Unvisited tentative");
  if (calhoun.visited) fail("Tentative must not mark visited");
}

{
  const { summaries } = build(SNAPSHOT, [
    baseEvent({
      slug: "pulaski-festiville",
      title: "FestiVille",
      countySlug: "pulaski-county",
      startsAt: "2026-09-05T11:00:00",
      endsAt: "2026-09-05T15:00:00",
    }),
  ]);
  const pulaski = summaryByName(summaries, "Pulaski");
  if (pulaski.publicState !== "visited") fail("Visited county must keep visited fill");
  if (pulaski.upcomingIndicator !== "confirmed") fail("Visited + upcoming should keep gold indicator");
}

{
  const before = build(new Date("2026-09-12T13:59:00-05:00"), [
    baseEvent({
      slug: "cleveland-county-candidate-forum",
      title: "Candidate Forum",
      countySlug: "cleveland-county",
      startsAt: "2026-09-12T12:00:00",
      endsAt: "2026-09-12T14:00:00",
    }),
  ]);
  if (summaryByName(before.summaries, "Calhoun").publicState === "visited") fail("unrelated");
  const clevelandBefore = summaryByName(before.summaries, "Cleveland");
  if (!clevelandBefore.visited) fail("Cleveland is historically visited");
  if (clevelandBefore.upcomingIndicator !== "confirmed") fail("Cleveland still upcoming at 1:59 PM Central");

  const after = build(new Date("2026-09-12T14:00:01-05:00"), [
    baseEvent({
      slug: "new-county-forum",
      title: "Forum",
      countySlug: "randolph-county",
      startsAt: "2026-09-12T12:00:00",
      endsAt: "2026-09-12T14:00:00",
    }),
  ]);
  const randolphAfter = summaryByName(after.summaries, "Randolph");
  if (randolphAfter.publicState !== "visited") fail("Completed rollover should mark Randolph visited");
  if (randolphAfter.upcomingIndicator !== null) fail("Upcoming indicator should clear after end");
}

{
  const first = build(new Date("2026-09-12T14:00:01-05:00"), [
    baseEvent({
      slug: "randolph-one",
      title: "One",
      countySlug: "randolph-county",
      startsAt: "2026-09-12T12:00:00",
      endsAt: "2026-09-12T14:00:00",
    }),
  ]);
  const statewideFirst = first.ledger.visited.length;
  const visitCountFirst = summaryByName(first.summaries, "Randolph").visitCount;
  const second = build(new Date("2026-09-20T18:00:00-05:00"), [
    baseEvent({
      slug: "randolph-one",
      title: "One",
      countySlug: "randolph-county",
      startsAt: "2026-09-12T12:00:00",
      endsAt: "2026-09-12T14:00:00",
    }),
    baseEvent({
      slug: "randolph-two",
      title: "Two",
      countySlug: "randolph-county",
      startsAt: "2026-09-19T12:00:00",
      endsAt: "2026-09-19T14:00:00",
    }),
  ]);
  if (summaryByName(second.summaries, "Randolph").visitCount !== visitCountFirst + 1) {
    fail("Repeat visit should increment visitCount");
  }
  if (second.ledger.visited.length !== statewideFirst) {
    fail("Repeat visit must not increase statewide visited total");
  }
}

{
  const { summaries } = build(SNAPSHOT, [], [
    {
      id: "cancelled-newton",
      startAt: new Date("2026-09-01T15:00:00Z"),
      endAt: new Date("2026-09-01T17:00:00Z"),
      eventType: "APPEARANCE",
      isTravelLeg: false,
      status: "CANCELLED",
      countyDisplayName: "Newton County",
      countySlug: "newton-county",
      locationName: "Jasper",
      address: "Jasper, AR",
    },
  ]);
  if (summaryByName(summaries, "Newton").publicState !== "neutral") fail("Cancelled event stays neutral");
}

{
  const { summaries } = build(SNAPSHOT, [], [
    {
      id: "travel-chicot",
      startAt: new Date("2026-08-20T15:00:00Z"),
      endAt: new Date("2026-08-20T17:00:00Z"),
      eventType: "OTHER",
      isTravelLeg: true,
      status: "SCHEDULED",
      countyDisplayName: "Chicot County",
      countySlug: "chicot-county",
      locationName: "Drive",
      address: "US-65",
    },
  ]);
  if (summaryByName(summaries, "Chicot").publicState !== "neutral") fail("Travel-only stays neutral");
}

{
  const { ledger } = build(new Date("2026-09-10T12:00:00-05:00"), [
    baseEvent({
      slug: "prayer-zoom",
      title: "Campaign Prayer Zoom Call",
      startsAt: "2026-09-09T19:15:00",
      endsAt: "2026-09-09T20:00:00",
      statewideVirtual: true,
      locationLabel: "Statewide / Virtual",
      addressLine: "Zoom",
    }),
    baseEvent({
      slug: "jefferson-zoom",
      title: "Zoom appearance",
      countySlug: "jefferson-county",
      startsAt: "2026-09-09T19:15:00",
      endsAt: "2026-09-09T20:00:00",
      locationLabel: "Zoom",
      addressLine: "zoom.us",
    }),
  ]);
  if (ledger.visited.some((c) => c.countyName === "Jefferson")) fail("Virtual Zoom must not become visited");
  if (ledger.visited.length !== 51) fail("Virtual statewide call must not change 51/75");
}

{
  const end = parseEventInstant("2026-09-12T14:00:00", "America/Chicago");
  const before = new Date("2026-09-12T18:59:00.000Z");
  const after = new Date("2026-09-12T19:00:01.000Z");
  if (!(before.getTime() < end.getTime())) fail("1:59 PM CDT should be before 2:00 PM CDT end");
  if (!(after.getTime() > end.getTime())) fail("2:00:01 PM CDT should be after event end");
}

{
  const { summaries } = build(SNAPSHOT, [...august2026CampaignStops, ...september2026CampaignStops]);
  const cleveland = summaryByName(summaries, "Cleveland");
  if (countyMapHref(cleveland) !== "/events/cleveland-county-candidate-forum") {
    fail(`Cleveland single-event href, got ${countyMapHref(cleveland)}`);
  }
  const pulaski = summaryByName(summaries, "Pulaski");
  if (countyMapHref(pulaski) !== "/events/county/pulaski") {
    fail(`Pulaski multi-event href, got ${countyMapHref(pulaski)}`);
  }
  const arkansas = summaryByName(summaries, "Arkansas");
  if (countyMapHref(arkansas) !== null) fail("Visited-only Arkansas should have no click href");

  const virtual = recurringVirtualSeries;
  if (!virtual.some((e) => e.slug === "faith-and-reflection-zoom-2026-09-09")) {
    fail("Faith & Reflection Sep 9 missing");
  }
  if (virtual.filter((e) => e.recurringSeriesId === "faith-reflection-zoom").length !== 11) {
    fail("Faith series should recur weekly through Election Day (11 Wednesdays from Aug 19 through Oct 28)");
  }
  if (virtual.filter((e) => e.recurringSeriesId === "college-young-people-zoom").length !== 12) {
    fail("College/youth series should recur weekly through Election Day (12 Thursdays from Aug 13 through Oct 29)");
  }
  if (virtual.some((e) => e.qualifiesAsVisit !== false || !e.statewideVirtual)) {
    fail("Recurring virtual series must never qualify as a county visit");
  }
  const faith = virtual.find((e) => e.slug.startsWith("faith-and-reflection-zoom-"))!;
  if (!faith.startsAt.endsWith("T19:15:00")) fail("Faith Zoom stays 7:15 PM Central");
  if (faith.rsvpHref !== FAITH_REFLECTION_FACEBOOK_HREF) fail("Faith series must use the specific Facebook event link");
  if (/facebook\.com\/events/i.test(faith.rsvpHref ?? "")) fail("Do not use generic Facebook Online Events discovery URL");
  const youth = virtual.find((e) => e.slug.startsWith("college-young-people-zoom-"))!;
  if (youth.rsvpHref !== ARKANSAS_YOUTH_COALITION_HREF || youth.linkCardToPrimary !== true) {
    fail("College Zoom must link to Arkansas Youth Coalition");
  }
  if (!youth.audienceTags?.includes("youth_college")) fail("College Zoom needs audience youth_college");
  if (!youth.opsFlags?.timeTbd) fail("College Zoom clock time is still TBA until Steve confirms it");
  if (summaries.some((s) => s.confirmedUpcomingEvents.some((e) => e.slug.includes("zoom")))) {
    fail("Virtual Zoom series must not paint counties");
  }
  const { summaries: withVirtual, ledger: virtualLedger } = build(SNAPSHOT, [
    ...august2026CampaignStops,
    ...september2026CampaignStops,
    ...virtual,
  ]);
  if (virtualLedger.visited.length !== 51) fail("Recurring virtual series must not change 51/75");
  if (withVirtual.some((s) => s.confirmedUpcomingEvents.some((e) => e.slug.includes("zoom")))) {
    fail("Recurring virtual series must not paint the county map");
  }
  const collapsed = collapseRecurringSeriesToNextOccurrence(
    virtual.filter((e) => e.status === "upcoming" || true).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  );
  const collapsedSeries = collapsed.filter((e) => e.recurringSeriesId);
  if (collapsedSeries.length !== 2) fail(`Expected 2 collapsed virtual series cards, got ${collapsedSeries.length}`);
  if (getEventBySlug("campaign-prayer-zoom-2026-09-09")?.title !== "Faith & Reflection Zoom") {
    fail("Old prayer Zoom slugs must alias to Faith & Reflection Zoom");
  }

  if (summaryByName(summaries, "Calhoun").publicState !== "tentative_upcoming") fail("Calhoun tentative");
  if (summaryByName(summaries, "Randolph").publicState !== "confirmed_upcoming") fail("Randolph confirmed upcoming");
  if (summaryByName(summaries, "Pulaski").upcomingIndicator !== "confirmed") fail("Pulaski gold ring");
  if (summaryByName(summaries, "Howard").publicState !== "neutral") fail("Howard remains scheduled-only / neutral");
  if (summaryByName(summaries, "Chicot").publicState !== "neutral") fail("Chicot remaining unvisited");
}

if (!events.some((e) => e.slug === "cleveland-county-candidate-forum")) fail("Cleveland slug missing from events catalog");
if (!events.some((e) => e.slug === "clark-county-multi-church-tour-2026-09-20")) fail("Clark tour missing");
if (events.some((e) => /paragould/i.test(e.slug) && e.startsAt.startsWith("2026-09-22"))) {
  fail("Paragould forum must not appear on September 22");
}

{
  const { summaries, ledger } = build(SNAPSHOT, [
    ...august2026CampaignStops,
    ...september2026CampaignStops,
    ...october2026CampaignStops,
  ]);
  if (ledger.visited.length !== 51) fail("October public stops must not change 51/75 before they end");
  if (summaryByName(summaries, "Perry").publicState !== "confirmed_upcoming") fail("Perry Goat Festival confirmed upcoming");
  if (summaryByName(summaries, "Phillips").publicState !== "confirmed_upcoming") fail("Phillips King Biscuit confirmed upcoming");
  if (summaryByName(summaries, "Madison").publicState !== "confirmed_upcoming") fail("Madison Oct 26 confirmed upcoming");
  if (!summaryByName(summaries, "Johnson").confirmedUpcomingEvents.some((e) => e.slug === "flat-rock-fish-fry-2026-10-17")) {
    fail("Flat Rock fish fry must map to Johnson County");
  }
  const cleburne = summaryByName(summaries, "Cleburne");
  if (!cleburne.visited || !cleburne.tentativeUpcomingEvents.some((e) => e.slug === "greers-ferry-event-2026-10-23")) {
    fail("Greers Ferry must be tentative on Cleburne");
  }
  const poinsett = summaryByName(summaries, "Poinsett");
  if (poinsett.confirmedUpcomingEvents.length || poinsett.tentativeUpcomingEvents.length) {
    fail("Poinsett must not show Rice Festival / Weiner as upcoming");
  }
  if (events.some((e) => /rice.?festival|\bweiner\b/i.test(`${e.slug} ${e.title}`))) {
    fail("Arkansas Rice Festival / Weiner must not be in the public catalog");
  }
  if (events.some((e) => /debate week|campaign block/i.test(e.title))) {
    fail("Internal October blocks must not be published");
  }
  if (!events.some((e) => e.slug === "bella-vista-meet-2026-10-08") || !events.some((e) => e.slug === "bella-vista-meet-2026-10-15")) {
    fail("Bella Vista Oct 8 and Oct 15 are separate confirmed stops");
  }
  const twoCounty = events.find((e) => e.slug === "madison-newton-county-day-2026-10-26");
  if (!twoCounty) fail("Madison / Newton County Day missing");
  if (publicCountyEyebrow(twoCounty) !== "MADISON COUNTY · NEWTON COUNTY") {
    fail(`Oct 26 must show both counties, got ${publicCountyEyebrow(twoCounty)}`);
  }
  if (eventCountySlugs(twoCounty).length !== 2) fail("Oct 26 must list Madison and Newton");
  if (!summaryByName(summaries, "Madison").confirmedUpcomingEvents.some((e) => e.slug === "madison-newton-county-day-2026-10-26")) {
    fail("Madison map must include Oct 26");
  }
  if (!summaryByName(summaries, "Newton").confirmedUpcomingEvents.some((e) => e.slug === "madison-newton-county-day-2026-10-26")) {
    fail("Newton map must include Oct 26");
  }
  const arkansasOct = summaryByName(summaries, "Arkansas");
  if (!arkansasOct.visited || !arkansasOct.confirmedUpcomingEvents.some((e) => e.slug === "stuttgart-event-2026-10-17")) {
    fail("Arkansas County stays visited and gains Stuttgart Oct 17 as confirmed upcoming");
  }
}

console.log("county-campaign-map checks passed");
console.log(`SVG counties: ${ARKANSAS_COUNTY_SVG_PATHS.length}/${ARKANSAS_COUNTY_COUNT}`);
console.log("Operator review (as of 2026-08-13, America/Chicago) — http://localhost:3000/events");
console.log("  visited-only: Arkansas County (blue, no click) until Stuttgart Oct 17");
console.log("  visited + confirmed upcoming: Pulaski County (blue fill, gold outline → /events/county/pulaski)");
console.log("  unvisited confirmed upcoming: Randolph County (gold fill → Pocahontas Aug 15); Perry, Phillips, Madison from October");
console.log("  tentative: Calhoun County (sky fill, dashed outline → fair Sep 18); Greers Ferry Oct 23 on Cleburne");
console.log("  neutral: Chicot County (gray, no click)");
console.log("  statewide / virtual: Faith & Reflection Zoom (Wed 7:15 PM) + College & Young People Zoom (Thu, time TBA) — calendar only, never 51/75");
console.log("  October: no Rice Festival / Weiner; Flat Rock = Johnson County; Bella Vista Oct 8 and Oct 15 both public");
