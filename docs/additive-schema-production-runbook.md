# Additive schema production runbook (manual SQL)

**Slice:** `REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0` · **Lane:** RedDirt only

## Preconditions

1. **Clone proof JSON is fresh** — `data/additive-schema-clone-test-result.json` must show hardened production-like gates (see packet JSON `cloneProofGateDetail`). If not, run `node scripts/test-additive-schema-install-on-clone.mjs` with `REDDIRT_SCHEMA_INSTALL_TEST_DATABASE_URL` on a **non-production** fork, then rebuild this packet.
2. **Supabase PITR / backup** — confirm restore path in dashboard documentation; this runbook does not execute restore.
3. **Correct project** — production Supabase project ref **giozeoqulfojhxpywjil** must match the SQL editor session.

## Forbidden (do not use for this install)

- Raw file `data/sql/unsafe-production-to-current-schema-diff.sql` and any Prisma-generated full diff
- `npx prisma migrate deploy` / `migrate resolve` / `db push` / `reset` against production for this step
- `psql` / `prisma db execute` from automation without Steve approval and without maintenance discipline

## Operator execution (after Steve approval)

1. Record **sha256** of `data/sql/additive-schema-install-candidate.sql` and compare to `data/additive-schema-production-execution-packet.json` → `candidateSqlSha256`.
2. Run `node scripts/run-additive-schema-production-preflight.mjs` with production `DATABASE_URL` / `DIRECT_URL` (script never prints secrets) and confirm `readyForManualExecution` is **true** in `data/additive-schema-production-preflight.json`.
3. **Preferred manual path:** Open Supabase SQL editor for the **production** project (ref above) and paste/run the candidate file per your DBA transaction policy (types → tables → indexes if splitting).
4. **Optional scripted path (operator workstation only):** `node scripts/run-additive-schema-production-guarded.mjs --execute` with all env gates set (see script header). This uses Prisma `$executeRawUnsafe` per parsed statement — **stop on first error**; never use unsupervised CI for `--execute`.
5. On any error, **stop**; rollback is **PITR / restore**, not a hand-written DROP script.

## Rollback / restore notes

- **Preferred:** Supabase **PITR** or backup restore to a point before the SQL window.
- **Not in scope:** destructive “undo” SQL (DROP newly created tables) as a default strategy — treat as last resort and separate human review.

## Post-execution

Follow [`docs/additive-schema-production-postcheck-plan.md`](./additive-schema-production-postcheck-plan.md) and machine JSON `data/additive-schema-production-postcheck-plan.json`.
