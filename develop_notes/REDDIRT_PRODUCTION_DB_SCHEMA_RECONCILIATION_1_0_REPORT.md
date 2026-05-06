# REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0 — report

**Lane:** `RedDirt/` only · **Generated:** 2026-05-06T23:21:26.441Z

## Slice summary

Offline reconciliation between **audit `public.*` table names** and **148 Prisma models** plus **70 migration SQL** files. Determines whether drift is missing schema, naming, legacy warehouse, or `@@map` gaps — **no DB mutations**, **no secrets**. Strategic posture: **correct DB found**, **production data protected**, **baseline still blocked**, **schema reconciliation required** — then Netlify and product work (Email → Calendar → County dashboard → Path to Victory).

## Files created

- `data/production-db-schema-reconciliation.json`
- `docs/production-db-schema-reconciliation.md`
- `develop_notes/REDDIRT_PRODUCTION_DB_SCHEMA_RECONCILIATION_1_0_REPORT.md` (this file)

## Inputs inspected

- `data/production-db-baseline-audit.json`
- `prisma/schema.prisma` (models, `@@map`, `@@schema`, field `@map`)
- `prisma/migrations/**/migration.sql` (**70** files)

## Reconciliation summary

- **Models in matrix:** 148
- **DB-only (unmatched) public tables:** 104
- **Legacy preserve list:** 28
- **Missing Prisma (no observed match):** 137
- **Mapping review needed:** 8

## Legacy/voter data protection status

- **No row export.** Name-level heuristics only.
- High-value / `ar02_*` tables flagged in **`legacyPreserveTables`** and matrix **`riskLevel`** for operator visibility.

## Baseline recommendation

- **Strategy:** `split_legacy_and_prisma_domains`
- **Reason:** Large legacy-only public surface alongside most Prisma models unmatched by name — treat warehouse / app domains separately before any migrate baseline.
- **Next slice:** `REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0`

## Governance status

- **`safeToBaselineNow`:** false — must remain false until execution packet approved.
- **Forbidden:** production `migrate deploy` / `resolve` / `db push` / `reset` (see JSON `absoluteDoNotRunYet`).

## Checks

- `node scripts/reconcile-production-db-schema.mjs`
- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`

## Risks / limitations

- Heuristic matching ≠ semantic truth (e.g. `contacts` could mean multiple domains).
- `LEGACY_ALIASES` must be curated; wrong entries skew **`matchType`**.
- Migration regex may miss exotic DDL.

## Next recommended slice

**REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0**
