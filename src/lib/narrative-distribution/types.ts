/**
 * Narrative Distribution Engine — canonical TypeScript types (no DB, no publishing I/O, no external APIs).
 *
 * Orchestration vocabulary for how approved narratives move across geography and channels.
 * Message Content Engine (MCE) supplies language patterns; this layer scopes reach, assignments,
 * calendar, and aggregate performance shapes.
 *
 * @see docs/NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md
 */

import type { MessageCategory, MessageGeographyScope, MessagePatternKind } from "@/lib/message-engine";

// ---------------------------------------------------------------------------
// Channels (plan §4 — NDE routing grain; not a unified send row)
// ---------------------------------------------------------------------------

export const NARRATIVE_CHANNELS = [
  "power_of_5_network",
  "blog",
  "email",
  "sms",
  "social",
  "local_events",
  "community_leaders",
  "earned_media",
  "county_pages",
  "region_dashboards",
] as const;

export type NarrativeChannel = (typeof NARRATIVE_CHANNELS)[number];

// ---------------------------------------------------------------------------
// Asset kinds (plan §6)
// ---------------------------------------------------------------------------

export const NARRATIVE_ASSET_KINDS = [
  "talking_points",
  "short_post",
  "long_form",
  "email_copy",
  "event_script",
  "volunteer_script",
  "press_note",
  "story_card",
  "county_message_packet",
] as const;

export type NarrativeAssetKind = (typeof NARRATIVE_ASSET_KINDS)[number];

// ---------------------------------------------------------------------------
// Editorial / pipeline status (plan §7 — conceptual; maps to workbench/CMS later)
// ---------------------------------------------------------------------------

export const EDITORIAL_STATUSES = [
  "draft",
  "in_review",
  "approved",
  "assigned",
  "distributing",
  "measuring",
  "closed",
  "archived",
] as const;

export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

// ---------------------------------------------------------------------------
// Geography (public-safe slugs and labels only)
// ---------------------------------------------------------------------------

export type NarrativeGeographyScope = {
  scope: MessageGeographyScope;
  stateCode?: string;
  /** Campaign region URL key when scope is region or finer. */
  regionKey?: string;
  countySlug?: string;
};

// ---------------------------------------------------------------------------
// Core records
// ---------------------------------------------------------------------------

export type NarrativeAsset = {
  id: string;
  kind: NarrativeAssetKind;
  title: string;
  summary: string;
  /** Optional linkage to MCE template ids from the starter registry. */
  linkedMessageTemplateIds?: string[];
  messageCategories?: MessageCategory[];
  geography?: NarrativeGeographyScope;
  /** When true, row is for UI scaffolds and training layouts only. */
  isDemoPlaceholder?: boolean;
};

/**
 * Frozen distribution bundle: asset ids, channel checklist, geography, rollout window (plan §5–6).
 */
export type NarrativePacket = {
  id: string;
  title: string;
  summary: string;
  /** Human label for a narrative “wave” or phase (opaque id string in live systems later). */
  waveLabel?: string;
  geography: NarrativeGeographyScope;
  channels: NarrativeChannel[];
  assetIds: string[];
  editorialStatus: EditorialStatus;
  rolloutWindowStart?: string;
  rolloutWindowEnd?: string;
  complianceNotes?: string;
  isDemoPlaceholder?: boolean;
};

export type DistributionAssignment = {
  id: string;
  narrativePacketId: string;
  /** Role or team label — not a database foreign key in this module. */
  ownerRoleLabel: string;
  geography: NarrativeGeographyScope;
  dueAt?: string;
  editorialStatus: EditorialStatus;
  notes?: string;
};

/**
 * Field-sourced signal → editorial queue (aggregate theme only; no public transcripts by default).
 */
export type StoryIntake = {
  id: string;
  recordedAt: string;
  themeSummary: string;
  geography?: NarrativeGeographyScope;
  suggestedCategories?: MessageCategory[];
  /** Future handoff to workflow intake rows when wired. */
  linkedWorkflowIntakeId?: string;
  isDemoPlaceholder?: boolean;
};

export type AmplificationQueueItem = {
  id: string;
  narrativePacketId: string;
  sortOrder: number;
  title: string;
  scriptAssetId?: string;
  scriptTemplateId?: string;
  dueAt?: string;
  channelHints?: NarrativeChannel[];
  isDemoPlaceholder?: boolean;
};

/** Aggregate channel outcomes for a packet (telemetry optional until wired). */
export type ChannelPerformance = {
  channel: NarrativeChannel;
  narrativePacketId: string;
  impressionsApprox?: number;
  opensApprox?: number;
  clicksApprox?: number;
  repliesApprox?: number;
  notes?: string;
};

export type NarrativePlanGapKind =
  | "missing_local_proof"
  | "missing_language"
  | "missing_distribution"
  | "pending_review"
  | "other";

export type RegionNarrativePlan = {
  id: string;
  regionKey: string;
  regionDisplayName: string;
  activeNarrativePacketId?: string;
  headline?: string;
  bodySummary?: string;
  gaps: NarrativePlanGapKind[];
  isDemoPlaceholder?: boolean;
};

export type CountyNarrativePlan = {
  id: string;
  countySlug: string;
  countyDisplayName: string;
  activeNarrativePacketId?: string;
  headline?: string;
  bodySummary?: string;
  gaps: NarrativePlanGapKind[];
  isDemoPlaceholder?: boolean;
};

export type NarrativeCalendarItem = {
  id: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  narrativePacketId?: string;
  dependencyHint?: string;
  geography?: NarrativeGeographyScope;
  isDemoPlaceholder?: boolean;
};

/**
 * Typed handshake between MCE templates and NDE assets/packets (ids only; no runtime merge here).
 */
export type MessageToNarrativeBridge = {
  id: string;
  messageTemplateId: string;
  narrativeAssetId: string;
  narrativePacketId?: string;
  patternKind?: MessagePatternKind;
  notes?: string;
};
