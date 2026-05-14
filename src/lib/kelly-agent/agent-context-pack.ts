/** Single-campaign brain context — merged server-side before Kelly agent calls. */

export type AgentContextPack = {
  currentDate: string;
  currentLocation?: string;
  homeBase: "Rose Bud, Arkansas";
  calendarWindow: {
    start: string;
    end: string;
    items: unknown[];
  };
  confirmedCommitments: unknown[];
  tentativeOpportunities: unknown[];
  countyFacts: unknown[];
  countyPriorities: unknown[];
  routeMatrix?: unknown;
  pastKellyTouches?: unknown[];
  mediaMatches?: unknown[];
  staffRules: string[];
  knownConstraints: string[];
};

export const KELLY_AGENT_TASKS = [
  "approve_event",
  "compare_routes",
  "plan_week",
  "plan_weekend",
  "summarize_county",
  "build_speech_context",
  "find_media",
  "recommend_local_surrogate",
  "press_release_recommendation",
  "event_coverage_plan",
  "coverage_gap_summary",
  "event_staffing_and_callout",
] as const;

export type KellyAgentTask = (typeof KELLY_AGENT_TASKS)[number];
