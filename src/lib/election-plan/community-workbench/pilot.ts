/** Live pilot cities — prove production before statewide rollout. */
export const COMMUNITY_PILOT_WORKBENCHES = [
  {
    slug: "sherwood",
    name: "Sherwood",
    countySlug: "pulaski",
    countyName: "Pulaski",
    context: "Sherwood model city · town hall + faith outreach pilot",
  },
  {
    slug: "jacksonville",
    name: "Jacksonville",
    countySlug: "pulaski",
    countyName: "Pulaski",
    context: "Jacksonville municipal · petition leaders + ward meetings pilot",
  },
] as const;

export type CommunityPilotSlug = (typeof COMMUNITY_PILOT_WORKBENCHES)[number]["slug"];

export const COMMUNITY_PILOT_SLUGS: CommunityPilotSlug[] = COMMUNITY_PILOT_WORKBENCHES.map((p) => p.slug);

export function isCommunityPilotSlug(slug: string): slug is CommunityPilotSlug {
  return (COMMUNITY_PILOT_SLUGS as string[]).includes(slug);
}

export function pilotWorkbenchMeta(slug: string) {
  return COMMUNITY_PILOT_WORKBENCHES.find((p) => p.slug === slug);
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
