# REDDIRT_PRODUCTION_ADDITIVE_SCHEMA_INSTALL_PLAN_1_0_REPORT

**Slice:** `REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0`  
**Lane:** `RedDirt/` only

## Slice summary

Implemented **Phase 2–5** of the additive schema install packet: the **build** script now parses **`data/sql/unsafe-production-to-current-schema-diff.sql`** together with **`data/production-db-baseline-audit.json`** to emit a **curated additive-only** candidate, **offline validation** with audit-aware checks, a **clone/shadow runner** (optional URL), and a **production execution review draft**. **The raw Prisma diff is not safe to execute** — it is evidence and input only.

## Files created

- `data/additive-schema-manual-allowlists.json` — optional `fkLegacyTargets` + `highRiskVoterTables` allowlists (empty defaults).

## Files modified

**Scripts:** `scripts/build-additive-schema-install-candidate.mjs`, `scripts/validate-additive-schema-install-candidate.mjs`, `scripts/test-additive-schema-install-on-clone.mjs`, `scripts/build-additive-schema-production-execution-review.mjs`, `scripts/analyze-unsafe-production-diff.mjs` (generated MD now includes the safety banner).

**Data / SQL:** `data/sql/additive-schema-install-candidate.sql`, `data/sql/additive-schema-install-rejected-statements.sql`, `data/sql/additive-schema-install-review-notes.sql`, `data/additive-schema-install-plan.json`, `data/additive-schema-install-validation.json`, `data/additive-schema-clone-test-result.json`, `data/additive-schema-production-execution-review.json`, plus regenerated unsafe analysis artifacts when analyze runs.

**Docs:** `docs/additive-schema-install-plan.md`, `docs/additive-schema-clone-test-plan.md`, `docs/additive-schema-production-execution-review.md`, `docs/unsafe-production-schema-diff-analysis.md`, `docs/production-db-test-readiness.md`, `docs/netlify-production-retry-readiness.md`, `docs/email-command-center-launch-hardening.md`, `docs/campaign-email-command-center-progress-ledger.md`, `docs/PROJECT_MASTER_MAP.md`, `docs/THREAD_HANDOFF_MASTER_MAP.md`.

**Report:** this file.

## Source diff status

- **Present:** `data/sql/unsafe-production-to-current-schema-diff.sql` (read-only input to build).
- **Safety:** **The raw Prisma diff is not safe to execute** — see `docs/unsafe-production-schema-diff-analysis.md` / `data/unsafe-production-schema-diff-analysis.json`.

## Unsafe diff analysis

Machine counts and samples are in `data/unsafe-production-schema-diff-analysis.json` (e.g. large `ALTER` / `DROP` / `auth` mutation footprint). **Do not apply** the raw file to production.

## Additive candidate summary

- **Source:** unsafe diff SQL + `observed.tables` / `observed.enums` from baseline audit.
- **Included (latest run):** 704 statements — see `data/additive-schema-install-plan.json` (`createTypeIncluded`, `createTableIncluded`, `createIndexIncluded`, `alterTableIncluded`).
- **Rejected:** 628 statements logged in `data/sql/additive-schema-install-rejected-statements.sql` with `reason=…` comments.
- **Policy highlights:** no `DROP` / destructive DML; no provider schemas; no `CREATE TABLE` for tables already in audit; no `CREATE INDEX` except on tables accepted as new in this pass; no `ALTER` except `ADD CONSTRAINT` / `ADD FOREIGN KEY` on those new tables, with **FKs to legacy `public` tables rejected** unless whitelisted in `data/additive-schema-manual-allowlists.json`; high-risk **voter** semantic names excluded unless allowlisted.

## Candidate validation status

- **File:** `data/additive-schema-install-validation.json`
- **Latest:** `status: pass`, `safeForCloneTest: true`, `safeForProduction: false` (always false).
- **Checks include:** required header token `DO NOT RUN ON PRODUCTION`, forbidden tokens, audit presence, no `CREATE TABLE` against observed public tables, no high-risk voter tables in candidate (unless allowlisted).

## Clone / shadow test status

- **Artifact:** `data/additive-schema-clone-test-result.json`
- **Latest:** `configured: false`, `attempted: false`, `ok: false`, `recommendation.cloneProofPassed: false` — **BLOCKED** (no `REDDIRT_SCHEMA_INSTALL_TEST_DATABASE_URL` in the automation session).
- **When URL is set:** runner refuses same URL as `DATABASE_URL` and refuses matching Supabase `db.<ref>.supabase.co` project ref as production; runs `prisma db execute` then probes counts / presence flags via Prisma `datasourceUrl`.

## Production execution review

- **Files:** `docs/additive-schema-production-execution-review.md`, `data/additive-schema-production-execution-review.json`
- **States:** production execution **blocked** if validation or clone proof fails; **backup/PITR** and **Steve approval** still required; **Netlify** and **live send** remain blocked per review JSON.

## High-value data protection

- Audit **`observed.tables`** drives “already exists” rejection for `CREATE TABLE`.
- FKs from new tables to legacy public tables are **rejected** unless explicitly allowlisted.
- Clone JSON **`highValueProtection`** records presence probes for `contacts`, `ar02_voters`, and `auth.users` after apply (when clone test runs).

## Netlify / hosted DB readiness impact

- **Netlify:** still **blocked** until additive install + migration-history strategy are complete (`docs/netlify-production-retry-readiness.md`).

## Email Command Center readiness impact

- No send-path or schema changes in this slice; cross-cut docs updated only. **Live send** remains **blocked** (`docs/email-command-center-launch-hardening.md`).

## Governance status

- **Production:** untouched by this packet.
- **No** raw diff execution; **no** production `migrate deploy` / `resolve` / `db push` / `reset` from agents.

## Checks

| Check | Result |
|-------|--------|
| `node scripts/analyze-unsafe-production-diff.mjs` | OK |
| `node scripts/build-additive-schema-install-candidate.mjs` | OK |
| `node scripts/validate-additive-schema-install-candidate.mjs` | PASS |
| `node scripts/test-additive-schema-install-on-clone.mjs` | BLOCKED (no clone URL) |
| `node scripts/build-additive-schema-production-execution-review.mjs` | OK |
| `npx prisma validate` | OK |
| `npm run typecheck` | OK |
| `npm run check` | OK |
| `npm run email:no-send-scan` | WARN (documented integration baseline; ECC clean) |
| Optional `validate-selfbuild-*.mjs` (slice, boundaries, dependency graph, queue) | **Ran — all PASS** |

## Risks / limitations

- **Prisma ref → audit table:** FK legacy detection uses snake_case heuristics + a small `REF_TO_AUDIT_TABLE` map (e.g. `User` → `users`). Unmapped PascalCase tables may be **misclassified**; extend `data/additive-schema-manual-allowlists.json` or the map if a statement is wrongly rejected/accepted.
- **`observed.enums`** in the audit snapshot may be incomplete for `public` types; `CREATE TYPE` dedupe relies on audit + diff only.
- **All `ALTER` FK lines** referencing legacy tables (e.g. `"User"`) are rejected unless allowlisted — current candidate may therefore have **`alterTableIncluded: 0`** until allowlists are curated.

## Next recommended slice

**`REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-1.0`** — set `REDDIRT_SCHEMA_INSTALL_TEST_DATABASE_URL` on a disposable DB, re-run `node scripts/test-additive-schema-install-on-clone.mjs`, confirm `ok` + `cloneProofPassed`.

---

## Required attestation (YES / NO)

| Question | Answer |
|----------|--------|
| Did this mutate production? | **NO** |
| Did this execute raw Prisma diff? | **NO** |
| Did this run production migrate deploy? | **NO** |
| Did this run production migrate resolve? | **NO** |
| Did this run production db push? | **NO** |
| Did this run production reset? | **NO** |
| Did this approve Netlify retry? | **NO** |
| Did this approve live send? | **NO** |
| Is raw diff safe? | **NO** |
| Is additive candidate safe for clone test? | **YES** (validator `safeForCloneTest: true` on latest run) |
| Was clone proof run? | **BLOCKED** (no clone URL in session) |
| Is production execution approved? | **NO** |
