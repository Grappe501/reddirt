# Production database schema reconciliation (offline)

**Slice:** `REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0` · **Generated:** 2026-05-06T23:21:26.441Z · **Source:** `data/production-db-baseline-audit.json`

## Purpose

Reconcile **read-only audit** public table names with **Prisma models** and **migration SQL** footprints — **offline only** (no `DATABASE_URL`, no Postgres I/O, no executable migration output). Goal: explain whether drift is **true missing schema**, **naming drift**, **legacy voter warehouse**, or **missing `@@map`**, so production voter/campaign data is never destroyed by speed.

## Source audit summary

- **Audit slice:** `REDDIRT-PRODUCTION-DB-BASELINE-AUDIT-1.0` · **Generated:** 2026-05-06T22:46:56.588Z
- **Reachable:** true · **`_prisma_migrations`:** false
- **Observed public tables:** 115 · **Prisma models:** 148

## Why baseline is blocked

Prisma expects **PascalCase** tables (e.g. `User`, `WorkflowIntake`) while production shows **snake_case / legacy** names (`users`, `event_requests`, `ar02_voters`). Without reconciliation, **`migrate deploy`**, **`migrate resolve`**, or **`db push`** can mis-apply DDL or corrupt history. **Correct DB is identified** — baseline remains blocked until mapping truth is human-approved.

## Prisma model/table interpretation

Each model’s physical table is `@@map("…")` when present, otherwise the **model name** (Prisma default). Field-level `@map` is counted for operator review (column drift) but does not change table matching here.

## Database table interpretation

Observed names come from **`information_schema`** via the audit (`public.*` only). Matching uses **exact / case / snake / plural / curated legacy aliases** — heuristics, not proof of semantic equivalence.

## Exact matches

- **Count (case-aligned / Prisma table name key):** 0
_None._

## Inferred snake_case/plural matches

- **Count:** 6
- `User → users (inferred_plural_snake)`
- `VolunteerProfile → volunteer_profiles (inferred_plural_snake)`
- `Submission → submissions (inferred_plural_snake)`
- `EventRequest → event_requests (inferred_plural_snake)`
- `MediaAsset → media_assets (inferred_plural_snake)`
- `County → counties (inferred_plural_snake)`

## Legacy alias matches

- **Count:** 5 (curated `LEGACY_ALIASES` in script — operator-maintained).
- `CountyCampaignStats → county_campaign_targets`
- `VoterRecord → voters`
- `RelationalContact → contacts`
- `CampaignEvent → events`
- `EventSignup → volunteer_signups`

## Legacy preserve tables

High-value or warehouse-style **public** tables with **no** confident Prisma model owner in this reconciliation — **do not drop or truncate** while investigating.

- **Count:** 28
- `ar02_voter_dem_lean`
- `ar02_voter_race`
- `ar02_voters`
- `bls_county_economics`
- `contact_origins`
- `contact_voter_matches`
- `county_results`
- `county_turnout`
- `event_notifications`
- `ingestion_write_events`
- `message_audience_members`
- `message_audiences`
- `message_events`
- `path_to_victory`
- `person_profiles`
- `profiles`
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

## Missing Prisma tables

Models with **no** observed public match under current heuristics (safe **create** candidates only after shadow DB + governance — **not** on production blindly).

- **Count:** 137
- `ComplianceDocument`
- `FinancialTransaction`
- `FieldUnit`
- `FieldAssignment`
- `BudgetPlan`
- `BudgetLine`
- `PositionSeat`
- `ContactPreference`
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
- _…102 more in JSON._

## Migration footprint findings

- **Migrations scanned:** 70
- Each entry lists `CREATE TABLE` names (Prisma-style), `ALTER TABLE` targets, type and index counts. See **`data/production-db-schema-reconciliation.json` → `migrationFootprints`**.

## High-value data protection

- This packet **never** exports rows; names and heuristics only.
- Treat **`ar02_*`**, **`voter*`**, **`contacts`**, **`path_to_victory`**, and similar as **production-critical** until a DBA-signed mapping exists.

## Baseline recommendation

- **Strategy:** `split_legacy_and_prisma_domains`
- **`safeToBaselineNow`:** false
- **Reason:** Large legacy-only public surface alongside most Prisma models unmatched by name — treat warehouse / app domains separately before any migrate baseline.
- **Next slice:** `REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0`

## Human review checklist

- [ ] Re-run `node scripts/audit-production-db-baseline.mjs` if the Supabase target changed.
- [ ] Walk **`mappingReviewNeeded`** models in JSON with a DBA (semantic match, not string match).
- [ ] Decide **legacy domain** vs **Prisma app domain** tables; document **`@@map`** decisions in a follow-on packet.
- [ ] Run **shadow** `prisma migrate deploy` only on a **throwaway** database.
- [ ] Only then consider **`REDDIRT-PRODUCTION-DB-BASELINE-EXECUTION-1.0`** or similar — never skip reconciliation.

## Absolute forbidden commands

- `npx prisma migrate deploy` on **production** until this reconciliation is closed and approved.
- `npx prisma migrate resolve` on **production** until this reconciliation is closed and approved.
- `npx prisma db push` on **production** until this reconciliation is closed and approved.
- `npx prisma migrate reset` on **production** until this reconciliation is closed and approved.

## Next recommended slice

**`REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0`** — close Prisma ↔ legacy naming and ownership before Netlify `migrate deploy` or baseline execution.

---

_Machine-readable: [`data/production-db-schema-reconciliation.json`](../data/production-db-schema-reconciliation.json)._

_Prisma ↔ live table @@map alignment (offline): [`docs/prisma-schema-map-alignment.md`](../docs/prisma-schema-map-alignment.md) · [`data/prisma-schema-map-alignment.json`](../data/prisma-schema-map-alignment.json) · [`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md`](../develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md) — `node scripts/align-prisma-schema-map.mjs`._
