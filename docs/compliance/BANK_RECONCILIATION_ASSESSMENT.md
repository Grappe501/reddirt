# Bank Reconciliation Assessment

## Pass 1 Status

The bank import foundation is implemented as a deterministic CSV discovery and staging flow. It does not create final ledger records or mark transactions reconciled.

Built route:

- `/admin/compliance/imports/bank`

Built API:

- `POST /api/admin/compliance/imports/bank`

Built storage path:

- `data/compliance/imports/bank/`

Privacy note: uploaded bank CSVs and per-upload analysis JSON can contain private financial data and are ignored by git.

## What The Analyzer Detects

- Exact detected CSV columns.
- Sanitized sample rows.
- Inferred column types.
- Date, description, amount, debit, credit, balance, and check-number columns.
- Whether deposits and expenses use positive/negative amounts or separate debit/credit columns.
- Possible deposits, expenditures, processor fees, and transfers.
- Whether running balance exists.
- Whether memo/description appears to contain processor information.

## Current Sample Status

No real bank CSV sample is committed. Bank name/export type, exact columns, sign convention, running balance, check number behavior, statement ending balance, and memo content require a real export uploaded through the admin screen or provided as a private local sample.

## Information Still Needed For Pass 2

- Bank name and export type.
- Exact bank CSV column names.
- 5-10 sanitized sample rows.
- Whether deposits and expenses are positive/negative or debit/credit split.
- Whether running balance exists.
- Whether check number exists.
- Whether memo/description contains GoodChange, processor, payout, or transaction IDs.
- Whether monthly statement ending balance is available in CSV or only in PDF/statement.

## Pass 2 Recommendation

Create database-backed bank import batches and staged transactions with immutable source hashes. Require human approval before a staged bank transaction can be marked matched, ignored, or reconciled.
