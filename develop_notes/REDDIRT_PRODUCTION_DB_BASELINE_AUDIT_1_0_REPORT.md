# REDDIRT-PRODUCTION-DB-BASELINE-AUDIT-1.0 — required report

**Lane:** `RedDirt/` only · **Generated:** 2026-05-06T22:46:56.588Z

## Slice summary

Read-only catalog audit (**REDDIRT-PRODUCTION-DB-BASELINE-AUDIT-1.0**) before Prisma baseline, `migrate resolve`, `db push`, or reset on non-disposable Supabase data. Outputs JSON + operator markdown; **no** DB writes.

## Files created

_Per run, the script (re)materializes:_

- `data/production-db-baseline-audit.json` — structured audit (`schemaVersion` **1.0**).
- `docs/production-db-baseline-audit.md` — operator markdown (required sections).
- `develop_notes/REDDIRT_PRODUCTION_DB_BASELINE_AUDIT_1_0_REPORT.md` — this report.

## Files modified

- `scripts/audit-production-db-baseline.mjs` — source for the audit (change in repo, not overwritten by the script).
- `.gitignore` — should list Supabase introspection scratch files (see **Scratch File Protection** in repo).

## Read-only proof

- Script uses **fixed `SELECT`** statements only (`information_schema`, `pg_class`, `pg_namespace`, `pg_type`, `pg_enum`).
- **No** `INSERT` / `UPDATE` / `DELETE` / `DROP` / `TRUNCATE`.
- **No** application row payloads in JSON or markdown.

## DB baseline status

- **Reachable:** true
- **`_prisma_migrations` exists:** false
- **Observed tables (public+auth):** 138
- **Prisma models:** 148
- **Public tables not in Prisma:** 115
- **Prisma public tables not observed:** 148
- **Baseline risk (heuristic):** `high_non_empty_without_prisma_migration_history`

## High-value data protection status

- **Name-pattern “high value” tables:** 33 (metadata only; see `docs/production-db-baseline-audit.md`).
- **Voter / PII row export:** **not performed** by this slice.

## Scratch file protection

The following paths must stay in `.gitignore` (local introspection / diff scratch only):

- `tmp-supabase-introspection.schema.prisma`
- `supabase-introspection.prisma`
- `supabase-introspection.stderr.txt`
- `supabase-to-local-prisma-diff.sql`
- `supabase-to-local-prisma-diff.stderr.txt`

## Checks

- `node scripts/audit-production-db-baseline.mjs` — regenerates JSON, `docs/production-db-baseline-audit.md`, and this report.
- `npm run typecheck` — lane TypeScript.
- `npm run check` — lint + typecheck + build.
- `npm run email:no-send-scan` — no-send governance scan (Comms lane).

## Risks / limitations

- **`reltuples`** are **estimates**; do not use for compliance-level row counts.
- **Wrong `DATABASE_URL`** produces a valid-looking audit that does **not** describe the campaign database.
- **Auth schema** tables always appear as “not in Prisma” for a typical single-schema Prisma app — expected.
- JSON shape is stable for automation; **do not** treat `safeToBaselineNow` as human approval.

## Next recommended slice

**REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0**

Large Prisma/public mismatch, multiple public tables outside Prisma, or elevated baseline risk — reconcile live schema vs repo before a baseline packet.
