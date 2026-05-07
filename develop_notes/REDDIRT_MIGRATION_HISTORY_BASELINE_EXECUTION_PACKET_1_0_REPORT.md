# REDDIRT_MIGRATION_HISTORY_BASELINE_EXECUTION_PACKET_1_0_REPORT

**Lane:** RedDirt only  
**Slice:** `REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0`  
**Generated:** 2026-05-07 (packet build + validation chain)

## 1. Slice summary

Governed **migration-history baseline execution packet**: offline packet builder, read-only production preflight (when `DATABASE_URL` is set), optional clone proof runner (`REDDIRT_MIGRATION_HISTORY_TEST_DATABASE_URL`), guarded dry-run, validator, and postcheck plan. **No** production `_prisma_migrations` writes from this Cursor run; **no** `migrate deploy` / `resolve` on production from agents.

## 2. Files created

| Path |
|------|
| `scripts/build-migration-history-baseline-execution-packet.mjs` |
| `scripts/validate-migration-history-baseline-execution-packet.mjs` |
| `scripts/run-migration-history-production-preflight.mjs` |
| `scripts/test-migration-history-baseline-on-clone.mjs` |
| `scripts/run-migration-history-baseline-guarded.mjs` |
| `scripts/verify-migration-history-postcheck.mjs` |
| `data/migration-history-baseline-execution-packet.json` |
| `data/migration-history-baseline-approval-gates.json` |
| `data/migration-history-baseline-command-list.json` |
| `data/migration-history-production-preflight.json` |
| `data/migration-history-baseline-clone-proof.json` |
| `data/migration-history-baseline-guarded-dry-run.json` |
| `data/migration-history-postcheck-plan.json` |
| `data/post-migration-history-netlify-readiness.json` |
| `data/migration-history-baseline-execution-packet-validation.json` |
| `docs/migration-history-baseline-execution-packet.md` |
| `docs/migration-history-baseline-approval-gates.md` |
| `docs/migration-history-baseline-runbook.md` |
| `docs/migration-history-baseline-clone-proof.md` |
| `docs/migration-history-postcheck-plan.md` |
| `docs/post-migration-history-netlify-readiness.md` |

## 3. Files modified

| Path |
|------|
| `docs/PROJECT_MASTER_MAP.md` |
| `docs/THREAD_HANDOFF_MASTER_MAP.md` |
| `docs/campaign-email-command-center-progress-ledger.md` |
| `docs/email-command-center-launch-hardening.md` |
| `docs/production-db-test-readiness.md` (append if not duplicate) |
| `docs/netlify-production-retry-readiness.md` (append) |
| `docs/hosted-db-proof-after-baseline.md` (append) |
| `docs/post-additive-schema-netlify-readiness.md` (prior slice; unchanged this run unless touched) |

## 4. Source artifacts inspected

`data/post-additive-production-postcheck-proof.json`, `data/post-additive-production-schema-status.json`, `data/prisma-migration-history-status.json`, `data/post-additive-migration-history-strategy.json`, `data/post-additive-netlify-readiness-decision.json`, `data/migration-history-baseline-guarded-plan.json`, `data/additive-schema-production-postcheck-plan.json`, `data/additive-schema-clone-test-result.json`, `data/additive-schema-install-validation.json`, `prisma/migrations/**` (directory listing), `prisma/schema.prisma` (existence only from packet builder).

## 5. Production post-additive status

Per operator proof: **POSTCHECK PASS**, **249** public tables, additive SQL **did not** baseline `_prisma_migrations`, production ref **giozeoqulfojhxpywjil**, required new app + legacy tables listed in proof.

## 6. Migration command list

`data/migration-history-baseline-command-list.json`: **71** entries, each `npx prisma migrate resolve --applied "<name>"` with **`DO_NOT_RUN_YET`**. Known risks flagged in packet: **`20260505203000_email_contact_profile_graph`**, deferred FK **`20260515121000_email_contact_profile_relational_contact_fkey`**.

## 7. Production preflight status

`data/migration-history-production-preflight.json`: In this agent run, **`DATABASE_URL` was not set** — artifact written with blockers; full hosted probes and `prisma migrate status` require operator machine with canonical production URL (never paste secrets into chat).

## 8. Clone baseline proof status

**BLOCKED** — `REDDIRT_MIGRATION_HISTORY_TEST_DATABASE_URL` unset. `data/migration-history-baseline-clone-proof.json` records `configured: false`, `nextRecommendedSlice`: `REDDIRT-MIGRATION-HISTORY-BASELINE-CLONE-PROOF-1.0`.

## 9. Approval gates status

All **pending** in `data/migration-history-baseline-approval-gates.json` (14 gates).

## 10. Guarded runner status

`node scripts/run-migration-history-baseline-guarded.mjs --dry-run` executed; **`data/migration-history-baseline-guarded-dry-run.json`** written. **`--execute` not run** (would mutate `DATABASE_URL` target).

## 11. Postcheck plan

`node scripts/verify-migration-history-postcheck.mjs` wrote `data/migration-history-postcheck-plan.json` and `docs/migration-history-postcheck-plan.md`.

## 12. Netlify readiness impact

`data/post-migration-history-netlify-readiness.json` / `docs/post-migration-history-netlify-readiness.md`: Netlify production retry **remains blocked** until baseline executed + postcheck + separate Steve slice. `scripts/netlify-build.sh` still runs `npx prisma migrate deploy`.

## 13. Email / Communication Command Center impact

No send-path changes. After `_prisma_migrations` alignment, hosted gates (`email:db:diagnose`, `migrate deploy` on hosted URL per existing docs) become operable **only** under separate operator control — not implied by this packet.

## 14. Calendar readiness impact

No calendar schema or sync code changes. Google calendar migrations remain subject to normal `migrate` discipline once history is aligned.

## 15. Governance status

- Raw Prisma diff: still **do not execute**.
- Netlify retry: **not approved**.
- Live send: **not approved**.
- Optional selfbuild validators: **ran** (`validate-selfbuild-slice`, `boundaries`, `dependency-graph`, `queue`) — confirm exit 0 in terminal if any failed, re-run locally.

## 16. Checks

| Command | Result |
|---------|--------|
| `node scripts/build-migration-history-baseline-execution-packet.mjs` | PASS |
| `node scripts/verify-migration-history-postcheck.mjs` | PASS |
| `node scripts/run-migration-history-production-preflight.mjs` | WARN (no DATABASE_URL in agent env) |
| `node scripts/test-migration-history-baseline-on-clone.mjs` | BLOCKED (no clone URL) |
| `node scripts/run-migration-history-baseline-guarded.mjs --dry-run` | PASS |
| `node scripts/validate-migration-history-baseline-execution-packet.mjs` | PASS |
| `npx prisma validate` | PASS |
| `npm run typecheck` | PASS |
| `npm run check` | PASS (exit 0) |
| `npm run email:no-send-scan` | WARN baseline, exit 0 |

## 17. Risks / limitations

- **Preflight** without production URL cannot confirm live table set or `_prisma_migrations` row count.
- **`migrate resolve` on production** must only follow Steve approval + PITR + proof that each migration’s DDL is already satisfied (additive + prior state).
- **Clone proof** strongly recommended before operator execution on production.

## 18. Next recommended slice

`REDDIRT-MIGRATION-HISTORY-BASELINE-OPERATOR-GATE-1.0` (after clone proof optional + hosted preflight green).

---

## Required answers

| Question | Answer |
|----------|--------|
| Did this mutate production? | **NO** |
| Did this write `_prisma_migrations` on production? | **NO** |
| Did this run `migrate deploy`? | **NO** (clone script would on clone only; not executed here) |
| Did this run `migrate resolve` on production? | **NO** |
| `db push` / `migrate reset`? | **NO** |
| Approve Netlify retry? | **NO** |
| Approve live send? | **NO** |
| Baseline execution packet prepared? | **YES** |
| Automatic execution allowed? | **NO** |
| Clone baseline proof passed? | **BLOCKED** (no test URL) |
| What must Steve approve next? | Phrase **`STEVE_APPROVES_REDDIRT_MIGRATION_HISTORY_BASELINE_EXECUTION`** plus written backup/PITR and migration command list review before any production `migrate resolve`. |
