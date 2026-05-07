# Production database baseline plan (offline)

**Slice:** `REDDIRT-PRODUCTION-DB-BASELINE-PLAN-1.0` · **Generated:** 2026-05-06T23:21:26.567Z · **Source audit:** `data/production-db-baseline-audit.json`

## Purpose

Preservation-first analysis of **Prisma migration SQL** against **read-only audit** outputs. **No database access**, **no executable SQL output**, **no migrations**. This document supports **human-approved** baseline planning so production voter and campaign data are never reset or blindly overwritten. After the database transfer, the **correct** Supabase target is known; this plan turns audit + migration history into an actionable reconciliation story before Netlify can safely run `prisma migrate deploy`.

## Source audit summary

- **Audit slice:** `REDDIRT-PRODUCTION-DB-BASELINE-AUDIT-1.0`
- **Audit generated at:** 2026-05-06T22:46:56.588Z
- **Audit mode:** read_only_metadata_audit
- **Audit baseline risk (heuristic):** `high_non_empty_without_prisma_migration_history`
- **Warnings (sample):**
- 148 Prisma-mapped public table(s) not found in information_schema snapshot (case or naming drift, or different database).
- public schema contains multiple tables not present in prisma/schema.prisma — expect a large baseline diff if introspecting.

## Current database identity

- **Reachable (at audit time):** true
- **`public._prisma_migrations` present:** false
- **Observed public base tables:** 115
- **Prisma expected public tables (`schema.prisma`):** 148
- **Prisma-mapped names found in observed public (case-insensitive):** 0

## Migration footprint analysis

Migrations are ordered **lexically** by folder name under `prisma/migrations/`. Each `migration.sql` is scanned (heuristic) for `CREATE TABLE`, `ALTER TABLE`, `CREATE TYPE`, `CREATE INDEX` counts, destructive DDL, and high-value keywords. Footprint = tables touched by **CREATE** or **ALTER** in that file vs **observed public** table names from the audit.

- **Total migrations:** 70
- **Prisma tables with a first `CREATE TABLE` somewhere in the chain:** 148 / 148
- **Fully present or vacuous (no DDL tables, or all footprint tables match observed public):** 6
- **Missing footprint (non-empty footprint, zero tables matched observed public):** 64
- **Mixed footprint (some matched, some not):** 0
- **High-value keyword touch (migration dir, SQL, or table names):** 54

### Fully present / vacuous migrations (sample)

- `20260421223000_owned_media_geo_indexes`
- `20260422010100_slice1_event_readiness`
- `20260431185000_comms_packet7_variant_status_backfill`
- `20260501120000_contact_engagement_ce1_indexes`
- `20260502120000_contact_engagement_ce3_recipient_unique`
- `20260504130000_email_workflow_status_enriched`

### Missing-footprint migrations (sample)

- `20260221120000_county_command_pages`
- `20260221143000_voter_file_snapshots_and_metrics`
- `20260221180000_voter_warehouse_hardening`
- `20260421120000_init`
- `20260421140000_admin_content_board`
- `20260421150000_homepage_editorial_media_dims`
- `20260421180000_content_orchestrator`
- `20260421194722_content_hub_phase1`
- `20260421200303_campaign_owned_media`
- `20260421215343_campaign_ops_slice1`
- `20260421220000_owned_media_geo_ingest`
- `20260421220304_owned_media_annotations_slice2`
- `20260421221514_volunteer_signup_sheet_intake`
- `20260421222620_comms_workbench_step1`
- `20260421232900_calendar_hq_and_google`
- `20260422003847_weekly_command_matrix`
- `20260422010000_slice1_event_readiness`
- `20260422012659_event_stage_log_and_lifecycle_fields`
- `20260422013434_slice3_event_comms_fields`
- `20260422014544_slice4_event_workflow_tasks`
- `20260422015812_slice5_google_calendar_sync`
- `20260422120000_comms_tier1_contact_preferences`
- `20260422150000_arkansas_festival_ingest`
- `20260422160000_festival_public_form`
- `20260423000000_tier2_broadcast_engine`
- _…39 more — full list in `data/production-db-baseline-plan.json`._

## Tables already present

**Prisma-mapped table names** that the audit shows exist in **`public`** (case-insensitive name match). These are the strongest evidence that a Prisma object may already live in production under the same identifier.

- **Count:** 0

_None._

## Tables missing from production

**Prisma-mapped tables** the audit did **not** see in `public` (same naming convention Prisma uses in migrations — often **PascalCase**). A large list usually means a **parallel legacy schema** (e.g. snake_case tables) rather than an empty database.

- **Count:** 148

- `User`
- `ComplianceDocument`
- `FinancialTransaction`
- `FieldUnit`
- `FieldAssignment`
- `BudgetPlan`
- `BudgetLine`
- `PositionSeat`
- `ContactPreference`
- `VolunteerProfile`
- `Commitment`
- `Submission`
- `WorkflowIntake`
- `EventRequest`
- `WorkflowAction`
- `SocialContentItem`
- `AnalyticsRecommendationOutcome`
- `SocialContentDraft`
- `SocialPlatformVariant`
- `SocialPerformanceSnapshot`
- `SocialContentStrategicInsight`
- `ConversationWatchlist`
- `ConversationItem`
- `ConversationAnalysis`
- `ConversationCluster`
- `ConversationClusterItem`
- `ConversationOpportunity`
- `SocialContentMediaRef`
- `SocialAccount`
- `SearchChunk`
- `AnalyticsEvent`
- `MediaAsset`
- `SyncedPost`
- `AdminContentBlock`
- `HomepageConfig`
- `ContentItemOverride`
- `SiteSettings`
- `PlatformConnection`
- `InboundContentItem`
- `ContentDecision`
- `PlatformMetricSnapshot`
- `OwnedMediaAsset`
- `OwnedMediaAnnotation`
- `OwnedMediaTranscript`
- `OwnedMediaQuoteCandidate`
- _…103 more — full list in `data/production-db-baseline-plan.json`._

## Mixed migrations

_None on this plan run — every non-vacuous migration was either fully missing or fully present under the heuristic._

## High-value migration touchpoints

Migrations whose SQL, **`CREATE TABLE`** identifiers, or directory name match sensitive domains (voter, contact, county, email, event, profile, audience, relational). **Naming heuristic only** — not a data classification.

- `20260221120000_county_command_pages`
- `20260221143000_voter_file_snapshots_and_metrics`
- `20260221180000_voter_warehouse_hardening`
- `20260421120000_init`
- `20260421194722_content_hub_phase1`
- `20260421200303_campaign_owned_media`
- `20260421215343_campaign_ops_slice1`
- `20260421220000_owned_media_geo_ingest`
- `20260421220304_owned_media_annotations_slice2`
- `20260421221514_volunteer_signup_sheet_intake`
- `20260421222620_comms_workbench_step1`
- `20260421232900_calendar_hq_and_google`
- `20260422003847_weekly_command_matrix`
- `20260422010000_slice1_event_readiness`
- `20260422012659_event_stage_log_and_lifecycle_fields`
- `20260422013434_slice3_event_comms_fields`
- `20260422014544_slice4_event_workflow_tasks`
- `20260422015812_slice5_google_calendar_sync`
- `20260422120000_comms_tier1_contact_preferences`
- `20260422150000_arkansas_festival_ingest`
- `20260422160000_festival_public_form`
- `20260423000000_tier2_broadcast_engine`
- `20260423120000_tier25_webhooks_gmail`
- `20260424180000_intel3_opposition_intelligence_schema`
- `20260424190000_voter_election_participation`
- `20260424200000_county_intel_2_schema`
- `20260425120000_external_media_monitor`
- `20260425130000_campaignos_phase1_workflow_intake`
- `20260425140000_social_workbench_foundation`
- `20260426120000_social_workbench_media_library`
- `20260427120000_social_workbench_analytics`
- `20260428120000_conversation_monitoring`
- `20260429120000_owned_media_dam_media_center`
- `20260430120000_social_actionable_analytics`
- `20260430133000_analytics_recommendation_outcomes`
- `20260431120000_social_analytics_tactic_and_followup_v2`
- `20260431170000_comms_workbench_packet1`
- `20260431200000_comms_contact_engagement_ce1_foundation`
- `20260501120000_contact_engagement_ce1_indexes`
- `20260504120000_email_workflow_e1`
- _…14 more — full list in `data/production-db-baseline-plan.json`._

## Recommended baseline strategy

- **Strategy label:** `unsafe_to_baseline`
- **Safe to execute automatically:** false
- **Requires human approval:** true

**Reason:** Almost no Prisma-mapped public tables match observed names while production already holds many public tables — likely a parallel legacy lineage. Blind Prisma baseline or migrate-resolve would misrepresent reality.

## Human review checklist

- [ ] Confirm the audit was run against the **intended** production `DATABASE_URL` after the database transfer.
- [ ] Read `data/production-db-baseline-plan.json` alongside this file; spot-check migrations that touch voter or comms domains.
- [ ] Run **`prisma migrate deploy` on a shadow empty database** to validate the migration chain produces the expected schema (still **no** production writes).
- [ ] Decide whether production is **legacy parallel schema**, **partial Prisma overlap**, or another lineage before any `migrate resolve`.
- [ ] Obtain **explicit** sign-off from Steve / DBA before any execution packet.
- [ ] Only after reconciliation: revisit Netlify build (`migrate deploy` step) with a written rollback story.

## Commands for review only

- Compare this JSON to the latest production-db-baseline-audit.json (regenerate audit if DATABASE_URL target changed).
- Use an empty shadow Postgres database: prisma migrate deploy there to validate the migration chain without touching production.
- If reconciliation proceeds, document any rename or multi-app lineage decisions before migrate resolve on production.
- Keep REDDIRT lane rules: no migrate deploy / resolve / db push / reset on production until explicit human approval after shadow verification.

## Absolute forbidden commands

- `npx prisma migrate deploy` — **do not** run against production until governance approves an execution slice.
- `npx prisma migrate resolve` — **do not** run against production until governance approves an execution slice.
- `npx prisma db push` — **do not** run against production until governance approves an execution slice.
- `npx prisma migrate reset` — **do not** run against production until governance approves an execution slice.

## Next recommended slice

**`REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0`** — follow this slice before attempting baseline execution or unblocking `migrate deploy` on production.

---

_Full machine-readable plan: [`data/production-db-baseline-plan.json`](../data/production-db-baseline-plan.json). Heuristic DDL parse — verify edge cases manually._

_Prisma map alignment packet: [`docs/prisma-schema-map-alignment.md`](../docs/prisma-schema-map-alignment.md) · [`data/prisma-schema-map-alignment.json`](../data/prisma-schema-map-alignment.json) · [`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md`](../develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md) — `node scripts/align-prisma-schema-map.mjs` (offline; **no** `schema.prisma` edits in that slice)._

**Patch plan + shadow + draft baseline packet:** [`prisma-schema-map-patch-plan.md`](./prisma-schema-map-patch-plan.md) · [`data/prisma-schema-map-patch-plan.json`](../data/prisma-schema-map-patch-plan.json) · [`production-db-shadow-proof-plan.md`](./production-db-shadow-proof-plan.md) · [`production-baseline-execution-packet-draft.md`](./production-baseline-execution-packet-draft.md) · [`production-db-test-readiness.md`](./production-db-test-readiness.md) · [`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_PATCH_PLAN_AND_SHADOW_PROOF_1_0_REPORT.md`](../develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_PATCH_PLAN_AND_SHADOW_PROOF_1_0_REPORT.md).
