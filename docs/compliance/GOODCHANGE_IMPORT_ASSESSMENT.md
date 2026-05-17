# GoodChange Import Assessment

## Pass 1 Status

The GoodChange import foundation is implemented as a deterministic discovery and staging flow. It does not create final contribution records.

Built route:

- `/admin/compliance/imports/goodchange`

Built API:

- `POST /api/admin/compliance/imports/goodchange`

Built storage path:

- `data/compliance/imports/goodchange/`

Privacy note: uploaded GoodChange files and per-upload analysis JSON can contain donor/private data and are ignored by git.

## What The Analyzer Detects

- Exact detected CSV columns.
- Sanitized sample rows.
- Inferred column types.
- Likely donor identity fields.
- Transaction date, deposit date, amount, gross, fee, and net fields.
- GoodChange or processor transaction IDs.
- Recurring and refund fields.
- Employer, occupation, and address availability.
- Missing readiness fields.
- Duplicate risks by raw row hash and processor transaction ID.

## Current Sample Status

No real GoodChange CSV sample is committed. Exact column names, real row count, payout grouping, and sanitized sample rows require a real export uploaded through the admin screen or provided as a private local sample.

## Information Still Needed For Pass 2

- Exact GoodChange CSV column names.
- 5-10 sanitized sample rows from a real export.
- Whether exports list individual donations, payouts, or both.
- Whether payout/deposit IDs exist.
- Whether gross, fee, and net are all present.
- Whether employer and occupation are exported.
- Whether refunds and recurring contributions are explicit columns.
- Whether processor transaction IDs appear in bank memos.

## Pass 2 Recommendation

Promote staged rows into database-backed `ComplianceImportBatch` and `ComplianceStagedContribution` models only after treasurer review of real GoodChange exports. Keep source rows immutable, store source hashes, and require human approval before creating filing-ready contribution records.
