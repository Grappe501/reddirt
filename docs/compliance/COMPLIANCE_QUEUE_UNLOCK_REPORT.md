# Compliance queue unlock report

Regenerate: `npm run compliance:queue-unlock-report` → `data/compliance/ai/queue-unlock-report.json`

## What unlocks when bank source is valid

- **bank_transaction** approval items and reconciliation-related queue rows may become actionable.
- **source_update_pending** items may resolve once bank evidence backs payout matching.
- **rule_review** items are **never** batch-unlocked — individual review only.
- **Low confidence** items stay blocked until ≥98% confidence and human approval.

## Expected impact

When `potentiallyUnlockedByBank` is 0, either bank source is not usable on disk or no bank-linked queue rows exist yet. Run `compliance:source-truth-audit` first, then import bank data if chunks are missing from this environment.
