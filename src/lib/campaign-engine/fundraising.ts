/**
 * FUND-1: Fundraising desk / finance ops — **types and constants only**.
 * No API clients, no dialing, no texting, no auto-compliance.
 * @see docs/fundraising-desk-foundation.md
 * @see docs/contactability-and-calltime-precheck-foundation.md
 * @see docs/donor-research-and-enrichment-foundation.md
 * @see docs/fundraising-kpis-and-goals-foundation.md
 * @see docs/fundraising-agent-ingest-map.md
 */

export const FUND1_PACKET = "FUND-1" as const;

export const FundraisingWorkType = {
  PROSPECT_RESEARCH: "prospect_research",
  CALL_TIME_PREP: "call_time_prep",
  FUNDRAISING_COMMS: "fundraising_comms",
  STEWARDSHIP_FOLLOWUP: "stewardship_followup",
  GOAL_PACING: "goal_pacing",
} as const;
export type FundraisingWorkTypeId =
  (typeof FundraisingWorkType)[keyof typeof FundraisingWorkType];

/**
 * Pre-dialer contact lifecycle — conceptual; persistence in a future packet.
 * @see docs/contactability-and-calltime-precheck-foundation.md
 */
export const ContactabilityStatus = {
  RAW: "raw",
  NORMALIZED: "normalized",
  VALIDATED_FORMAT: "validated_format",
  LINE_INTELLIGENCE_REVIEW: "line_intelligence_review",
  CHANNEL_SUITABLE_VOICE: "channel_suitable_voice",
  CHANNEL_SUITABLE_SMS: "channel_suitable_sms",
  CANDIDATE_CALL_READY: "candidate_call_ready",
  QUESTIONABLE_REVIEW: "questionable_review",
  SUPPRESSED: "suppressed",
} as const;
export type ContactabilityStatusId =
  (typeof ContactabilityStatus)[keyof typeof ContactabilityStatus];

/**
 * Research / ranking **signals** (advisory) — not persisted scores in FUND-1.
 */
export const DonorResearchSignal = {
  FEDERAL_DONOR_HISTORY: "federal_donor_history",
  STATE_DONOR_HISTORY: "state_donor_history",
  RECENCY: "recency",
  REPEAT_DONOR: "repeat_donor",
  GEO_PROXIMITY: "geo_proximity",
  IN_DATABASE_RELATIONSHIP: "in_database_relationship",
  MAJOR_DONOR_TIER: "major_donor_tier",
  LAPSED_PATTERN: "lapsed_pattern",
  RISK_OPPOSITION_OVERLAP: "risk_opposition_overlap",
} as const;
export type DonorResearchSignalId =
  (typeof DonorResearchSignal)[keyof typeof DonorResearchSignal];

/**
 * **Why** a prospect ranked high — human-readable bucket for future UI, not a sole score.
 */
export const ProspectPriorityReason = {
  STRONG_MATCH_CONFIDENCE: "strong_match_confidence",
  STRATEGIC_GEO: "strategic_geo",
  RECENT_FEDERAL_GIVE: "recent_federal_give",
  STEWARDSHIP_LAPSE: "stewardship_lapse",
} as const;
export type ProspectPriorityReasonId =
  (typeof ProspectPriorityReason)[keyof typeof ProspectPriorityReason];

export const FundraisingKpiKey = {
  DOLLARS_RAISED_TO_DATE: "dollars_raised_to_date",
  PACING_TO_GOAL_PCT: "pacing_to_goal_pct",
  DIALS_ATTEMPTED: "dials_attempted",
  CONNECTS: "connects",
  ASKS_MADE: "asks_made",
  MEETINGS_BOOKED: "meetings_booked",
  CONVERSION_RATE: "conversion_rate",
  PRINCIPAL_TIME_EFFICIENCY: "principal_time_efficiency",
  CANDIDATE_READY_NUMBERS_USED: "candidate_ready_numbers_used",
} as const;
export type FundraisingKpiKeyId =
  (typeof FundraisingKpiKey)[keyof typeof FundraisingKpiKey];
