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

/** Per-slug KPI template overrides (content local, structure shared). */
export const COMMUNITY_KPI_SLUG_OVERRIDES: Record<string, string> = {
  sherwood: "sherwood",
  jacksonville: "jacksonville",
  quitman: "quitman",
  bentonville: "bentonville",
  "uca-campus": "campus",
  "philander-smith-campus": "campus",
  "ualr-campus": "campus",
  "ua-fayetteville-campus": "campus",
  "arkansas-state-campus": "campus",
  "students-for-arkansas": "campus",
  "southern-arkansas": "events",
  "grassroots-guitar-strings": "events",
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
  {
    slug: "grassroots-guitar-strings",
    name: "Grassroots & Guitar Strings",
    kind: "program" as const,
    kpiTemplate: "events",
    tagline: "Signature fundraising event — Sherwood pilot",
  },
  {
    slug: "philander-smith-campus",
    name: "Philander Smith Campus",
    kind: "campus" as const,
    countySlug: "pulaski",
    kpiTemplate: "campus",
    tagline: "Philander Smith College campus program",
  },
  {
    slug: "ualr-campus",
    name: "UALR Campus",
    kind: "campus" as const,
    countySlug: "pulaski",
    kpiTemplate: "campus",
    tagline: "University of Arkansas at Little Rock campus program",
  },
  {
    slug: "ua-fayetteville-campus",
    name: "UA Fayetteville Campus",
    kind: "campus" as const,
    countySlug: "washington",
    kpiTemplate: "campus",
    tagline: "University of Arkansas Fayetteville campus program",
  },
  {
    slug: "arkansas-state-campus",
    name: "Arkansas State Campus",
    kind: "campus" as const,
    countySlug: "craighead",
    kpiTemplate: "campus",
    tagline: "Arkansas State University Jonesboro campus program",
  },
  {
    slug: "students-for-arkansas",
    name: "Students for Arkansas",
    kind: "program" as const,
    kpiTemplate: "campus",
    tagline: "Kelly Grappe Students for Arkansas — five campus co-chairs statewide",
  },
  {
    slug: "southern-arkansas",
    name: "Southern Arkansas",
    kind: "program" as const,
    kpiTemplate: "events",
    tagline: "South AR regional networking and outreach",
  },
];
