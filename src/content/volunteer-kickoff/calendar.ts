export type KickoffCalendarTab = "next14" | "labor" | "tour";

export type KickoffEvent = {
  id: string;
  dateLabel: string;
  city: string;
  county: string;
  title: string;
  volunteerNeed: string;
  tab: KickoffCalendarTab;
  /** Highlight on calendar and related slides */
  featured?: boolean;
  detail?: string;
};

/**
 * Featured Campaign GOTV Kickoff — public details still being finalized.
 * Confirmed for presentation: date, artist, attendance goal, Sherwood framing.
 * Venue / time / ticket links: fill in when Steve provides the next packet.
 */
export const GRASSROOTS_GUITAR_STRINGS = {
  id: "grassroots-guitar-strings",
  dateLabel: "Thursday, September 17, 2026",
  shortDate: "September 17",
  city: "Sherwood",
  county: "Pulaski",
  title: "Grassroots & Guitar Strings",
  subtitle: "Campaign Get Out the Vote Kickoff Rally",
  featuredArtist: "David Adam Byrnes",
  attendanceGoal: 500,
  volunteerNeed:
    "Event planning team · tickets & hosts · hospitality · outreach · day-of crew",
  detail:
    "Central Arkansas GOTV kickoff with live music. We have about a month to build a planning team and fill 500 seats. Venue, run-of-show, and ticket details will be published as they lock.",
  coChairs: ["John Duke", "Jay Powell"] as const,
  joinHrefTeam: "grassroots_guitar_strings",
} as const;

/** Curated public-facing stops for the kickoff meeting — not the full campaign calendar. */
export const KICKOFF_EVENTS: readonly KickoffEvent[] = [
  {
    id: "arkadelphia-youth-retreat",
    dateLabel: "This Friday",
    city: "Arkadelphia",
    county: "Clark",
    title: "Arkansas Youth Coalition Retreat",
    volunteerNeed: "Adult mentors · logistics · welcome table",
    tab: "next14",
  },
  {
    id: "hope-watermelon",
    dateLabel: "This Saturday morning",
    city: "Hope",
    county: "Hempstead",
    title: "Hope Watermelon Festival",
    volunteerNeed: "Youth Coalition table · green-shirt crew · voter conversations",
    tab: "next14",
  },
  {
    id: "clark-clinton-day",
    dateLabel: "This Saturday evening",
    city: "Arkadelphia area",
    county: "Clark",
    title: "Clark County Clinton Day Dinner",
    volunteerNeed: "Youth Coalition escorts · relationship builders",
    tab: "next14",
  },
  {
    id: "open-counties-sprint",
    dateLabel: "Through Labor Day",
    city: "Statewide",
    county: "All 75",
    title: "75-County Organization Sprint",
    volunteerNeed: "County leads · local hosts · outreach captains",
    tab: "labor",
  },
  {
    id: "labor-day-launch",
    dateLabel: "Labor Day weekend",
    city: "Priority counties",
    county: "TBD",
    title: "Operation Arkansas Launch Window",
    volunteerNeed: "Event hosts · media contacts · Strike Team scouts",
    tab: "labor",
  },
  {
    id: "festival-corridor",
    dateLabel: "September weekends",
    city: "Multiple",
    county: "Open",
    title: "Festival & Community Event Corridor",
    volunteerNeed: "Local events teams · table shifts · photo help",
    tab: "labor",
  },
  {
    id: GRASSROOTS_GUITAR_STRINGS.id,
    dateLabel: GRASSROOTS_GUITAR_STRINGS.dateLabel,
    city: GRASSROOTS_GUITAR_STRINGS.city,
    county: GRASSROOTS_GUITAR_STRINGS.county,
    title: `${GRASSROOTS_GUITAR_STRINGS.title} — GOTV Kickoff`,
    volunteerNeed: GRASSROOTS_GUITAR_STRINGS.volunteerNeed,
    tab: "tour",
    featured: true,
    detail: GRASSROOTS_GUITAR_STRINGS.detail,
  },
  {
    id: "statewide-tour",
    dateLabel: "After Labor Day",
    city: "All regions",
    county: "Rotating",
    title: "Statewide Community Tour",
    volunteerNeed: "Arrive-ahead teams · town hall setup · local partners",
    tab: "tour",
  },
  {
    id: "strike-saturdays",
    dateLabel: "Saturdays → Oct 1",
    city: "Five regions",
    county: "Priority stops",
    title: "Strike Team Saturday Deployments",
    volunteerNeed: "Travel-ready volunteers · cookout crew · canvassers",
    tab: "tour",
  },
  {
    id: "gotv-build",
    dateLabel: "Final month",
    city: "Statewide",
    county: "High-need",
    title: "GOTV Build & Election Day Ops",
    volunteerNeed: "Regional GOTV leads · ride coordination · lawful poll support",
    tab: "tour",
  },
] as const;

export const CALENDAR_TABS: readonly { id: KickoffCalendarTab; label: string }[] = [
  { id: "next14", label: "Next 14 Days" },
  { id: "labor", label: "Through Labor Day" },
  { id: "tour", label: "Statewide Tour" },
] as const;
