# Prisma schema map alignment (offline)

**Slice:** `REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0` · **Generated:** 2026-05-06T23:21:23.473Z · **Mode:** `offline_alignment_plan_only`

> **This packet does not change `prisma/schema.prisma`.**
> **This packet does not approve production baseline execution.**
> **Voter warehouse tables must not be renamed, dropped, overwritten, or forcibly mapped without human review.**
> **Supabase `auth.*` tables are provider-owned and must not be Prisma-migration-owned by RedDirt.**

## Purpose

Preservation-first **alignment plan** between **live Supabase `public`/`auth`** table names (from the baseline audit + schema reconciliation) and **`prisma/schema.prisma`**. The script emits **documentation and JSON only**: proposed `@@map` targets, ownership classifications, and governance flags. **No** Postgres connection, **no** row export, **no** executable SQL, **no** `schema.prisma` edits in this slice.

## Source audit and reconciliation summary

- **Audit JSON:** `data/production-db-baseline-audit.json` — slice `REDDIRT-PRODUCTION-DB-BASELINE-AUDIT-1.0`, generated `2026-05-06T22:46:56.588Z`.
- **Baseline plan JSON:** `data/production-db-baseline-plan.json` — slice `REDDIRT-PRODUCTION-DB-BASELINE-PLAN-1.0` (migration SQL inventory; offline).
- **Reconciliation JSON:** `data/production-db-schema-reconciliation.json` — slice `REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0`, reconciliation strategy **`split_legacy_and_prisma_domains`**.
- **Observed public tables (audit):** 115 · **Prisma models expected:** 148 · **`public._prisma_migrations` present:** no.

## Why schema map alignment is required

Without explicit `@@map` and ownership decisions, Prisma’s default **PascalCase** table names do not match the live **snake_case** / legacy warehouse surface. `_prisma_migrations` is absent on the audited database, so **migrate history cannot be trusted** against live DDL until naming and domains are reconciled. Alignment prevents accidental DDL against voter/campaign data.

## Current Prisma model ownership problem

Each Prisma model implies a physical table name equal to the **model name** unless `@@map("…")` is set. Reconciliation shows **naming and lineage drift**: many models appear as **missing** or **map-review** relative to `public.*`, while a large **legacy-only** public footprint is not owned by current Prisma migrations. **`User`** and **`VoterRecord`** are examples where **semantic** disambiguation (app user vs `auth.users`, warehouse vs model) must precede any map patch.

## Live database legacy surface

The audit’s `public.*` list includes **campaign** tables alongside **imported voter warehouse**, **ingestion**, and **analytics** tables. Patterns such as **`ar02_*`**, `voter_registry`, `spatial_ref_sys`, and raw ingestion tables are treated as **high-value or legacy-preserve** in this packet (see **Legacy preserve / do-not-touch tables**). These must not be collateral damage from Prisma DDL or forced `@@map` guesses.

## Proposed @@map candidates

### Documentation-only recommendations (from JSON `proposedMapRecommendations`)

- **County** → `counties` (high) — Plural snake public table matches Prisma County semantics.
- **EventRequest** → `event_requests` (high) — Live event_requests aligns with Prisma EventRequest.
- **Submission** → `submissions` (high) — Common plural mapping.
- **MediaAsset** → `media_assets` (high) — Plural snake table present in audit.
- **WorkflowIntake** → _no auto table_ (low) — Inspect workflow_intake / intakes / operator-owned intakes before any @@map; reconciliation may be ambiguous.
- **VoterRecord** → _no auto table_ (none) — Do not auto-map: live voter warehouse (voters, ar02_voters, voter_registry, etc.) may not match Prisma VoterRecord semantics — DBA review required. **DO NOT auto-map.**

### Exact safe candidates (`mapped_existing_table_candidate`)

- **Count:** 0
_None._

### Map-review candidates (`needs_explicit_map_review`)

- **Count:** 27
- `ContactPreference`
- `VolunteerProfile`
- `Submission`
- `EventRequest`
- `MediaAsset`
- `County`
- `CountyCampaignStats`
- `VoterFileSnapshot`
- `CountyVoterMetrics`
- `VoterElectionParticipation`
- `VoterSignal`
- `VoterModelClassification`
- `VoterInteraction`
- `RelationalContact`
- `VoterVotePlan`
- `VoterSnapshotChange`
- `CampaignEvent`
- `EventSignup`
- `EmailContactProfile`
- `EmailContactProfileFact`
- `EmailContactProfileFactSuggestion`
- `EmailContactImportBatch`
- `EmailContactImportRow`
- `EmailContactImportDecision`
- `SendGridContactMap`
- `SendGridContactSyncRun`
- `OppositionVoteRecord`

## Models that must not be auto-mapped

Treat the following as **manual / DBA** only — **no** script-applied `@@map`, **no** `db push`, **no** migration toward these tables until signed:

- **WorkflowIntake** — Inspect workflow_intake / intakes / operator-owned intakes before any @@map; reconciliation may be ambiguous.
- **VoterRecord** — Do not auto-map: live voter warehouse (voters, ar02_voters, voter_registry, etc.) may not match Prisma VoterRecord semantics — DBA review required.
- Any **voter warehouse** or **`ar02_*`** table: **must not** be renamed, dropped, overwritten, or forcibly mapped without human review.

## Legacy preserve / do-not-touch tables

- **Count:** 35 (merged reconciliation + audit rules).
- `ar02_voter_dem_lean`
- `ar02_voter_race`
- `ar02_voters`
- `bls_county_economics`
- `contact_origins`
- `contact_voter_matches`
- `county_results`
- `county_turnout`
- `event_notifications`
- `ingestion_entities`
- `ingestion_extractions`
- `ingestion_files`
- `ingestion_jobs`
- `ingestion_mapping_suggestions`
- `ingestion_reviews`
- `ingestion_write_events`
- `message_audience_members`
- `message_audiences`
- `message_events`
- `path_to_victory`
- `person_profiles`
- `profiles`
- `spatial_ref_sys`
- `telemetry_events`
- `training_events`
- `voter_block_group_map`
- `voter_geocoded`
- `voter_import_batches`
- `voter_party_model`
- `voter_profiles`
- `voter_registry`
- `voter_scores`
- `voter_vote_history`
- `voter_vote_history_raw`
- `youth_profiles`

## New Prisma-owned table candidates

Models with **no** confident observed `public` match — candidates for **future** app-owned tables in a **shadow** migration plan only (not created on production by this packet).

- **Count:** 119
- `ComplianceDocument`
- `FinancialTransaction`
- `FieldUnit`
- `FieldAssignment`
- `BudgetPlan`
- `BudgetLine`
- `PositionSeat`
- `Commitment`
- `WorkflowIntake`
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
- `ElectionResultSource`

### High semantic risk (`unsafe_unknown`)

- **Count:** 1
- `VoterRecord`

## Supabase auth boundary

**23** tables under `auth.*` from the audit. They are **Supabase provider-owned**. RedDirt **must not** treat them as ordinary Prisma `@@schema("auth")` migration targets or rename/drop them via application migrations.

- `auth.audit_log_entries`
- `auth.custom_oauth_providers`
- `auth.flow_state`
- `auth.identities`
- `auth.instances`
- `auth.mfa_amr_claims`
- `auth.mfa_challenges`
- `auth.mfa_factors`
- `auth.oauth_authorizations`
- `auth.oauth_client_states`
- `auth.oauth_clients`
- `auth.oauth_consents`
- `auth.one_time_tokens`
- `auth.refresh_tokens`
- `auth.saml_providers`
- `auth.saml_relay_states`
- `auth.schema_migrations`
- `auth.sessions`
- `auth.sso_domains`
- `auth.sso_providers`
- `auth.users`
- `auth.webauthn_challenges`
- `auth.webauthn_credentials`

## Baseline impact

- **`safeToBaselineNow`:** false
- **Reason:** Production remains a mixed legacy + campaign surface without Prisma migration history; baseline and migrate-resolve stay blocked until @@map and DBA ownership are closed on paper and in shadow DB.
- **Blocked by:** missing_public__prisma_migrations, legacy_and_prisma_naming_drift, voter_warehouse_semantic_uncertainty, migrate_history_not_aligned_with_live_ddl.
- **This packet does not approve production baseline execution.** Close `@@map` / ownership with DBA and shadow proofs before any baseline execution slice.

### Migration footprint (informational, from baseline plan)

- **Total migration folders:** 70
- **Missing-footprint migrations (vs audit):** 64
- _Use shadow / clone Postgres for `migrate deploy` proofs — never as approval to run these commands on production from this document._

## Recommended strategy

- **Strategy:** `dba_review_first`
- **Next slice:** `REDDIRT-DBA-REVIEW-REQUIRED-1.0`
- **Requires human approval:** true
- **Safe to execute automatically:** false

## Human review checklist

- [ ] Review JSON `modelOwnershipMap`, `unsafeUnknowns`, and `legacyPreserveTables` with Steve or DBA.
- [ ] Confirm **`User`** semantics (`public.users` vs **`auth.users`**) before any auth-linked `@@map`.
- [ ] Resolve **`VoterRecord`** against warehouse docs (`voters`, `ar02_voters`, `voter_registry`, etc.); **no** forced map.
- [ ] After sign-off, schedule **`REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-1.0`** for controlled `schema.prisma` edits (separate slice).
- [ ] Run **shadow** `prisma migrate deploy` only on disposable Postgres; production migrate commands stay forbidden until an execution packet.

## Absolute forbidden commands

- `npx prisma migrate deploy` — **do not** run against production until a named execution slice and DBA sign-off.
- `npx prisma migrate resolve` — **do not** run against production until a named execution slice and DBA sign-off.
- `npx prisma db push` — **do not** run against production until a named execution slice and DBA sign-off.
- `npx prisma migrate reset` — **do not** run against production until a named execution slice and DBA sign-off.

## Next recommended slice

**`REDDIRT-DBA-REVIEW-REQUIRED-1.0`**

---

_Artifacts: [`data/prisma-schema-map-alignment.json`](../data/prisma-schema-map-alignment.json) · [`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md`](../develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md)_
