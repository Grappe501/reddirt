# Migration history baseline runbook

**Slice:** `REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0`

## Preconditions

1. [`data/post-additive-production-postcheck-proof.json`](../data/post-additive-production-postcheck-proof.json) current (POSTCHECK PASS).
2. Run [`data/migration-history-production-preflight.json`](../data/migration-history-production-preflight.json) via `node scripts/run-migration-history-production-preflight.mjs` with `DATABASE_URL` set (never paste URI into chat).
3. Optional: `node scripts/test-migration-history-baseline-on-clone.mjs` with `REDDIRT_MIGRATION_HISTORY_TEST_DATABASE_URL`.

## Operator sequence (after Steve approval — not automated here)

1. Backup / PITR proof.
2. For each migration in [`data/migration-history-baseline-command-list.json`](../data/migration-history-baseline-command-list.json): `npx prisma migrate resolve --applied "<name>"` **only if** production schema already matches that migration’s outcome (additive + prior DDL).
3. Re-check `npx prisma migrate status`.
4. **Separate** decision for `migrate deploy` (often no-op after resolve) — not bundled as automatic in guarded runner without explicit approval.

## Forbidden

- `prisma migrate deploy` on production without resolving pending/history strategy.
- `db push`, `migrate reset`, raw diff, additive candidate re-run.
