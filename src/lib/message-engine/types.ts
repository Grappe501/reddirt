/**
 * Message Content Engine — canonical TypeScript types (no DB, no auth, no voter file).
 *
 * **Privacy:** Public- and volunteer-facing helpers must not accept `VoterRecord` ids or raw
 * match reasons. Geography fields are **slugs + display labels** from approved registries or
 * staff-entered place names — not ad-hoc voter queries. Aligns with
 * `docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md` and `PowerGeographyAttachment` in
 * `@/lib/power-of-5/types` (optional embedding below).
 *
 * @see docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md
 */

import type { PowerGeographyAttachment, PowerPipelineId } from "@/lib/power-of-5/types";

// ---------------------------------------------------------------------------
// Taxonomy: pattern, category, tone, audience, relationship, geography, safety
// ---------------------------------------------------------------------------

/**
 * Fine-grained pattern kind (plan §7). Plan `CommunicationObjective` may coexist;
 * this is the MCE pattern grain.
 */
export const MESSAGE_PATTERN_KINDS = [
  "conversation_starter",
  "bridge_statement",
  "local_story",
  "follow_up",
  "event_invite",
  "volunteer_ask",
  "donor_ask",
  "petition_ask",
  "candidate_recruitment_ask",
  "gotv_ask",
  "objection_response",
  "listening_prompt",
] as const;

export type MessagePatternKind = (typeof MESSAGE_PATTERN_KINDS)[number];

/**
 * High-level buckets for routing UI and starter packs (mission: onboarding, GOTV, etc.).
 */
export const MESSAGE_CATEGORIES = [
  "power_of_5_onboarding",
  "county_organizing",
  "volunteer_recruitment",
  "listening_conversation",
  "follow_up",
  "event_invite",
  "petition_ask",
  "gotv_ask",
  "candidate_recruitment_ask",
] as const;

export type MessageCategory = (typeof MESSAGE_CATEGORIES)[number];

export const MESSAGE_TONES = [
  "warm",
  "direct",
  "curious",
  "humble",
  "celebratory",
  "urgent_respectful",
  "quiet_confidential",
] as const;

export type MessageTone = (typeof MESSAGE_TONES)[number];

/** Audience posture (plan §8) — copy posture, not hidden model scores. */
export const MESSAGE_AUDIENCES = [
  "supporter",
  "persuadable",
  "skeptical",
  "disengaged",
  "civic_leader",
  "volunteer_prospect",
  "donor_prospect",
  "candidate_prospect",
] as const;

export type MessageAudience = (typeof MESSAGE_AUDIENCES)[number];

/** Relationship context for openers and intensity (plan §9). */
export const MESSAGE_RELATIONSHIP_TYPES = [
  "family",
  "friend",
  "neighbor",
  "coworker",
  "church_community",
  "local_leader",
] as const;

export type RelationshipType = (typeof MESSAGE_RELATIONSHIP_TYPES)[number];

export const MESSAGE_GEOGRAPHY_SCOPES = ["state", "region", "county", "city", "precinct"] as const;

export type MessageGeographyScope = (typeof MESSAGE_GEOGRAPHY_SCOPES)[number];

/**
 * Governance / review tier. Volunteer-visible starters stay `public_volunteer` unless
 * counsel or finance has tagged otherwise.
 */
export const MESSAGE_SAFETY_LEVELS = [
  "public_volunteer",
  "leader_visible",
  "staff_only",
  "finance_review_required",
  "election_law_review_required",
] as const;

export type MessageSafetyLevel = (typeof MESSAGE_SAFETY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Slots, template body, full template record
// ---------------------------------------------------------------------------

export type MessageTemplateSlot = {
  key: string;
  /** What the volunteer should substitute (no PII examples required). */
  description: string;
  /** Safe illustrative example — generic place names only. */
  example?: string;
};

/**
 * Single reusable pattern with optional `{{slot_key}}` placeholders in `body`.
 */
export type MessageTemplate = {
  id: string;
  /** Semantic version for registry drift (scripts / migrations by convention). */
  version: `${number}.${number}.${number}`;
  title: string;
  /** Short nav label. */
  summary: string;
  category: MessageCategory;
  patternKind: MessagePatternKind;
  defaultTone: MessageTone;
  /** Primary audience posture this template was drafted for; others may still adapt. */
  primaryAudience: MessageAudience;
  /** Optional: relationship contexts where this tends to work well. */
  relationshipHints?: RelationshipType[];
  geographyScope: MessageGeographyScope;
  safetyLevel: MessageSafetyLevel;
  /** Main copy — human, paste-friendly; use {{slot}} for fills. */
  body: string;
  /** Optional second beat (e.g. bridge after opener). */
  bridge?: string;
  slots: MessageTemplateSlot[];
  /** Optional link to P5 pipeline ids for dashboards / missions (types only). */
  relatedPipelines?: PowerPipelineId[];
  tags?: string[];
};

// ---------------------------------------------------------------------------
// Runtime context (no voter ids on public surfaces)
// ---------------------------------------------------------------------------

/**
 * Everything optional: callers merge geography from **approved** sources only.
 * `geographyAttachment` mirrors Power of 5 spine when already validated elsewhere.
 */
/** Who may see leader-only or law-review copy in recommendation output. */
export type MessageEngineVisibilityTier = "public_volunteer" | "leader";

export type MessageContext = {
  audience?: MessageAudience;
  relationship?: RelationshipType;
  tone?: MessageTone;
  geographyScope?: MessageGeographyScope;
  /** e.g. "Pope", "River Valley" — display labels, not file keys on people. */
  countyDisplayName?: string;
  regionDisplayName?: string;
  cityDisplayName?: string;
  stateDisplayName?: string;
  geographyAttachment?: PowerGeographyAttachment | null;
  /**
   * When set, category-scoped helpers (`filterTemplatesByCategory`, mission packs) keep only
   * templates in this bucket (deterministic routing; no scoring model).
   */
  preferredCategory?: MessageCategory;
  /**
   * `public_volunteer` (default) omits templates above `public_volunteer` safety tier from ranked output.
   * `leader` includes leader-visible copy; law-review templates stay flagged in summaries, not auto-promoted.
   */
  visibilityTier?: MessageEngineVisibilityTier;
};

export type MessageRecommendation = {
  templateId: string;
  rationale: string;
  alternates?: string[];
};

/**
 * Deterministic engine output — safe for volunteer UI (no model, no voter linkage).
 */
export type RecommendedMessage = {
  templateId: string;
  title: string;
  /** Single-sentence summary of why this template surfaced. */
  rationale: string;
  /** Rule-based trace (stable ordering). */
  reasons: string[];
  /** Practical next steps after sending or practicing the script. */
  nextActions: string[];
  /** Integer score used only for sort stability (higher = stronger match). */
  score: number;
};

export type MessageRecommendationEngineResult = {
  recommendations: RecommendedMessage[];
  /** Human-readable notes when context was thin (no external inference). */
  fallbacksUsed: string[];
  /** Cross-cutting suggestions (e.g., confirm compliance, fill slots). */
  nextActions: string[];
};

// ---------------------------------------------------------------------------
// Feedback loop (plan §11) — aggregates/coaching, not shaming individuals
// ---------------------------------------------------------------------------

export const MESSAGE_RESPONSE_BUCKETS = ["positive", "mixed", "negative", "unknown"] as const;

export type MessageResponseBucket = (typeof MESSAGE_RESPONSE_BUCKETS)[number];

/**
 * Post-touch labels for the **message engine feedback loop** (relational outcomes).
 * Aggregate/coaching use only — not a public grade on a person.
 *
 * @see src/lib/message-engine/feedback.ts
 * @see docs/MESSAGE_ENGINE_FEEDBACK_LOOP_REPORT.md
 */
export const CONVERSATION_OUTCOMES = [
  "listened",
  "interested",
  "needs_follow_up",
  "wants_event",
  "wants_volunteer",
  "wants_petition",
  "wants_candidate_info",
  "not_now",
  "opposed",
  "unknown",
] as const;

export type ConversationOutcome = (typeof CONVERSATION_OUTCOMES)[number];

export type MessageFeedback = {
  templateId: string;
  responseBucket: MessageResponseBucket;
  conversationOutcome?: ConversationOutcome;
  /** Staff or self notes — avoid names/addresses in shared logs. */
  notes?: string;
  recordedAt: string;
};

export type MessageUseEventKind = "template_selected" | "template_copied" | "template_sent_preview";

export type MessageUseEvent = {
  kind: MessageUseEventKind;
  templateId: string;
  channel?: "sms" | "email" | "in_person" | "phone" | "social_dm" | "other";
  occurredAt: string;
  /** Opaque, no voter ids for public-tier telemetry. */
  metadata?: Record<string, string | number | boolean | null>;
};

// ---------------------------------------------------------------------------
// Structured snippets (objections, local story, follow-up)
// ---------------------------------------------------------------------------

export type ObjectionResponse = {
  id: string;
  /** Short label for grids (e.g. "Too busy"). */
  objectionLabel: string;
  responseBody: string;
  defaultTone?: MessageTone;
};

export type LocalStoryPrompt = {
  id: string;
  title: string;
  /** Question that elicits place-based story. */
  prompt: string;
  /** How to connect to shared civic stake without lecturing. */
  bridgeHint: string;
  geographyScope: MessageGeographyScope;
};

export type FollowUpPrompt = {
  id: string;
  title: string;
  prompt: string;
  /** e.g. "within a couple days" */
  timingHint?: string;
};
