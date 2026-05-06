# Production database baseline audit (read-only)

**Slice:** `REDDIRT-PRODUCTION-DB-BASELINE-AUDIT-1.0` · **Schema version:** `1.0` · **Generated:** 2026-05-06T22:46:56.588Z

## Purpose

Provide a **read-only** snapshot of PostgreSQL **catalog metadata** for the database pointed at by `DATABASE_URL`, scoped to **public** and **auth**, so operators can judge **Prisma baseline / migration risk** without exporting voter rows or mutating the database.

## Why this audit exists

Netlify and CI may fail with **Prisma P3005** when the database is **non-empty** and lacks **`_prisma_migrations`**. A blind `prisma db pull`, baseline, `migrate resolve`, `db push`, or reset against a database that holds **voter file** and **campaign** data is unacceptable. This audit captures **what exists** (table names, enum names, planner statistics) **before** any migration tooling runs.

## What was inspected

- **Connection:** `DATABASE_URL` (value **never** printed by this script).
- **information_schema.tables** — base tables in `public` and `auth`.
- **information_schema.columns** — single aggregate probe (row count only) to prove column catalog access without listing columns in markdown.
- **pg_class** + **pg_namespace** — ordinary tables; **`reltuples`** used as **estimated** row counts (not exact counts).
- **pg_type** + **pg_enum** — enum types in `public` and `auth`.
- **Prisma schema:** `prisma/schema.prisma` — model names and `@@map("…")` table names when present.
- **Migration table probe:** whether **`public._prisma_migrations`** exists.

## What was not inspected

- **No** application row data, voter payloads, email bodies, or file contents.
- **No** sequences, extensions, RLS policies, views, materialized views, functions, triggers, or foreign-key graphs (unless implied by table list only).
- **No** schemas outside **public** and **auth** (e.g. `storage`, `graphql_public`).
- **No** performance benchmarks, lock checks, or replication status.
- **No** secrets: URLs, passwords, tokens are not written to disk by this tool.

## Existing migration history status

- **`public._prisma_migrations` present:** **false**
- **Database reachable:** **true**

_Prisma `migrate deploy` expects migration history on the target database unless an operator-approved baseline strategy says otherwise._

## Public/auth schema summary

- **Observed base tables (all schemas in scope):** 138
  - **public:** 115
  - **auth:** 23
- **Observed enums:** 9
- **Prisma models (expected public tables by default):** 148

### public tables (115)

- `public.ar02_voter_dem_lean`
- `public.ar02_voter_race`
- `public.ar02_voters`
- `public.ballot_initiatives`
- `public.ballot_items`
- `public.bls_county_economics`
- `public.candidates`
- `public.census_block_groups`
- `public.census_demographics`
- `public.census_tracts`
- `public.civic_engagement_index`
- `public.contact_origins`
- `public.contact_voter_matches`
- `public.contacts`
- `public.contest_partisan_index`
- `public.contests`
- `public.counties`
- `public.county_campaign_targets`
- `public.county_results`
- `public.county_turnout`
- `public.donations`
- `public.election_candidates`
- `public.election_contests`
- `public.election_results`
- `public.elections`
- `public.event_notifications`
- `public.event_requests`
- `public.events`
- `public.external_intelligence_sources`
- `public.external_records`
- `public.followups`
- `public.geographic_scores`
- `public.geographic_units`
- `public.geography_leaders`
- `public.ingestion_entities`
- `public.ingestion_extractions`
- `public.ingestion_files`
- `public.ingestion_jobs`
- `public.ingestion_mapping_suggestions`
- `public.ingestion_reviews`
- `public.ingestion_write_events`
- `public.initiative_signatures`
- `public.intelligence_links`
- `public.interactions`
- `public.leadership_roles`
- `public.locations`
- `public.media_assets`
- `public.media_entity_links`
- `public.media_tags`
- `public.message_audience_members`
- `public.message_audiences`
- `public.message_campaigns`
- `public.message_events`
- `public.message_queue`
- `public.message_templates`
- `public.organization_types`
- `public.organizations`
- `public.organizer_assignments`
- `public.organizing_targets`
- `public.organizing_unit_hierarchy`
- `public.organizing_unit_memberships`
- `public.organizing_unit_types`
- `public.organizing_units`
- `public.path_to_victory`
- `public.people`
- `public.person_geography`
- `public.person_profiles`
- `public.petition_signatures`
- `public.petitions`
- `public.precinct_scores`
- `public.profiles`
- `public.results`
- `public.runoff_fracture_index`
- `public.shifts`
- `public.spatial_ref_sys`
- `public.statewide_win_targets`
- `public.submissions`
- `public.target_universes`
- `public.tasks`
- `public.telemetry_events`
- … _35 more — see `data/production-db-baseline-audit.json`._

### auth tables (23, sample)

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

## High-value data tables

Tables whose **names** match campaign-sensitive keywords (`voter`, `contact`, `profile`, `county`, `email`, `audience`, `relational`, `event` — case-insensitive). **This is naming heuristics only**, not a data classification.

- `public.ar02_voter_dem_lean` — estimated rows (`pg_class.reltuples`): **0**
- `public.ar02_voter_race` — estimated rows (`pg_class.reltuples`): **0**
- `public.ar02_voters` — estimated rows (`pg_class.reltuples`): **0**
- `public.bls_county_economics` — estimated rows (`pg_class.reltuples`): **0**
- `public.contact_origins` — estimated rows (`pg_class.reltuples`): **0**
- `public.contact_voter_matches` — estimated rows (`pg_class.reltuples`): **0**
- `public.contacts` — estimated rows (`pg_class.reltuples`): **0**
- `public.county_campaign_targets` — estimated rows (`pg_class.reltuples`): **75**
- `public.county_results` — estimated rows (`pg_class.reltuples`): **0**
- `public.county_turnout` — estimated rows (`pg_class.reltuples`): **0**
- `public.event_notifications` — estimated rows (`pg_class.reltuples`): **0**
- `public.event_requests` — estimated rows (`pg_class.reltuples`): **0**
- `public.events` — estimated rows (`pg_class.reltuples`): **0**
- `public.ingestion_write_events` — estimated rows (`pg_class.reltuples`): **0**
- `public.message_audience_members` — estimated rows (`pg_class.reltuples`): **0**
- `public.message_audiences` — estimated rows (`pg_class.reltuples`): **0**
- `public.message_events` — estimated rows (`pg_class.reltuples`): **0**
- `public.person_profiles` — estimated rows (`pg_class.reltuples`): **0**
- `public.profiles` — estimated rows (`pg_class.reltuples`): **0**
- `public.telemetry_events` — estimated rows (`pg_class.reltuples`): **0**
- `public.training_events` — estimated rows (`pg_class.reltuples`): **0**
- `public.volunteer_profiles` — estimated rows (`pg_class.reltuples`): **0**
- `public.voter_block_group_map` — estimated rows (`pg_class.reltuples`): **0**
- `public.voter_geocoded` — estimated rows (`pg_class.reltuples`): **0**
- `public.voter_import_batches` — estimated rows (`pg_class.reltuples`): **0**
- `public.voter_party_model` — estimated rows (`pg_class.reltuples`): **228550**
- `public.voter_profiles` — estimated rows (`pg_class.reltuples`): **0**
- `public.voter_registry` — estimated rows (`pg_class.reltuples`): **0**
- `public.voter_scores` — estimated rows (`pg_class.reltuples`): **1804933**
- `public.voter_vote_history` — estimated rows (`pg_class.reltuples`): **0**
- `public.voter_vote_history_raw` — estimated rows (`pg_class.reltuples`): **1921980**
- `public.voters` — estimated rows (`pg_class.reltuples`): **1805038**
- `public.youth_profiles` — estimated rows (`pg_class.reltuples`): **0**

## Prisma expected table comparison

- **Prisma-mapped public tables not observed in `information_schema`:** 148
- **Observed tables not mapped in Prisma** (includes all `auth.*` and any Supabase-only `public.*`): 138

### Sample: public tables not in Prisma (`115` total)

- `public.ar02_voter_dem_lean`
- `public.ar02_voter_race`
- `public.ar02_voters`
- `public.ballot_initiatives`
- `public.ballot_items`
- `public.bls_county_economics`
- `public.candidates`
- `public.census_block_groups`
- `public.census_demographics`
- `public.census_tracts`
- `public.civic_engagement_index`
- `public.contact_origins`
- `public.contact_voter_matches`
- `public.contacts`
- `public.contest_partisan_index`
- `public.contests`
- `public.counties`
- `public.county_campaign_targets`
- `public.county_results`
- `public.county_turnout`
- `public.donations`
- `public.election_candidates`
- `public.election_contests`
- `public.election_results`
- `public.elections`
- `public.event_notifications`
- `public.event_requests`
- `public.events`
- `public.external_intelligence_sources`
- `public.external_records`
- `public.followups`
- `public.geographic_scores`
- `public.geographic_units`
- `public.geography_leaders`
- `public.ingestion_entities`
- `public.ingestion_extractions`
- `public.ingestion_files`
- `public.ingestion_jobs`
- `public.ingestion_mapping_suggestions`
- `public.ingestion_reviews`
- … _75 more — see `data/production-db-baseline-audit.json`._

### Sample: Prisma tables missing from public snapshot (`148` total)

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
- … _108 more — see `data/production-db-baseline-audit.json`._

## Baseline risk

**Heuristic label:** `high_non_empty_without_prisma_migration_history`

- **Script policy `safeToBaselineNow`:** **false** (always **false** until explicit human governance overrides this document).

### Warnings from this run

- 148 Prisma-mapped public table(s) not found in information_schema snapshot (case or naming drift, or different database).
- public schema contains multiple tables not present in prisma/schema.prisma — expect a large baseline diff if introspecting.

## Recommended next step

Use a human-reviewed path (e.g. shadow DB or SQL-backed baseline plan) before migrate deploy / db push; keep this audit as the pre-change snapshot.

**Narrative:** Live database has no _prisma_migrations table while Prisma expects migration history for deploy — combined with non-trivial public/auth objects, blind baseline is unsafe.

**Steering (computed):** **`REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0`** — Large Prisma/public mismatch, multiple public tables outside Prisma, or elevated baseline risk — reconcile live schema vs repo before a baseline packet.

## Absolute forbidden actions

On the **production** (or production-equivalent) database targeted by this audit:

- **No** `prisma migrate reset`, **no** destructive SQL (`DROP`, `TRUNCATE`, bulk `DELETE`).
- **No** `prisma db push` against shared voter/campaign data without an approved plan.
- **No** `prisma migrate resolve` that lies about migration history.
- **No** data exports of voter rolls or PII as part of “baseline debugging”.
- **No** committing `.env`, secrets, or full connection strings into the repo, docs, or chat.

## Operator checklist before any baseline

- [ ] Confirm **`DATABASE_URL`** points at the **intended** environment (not a disposable or default Supabase project).
- [ ] Re-run `node scripts/audit-production-db-baseline.mjs` and archive `data/production-db-baseline-audit.json` with a dated filename if you keep history.
- [ ] Read **Warnings** and **Prisma comparison** sections above; resolve “wrong database” signals before interpreting drift.
- [ ] Ensure **`DIRECT_URL` / session** strategy is documented for migration hosts if using a pooler on `DATABASE_URL`.
- [ ] Obtain **explicit** approval for the next slice (**`REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0`**) before Prisma baseline or migration repair.
- [ ] Run `npm run email:db:diagnose` / gates relevant to your lane **after** DB target is confirmed.

---

_Machine-readable twin: [`data/production-db-baseline-audit.json`](../data/production-db-baseline-audit.json)._
