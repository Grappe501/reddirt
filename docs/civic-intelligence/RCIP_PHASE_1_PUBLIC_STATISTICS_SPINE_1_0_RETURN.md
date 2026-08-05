# RCIP Phase 1 Return Report

**Mission ID:** `RCIP-PHASE-1-PUBLIC-STATISTICS-SPINE-1.0`  
**Status:** PARTIAL — spine built; live ingestion blocked by unusable API keys  
**Date:** 2026-08-05

## 1. Mission ID

`RCIP-PHASE-1-PUBLIC-STATISTICS-SPINE-1.0`

## 2. Starting commit

`e8eeb10b` on branch `fix/netlify-handler-250mb-volunteer-presentation`

## 3. Ending commit

`4a8eaca4` on branch `fix/netlify-handler-250mb-volunteer-presentation` (not `main`).

## 4. Existing infrastructure found

- County `CountyPublicDemographics` + CSV import (campaign-adjacent; demo seeds exist)
- Census/BLS county adapters: stubs only
- Prisma `multiSchema` (`public`, `auth`)
- H:-drive bootstrap via `scripts/run-with-h-drive-env.cjs`
- Full audit: `RCIP_EXISTING_INFRASTRUCTURE_AUDIT.md`

## 5. Architecture selected

- Isolated logical warehouse: PostgreSQL schema `public_statistics` (SQL prepared under `prisma/migrations_pending/`)
- Phase 1 operator store: H: file warehouse `data/public-statistics/warehouse/`
- Connectors under `src/lib/civic-intelligence/`
- CC export contract v1 + privacy scanner
- See `RCIP_ARCHITECTURE_DECISION.md`

## 6. Database target

Configured hosted Supabase appears in env diagnostics when `.env` is loaded; `publicdata:diagnose` classifies target. **No `public_statistics` migration applied to hosted production.**

## 7. Migration status

Prepared only: `prisma/migrations_pending/20260805000000_rcip_public_statistics/migration.sql`  
Not applied. Not claimed as production.

## 8. Models/tables created

SQL DDL for sources, datasets, series, geographies, releases, source_queries, ingestion_runs, observations, revisions, metric_mappings, cross_checks, exports.  
Prisma models not yet merged into the large live `schema.prisma` (operator-gated to avoid accidental hosted migrate).

## 9. Connectors reused

None production-ready. County stubs intentionally left untouched.

## 10. Connectors created

- Census ACS 5-Year (detail / subject / profile routing)
- BLS timeseries v2
- Shared retry, timeout, safe logging, raw archive, provenance records

## 11. Indicators ingested

Manifest: 12 approved indicators (`cc-phase2-initial-indicators.json`).  
**Accepted observations: 0**

## 12. Observation counts

0 accepted (fail-closed).

## 13. Geography counts

0 (no accepted observations).

## 14. Provenance status

Chain implemented in code (source query → raw checksum → ingestion run → observation → export). Not exercised with live accepted values.

## 15. Cross-check results

Engine ran: `insufficient_data` for ACS LF vs BLS AR unemployment (conceptually related).

## 16. Conflicts found

None (insufficient data).

## 17. Export ID

None generated — export refuses zero-observation payloads.

## 18. Privacy scan

Implemented; unit-tested allowlist + prohibited fields.

## 19. Tests

`npm run publicdata:test` — passed (connector fail-closed, Census normalize, privacy, cross-check, export builder).

## 20. Validation

`publicdata:validate` OK on empty accepted set. Seed runs fail closed when keys are placeholder/invalid.

## 21. Production limitations

1. `CENSUS_API_KEY` rejected by Census API (`Invalid Key` HTML).
2. `BLS_API_KEY` is a non-usable placeholder (`<YOUR_BLS_API_KEY>`).
3. Hosted DB migration not applied.
4. Durable production object storage for raw responses not claimed (H: raw archive only).
5. Working branch is not `main`.
6. `git` not always on PATH in the operator shell (commit helper tries Program Files paths).

## 22. Git push

Operator action after review. Do not claim production deployment of ingestion.

## 23. Deployment status

No new public RedDirt API. No production ingestion claimed.

## 24. Next recommended connector

After usable Census/BLS keys and one green export→CC import: continue Phase 1 proof, then `RCIP-PHASE-2-MULTI-AGENCY-CONNECTOR-EXPANSION-1.0` (BEA / USDA / FCC by CC baseline gap).

## Operator unblock

1. Set valid `CENSUS_API_KEY` and `BLS_API_KEY` in RedDirt `.env.local` (server-side only).
2. `npm run publicdata:all`
3. Copy export to CC via `pnpm publicstats:import --from <H:-path>`
4. Only then map baseline metrics and update public surfaces.
