# Compliance Pass 2 Requirements

## Recommended Path

Build the production compliance system inside RedDirt using this Pass 1 import foundation. Do not port the old standalone Compliance app directly.

## Recommended Database Models

- `ComplianceImportBatch`: source, file name, uploaded by, uploaded at, source hash, row count, mapping status, warnings.
- `ComplianceSourceFile`: original storage key, redaction status, source hash, retention status.
- `ComplianceStagedContribution`: normalized GoodChange row, raw row JSON, row hash, readiness flags, duplicate group.
- `ComplianceStagedBankTransaction`: normalized bank row, raw row JSON, row hash, transaction classification, reconciliation status.
- `ComplianceColumnMapping`: source, original column, mapped field, confidence, reviewer override.
- `ComplianceReconciliationCandidate`: match type, confidence, contribution IDs, bank transaction ID, explanation, human review flag.
- `ComplianceReviewAction`: reviewer initials, action, before/after JSON, created at.
- `ComplianceAttachment`: future receipt/image/statement storage metadata.

## JSON Fallback Decision

JSON fallback is enough for the first live discovery version because Pass 1 does not finalize compliance records and uploaded private files are ignored by git. Pass 2 should move imports, staged rows, reviews, and reconciliation decisions into the database before production filing workflows.

## Routes Built In Pass 1

- `/admin/compliance`
- `/admin/compliance/imports`
- `/admin/compliance/imports/goodchange`
- `/admin/compliance/imports/bank`
- `/admin/compliance/reconciliation`
- `/admin/compliance/reports`
- `/admin/compliance/settings`

## Scripts Built In Pass 1

- `npm run compliance:analyze-goodchange`
- `npm run compliance:analyze-bank`
- `npm run compliance:reconcile-preview`

## Upload Storage

- `data/compliance/imports/goodchange/`
- `data/compliance/imports/bank/`
- `data/compliance/analysis/`

## Privacy And Security Concerns

- Real GoodChange exports may contain donor names, email, phone, address, employer, occupation, and payment metadata.
- Real bank exports may contain account activity, check numbers, balances, and memo details.
- Uploaded CSVs and per-upload analyses must stay ignored by git.
- Human approval is required before creating contribution records or marking bank transactions reconciled.
- AI helpers may suggest mappings and reviewer actions only; they cannot certify compliance, mutate source files, delete records, finalize filing records, or reconcile transactions.

## Pass 2 Build Priorities

1. Add database-backed batches, staged contribution rows, staged bank transactions, column mappings, reconciliation candidates, and review actions.
2. Add immutable source-file hashes and attachment metadata.
3. Add reviewer initials and audit trail on every import, mapping override, match, ignore, and promotion action.
4. Add treasurer-facing review screens for missing employer, occupation, address, amount, date, recurring, refund, and duplicate risks.
5. Add promotion flow from staged GoodChange rows into filing-ready contribution ledger records.
6. Add bank reconciliation approval workflow with grouped processor deposits and fee handling.
7. Add export preparation only after real GoodChange and bank samples validate the data shape.

## Exact Information Still Needed

GoodChange:

- Exact CSV column names.
- 5-10 sanitized sample rows.
- Row count from real export.
- Date, gross, net, fee, transaction ID, donor address, employer, occupation, recurring, refund, payout/deposit fields.
- Whether exports are individual donations or grouped deposits.

Bank:

- Bank/export type.
- Exact CSV column names.
- 5-10 sanitized sample rows.
- Sign convention or debit/credit split.
- Running balance, check number, memo processor info, statement ending balance.

Reconciliation:

- Whether GoodChange net totals match bank deposits.
- Whether processor fees are visible in both systems.
- Whether deposits are batched.
- Which deterministic match rules succeed on real files.
- Which cases require human review.
