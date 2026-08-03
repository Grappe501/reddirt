export type KickoffCalendarTab = "next14" | "labor" | "tour";

export type KickoffEvent = {
  id: string;
  dateLabel: string;
  city: string;
  county: string;
  title: string;
  volunteerNeed: string;
  tab: KickoffCalendarTab;
};

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
