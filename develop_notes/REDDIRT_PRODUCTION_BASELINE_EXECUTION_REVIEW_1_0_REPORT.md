# REDDIRT_PRODUCTION_BASELINE_EXECUTION_REVIEW_1_0_REPORT

**Slice:** REDDIRT-PRODUCTION-BASELINE-EXECUTION-REVIEW-1.0  
**Lane:** `RedDirt/` only  
**Date:** 2026-05-07

---

## Slice summary

Offline production baseline **execution review** packet: scripts generate JSON checklists; docs describe Options **A–D**, recommend **Option D** with **Option C** discipline; validator enforces governance flags and checklist disclaimer. **No** production database mutations and **no** Netlify changes.

---

## Files created

| Path | Role |
|------|------|
| `scripts/review-production-baseline-execution.mjs` | Offline generator |
| `scripts/validate-production-baseline-execution-review.mjs` | Validator + PASS/FAIL summary |
| `data/production-baseline-execution-review.json` | Machine eligibility |
| `data/production-baseline-execution-review-validation.json` | Validator output |
| `data/production-baseline-command-checklist.json` | Review-only checklist |
| `data/netlify-production-retry-readiness.json` | Netlify Q&A payload |
| `docs/production-baseline-execution-review.md` | Human review doc |
| `docs/production-baseline-command-checklist.md` | Checklist narrative |
| `docs/netlify-production-retry-readiness.md` | Netlify narrative |

---

## Files modified

- `docs/production-db-test-readiness.md` — links + status language  
- `docs/production-baseline-execution-packet-draft.md` — review links  
- `docs/email-command-center-launch-hardening.md` — cross-cut link  
- `docs/campaign-email-command-center-progress-ledger.md` — cross-cut links  
- `docs/PROJECT_MASTER_MAP.md` — packet registry row  
- `docs/THREAD_HANDOFF_MASTER_MAP.md` — section pointer  
- `scripts/review-production-baseline-execution.mjs` — Options A–D, governance, Netlify fields, checklist builder  
- `scripts/validate-production-baseline-execution-review.mjs` — required validation shape + doc checks  

---

## Inputs inspected

- `data/production-db-baseline-audit.json`  
- `data/production-db-baseline-plan.json`  
- `data/prisma-schema-map-patch-validation.json`  
- Optional: `data/shadow-db-migration-proof.json` (absent → gates false)  
- Optional: `data/migration-dependency-repair-validation.json` (absent)  
- `prisma/migrations/**` directory count (**71**) and presence of deferred FK migration folder  

---

## Baseline eligibility decision

From latest `node scripts/review-production-baseline-execution.mjs` run: **`ready_for_human_review_only`** (shadow proof JSON not in repo; other signals allow human review). **`readyForAutomaticExecution`:** **false**.

---

## Shadow proof summary

- **Repo artifacts:** not committed → **`shadowProofPassed`** / **`shadowDiffClean`** **false** in machine JSON.  
- **Narrative:** Operator shadow run with **71** applies + empty diff is **not** substituted for missing JSON.

---

## Migration dependency repair status

- **Repo:** edited `20260505203000_email_contact_profile_graph`; added `20260515121000_email_contact_profile_relational_contact_fkey`.  
- **Validation file:** `data/migration-dependency-repair-validation.json` **missing** → **`migrationDependencyRepairValidated: false`**.

---

## Checksum risk

Edited existing migration SQL → checksum drift risk for any DB that recorded the old migration under `_prisma_migrations`. Production snapshot had **no** `_prisma_migrations` — lowers direct production collision risk; **staging clones** still need audit.

---

## Recommended baseline path

**Option D** — controlled production baseline after shadow proof, with **Option C** ongoing separation of legacy warehouse vs Prisma app schema. Execution details belong in **REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0** after backup + Steve approval.

---

## Netlify readiness impact

**Not ready to retry** production Netlify against unmigrated production. `scripts/netlify-build.sh` invokes **`npx prisma migrate deploy`**; env URL correctness is **operator-verified**, not asserted by this packet.

---

## Email Command Center readiness impact

Local `validate` / `typecheck` / `no-send-scan` remain safe. Hosted proof, sandbox, and **live** sends stay **blocked** until canonical DB alignment and explicit send approvals.

---

## Human approval gates

- Steve: any production `migrate deploy` / `resolve` / `db push` / `reset` or DBA DDL.  
- Steve: deviation from Option D if proposed.  
- Operator: DB identity + no secret leakage.  
- DBA: checksum / history if any clone applied pre-edit migration.

---

## Backup / PITR requirements

PITR or verified backup + documented restore drill + retention through smoke-test window.

---

## Governance status

| Question | Answer |
|----------|--------|
| Did this mutate production? | **NO** |
| Did this run production `migrate deploy`? | **NO** |
| Did this run production `migrate resolve`? | **NO** |
| Did this run production `db push`? | **NO** |
| Did this run production `reset`? | **NO** |
| Did this approve Netlify retry? | **NO** |
| Did this approve live send? | **NO** |
| Is production baseline execution ready for automatic run? | **NO** |
| Is production baseline execution ready for human review? | **YES** (per `eligibility.decision` = `ready_for_human_review_only` when last generated) |

`governance.*` flags in `data/production-baseline-execution-review.json` are all **false** / denied.

---

## Checks

| Command | Result |
|---------|--------|
| `node scripts/review-production-baseline-execution.mjs` | OK |
| `node scripts/validate-production-baseline-execution-review.mjs` | PASS (17 checks) |
| `npx prisma validate` | OK |
| `npm run check` | OK (lint + typecheck + `next build`) |
| `npm run email:no-send-scan` | OK |
| `node scripts/validate-selfbuild-slice.mjs` | PASS |
| `node scripts/validate-selfbuild-boundaries.mjs` | PASS |
| `node scripts/validate-selfbuild-dependency-graph.mjs` | PASS |
| `node scripts/validate-selfbuild-queue.mjs` | PASS |

---

## Risks / limitations

- Offline script cannot verify real `DATABASE_URL` / `DIRECT_URL` values.  
- Audit JSON may be stale if production changed since last `audit-production-db-baseline` run.  
- Option A without diff discipline can **misrepresent** schema truth.

---

## Next recommended slice

```text
REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0
```

Only that packet should hold exact production steps; Steve must still approve before any mutating command runs.
