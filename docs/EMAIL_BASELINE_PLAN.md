# Email baseline plan (generated)

- **Generated:** 2026-05-09T16:31:48.681Z
- **SQL parse note:** regex over migration.sql; may miss unusual DDL; verify with DBA
- **Migration folders scanned:** 72

## Live database (names only)

- Public tables: **16**
- Auth tables: **23**
- Enum types (public+auth): **9**
- Indexes (public+auth): **167** — sample in JSON only

### Public tables

- `import_batches`
- `import_files`
- `import_header_maps`
- `import_match_reviews`
- `import_plans`
- `import_reports`
- `import_rows`
- `import_voter_matches`
- `initiative_nonvoter_entries`
- `petitions`
- `review_candidate_snapshots`
- `voter_file_ai_chunks`
- `voter_file_ai_ingest_runs`
- `voter_petition_signature_events`
- `voter_petition_signatures`
- `voter_supplement_by_id`

### Auth tables

- `audit_log_entries`
- `custom_oauth_providers`
- `flow_state`
- `identities`
- `instances`
- `mfa_amr_claims`
- `mfa_challenges`
- `mfa_factors`
- `oauth_authorizations`
- `oauth_client_states`
- `oauth_clients`
- `oauth_consents`
- `one_time_tokens`
- `refresh_tokens`
- `saml_providers`
- `saml_relay_states`
- `schema_migrations`
- `sessions`
- `sso_domains`
- `sso_providers`
- `users`
- `webauthn_challenges`
- `webauthn_credentials`

## Migrations aggregate

- Distinct CREATE TABLE targets: **157**
- Distinct CREATE TYPE (enum) targets: **181**
- Distinct CREATE INDEX names: **455**

## Collisions

### Table CREATE collisions

*(none detected)*

### Enum TYPE collisions

*(none detected)*

### Index name collisions

*(none detected)*

## Migration folders touching already-live tables

*(none)*

## ECC readiness

**Absent:** `User`, `VolunteerProfile`, `ContactPreference`, `StaffGmailAccount`, `SendGridEvent`, `EmailContactImportBatch`, `EmailContactImportRow`, `EmailContactImportDecision`, `EmailAudienceDefinition`, `EmailAudiencePreviewRun`, `MessageStudioDraft`, `MessageStudioDraftRevision`, `SendGridContactSyncRun`, `EmailSendExecution`, `EmailSendRecipient`, `EmailSendApproval`

## Core RedDirt readiness

**Absent:** `User`, `VolunteerProfile`, `ContactPreference`

## Recommendation

Candidate path: add synthetic baseline marker migration, mark only that marker as applied, then run migrate deploy — after backup/snapshot + DBA review of this report.

**Synthetic baseline candidate:** yes (pending DBA + backup)

## Candidate commands (NOT RUN)

```text
# NOT RUN — review backup + EMAIL_BASELINE_PLAN.md first
mkdir prisma/migrations/00000000000000_existing_supabase_legacy_baseline
# prisma/migrations/00000000000000_existing_supabase_legacy_baseline/migration.sql — no-op baseline marker, example:
# ---
# -- Synthetic legacy baseline: no DDL against existing Supabase + legacy public tables.
# SELECT 1;
# ---
npx prisma migrate resolve --applied 00000000000000_existing_supabase_legacy_baseline
npx prisma migrate deploy
```

Machine-readable: `docs/email-baseline-plan-output.json`.
