# April 2026 reconciliation blockers

## Bank CSV (primary blocker)

**Expected path:** `H:\SOSWebsite\Compliance\April26\bank-april-2026.csv`

**Headers:** `date`, `amount`, `memo` (credits positive; debits negative or use debit column)

Until this file exists:

- GoodChange payout net totals cannot be matched to bank credits
- Filing readiness remains impacted for deposit verification
- Dashboard shows a red **Bank CSV required** panel

## Other blockers

- **Vision skipped** — Without `OPENAI_API_KEY`, receipt/check/in-kind images stay `pending`; officer must enter amounts manually.
- **Human approval** — No reconciliation link is final until approved/locked in the workbench.
- **Ethics vs OCR** — Workbook rows and image OCR may disagree; officer resolves conflicts.

## When bank CSV is added

1. Place file in April26 folder.
2. Re-run `npm run compliance:april26:ingest`.
3. Review suggested payout-to-deposit matches in reconciliation.
4. Approve and lock matches after treasurer confirmation.
