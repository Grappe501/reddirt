# Shadow DB migration proof (REDDIRT-SHADOW-PROOF-ARTIFACT-CONSOLIDATION-1.0)

## Purpose

Persist **machine-readable** evidence that the Prisma migration chain is consistent and (when applicable) that a **disposable** shadow database applied all migrations with **no drift** vs `prisma/migrations`.

## Artifacts

| File | Role |
|------|------|
| [`data/shadow-db-migration-proof.json`](../data/shadow-db-migration-proof.json) | Primary proof payload |
| [`data/shadow-db-migration-proof-validation.json`](../data/shadow-db-migration-proof-validation.json) | Shape + policy checks from `validate-shadow-db-migration-proof.mjs` |

## How artifacts are produced

1. **Offline consolidated (no DB socket in this run)** — default when you do **not** pass `--live-shadow-from-env`:

   ```text
   node scripts/validate-migration-dependency-repair.mjs
   node scripts/write-shadow-proof-artifact-from-local-result.mjs
   ```

   Records `offlineConsolidatedAttestation: true` after dependency repair validation passes, **`npx prisma validate`**, and **71** migration folders. Use when reproducing the exact disposable shadow URL in CI is not available.

2. **Live shadow (optional re-proof)** — disposable Postgres only:

   ```text
   set REDDIRT_SHADOW_DATABASE_URL=postgresql://...   # disposable DB only — do not use production
   node scripts/write-shadow-proof-artifact-from-local-result.mjs --live-shadow-from-env
   ```

   Runs **`prisma migrate deploy`** and **`prisma migrate diff`** against that URL. Never commit secrets; the proof JSON must not contain connection strings.

## Related

- [`migration-dependency-repair.md`](./migration-dependency-repair.md)  
- [`production-baseline-execution-review.md`](./production-baseline-execution-review.md)  
- `node scripts/review-production-baseline-execution.mjs`
