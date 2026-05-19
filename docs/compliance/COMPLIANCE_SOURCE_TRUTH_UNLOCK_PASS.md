# Compliance source truth unlock pass

**Base commit:** `d47d472`  
**Pass date:** 2026-05-19  
**Branch:** `main` (RedDirt-main-travel-ledger)

## Summary

Source Truth Reconciliation Unlock teaches the compliance stack that a missing `bank-april-2026.csv` path does **not** mean bank data is absent when equivalent file or database-backed sources exist and pass validation.

## Bank data found

| Source | Found | Count | Usable |
|--------|-------|-------|--------|
| April26 CSV (`bank-april-2026.csv`) | yes (local operator copy) | 12 credit rows for recon | yes |
| Import chunks (`data/compliance/imports/bank/*.analysis.json`) | yes after staging | 88 staged txns (gitignored) | yes |
| Aggregate mirror (`bank-import-analysis.json`) | status sample_needed until batches synced | 0 committed | n/a |

**Primary reconciliation source:** file CSV (ledger export with `Date`, `Description`, `Amount` columns). Database chunks available when admin import or `stageBankImport` runs locally.

## Reconciliation status

| Phase | Status |
|-------|--------|
| Before | `missing_file_only` / “Bank CSV missing” |
| After | `reconciliation_ready` / `reconciliation_active` |
| Credits | 12 |
| High-confidence matches | 0 |
| Ambiguous | 14 |
| Unmatched bank | 10 |

Filing remains **red** (rules, approval, storage, DB gates) — honest; `bank-csv` blocker removed per filing-impact report.

## Progress

| Metric | Before | After |
|--------|--------|-------|
| Overall completion | ~45% | **57%** |
| Launch overall | `not_ready` | **`rehearsal_ready`** |
| Bank launch checklist | fail | **pass** |
| qa-full | 66 yellow | 66 yellow |

## QA (all passed)

- `compliance:source-truth-audit` — ok, bankUsable true  
- `compliance:bank:qa` — reconciliation_ready  
- `compliance:april26:qa` — bankCsvFound true  
- `compliance:qa-reconciliation` — ok  
- `compliance:qa-full` — 66 yellow  
- `compliance:ai-brain` / `ai-expert` — ok  
- `compliance:deploy-readiness` — readyForNetlifyDeploy true  
- `typecheck` / `lint` / `build` — see commit CI  

## Deliverables

- `docs/compliance/COMPLIANCE_SOURCE_TRUTH_AUDIT.md` + `npm run compliance:source-truth-audit`  
- `src/lib/compliance/april26/bank-source-adapter.ts` (file + DB chunks, status enum)  
- Reconciliation / bank QA / command center + April26 UI  
- `npm run compliance:filing-impact` + `COMPLIANCE_FILING_IMPACT_REPORT.md`  
- `npm run compliance:queue-unlock-report` + `COMPLIANCE_QUEUE_UNLOCK_REPORT.md`  
- AI operating model + expert brief updates  

## Remaining blockers

1. Filing red — rules, approval throughput, storage prod, DB migration, hard gates  
2. Reconciliation — 14 ambiguous, 10 unmatched bank credits (treasurer review)  
3. 44 `rule_review` items — no batch  
4. batch eligible 0 — intentional safety  
5. Netlify operator verify unsigned  

## Next actions

| Owner | Action |
|-------|--------|
| Human (treasurer) | Reconcile ambiguous/unmatched in `/admin/compliance/reconciliation` |
| Human | Rule topic review on Rules page |
| Steve | Production storage + migration plan |
| Engineering | Push commit; Netlify deploy; confirm bank status on production |
| AI | Regenerate expert after operator recon progress |

## Git

- **Do not commit:** `data/compliance/imports/bank/*.analysis.json`, `data/compliance/tasks/*.json`, raw bank CSV, donor exports  
- **Commit:** code, docs, regenerated briefs (AI JSON gitignored)  

**New commit:** _(filled after push)_  
**Pushed to GitHub:** _(filled after push)_
