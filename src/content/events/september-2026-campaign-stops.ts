import type { EventItem, EventType } from "@/content/types";
import {
  GRASSROOTS_GUITAR_STRINGS_TICKET_URL,
  getGrassrootsGuitarStringsSiteUrl,
} from "@/config/external-campaign";

const TZ = "America/Chicago";
const DETAILS_LATER =
  "Posted from the September 2026 campaign timeline. Venue, program, and how to join will be added when the host confirms them. All times are U.S. Central.";

type StopDraft = {
  slug: string;
  title: string;
  type: EventType;
  region: string;
  countySlug?: string;
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
  fieldAttendance?: "confirmed" | "tentative" | "unscheduled";
  statewideVirtual?: boolean;
  missingCounty?: boolean;
  whoItsFor?: string;
  organizerNote?: string;
  attendanceType?: EventItem["attendanceType"];
  mapPinQuality?: EventItem["mapPinQuality"];
  flyerSrc?: string;
  flyerAlt?: string;
  companionSiteHref?: string;
  companionSiteLabel?: string;
  primaryHref?: string;
  primaryCtaLabel?: string;
  featured?: boolean;
  featuredLabel?: string;
  featuredSummary?: string;
};

function campaignStop(draft: StopDraft): EventItem {
  const date = draft.startsAt.slice(0, 10);
  const tentative = draft.fieldAttendance === "tentative";
  return {
    slug: draft.slug,
    title: draft.title,
    type: draft.type,
    region: draft.region,
    countySlug: draft.countySlug,
    status: "upcoming",
    startsAt: draft.startsAt,
    endsAt: draft.endsAt ?? (draft.timeTbd ? `${date}T23:59:00` : undefined),
    timezone: TZ,
    locationLabel: draft.locationLabel,
    city: draft.city ?? (draft.statewideVirtual ? undefined : draft.locationLabel),
    addressLine: draft.addressLine,
    summary: draft.summary,
    description: draft.description ?? DETAILS_LATER,
    whatToExpect: draft.whatToExpect ?? ["Stop details will be added when the host confirms venue and program."],
    whoItsFor: draft.whoItsFor ?? "Neighbors, volunteers, and anyone who wants to meet the campaign on the trail.",
    organizerNote:
      draft.organizerNote ??
      (tentative
        ? "September 2026 campaign timeline — tentative until confirmed."
        : "September 2026 campaign timeline — public facts only; details to be added."),
    attendanceType: draft.attendanceType ?? (draft.statewideVirtual ? "PUBLIC_OPEN" : undefined),
    audienceTags: draft.audienceTags,
    relatedEventSlugs: draft.relatedEventSlugs,
    relatedResourceHrefs: [
      { label: "Events calendar", href: "/events" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: draft.mapCoordinates,
    mapPinQuality: draft.mapPinQuality,
    flyerSrc: draft.flyerSrc,
    flyerAlt: draft.flyerAlt,
    companionSiteHref: draft.companionSiteHref,
    companionSiteLabel: draft.companionSiteLabel,
    primaryHref: draft.primaryHref,
    primaryCtaLabel: draft.primaryCtaLabel,
    featured: draft.featured,
    featuredLabel: draft.featuredLabel,
    featuredSummary: draft.featuredSummary,
    fieldAttendance: draft.fieldAttendance ?? "confirmed",
    campaignTrail: true,
    statewideVirtual: draft.statewideVirtual,
    eventSource: "movement",
    opsFlags: {
      timeTbd: draft.timeTbd,
      missingCounty: draft.statewideVirtual ? false : draft.missingCounty || !draft.countySlug,
      missingCoordinates: draft.statewideVirtual ? false : !draft.mapCoordinates,
    },
  };
}

/** Public September 2026 campaign timeline. Virtual series live in `recurring-virtual-series.ts`. */
export const september2026CampaignStops: EventItem[] = [
  campaignStop({
    slug: "madison-county-meeting-2026-09-03",
    title: "Madison County Meeting",
    type: "Community Conversation",
    region: "Northwest Arkansas",
    countySlug: "madison-county",
    startsAt: "2026-09-03T12:00:00",
    timeTbd: true,
    locationLabel: "Madison County (venue TBA)",
    summary: "Confirmed Madison County meeting. Time and venue to be posted.",
    description:
      "Thursday, September 3, 2026. Madison County meeting. Time and venue will be posted here when the host confirms them. All times are U.S. Central.",
    whatToExpect: [
      "Thursday, September 3. Time to be posted.",
      "Madison County, Northwest Arkansas. Venue to be posted.",
    ],
    audienceTags: ["Madison County", "Northwest Arkansas"],
    mapCoordinates: { lat: 36.0106, lng: -93.7232 },
    relatedEventSlugs: ["conway-county-fair-opening-night-2026-09-03"],
  }),
  campaignStop({
    slug: "conway-county-fair-opening-night-2026-09-03",
    title: "Conway County Fair Opening Night",
    type: "Fairs and Festivals",
    region: "Central Arkansas",
    countySlug: "conway-county",
    startsAt: "2026-09-03T18:00:00",
    endsAt: "2026-09-03T20:00:00",
    locationLabel: "Conway County Fair, Morrilton",
    city: "Morrilton",
    summary: "Thursday, September 3, 6:00–8:00 p.m. Central. Conway County Fair opening night in Morrilton.",
    description:
      "Thursday, September 3, 2026, 6:00–8:00 p.m. Central. Conway County Fair opening night in Morrilton. Fairgrounds details will be posted here when confirmed.",
    whatToExpect: [
      "Thursday, September 3, 6:00–8:00 p.m. Central.",
      "Conway County Fair, Morrilton.",
    ],
    audienceTags: ["Conway County", "Morrilton", "Festival"],
    mapCoordinates: { lat: 35.2648, lng: -92.6843 },
    relatedEventSlugs: ["madison-county-meeting-2026-09-03", "ashley-county-fair-2026-09-04"],
  }),
  campaignStop({
    slug: "ashley-county-fair-2026-09-04",
    title: "Ashley County Fair",
    type: "Fairs and Festivals",
    region: "Southeast Arkansas",
    countySlug: "ashley-county",
    startsAt: "2026-09-04T12:00:00",
    timeTbd: true,
    locationLabel: "Ashley County Fair",
    summary: "Tentative Ashley County Fair stop. Time and fairgrounds details to be posted if confirmed.",
    audienceTags: ["Ashley County", "Festival"],
    mapCoordinates: { lat: 33.2076, lng: -91.9312 },
    relatedEventSlugs: ["conway-county-fair-opening-night-2026-09-03", "festiville-jacksonville-2026-09-05"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "festiville-jacksonville-2026-09-05",
    title: "FestiVille",
    type: "Fairs and Festivals",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    startsAt: "2026-09-05T11:00:00",
    endsAt: "2026-09-05T15:00:00",
    locationLabel: "Jacksonville",
    city: "Jacksonville",
    summary: "Saturday 11:00 a.m. Central at FestiVille in Jacksonville.",
    audienceTags: ["Jacksonville", "Pulaski County", "Festival"],
    mapCoordinates: { lat: 34.8662, lng: -92.1101 },
    relatedEventSlugs: ["rector-labor-day-2026-09-06", "hispanic-heritage-festival-conway-2026-09-05"],
  }),
  campaignStop({
    slug: "hispanic-heritage-festival-conway-2026-09-05",
    title: "Festival de la Herencia Hispana — Conway",
    type: "Fairs and Festivals",
    region: "Central Arkansas",
    countySlug: "faulkner-county",
    startsAt: "2026-09-05T16:00:00",
    endsAt: "2026-09-05T21:00:00",
    locationLabel: "Laurel Park",
    city: "Conway",
    addressLine: "2310 Robinson Avenue, Conway, AR",
    summary:
      "Saturday, September 5, 4:00–9:00 p.m. Central at Laurel Park. Paloma Community Services Hispanic Heritage Festival. Faulkner County Democrats will be there. Kelly’s attendance is tentative.",
    description:
      "Paloma Community Services hosts Festival de la Herencia Hispana 2026 on Saturday, September 5, 2026, from 4:00 to 9:00 p.m. Central at Laurel Park, 2310 Robinson Avenue, Conway. The flyer lists vendors, food, live music, art, children’s activities, and folkloric dance. Faulkner County Democrats plan to be there. Booth details are still being confirmed. Kelly Grappe’s attendance is tentative. The same Saturday already has FestiVille in Jacksonville in the afternoon.",
    whatToExpect: [
      "Saturday, September 5, 4:00–9:00 p.m. Central.",
      "Laurel Park, 2310 Robinson Avenue, Conway.",
      "Vendors, food, live music, art, children’s activities, and folkloric dance.",
      "Faulkner County Democrats plan to attend. Booths to be confirmed.",
      "Kelly’s attendance is tentative.",
    ],
    whoItsFor: "Neighbors in Conway and Faulkner County, and anyone coming for Hispanic Heritage Festival.",
    organizerNote:
      "Flagged by Faulkner County Democrats. Tentative for Kelly. Same afternoon as FestiVille in Jacksonville. Host contact stays off the public page.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Conway", "Faulkner County", "Festival", "Hispanic Heritage"],
    mapCoordinates: { lat: 35.0708, lng: -92.4542 },
    mapPinQuality: "exact",
    relatedEventSlugs: ["festiville-jacksonville-2026-09-05", "rector-labor-day-2026-09-06"],
    fieldAttendance: "tentative",
    flyerSrc: "/media/event-flyers/hispanic-heritage-festival-conway-2026-09-05.png",
    flyerAlt: "Festival de la Herencia Hispana 2026 flyer for Saturday, September 5 at Laurel Park in Conway.",
  }),
  campaignStop({
    slug: "rector-labor-day-2026-09-06",
    title: "86th Rector Picnic and Parade",
    type: "Fairs and Festivals",
    region: "Northeast Arkansas",
    countySlug: "clay-county",
    startsAt: "2026-09-06T12:00:00",
    timeTbd: true,
    locationLabel: "Rector",
    city: "Rector",
    summary:
      "Labor Day weekend in Rector. The Rector Chamber of Commerce is sending a formal invitation for the 86th picnic and parade. Program times and the parade route will be posted here when that invitation arrives.",
    description:
      "The Rector Chamber of Commerce is preparing invitations for the 86th Rector Picnic and Parade over Labor Day weekend. Kelly Grappe, candidate for Arkansas Secretary of State, is on the list for a formal invitation with the full program. Parade time, picnic hours, and the gathering spot will be posted on this page when the Chamber’s invitation arrives.",
    whatToExpect: [
      "Labor Day weekend in Rector, Clay County.",
      "86th Rector Picnic and Parade, hosted with the Rector Chamber of Commerce.",
      "Parade time, picnic hours, and the gathering spot will be posted when the formal invitation arrives.",
    ],
    whoItsFor: "Neighbors in Rector, Clay County, and anyone coming home for the picnic and parade.",
    organizerNote:
      "Posted from Rector Chamber invitation request. Host phone and mailing follow-up stay off the public page.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Clay County", "Rector", "Northeast Arkansas", "Festival", "Parade"],
    mapCoordinates: { lat: 36.2631, lng: -90.2923 },
    relatedEventSlugs: ["festiville-jacksonville-2026-09-05", "roosevelt-dinner-2026-09-10"],
  }),
  campaignStop({
    slug: "roosevelt-dinner-2026-09-10",
    title: "Johnson County Roosevelt Dinner",
    type: "Community Conversation",
    region: "North Central Arkansas",
    countySlug: "johnson-county",
    startsAt: "2026-09-10T17:30:00",
    locationLabel: "University of the Ozarks",
    city: "Clarksville",
    addressLine: "University of the Ozarks, Clarksville, AR (building TBA)",
    summary:
      "Thursday. Doors 5:30 p.m. Central for cocktail hour, candidate mingling, and a silent auction. Dinner at 6:30 p.m. at the University of the Ozarks in Clarksville. Kelly will speak.",
    description:
      "Thursday, September 10, 2026, at the University of the Ozarks in Clarksville. Doors open at 5:30 p.m. Central for cocktail hour, candidate mingling, and opening bids on silent auction items. Dinner begins at 6:30 p.m. Kelly Grappe, candidate for Arkansas Secretary of State, will speak. The host’s focus this year is showing up and voting. Exact building on campus will be posted here when it is confirmed.",
    whatToExpect: [
      "Doors 5:30 p.m. Central on Thursday, September 10 — cocktail hour, candidate mingling, and silent auction.",
      "Dinner begins at 6:30 p.m. Central.",
      "University of the Ozarks, Clarksville — building to be posted.",
      "Kelly Grappe will speak (about 15 minutes).",
    ],
    whoItsFor: "Neighbors in Johnson County, Clarksville, and anyone coming to the Roosevelt Dinner.",
    organizerNote:
      "Posted from the Johnson County Roosevelt Dinner speaker email. Host contact and the speaker-video request stay off the public page. Campus building still TBA.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Clarksville", "Johnson County", "Roosevelt Dinner", "University of the Ozarks"],
    mapCoordinates: { lat: 35.4742, lng: -93.4668 },
    mapPinQuality: "region",
    relatedEventSlugs: [
      "johnson-county-peach-festival-2026-07-18",
      "rector-labor-day-2026-09-06",
      "lafayette-county-softball-2026-09-11",
    ],
  }),
  campaignStop({
    slug: "lafayette-county-softball-2026-09-11",
    title: "Fire Department vs. Police Department Softball Game",
    type: "Community Conversation",
    region: "Southwest Arkansas",
    countySlug: "lafayette-county",
    startsAt: "2026-09-11T18:00:00",
    endsAt: "2026-09-11T21:00:00",
    locationLabel: "Lafayette County",
    city: "Lafayette County",
    summary: "Friday 6:00 p.m. Central Fire Department vs. Police Department softball game in Lafayette County.",
    audienceTags: ["Lafayette County", "Southwest Arkansas"],
    mapCoordinates: { lat: 33.2412, lng: -93.6068 },
    relatedEventSlugs: ["cleveland-county-candidate-forum-2026-09-12"],
  }),
  campaignStop({
    slug: "cleveland-county-candidate-forum",
    title: "Candidate Forum",
    type: "Town Hall",
    region: "Southeast Arkansas",
    countySlug: "cleveland-county",
    startsAt: "2026-09-12T12:00:00",
    endsAt: "2026-09-12T14:00:00",
    locationLabel: "Cleveland County",
    city: "Cleveland County",
    summary: "Saturday noon Central candidate forum in Cleveland County.",
    audienceTags: ["Cleveland County", "Candidate Forum"],
    mapCoordinates: { lat: 33.8973, lng: -92.1851 },
    relatedEventSlugs: ["river-valley-candidate-rally-fort-smith-2026-09-13"],
  }),
  campaignStop({
    slug: "river-valley-candidate-rally-fort-smith-2026-09-13",
    title: "River Valley Candidate Rally",
    type: "Town Hall",
    region: "West Central Arkansas",
    countySlug: "sebastian-county",
    startsAt: "2026-09-13T12:00:00",
    endsAt: "2026-09-13T14:00:00",
    locationLabel: "Fort Smith",
    city: "Fort Smith",
    summary: "Sunday noon Central River Valley Candidate Rally in Fort Smith.",
    audienceTags: ["Fort Smith", "Sebastian County", "Rally"],
    mapCoordinates: { lat: 35.3859, lng: -94.3985 },
    relatedEventSlugs: ["baxter-county-candidate-forum-2026-09-14"],
  }),
  campaignStop({
    slug: "baxter-county-candidate-forum-2026-09-14",
    title: "Candidate Forum",
    type: "Town Hall",
    region: "North Central Arkansas",
    countySlug: "baxter-county",
    startsAt: "2026-09-14T18:00:00",
    endsAt: "2026-09-14T20:00:00",
    locationLabel: "Mountain Home",
    city: "Mountain Home",
    summary: "Monday 6:00 p.m. Central candidate forum in Mountain Home.",
    audienceTags: ["Mountain Home", "Baxter County", "Candidate Forum"],
    mapCoordinates: { lat: 36.3353, lng: -92.3851 },
    relatedEventSlugs: ["pope-county-registration-event-2026-09-15", "faulkner-dems-hq-opening-2026-09-14"],
    fieldAttendance: "unscheduled",
    organizerNote: "Off the public /events list 2026-09-04. Kelly not attending.",
  }),
  campaignStop({
    slug: "faulkner-dems-hq-opening-2026-09-14",
    title: "Faulkner County Democratic Headquarters Grand Opening",
    type: "Town Hall",
    region: "Central Arkansas",
    countySlug: "faulkner-county",
    startsAt: "2026-09-14T18:00:00",
    timeTbd: true,
    locationLabel: "Faulkner County Democratic Headquarters",
    city: "Conway",
    addressLine: "1151 Markham, Conway, AR",
    summary:
      "Monday, September 14 — evening grand opening of Faulkner County Democratic Party headquarters and candidate town hall in Conway. Hot dogs, chips, and drinks; all candidates invited. Exact time TBA. Kelly’s attendance is tentative (same-day forum in Mountain Home at 6:00 p.m.).",
    description:
      "Faulkner County Democratic Party opens its headquarters at 1151 Markham in Conway on Monday, September 14, 2026 — the party’s regular meeting night, with colleges back in session. Chair Teresa Huff Conway plans an evening grand opening and town hall under tents: hot dogs, chips, and drinks for everyone, with candidates invited to speak. The HQ is within walking distance of Hendrix College. Exact start time has not been posted. Kelly Grappe’s attendance is tentative because a candidate forum in Mountain Home (Baxter County) is also scheduled for 6:00 p.m. Central that evening.",
    whatToExpect: [
      "Monday, September 14, 2026 — evening in Conway (exact time TBA).",
      "1151 Markham — Faulkner County Democratic Party headquarters, outdoor tents.",
      "Grand opening, candidate town hall, hot dogs, chips, and drinks.",
      "All candidates invited; regular county meeting night.",
      "Walking distance from Hendrix College.",
      "Kelly’s attendance is tentative — same-day candidate forum in Mountain Home at 6:00 p.m.",
    ],
    whoItsFor: "Faulkner County Democrats, Conway neighbors, college communities, and invited candidates.",
    organizerNote:
      "Flagged by Faulkner County chair Teresa Huff Conway (Aug 2026). Tentative for Kelly — conflicts with Baxter County candidate forum, Mountain Home, 6:00 p.m. same day. Host contact stays off the public page.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Conway", "Faulkner County", "Democratic Party", "Town Hall", "Hendrix", "UCA"],
    mapCoordinates: { lat: 35.0886, lng: -92.4421 },
    mapPinQuality: "exact",
    relatedEventSlugs: ["baxter-county-candidate-forum-2026-09-14", "pope-county-registration-event-2026-09-15", "true-holiness-college-day-2026-08-23"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "pope-county-registration-event-2026-09-15",
    title: "Registration Event",
    type: "Direct Democracy Briefing",
    region: "North Central Arkansas",
    countySlug: "pope-county",
    startsAt: "2026-09-15T15:00:00",
    endsAt: "2026-09-15T19:00:00",
    locationLabel: "Russellville",
    city: "Russellville",
    summary: "Tuesday 3:00–7:00 p.m. Central registration event in Russellville.",
    audienceTags: ["Russellville", "Pope County", "Voter registration"],
    mapCoordinates: { lat: 35.2784, lng: -93.1338 },
    relatedEventSlugs: ["hsv-candidate-forum-2026-09-16", "faith-and-reflection-zoom-2026-09-16"],
  }),
  campaignStop({
    slug: "hsv-candidate-forum-2026-09-16",
    title: "Candidate Meet & Greet — Hot Springs Village",
    type: "Town Hall",
    region: "Central Arkansas",
    startsAt: "2026-09-16T14:00:00",
    endsAt: "2026-09-16T17:00:00",
    locationLabel: "Coronado Community Center",
    city: "Hot Springs Village",
    addressLine: "150 Ponderosa Lane, Hot Springs Village, AR 71909",
    summary:
      "Wednesday, September 16, 2:00–5:00 p.m. Central at Coronado Community Center in Hot Springs Village. Table-style candidate meet-and-greet hosted by the Village POA Governmental Affairs Committee.",
    description:
      "Wednesday, September 16, 2026, 2:00–5:00 p.m. Central at the Coronado Community Center, 150 Ponderosa Lane, Hot Springs Village. The Hot Springs Village Property Owners Association Governmental Affairs Committee is hosting a general-election candidate meet-and-greet. Each candidate has a designated table so neighbors can walk up, ask questions, and pick up information. Kelly Grappe, candidate for Arkansas Secretary of State, has this stop on the campaign calendar. Hot Springs Village sits in Garland and Saline counties; this listing does not pin one county until that is confirmed.",
    whatToExpect: [
      "Wednesday, September 16, 2:00–5:00 p.m. Central.",
      "Coronado Community Center, 150 Ponderosa Lane, Hot Springs Village.",
      "Table-style meet-and-greet hosted by the Village POA Governmental Affairs Committee.",
      "Open to neighbors who want to meet general-election candidates.",
    ],
    whoItsFor: "Hot Springs Village neighbors and anyone who wants to meet the Secretary of State candidates on September 16.",
    organizerNote:
      "POA invitation dated April 27, 2026 names Coronado Community Center. Host RSVP contact stays off the public page. HSV Democratic Club officers are in election-plan /county-parties/hsv-dems. Do not pin Garland vs Saline until Steve confirms. Same-day Faith & Reflection Zoom is 7:30 a.m. and is not a conflict. Table reservation is still required.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Hot Springs Village", "Candidate Forum", "Garland County", "Saline County"],
    mapCoordinates: { lat: 34.6494, lng: -92.98118 },
    mapPinQuality: "exact",
    relatedEventSlugs: ["faith-and-reflection-zoom-2026-09-16", "grassroots-guitar-strings-sherwood-2026-09-17"],
    missingCounty: true,
  }),
  campaignStop({
    slug: "grassroots-guitar-strings-sherwood-2026-09-17",
    title: "Grassroots & Guitar Strings",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    startsAt: "2026-09-17T17:30:00",
    timeTbd: false,
    locationLabel: "Sherwood Forest",
    city: "Sherwood",
    summary:
      "A Sherwood homecoming with David Adam Byrnes — live music, a hometown meal, and a celebration of democracy. Kelly kicks off the final six weeks of her campaign.",
    description:
      "Grassroots & Guitar Strings is Kelly Grappe's Sherwood homecoming and campaign election rally — Constitution Day, September 17, 2026. David Adam Byrnes returns for live country music; Kelly's brother and friends prepare a shared meal. This is a celebration to bring neighbors together, register voters, and launch the final six-week tour — not a night of partisan argument.",
    whatToExpect: [
      "Thursday, September 17, 2026 — 5:30 p.m. Central at Sherwood Forest, Sherwood.",
      "Live country music with David Adam Byrnes (Arkansas roots — farm festivals, Rose Bud, and years of friendship with Kelly and Steve).",
      "Hometown meal, voter-registration support, and a celebration-of-democracy program.",
      "Tickets and table hosting via GoodChange — individual contributions only.",
    ],
    whoItsFor:
      "Neighbors, families, and anyone who wants an Arkansas homecoming night with music and fellowship — all political persuasions welcome at the table.",
    organizerNote:
      "Companion event website at grassrootsguitarstrings.com (or NEXT_PUBLIC_GRASSROOTS_EVENT_SITE_URL). Venue address and run-of-show details TBD. David's tour lists Sherwood Forest 5:30 p.m. Confirm with host before hard-locking times.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Sherwood", "Pulaski County", "Homecoming", "David Adam Byrnes"],
    mapCoordinates: { lat: 34.8151, lng: -92.2243 },
    relatedEventSlugs: ["calhoun-county-fair-2026-09-18"],
    companionSiteHref: getGrassrootsGuitarStringsSiteUrl(),
    companionSiteLabel: "Visit the event website",
    primaryHref: GRASSROOTS_GUITAR_STRINGS_TICKET_URL,
    primaryCtaLabel: "Get tickets",
    featured: true,
    featuredLabel: "Homecoming celebration",
    featuredSummary:
      "Full event site with music, Kelly & David's story, tickets, and table hosting — explore before you arrive.",
  }),
  campaignStop({
    slug: "calhoun-county-fair-2026-09-18",
    title: "Calhoun County Fair",
    type: "Fairs and Festivals",
    region: "Southwest Arkansas",
    countySlug: "calhoun-county",
    startsAt: "2026-09-18T12:00:00",
    timeTbd: true,
    locationLabel: "Calhoun County Fair",
    city: "Hampton",
    summary: "Tentative Calhoun County Fair. Time and fairgrounds details to be posted if confirmed.",
    audienceTags: ["Calhoun County", "Festival"],
    mapCoordinates: { lat: 33.5379, lng: -92.4696 },
    relatedEventSlugs: ["little-rock-comic-con-2026-09-19", "hot-spring-county-cookout-2026-09-19"],
    fieldAttendance: "unscheduled",
    organizerNote: "Off the public /events list 2026-09-04. Kelly not attending.",
  }),
  campaignStop({
    slug: "little-rock-comic-con-2026-09-19",
    title: "Little Rock Comic Con",
    type: "Fairs and Festivals",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    startsAt: "2026-09-19T09:00:00",
    endsAt: "2026-09-19T14:00:00",
    locationLabel: "Little Rock",
    city: "Little Rock",
    summary: "Saturday morning–2:00 p.m. Central at Little Rock Comic Con. Kelly heads to Malvern afterward for the 5:00 p.m. Hot Spring County cookout.",
    audienceTags: ["Little Rock", "Pulaski County", "Festival"],
    mapCoordinates: { lat: 34.7465, lng: -92.2896 },
    relatedEventSlugs: ["hot-spring-county-cookout-2026-09-19"],
  }),
  campaignStop({
    slug: "hot-spring-county-cookout-2026-09-19",
    title: "Community Cookout — Hot Spring County Democrats",
    type: "Community Conversation",
    region: "West Central Arkansas",
    countySlug: "hot-spring-county",
    startsAt: "2026-09-19T17:00:00",
    endsAt: "2026-09-19T19:00:00",
    locationLabel: "Hot Spring County 4-H Center",
    city: "Malvern",
    addressLine: "1407 US-270, Malvern, AR 72104",
    summary:
      "Saturday, September 19, 5:00–7:00 p.m. Central. Community cookout at the Hot Spring County 4-H Center in Malvern. Kelly will be there after Little Rock Comic Con that afternoon.",
    description:
      "The Hot Spring County Democratic Party is hosting a community cookout on Saturday, September 19, 2026, from 5:00 to 7:00 p.m. Central at the Hot Spring County 4-H Center, 1407 US-270, Malvern. Neighbors will hear from local county and city candidates, with guest appearances expected from candidates for State Representative, Secretary of State, and U.S. Congress. Kelly Grappe, candidate for Arkansas Secretary of State, is booked for this stop. Admission is free. The host suggests a $5 donation per plate to support county party candidates and programs. Kelly will be at Little Rock Comic Con earlier the same day and heads to Malvern for the evening.",
    whatToExpect: [
      "Saturday, September 19, 5:00–7:00 p.m. Central.",
      "Hot Spring County 4-H Center, 1407 US-270, Malvern.",
      "Food, neighbors, and remarks from local candidates. Kelly Grappe is scheduled to appear.",
      "Free admission. The host suggests a $5 donation per plate.",
    ],
    whoItsFor: "Neighbors in Malvern and Hot Spring County, and anyone coming after Little Rock Comic Con that afternoon.",
    organizerNote:
      "Booked with the host on July 30, 2026. Flyer posted August 12. Host contact stays off the public page. Same-day Comic Con ends at 2:00 p.m. in Little Rock.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Malvern", "Hot Spring County", "Cookout", "Democratic Party"],
    mapCoordinates: { lat: 34.3775, lng: -92.821 },
    mapPinQuality: "exact",
    flyerSrc: "/media/event-flyers/hot-spring-county-cookout-2026-09-19.png",
    flyerAlt: "Hot Spring County Democratic Party community cookout flyer for Saturday, September 19 at the 4-H Center in Malvern.",
    relatedEventSlugs: ["little-rock-comic-con-2026-09-19", "clark-county-multi-church-tour-2026-09-20"],
  }),
  campaignStop({
    slug: "clark-county-multi-church-tour-2026-09-20",
    title: "Multi-Church Tour",
    type: "Community Conversation",
    region: "Southwest Arkansas",
    countySlug: "clark-county",
    startsAt: "2026-09-20T09:00:00",
    endsAt: "2026-09-20T16:00:00",
    timeTbd: true,
    locationLabel: "Gurdon and Arkadelphia",
    city: "Gurdon / Arkadelphia",
    summary: "Sunday Clark County Multi-Church Tour, with stops in Gurdon and Arkadelphia.",
    description:
      "Public listing for the September 20 Multi-Church Tour in Clark County. Gurdon and Arkadelphia are both in Clark County, so this is one county stop with two city visits — not two unrelated events.",
    whatToExpect: [
      "Gurdon — church stop on the Multi-Church Tour",
      "Arkadelphia — church stop on the Multi-Church Tour",
      "Exact service times to be posted with host confirmation",
    ],
    audienceTags: ["Clark County", "Gurdon", "Arkadelphia"],
    mapCoordinates: { lat: 34.1209, lng: -93.0538 },
    relatedEventSlugs: ["little-river-county-stop-2026-09-21"],
  }),
  campaignStop({
    slug: "little-river-county-stop-2026-09-21",
    title: "Little River County stop",
    type: "Community Conversation",
    region: "Southwest Arkansas",
    countySlug: "little-river-county",
    startsAt: "2026-09-21T12:00:00",
    timeTbd: true,
    locationLabel: "Little River County (venue TBA)",
    summary: "Confirmed Little River County stop. Event title and time still to be posted.",
    audienceTags: ["Little River County"],
    mapCoordinates: { lat: 33.7001, lng: -94.2216 },
    relatedEventSlugs: ["press-freedom-gala-2026-09-22"],
  }),
  campaignStop({
    slug: "press-freedom-gala-2026-09-22",
    title: "Press Freedom Gala",
    type: "Community Conversation",
    region: "Statewide",
    startsAt: "2026-09-22T18:00:00",
    timeTbd: true,
    locationLabel: "Location to verify",
    city: "Location to verify",
    summary: "Tentative Press Freedom Gala. Location and time still needed — this date is not a Paragould candidate forum.",
    audienceTags: ["Press"],
    relatedEventSlugs: ["faith-and-reflection-zoom-2026-09-23"],
    fieldAttendance: "tentative",
    missingCounty: true,
  }),
  campaignStop({
    slug: "greene-county-candidate-forum-2026-09-26",
    title: "Candidate Forum",
    type: "Town Hall",
    region: "Northeast Arkansas",
    countySlug: "greene-county",
    startsAt: "2026-09-26T14:00:00",
    endsAt: "2026-09-26T16:00:00",
    locationLabel: "Paragould",
    city: "Paragould",
    summary: "Saturday 2:00 p.m. Central candidate forum in Paragould.",
    audienceTags: ["Paragould", "Greene County", "Candidate Forum"],
    mapCoordinates: { lat: 36.0584, lng: -90.4973 },
    relatedEventSlugs: ["little-flock-2026-09-27"],
  }),
  campaignStop({
    slug: "little-flock-2026-09-27",
    title: "Little Flock",
    type: "Community Conversation",
    region: "Northwest Arkansas",
    countySlug: "benton-county",
    startsAt: "2026-09-27T08:00:00",
    endsAt: "2026-09-27T10:00:00",
    locationLabel: "Little Flock",
    city: "Little Flock",
    summary: "Tentative 8:00 a.m. Central stop in Little Flock.",
    audienceTags: ["Little Flock", "Benton County", "Northwest Arkansas"],
    mapCoordinates: { lat: 36.3851, lng: -94.1355 },
    relatedEventSlugs: ["garland-county-library-candidate-forum-2026-09-29", "faith-and-reflection-zoom-2026-09-30"],
    fieldAttendance: "tentative",
  }),
  campaignStop({
    slug: "garland-county-library-candidate-forum-2026-09-29",
    title: "2026 State & Federal Candidates Forum",
    type: "Town Hall",
    region: "Central Arkansas",
    countySlug: "garland-county",
    startsAt: "2026-09-29T18:00:00",
    locationLabel: "Garland County Library",
    city: "Hot Springs",
    addressLine: "1427 Malvern Ave., Hot Springs, AR 71901",
    summary:
      "Tuesday, September 29 — the Garland County Library’s State & Federal Candidates Forum. Doors open at 5:00 p.m. Central; forum begins at 6:00 p.m. Free to attend; seating is limited. In person or watch live.",
    description:
      "Kelly Grappe joins other state and federal candidates on the Garland County ballot for the library’s 2026 State & Federal Candidates Forum — the September 29 session in a three-night Candidates Forums series hosted by Garland County Library, Braver Angels Arkansas, and the NAACP Hot Springs Branch. Learn more about candidates and their positions on important issues. Doors open at 5:00 p.m. Central; each forum begins at 6:00 p.m. Attendance is free, but seating is limited. Join in person at 1427 Malvern Avenue in Hot Springs, or watch live and on demand on YouTube and Facebook.",
    whatToExpect: [
      "Tuesday, September 29, 2026 — State & Federal Candidates Forum. Doors 5:00 p.m. Central; forum begins 6:00 p.m.",
      "Garland County Library, 1427 Malvern Ave., Hot Springs, AR 71901.",
      "Hosted by Garland County Library, Braver Angels Arkansas, and NAACP Hot Springs Branch.",
      "Free to attend in person; seating is limited.",
      "Attend in person or watch live and on demand at youtube.com/GarlandCoLibrary or facebook.com/GarlandCountyLibrary.",
      "Community needs survey and questions for candidates: scan the QR code on the library flyer or visit GCLibrary.com.",
    ],
    whoItsFor:
      "Garland County neighbors and anyone who wants to hear state and federal candidates — including Kelly Grappe for Secretary of State — on the issues that matter locally.",
    organizerNote:
      "September 29 is the State & Federal forum in the library’s three-date series (Garland County forum Sept 22; City of Hot Springs forum Sept 30). Posted from the official library flyer. Host contact stays off the public page.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: [
      "Hot Springs",
      "Garland County",
      "Candidate Forum",
      "Library",
      "Braver Angels",
      "NAACP",
      "State & Federal",
    ],
    mapCoordinates: { lat: 34.507, lng: -93.056 },
    mapPinQuality: "exact",
    flyerSrc: "/media/event-flyers/garland-county-library-candidates-forums-2026-09-29.png",
    flyerAlt:
      "2026 Candidates Forums flyer — Garland County Library, Braver Angels Arkansas, and NAACP Hot Springs Branch. State and Federal Candidates Forum Tuesday September 29 at 6 p.m., doors at 5 p.m., 1427 Malvern Ave., Hot Springs.",
    primaryHref: "https://www.gclibrary.com",
    primaryCtaLabel: "Garland County Library",
    featured: true,
    featuredLabel: "Candidates forum",
    featuredSummary:
      "Kelly joins the State & Federal forum on September 29 — part of the library’s three-night 2026 Candidates Forums series. Free in person; limited seating. Watch live on YouTube or Facebook if you cannot attend.",
    relatedEventSlugs: ["little-flock-2026-09-27", "faith-and-reflection-zoom-2026-09-30"],
  }),
];
