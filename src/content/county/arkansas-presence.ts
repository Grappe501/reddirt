/** Copy for /arkansas — visibility only, no internal metrics. */

export const arkansasPresenceCopy = {
  hero: {
    eyebrow: "Across Arkansas",
    title: "County presence",
    subtitle:
      "Counties Kelly has visited and stops already on the public calendar.",
  },
  whereBeen: {
    title: "Where we've been",
    lead:
      "Counties where Kelly has already made a public campaign stop.",
    empty:
      "County visits will appear here as they are added to the calendar.",
  },
  whereGoing: {
    title: "Where we're going",
    lead: "Upcoming stops from the campaign calendar.",
    empty: "No upcoming public events are listed right now. Check the campaign calendar or invite Kelly to your community.",
    calendarHref: "/events",
  },
  invite: {
    title: "Bring Kelly to your community",
    lead: "Every county matters. Invite Kelly or share a local gathering.",
    inviteHref: "/events/request",
    scheduleHref: "/schedule",
  },
  mapLegend: {
    verified: "Visited",
    notYet: "Not yet on the calendar",
  },
  countiesPage: {
    title: "All 75 counties",
    subtitle: "Search the list for visits and upcoming events.",
    searchPlaceholder: "Search counties…",
    colCounty: "County",
    colVisited: "Visited",
    colUpcoming: "Upcoming events",
  },
} as const;
