/**
 * ALIGN-1: Campaign brain alignment — types only, no behavior.
 * @see docs/campaign-brain-alignment-foundation.md
 */

export const ALIGN1_PACKET = "ALIGN-1" as const;

/**
 * Context layering (not one giant prompt). Order is conceptual for assembly, not a runtime stack yet.
 */
export const CampaignAlignmentLayer = {
  GLOBAL: "global_campaign",
  TOUCHPOINT: "system_touchpoint",
  POSITION_WORKBENCH: "position_workbench",
  USER_PERSON: "user_person",
  CURRENT_OBJECT: "current_object",
} as const;

export type CampaignAlignmentLayerId =
  (typeof CampaignAlignmentLayer)[keyof typeof CampaignAlignmentLayer];

/** Where an alignment slice comes from (auditing + future CMS). */
export const AlignmentSourceKind = {
  PROMPTS_TS: "prompts_ts",
  RAG_SEARCH_CHUNK: "rag_search_chunk",
  CONTENT_MODULE_TS: "content_module_ts",
  DOCS_PHILOSOPHY: "docs_philosophy",
  HANDBOOK_INTERNAL_BRIEF: "handbook_internal_brief",
  CM_STRATEGY_NOTE: "cm_strategy_note",
  WORKBENCH_JOB_DEFS: "workbench_job_definitions",
  EMAIL_E2_PROVENANCE: "email_e2_provenance",
} as const;

export type AlignmentSourceKindId =
  (typeof AlignmentSourceKind)[keyof typeof AlignmentSourceKind];

/** For future: tie a prompt/ingest to a version label without implementing storage here. */
export type BrainAlignmentVersionHint = {
  sourceKind: AlignmentSourceKindId;
  label: string; // e.g. git short sha, content hash, "prompts-2026-04-23"
  recordedAt: string; // ISO
};
