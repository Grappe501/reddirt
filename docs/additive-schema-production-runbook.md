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
2. Open Supabase SQL editor for the **production** project (ref above).
3. Run the **entire** candidate file as a single governed transaction only if your operational standard allows; otherwise split by object class (types → tables → indexes) per DBA preference — still additive only.
4. On any error, **stop**; do not partial-apply further sections without analysis. Rollback is **PITR / restore**, not a hand-written DROP script.

## Rollback / restore notes

- **Preferred:** Supabase **PITR** or backup restore to a point before the SQL window.
- **Not in scope:** destructive “undo” SQL (DROP newly created tables) as a default strategy — treat as last resort and separate human review.

## Post-execution

Follow [`docs/additive-schema-production-postcheck-plan.md`](./additive-schema-production-postcheck-plan.md) and machine JSON `data/additive-schema-production-postcheck-plan.json`.
