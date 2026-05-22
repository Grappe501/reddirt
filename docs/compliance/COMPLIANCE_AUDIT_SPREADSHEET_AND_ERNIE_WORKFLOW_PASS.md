# Compliance audit spreadsheet and Ernie workflow pass

**Generated:** 2026-05-20  
**Base commit (before this pass):** `c8e5cc6` (main)

## What changed

- Definitive April audit spreadsheet package (CSV + XLSX) under `docs/compliance/audit/`
- Import preview (read-only) — `compliance:april-audit-import-preview`
- Ernie workflow page — `/admin/compliance/ernie`
- Command center **Start here** panel (Ernie / treasurer / operator / Steve / rules)
- SOS check board audit panel + CSV download API
- In-kind Ozark page — evidence sign-off counts + audit CSV link
- Filing blocker navigator script + doc
- Approval workbench image preview (prior pass, retained)

## Spreadsheet paths and row counts

| File | Rows (approx) |
|------|---------------|
| `april-2026-compliance-audit.csv` | **387** |
| `april-2026-checks.csv` | 54 |
| `april-2026-ledger-expenditures.csv` | 56 |
| `april-2026-missing-addresses.csv` | 72 |
| `april-2026-unmatched-items.csv` | 85 |
| `april-2026-in-kind-auction.csv` | 52 |
| `april-2026-reconciliation-exceptions.csv` | 24 |
| `april-2026-compliance-audit.xlsx` | multi-sheet |

Regenerate: `npm run compliance:april-audit-spreadsheet`

## Ernie route

**`/admin/compliance/ernie`** — start here; six steps; links to spreadsheet package.

## QA results

| Command | Result |
|---------|--------|
| `compliance:april-audit-spreadsheet:qa` | ok (387 rows) |
| `compliance:april-audit-import-preview:qa` | ok |
| `compliance:qa-full` | ok, score **66** yellow |
| `compliance:deploy-readiness` | `readyForNetlifyDeploy: true` |
| `npm run typecheck` | pass |
| `npm run build` | pass |

**Filing:** red (by design). **Batch eligible:** 0.

## Netlify

Build passes. April26 folder is **local** — production needs sync or operator workflow on deployed admin only for spreadsheet-driven work committed in repo.

## Next human action

1. Open `/admin/compliance/ernie`
2. Work SOS check board → regenerate spreadsheet
3. Fill `human_answer` / `reviewed_by` in master CSV
4. Run `compliance:april-audit-import-preview` to validate rows
5. Reconciliation + rules + treasurer sign-off

## Next engineering action

- Optional: apply import preview rows to staged JSON (separate approved pass)
- Netlify April26 sync documentation
