import type { EventItem, EventType } from "@/content/types";
import { ARKANSAS_YOUTH_COALITION_HREF } from "@/content/events/recurring-virtual-series";

const TZ = "America/Chicago";
const DETAILS_LATER =
  "Confirmed on the August campaign timeline. Venue, program, and how to join will be posted here when the host confirms them. All times are U.S. Central.";

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
  city?: string;
  addressLine?: string;
  summary: string;
  description?: string;
  whatToExpect?: string[];
  whoItsFor?: string;
  organizerNote?: string;
  attendanceType?: EventItem["attendanceType"];
  audienceTags: string[];
  mapCoordinates?: { lat: number; lng: number };
  mapPinQuality?: EventItem["mapPinQuality"];
  relatedEventSlugs: string[];
  relatedResourceHrefs?: Array<{ label: string; href: string }>;
  fieldAttendance?: EventItem["fieldAttendance"];
  primaryHref?: string;
  primaryCtaLabel?: string;
  featured?: boolean;
  featuredLabel?: string;
  featuredSummary?: string;
};

function campaignStop(draft: StopDraft): EventItem {
  const date = draft.startsAt.slice(0, 10);
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
    city: draft.city ?? draft.locationLabel,
    addressLine: draft.addressLine,
    summary: draft.summary,
    description: draft.description ?? DETAILS_LATER,
    whatToExpect: draft.whatToExpect ?? [
      "Stop details will be added when the host confirms venue and program.",
    ],
    whoItsFor: draft.whoItsFor ?? "Neighbors, volunteers, and anyone who wants to meet the campaign on the trail.",
    organizerNote:
      draft.organizerNote ?? "August 2026 campaign timeline — public facts only; details to be added.",
    attendanceType: draft.attendanceType,
    audienceTags: draft.audienceTags,
    relatedEventSlugs: draft.relatedEventSlugs,
    relatedResourceHrefs: draft.relatedResourceHrefs ?? [
      { label: "Events calendar", href: "/events" },
      { label: "Get involved", href: "/get-involved" },
    ],
    featured: draft.featured,
    featuredLabel: draft.featuredLabel,
    featuredSummary: draft.featuredSummary,
    mapCoordinates: draft.mapCoordinates,
    mapPinQuality: draft.mapPinQuality,
    fieldAttendance: draft.fieldAttendance ?? "confirmed",
    campaignTrail: true,
    eventSource: "movement",
    primaryHref: draft.primaryHref,
    primaryCtaLabel: draft.primaryCtaLabel,
    opsFlags: {
      timeTbd: draft.timeTbd,
      missingCounty: !draft.countySlug,
      missingCoordinates: !draft.mapCoordinates,
    },
  };
}

/** Confirmed public campaign stops for August 2026. Travel-only days are not listed. */
export const august2026CampaignStops: EventItem[] = [
  campaignStop({
    slug: "ms-magazine-interview-2026-08-07",
    title: "Ms. magazine interview — Little Rock",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    startsAt: "2026-08-07T08:30:00",
    locationLabel: "Downtown Little Rock",
    city: "Little Rock",
    addressLine: "Downtown Little Rock coffee shop",
    summary:
      "Friday, August 7, 8:30 a.m. Central. Kelly sat down in downtown Little Rock for a Ms. magazine interview.",
    description:
      "Kelly Grappe, candidate for Arkansas Secretary of State, met with Ms. magazine in downtown Little Rock on Friday, August 7, 2026, at 8:30 a.m. This was a press interview, not an open public event.",
    whatToExpect: [
      "Friday, August 7, 2026, 8:30 a.m. Central.",
      "Downtown Little Rock coffee shop.",
      "Press interview with Ms. magazine. This was not an open public event.",
    ],
    whoItsFor: "This listing records a completed press interview. It was not an open invite.",
    organizerNote: "Completed Aug 7, 2026. Reporter contact stays off the public page.",
    attendanceType: "CAMPAIGN_APPEARANCE",
    audienceTags: ["Little Rock", "Pulaski County", "Press"],
    mapCoordinates: { lat: 34.7465, lng: -92.2896 },
    relatedEventSlugs: [],
  }),
  campaignStop({
    slug: "sebastian-county-democrats-fort-smith-2026-08-10",
    title: "Sebastian County Democrats August meeting — Fort Smith",
    type: "Town Hall",
    region: "West Central Arkansas",
    countySlug: "sebastian-county",
    startsAt: "2026-08-10T18:00:00",
    locationLabel: "Creekmore Park Rose Room",
    city: "Fort Smith",
    addressLine: "3301 South M Street, Fort Smith, AR 72903",
    summary:
      "Monday, August 10, 6:00 p.m. Central. Kelly joined the Sebastian County Democrats monthly meeting at Creekmore Park in Fort Smith.",
    description:
      "Monday, August 10, 2026, 6:00 p.m. Central at the Creekmore Park Rose Room, 3301 South M Street, Fort Smith. The Sebastian County Democratic Party hosted its August meeting with Kelly Grappe, candidate for Arkansas Secretary of State, as a special guest. Local Democratic candidates also appeared. This listing records a completed campaign stop.",
    whatToExpect: [
      "Monday, August 10, 2026, 6:00 p.m. Central.",
      "Creekmore Park Rose Room, 3301 South M Street, Fort Smith.",
      "Sebastian County Democrats monthly meeting. Kelly Grappe was a special guest.",
      "This listing records a completed campaign stop.",
    ],
    whoItsFor: "Neighbors in Fort Smith and Sebastian County, and anyone looking back at where the campaign has been.",
    organizerNote:
      "Completed Aug 10, 2026. Hosted by Sebastian County Democrats. Host contact stays off the public page. The Aug 11 Creekmore work session was a county party volunteer shift, not a Kelly public stop.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Fort Smith", "Sebastian County", "Democratic Party"],
    mapCoordinates: { lat: 35.37087, lng: -94.39711 },
    relatedEventSlugs: ["river-valley-candidate-rally-fort-smith-2026-09-13"],
  }),
  campaignStop({
    slug: "pocahontas-breakfast-meet-greet-2026-08-15",
    title: "Breakfast meet & greet — Pocahontas",
    type: "Community Conversation",
    region: "Northeast Arkansas",
    countySlug: "randolph-county",
    startsAt: "2026-08-15T09:00:00",
    endsAt: "2026-08-15T11:00:00",
    locationLabel: "Pocahontas",
    addressLine: "Pocahontas, AR (venue TBA)",
    summary: "Saturday morning meet & greet in Pocahontas. Venue to be posted.",
    audienceTags: ["Pocahontas", "Randolph County", "Northeast Arkansas"],
    mapCoordinates: { lat: 36.2615, lng: -90.9712 },
    relatedEventSlugs: ["horseshoe-bend-fundraiser-2026-08-15"],
  }),
  campaignStop({
    slug: "horseshoe-bend-fundraiser-2026-08-15",
    title: "Fundraiser — Horseshoe Bend",
    type: "Community Conversation",
    region: "North Central Arkansas",
    countySlug: "izard-county",
    startsAt: "2026-08-15T14:00:00",
    endsAt: "2026-08-15T16:00:00",
    locationLabel: "Horseshoe Bend",
    addressLine: "Horseshoe Bend, AR (venue TBA)",
    summary: "Saturday afternoon fundraiser in Horseshoe Bend. Venue and ticket details to be posted.",
    audienceTags: ["Horseshoe Bend", "Izard County", "Fundraiser"],
    mapCoordinates: { lat: 36.229, lng: -91.764 },
    relatedEventSlugs: ["pocahontas-breakfast-meet-greet-2026-08-15"],
  }),
  campaignStop({
    slug: "saline-county-josh-irby-2026-08-16",
    title: "Saline County event with Josh Irby",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "saline-county",
    startsAt: "2026-08-16T11:00:00",
    timeTbd: true,
    locationLabel: "Saline County (venue TBA)",
    addressLine: "Saline County, AR",
    summary: "Confirmed Saline County stop with Josh Irby. Time and venue to be posted.",
    audienceTags: ["Saline County", "Central Arkansas"],
    mapCoordinates: { lat: 34.5645, lng: -92.5868 },
    relatedEventSlugs: ["fundraiser-dr-kahn-2026-08-16"],
  }),
  campaignStop({
    slug: "fundraiser-dr-kahn-2026-08-16",
    title: "Fundraiser with Dr. Kahn",
    type: "Community Conversation",
    region: "Central Arkansas",
    startsAt: "2026-08-16T14:00:00",
    timeTbd: true,
    locationLabel: "Venue TBA — confirm with host",
    summary: "Confirmed fundraiser with Dr. Kahn the same day as the Saline County stop. City and time to be posted.",
    audienceTags: ["Fundraiser"],
    relatedEventSlugs: ["saline-county-josh-irby-2026-08-16"],
  }),
  campaignStop({
    slug: "washington-county-democrats-2026-08-17",
    title: "Washington County Democrats meeting",
    type: "Community Conversation",
    region: "Northwest Arkansas",
    countySlug: "washington-county",
    startsAt: "2026-08-17T12:00:00",
    timeTbd: true,
    locationLabel: "Washington County (venue TBA)",
    addressLine: "Washington County, AR",
    summary: "Confirmed Washington County Democrats meeting. Time, format, and room to be posted.",
    audienceTags: ["Democratic Party", "Washington County", "Fayetteville"],
    mapCoordinates: { lat: 36.0626, lng: -94.1574 },
    relatedEventSlugs: ["nwa-senior-democrats-fayetteville-2026-08-18"],
  }),
  campaignStop({
    slug: "nwa-senior-democrats-fayetteville-2026-08-18",
    title: "NWA Senior Democrats meeting — Fayetteville",
    type: "Community Conversation",
    region: "Northwest Arkansas",
    countySlug: "washington-county",
    startsAt: "2026-08-18T11:30:00",
    endsAt: "2026-08-18T12:45:00",
    locationLabel: "Butterfield Trail Village Lodge",
    city: "Fayetteville",
    addressLine: "1923 E. Joyce Blvd., Fayetteville, AR 72703",
    summary:
      "Tuesday. Social time from 11:30 a.m. Meeting at noon at Butterfield Trail Village Lodge in Fayetteville. Kelly speaks early in the program and leaves by 12:45 p.m.",
    description:
      "The Northwest Arkansas Senior Democrats meet at the Butterfield Trail Village Lodge in Fayetteville, off Joyce Boulevard. Members gather from about 11:30 a.m. The meeting starts at noon. Kelly Grappe, candidate for Arkansas Secretary of State, speaks at the start of the program and leaves by 12:45 p.m. The club meeting may continue until 1:00 p.m. Parking is in front of the Lodge and on streets inside the Village — do not park on the mailbox side of the street. Look first for the EV charging station in front of the Lodge.",
    whatToExpect: [
      "Social time from about 11:30 a.m. Central. Meeting starts at noon.",
      "Butterfield Trail Village Lodge, 1923 E. Joyce Blvd., Fayetteville.",
      "Kelly speaks at the start of the program and leaves by 12:45 p.m.",
      "Park in front of the Lodge or on Village streets — not on the mailbox side. Look for the EV charging station out front.",
    ],
    whoItsFor: "Members of the Northwest Arkansas Senior Democrats and guests at their monthly meeting.",
    organizerNote: "Confirmed with the host on August 17, 2026. Public venue and schedule only. Host contact stays off the public page.",
    attendanceType: "CAMPAIGN_APPEARANCE",
    audienceTags: ["Democratic Party", "Washington County", "Fayetteville", "Northwest Arkansas"],
    mapCoordinates: { lat: 36.0994, lng: -94.1368 },
    mapPinQuality: "exact",
    relatedEventSlugs: ["washington-county-democrats-2026-08-17", "uca-conway-daze-2026-08-19"],
  }),
  campaignStop({
    slug: "uca-conway-daze-2026-08-19",
    title: "UCA Conway Daze / Student Fair",
    type: "Youth Civic Session",
    region: "Central Arkansas",
    countySlug: "faulkner-county",
    startsAt: "2026-08-19T14:00:00",
    endsAt: "2026-08-19T17:00:00",
    locationLabel: "UCA TREC (campus gym)",
    city: "Conway",
    addressLine: "University of Central Arkansas TREC, Conway, AR (old HPER / campus gym)",
    summary:
      "Wednesday, August 19, 2:00–5:00 p.m. Central. UCA Welcome Week student fair. Faulkner County Democrats are set up with the Young Dems at Table 166. Kelly’s attendance is tentative.",
    description:
      "UCA Welcome Week includes Conway Daze on Wednesday, August 19, 2026, from 2:00 to 5:00 p.m. Central at the TREC campus gym (the old HPER Center) in Conway. Faulkner County Democrats are currently at Table 166 with the Young Dems. Kelly Grappe’s attendance is tentative. Table number will be updated if the host changes it.",
    whatToExpect: [
      "Wednesday, August 19, 2:00–5:00 p.m. Central.",
      "UCA TREC / campus gym (old HPER Center), Conway.",
      "Faulkner County Democrats with Young Dems at Table 166, unless the host posts a change.",
      "Kelly’s attendance is tentative.",
    ],
    whoItsFor: "UCA students and anyone walking Conway Daze during Welcome Week.",
    organizerNote:
      "Flagged by Faulkner County Democrats. Tentative for Kelly. Host contact stays off the public page. Official fair page: https://uca.edu/fye/conwaydaze/",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Conway", "Faulkner County", "UCA", "Youth", "College"],
    mapCoordinates: { lat: 35.0784, lng: -92.4575 },
    mapPinQuality: "region",
    relatedEventSlugs: ["nwa-senior-democrats-fayetteville-2026-08-18", "power-of-one-vote-dumas-2026-08-21"],
    fieldAttendance: "tentative",
    primaryHref: "https://uca.edu/fye/conwaydaze/",
    primaryCtaLabel: "Conway Daze details",
  }),
  campaignStop({
    slug: "power-of-one-vote-dumas-2026-08-21",
    title: "The Power of One Vote — Dumas",
    type: "Town Hall",
    region: "Lower Delta",
    countySlug: "desha-county",
    startsAt: "2026-08-21T17:00:00",
    locationLabel: "Dumas Community Center",
    city: "Dumas",
    addressLine: "18 Belmont Dr., Dumas, AR",
    summary:
      "Friday. Doors open at 5:00 p.m. Central. Your community, your candidates, your voice — at the Dumas Community Center.",
    description:
      "The Power of One Vote is Friday, August 21, 2026, at the Dumas Community Center, 18 Belmont Dr., Dumas. Doors open at 5:00 p.m. Central. The evening is hosted by the 12th Episcopal District of the AME Church and the Arkansas Democratic Black Caucus. Kelly Grappe, candidate for Arkansas Secretary of State, will be there with Hallie Shoffner, Dr. Terri Yarbrough Green, Fred Love, and Bishop Sylvester S. Beaman.",
    whatToExpect: [
      "Doors open at 5:00 p.m. Central on Friday, August 21.",
      "Dumas Community Center, 18 Belmont Dr., Dumas, Arkansas.",
      "Hosted by the 12th Episcopal District of the AME Church and the Arkansas Democratic Black Caucus.",
      "Kelly Grappe joins Hallie Shoffner, Dr. Terri Yarbrough Green, Fred Love, and Bishop Sylvester S. Beaman.",
    ],
    whoItsFor: "Neighbors in Dumas, Desha County, and Arkansas’s 1st Congressional District.",
    organizerNote: "Posted from the Power of One Vote flyer. Host contact stays off the public page.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Dumas", "Desha County", "Lower Delta", "AME Church", "Arkansas Democratic Black Caucus"],
    mapCoordinates: { lat: 33.8873, lng: -91.4915 },
    mapPinQuality: "exact",
    relatedEventSlugs: ["coffee-with-kelly-searcy-2026-08-22"],
  }),
  campaignStop({
    slug: "coffee-with-kelly-searcy-2026-08-22",
    title: "Coffee with Kelly — Searcy",
    type: "Community Conversation",
    region: "North Central Arkansas",
    countySlug: "white-county",
    startsAt: "2026-08-22T10:30:00",
    endsAt: "2026-08-22T11:30:00",
    locationLabel: "Janet & Larry Crain Memorial Library",
    city: "Searcy",
    addressLine: "1609 W Beebe Capps Expressway, Searcy, AR",
    summary:
      "Saturday 10:30–11:30 a.m. Central. Drop by and meet Kelly Grappe, candidate for Secretary of State.",
    description:
      "Drop by and meet Kelly Grappe, candidate for Secretary of State. Coffee with Kelly is Saturday, August 22, 2026, from 10:30 to 11:30 a.m. Central at the Janet & Larry Crain Memorial Library, 1609 W Beebe Capps Expressway, Searcy.",
    whatToExpect: [
      "Drop by anytime between 10:30 and 11:30 a.m. Central — no RSVP required.",
      "Janet & Larry Crain Memorial Library, 1609 W Beebe Capps Expressway, Searcy.",
      "Meet Kelly Grappe, candidate for Arkansas Secretary of State.",
    ],
    whoItsFor: "Neighbors in Searcy and White County — come say hello.",
    organizerNote: "Posted from the campaign Coffee with Kelly flyer. Paid for by the Committee to Elect Kelly Grappe.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Searcy", "White County", "Coffee with Kelly"],
    mapCoordinates: { lat: 35.2478, lng: -91.7612 },
    mapPinQuality: "exact",
    relatedEventSlugs: ["power-of-one-vote-dumas-2026-08-21", "mccrory-fair-rodeo-2026-08-22"],
  }),
  campaignStop({
    slug: "mccrory-fair-rodeo-2026-08-22",
    title: "McCrory Fair & Rodeo",
    type: "Fairs and Festivals",
    region: "Upper Delta",
    countySlug: "woodruff-county",
    startsAt: "2026-08-22T17:00:00",
    locationLabel: "McCrory",
    addressLine: "McCrory, AR (fairgrounds / host site TBA)",
    summary: "Saturday 5:00 p.m. Central at the McCrory Fair & Rodeo. Exact table or staging spot to be posted.",
    audienceTags: ["McCrory", "Woodruff County", "Festival"],
    mapCoordinates: { lat: 35.2565, lng: -91.1998 },
    relatedEventSlugs: ["coffee-with-kelly-searcy-2026-08-22", "true-holiness-college-day-2026-08-23"],
  }),
  campaignStop({
    slug: "true-holiness-college-day-2026-08-23",
    title: "College Day 2026 — True Holiness Saints Center",
    type: "Youth Civic Session",
    region: "Central Arkansas",
    countySlug: "faulkner-county",
    startsAt: "2026-08-23T11:00:00",
    locationLabel: "True Holiness Saints Center",
    city: "Conway",
    addressLine: "198 Hwy 286 East, Conway, AR",
    summary:
      "Sunday, August 23. Doors 10:15 a.m., program 11:00 a.m. Central. Welcome for UCA, Hendrix, and Central Baptist College students. Free lunch. Kelly’s attendance is tentative.",
    description:
      "True Holiness Saints Center hosts College Day 2026 on Sunday, August 23, 2026, in Conway. Doors open at 10:15 a.m. Central. The program begins at 11:00 a.m. The welcome is for students from the University of Central Arkansas, Hendrix College, and Central Baptist College. The flyer lists student-led worship, a sermon, and a free lunch. This is a church-hosted welcome, not a campaign rally. Kelly Grappe’s attendance is tentative.",
    whatToExpect: [
      "Sunday, August 23. Doors 10:15 a.m. Program 11:00 a.m. Central.",
      "True Holiness Saints Center, 198 Hwy 286 East, Conway.",
      "Student-led worship, sermon, and a free lunch.",
      "Welcome for UCA, Hendrix, and Central Baptist College students.",
      "Kelly’s attendance is tentative.",
    ],
    whoItsFor: "College students arriving in Conway and neighbors joining the church welcome.",
    organizerNote:
      "Flagged by Faulkner County Democrats. Tentative for Kelly. Same calendar day as a personal hold — not confirmed. Host contact stays off the public page.",
    attendanceType: "CAMPAIGN_APPEARANCE",
    audienceTags: ["Conway", "Faulkner County", "College", "Youth", "Faith"],
    mapCoordinates: { lat: 35.0752, lng: -92.3965 },
    mapPinQuality: "exact",
    relatedEventSlugs: ["mccrory-fair-rodeo-2026-08-22", "paragould-campaign-activities-2026-08-25"],
    fieldAttendance: "tentative",
    primaryHref: "https://www.trueholiness.net",
    primaryCtaLabel: "True Holiness Saints Center",
  }),
  campaignStop({
    slug: "paragould-campaign-activities-2026-08-25",
    title: "Campaign activities — Paragould",
    type: "Community Conversation",
    region: "Northeast Arkansas",
    countySlug: "greene-county",
    startsAt: "2026-08-25T12:00:00",
    timeTbd: true,
    locationLabel: "Paragould",
    addressLine: "Paragould, AR (schedule TBA)",
    summary: "Confirmed campaign activities in Paragould. Public stops that day will be posted as they are confirmed.",
    audienceTags: ["Paragould", "Greene County", "Northeast Arkansas"],
    mapCoordinates: { lat: 36.0584, lng: -90.4973 },
    relatedEventSlugs: [
      "dardanelle-chamber-buzz-breakfast-2026-08-26",
      "paragould-rotary-lunch-2026-08-26",
      "asu-back-to-school-2026-08-26",
    ],
  }),
  campaignStop({
    slug: "dardanelle-chamber-buzz-breakfast-2026-08-26",
    title: "103.7 The BUZZ live from the Dardanelle Chamber",
    type: "Community Conversation",
    region: "North Central Arkansas",
    countySlug: "yell-county",
    startsAt: "2026-08-26T06:00:00",
    endsAt: "2026-08-26T10:00:00",
    locationLabel: "Dardanelle Area Chamber of Commerce",
    city: "Dardanelle",
    addressLine: "212 N Front Street, Dardanelle, AR 72834",
    summary:
      "Wednesday 6:00–10:00 a.m. Central. 103.7 The BUZZ Morning Mayhem broadcasts live from the Chamber office. Kelly will be there as a sponsor of the Mount Nebo Chicken Fry.",
    description:
      "Wednesday, August 26, 2026, from 6:00 to 10:00 a.m. Central, 103.7 The BUZZ Morning Mayhem broadcasts live from the Dardanelle Area Chamber of Commerce, 212 N Front Street, Dardanelle. Kelly Grappe, candidate for Arkansas Secretary of State, will be there as a sponsor of the 79th Annual Mount Nebo Chicken Fry. The Chamber is hosting breakfast on the porch for Chicken Fry sponsors during the live show.",
    whatToExpect: [
      "6:00–10:00 a.m. Central on Wednesday, August 26.",
      "Dardanelle Area Chamber of Commerce, 212 N Front Street, Dardanelle.",
      "103.7 The BUZZ Morning Mayhem broadcasting live from the Chamber office.",
      "Kelly will be there as a sponsor of Saturday’s Mount Nebo Chicken Fry.",
      "Porch breakfast is for Chicken Fry sponsors; neighbors can listen to the live broadcast.",
    ],
    whoItsFor: "Chicken Fry sponsors at the Chamber, and anyone listening to 103.7 The BUZZ.",
    organizerNote:
      "Posted from the Dardanelle Area Chamber sponsor email. Host phones and emails stay off the public page. Logo and T-shirt sizes are operator follow-up, not public copy.",
    attendanceType: "CAMPAIGN_APPEARANCE",
    audienceTags: ["Dardanelle", "Yell County", "Chamber of Commerce", "103.7 The BUZZ"],
    mapCoordinates: { lat: 35.2226, lng: -93.1477 },
    mapPinQuality: "exact",
    relatedEventSlugs: [
      "paragould-rotary-lunch-2026-08-26",
      "chickin-n-politikin-mount-nebo-2026-08-29",
    ],
  }),
  campaignStop({
    slug: "paragould-rotary-lunch-2026-08-26",
    title: "Rotary Club lunch — Paragould",
    type: "Community Conversation",
    region: "Northeast Arkansas",
    countySlug: "greene-county",
    startsAt: "2026-08-26T12:00:00",
    timeTbd: true,
    locationLabel: "Paragould",
    addressLine: "Paragould, AR (Rotary meeting site TBA)",
    summary: "Confirmed Rotary Club lunch in Paragould. Start time and room to be posted.",
    audienceTags: ["Paragould", "Greene County", "Rotary"],
    mapCoordinates: { lat: 36.0584, lng: -90.4973 },
    relatedEventSlugs: [
      "dardanelle-chamber-buzz-breakfast-2026-08-26",
      "asu-back-to-school-2026-08-26",
      "paragould-campaign-activities-2026-08-25",
    ],
  }),
  campaignStop({
    slug: "asu-back-to-school-2026-08-26",
    title: "Back-to-school event — Arkansas State University",
    type: "Youth Civic Session",
    region: "Northeast Arkansas",
    countySlug: "craighead-county",
    startsAt: "2026-08-26T15:00:00",
    timeTbd: true,
    locationLabel: "Arkansas State University — Jonesboro",
    addressLine: "Jonesboro, AR (campus site TBA)",
    summary: "Confirmed back-to-school event at Arkansas State University. Time and campus location to be posted.",
    audienceTags: ["Youth", "Jonesboro", "Craighead County", "ASU"],
    mapCoordinates: { lat: 35.8423, lng: -90.6795 },
    relatedEventSlugs: ["paragould-rotary-lunch-2026-08-26"],
  }),
  campaignStop({
    slug: "logan-county-democrats-paris-2026-08-27",
    title: "Logan County Democrats — Paris",
    type: "Community Conversation",
    region: "West Central Arkansas",
    countySlug: "logan-county",
    startsAt: "2026-08-27T18:00:00",
    locationLabel: "Paris",
    city: "Paris",
    addressLine: "Paris, AR (room to be posted)",
    summary:
      "Thursday, August 27, 6:00 p.m. Central. Meeting of the newly re-established Logan County Democratic Party in Paris. Other candidates will also attend. Room to be posted.",
    description:
      "Thursday, August 27, 2026, 6:00 p.m. Central in Paris. The newly re-established Democratic Party of Logan County is gathering, and other candidates will also attend. Kelly Grappe, candidate for Arkansas Secretary of State, has this stop on the campaign calendar. The exact room will be posted here when the host publishes it.",
    whatToExpect: [
      "Thursday, August 27, 2026, 6:00 p.m. Central.",
      "Paris, Arkansas. Room to be posted.",
      "Newly re-established Logan County Democratic Party meeting. Other candidates will also attend.",
    ],
    whoItsFor: "Neighbors in Paris and Logan County, and anyone who wants to meet the Secretary of State candidates on August 27.",
    organizerNote:
      "Invitation from the Logan County chair dated August 7, 2026. Host contact stays off the public page. Venue room still TBA. Next evening is the Arkansas Youth Coalition Retreat at Mount Nebo.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Democratic Party", "Logan County", "Paris"],
    mapCoordinates: { lat: 35.292, lng: -93.7224 },
    relatedEventSlugs: [
      "dardanelle-chamber-buzz-breakfast-2026-08-26",
      "arkansas-youth-coalition-retreat-2026-08-28",
    ],
  }),
  campaignStop({
    slug: "arkansas-youth-coalition-retreat-2026-08-28",
    title: "Arkansas Youth Coalition Retreat #2",
    type: "Youth Civic Session",
    region: "North Central Arkansas",
    countySlug: "yell-county",
    startsAt: "2026-08-28T19:00:00",
    endsAt: "2026-08-29T10:00:00",
    locationLabel: "Base of Mount Nebo",
    city: "Dardanelle",
    addressLine: "Lodging at the base of Mount Nebo — address shared with registered participants",
    summary:
      "Friday night, August 28. Arkansas Youth Coalition Retreat #2 at lodging at the base of Mount Nebo — space for 12 young leaders. Team building, trust exercises, and training, then Saturday at Chickin-n-Politikin on the mountain.",
    description:
      "Friday night, August 28, 2026, the Arkansas Youth Coalition gathers for Retreat #2 at lodging at the base of Mount Nebo. There is space for 12 young leaders. Arrival is Friday evening.\n\nThe night is for team building and trust exercises, plus training on how to approach people, how to have hard conversations with people of differing beliefs, how to lead in your community, and more.\n\nThis is not a walk-in gathering. Registered Retreat #2 participants receive lodging details privately. The street address is not posted here.\n\nSaturday, August 29, the same team takes those skills to Chickin-n-Politikin at the Mount Nebo Chicken Fry — practicing in the crowd and campaigning with Kelly.",
    whatToExpect: [
      "Arrive Friday evening, August 28. Gathering starts at 7:00 p.m. Central.",
      "Overnight lodging at the base of Mount Nebo — space for 12. Address is shared privately with registered participants.",
      "Team building and trust exercises.",
      "Training: how to approach people; how to have hard conversations with people of differing beliefs; how to lead in your community; and more.",
      "Saturday is the field day: Chickin-n-Politikin at the Mount Nebo Chicken Fry, practicing those skills and campaigning.",
    ],
    whoItsFor:
      "Young leaders with the Arkansas Youth Coalition. Retreat #2 has space for 12. Neighbors headed to Saturday’s Chicken Fry are welcome at the festival — not at the overnight lodging.",
    organizerNote:
      "Steve 2026-08-17: AYC Retreat #2, lodging at the base of Mt Nebo that sleeps 12, arrive Friday night Aug 28. Street address stays off the public page. Saturday is Chickin-n-Politikin at the Chamber Chicken Fry. No host phones or volunteer-ops T-shirt forms on the public page.",
    attendanceType: "INVITATION",
    audienceTags: ["Youth", "Arkansas Youth Coalition", "Mount Nebo", "Yell County"],
    mapCoordinates: { lat: 35.2226, lng: -93.1477 },
    featured: true,
    featuredLabel: "Weekend highlight",
    featuredSummary:
      "Friday night training with the Arkansas Youth Coalition. Saturday is Chickin-n-Politikin at the Chicken Fry — practicing those skills and campaigning.",
    primaryHref: ARKANSAS_YOUTH_COALITION_HREF,
    primaryCtaLabel: "Ask about Retreat #2",
    relatedEventSlugs: ["chickin-n-politikin-mount-nebo-2026-08-29"],
    relatedResourceHrefs: [
      { label: "Arkansas Youth Coalition", href: ARKANSAS_YOUTH_COALITION_HREF },
      { label: "Chickin-n-Politikin on Saturday", href: "/events/chickin-n-politikin-mount-nebo-2026-08-29" },
      { label: "Get involved", href: "/get-involved" },
    ],
  }),
  campaignStop({
    slug: "chickin-n-politikin-mount-nebo-2026-08-29",
    title: "Chickin-n-Politikin at the Mount Nebo Chicken Fry",
    type: "Fairs and Festivals",
    region: "North Central Arkansas",
    countySlug: "yell-county",
    startsAt: "2026-08-29T12:00:00",
    timeTbd: true,
    locationLabel: "Mount Nebo State Park",
    city: "Dardanelle",
    addressLine: "16728 State Highway 155, Dardanelle, AR 72834",
    summary:
      "Saturday on the mountain: Chickin-n-Politikin at the 79th Annual Mount Nebo Chicken Fry. After Friday night’s Arkansas Youth Coalition Retreat #2, young leaders spend Saturday practicing new skills and campaigning with Kelly. The Chamber hosts. Kelly is a sponsor. Program hours to be posted.",
    description:
      "Saturday, August 29, 2026, is Chickin-n-Politikin at the 79th Annual Mount Nebo Chicken Fry. The Dardanelle Area Chamber of Commerce hosts this Yell County tradition at Mount Nebo State Park, 16728 State Highway 155, Dardanelle. Kelly Grappe, candidate for Arkansas Secretary of State, will be there as a sponsor.\n\nThis Saturday is also the public field day for Arkansas Youth Coalition Retreat #2. After Friday night training at the base of the mountain — team building, trust, how to approach people, how to have hard conversations across belief, and how to lead in community — young leaders spend Saturday at the festival putting those skills to work and campaigning with Kelly.\n\nCome for chicken dinners, community booths, and a day on the mountain. Program hours will be posted here when the Chamber publishes them.",
    whatToExpect: [
      "Saturday, August 29, at Mount Nebo State Park — program hours to be posted.",
      "16728 State Highway 155, Dardanelle, Arkansas.",
      "Hosted by the Dardanelle Area Chamber of Commerce. Kelly Grappe is a sponsor.",
      "Chickin-n-Politikin: Arkansas Youth Coalition Retreat #2 spends Saturday here practicing new skills and campaigning.",
      "Friday night is Retreat #2 at lodging at the base of the mountain (registered participants — not a walk-in).",
    ],
    whoItsFor:
      "Neighbors in Dardanelle, Yell County, and anyone headed up the mountain for the Chicken Fry — plus young leaders putting Retreat #2 training into practice.",
    organizerNote:
      "Steve 2026-08-17: public highlight is Chickin-n-Politikin wrapping the Chamber Chicken Fry, with AYC Retreat #2 practicing and campaigning on Saturday. Canonical slug chickin-n-politikin-mount-nebo-2026-08-29. Old mt-nebo-chicken-fry slug redirects. Host phones, emails, T-shirt forms, and volunteer-ops links stay off the public page. Airbnb street address stays off the public page.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Mount Nebo", "Dardanelle", "Yell County", "Festival", "Chamber of Commerce", "Youth"],
    mapCoordinates: { lat: 35.2146, lng: -93.2518 },
    mapPinQuality: "exact",
    featured: true,
    featuredLabel: "Weekend highlight",
    featuredSummary:
      "The public field day for Arkansas Youth Coalition Retreat #2: young leaders practice new skills in the crowd and campaign with Kelly.",
    relatedEventSlugs: [
      "dardanelle-chamber-buzz-breakfast-2026-08-26",
      "arkansas-youth-coalition-retreat-2026-08-28",
      "quendy-event-scott-2026-08-30",
    ],
    relatedResourceHrefs: [
      { label: "Arkansas Youth Coalition Retreat #2", href: "/events/arkansas-youth-coalition-retreat-2026-08-28" },
      { label: "Arkansas Youth Coalition", href: ARKANSAS_YOUTH_COALITION_HREF },
      { label: "Get involved", href: "/get-involved" },
    ],
  }),
  campaignStop({
    slug: "quendy-event-scott-2026-08-30",
    title: "Quendy event — Scott",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    startsAt: "2026-08-30T16:30:00",
    endsAt: "2026-08-30T17:30:00",
    locationLabel: "Scott",
    city: "Scott",
    addressLine: "Scott, AR (venue TBA)",
    summary: "Sunday 4:30–5:30 p.m. Central gathering in Scott. Exact site to be posted.",
    description:
      "Confirmed on Kelly’s calendar for Sunday, August 30, 2026, from 4:30 to 5:30 p.m. Central in Scott. The street address and how to join will be posted here when the host confirms them.",
    whatToExpect: [
      "4:30–5:30 p.m. Central on Sunday, August 30.",
      "Scott, Arkansas — exact site to be posted.",
    ],
    whoItsFor: "Neighbors and supporters gathering in Scott.",
    organizerNote: "Confirmed calendar hold. Venue details to be added when the host confirms them. No virtual join link on the public page.",
    attendanceType: "CAMPAIGN_APPEARANCE",
    audienceTags: ["Scott", "Pulaski County", "Central Arkansas"],
    mapCoordinates: { lat: 34.6965, lng: -92.0943 },
    relatedEventSlugs: ["chickin-n-politikin-mount-nebo-2026-08-29", "political-animals-fayetteville-2026-08-31"],
  }),
  campaignStop({
    slug: "political-animals-fayetteville-2026-08-31",
    title: "Political Animals — Fayetteville",
    type: "Community Conversation",
    region: "Northwest Arkansas",
    countySlug: "washington-county",
    startsAt: "2026-08-31T18:00:00",
    locationLabel: "Fayetteville",
    addressLine: "Fayetteville, AR (venue TBA)",
    summary: "Monday 6:00 p.m. Central Political Animals in Fayetteville. Venue to be posted.",
    audienceTags: ["Fayetteville", "Washington County", "Northwest Arkansas"],
    mapCoordinates: { lat: 36.0626, lng: -94.1574 },
    relatedEventSlugs: ["quendy-event-scott-2026-08-30"],
  }),
];

/** Public route context only — travel days are not event pages. */
export const AUGUST_2026_CAMPAIGN_ROUTE: Array<{ date: string; line: string }> = [
  { date: "Aug. 15", line: "Pocahontas → Horseshoe Bend" },
  { date: "Aug. 16", line: "Saline County → Fayetteville" },
  { date: "Aug. 17", line: "Washington County" },
  { date: "Aug. 18", line: "Fayetteville" },
  { date: "Aug. 19", line: "Little Rock · Conway Daze (tentative)" },
  { date: "Aug. 20", line: "→ Dumas" },
  { date: "Aug. 21", line: "Dumas → Rose Bud" },
  { date: "Aug. 22", line: "Searcy → McCrory" },
  { date: "Aug. 23", line: "College Day Conway (tentative)" },
  { date: "Aug. 24", line: "→ Paragould" },
  { date: "Aug. 25", line: "Paragould" },
  { date: "Aug. 26", line: "Dardanelle Chamber (morning) → Paragould / Jonesboro" },
  { date: "Aug. 27", line: "Paris" },
  { date: "Aug. 28", line: "→ Mount Nebo" },
  { date: "Aug. 29", line: "Mount Nebo" },
  { date: "Aug. 30", line: "Scott" },
  { date: "Aug. 31", line: "Fayetteville" },
];
