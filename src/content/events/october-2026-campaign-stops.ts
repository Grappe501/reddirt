import type { EventItem, EventType } from "@/content/types";
import { getMovementRegionForCountySlug, STATEWIDE_EVENT_REGION } from "@/content/arkansas-movement-regions";

const TZ = "America/Chicago";
const DETAILS_LATER =
  "Posted from the October 2026 campaign timeline. Venue, program, and how to join will be added when the host confirms them. All times are U.S. Central.";

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
  relatedResourceHrefs?: Array<{ label: string; href: string }>;
  primaryHref?: string;
  primaryCtaLabel?: string;
  fieldAttendance?: "confirmed" | "tentative";
  whoItsFor?: string;
  organizerNote?: string;
  attendanceType?: EventItem["attendanceType"];
  statewideVirtual?: boolean;
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
    city: draft.city ?? draft.locationLabel,
    addressLine: draft.addressLine,
    summary: draft.summary,
    description: draft.description ?? DETAILS_LATER,
    whatToExpect: draft.whatToExpect ?? ["Stop details will be added when the host confirms venue and program."],
    whoItsFor: draft.whoItsFor ?? "Neighbors, volunteers, and anyone who wants to meet the campaign on the trail.",
    organizerNote:
      draft.organizerNote ??
      (tentative
        ? "October 2026 campaign timeline — tentative until confirmed."
        : "October 2026 campaign timeline — public facts only; details to be added."),
    attendanceType: draft.attendanceType,
    audienceTags: draft.audienceTags,
    relatedEventSlugs: draft.relatedEventSlugs,
    relatedResourceHrefs: draft.relatedResourceHrefs ?? [
      { label: "Events calendar", href: "/events" },
      { label: "Get involved", href: "/get-involved" },
    ],
    primaryHref: draft.primaryHref,
    primaryCtaLabel: draft.primaryCtaLabel,
    mapCoordinates: draft.mapCoordinates,
    fieldAttendance: draft.fieldAttendance ?? "confirmed",
    campaignTrail: true,
    statewideVirtual: draft.statewideVirtual,
    eventSource: "movement",
    opsFlags: {
      timeTbd: draft.timeTbd,
      missingCounty: draft.statewideVirtual ? false : !countySlug,
      missingCoordinates: draft.statewideVirtual ? false : !draft.mapCoordinates,
    },
  };
}

/**
 * Public October 2026 campaign timeline.
 * Personal days and campaign blocks stay internal-only.
 * Arkansas TV debates for the week of Oct 12–16 are public; exact day still TBA.
 * Arkansas Rice Festival / Weiner is removed and must not be re-added.
 */
export const october2026CampaignStops: EventItem[] = [
  campaignStop({
    slug: "perry-county-goat-festival-2026-10-03",
    title: "Goat Festival",
    type: "Fairs and Festivals",
    countySlug: "perry-county",
    startsAt: "2026-10-03T08:00:00",
    timeTbd: true,
    locationLabel: "Perryville area",
    city: "Perryville area",
    summary: "Saturday morning Goat Festival in the Perryville area. Exact start time to be posted.",
    audienceTags: ["Perry County", "Perryville", "Festival"],
    mapCoordinates: { lat: 35.0048, lng: -92.8027 },
    relatedEventSlugs: ["van-buren-moonshine-music-festival-2026-10-03"],
  }),
  campaignStop({
    slug: "van-buren-moonshine-music-festival-2026-10-03",
    title: "Moonshine + Music Festival",
    type: "Fairs and Festivals",
    countySlug: "van-buren-county",
    startsAt: "2026-10-03T13:00:00",
    locationLabel: "Van Buren County",
    city: "Van Buren County",
    summary: "Saturday 1:00 p.m. Central Moonshine + Music Festival in Van Buren County.",
    audienceTags: ["Van Buren County", "Festival"],
    mapCoordinates: { lat: 35.5915, lng: -92.4593 },
    relatedEventSlugs: ["perry-county-goat-festival-2026-10-03", "mountain-home-immersion-2026-10-04"],
  }),
  campaignStop({
    slug: "mountain-home-immersion-2026-10-04",
    title: "Mountain Home Immersion",
    type: "Immersion",
    countySlug: "baxter-county",
    startsAt: "2026-10-04T12:00:00",
    timeTbd: true,
    locationLabel: "Mountain Home",
    city: "Mountain Home",
    summary: "Sunday Mountain Home immersion in Baxter County. Schedule to be posted.",
    audienceTags: ["Mountain Home", "Baxter County"],
    mapCoordinates: { lat: 36.3353, lng: -92.3852 },
    relatedEventSlugs: ["van-buren-moonshine-music-festival-2026-10-03", "mountain-home-farm-bureau-forum-2026-10-06"],
  }),
  campaignStop({
    slug: "mountain-home-farm-bureau-forum-2026-10-06",
    title: "Farm Bureau Candidate Forum",
    type: "Town Hall",
    countySlug: "baxter-county",
    startsAt: "2026-10-06T18:00:00",
    locationLabel: "Mountain Home",
    city: "Mountain Home",
    summary: "Tuesday 6:00 p.m. Central Farm Bureau candidate forum in Mountain Home.",
    audienceTags: ["Mountain Home", "Baxter County", "Candidate Forum"],
    mapCoordinates: { lat: 36.3353, lng: -92.3852 },
    relatedEventSlugs: ["mountain-home-immersion-2026-10-04", "bella-vista-meet-2026-10-08"],
  }),
  campaignStop({
    slug: "bella-vista-meet-2026-10-08",
    title: "Bella Vista Meet",
    type: "Community Conversation",
    countySlug: "benton-county",
    startsAt: "2026-10-08T12:00:00",
    timeTbd: true,
    locationLabel: "Bella Vista",
    city: "Bella Vista",
    summary: "Thursday Bella Vista meet. Time still to be posted.",
    audienceTags: ["Bella Vista", "Benton County", "Northwest Arkansas"],
    mapCoordinates: { lat: 36.4295, lng: -94.2316 },
    relatedEventSlugs: ["mountain-home-farm-bureau-forum-2026-10-06", "king-biscuit-blues-festival-2026-10-09"],
  }),
  campaignStop({
    slug: "king-biscuit-blues-festival-2026-10-09",
    title: "King Biscuit Blues Festival",
    type: "Fairs and Festivals",
    countySlug: "phillips-county",
    startsAt: "2026-10-09T12:00:00",
    timeTbd: true,
    locationLabel: "Helena-West Helena",
    city: "Helena-West Helena",
    summary: "Friday King Biscuit Blues Festival in Helena-West Helena. Time to be posted.",
    audienceTags: ["Helena-West Helena", "Phillips County", "Festival"],
    mapCoordinates: { lat: 34.5293, lng: -90.5901 },
    relatedEventSlugs: ["bella-vista-meet-2026-10-08", "yellville-turkey-trot-2026-10-10"],
  }),
  campaignStop({
    slug: "yellville-turkey-trot-2026-10-10",
    title: "Turkey Trot",
    type: "Fairs and Festivals",
    countySlug: "marion-county",
    startsAt: "2026-10-10T12:00:00",
    timeTbd: true,
    locationLabel: "Yellville",
    city: "Yellville",
    summary: "Saturday Turkey Trot in Yellville. Time to be posted.",
    audienceTags: ["Yellville", "Marion County", "Festival"],
    mapCoordinates: { lat: 36.2262, lng: -92.6849 },
    relatedEventSlugs: ["king-biscuit-blues-festival-2026-10-09", "hot-springs-chili-cookoff-2026-10-11"],
  }),
  campaignStop({
    slug: "hot-springs-chili-cookoff-2026-10-11",
    title: "Hot Springs Chili Cookoff",
    type: "Fairs and Festivals",
    countySlug: "garland-county",
    startsAt: "2026-10-11T14:00:00",
    endsAt: "2026-10-11T17:00:00",
    locationLabel: "Hot Springs",
    city: "Hot Springs",
    summary: "Sunday 2:00–5:00 p.m. Central chili cookoff in Hot Springs.",
    audienceTags: ["Hot Springs", "Garland County", "Festival"],
    mapCoordinates: { lat: 34.5037, lng: -93.0552 },
    relatedEventSlugs: ["yellville-turkey-trot-2026-10-10", "ayc-karaoke-hot-springs-2026-10-11"],
  }),
  campaignStop({
    slug: "ayc-karaoke-hot-springs-2026-10-11",
    title: "AYC Karaoke Event",
    type: "Youth Civic Session",
    countySlug: "garland-county",
    startsAt: "2026-10-11T18:00:00",
    timeTbd: true,
    locationLabel: "Hot Springs",
    city: "Hot Springs",
    summary: "Sunday AYC karaoke event in Hot Springs. Time to be posted.",
    audienceTags: ["Hot Springs", "Garland County", "Youth", "College"],
    mapCoordinates: { lat: 34.5037, lng: -93.0552 },
    primaryHref: "/get-involved#volunteer",
    primaryCtaLabel: "Volunteer / Get involved",
    relatedEventSlugs: ["hot-springs-chili-cookoff-2026-10-11", "arkansas-tv-debates-2026-10-12"],
    relatedResourceHrefs: [
      { label: "Volunteer", href: "/get-involved#volunteer" },
      { label: "Events calendar", href: "/events" },
    ],
  }),
  campaignStop({
    slug: "arkansas-tv-debates-2026-10-12",
    title: "Election 2026: The Debates — Arkansas TV",
    type: "Town Hall",
    region: STATEWIDE_EVENT_REGION,
    startsAt: "2026-10-12T12:00:00",
    endsAt: "2026-10-16T23:59:00",
    timeTbd: true,
    locationLabel: "Arkansas TV",
    city: "Conway",
    summary:
      "Week of Monday, October 12 through Friday, October 16. Arkansas TV is hosting debates for constitutional and congressional candidates. Exact day, time, and how to watch will be posted when the invitation arrives.",
    description:
      "Arkansas TV is preparing Election 2026: The Debates for candidates running for Arkansas constitutional and congressional offices, the week of October 12 through October 16, 2026. Kelly Grappe, candidate for Arkansas Secretary of State, is holding that week on the campaign calendar. The exact debate day, call time, and how neighbors can watch will be posted here when Arkansas TV sends the invitation.",
    whatToExpect: [
      "Week of October 12–16, 2026. Exact day and time to be posted.",
      "Hosted by Arkansas TV for constitutional and congressional candidates.",
      "How to watch — broadcast, stream, or studio audience — will be posted when the invitation arrives.",
    ],
    whoItsFor: "Anyone in Arkansas who wants to hear the Secretary of State candidates on Arkansas TV.",
    organizerNote:
      "Posted from Arkansas TV producer correspondence. Producer phone, email, and the campaign PO Box stay off the public page. Exact debate day still TBA.",
    attendanceType: "CAMPAIGN_APPEARANCE",
    statewideVirtual: true,
    audienceTags: ["Arkansas TV", "Debate", "Statewide"],
    relatedEventSlugs: ["ayc-karaoke-hot-springs-2026-10-11", "bella-vista-meet-2026-10-15"],
    relatedResourceHrefs: [
      { label: "Arkansas TV", href: "https://www.arkansastv.gov/" },
      { label: "Events calendar", href: "/events" },
    ],
  }),
  campaignStop({
    slug: "bella-vista-meet-2026-10-15",
    title: "Bella Vista Meet",
    type: "Community Conversation",
    countySlug: "benton-county",
    startsAt: "2026-10-15T12:00:00",
    timeTbd: true,
    locationLabel: "Bella Vista",
    city: "Bella Vista",
    summary: "Thursday Bella Vista meet — a separate Benton County stop from October 8. Time still to be posted.",
    audienceTags: ["Bella Vista", "Benton County", "Northwest Arkansas"],
    mapCoordinates: { lat: 36.4295, lng: -94.2316 },
    relatedEventSlugs: ["arkansas-tv-debates-2026-10-12", "stuttgart-event-2026-10-17"],
  }),
  campaignStop({
    slug: "stuttgart-event-2026-10-17",
    title: "Stuttgart Event",
    type: "Community Conversation",
    countySlug: "arkansas-county",
    startsAt: "2026-10-17T10:00:00",
    endsAt: "2026-10-17T13:00:00",
    locationLabel: "Stuttgart",
    city: "Stuttgart",
    summary: "Saturday 10:00 a.m.–1:00 p.m. Central event in Stuttgart.",
    audienceTags: ["Stuttgart", "Arkansas County"],
    mapCoordinates: { lat: 34.5004, lng: -91.5526 },
    relatedEventSlugs: ["bella-vista-meet-2026-10-15", "flat-rock-fish-fry-2026-10-17"],
  }),
  campaignStop({
    slug: "flat-rock-fish-fry-2026-10-17",
    title: "Flat Rock Fire Department Fish Fry",
    type: "Community Conversation",
    countySlug: "johnson-county",
    startsAt: "2026-10-17T17:15:00",
    locationLabel: "Lamar",
    city: "Lamar",
    addressLine: "Flat Rock Fire Department, Lamar, AR",
    summary: "Saturday 5:15 p.m. Central Flat Rock Fire Department fish fry in Lamar, Johnson County.",
    audienceTags: ["Lamar", "Johnson County", "Flat Rock"],
    mapCoordinates: { lat: 35.4406, lng: -93.388 },
    relatedEventSlugs: ["stuttgart-event-2026-10-17", "greers-ferry-event-2026-10-23"],
  }),
  campaignStop({
    slug: "greers-ferry-event-2026-10-23",
    title: "Greers Ferry Event",
    type: "Community Conversation",
    countySlug: "cleburne-county",
    startsAt: "2026-10-23T12:00:00",
    timeTbd: true,
    locationLabel: "Greers Ferry",
    city: "Greers Ferry",
    summary: "Tentative Friday event in Greers Ferry. Time to be posted if confirmed.",
    audienceTags: ["Greers Ferry", "Cleburne County"],
    mapCoordinates: { lat: 35.5767, lng: -92.1771 },
    relatedEventSlugs: ["flat-rock-fish-fry-2026-10-17", "mountain-view-outhouse-races-2026-10-24"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "mountain-view-outhouse-races-2026-10-24",
    title: "Mountain View Outhouse Races",
    type: "Fairs and Festivals",
    countySlug: "stone-county",
    startsAt: "2026-10-24T12:00:00",
    timeTbd: true,
    locationLabel: "Mountain View",
    city: "Mountain View",
    summary: "Tentative Saturday Outhouse Races in Mountain View. Time to be posted if confirmed.",
    audienceTags: ["Mountain View", "Stone County", "Festival"],
    mapCoordinates: { lat: 35.8684, lng: -92.1176 },
    relatedEventSlugs: ["greers-ferry-event-2026-10-23", "ponca-color-fest-2026-10-25"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "ponca-color-fest-2026-10-25",
    title: "Ponca Color Fest",
    type: "Fairs and Festivals",
    countySlug: "newton-county",
    startsAt: "2026-10-25T12:00:00",
    timeTbd: true,
    locationLabel: "Ponca",
    city: "Ponca",
    summary: "Sunday Ponca Color Fest in Newton County. Time to be posted.",
    description:
      "Public listing for Ponca Color Fest. Monday continues as a Madison and Newton County mountain trip while the leaves change — see the related county-day listing.",
    whatToExpect: [
      "Ponca Color Fest in Newton County",
      "Monday continues as a Madison / Newton County Day on the same mountain trip",
      "Event times to be posted with host confirmation",
    ],
    audienceTags: ["Ponca", "Newton County", "Festival"],
    mapCoordinates: { lat: 36.0223, lng: -93.3613 },
    relatedEventSlugs: ["mountain-view-outhouse-races-2026-10-24", "madison-newton-county-day-2026-10-26"],
  }),
  campaignStop({
    slug: "madison-newton-county-day-2026-10-26",
    title: "Madison / Newton County Day",
    type: "Community Conversation",
    countySlugs: ["madison-county", "newton-county"],
    startsAt: "2026-10-26T12:00:00",
    timeTbd: true,
    locationLabel: "Madison and Newton Counties",
    city: "Madison and Newton Counties",
    summary:
      "Monday continuation of the Ponca Color Fest mountain trip, covering Madison and Newton Counties while the leaves change. Cities and times still to be posted.",
    description:
      "This is the second day of the Ponca Color Fest trip — a two-county mountain day in Madison and Newton Counties. Event names, cities, and times will be added when they are confirmed. Both counties appear on the public calendar and map; this is not assigned to only one county.",
    whatToExpect: [
      "Part of the Ponca Color Fest mountain trip",
      "Madison County and Newton County both listed",
      "Cities, event names, and times still to be posted",
    ],
    audienceTags: ["Madison County", "Newton County"],
    relatedEventSlugs: ["ponca-color-fest-2026-10-25"],
  }),
];
