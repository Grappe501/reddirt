# RCIP Operator Runbook

## Prerequisites

```powershell
cd H:\SOSWebsite\RedDirt
# Use existing H:-only bootstrap (run-with-h-drive-env.cjs via npm scripts)
```

Confirm:

1. `CENSUS_API_KEY` / `BLS_API_KEY` present (values never printed)
2. Database target via existing diagnose workflow
3. Raw archive path exists under `data/public-statistics/raw/`

## Commands

```text
npm run publicdata:diagnose
npm run publicdata:census:seed
npm run publicdata:bls:seed
npm run publicdata:crosscheck
npm run publicdata:validate
npm run publicdata:export:cc
npm run publicdata:report
npm run publicdata:all
```

## Seed discipline

Use the approved indicator manifest only. Do not trigger unbounded API ingestion.

## Fail-closed

If keys missing, DB target unclear, or privacy scan fails: do not claim successful production ingestion/export.

## Migration

Additive `public_statistics` migrations only after:

1. Confirm DATABASE_URL / DIRECT_URL classification
2. Review SQL (no destructive statements)
3. Document rollback
4. Prefer local Docker proof before hosted apply
