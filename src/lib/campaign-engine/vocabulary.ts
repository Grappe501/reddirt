/**
 * FND-1: Shared vocabulary for the unified campaign engine.
 * String identifiers and types only—no I/O, no business logic.
 * Future foundation packets may add Zod schemas and event names here.
 */

export type FoundationPacketMarker = "FND-1";

/** Logical rail identifiers (documentation + type narrowing; not DB PKs). */
export const CampaignEngineRail = {
  INCOMING_WORK: "incoming_work",
  IDENTITY: "identity",
  ASSIGNMENT: "assignment",
  STATUS: "status",
  PROVENANCE: "provenance",
  AUTOMATION_POLICY: "automation_policy",
  RECOMMENDATION_AI: "recommendation_ai",
  GEOGRAPHY: "geography",
  CONTENT_COMMS: "content_comms",
  CALENDAR_TIMELINE: "calendar_timeline",
} as const;

export type CampaignEngineRailId =
  (typeof CampaignEngineRail)[keyof typeof CampaignEngineRail];
