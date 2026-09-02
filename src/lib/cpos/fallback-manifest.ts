import type { MeetingManifest } from "./schemas/meeting-manifest";

/** Minimal kickoff spine if YAML/JSON load or validation fails. */
export const FALLBACK_KICKOFF_MANIFEST: MeetingManifest = {
  id: "kickoff-2026",
  slug: "team-kickoff",
  version: 1,
  meetingType: "team_kickoff",
  title: "Kelly Grappe Campaign Team Kickoff",
  subtitle: "Building the campaign. Building the infrastructure. Building the future.",
  schedule: {
    timezone: "America/Chicago",
    meetingStart: "2026-06-28T17:59:00",
    meetingEnd: "2026-06-28T18:59:00",
    programStart: "2026-06-28T18:13:00",
  },
  join: {
    audiencePath: "/election-plan/team-kickoff",
    presenterPath: "/election-plan/team-kickoff/presenter",
    bannerCopy:
      "Follow along on your phone, tablet, or computer at /election-plan/team-kickoff",
    authPolicy: "election_plan_login",
  },
  promise: "This is the first rollout of a statewide organizing system.",
  openingDisclaimer:
    "Guided tour — stay with the meeting flow tonight. Explore freely after we close.",
  coreNumbers: [
    { key: "campaign_stop_counties", label: "Counties", value: "47" },
    { key: "cities", label: "Cities", value: "76" },
    { key: "campaign_stops", label: "Stops", value: "241" },
    { key: "miles", label: "Miles", value: "20,000+" },
    { key: "conversations", label: "Conversations", value: "15,000" },
    { key: "registration_goal", label: "Registration goal", value: "50,000" },
  ],
  chapters: [
    {
      id: "ch01_welcome",
      index: 0,
      title: "Welcome",
      segments: [{ type: "narrative", body: "Welcome — guided mode is on. Stay with the flow." }],
    },
    {
      id: "ch02_why",
      index: 1,
      title: "Why We Are Here",
      segments: [
        {
          type: "narrative",
          body: "We are building Arkansas grassroots infrastructure — not just one campaign.",
        },
      ],
    },
  ],
  demos: {},
  interactions: {},
  cues: {},
};
