import type { EventItem } from "@/content/types";

const TZ = "America/Chicago";
const ELECTION_DAY_YMD = "2026-11-03";
const SERIES_START_YMD = "2026-08-13";

export const FAITH_REFLECTION_SERIES_ID = "faith-reflection-zoom";
export const COLLEGE_YOUTH_SERIES_ID = "college-young-people-zoom";

export const FAITH_REFLECTION_FACEBOOK_HREF = "https://www.facebook.com/share/1DSu83938s/";
export const ARKANSAS_YOUTH_COALITION_HREF = "https://arkansasyouth.netlify.app";

const FAITH_DESCRIPTION = [
  "My faith is important to me, and I know faith is an important part of life for many others, too. I also respect that faith and reflection look different for each of us.",
  "Each Wednesday at 7:30 a.m. Central — before the rest of the day begins — we gather on Zoom for a dedicated space to connect, reflect, and pray for our country, our state, our communities, and the work we are doing together.",
  "This is an open and welcoming space for people of all faiths and traditions. Come as you are, pray in the way that is meaningful to you, or simply join us in a spirit of hope and reflection.",
  "All are welcome.",
  "Statewide / virtual — this gathering never counts as a county visit and never changes the 51/75 map.",
].join("\n\n");

/** JS weekday: 0 Sunday … 3 Wednesday … 4 Thursday. Date-only via UTC noon (no DST drift). */
function weeklyYmds(weekday: number, fromYmd: string, untilYmd: string): string[] {
  const [y, m, d] = fromYmd.split("-").map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d, 12));
  while (cursor.getUTCDay() !== weekday) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  const out: string[] = [];
  while (true) {
    const ymd = cursor.toISOString().slice(0, 10);
    if (ymd > untilYmd) break;
    out.push(ymd);
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return out;
}

function faithOccurrence(ymd: string): EventItem {
  return {
    slug: `faith-and-reflection-zoom-${ymd}`,
    title: "Faith & Reflection Zoom",
    type: "Community Conversation",
    region: "Statewide",
    status: "upcoming",
    startsAt: `${ymd}T07:30:00`,
    endsAt: `${ymd}T08:15:00`,
    timezone: TZ,
    locationLabel: "Statewide / Virtual",
    addressLine: "Online — Zoom. Join from the Facebook event link.",
    summary:
      "Every Wednesday at 7:30 a.m. Central, before the rest of the day begins. An open Zoom gathering to connect, reflect, and pray. All are welcome. Statewide / virtual — does not count as a county visit.",
    description: FAITH_DESCRIPTION,
    whatToExpect: [
      "Every Wednesday · 7:30–8:15 a.m. Central",
      "Open and welcoming — people of all faiths and traditions",
      "Join / event information on the Facebook event page",
      "Statewide / virtual — never counts as a county visit",
    ],
    whoItsFor: "Anyone who wants a weekly space for faith, reflection, and hope — come as you are.",
    organizerNote:
      "Recurring statewide virtual series through Election Day. Morning gathering — never treated as a conflict with later in-person stops. Does not qualify as a county visit.",
    rsvpHref: FAITH_REFLECTION_FACEBOOK_HREF,
    primaryHref: FAITH_REFLECTION_FACEBOOK_HREF,
    primaryCtaLabel: "Join / Event Information",
    audienceTags: ["Faith", "Statewide", "Virtual"],
    relatedEventSlugs: [],
    relatedResourceHrefs: [
      { label: "Events calendar", href: "/events" },
      { label: "Get involved", href: "/get-involved" },
    ],
    fieldAttendance: "confirmed",
    campaignTrail: true,
    statewideVirtual: true,
    qualifiesAsVisit: false,
    recurringSeriesId: FAITH_REFLECTION_SERIES_ID,
    attendanceType: "PUBLIC_OPEN",
    eventSource: "movement",
    opsFlags: { missingCounty: false, missingCoordinates: false },
  };
}

function collegeYouthOccurrence(ymd: string): EventItem {
  return {
    slug: `college-young-people-zoom-${ymd}`,
    title: "College & Young People Zoom",
    type: "Youth Civic Session",
    region: "Statewide",
    status: "upcoming",
    startsAt: `${ymd}T12:00:00`,
    endsAt: `${ymd}T23:59:00`,
    timezone: TZ,
    locationLabel: "Statewide / Virtual",
    addressLine: "Online",
    city: "Online",
    summary:
      "Every Thursday. Statewide Zoom for college students and young people. Learn more with the Arkansas Youth Coalition. Does not count as a county visit.",
    description:
      "Each Thursday, Kelly’s campaign hosts a statewide Zoom for college students and young people. This is a virtual gathering — it never paints a county on the map and never changes the 51/75 county count.\n\nLearn more and get involved through the Arkansas Youth Coalition.",
    whatToExpect: [
      "Every Thursday · Time TBA",
      "Statewide / virtual — college students and young people",
      "Learn more / get involved at the Arkansas Youth Coalition",
      "Never counts as a county visit",
    ],
    whoItsFor: "College students, young people, and anyone who wants to help build youth civic power in Arkansas.",
    organizerNote: "Recurring statewide virtual series through Election Day. Time still to be posted. Does not qualify as a county visit.",
    rsvpHref: ARKANSAS_YOUTH_COALITION_HREF,
    primaryHref: ARKANSAS_YOUTH_COALITION_HREF,
    primaryCtaLabel: "Learn more / Get involved → Arkansas Youth Coalition",
    linkCardToPrimary: true,
    audienceTags: ["Youth", "College", "youth_college", "Statewide", "Virtual"],
    relatedEventSlugs: [],
    relatedResourceHrefs: [
      { label: "Arkansas Youth Coalition", href: ARKANSAS_YOUTH_COALITION_HREF },
      { label: "Events calendar", href: "/events" },
    ],
    fieldAttendance: "confirmed",
    campaignTrail: true,
    statewideVirtual: true,
    qualifiesAsVisit: false,
    recurringSeriesId: COLLEGE_YOUTH_SERIES_ID,
    attendanceType: "PUBLIC_OPEN",
    eventSource: "movement",
    opsFlags: { timeTbd: true, missingCounty: false, missingCoordinates: false },
  };
}

/** Wednesday Faith & Reflection + Thursday College & Young People, through Election Day. */
export const recurringVirtualSeries: EventItem[] = [
  ...weeklyYmds(3, SERIES_START_YMD, ELECTION_DAY_YMD).map(faithOccurrence),
  ...weeklyYmds(4, SERIES_START_YMD, ELECTION_DAY_YMD).map(collegeYouthOccurrence),
];

/** Old September prayer-call slugs still resolve. */
export const RECURRING_VIRTUAL_SLUG_ALIASES: Record<string, string> = {
  "campaign-prayer-zoom-2026-09-09": "faith-and-reflection-zoom-2026-09-09",
  "campaign-prayer-zoom-2026-09-16": "faith-and-reflection-zoom-2026-09-16",
  "campaign-prayer-zoom-2026-09-23": "faith-and-reflection-zoom-2026-09-23",
  "campaign-prayer-zoom-2026-09-30": "faith-and-reflection-zoom-2026-09-30",
};
