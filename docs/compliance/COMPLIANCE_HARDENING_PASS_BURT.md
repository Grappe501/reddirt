# Compliance hardening pass (Burt)

**Branch:** `main` (clean worktree `RedDirt-main-travel-ledger`)  
**Baseline:** `2bf3955`  
**Date:** 2026-05-19

## What changed

### Operator smoke & burn-down

- `docs/compliance/COMPLIANCE_OPERATOR_SMOKE_TEST.md` — auth browser checklist
- Queue burn-down summary on April queue page
- `npm run compliance:operator-review-export` — redacted planning list (no donor names)
- Workbench: “why next best” + rule review panel

### Bank CSV readiness

- `src/lib/compliance/imports/bank-csv-readiness.ts` — validates file when present (headers, rows, duplicates, payout compare)
- April26 page shows blocker while missing; actionable status when valid

### Rule review hardening

- Guards block approve without override on `rule_review` items
- Batch explicitly excludes rule review; QA asserts same
- `rule-review-context.ts` — topic, evidence, filing impact

### Filing readiness

- Blocker tasks include `category` + `leverage` (approval, reconciliation, source, storage, db, rules)

### Storage & DB docs

- `COMPLIANCE_SUPABASE_STORAGE_PRODUCTION_CHECKLIST.md`
- `COMPLIANCE_DB_MIGRATION_PREFLIGHT.md` (no migration applied)

## Routes touched

- `/admin/compliance/april26`
- `/admin/compliance/approval/april-2026-compliance-review`
- `/admin/compliance/approval/[queueId]/item/[itemId]`
- `/admin/compliance/approval/batch`
- `/admin/compliance/filing-readiness`
- `/admin/compliance/settings`

## Safety gates preserved

- Confidence ≥ 98% for batch unchanged
- Filing readiness remains **red** when blockers real
- Rule review cannot batch; approve requires override + rules workflow
- No private donor/task JSON committed (`data/compliance/tasks/*.json` gitignored)

## QA results (this pass)

| Command | Result |
|---------|--------|
| `compliance:approval:build` | ok — 10 queues, 133–134 items |
| `compliance:qa-approval` | ok — batchEligible 0, rule_review guard tested |
| `compliance:qa-reconciliation` | ok |
| `compliance:qa-filing` | ok — **overallStatus red**, 6 blockers (expected) |
| `compliance:qa-storage` | ok — local_private |
| `compliance:qa-full` | ok — score 66 yellow, filingReadiness red |
| `compliance:april26:dry` | ok — bank file_missing |
| `compliance:april26:qa` | ok |
| `compliance:operator-review-export` | ok — 133 redacted rows |
| `typecheck` | ok |
| `lint` | ok (warnings only) |
| `build` | ok |

## Remaining launch blockers

1. Add `bank-april-2026.csv` to April26 folder
2. Operator browser smoke (`COMPLIANCE_OPERATOR_SMOKE_TEST.md`)
3. Burn down 133 open approval items (confidence / rule review)
4. Supabase production storage + RLS
5. DB migration Steve approval
6. Rule topic reviews on `/admin/compliance/rules`

## Closer to launch?

**Yes** — operator tooling, bank ingest readiness, and rule-review safety improved without weakening gates. Commercial launch still blocked on bank file, storage, DB, and human review volume.

## Next human action

1. Place `bank-april-2026.csv` at `H:\SOSWebsite\Compliance\April26`
2. Run operator smoke checklist on localhost with admin login
3. Work April queue burn-down starting with rule review filter (44 items)
