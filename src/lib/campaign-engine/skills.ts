/**
 * SKILL-1: Formal vocabulary for the campaign agent’s skill / ingest architecture — **types only**, no engine.
 * @see docs/agent-skill-framework.md
 * @see docs/agent-knowledge-ingest-map.md
 * @see docs/seat-aware-assignment-foundation.md
 * @see docs/compliance-governance-foundation.md — domain detail: `compliance.ts` (`ComplianceDomain`, …)
 * @see docs/campaign-policy-foundation.md — `policy.ts` (`CAMPAIGN_POLICY_V1`, …)
 * @see docs/budget-and-spend-governance-foundation.md — `budget.ts` (BUDGET-1+FIN-1)
 * @see docs/financial-ledger-foundation.md — `financial-ingest.ts` (FIN-1)
 */

export const SKILL1_PACKET = "SKILL-1" as const;

/** Major capability areas for the “digital campaign manager” (documentation alignment; not a runtime router). */
export const AgentSkillDomain = {
  CAMPAIGN_ALIGNMENT: "campaign_alignment", // vision, values, culture
  PUBLIC_VOTER_GUIDANCE: "public_voter_guidance",
  COMMUNICATIONS_MESSAGING: "communications_messaging",
  EMAIL_WORKFLOW_JUDGMENT: "email_workflow_judgment",
  FIELD_OPERATIONS: "field_operations",
  VOLUNTEER_TRAINING: "volunteer_training",
  ORCHESTRATION: "orchestration", // CM / work routing narrative
  SCHEDULING_EVENTS: "scheduling_events",
  /** COMP-1: horizontal rail + paperwork / channel / finance policy; see `compliance.ts` for `ComplianceDomain`. */
  COMPLIANCE_GOVERNANCE: "compliance_governance",
  RESEARCH_MONITORING: "research_monitoring",
  DATA_VOTER_FILE: "data_voter_file",
  COUNTY_LOCAL: "county_local",
  CONTENT_MEDIA: "content_media",
  /** FUND-1: future Fundraising Desk — donor, call time, $ goals, research (no dialer in packet). */
  FUNDRAISING_OPERATIONS: "fundraising_operations",
  /** POLICY-1: tone, disclaimer lines, mileage/reimbursement defaults — `policy.ts`; future versioned store. */
  CAMPAIGN_POLICY: "campaign_policy",
  /** BUDGET-1: cost-bearing wires, plan vs actual — `budget.ts`; no ledger in foundation packet. */
  BUDGET_GOVERNANCE: "budget_governance",
} as const;

export type AgentSkillDomainId =
  (typeof AgentSkillDomain)[keyof typeof AgentSkillDomain];

/**
 * How we know a skill is grounded in the repo (RAG, Prisma, UI, or none yet).
 * Advisory — nothing here grants autonomy.
 */
export const SkillEvidenceKind = {
  INGESTED_CORPUS: "ingested_corpus", // e.g. SearchChunk / campaign brain ingest
  REPO_CODE_OR_TYPES: "repo_code_or_types", // e.g. campaign-engine, prompts
  PRISMA_READ_MODEL: "prisma_read_model", // e.g. EmailWorkflowItem, UWR-1
  ADMIN_WORKBENCH_UI: "admin_workbench_ui",
  NOT_YET_WIRED: "not_yet_wired",
} as const;

export type SkillEvidenceKindId =
  (typeof SkillEvidenceKind)[keyof typeof SkillEvidenceKind];

export const KnowledgeIngestTier = {
  TIER_1_MUST: "tier_1_must",
  TIER_2_HIGH: "tier_2_high",
  TIER_3_SPECIALIST: "tier_3_specialist",
} as const;

export type KnowledgeIngestTierId =
  (typeof KnowledgeIngestTier)[keyof typeof KnowledgeIngestTier];

/**
 * Whether ingested content applies campaign-wide, by department, county, or person.
 * Matches ingest map; does not enforce RBAC.
 */
export const IngestScope = {
  GLOBAL: "global",
  DEPARTMENT: "department",
  COUNTY: "county",
  USER: "user",
} as const;

export type IngestScopeId = (typeof IngestScope)[keyof typeof IngestScope];
