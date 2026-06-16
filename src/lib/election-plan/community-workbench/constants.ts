/** Shared leadership slots — same shell, local assignments. */
export const COMMUNITY_LEADERSHIP_ROLES = [
  { key: "community_lead", label: "Community Lead" },
  { key: "deputy_lead", label: "Deputy Lead" },
  { key: "volunteer_lead", label: "Volunteer Lead" },
  { key: "events_lead", label: "Events Lead" },
  { key: "faith_lead", label: "Faith Lead" },
  { key: "business_lead", label: "Business Lead" },
  { key: "youth_lead", label: "Youth Lead" },
  { key: "data_lead", label: "Data Lead" },
] as const;

export type CommunityLeadershipRoleKey = (typeof COMMUNITY_LEADERSHIP_ROLES)[number]["key"];

export const COMMUNITY_INTEL_SECTIONS = [
  { key: "churches", label: "Major Churches / Faith" },
  { key: "employers", label: "Major Employers" },
  { key: "leaders", label: "Community Leaders" },
  { key: "schools", label: "Schools & District" },
  { key: "neighborhoods", label: "Neighborhoods" },
  { key: "political", label: "Political History" },
  { key: "elections", label: "Past Election Results" },
  { key: "civic", label: "Civic Organizations" },
] as const;

export const COMMUNITY_NOTE_TYPES = [
  { key: "lesson", label: "Lessons Learned" },
  { key: "meeting", label: "Meeting Notes" },
  { key: "volunteer", label: "Volunteer Notes" },
  { key: "aar", label: "After Action Report" },
  { key: "idea", label: "Ideas" },
] as const;

export const COMMUNITY_KPI_TEMPLATES: Record<
  string,
  { label: string; metrics: Array<{ key: string; label: string; target?: number }> }
> = {
  default_city: {
    label: "Standard city",
    metrics: [
      { key: "hci", label: "HCI conversations", target: 100 },
      { key: "volunteers", label: "Active volunteers", target: 25 },
      { key: "events", label: "Events held", target: 6 },
      { key: "leaders", label: "Leader meetings", target: 15 },
    ],
  },
  sherwood: {
    label: "Sherwood model",
    metrics: [
      { key: "hci", label: "HCI", target: 200 },
      { key: "town_hall", label: "Town hall attendance", target: 80 },
      { key: "volunteers", label: "Volunteer recruitment", target: 40 },
      { key: "faith", label: "Faith leader meetings", target: 12 },
    ],
  },
  jacksonville: {
    label: "Jacksonville",
    metrics: [
      { key: "petition_leaders", label: "Petition leaders", target: 20 },
      { key: "captains", label: "Community captains", target: 15 },
      { key: "ward_meetings", label: "Ward meetings", target: 8 },
      { key: "turnout", label: "Turnout targets met", target: 100 },
    ],
  },
  bentonville: {
    label: "Bentonville / NWA pro",
    metrics: [
      { key: "young_pro", label: "Young professional outreach", target: 50 },
      { key: "business", label: "Business meetings", target: 20 },
      { key: "chamber", label: "Chamber engagement", target: 10 },
      { key: "volunteers", label: "Volunteers", target: 30 },
    ],
  },
  campus: {
    label: "Campus program",
    metrics: [
      { key: "captains", label: "Campus captains", target: 12 },
      { key: "registrations", label: "Registrations", target: 500 },
      { key: "events", label: "Campus events", target: 8 },
      { key: "conversations", label: "Student conversations", target: 300 },
    ],
  },
  election_integrity: {
    label: "Election integrity",
    metrics: [
      { key: "town_halls", label: "Town halls", target: 10 },
      { key: "trainings", label: "Observer trainings", target: 25 },
      { key: "counties", label: "Counties active", target: 20 },
      { key: "volunteers", label: "Integrity volunteers", target: 100 },
    ],
  },
  direct_democracy: {
    label: "Direct democracy",
    metrics: [
      { key: "petitions", label: "Petition circulators", target: 50 },
      { key: "signatures", label: "Signature progress", target: 10000 },
      { key: "events", label: "Education events", target: 12 },
      { key: "coalitions", label: "Coalition partners", target: 8 },
    ],
  },
  events: {
    label: "Events / fairs",
    metrics: [
      { key: "fairs", label: "County fairs covered", target: 15 },
      { key: "booth_shifts", label: "Booth shifts filled", target: 60 },
      { key: "contacts", label: "Contacts collected", target: 500 },
      { key: "volunteers", label: "Fair volunteers", target: 40 },
    ],
  },
};

/** Per-slug KPI template overrides (content local, structure shared). */
export const COMMUNITY_KPI_SLUG_OVERRIDES: Record<string, string> = {
  sherwood: "sherwood",
  jacksonville: "jacksonville",
  bentonville: "bentonville",
  "uca-campus": "campus",
  "election-integrity": "election_integrity",
  "direct-democracy": "direct_democracy",
  "county-fair-circuit": "events",
};

export const COMMUNITY_EVENT_STATUSES = [
  { value: "idea", label: "Idea" },
  { value: "planned", label: "Planned" },
  { value: "confirmed", label: "Confirmed" },
  { value: "executed", label: "Executed" },
  { value: "aar_complete", label: "After-action complete" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export type CommunityEventStatus = (typeof COMMUNITY_EVENT_STATUSES)[number]["value"];

/** Default volunteer assignment slots for event command center. */
export const COMMUNITY_EVENT_VOLUNTEER_ROLES = [
  "Registration table",
  "AV team",
  "Greeters",
  "Media",
  "Security",
  "Food",
  "Cleanup",
] as const;

export const PROGRAM_WORKBENCHES = [
  {
    slug: "election-integrity",
    name: "Election Integrity",
    kind: "program" as const,
    kpiTemplate: "election_integrity",
    tagline: "Statewide election integrity organizing",
  },
  {
    slug: "direct-democracy",
    name: "Direct Democracy",
    kind: "program" as const,
    kpiTemplate: "direct_democracy",
    tagline: "Ballot initiative and direct democracy campaigns",
  },
  {
    slug: "uca-campus",
    name: "UCA Campus",
    kind: "campus" as const,
    countySlug: "faulkner",
    kpiTemplate: "campus",
    tagline: "University of Central Arkansas campus program",
  },
  {
    slug: "county-fair-circuit",
    name: "County Fair Circuit",
    kind: "program" as const,
    kpiTemplate: "events",
    tagline: "Fair circuit outreach and activation",
  },
];
