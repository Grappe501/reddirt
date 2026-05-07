# Production baseline execution packet (DRAFT)

This is a **draft** execution packet. The **formal gated packet** is **REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0** — see [`production-baseline-execution-packet.md`](./production-baseline-execution-packet.md) · [`data/production-baseline-execution-packet.json`](../data/production-baseline-execution-packet.json) · `node scripts/build-production-baseline-execution-packet.mjs`.

This draft remains for historical reference. Do not execute until shadow proof passes and Steve explicitly approves.

**Pre-execution review (offline, no approval implied):** [`production-baseline-execution-review.md`](./production-baseline-execution-review.md) · [`data/production-baseline-execution-review.json`](../data/production-baseline-execution-review.json) · [`data/production-baseline-execution-review-validation.json`](../data/production-baseline-execution-review-validation.json) · [`production-baseline-command-checklist.md`](./production-baseline-command-checklist.md) · [`data/production-baseline-command-checklist.json`](../data/production-baseline-command-checklist.json) · [`netlify-production-retry-readiness.md`](./netlify-production-retry-readiness.md) · [`data/netlify-production-retry-readiness.json`](../data/netlify-production-retry-readiness.json) · [`develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_REVIEW_1_0_REPORT.md`](../develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_REVIEW_1_0_REPORT.md) · `node scripts/review-production-baseline-execution.mjs` · `node scripts/validate-production-baseline-execution-review.mjs` · shadow / dependency artifacts: [`shadow-db-migration-proof.md`](./shadow-db-migration-proof.md) · [`migration-dependency-repair.md`](./migration-dependency-repair.md) · [`develop_notes/REDDIRT_SHADOW_PROOF_ARTIFACT_CONSOLIDATION_1_0_REPORT.md`](../develop_notes/REDDIRT_SHADOW_PROOF_ARTIFACT_CONSOLIDATION_1_0_REPORT.md) · `node scripts/validate-migration-dependency-repair.mjs` · `node scripts/write-shadow-proof-artifact-from-local-result.mjs` · `node scripts/validate-shadow-db-migration-proof.mjs`.

## Prerequisites

- Shadow / clone proof completed per docs/production-db-shadow-proof-plan.md.
- PITR or full logical backup of production confirmed by operator.
- Steve explicit written approval for any production migration or baseline action.
- DATABASE_URL / DIRECT_URL reviewed for correct Supabase project (no secret values in tickets).

## Required shadow proof artifacts

- data/prisma-schema-map-patch-validation.json with status pass
- Archived prisma migrate diff output from shadow database
- Operator sign-off on column-level compatibility for each @@map applied

## Forbidden commands before approval

- `npx prisma migrate deploy (production)`
- `npx prisma migrate resolve (production)`
- `npx prisma db push (production)`
- `npx prisma migrate reset`
- `INSERT/UPDATE/DELETE/TRUNCATE/DROP against production`

## Candidate baseline command pattern (human review only)

```text
# Example pattern only — NOT an instruction to run:
# (shadow) DATABASE_URL=<shadow> DIRECT_URL=<shadow-direct> npx prisma migrate deploy
# (production) — blocked until disclaimer removed and approval recorded
```

## Rollback / restore

- Restore from Supabase PITR or verified backup if post-deploy verification fails.
- Do not delete backups until successful smoke test window closes.

## Netlify deploy retry

- Confirm build env DATABASE_URL targets intended database (staging vs production).
- Re-run Netlify build after prisma migrate status is green on target DB.
- If build fails on prisma generate only, fix schema drift on shadow first.

## Hosted DB proof route

- Point diagnostic route at shadow URL in staging.
- Verify read-only metadata and health checks; no voter row export.

---

Artifact: `data/production-baseline-execution-packet-draft.json`
