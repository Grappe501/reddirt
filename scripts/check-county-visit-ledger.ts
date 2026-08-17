import { ARKANSAS_COUNTY_COUNT } from "../src/data/kelly-county-visits/arkansas-counties";
import { assertHistoricalCountyVisitSeed } from "../src/data/kelly-county-visits/historical-visited-seed";
import { kellyCampaignStops } from "../src/data/kelly-county-visits/kelly-county-visits";
import { buildCountyVisitLedger } from "../src/lib/events/county-visit-ledger";

assertHistoricalCountyVisitSeed();

const now = new Date("2026-08-13T18:00:00-05:00");
const ledger = buildCountyVisitLedger({
  now,
  historicalStops: kellyCampaignStops,
  campaignEvents: [],
  movementEvents: [],
});

if (ledger.visited.length !== 56) {
  throw new Error(`Expected 56 visited from seed, got ${ledger.visited.length}`);
}
if (ledger.visited.some((c) => c.countyName === "Clay")) {
  throw new Error("Clay must not count as visited");
}
for (const name of ["Howard", "Little River", "Madison", "Sevier", "Jefferson", "Randolph"] as const) {
  if (!ledger.visited.some((c) => c.countyName === name)) {
    throw new Error(`${name} must count as visited`);
  }
}
if (ledger.visited.length + ledger.unvisitedNames.length !== ARKANSAS_COUNTY_COUNT) {
  throw new Error("Visited + unvisited must equal 75");
}

const conflictProbe = buildCountyVisitLedger({
  now,
  historicalStops: kellyCampaignStops,
  campaignEvents: [
    {
      id: "probe-calhoun-pre-snapshot",
      startAt: new Date("2026-06-01T15:00:00Z"),
      endAt: new Date("2026-06-01T17:00:00Z"),
      eventType: "APPEARANCE",
      isTravelLeg: false,
      status: "SCHEDULED",
      countyDisplayName: "Calhoun County",
      countySlug: "calhoun-county",
      locationName: "Hampton",
      address: "Hampton, AR",
    },
  ],
  movementEvents: [],
});
if (conflictProbe.visited.some((c) => c.countyName === "Calhoun")) {
  throw new Error("Pre-snapshot event must not silently add an unvisited seed county");
}
if (!conflictProbe.disagreements.some((d) => d.severity === "conflict" && d.countyName === "Calhoun")) {
  throw new Error("Expected an internal conflict for pre-snapshot Calhoun claim");
}

const rollover = buildCountyVisitLedger({
  now: new Date("2026-08-16T18:00:00-05:00"),
  historicalStops: kellyCampaignStops,
  campaignEvents: [],
  movementEvents: [
    {
      slug: "pocahontas-breakfast-meet-greet-2026-08-15",
      title: "Breakfast",
      type: "Community Conversation",
      region: "Northeast Arkansas",
      countySlug: "randolph-county",
      status: "past",
      startsAt: "2026-08-15T09:00:00",
      endsAt: "2026-08-15T11:00:00",
      timezone: "America/Chicago",
      locationLabel: "Pocahontas",
      summary: "Meet",
      description: "Meet",
      whatToExpect: [],
      whoItsFor: "Neighbors",
      organizerNote: "Trail",
      relatedEventSlugs: [],
      relatedResourceHrefs: [],
      campaignTrail: true,
      fieldAttendance: "confirmed",
    },
  ],
});
if (!rollover.visited.some((c) => c.countyName === "Randolph")) {
  throw new Error("Ended in-person appearance after the snapshot must add Randolph");
}

console.log(
  JSON.stringify({
    ok: true,
    visited: ledger.visited.length,
    unvisited: ledger.unvisitedNames.length,
    conflictsOnProbe: conflictProbe.disagreements.filter((d) => d.severity === "conflict").length,
    randolphAfterPocahontas: true,
  }),
);
