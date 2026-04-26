/**
 * Community equity strategic pillars — staff/admin hub and docs.
 * Not imported into public `(site)` bundles except via explicit public pages.
 */
export const MUSLIM_TURNOUT_GOALS = {
  /** Statewide mobilization target — define measurement with data lead (universe vs. matched). */
  statewideVoterActivations: 25_000,
  /** Central Arkansas cluster — county list finalized with field. */
  centralArkansasActivations: 10_000,
} as const;

export const FAITH_VENUE_POLLING_WORKFLOW_KEY = "s4_event_faith_venue_polling_v1" as const;

export const COMMUNITY_PILLARS = [
  {
    id: "hispanic",
    label: "Hispanic / Latine",
    focus:
      "Conversational Spanish (Arkansas), NWA + LR + regional density, ethnic media, bilingual field materials.",
  },
  {
    id: "marshallese",
    label: "Marshallese",
    focus:
      "NWA center of gravity, Marshallese navigators, no generic AAPI roll-up, interpretation for any legal copy.",
  },
  {
    id: "muslim",
    label: "Muslim Arkansans",
    focus:
      "Central AR partnership + statewide coalition; 25K / 10K goals; Get Loud; registration drive; polling site at mosque (workflow).",
  },
] as const;

export const MUSLIM_ACTIVE_INITIATIVES = [
  { id: "leaders", label: "Central AR leader meetings", status: "ongoing" as const },
  { id: "reg", label: "Ongoing registration drive (partner-led)", status: "ongoing" as const },
  { id: "getloud", label: "Get Loud introduced in community", status: "ongoing" as const },
  { id: "mosque_poll", label: "Polling place at a Central AR mosque", status: "in_progress" as const },
] as const;
