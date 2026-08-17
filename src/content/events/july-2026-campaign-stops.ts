import type { EventItem } from "@/content/types";

/** Completed public campaign stops for July 2026. */
export const july2026CampaignStops: EventItem[] = [
  {
    slug: "johnson-county-peach-festival-2026-07-18",
    title: "Johnson County Peach Festival and Parade",
    type: "Fairs and Festivals",
    region: "North Central Arkansas",
    countySlug: "johnson-county",
    status: "past",
    startsAt: "2026-07-18T12:00:00",
    endsAt: "2026-07-18T23:59:00",
    timezone: "America/Chicago",
    locationLabel: "Clarksville",
    city: "Clarksville",
    addressLine: "Clarksville, AR",
    summary:
      "Saturday, July 18. Kelly joined Johnson County neighbors for the Peach Festival and Parade in Clarksville.",
    description:
      "Saturday, July 18, 2026, in Clarksville. Kelly Grappe, candidate for Arkansas Secretary of State, joined Johnson County neighbors for the Peach Festival and Parade. This listing records a completed campaign stop. The next public Johnson County gathering on the calendar is the Roosevelt Dinner on September 10.",
    whatToExpect: [
      "Saturday, July 18, 2026, in Clarksville.",
      "Johnson County Peach Festival and Parade.",
      "This listing records a completed campaign stop.",
    ],
    whoItsFor: "Neighbors in Johnson County, Clarksville, and anyone looking back at where the campaign has been.",
    organizerNote: "Completed July 18, 2026. Host contact stays off the public page.",
    attendanceType: "PUBLIC_OPEN",
    audienceTags: ["Clarksville", "Johnson County", "Festival", "Parade"],
    relatedEventSlugs: ["roosevelt-dinner-2026-09-10"],
    relatedResourceHrefs: [
      { label: "Events calendar", href: "/events" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 35.4742, lng: -93.4668 },
    mapPinQuality: "region",
    fieldAttendance: "confirmed",
    campaignTrail: true,
    eventSource: "movement",
    opsFlags: {
      timeTbd: true,
      missingCounty: false,
      missingCoordinates: false,
    },
  },
];
