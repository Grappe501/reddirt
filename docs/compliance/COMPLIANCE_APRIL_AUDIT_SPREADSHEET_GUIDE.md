# April 2026 audit spreadsheet guide

**Regenerate:** `npm run compliance:april-audit-spreadsheet`  
**QA:** `npm run compliance:april-audit-spreadsheet:qa`

## Files (committed to repo)

| File | Purpose |
|------|---------|
| `docs/compliance/audit/april-2026-compliance-audit.csv` | Master workbook — filter in Excel |
| `docs/compliance/audit/april-2026-compliance-audit.xlsx` | Same data, multiple sheets |
| `docs/compliance/audit/april-2026-checks.csv` | Checks + SOS board rows |
| `docs/compliance/audit/april-2026-ledger-expenditures.csv` | Bank debits |
| `docs/compliance/audit/april-2026-missing-addresses.csv` | Address gaps only |
| `docs/compliance/audit/april-2026-unmatched-items.csv` | Match exceptions |
| `docs/compliance/audit/april-2026-in-kind-auction.csv` | Ozark auction lines |
| `docs/compliance/audit/april-2026-reconciliation-exceptions.csv` | Bank ambiguous/unmatched |

## Columns Ernie fills

- **human_answer** — verified value or decision from source
- **operator_notes** — free text
- **reviewed_by** — initials
- **reviewed_at** — ISO date

Do **not** invent addresses. Leave blank if unknown.

## Import preview (no writes)

```bash
npm run compliance:april-audit-import-preview
npm run compliance:april-audit-import-preview:qa
```

Outputs: `data/compliance/ai/april-audit-import-preview.json` (gitignored) and `docs/compliance/COMPLIANCE_APRIL_AUDIT_IMPORT_PREVIEW.md`.

## Ernie start page

`/admin/compliance/ernie`
