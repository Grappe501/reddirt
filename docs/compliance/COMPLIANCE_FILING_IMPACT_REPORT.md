# Compliance filing impact report

Regenerate: `npm run compliance:filing-impact` → `data/compliance/ai/filing-impact.json`

## How bank source unlock affects filing

The **bank-csv** blocker clears only when `canSatisfyBankRequirement` is true (validated credits from **file or** `imports/bank` chunks) **and** reconciliation rehearsal can run.

| State | Filing impact |
|-------|----------------|
| No file, no chunks | Blocker remains — label "Bank source missing" |
| Chunks present, invalid | Blocker remains — label "Bank source not yet valid" |
| Chunks or file valid | Blocker removed; filing may still be red for rules/approval/storage |

## Blocker categories

- **needsHumanReview** — rule topics, policy judgments
- **needsSourceEvidence** — bank, receipts, unmatched payouts
- **needsSteveApproval** — DB migration, overrides

Green conditions are listed per blocker id in `filing-impact.json`.
