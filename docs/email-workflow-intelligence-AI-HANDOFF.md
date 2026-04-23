# Email Workflow Intelligence — AI / collaborator handoff

**Purpose:** Bring a new chat thread, teammate, or automation up to speed in **one read**. This document describes the **vision**, the **RedDirt** context, what **Packet E-1** delivered, what is **explicitly not built yet**, and where the code lives.

**How to use:** Paste this file’s path into a new AI thread, or say: *“Read `@docs/email-workflow-intelligence-AI-HANDOFF.md` and continue from there.”*

**Related system architecture (Packet SYS-1+ / CM-1+):** [`workbench-build-map.md`](./workbench-build-map.md) · [`public-site-system-map.md`](./public-site-system-map.md) · [`system-domain-flow-map.md`](./system-domain-flow-map.md) · [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) · [`incoming-work-matrix.md`](./incoming-work-matrix.md) · **Foundation (FND-1):** [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · `src/lib/campaign-engine/` · **AI brain (BRAIN-1):** [`ai-agent-brain-map.md`](./ai-agent-brain-map.md) · [`ai-integration-matrix.md`](./ai-integration-matrix.md) · `ai-brain.ts`, `ai-context.ts` · **Alignment + overrides (ALIGN-1):** [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) · [`automation-override-and-impact-foundation.md`](./automation-override-and-impact-foundation.md) · [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) · `alignment.ts`, `overrides.ts`, `user-context.ts` · **Positions (ROLE-1):** [`position-system-foundation.md`](./position-system-foundation.md) · [`workbench-job-definitions.md`](./workbench-job-definitions.md) · [`position-hierarchy-map.md`](./position-hierarchy-map.md) · `src/lib/campaign-engine/positions.ts` · **Talent / training (TALENT-1):** [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) · [`position-development-matrix.md`](./position-development-matrix.md) · [`talent-recommendation-flow.md`](./talent-recommendation-flow.md) · `src/lib/campaign-engine/talent.ts`, `training.ts` · **Assignment + position inbox (ASSIGN-1):** [`assignment-rail-foundation.md`](./assignment-rail-foundation.md) · [`position-inbox-foundation.md`](./position-inbox-foundation.md) · [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) · `assignment.ts`, `open-work.ts` · **Unified incoming work read (UWR-1):** [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md) — `getOpenWorkForCampaignManager` / `getOpenWorkForUser` in `open-work.ts` · `UnifiedOpenWorkSection` on `/admin/workbench` · **Position workbenches (WB-CORE-1):** [`position-workbench-foundation.md`](./position-workbench-foundation.md) · `position-inbox.ts` · `personalized-workbench.ts` (types) · `/admin/workbench/positions/*`

---

## 1. What RedDirt is

- **Product:** “Red Dirt Democrats” public site + **admin/campaign operator tools** — Next.js App Router, Prisma, PostgreSQL, optional OpenAI/RAG, forms, content, organizing rails.
- **Repo entry:** `RedDirt/` (package `reddirt-site`). Local dev: `npm run dev:full` (Docker Postgres + Prisma + Next). See root `README.md`.
- **Quality bar:** `npm run check` (lint + `tsc --noEmit` + build) before significant pushes.

This is a **real campaign-ops codebase**: comms workbench, sends, threads, workflow intake, tasks, social/conversation monitoring, etc. New work should stay **additive** and **campaign-safe** unless a blueprint explicitly widens scope.

---

## 2. Vision: “Email Workflow Intelligence Engine”

**North star:** Campaign email situations (inbound, follow-ups, triggers, monitoring hits) should become **structured, reviewable queue items** with enough **context** that an operator can triage **without opening raw message bodies first** — then (in later packets) policy, AI assist, and execution can attach to that foundation.

**Design principles (carried through E-1 and expected in follow-ons):**

| Principle | Meaning |
|-----------|--------|
| **Queue-first** | By default, work lands in a queue for human review. |
| **Campaign-safe** | Boundaries stay local to campaign/comms context; no silent global cross-campaign behavior. |
| **Context-rich** | Store explicit who/what/when/where/why/impact/recommended response (+ rationale), not only blobs. |
| **Additive** | Do not replace Comms Workbench, CRM, or Workflow Intake — **link** to them. |
| **Explicit spam/escalation** | Fields exist for disposition, escalation, de-escalation flags; **automation deferred** until dedicated packets. |

**Packet naming (blueprint):** **E-1** = foundation (this doc’s “done” scope). **E-2+** = AI summarization, enrichment, policy/routing — still **no blind auto-send** until explicitly designed.

---

## 3. What already existed before E-1 (context, not replaced)

E-1 **does not** replace these; it **connects optionally** via foreign keys:

- **Comms Workbench:** `CommunicationPlan`, drafts, variants, **`CommunicationSend`**, recipients, engagement-oriented models.
- **Threads & messages:** `CommunicationThread`, `CommunicationMessage`.
- **Workflow / tasks:** `WorkflowIntake`, `CampaignTask`.
- **Conversation / social:** `ConversationOpportunity`, `SocialContentItem`, conversation monitoring queries (separate feature area).
- **People:** `User`, `VolunteerProfile`, audience segments (`CommsPlanAudienceSegment`).

The new layer is **`EmailWorkflowItem`**: a **first-class queue row** that can point at zero or more of the above.

---

## 4. Packet E-1 — what was built (complete for this packet)

### 4.1 Database (Prisma)

- **Enums:** `EmailWorkflowStatus`, `EmailWorkflowPriority`, `EmailWorkflowSourceType`, `EmailWorkflowTriggerType`, `EmailWorkflowIntent`, `EmailWorkflowTone`, `EmailWorkflowEscalationLevel`, `EmailWorkflowSpamDisposition`.
- **Model:** `EmailWorkflowItem` with:
  - **Queue & triage:** `status` (default `NEW`), `priority`, `sourceType`, `triggerType`, `title`, `queueReason`.
  - **Operator summaries:** `whoSummary`, `whatSummary`, `whenSummary`, `whereSummary`, `whySummary`, `impactSummary`, `recommendedResponseSummary`, `recommendedResponseRationale`.
  - **Placeholders:** `sentiment`, `tone`, `intent`, `escalationLevel`, `spamDisposition`, `spamScore`, `needsDeescalation`, `occurredAt` (sortable time vs human `whenSummary`).
  - **Optional links:** `userId` (contact), `volunteerProfileId`, `communicationThreadId`, `communicationPlanId`, `communicationSendId` (relation name **`EmailWorkflowItemSend`** on both sides), `workflowIntakeId`, `campaignTaskId`, `conversationOpportunityId`, `socialContentItemId`, `comsPlanAudienceSegmentId`, `communicationMessageId`.
  - **People on the case:** `assignedToUserId`, `createdByUserId`, `reviewedByUserId`, `reviewedAt`.
  - **Extensibility:** `metadataJson` (default `{}`).

- **Migration file:** `prisma/migrations/20260504120000_email_workflow_e1/migration.sql`  
  Apply when DB is available: `npx prisma migrate deploy` (or `migrate dev` in local dev).

### 4.2 TypeScript layer

Path: `src/lib/email-workflow/`

| File | Role |
|------|------|
| `types.ts` | `EmailWorkflowListFilters` (status, priority, source, assignee, escalation, spam). |
| `dto.ts` | `EmailWorkflowListItem`, `EmailWorkflowItemDetail` — operator-oriented shapes; `CommunicationUserSummary` uses `nameLabel` (not `name`). |
| `mappers.ts` | DB rows → DTOs; list vs detail row types. |
| `queries.ts` | `listEmailWorkflowItems`, `getEmailWorkflowItemDetail` (Prisma `include` for linked summaries). |

### 4.3 Admin UI (read-oriented + one manual create)

- **List:** `src/app/admin/(board)/workbench/email-queue/page.tsx`  
  Route: **`/admin/workbench/email-queue`** (protected by admin board layout / `requireAdminPage`).
- **Detail:** `src/app/admin/(board)/workbench/email-queue/[id]/page.tsx`
- **Manual create:** `src/components/admin/workbench/CreateEmailWorkflowItemForm.tsx` +  
  `src/app/admin/email-workflow-actions.ts` → `createEmailWorkflowItemManualAction`  
  (queue-first; attributes `createdBy` from `getAdminActorUserId()` when `ADMIN_ACTOR_USER_EMAIL` resolves).
- **Workbench nav:** `src/app/admin/(board)/workbench/page.tsx` — link **“Email workflow”** to the queue.

### 4.4 Policy encoded in E-1 (must stay true until product changes it)

- **Every new item** is a queue row; **default status `NEW`**. There is **no** auto-approval, **no** auto-send, **no** AI reply generation in this packet.
- UI copy and schema comments reinforce **review-first** behavior.
- `READY_TO_RESPOND` / `APPROVED` exist as **status enum values** for future workflow; E-1 does not implement transitions or sending from them.

---

## 5. What is explicitly NOT in E-1 (do not assume it exists)

- Auto-send, provider execution, or queue-driven **SendGrid/Twilio** actions.
- AI drafting, auto-summarization, or classifiers writing to these fields in production paths.
- Spam automation, de-escalation automation, or policy-based “bypass approval.”
- Inbox sync / new email ingestion (unless pre-existing elsewhere).
- Global campaign-manager queue, complex assignment rules, retry/DLQ for this queue.
- Reply generation UI or “approve and send” from `EmailWorkflowItem`.

If a feature looks related, **check the file list above**; if it’s not listed, treat it as **not shipped**.

---

## 6. Likely follow-ups (E-2 and beyond — not implemented here)

- **AI / interpretation:** Populate summary fields and `metadataJson` from thread/message context; keep fields editable.
- **Detail enrichment:** Safer display of linked plan/thread/send names; optional non-body metadata.
- **Policy & routing:** Status transitions, assignment hints, and eventually **defined** no-approval paths (product decision) — still **sending** is a separate, explicit design step.
- **Triggers:** Create `EmailWorkflowItem` from conversation monitoring, thread events, or send failures — one integration at a time.

---

## 7. Commands reference

```bash
cd RedDirt   # or h:\SOSWebsite\RedDirt on Windows
npx prisma generate
npx tsc --noEmit
npx prisma migrate deploy   # when database is up
```

---

## 8. JSON snapshot (for tools / RAG / copy-paste)

```json
{
  "doc": "email-workflow-intelligence-AI-HANDOFF",
  "version": 1,
  "project": {
    "name": "reddirt-site",
    "path": "RedDirt",
    "stack": ["Next.js App Router", "Prisma", "PostgreSQL", "TypeScript"]
  },
  "vision": {
    "name": "Email Workflow Intelligence Engine",
    "principles": ["queue-first", "campaign-safe", "context-rich", "additive", "explicit-spam-escalation-placeholders"]
  },
  "packet_e1": {
    "status": "foundation_complete",
    "model": "EmailWorkflowItem",
    "prisma_section_comment": "Email Workflow Intelligence (E-1+): campaign email ops queue; queue-first, no auto-send/approval in E-1",
    "migration": "prisma/migrations/20260504120000_email_workflow_e1/migration.sql",
    "lib": {
      "root": "src/lib/email-workflow",
      "files": ["types.ts", "dto.ts", "mappers.ts", "queries.ts"]
    },
    "admin_routes": {
      "list": "/admin/workbench/email-queue",
      "detail": "/admin/workbench/email-queue/[id]"
    },
    "actions": ["src/app/admin/email-workflow-actions.ts:createEmailWorkflowItemManualAction"],
    "ui_components": ["src/components/admin/workbench/CreateEmailWorkflowItemForm.tsx"],
    "send_relation_name": "EmailWorkflowItemSend"
  },
  "out_of_scope_e1": [
    "auto_send",
    "ai_composition",
    "spam_deescalation_automation",
    "inbox_ingestion",
    "reply_generation",
    "approval_bypass_policy"
  ],
  "packet_e2a": {
    "status": "scaffolding_complete",
    "intelligence_module": "src/lib/email-workflow/intelligence",
    "engine_id": "heuristic-e2a-v1",
    "enriched_status": "EmailWorkflowStatus.ENRICHED",
    "provenance_path": "metadataJson.emailWorkflowInterpretation",
    "forward_hooks": "metadataJson.emailWorkflowInterpretation.forwardHooks",
    "out_of_scope": ["llm", "auto_run_on_create", "send", "auto_approval"]
  },
  "packet_e2b": {
    "status": "queue_hardening_and_build_map",
    "writeback": "per-field triage defaults + provenance overwritten/preserved lists",
    "preview": "src/lib/email-workflow/intelligence/preview-helpers.ts",
    "ui": "WorkbenchPill, EmailWorkflowInterpretationProvenancePanel",
    "planning_doc": "docs/workbench-build-map.md"
  },
  "packet_sys1": {
    "status": "documentation_only",
    "docs": [
      "docs/public-site-system-map.md",
      "docs/system-domain-flow-map.md"
    ],
    "cross_links": "docs/README.md, docs/workbench-build-map.md, this handoff"
  },
  "packet_cm1": {
    "status": "documentation_plus_workbench_comment",
    "docs": [
      "docs/campaign-manager-orchestration-map.md",
      "docs/incoming-work-matrix.md"
    ],
    "de_facto_cm_hub": "src/app/admin/(board)/workbench/page.tsx",
    "not_built": ["rbac", "unified_incoming_table", "campaign_manager_route"]
  },
  "packet_fnd1": {
    "status": "documentation_plus_vocabulary_seam",
    "docs": [
      "docs/unified-campaign-engine-foundation.md",
      "docs/shared-rails-matrix.md"
    ],
    "code": [
      "src/lib/campaign-engine/README.md",
      "src/lib/campaign-engine/vocabulary.ts"
    ],
    "not_built": [
      "unified_incoming_work_table",
      "rbac",
      "automation_actions",
      "workbench_redesign",
      "mega_abstraction"
    ],
    "direction": "unified_campaign_operating_system_from_foundation; existing workbenches are inputs to rails, not the final architecture"
  },
  "packet_role1": {
    "status": "documentation_plus_positions_seam",
    "docs": [
      "docs/position-system-foundation.md",
      "docs/workbench-job-definitions.md",
      "docs/position-hierarchy-map.md"
    ],
    "code": [
      "src/lib/campaign-engine/positions.ts",
      "src/lib/campaign-engine/README.md (updated)"
    ],
    "not_built": [
      "user_position_assignment",
      "rbac",
      "position_inbox_ui",
      "auto_routing_by_position",
      "prisma_position_model"
    ],
    "direction": "hierarchical_operating_model; people_assigned_to_positions; roll_up_unfilled; CM_orchestrates; same_rails_independent_of_headcount"
  },
  "packet_talent1": {
    "status": "documentation_plus_talent_types",
    "docs": [
      "docs/talent-intelligence-foundation.md",
      "docs/position-development-matrix.md",
      "docs/talent-recommendation-flow.md"
    ],
    "code": [
      "src/lib/campaign-engine/talent.ts",
      "src/lib/campaign-engine/training.ts",
      "src/lib/campaign-engine/README.md (updated)"
    ],
    "not_built": [
      "scoring_engine",
      "auto_promotion",
      "ranking",
      "talent_permissions",
      "observation_ingestion",
      "lms",
      "workbench_ui_for_talent"
    ],
    "direction": "advisory_talent_rail; AI_evaluates_recommends_trains_humans_decide; same_provenance_ethic_as_email_workflow_E2; unfilled_seats_plus_automation_humans_augment"
  },
  "packet_brain1": {
    "status": "documentation_plus_brain_vocabulary",
    "docs": [
      "docs/ai-agent-brain-map.md",
      "docs/ai-integration-matrix.md"
    ],
    "code": [
      "src/lib/campaign-engine/ai-brain.ts",
      "src/lib/campaign-engine/ai-context.ts"
    ],
    "brain_core_paths": [
      "src/lib/openai/",
      "src/lib/assistant/",
      "src/lib/comms/ai.ts",
      "src/lib/email-workflow/intelligence/"
    ],
    "not_built": [
      "unified_orchestrator_class",
      "auto_send_from_ai",
      "auto_role_or_trust",
      "hidden_people_scoring"
    ],
    "direction": "digital_CM_brain_is_openai_plus_rag_plus_assistant_plus_comms_thread_ai_plus_heuristic_email_slot_E3_hooks; not_side_chat"
  },
  "packet_align1": {
    "status": "documentation_plus_vocabulary",
    "docs": [
      "docs/campaign-brain-alignment-foundation.md",
      "docs/automation-override-and-impact-foundation.md",
      "docs/user-scoped-ai-context-foundation.md"
    ],
    "code": [
      "src/lib/campaign-engine/alignment.ts",
      "src/lib/campaign-engine/overrides.ts",
      "src/lib/campaign-engine/user-context.ts"
    ],
    "not_built": [
      "rbac",
      "override_persistence",
      "hidden_scoring",
      "auto_tuning",
      "auto_authority"
    ],
    "direction": "governed_alignment_inputs_layered_context_override_as_learning_signal_user_scoped_interaction_planned; queue_first_unchanged"
  },
  "packet_assign1": {
    "status": "documentation_plus_vocabulary_plus_light_counts",
    "docs": [
      "docs/assignment-rail-foundation.md",
      "docs/position-inbox-foundation.md",
      "docs/unified-open-work-foundation.md"
    ],
    "code": [
      "src/lib/campaign-engine/assignment.ts",
      "src/lib/campaign-engine/open-work.ts"
    ],
    "not_built": [
      "position_id_columns_on_work_objects",
      "auto_routing",
      "unified_list_ui",
      "merged_inbox_page"
    ],
    "direction": "assignment_rail_and_open_work_read_model; CM_inbox_narrative; getOpenWorkCountsBySource_for_health_only; org_seat_metadata_is_packet_seat1"
  },
  "packet_uwr1": {
    "status": "read_model_plus_workbench_block",
    "docs": [
      "docs/unified-incoming-work-read-model.md",
      "docs/unified-open-work-foundation.md (updated)"
    ],
    "code": [
      "src/lib/campaign-engine/open-work.ts",
      "src/lib/campaign-engine/assignment.ts",
      "src/components/admin/workbench/UnifiedOpenWorkSection.tsx",
      "src/app/admin/(board)/workbench/page.tsx"
    ],
    "v1_sources": ["EmailWorkflowItem", "WorkflowIntake", "CampaignTask"],
    "not_built": [
      "master_unified_work_table",
      "CommunicationThread_in_merged_list",
      "position_id_writes",
      "routing_automation",
      "full_inbox_page"
    ],
    "direction": "merged_queries_in_memory; CM_triage_on_workbench; queue_first_unchanged"
  },
  "packet_wb_core1": {
    "status": "read_position_inbox_plus_pages",
    "docs": [
      "docs/position-workbench-foundation.md",
      "docs/position-inbox-foundation.md (context)"
    ],
    "code": [
      "src/lib/campaign-engine/position-inbox.ts",
      "src/lib/campaign-engine/personalized-workbench.ts",
      "src/lib/campaign-engine/open-work.ts (getOpenWorkForPosition alias)",
      "src/app/admin/(board)/workbench/positions/page.tsx",
      "src/app/admin/(board)/workbench/positions/[positionId]/page.tsx"
    ],
    "not_built": [
      "rbac",
      "routing",
      "ai_re_rank",
      "true_personalization_beyond_seat_metadata"
    ],
    "direction": "heuristic_inbox_by_position_on_top_of_UWR1; read_only; links_to_existing; see_packet_seat1_for_seat_rows"
  },
  "packet_seat1": {
    "status": "position_seat_persistence_plus_coverage_page",
    "docs": [
      "docs/position-seating-foundation.md",
      "docs/delegation-and-coverage-foundation.md"
    ],
    "persistence": "PositionSeat_PositionSeatStatus_prisma_migration_20260504140000_seat1_position_seat",
    "code": [
      "prisma/schema.prisma",
      "src/lib/campaign-engine/seating.ts",
      "src/lib/campaign-engine/positions.ts (isValidPositionId_ALL_POSITION_IDS)",
      "src/app/admin/(board)/workbench/seats/page.tsx",
      "src/app/admin/(board)/workbench/seats/actions.ts",
      "src/app/admin/(board)/workbench/positions/[positionId]/page.tsx (seat_banner)",
      "src/app/admin/(board)/workbench/page.tsx (Seats_link)"
    ],
    "not_built": [
      "rbac",
      "auto_routing_on_seat_change",
      "uwr1_positionid_columns",
      "workload_sla_in_db",
      "ai_staffing"
    ],
    "direction": "staffing_metadata_only; optional_assign_on_admin_seats"
  },
  "packet_skill1_assign2": {
    "status": "read_seat_aware_assignment_plus_agent_ingest_architecture",
    "docs": [
      "docs/seat-aware-assignment-foundation.md",
      "docs/agent-skill-framework.md",
      "docs/agent-knowledge-ingest-map.md"
    ],
    "code": [
      "src/lib/campaign-engine/assignment.ts (SeatAssignmentContext, SeatInboxWorkAlignment, ASSIGN2_PACKET)",
      "src/lib/campaign-engine/open-work.ts (getOpenWorkForSeat, getOpenWorkForSeatOccupant, getSeatInboxWorkAlignment, getSeatAssignmentContext re-export)",
      "src/lib/campaign-engine/seating.ts (getSeatAssignmentContext)",
      "src/lib/campaign-engine/skills.ts (AgentSkillDomain, tiers, scope — types only)",
      "src/app/admin/(board)/workbench/positions/[positionId]/page.tsx (ASSIGN-2 alignment UI)"
    ],
    "not_built": [
      "auto_reassign",
      "rbac",
      "positionId_on_uwr1_rows",
      "model_routing",
      "rag_ingest_execution_in_this_packet"
    ],
    "direction": "read_only_alignment_slice_vs_occupant; formal_ingest_checklist; skill_domains_table"
  },
  "packet_comp1": {
    "status": "compliance_governance_rail_foundation_ingest_paperwork",
    "docs": [
      "docs/compliance-governance-foundation.md",
      "docs/compliance-paperwork-simplification-foundation.md",
      "docs/compliance-skill-framework.md",
      "docs/compliance-agent-ingest-map.md"
    ],
    "code": [
      "src/lib/campaign-engine/compliance.ts (types only)",
      "src/lib/campaign-engine/skills.ts (COMPLIANCE_GOVERNANCE + COMP-1 note)"
    ],
    "not_built": [
      "compliance_workbench_ui",
      "filing_automation",
      "bank_or_agency_api",
      "ar_sos_form_json_in_repo",
      "ai_compliance_certification_badge"
    ],
    "direction": "COMP-2 exception surfaces and narrow schema if needed; ingest official forms with counsel"
  },
  "packet_policy1_comp2_budget1": {
    "status": "policy_defaults_compliance_upload_spend_foundation",
    "docs": [
      "docs/campaign-policy-foundation.md",
      "docs/compliance-document-ingest-foundation.md",
      "docs/budget-and-spend-governance-foundation.md",
      "docs/budget-agent-ingest-map.md",
      "docs/federal-state-coordination-foundation.md"
    ],
    "code": [
      "src/lib/campaign-engine/policy.ts (CAMPAIGN_POLICY_V1, POLICY-1)",
      "src/lib/campaign-engine/budget.ts (BUDGET-1)",
      "src/lib/campaign-engine/compliance-documents.ts (COMP-2 labels)",
      "src/lib/campaign-engine/skills.ts (CAMPAIGN_POLICY, BUDGET_GOVERNANCE)",
      "prisma/schema.prisma + migration 20260509120000_comp2_compliance_document",
      "src/app/admin/compliance-documents-actions.ts",
      "src/app/api/compliance-documents/[id]/file/route.ts",
      "src/app/admin/(board)/compliance-documents/page.tsx",
      "src/components/layout/CampaignPaidForBar.tsx (disclaimer from policy)"
    ],
    "not_built": [
      "full_budget_workbench",
      "bank_or_ad_platform_integrations",
      "rag_index_on_compliance_uploads",
      "legal_rules_engine",
      "auto_compliance_badge"
    ],
    "direction": "versioned policy store later; BUDGET-2+ ledger; COMP-2b RAG for approved documents"
  },
  "packet_fin1": {
    "status": "financial_ledger_foundation_submission_seams_budget_wiring",
    "docs": [
      "docs/financial-ledger-foundation.md",
      "docs/submission-to-ledger-bridge.md"
    ],
    "code": [
      "prisma/schema.prisma (FinancialTransaction + enums; migration 20260510120000_fin1_financial_transaction)",
      "src/lib/campaign-engine/budget.ts (DEFAULT_LEDGER_CATEGORY_TO_WIRE, getBudgetWireForTransaction)",
      "src/lib/campaign-engine/financial-ingest.ts (isFinancialSubmission, extractDraftTransactionsFromSubmission)",
      "src/app/admin/(board)/financial-transactions/page.tsx (read-only list)"
    ],
    "not_built": [
      "finance_dashboard",
      "reporting_ui",
      "bank_fec_sos_sync",
      "auto_ledger_from_all_submissions",
      "nlp_amount_parsing"
    ],
    "direction": "FIN-2 landed (confirm + CONTRIBUTION; import/reconciliation still future)"
  },
  "packet_fin2_field1_youth1": {
    "status": "ledger_confirm_contribution_field_units_youth_types",
    "docs": [
      "docs/financial-ledger-foundation.md (FIN-2 section)",
      "docs/field-structure-foundation.md",
      "docs/youth-pipeline-foundation.md",
      "docs/youth-agent-ingest-map.md"
    ],
    "code": [
      "prisma/schema.prisma + migration 20260512120000_fin2_field1_youth1_foundation",
      "src/lib/campaign-engine/financial-ledger.ts",
      "src/lib/campaign-engine/field.ts",
      "src/lib/campaign-engine/youth.ts",
      "src/lib/campaign-engine/budget-queries.ts (CONTRIBUTION excluded from actuals)",
      "src/app/admin/financial-transaction-actions.ts",
      "src/app/admin/(board)/financial-transactions/page.tsx (minimal create + confirm)"
    ],
    "not_built": [
      "full_finance_workbench",
      "bank_fec_sos_reconciliation",
      "gis_districts",
      "county_to_fieldunit_sync",
      "youth_lms_or_routing"
    ],
    "direction": "FIELD-2 optional County FK; YOUTH-2 position ids + consent ops; FIN-3 import from submissions with review"
  },
  "packet_budget2": {
    "status": "budget_structure_plan_vs_actual_foundation",
    "docs": [
      "docs/budget-structure-foundation.md",
      "docs/budget-and-spend-governance-foundation.md (updated)"
    ],
    "code": [
      "prisma/schema.prisma (BudgetPlan, BudgetLine, BudgetPlanStatus; migration 20260511120000_budget2_budget_plan_line)",
      "src/lib/campaign-engine/budget.ts (BUDGET2_PACKET, wire helpers)",
      "src/lib/campaign-engine/budget-queries.ts (actuals + variance)",
      "src/lib/campaign-engine/policy.ts (SpendApprovalTier, spendBudget on CAMPAIGN_POLICY_V1)",
      "src/app/admin/(board)/budgets/ (list + detail + budget-actions.ts)"
    ],
    "not_built": [
      "commitment_encumbrance_persistence",
      "forecasting_engine",
      "per_line_split_when_shared_wire",
      "bank_or_vendor_sync",
      "filing_or_report_automation",
      "status_enforced_edit_guards"
    ],
    "direction": "BUDGET-3: advisory alerts, optional commitments, tighter event-level attribution when ledger links exist"
  },
  "packet_dbmap1_launch1": {
    "status": "full_prisma_inventory_plus_launch_reengagement_foundation",
    "docs": [
      "docs/database-table-inventory.md",
      "docs/launch-reengagement-foundation.md",
      "docs/launch-segmentation-and-response-foundation.md"
    ],
    "code": [
      "scripts/print-prisma-inventory.mjs",
      "src/lib/campaign-engine/launch.ts (types + countLaunchAudienceByKind, listLaunchReadySupporters — read-only)"
    ],
    "not_built": [
      "marketing_automation",
      "launch_status_column",
      "auto_segment_ml",
      "unified_send_engine"
    ],
    "direction": "LAUNCH-2: optional runbook metadata; consent audit checklist; one chosen send path per wave documented in admin"
  },
  "packet_geo1": {
    "status": "county_and_media_geographic_mapping_foundation",
    "docs": [
      "docs/geographic-county-mapping.md",
      "docs/county-media-mapping.md",
      "docs/geographic-unification-foundation.md",
      "docs/county-dashboard-foundation.md"
    ],
    "code": [],
    "not_built": [
      "prisma_migrations",
      "fieldunit_to_county_fk",
      "unified_countydashboard_sql_view",
      "precinct_master_table"
    ],
    "direction": "GEO-2: optional FieldUnit↔County mapping table or app service; backfill owned media countyId; document segment JSON schema for county; read-only county dashboard prototype using joins"
  },
  "packet_data1_comms_unify1_identity1": {
    "status": "documentation_targeting_comms_map_identity_volunteer_gaps",
    "docs": [
      "docs/data-targeting-foundation.md",
      "docs/communications-unification-foundation.md",
      "docs/message-workbench-analysis.md",
      "docs/identity-and-voter-link-foundation.md",
      "docs/volunteer-data-gap-analysis.md"
    ],
    "code": [],
    "not_built": [
      "unified_message_persistence",
      "persuasion_turnout_universe_in_prisma",
      "precinct_geometry",
      "single_send_engine_merge"
    ],
    "direction": "DATA-2 optional targeting contract; COMMS-UNIFY-2 cross-surface campaignMessageKey; IDENTITY-2 public voter portal auth (if product)"
  },
  "packet_fund1": {
    "status": "blueprint_fundraising_desk_ingest_contactability",
    "docs": [
      "docs/fundraising-desk-foundation.md",
      "docs/contactability-and-calltime-precheck-foundation.md",
      "docs/donor-research-and-enrichment-foundation.md",
      "docs/fundraising-kpis-and-goals-foundation.md",
      "docs/fundraising-agent-ingest-map.md"
    ],
    "code": [
      "src/lib/campaign-engine/fundraising.ts (types and constants only)",
      "src/lib/campaign-engine/skills.ts (AgentSkillDomain.FUNDRAISING_OPERATIONS)"
    ],
    "not_built": [
      "dialer",
      "mass_sms",
      "live_fec_ingest",
      "admin_fundraising_route",
      "phone_vendor_integration"
    ],
    "direction": "FUND-2+ for persistence, desk UI, and optional vendor / OpenFEC"
  },
  "conventions": {
    "user_summary_field": "CommunicationUserSummary.nameLabel (not .name)"
  }
}
```

---

## 9. Packet E-2A — interpretation scaffolding + safe enrichment skeleton (complete for this packet)

**Scope in this run:** Additive **deterministic** interpretation pipeline (no OpenAI, no send, no auto-approval). Load linked context, normalize **fragments**, run **heuristic** signals, **compose** operator-facing summary lines, **write back** non-destructively, persist provenance under `metadataJson.emailWorkflowInterpretation`, and expose a **manual “Run interpretation”** control on the admin detail page. Forward **E-3 / E-4** hooks are **typed stubs**; outputs are stored as `forwardHooks` inside provenance (all null/empty in E-2A).

**Still out of scope:** LLM/AI calls, provider/send execution, automatic interpretation on create, policy routing with side effects, draft generation, complex assignment, inbox sync.

**New / updated code:**

- `src/lib/email-workflow/intelligence/types.ts` — pipeline contracts, provenance v1, extension result type.
- `src/lib/email-workflow/intelligence/context.ts` — `loadEmailWorkflowInterpretationContext` (message body **preview** capped).
- `src/lib/email-workflow/intelligence/fragments.ts` — fragment builders per linked type.
- `src/lib/email-workflow/intelligence/heuristics.ts` — keyword / mapping heuristics (conservative).
- `src/lib/email-workflow/intelligence/composer.ts` — composed who/what/when/where/why/impact/recommendation lines.
- `src/lib/email-workflow/intelligence/writeback.ts` — merge summaries if empty (unless `force`); **E-2B:** per-field triage; provenance lists — see packet E-2B.
- `src/lib/email-workflow/intelligence/extension-points.ts` — `policyRoutingHookE3`, `draftRecommendationHookE4`, `confidenceScoringHook`, `assigneeSuggestionHook` (no-ops / null).
- `src/lib/email-workflow/intelligence/interpreter.ts` — `runEmailWorkflowInterpretation` orchestration.
- `src/app/admin/email-workflow-actions.ts` — `runEmailWorkflowInterpretationAction` (FormData, revalidate list + detail).
- `src/components/admin/workbench/RunEmailWorkflowInterpretationButton.tsx` — optional overwrite checkboxes.
- `src/app/admin/(board)/workbench/email-queue/[id]/page.tsx` — run button, interpretation + signals sections.
- `prisma/schema.prisma` — `EmailWorkflowStatus.ENRICHED`.
- `prisma/migrations/20260504130000_email_workflow_status_enriched/migration.sql` — `ADD VALUE 'ENRICHED'`.

**`ENRICHED` status:** **Added** to the Prisma enum and SQL migration. Meaning: a successful first interpretation pass from **NEW** moved the row to **ENRICHED**; item remains queue-first and is **not** “approved to send.”

**E-3 / E-4 forward scaffolding (this run):** Extension hooks live in `extension-points.ts`; `interpreter` attaches results to `metadataJson.emailWorkflowInterpretation.forwardHooks` for future UI/debug (currently empty placeholders).

---

## 10. Packet E-2B — queue hardening + workbench build map

**Hardening (email workflow):**

- **Writeback** (`src/lib/email-workflow/intelligence/writeback.ts`): triage is **per-field** — each of `intent`, `tone`, `escalationLevel`, `spamDisposition`, `spamScore`, `needsDeescalation` updates only if that column is still at its **schema default** (or `forceOverwriteSignals` is on). `needsDeescalation` treats `true` as operator/prior-owned and will not clear without force. `spamScore` only fills when **null** (unset). **Provenance** now records `overwrittenFields` and `preservedOperatorFields` on `metadataJson.emailWorkflowInterpretation`.
- **Context** (`context.ts` + `preview-helpers.ts`): single **clamp** for message body preview length (500 chars); **TODO** seam for possible future DB-side truncation. Does not load `thread.messages`.
- **Detail UI** (`email-queue/[id]/page.tsx`): **WorkbenchPill** for status/priority, clear labels for **row fields** vs **source links**, **EmailWorkflowInterpretationProvenancePanel** for compact last-run metadata.

**Planning artifact:** [`docs/workbench-build-map.md`](./workbench-build-map.md) — inventory of workbench/admin routes, shared patterns, recommended build sequence, scaffolding ideas, risks, fast path.

**Shared UI extracted (minimal):** `WorkbenchPill`, `EmailWorkflowInterpretationProvenancePanel` (used on email detail now; fit other queues).

**Still out of scope:** auto-run interpretation, AI, send, inbox sync, global cross-campaign queue, assignment workflow.

---

## 11. Packet SYS-1 — public site familiarization + system flow map

**Artifacts added (no feature code; documentation-only packet):**

- [`docs/public-site-system-map.md`](./public-site-system-map.md) — public `(site)` route inventory, `SiteHeader` / search / guide framework, `/api/forms` vs other server actions, public → `User`/`Submission`/`ArkansasFestivalIngest` flows, gaps (e.g. `WorkflowIntake` not created from all forms in `handlers.ts`).
- [`docs/system-domain-flow-map.md`](./system-domain-flow-map.md) — domain ↔ source of truth table (voter file, comms, email workflow, intakes, etc.), integration risks, “missing rails,” scaffolding recommendations.

**What we learned (summary):** The public site is a **separate layout** from admin (`(site)/layout.tsx`); primary persistence for movement forms is **`POST /api/forms`** → `persistFormSubmission` (`User` + `Submission` + optional `VolunteerProfile`); a **second path** is **community event suggest** via `suggest-community-event-action.ts` → `ArkansasFestivalIngest`. **WorkflowIntake** is primarily **operator- or monitoring-originated**, not the default for every public form — see domain map for honest coupling. **Email workflow** remains an additive queue without a public POST in this repo.

**Tiny scaffolding:** Cross-links from this handoff to the three system docs; `docs/README.md` table row for ops architecture maps. **No** app/router code changes; **no** unsafe automation or refactors.

**Intentionally not built:** New APIs, new workbench pages, auto-promotion of submissions to intake, or any public-facing email workflow trigger.

---

*Last updated for Packet SYS-1. See `docs/public-site-system-map.md`, `docs/system-domain-flow-map.md`, and `docs/workbench-build-map.md`.*

---

## 12. Packet CM-1 — Campaign Manager orchestration blueprint + incoming work rail map

**Artifacts added (documentation + one source comment only; no new pages, no permissions):**

- [`docs/campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) — **North star** (Campaign Manager as orchestration above subordinate workbenches), **operating model**, subordinate workbench table with **file references**, **incoming rails** summary, **unified incoming work problem** (incl. `Submission` vs `WorkflowIntake`, email vs comms layers), **role/delegation** (narrative only), **automation strata**, **build sequence**, **fastest path** for a single operator.
- [`docs/incoming-work-matrix.md`](./incoming-work-matrix.md) — **Matrix** of triggers → models → current destination → visibility → gaps → future roles.

**What we learned:** The **de facto** operator hub is **`/admin/workbench`** (`workbench/page.tsx`); a separate **orchestrator** surface (`/admin/orchestrator`) handles **inbound social content** (`InboundContentItem`)—related **orchestration** idea, **different** domain. **Incoming work** is **fragmented** across `Submission`, `WorkflowIntake`, `EmailWorkflowItem`, comms threads/sends, festival ingests, tasks, and review—**no** single normalized “incoming rail” in the database yet. Email workflow remains **subordinate and queue-first**; this packet does not change that.

**Tiny scaffolding:** Dev-facing **comment** on `workbench/page.tsx` pointing to `campaign-manager-orchestration-map.md` (orchestration concept anchor). **Cross-links** in this handoff, `workbench-build-map.md`, and `docs/README.md`.

**Intentionally not built:** Campaign Manager **route** or **shell** beyond documentation; **RBAC/roles**; **unified work table**; **automation** that changes live campaign behavior; **redesign** of any workbench.

**JSON (handoff snapshot):** see `packet_cm1` in the JSON block below (append when syncing).

---

## 13. Packet FND-1 — Unified campaign engine foundation + shared rail scaffolding

**Artifacts added (foundation packet; not a workbench or automation feature):**

- [`docs/unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) — **Canonical** **north star**, **core system layers**, **shared rails** (10), **canonical domain objects**, “existing surfaces as evidence not architecture,” **what to / not to** standardize early, **post-FND-1** foundation sequence, **fastest path** to a coherent engine.
- [`docs/shared-rails-matrix.md`](./shared-rails-matrix.md) — **Planning matrix:** rail, purpose, repo evidence, gaps, first implementation step, dependents, **risk if delayed**.

**Fresh unified build direction (summary):** We are building a **unified campaign operating system** (solo → delegation on **shared rails**), with **automation on policy**, **not** as one-off “smart” features in each island. The Campaign Manager / orchestration layer **aggregates** and **decides** what is next; workbenches remain **subordinate** **execution** surfaces. **Do not** treat today’s page layout as the **final** system partition.

**Light scaffolding (optional seam only):** `src/lib/campaign-engine/README.md` and `vocabulary.ts` — **string constants** and types for **rail** identifiers; **no** I/O, **no** behavior. For future read models and events.

**Intentionally not built:** `UnifiedWorkItem` **table**, RBAC, any **outbound** or **triage** automation, **rework** of existing workbenches, **merging** Comms and email workflow into one send path, **global** workbench abstractions, **migrations** to “replace” Prisma models.

*Last updated for Packet FND-1. See `docs/unified-campaign-engine-foundation.md`, `docs/shared-rails-matrix.md`.*

---

## 14. Packet ROLE-1 — Position system + workbench job definitions

**What was defined (documentation + small typed tree; no admin behavior):**

- [`docs/position-system-foundation.md`](./position-system-foundation.md) — Position as a system object: responsibilities, hierarchy (CM root → executive → department → function → intern/vol), roll-up of unfilled seats, workbench and incoming/assignment-rail hooks, automation posture by zone, scaling 1 / 10 / 100 / 1000+ without changing core architecture.
- [`docs/workbench-job-definitions.md`](./workbench-job-definitions.md) — Per-seat operational tables: parent, work, workbench routes (from `workbench-build-map`), incoming types, decisions, automation vs review, escalation/delegation, success signals. Optional Platforms / Integrations for `settings` / `platforms` routes.
- [`docs/position-hierarchy-map.md`](./position-hierarchy-map.md) — Text org tree, department legend, up/down/sideways flow.

**How positions fit the unified system:** The same FND-1 shared rails carry work; positions are default accountability and future inbox lenses—not new Prisma domain tables. Email workflow (E-1+) stays queue-first; Comms-line positions own that triage in the *model* first, not via new permissions in ROLE-1.

**Scaffolding now:** `src/lib/campaign-engine/positions.ts` — `PositionId` union, `POSITION_TREE`, `getChildPositions`. Keep aligned with `position-hierarchy-map.md` or replace with a single data source later.

**Intentionally not built:** User↔position seating, RBAC and per-route guards, position inbox UI, auto-delegation rules, workbench refactors driven solely from the org chart.

*Last updated for Packet ROLE-1. See `docs/position-system-foundation.md`, `docs/workbench-job-definitions.md`, `docs/position-hierarchy-map.md`.*

---

## 15. Packet TALENT-1 — Volunteer talent intelligence + adaptive training foundation

**What was defined:**

- [`docs/talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) — North star (engine runs without people; people improve it; AI develops, humans decide advancement). Talent as system function: evaluator, recommender, training director, pattern recognizer—not final judge. Observable signal categories tied to repo evidence and gaps; recommendation chain (local → escalate for seat change); adaptive training dimensions; automation vs human augmentation; rail dependencies; explicit human-only decisions; build sequence TALENT-2+.
- [`docs/position-development-matrix.md`](./position-development-matrix.md) — Per ROLE-1 position: competencies, early fit, risk, training, eventual metrics, upward path, who reviews advancement recommendations (detailed tables + compact table for remaining seats).
- [`docs/talent-recommendation-flow.md`](./talent-recommendation-flow.md) — Conceptual generation, recipients, hierarchy movement, informational vs prominent surfacing, provenance/audit, examples (organizer aptitude, intern stretch, not-ready comms, high-reliability training).

**How talent/training fits the unified system:** Another **advisory** rail (like E-2 on `EmailWorkflowItem`): provenance, no silent role or permission change, no hidden score gating. Builds on FND-1 rails + ROLE-1 positions; does not replace queue-first email policy in [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md).

**Scaffolding now:** `src/lib/campaign-engine/talent.ts` (`TalentSignalCategory`, `TalentRecommendationType`, `TalentRecommendationDraft`, etc.), `training.ts` (`TrainingTrackType`, `PositionDevelopmentHint`). No runtime behavior.

**Intentionally not built:** Scoring, ranking, auto-promotion, RBAC, observation event pipeline, training content store, workbench UI for talent, automatic role or trust changes.

*Last updated for Packet TALENT-1. See `docs/talent-intelligence-foundation.md`, `docs/position-development-matrix.md`, `docs/talent-recommendation-flow.md`.*

---

## 16. Packet BRAIN-1 — AI agent brain map + system-wide integration plan

**What we discovered (repo-grounded):** The “digital Campaign Manager brain” is **not** a single class name—it is **primarily** `src/lib/openai/` (client, embeddings, `search.ts` RAG, **`prompts.ts` policy/voice**), `src/lib/assistant/` (tool-calling campaign guide, `runCampaignAssistantCompletion`, **playbooks/journey** hints), `POST /api/search` and `POST /api/assistant`, `SearchChunk` **+** `npm run ingest` and **`ingest-campaign-brain`** (via `ingest-campaign-files-core` **→** `searchChunk.upsert`), `src/lib/comms/ai.ts` **persisting** `aiThreadSummary` / `aiNextBestAction` on **`CommunicationThread`**, `src/lib/openai/classify.ts` on **form** submit, **heuristic** `src/lib/email-workflow/intelligence/` (E-2) **+** E-3/4 **stubs** (LLM not wired in E-1/E-2), `media-monitor/openai-mention-refine.ts` on **ingest**, and **stubs** for **social** analytics. **Trained** **knowledge** **outside** static prompts: **ingested** **corpora** in **`SearchChunk`** when **ingest** **scripts** **run**; **background** **content** modules in `src/content/background` **fed** through **`fullSiteSearchChunks`**. **User’s** **external** custom GPTs / off-repo memory are **not** visible in code.

**System-wide role:** First-class **RAG+assistant+classification+comms** **summarization** **+** **(future)** E-3 **on** the **same** **rails** as **FND-1/ROLE-1/TALENT-1**; **recommend,** **not** **decide** on **sends** (this handoff), **seats,** or **compliance** **(see** `HumanGovernanceBoundary` **in** `ai-brain.ts`).

**Scaffolding now:** `ai-brain.ts`, `ai-context.ts` (types only; no new API or model calls).

**Intentionally not built:** A monolithic “brain” framework, unified orchestrator runtime, autonomous side-effect actions, hidden decision engine, or any bypass of queue-first email policy and human approval on sensitive paths (see `docs/ai-agent-brain-map.md` §6).

*Last updated for Packet BRAIN-1. See `docs/ai-agent-brain-map.md`, `docs/ai-integration-matrix.md`.*

---

## 17. Packet ALIGN-1 — Campaign brain alignment + override learning + user-scoped context

**What was defined:**

- [`docs/campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) — North star (deliberate, governable alignment; not permission to bypass queue-first or `HumanGovernanceBoundary`), alignment *sources* with repo evidence (`prompts.ts`, `SearchChunk`, E-2 `metadataJson`, job defs, workbench SOPs), **layered** context assembly, versioning targets, human governance, build sequence.
- [`docs/automation-override-and-impact-foundation.md`](./automation-override-and-impact-foundation.md) — Why overrides are learning signal; `AutomationOverrideKind` categories; conceptual event fields; impact class (`improved` / `neutral` / `degraded` / `unknown`); learning loop (conservatism, training, not silent governance); extension of E-2B `overwrittenFields` / `preservedOperatorFields` pattern to other areas later.
- [`docs/user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) — Whole-campaign RAG vs per-user interaction window; TALENT-1–aligned facets; context boundaries; risks (over-personalization, authority confusion); no RBAC in ALIGN-1.

**How it fits the unified system + this handoff:** The digital Campaign Manager brain (BRAIN-1) and email workflow (E-2/E-3) share a single **governance** story: alignment inputs are *authored*; E-2 triage and future automation remain **advisory**; **override** events are the formal rail for “human chose a different path than the suggestion” so we can measure impact without treating every override as model failure. **User-scoped** context explains how future workbench- and position-aware explanations stay bounded—without building permissions in ALIGN-1.

**Scaffolding now:** `src/lib/campaign-engine/alignment.ts`, `overrides.ts`, `user-context.ts` — types and enums only; no persistence, routes, or automation.

**Intentionally not built:** Append-only override store, comms/assistant UI for reasons, RAG filters by position, auto-tuning, hidden scores, or any change to email queue-first invariants in §3–4 of this document.

*Last updated for Packet ALIGN-1. See `docs/campaign-brain-alignment-foundation.md`, `docs/automation-override-and-impact-foundation.md`, `docs/user-scoped-ai-context-foundation.md`.*

---

## 18. Packet ASSIGN-1 — Assignment rail + position inbox + unified open work

**What was defined:**

- [`docs/assignment-rail-foundation.md`](./assignment-rail-foundation.md) — Assignment as the backbone of delegation, ownership, and position workbenches; current `assignedToUserId` / `assignedUserId` evidence; user vs position scope; assignment kinds (direct, roll-up, suggested, escalated); relations to incoming work, TALENT-1, ALIGN-1, overrides, AI.
- [`docs/position-inbox-foundation.md`](./position-inbox-foundation.md) — Position inbox as a read model over existing tables; how it differs from route-scoped workbenches; unifying email workflow, intake, tasks, comms; examples (Campaign Manager, Communications Director, Volunteer Coordinator).
- [`docs/unified-open-work-foundation.md`](./unified-open-work-foundation.md) — `OpenWorkItemRef` contract; v1 source models; filters; `getOpenWorkFor*` as future implementation target.

**How it fits this handoff + queue-first email:** `EmailWorkflowItem` remains a first-class *open work* source; assignment rail **does not** auto-send or bypass review. `assignedToUserId` and escalation fields are part of the same **story** as CM visibility (“unassigned / escalated” **pools** are conceptual targets for a future hub). Suggested assignee (E-3) stays **advisory** until human accepts—then it becomes a **direct** assignment or an ALIGN-1 `changed_assignment` override.

**Scaffolding (ASSIGN-1 era):** `assignment.ts` (types) and `getOpenWorkCountsBySource` (health counts) — list merges implemented in **UWR-1** (§19).

*Last updated for Packet ASSIGN-1. See `docs/assignment-rail-foundation.md`, `docs/position-inbox-foundation.md`, `docs/unified-open-work-foundation.md`.*

---

## 19. Packet UWR-1 — Unified incoming work read model

**What shipped:** [`docs/unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md) — v1 **three** sources (email queue, `WorkflowIntake`, `CampaignTask`); `UnifiedOpenWorkItem`; CM view = unassigned **plus** **escalated** email; user / unassigned / escalated **functions**; **no** threads in v1 list; **no** master table. **Code:** `open-work.ts` — `getOpenWorkForUser`, `getOpenWorkForCampaignManager`, `getUnassignedOpenWork`, `getEscalatedOpenWork` (independent `findMany`, merge, sort, cap); `assignment.ts` — extended `OpenWorkItemRef` for summaries / escalation / hints. **UI:** `UnifiedOpenWorkSection` (read-only links) on the main workbench.

**Intentionally not in v1 list:** `CommunicationThread` (ambiguous “open”); submissions/festival/owned media without a single honest rule; **for-me** list on the workbench page (the **function** exists for other surfaces). **Not built:** `positionId`, routing, full inbox page, migrations.

*Last updated for Packet UWR-1. See `docs/unified-incoming-work-read-model.md`.*

---

## 20. Packet WB-CORE-1 — Position workbench surface + position inbox read layer

**What shipped:** [`docs/position-workbench-foundation.md`](./position-workbench-foundation.md) — position workbench vs inbox, v1 inclusions, rails, out of scope. **Code:** `position-inbox.ts` (`getInboxForPosition` / `getOpenWorkForPosition`, `getWorkbenchSummaryForPosition`, `getHighPriorityInboxItemsForPosition`, heuristics for **campaign_manager**, **communications_director** / **email_comms_manager** (comms-lean), **volunteer_coordinator** / **field_director** (field-lean); other positions: destinations-only empty inbox. **UI:** `…/workbench/positions`, `…/workbench/positions/[positionId]`; “By position” on main workbench. **Types:** `personalized-workbench.ts` (placeholders for TALENT/AI later).

**Intentionally not built (WB-CORE-1):** RBAC, work **routing** by `PositionId` on **rows**, AI list reordering, **full** per-user personalization. **SEAT-1** added **`PositionSeat`** for **named** **occupants** (see §21) **without** changing **UWR-1** **assignment** rules.

*Last updated for Packet WB-CORE-1. See `docs/position-workbench-foundation.md` — SEAT-1: [`position-seating-foundation.md`](./position-seating-foundation.md).*

---

## 21. Packet SEAT-1 — Position seating + delegation foundation

**What shipped:** [`position-seating-foundation.md`](./position-seating-foundation.md), [`delegation-and-coverage-foundation.md`](./delegation-and-coverage-foundation.md) — **seat** as operational slot, vacancy / roll-up **narrative**, **states** (`VACANT` | `FILLED` | `ACTING` | `SHADOW`), **CM**-oriented **coverage** summary, relation to **assignment** (parallel rail). **Prisma:** `PositionSeat` (unique `positionKey`), `PositionSeatStatus`, optional `userId`, `actingForPositionKey`, `notes`/`metadataJson`. **Code:** `seating.ts` — `listPositionSeats`, `getSeatForPosition`, `getSeatsForUser`, `getCoverageSummary`, `getPositionWorkbenchSeatContext`, `getRollupTargetPositionId`, `getVacantSeatsWithUnfilledSubtrees`. **UI:** `/admin/workbench/seats` (table + per-row **Save** — **staffing** **metadata**; user dropdown capped at **500** accounts); **“Seats”** on main workbench; **seat** block on `…/workbench/positions/[positionId]`.

**Intentionally not built:** **RBAC**, **auto**-reroute on seat edit, `positionId` on **email/intake/task** **rows**, per-seat **API** **authorization**, **load**-based **“high work”** in this packet, **AI**-chosen **hires**.

*Last updated for Packet SEAT-1. See `docs/position-seating-foundation.md`, `docs/delegation-and-coverage-foundation.md`.*

---

## 22. Packets SKILL-1 + ASSIGN-2 — Agent skill/ingest map + seat-aware assignment (read)

**What shipped (architecture):** [`agent-skill-framework.md`](./agent-skill-framework.md) — **formal** **skill** **domains** (alignment, voter guidance, comms, email workflow judgment, field, volunteer+training, orchestration, events, compliance, research, data, county, content) with know / do / recommend / evidence / gaps. [`agent-knowledge-ingest-map.md`](./agent-knowledge-ingest-map.md) — **T1–T3** **tiers**, **knowledge** **categories** (SOPs, position expectations, compliance, **county** **files**, **opp** **playbooks**, etc.), **gaps** (canon, local org, depth **opp** book), **recommended** **ingest** **order**. [`seat-aware-assignment-foundation.md`](./seat-aware-assignment-foundation.md) — **structural** **inbox** vs **user** **assignee**; **inherited** **attention**; **safe** **now** / **waits** **lists**.

**What shipped (read seams):** `getSeatAssignmentContext` · `getOpenWorkForSeat` / `getOpenWorkForSeatOccupant` · `getSeatInboxWorkAlignment` in `open-work.ts`; types in `assignment.ts` · `skills.ts` (constants only) · **UI:** **ASSIGN-2** **panel** on **position** workbench (slice **counts** vs **occupant**, **match** line, **global** **open** for **occupant**).

**Intentionally not built:** **Auto-assignment** from **any** model; **RBAC**; **position** column on **UWR-1** **rows**; **silent** **authority**; **running** the **full** **RAG** **ingest** **pipeline** in **this** **packet** (the **map** is **the** **deliverable**).

*Last updated for Packets SKILL-1, ASSIGN-2. See the three new docs in `docs/` and `src/lib/campaign-engine/skills.ts`.*

---

## 23. Packet FUND-1 — Fundraising desk + donor research + contactability + fundraising ingest

**What shipped (documentation):** [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md) — **Fundraising** **Desk** as **future** **revenue** **ops** **center** (prospects, call time prep, comms, research, follow-up, **KPIs) **, **relation** to **UWR-1,** **seating,** **comms,** **ALIGN,** **TALENT,** and **gaps** **in** the **current** **repo** **(no** dedicated desk route) **. [`contactability-and-calltime-precheck-foundation.md`](./contactability-and-calltime-precheck-foundation.md) — **preflight** **stages,** **honest** “**good** **number**” **definition,** **human** **governance,** **override** **expectations. [`donor-research-and-enrichment-foundation.md`](./donor-research-and-enrichment-foundation.md) — **research** **stages,** **FEC** **(OpenFEC) **as **federal** **public** **track,** **Arkansas** **/** **state** as **separate** **build,** **matching** **risk,** **no** **live** **APIs** in **FUND-1. [`fundraising-kpis-and-goals-foundation.md`](./fundraising-kpis-and-goals-foundation.md) **—** **goal** **+** **KPI** **vocabulary,** **AI** as **narration** **of** **gaps,** not **sole** **approver. [`fundraising-agent-ingest-map.md`](./fundraising-agent-ingest-map.md) **—** **T1**–**T3** **knowledge** for **RAG,** with **scoping** **(global/role/…) **. **

**Code (light):** `src/lib/campaign-engine/fundraising.ts` **—** `ContactabilityStatus`, `DonorResearchSignal`, `FundraisingKpiKey`, `FundraisingWorkType`, `ProspectPriorityReason` **(constants** **only) **. **`AgentSkillDomain.FUNDRAISING_OPERATIONS`** in `skills.ts` **. **

**Intentionally not built:** **Production** **dialing** **/ texting**; **OpenFEC** **(or** **AR** **ethics) **ingest** **wiring**; **admin** `…/workbench/fundraising` **;** **compliance** **bypass;** **guaranteed** **“good** **dial”** **. **

*Last updated for Packet FUND-1. See the five FUND-1 `docs` and `src/lib/campaign-engine/fundraising.ts`.*

---

## 24. Packet COMP-1 — Compliance governance rail + paperwork simplification + compliance ingest (foundation)

**What shipped (documentation):** [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) **—** compliance as **horizontal** **rail,** **domains,** **ties** to **AI** / **seats** / **O**-**W** / **FUND,** **human**-**owned** **outcomes** **,** **no** **specialty** **workbench** in **this** **packet** **. [`compliance-paperwork-simplification-foundation.md`](./compliance-paperwork-simplification-foundation.md) **—** **inputs,** **prep** **stages,** **honest** **gap** on **SOS** **/ official** **schemas** in **repo. [`compliance-skill-framework.md`](./compliance-skill-framework.md) **—** **per**-**skill** **table** (monitor,** **flag,** **never** **certify) **. [`compliance-agent-ingest-map.md`](./compliance-agent-ingest-map.md) **—** T1–T3 with **scoping** **and** **+** **human**-**legal** **review** **hints** **. **

**Code (scaffolding** **only):** `compliance.ts` **—** `ComplianceDomain`**,** `ComplianceSignalKind`**,** `PaperworkPrepStage`**,** `ComplianceReviewStatus`**,** `ComplianceKnowledgeTier` **. **`AgentSkillDomain.COMPLIANCE_GOVERNANCE` **(umbrella) **+ **file**-**level** **comment** **. **

**Intentionally not built:** **Full** **compliance** **workbench;** **filing** **automation;** **bank** **/ processor** **integrations;** **AR** **SOS** **machine**-**readable** **forms**; **AI**-**as**-**regulator** **. **

*Last updated for Packet COMP-1. See the four `docs/compliance-*.md` and `src/lib/campaign-engine/compliance.ts`.*

---

## 25. Packets POLICY-1 + COMP-2 + BUDGET-1 — Campaign policy, first compliance file intake, spend governance rail

**What shipped (documentation):** [`campaign-policy-foundation.md`](./campaign-policy-foundation.md) — **governed** **defaults** (calm** **/ bottom**-**up,** **organizing** **line,** **page** **“paid** **for”** **line,** **mileage** **0.725,** **reimbursement** **scope** **candidate**-**only** in **v1) **; **not** **legal** **conclusions) **. [`compliance-document-ingest-foundation.md`](./compliance-document-ingest-foundation.md) — **upload** **pipeline** **(conceptual) **+ **human** **governance) **. [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md) and [`budget-agent-ingest-map.md`](./budget-agent-ingest-map.md) — **horizontal** **spend** **rail,** **T1**–**T3** **ingest) **. [`federal-state-coordination-foundation.md`](./federal-state-coordination-foundation.md) — **safe** **posture,** not **advice) **. **

**Code:** **`CAMPAIGN_POLICY_V1` **+** **`defaultPolicyCategoryComplianceDomain` **in** **`policy.ts` **. **`complianceDocumentTypeLabel` **+** **COM2** in **`compliance-documents.ts` **. **`CostBearingWireKind` **in** **`budget.ts` **. **`AgentSkillDomain.CAMPAIGN_POLICY` **+** **`BUDGET_GOVERNANCE` **. **Prisma** **`ComplianceDocument` **(migration **20260509120000_comp2_compliance_document) **. **Admin** **`/admin/compliance-documents` **(multipart** **upload,** **list,** **AI**-**ref** **toggle) **; **admin**-**only** **file** **GET** at **`/api/compliance-documents/[id]/file` **. **`CampaignPaidForBar` **reads** **footer** **from** **policy) **. **

**Intentionally not built:** **Full** **budget** **/ compliance** **workbench;** **RAG** **on** **uploads;** **bank,** **processor,** or **ad**-**API** **wiring;** **filing** **automation;** **legal** **engine;** **“** **AI**-**compliant** **”** **badges) **. **

*Last updated: Packet POLICY-1+COMP-2+BUDGET-1. See `packet_policy1_comp2_budget1` in the JSON handoff block and linked `docs/`. *

---

## 26. Packet FIN-1 — Financial ledger foundation + submission bridge + budget wiring (minimal)

**What shipped (documentation):** [`financial-ledger-foundation.md`](./financial-ledger-foundation.md) (internal **ledger,** not **bank** **/ **filing) **. [`submission-to-ledger-bridge.md`](./submission-to-ledger-bridge.md) (governed **pipeline,** **no** **content** **NLP) **. **

**Code:** Prisma **`FinancialTransaction` **+** **enums;** **`budget.ts` **mappings;** **`financial-ingest.ts` **seams;** read-only **`/admin/financial-transactions` **. **Migration:** **`20260510120000_fin1_financial_transaction` **(apply** **when** **DB** **up) **. **

**Intentionally not built:** **Finance** **dashboard;** **reporting;** **bank** / **FEC** / **SOS** **integration;** **auto**-**materialize** **all** **submissions) **. **

*Last updated: Packet FIN-1. See `packet_fin1` in the JSON handoff block.*

---

## 27. Packet BUDGET-2 — Budget structure + planned vs actual (governed, minimal)

**What shipped (documentation):** [`budget-structure-foundation.md`](./budget-structure-foundation.md) — budget as **internal** plan/control vs ledger vs filings; period, line, planned/actual/remaining/variance; approval thresholds and posture; rails; governance; out of scope.

**What shipped (schema + code):** Prisma **`BudgetPlan`** / **`BudgetLine`** / **`BudgetPlanStatus`** (migration **`20260511120000_budget2_budget_plan_line`**). **`budget-queries.ts`** — list/detail, **CONFIRMED**-only actuals by **`getBudgetWireForTransaction`**, optional plan date window, variance rows with **duplicate-wire** caveat. **`policy.ts`** — **`SpendApprovalTier`**, **`CAMPAIGN_POLICY_V1.spendBudget`** (threshold narratives; **no** product enforcement). **`budget.ts`** — **`BUDGET2_PACKET`**, wire **`select`** options, **`isCostBearingWireKindId`**.

**Admin:** **`/admin/budgets`** (create plan), **`/admin/budgets/[id]`** (add line, table planned/actual/remaining/variance, policy aside). **Nav:** `AdminBoardShell` operations link.

**Intentionally not built:** Commitments, forecasting, perfect attribution, bank/vendor hooks, filing automation, RBAC on budget routes beyond existing admin gate.

*Last updated: Packet BUDGET-2. See `packet_budget2` in the JSON handoff block.*

---

## 28. Packets FIN-2 + FIELD-1 + YOUTH-1 — Ledger use, field rails, youth vocabulary

**What shipped (FIN-2) —** [`financial-ledger-foundation.md`](./financial-ledger-foundation.md) (§6) · `FinancialTransaction` **columns** `confirmedByUserId` / `confirmedAt` · enum **`CONTRIBUTION`** · `financial-ledger.ts` · `financial-transaction-actions.ts` · admin **`/admin/financial-transactions`** minimal create + **Confirm**; confirming user from **`getAdminActorUserId`** / **`ADMIN_ACTOR_USER_EMAIL`**. **BUDGET-2** actuals **ignore** `CONTRIBUTION` in `budget-queries.ts`.

**What shipped (FIELD-1) —** [`field-structure-foundation.md`](./field-structure-foundation.md) · Prisma **`FieldUnit`** / **`FieldAssignment`** (optional `positionSeatId`) · `field.ts` (read-only queries).

**What shipped (YOUTH-1) —** [`youth-pipeline-foundation.md`](./youth-pipeline-foundation.md) · [`youth-agent-ingest-map.md`](./youth-agent-ingest-map.md) · `youth.ts` (types only).

**Intentionally not built —** finance import/recon · **GIS** · **youth** **automation** / **LMS** · **mandatory** **County**↔`FieldUnit` **link** in DB.

*Last updated: Packets FIN-2, FIELD-1, YOUTH-1. See `packet_fin2_field1_youth1` in the JSON handoff block.*

---

## 29. Packets DATA-1 + COMMS-UNIFY-1 + IDENTITY-1 — Targeting truth, comms map, identity

**What shipped (docs only):** [`data-targeting-foundation.md`](./data-targeting-foundation.md) (county goals, **no** P/T/B universes in schema; `VoterRecord.precinct` string when imported; what is missing) · [`communications-unification-foundation.md`](./communications-unification-foundation.md) (threads, Tier 2 broadcast, **Comms workbench** plan/draft/send, social, inbound content, E-1, **MediaOutreachItem**) · [`message-workbench-analysis.md`](./message-workbench-analysis.md) (workbench **structure** + **reuse** + AI **touch** points) · [`identity-and-voter-link-foundation.md`](./identity-and-voter-link-foundation.md) (`User` ↔ `VoterRecord`, fallbacks) · [`volunteer-data-gap-analysis.md`](./volunteer-data-gap-analysis.md).

**Intentionally not built:** **New** **tables**; **voter** **scoring**; **merging** **Send** and **Thread** into **one** **implementation**; **precinct** **GIS**.

*Last updated: Packets DATA-1, COMMS-UNIFY-1, IDENTITY-1. See `packet_data1_comms_unify1_identity1` in the JSON handoff block.*

---

## 30. Packets DBMAP-1 + LAUNCH-1 — Prisma inventory + re-engagement launch foundation

**What shipped (DBMAP-1):** [`database-table-inventory.md`](./database-table-inventory.md) — all **105** models with purpose, domain, and launch relevance; `scripts/print-prisma-inventory.mjs` to re-verify the model count.

**What shipped (LAUNCH-1):** [`launch-reengagement-foundation.md`](./launch-reengagement-foundation.md) and [`launch-segmentation-and-response-foundation.md`](./launch-segmentation-and-response-foundation.md); `src/lib/campaign-engine/launch.ts` — types (`LaunchResponseIntent`, etc.) and read-only `countLaunchAudienceByKind` / `listLaunchReadySupporters` (not a send path).

**Intentionally not built:** journey automation, ML segments, schema for re-engagement waves, or implicit opt-in.

*Last updated: Packets DBMAP-1, LAUNCH-1. See `packet_dbmap1_launch1` in the JSON handoff block.*

---

## 31. Packet GEO-1 — County + media mapping + geographic unification foundation

**What shipped (docs only):** [`geographic-county-mapping.md`](./geographic-county-mapping.md) (full inventory of county-related fields in `schema.prisma`) · [`county-media-mapping.md`](./county-media-mapping.md) (media/comms social vs string vs inferred) · [`geographic-unification-foundation.md`](./geographic-unification-foundation.md) (conceptual hierarchy: state → county → precinct string) · [`county-dashboard-foundation.md`](./county-dashboard-foundation.md) (future county dashboard = existing models).

**Fragmentation documented:** `User.county` string vs `County` FK; `FieldUnit` / `FieldAssignment` not linked to `County`; workbench and Tier-2 comms without direct `countyId` on every row; `SocialContentItem` and `MediaOutreachItem` limitations.

**Intentionally not built:** any schema change; automated merge of field names to FIPS. See `packet_geo1` in the JSON handoff block.

*Last updated: Packet GEO-1.*

---
