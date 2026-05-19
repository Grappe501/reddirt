# Compliance operator smoke test

Auth-required browser checklist. Run on `http://localhost:3000` with admin session.

## Approval hub

- [ ] `/admin/compliance/approval` loads
- [ ] Operator checklist panel visible
- [ ] Rebuild queues button present (do not run on production without intent)

## April26 desk

- [ ] `/admin/compliance/april26` loads
- [ ] Bank CSV blocker banner visible while `bank-april-2026.csv` missing
- [ ] GoodChange / image counts match expectations
- [ ] Links to queue, reconciliation, filing readiness work

## April queue

- [ ] `/admin/compliance/approval/april-2026-compliance-review` loads
- [ ] Filters and sorts change the list
- [ ] Burn-down summary shows open count and top fix groups
- [ ] **Review next best item** opens a sensible item (high risk / ready / needs-info order)

## Item workbench

- [ ] Item screen loads with evidence panel
- [ ] **What happens when you approve?** panel visible
- [ ] Rule review items show amber rule panel + link to Rules (no silent approve)
- [ ] `sourceUpdatePending` banner when applicable
- [ ] Override reason required when blockers present
- [ ] Initials required on decisions
- [ ] Needs info / reject / approve buttons respond

## Batch

- [ ] `/admin/compliance/approval/batch` explains **0 eligible**
- [ ] Reason counts listed (confidence, rule_review, etc.)
- [ ] Rule review items never listed as batch-eligible

## Filing readiness

- [ ] `/admin/compliance/filing-readiness` shows **red** overall (honest)
- [ ] Blocker burn-down lists category + leverage
- [ ] “What would make us green?” section present

## Settings / storage

- [ ] `/admin/compliance/settings#storage-setup` shows storage health
- [ ] Local fallback warning when Supabase not configured

## Automated helpers

```bash
npm run compliance:ai-thread-handoff
npm run compliance:operator-review-export
```

Redacted export writes `reports/compliance/operator-review-list-redacted.json` (gitignored if under reports).
