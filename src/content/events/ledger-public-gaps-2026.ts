import type { EventItem, EventType } from "@/content/types";
import { getMovementRegionForCountySlug, STATEWIDE_EVENT_REGION } from "@/content/arkansas-movement-regions";

const TZ = "America/Chicago";
const DETAILS_LATER =
  "Posted from the campaign calendar so neighbors can see the stop. Venue, program, and how to join will be added when the host confirms them. All times are U.S. Central.";

type StopDraft = {
  slug: string;
  title: string;
  type: EventType;
  region?: string;
  countySlug?: string;
  countySlugs?: string[];
  startsAt: string;
  endsAt?: string;
  timeTbd?: boolean;
  locationLabel: string;
  addressLine?: string;
  city?: string;
  summary: string;
  description?: string;
  whatToExpect?: string[];
  audienceTags: string[];
  mapCoordinates?: { lat: number; lng: number };
  relatedEventSlugs: string[];
  fieldAttendance?: "confirmed" | "tentative";
  whoItsFor?: string;
  organizerNote?: string;
};

function regionFor(slug: string): string {
  return getMovementRegionForCountySlug(slug) ?? STATEWIDE_EVENT_REGION;
}

function campaignStop(draft: StopDraft): EventItem {
  const date = draft.startsAt.slice(0, 10);
  const tentative = draft.fieldAttendance === "tentative";
  const countySlug = draft.countySlug ?? draft.countySlugs?.[0];
  return {
    slug: draft.slug,
    title: draft.title,
    type: draft.type,
    region: draft.region ?? (countySlug ? regionFor(countySlug) : STATEWIDE_EVENT_REGION),
    countySlug,
    countySlugs: draft.countySlugs,
    status: "upcoming",
    startsAt: draft.startsAt,
    endsAt: draft.endsAt ?? (draft.timeTbd ? `${date}T23:59:00` : undefined),
    timezone: TZ,
    locationLabel: draft.locationLabel,
    city: draft.city,
    addressLine: draft.addressLine,
    summary: draft.summary,
    description: draft.description ?? DETAILS_LATER,
    whatToExpect: draft.whatToExpect ?? ["Stop details will be added when the host confirms venue and program."],
    whoItsFor: draft.whoItsFor ?? "Neighbors, volunteers, and anyone who wants to meet the campaign on the trail.",
    organizerNote:
      draft.organizerNote ??
      (tentative
        ? "Campaign calendar — tentative until confirmed. Public facts only."
        : "Campaign calendar — public facts only; details to be added."),
    audienceTags: draft.audienceTags,
    relatedEventSlugs: draft.relatedEventSlugs,
    relatedResourceHrefs: [
      { label: "Events calendar", href: "/events" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: draft.mapCoordinates,
    fieldAttendance: draft.fieldAttendance ?? "confirmed",
    campaignTrail: true,
    eventSource: "movement",
    opsFlags: {
      timeTbd: draft.timeTbd,
      missingCounty: !countySlug,
      missingCoordinates: !draft.mapCoordinates,
    },
  };
}

/** Public stops that were on the visit ledger but had no /events page. */
export const ledgerPublicGaps2026: EventItem[] = [
  campaignStop({
    slug: "dallas-county-fair-fordyce-2026-09-11",
    title: "Dallas County Fair — Fordyce",
    type: "Fairs and Festivals",
    countySlug: "dallas-county",
    startsAt: "2026-09-11T18:00:00",
    locationLabel: "Fordyce",
    city: "Fordyce",
    summary: "Friday, September 11, 2026, 6:00 p.m. Central at the Dallas County Fair in Fordyce.",
    description:
      "Kelly Grappe is on the campaign calendar for the Dallas County Fair in Fordyce on Friday, September 11, at 6:00 p.m. Central. Fairgrounds address and program will be posted when the host confirms them. This is a county fair stop, not a campaign rally.",
    whatToExpect: [
      "Friday, September 11, 2026, 6:00 p.m. Central",
      "Dallas County Fair — Fordyce",
      "Fairgrounds street and program to be posted",
    ],
    audienceTags: ["Fordyce", "Dallas County", "Fair"],
    mapCoordinates: { lat: 33.8153, lng: -92.4121 },
    relatedEventSlugs: ["lafayette-county-sep-2026", "sharp-county-hq-highland-2026"],
    fieldAttendance: "confirmed",
  }),
  campaignStop({
    slug: "conway-county-fair-2026-09-12",
    title: "Conway County Fair — Morrilton",
    type: "Fairs and Festivals",
    countySlug: "conway-county",
    startsAt: "2026-09-12T12:00:00",
    endsAt: "2026-09-14T23:59:00",
    timeTbd: true,
    locationLabel: "Morrilton",
    city: "Morrilton",
    summary:
      "Saturday, September 12 through Monday, September 14: Conway County Fair in Morrilton. Daily hours still to be posted.",
    description:
      "The campaign calendar holds the Conway County Fair in Morrilton from Saturday, September 12 through Monday, September 14. This is a separate listing from opening night on September 3. Daily hours and the fairgrounds street will be posted when confirmed.",
    whatToExpect: [
      "Hold: Saturday, September 12 through Monday, September 14",
      "Conway County Fair — Morrilton",
      "Distinct from Conway County Fair opening night on September 3",
    ],
    audienceTags: ["Morrilton", "Conway County", "Fair"],
    mapCoordinates: { lat: 35.1501, lng: -92.7444 },
    relatedEventSlugs: ["conway-county-fair-opening-night-2026-09-03", "cleveland-county-meet-and-greet-2026"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "harrison-hot-air-balloon-festival-2026-09-12",
    title: "Harrison Hot Air Balloon Festival",
    type: "Fairs and Festivals",
    countySlug: "boone-county",
    startsAt: "2026-09-12T12:00:00",
    timeTbd: true,
    locationLabel: "Harrison",
    city: "Harrison",
    summary: "Saturday, September 12, 2026: Harrison Hot Air Balloon Festival in Boone County. Time still to be posted.",
    description:
      "Kelly Grappe is on the campaign calendar for the Harrison Hot Air Balloon Festival on Saturday, September 12. Launch site and clock will be posted when the host confirms them. Same day the calendar also holds Cleveland County in Rison and Conway County Fair in Morrilton.",
    whatToExpect: [
      "Saturday, September 12, 2026 — clock to be posted",
      "Harrison, Boone County",
      "Festival site to be posted",
    ],
    audienceTags: ["Harrison", "Boone County", "Festival"],
    mapCoordinates: { lat: 36.2298, lng: -93.1077 },
    relatedEventSlugs: ["cleveland-county-meet-and-greet-2026", "harrison-balloon-fest-2026-09-28"],
    fieldAttendance: "confirmed",
  }),
  campaignStop({
    slug: "pope-county-fair-2026-09-15",
    title: "Pope County Fair — Russellville",
    type: "Fairs and Festivals",
    countySlug: "pope-county",
    startsAt: "2026-09-15T12:00:00",
    endsAt: "2026-09-19T23:59:00",
    timeTbd: true,
    locationLabel: "Russellville",
    city: "Russellville",
    summary:
      "Tuesday, September 15 through Saturday, September 19: Pope County Fair in Russellville. Daily hours still to be posted.",
    description:
      "The campaign calendar holds the Pope County Fair in Russellville from Tuesday, September 15 through Saturday, September 19. Same week in Russellville: Count Me In / Dreami Tea. Fairgrounds street and daily hours will be posted when confirmed.",
    whatToExpect: [
      "Hold: Tuesday, September 15 through Saturday, September 19",
      "Pope County Fair — Russellville",
      "Fairgrounds street and daily hours to be posted",
    ],
    audienceTags: ["Russellville", "Pope County", "Fair"],
    mapCoordinates: { lat: 35.2784, lng: -93.1338 },
    relatedEventSlugs: ["russellville-mary-ella-voter-registration-2026"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "howard-county-visit-2026-09-22",
    title: "Howard County visit — Nashville",
    type: "Community Conversation",
    countySlug: "howard-county",
    startsAt: "2026-09-22T12:00:00",
    timeTbd: true,
    locationLabel: "Nashville",
    city: "Nashville",
    summary: "Tuesday, September 22, 2026: Howard County visit in Nashville. Time still to be posted.",
    description:
      "The campaign calendar holds a Howard County visit in Nashville on Tuesday, September 22. This is a separate date from the September 8 Nashville 5:30 p.m. hold. Venue and clock will be posted when confirmed. Same evening the calendar also has the Garland County library forum in Hot Springs.",
    whatToExpect: [
      "Tuesday, September 22, 2026 — clock to be posted",
      "Nashville, Howard County",
      "Distinct from the September 8 Nashville hold",
    ],
    audienceTags: ["Nashville", "Howard County"],
    mapCoordinates: { lat: 33.9457, lng: -93.8471 },
    relatedEventSlugs: ["howard-county-nashville-sep-8-2026", "garland-library-county-candidates-forum-2026"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "crittenden-prairie-arkansas-swing-2026-09-23",
    title: "Crittenden, Prairie, and Arkansas County swing",
    type: "Immersion",
    countySlugs: ["crittenden-county", "prairie-county", "arkansas-county"],
    startsAt: "2026-09-23T12:00:00",
    timeTbd: true,
    locationLabel: "Crittenden, Prairie, and Arkansas Counties",
    summary:
      "Wednesday, September 23, 2026: a three-county swing through Crittenden, Prairie, and Arkansas Counties. Cities and times still to be posted.",
    description:
      "The campaign calendar holds Wednesday, September 23 as a Crittenden, Prairie, and Arkansas County swing. Individual cities, event names, and clocks will be added when they are confirmed. All three counties appear on the public calendar; this is not assigned to only one county.",
    whatToExpect: [
      "Wednesday, September 23, 2026",
      "Crittenden County, Prairie County, and Arkansas County",
      "Cities and times still to be posted",
    ],
    audienceTags: ["Crittenden County", "Prairie County", "Arkansas County"],
    relatedEventSlugs: ["stuttgart-oct-17-2026"],
    fieldAttendance: "confirmed",
  }),
  campaignStop({
    slug: "hot-springs-forum-2026-09-25",
    title: "Hot Springs Forum",
    type: "Town Hall",
    countySlug: "garland-county",
    startsAt: "2026-09-25T12:00:00",
    timeTbd: true,
    locationLabel: "Hot Springs",
    city: "Hot Springs",
    summary: "Friday, September 25, 2026: Hot Springs Forum in Garland County. Time and venue still to be posted.",
    description:
      "The campaign calendar holds a Hot Springs Forum on Friday, September 25. This is a separate listing from the Garland County Library candidate forum series (September 22, 29, and 30). Clock and building will be posted when the host confirms them.",
    whatToExpect: [
      "Friday, September 25, 2026 — clock to be posted",
      "Hot Springs, Garland County",
      "Distinct from the library candidate-forum series later the same week",
    ],
    audienceTags: ["Hot Springs", "Garland County", "Forum"],
    mapCoordinates: { lat: 34.5037, lng: -93.0552 },
    relatedEventSlugs: [
      "garland-library-county-candidates-forum-2026",
      "garland-library-state-federal-candidates-forum-2026",
    ],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "harrison-balloon-fest-2026-09-28",
    title: "Harrison Balloon Fest",
    type: "Fairs and Festivals",
    countySlug: "boone-county",
    startsAt: "2026-09-28T12:00:00",
    timeTbd: true,
    locationLabel: "Harrison",
    city: "Harrison",
    summary: "Monday, September 28, 2026: Harrison Balloon Fest in Boone County. Time still to be posted.",
    description:
      "The campaign calendar holds Harrison Balloon Fest on Monday, September 28. This is a later Boone County balloon date than the September 12 Harrison Hot Air Balloon Festival. Launch site and clock will be posted when confirmed.",
    whatToExpect: [
      "Monday, September 28, 2026 — clock to be posted",
      "Harrison, Boone County",
      "Distinct from the September 12 Harrison Hot Air Balloon Festival",
    ],
    audienceTags: ["Harrison", "Boone County", "Festival"],
    mapCoordinates: { lat: 36.2298, lng: -93.1077 },
    relatedEventSlugs: ["harrison-hot-air-balloon-festival-2026-09-12", "dppc-gigis-rally-2026"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "saline-county-gotv-2026-10-12",
    title: "Saline County GOTV push — Benton",
    type: "Community Conversation",
    countySlug: "saline-county",
    startsAt: "2026-10-12T12:00:00",
    timeTbd: true,
    locationLabel: "Benton",
    city: "Benton",
    summary: "Monday, October 12, 2026: Saline County get-out-the-vote push in Benton. Time still to be posted.",
    description:
      "The campaign calendar holds a Saline County GOTV push in Benton on Monday, October 12. Meeting spot and clock will be posted when confirmed. Same date the calendar also holds Women in Democracy in Jonesboro, the Razorback Touchdown Club, and Rison in the Fall.",
    whatToExpect: [
      "Monday, October 12, 2026 — clock to be posted",
      "Benton, Saline County",
      "Get-out-the-vote push — meeting spot to be posted",
    ],
    audienceTags: ["Benton", "Saline County", "GOTV"],
    mapCoordinates: { lat: 34.5645, lng: -92.5868 },
    relatedEventSlugs: ["women-in-democracy-jonesboro-2026", "rison-in-the-fall-2026"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "logan-scott-immersion-2026-10-18",
    title: "Logan and Scott immersion",
    type: "Immersion",
    countySlugs: ["logan-county", "scott-county"],
    startsAt: "2026-10-18T12:00:00",
    timeTbd: true,
    locationLabel: "Logan and Scott Counties",
    summary:
      "Sunday, October 18, 2026: Logan and Scott County immersion. Cities and times still to be posted.",
    description:
      "The campaign calendar holds Sunday, October 18 as a Logan and Scott County immersion. Individual cities, event names, and clocks will be added when they are confirmed. Both counties appear on the public calendar; this is not assigned to only one county.",
    whatToExpect: [
      "Sunday, October 18, 2026",
      "Logan County and Scott County",
      "Cities and times still to be posted",
    ],
    audienceTags: ["Logan County", "Scott County"],
    relatedEventSlugs: ["petit-jean-meat-festival-2026"],
    fieldAttendance: "confirmed",
  }),
  campaignStop({
    slug: "early-voting-launch-2026-10-20",
    title: "Early Voting launch — Little Rock",
    type: "Community Conversation",
    countySlug: "pulaski-county",
    startsAt: "2026-10-20T12:00:00",
    endsAt: "2026-11-03T20:00:00",
    timeTbd: true,
    locationLabel: "Little Rock",
    city: "Little Rock",
    summary:
      "Tuesday, October 20, 2026: Early Voting launch in Little Rock. The hold runs through Election Day, November 3. Daily locations still to be posted.",
    description:
      "The campaign calendar holds Tuesday, October 20 as Early Voting launch in Little Rock, with the block running through Election Day on November 3. This is a public awareness stop for neighbors who want to vote early. Specific sites and daily hours will be posted when confirmed — do not treat this card as a county clerk hours listing.",
    whatToExpect: [
      "Launch: Tuesday, October 20, 2026",
      "Hold through Election Day, November 3",
      "Little Rock, Pulaski County — sites and hours to be posted",
    ],
    audienceTags: ["Little Rock", "Pulaski County", "Early Voting"],
    mapCoordinates: { lat: 34.7465, lng: -92.2896 },
    relatedEventSlugs: ["nlr-veterans-car-show-2026"],
    fieldAttendance: "tentative",
  }),
];
