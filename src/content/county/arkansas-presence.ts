/** Copy for /arkansas — visibility only, no internal metrics. */

export const arkansasPresenceCopy = {
  hero: {
    eyebrow: "Across Arkansas",
    title: "County presence",
    subtitle:
      "Is Kelly showing up around Arkansas? This page shows verified visits and published upcoming stops—nothing invented, no internal campaign intelligence.",
  },
  whereBeen: {
    title: "Where we've been",
    lead:
      "A county appears here only after a published public campaign event has occurred there. No guesswork, no internal travel logs.",
    empty:
      "No verified county visits are published yet. When approved public events conclude, they will appear here automatically.",
  },
  whereGoing: {
    title: "Where we're going",
    lead: "Upcoming stops from the public campaign calendar—published and approved only.",
    empty: "No upcoming public events are listed right now. Check the campaign calendar or invite Kelly to your community.",
    calendarHref: "/events",
  },
  invite: {
    title: "Bring Kelly to your community",
    lead: "Every county matters. Invite Kelly or share a local gathering—staff review every request.",
    inviteHref: "/events/request",
    scheduleHref: "/schedule",
  },
  mapLegend: {
    verified: "Verified visit (published event)",
    notYet: "No verified visit published yet",
  },
  countiesPage: {
    title: "All 75 counties",
    subtitle: "Search the list. Verified visits and upcoming event counts come from published calendar data only.",
    searchPlaceholder: "Search counties…",
    colCounty: "County",
    colVisited: "Verified visit",
    colUpcoming: "Upcoming events",
  },
} as const;
