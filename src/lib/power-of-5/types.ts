/**
 * Power of 5 — canonical domain types (TypeScript only).
 *
 * No database, Prisma, or API coupling. Use these interfaces for builders, fixtures,
 * and future persistence mapping.
 *
 * @see docs/POWER_OF_5_DATA_MODEL.md
 * @see docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md
 */

// ---------------------------------------------------------------------------
// Geography (state → region → county → city → precinct)
// ---------------------------------------------------------------------------

/** US state (or territory) anchor — typically USPS code + optional FIPS. */
export type PowerGeographyState = {
  /** Two-letter USPS state code, e.g. `AR`. */
  stateCode: string;
  /** State FIPS when known (e.g. Arkansas `05`). */
  stateFips?: string;
  /** Human label for UI; not a locale key. */
  displayName?: string;
};

/**
 * Campaign / field region bucket (e.g. river-valley, northwest-arkansas).
 * Keys should stay stable for URLs and rollups; align with registry when wired.
 */
export type PowerGeographyRegion = {
  regionKey: string;
  displayName?: string;
};

/** County within a state — public-safe slug + optional FIPS. */
export type PowerGeographyCounty = {
  countySlug: string;
  /** County name for display. */
  displayName?: string;
  countyFips?: string;
};

/** Incorporated place or CDP — slug is internal stable key, not postal alone. */
export type PowerGeographyCity = {
  citySlug: string;
  displayName?: string;
  /** Optional USPS ZIP for coarse location (aggregate use; not street). */
  postalCode?: string;
};

/**
 * Election precinct / voting district — jurisdiction-specific identifier.
 * Store codes your election authority uses; never street-level PII here.
 */
export type PowerGeographyPrecinct = {
  precinctId: string;
  /** Human label (e.g. "Ward 3 — Precinct 12"). */
  displayName?: string;
};

/**
 * Full geography stack for rollups: every finer level may be null until assigned.
 * Mandatory fields: at minimum state (and usually county for Arkansas field ops).
 */
export type PowerGeographyAttachment = {
  state: PowerGeographyState;
  region: PowerGeographyRegion | null;
  county: PowerGeographyCounty | null;
  city: PowerGeographyCity | null;
  precinct: PowerGeographyPrecinct | null;
};

// ---------------------------------------------------------------------------
// Roles, pipeline, consent
// ---------------------------------------------------------------------------

/** Coarse product role; fine-grained ACL may layer on top in a future auth packet. */
export type PowerRole =
  | "member"
  | "power_team_leader"
  | "precinct_captain"
  | "city_captain"
  | "county_organizer"
  | "regional_organizer"
  | "state_admin"
  | "owner";

export type PowerNodeStatus = "invited" | "active" | "paused" | "archived";

export type PowerTeamStatus = "forming" | "complete" | "dormant" | "dissolved";

export type RelationshipEdgeKind = "invited" | "mentor" | "co_volunteer" | "household_adjacent";

export type RelationshipVisibility = "private" | "team" | "leader" | "organizer";

export type PowerInviteChannel = "email" | "sms" | "in_person" | "link";

export type PowerInviteStatus = "pending" | "accepted" | "expired" | "revoked";

export type OrganizingActivityType =
  | "conversation"
  | "door"
  | "text"
  | "phone"
  | "event_touch"
  | "training"
  | "other";

/**
 * Program pipelines (funnel identifiers). Stages hang off these in config or DB later.
 */
export type PowerPipelineId =
  | "signup"
  | "invite"
  | "activation"
  | "volunteer"
  | "event"
  | "conversation"
  | "followup"
  | "candidate"
  | "donor"
  | "petition"
  | "gotv";

/**
 * One stage within a pipeline definition or a subject's current stage snapshot.
 */
export type PipelineStage = {
  id: string;
  /** Owning pipeline. */
  pipelineId: PowerPipelineId;
  /** Sort order within the pipeline. */
  order: number;
  /** UI / report label. */
  label: string;
  /** Machine key for dashboards and rollups (snake_case recommended). */
  kpiKey: string;
  /** Optional description for organizers. */
  description?: string;
  /** Terminal stages (e.g. "voted", "opt_out") can be flagged for analytics. */
  isTerminal?: boolean;
};

export type ConsentPurpose = "relational_contact" | "voter_match" | "sms" | "email" | "analytics" | "portrait_media";

export type ConsentRecord = {
  id: string;
  /** Subject: PowerUser id, PowerNode id, or external subject key — document convention at persistence time. */
  subjectId: string;
  subjectKind: "power_user" | "power_node" | "contact";
  purpose: ConsentPurpose;
  granted: boolean;
  /** ISO 8601 timestamp when recorded or last changed. */
  recordedAt: string;
  /**
   * Policy / evidence pointer (URL, document id, or audit row ref).
   * Do not put PII in this field.
   */
  evidenceRef: string;
  /** Optional expiry for time-bound consent. */
  expiresAt?: string;
  /** Who captured consent (user id or system). */
  recordedByActorId?: string;
};

export type ImpactConfidence = "low" | "medium" | "high";

// ---------------------------------------------------------------------------
// Core graph entities
// ---------------------------------------------------------------------------

/**
 * Authenticated product identity. May link to zero or one PowerNode until onboarding completes.
 */
export type PowerUser = {
  id: string;
  /** Pseudonym or display name per surface rules. */
  displayName: string;
  role: PowerRole;
  /** When bound, fast path to graph node. */
  primaryNodeId?: string | null;
  createdAt: string;
  updatedAt?: string;
  /** Geography the user self-claims or is assigned (aggregates / badges). */
  geography?: PowerGeographyAttachment | null;
};

/**
 * Graph vertex: a person in the organizing network (may exist before full user account).
 */
export type PowerNode = {
  id: string;
  userId: string | null;
  status: PowerNodeStatus;
  teamId: string;
  /** Optional display for roster (consent-gated in UI). */
  rosterLabel?: string;
  createdAt: string;
  updatedAt?: string;
  geography?: PowerGeographyAttachment | null;
};

export type PowerTeam = {
  id: string;
  name: string;
  leaderNodeId: string;
  /** Target roster size; default cultural "five" but may be configurable per program. */
  targetSize: number;
  status: PowerTeamStatus;
  geography: PowerGeographyAttachment;
  createdAt: string;
  updatedAt?: string;
  /** Program tag (e.g. cohort, chapter). */
  cohortKey?: string;
};

export type RelationshipEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  kind: RelationshipEdgeKind;
  visibility: RelationshipVisibility;
  createdAt: string;
  /** Soft revoke without delete (audit-friendly). */
  revokedAt?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
};

export type PowerInvite = {
  id: string;
  fromNodeId: string;
  teamId: string;
  /**
   * Hashed or tokenized recipient identifier — never raw email/phone in logs or public APIs.
   */
  toContactToken: string;
  channel: PowerInviteChannel;
  status: PowerInviteStatus;
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
  acceptedNodeId?: string | null;
};

export type OrganizingActivity = {
  id: string;
  actorNodeId: string;
  type: OrganizingActivityType;
  /** Pipeline this activity advances (logical FK). */
  pipelineId: PowerPipelineId;
  /** Stage id or kpiKey at time of log — denormalized for history. */
  pipelineStageId?: string;
  createdAt: string;
  /** ISO duration or end time if bounded. */
  endedAt?: string;
  /**
   * Opaque reference to encrypted note blob or staff-only note id — not free text in public payloads.
   */
  noteEncryptedRef?: string;
  geography?: PowerGeographyAttachment | null;
};

/**
 * Modeled or heuristic projection of aggregate impact — safe for planner copy, not voter-level truth.
 */
export type ImpactProjection = {
  id: string;
  scope: PowerGeographyAttachment;
  label: string;
  /** Narrative + optional numeric hints for dashboards (aggregates only). */
  headlineMetric?: {
    value: number;
    unit: string;
    /** e.g. "modeled_coverage_delta_week" */
    metricKey: string;
  };
  modelVersion: string;
  confidence: ImpactConfidence;
  /** ISO 8601 when projection was computed. */
  computedAt: string;
  /** Subject scope: whose work this attributes (team, node, or org-wide model). */
  attributedTo?: { kind: "team" | "node" | "organizer" | "model"; id: string };
};

// ---------------------------------------------------------------------------
// Helpers (types only — no runtime validation in this module)
// ---------------------------------------------------------------------------

/** Narrow attachment: requires county and region for field rollup keys. */
export type PowerGeographyAttachmentFieldReady = PowerGeographyAttachment & {
  state: PowerGeographyState;
  region: PowerGeographyRegion;
  county: PowerGeographyCounty;
};
