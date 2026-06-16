/** Live pilot workbenches — prove production before statewide rollout. */

export const COMMUNITY_PILOT_CITY_WORKBENCHES = [
  {
    slug: "jacksonville",
    name: "Jacksonville",
    countySlug: "pulaski",
    countyName: "Pulaski",
    context: "Primary city pilot · municipal / petition-leader focus · /election-plan/workbenches/jacksonville",
    isPrimaryGate: true,
  },
] as const;

/** Optional city smoke — not part of primary pilot gate. */
export const COMMUNITY_PILOT_OPTIONAL_CITY = {
  slug: "sherwood",
  name: "Sherwood",
  countySlug: "pulaski",
  countyName: "Pulaski",
  context: "Optional city workbench · 60% vote-share stretch · leadership OPEN · separate from G&G event",
  isPrimaryGate: false,
} as const;

/** Event workbench pilots — event leadership ≠ city leadership. */
export const COMMUNITY_PILOT_EVENT_WORKBENCHES = [
  {
    workbenchSlug: "sherwood",
    eventSlug: "grassroots-and-guitar-strings",
    name: "Grassroots & Guitar Strings",
    dateLabel: "Sept 17",
    context: "Primary event pilot · $20,000 profit KPI · committee + run-of-show + AAR",
    isPrimaryGate: true,
  },
] as const;

/** @deprecated — use COMMUNITY_PILOT_CITY_WORKBENCHES + optional + events */
export const COMMUNITY_PILOT_WORKBENCHES = [
  COMMUNITY_PILOT_OPTIONAL_CITY,
  ...COMMUNITY_PILOT_CITY_WORKBENCHES,
] as const;

export type CommunityPilotCitySlug = (typeof COMMUNITY_PILOT_CITY_WORKBENCHES)[number]["slug"];
export type CommunityPilotSlug = CommunityPilotCitySlug | typeof COMMUNITY_PILOT_OPTIONAL_CITY.slug;
export type CommunityPilotEventSlug = (typeof COMMUNITY_PILOT_EVENT_WORKBENCHES)[number]["eventSlug"];

export const COMMUNITY_PILOT_SLUGS: CommunityPilotSlug[] = [
  ...COMMUNITY_PILOT_CITY_WORKBENCHES.map((p) => p.slug),
  COMMUNITY_PILOT_OPTIONAL_CITY.slug,
];

export function isCommunityPilotSlug(slug: string): slug is CommunityPilotSlug {
  return (COMMUNITY_PILOT_SLUGS as string[]).includes(slug);
}

export function isPrimaryCityPilotSlug(slug: string): slug is CommunityPilotCitySlug {
  return COMMUNITY_PILOT_CITY_WORKBENCHES.some((p) => p.slug === slug);
}

export function pilotWorkbenchMeta(slug: string) {
  const city = COMMUNITY_PILOT_CITY_WORKBENCHES.find((p) => p.slug === slug);
  if (city) return city;
  if (slug === COMMUNITY_PILOT_OPTIONAL_CITY.slug) return COMMUNITY_PILOT_OPTIONAL_CITY;
  return undefined;
}

export function pilotEventMeta(eventSlug: string) {
  return COMMUNITY_PILOT_EVENT_WORKBENCHES.find((p) => p.eventSlug === eventSlug);
}

/** Required community workbench migrations for production pilot. */
export const COMMUNITY_WORKBENCH_MIGRATIONS = [
  "20260616120000_election_plan_field_entry",
  "20260616140000_community_workbench_framework",
  "20260616150000_community_workbench_event_ops",
  "20260616160000_community_workbench_pilot_defects",
  "20260616170000_community_workbench_vote_cushion",
] as const;

export const COMMUNITY_DEFECT_SEVERITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "blocker", label: "Blocker" },
] as const;

export const COMMUNITY_DEFECT_STATUSES = [
  { value: "open", label: "Open" },
  { value: "triaged", label: "Triaged" },
  { value: "fixed", label: "Fixed" },
  { value: "wontfix", label: "Won't fix" },
] as const;
