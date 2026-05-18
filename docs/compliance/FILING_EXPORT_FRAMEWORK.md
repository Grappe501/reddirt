# Filing export framework

## Routes

- `/admin/compliance/filings`
- `/admin/compliance/filings/new`
- `/admin/compliance/filings/[id]`

## Library

- `src/lib/compliance/filings/export-filing-package.ts`
- `src/lib/compliance/filings/build-arkansas-filing-dataset.ts`
- `src/lib/compliance/filings/filing-export-types.ts`

## Package artifacts

filing-summary.html, filing-data.json, contributions/expenditures/debts/loans/in-kind/reimbursements CSVs, supporting-document-index.json, audit-manifest.json, hash-manifest.json, certification-cover-sheet.html, package-manifest.json.

## Manifest fields

filing period, included/excluded record IDs, readiness status, rule coverage status, reconciliation status, approval chain, hash manifest, `generatedAt`, `generatedByInitials`.

## Watermark

When `legalVerificationComplete` is false:

```text
DRAFT — NOT LEGAL FILING CERTIFIED
```

When true, watermark reads **READY FOR COMPLIANCE OFFICER REVIEW** — still not "legally certified."
