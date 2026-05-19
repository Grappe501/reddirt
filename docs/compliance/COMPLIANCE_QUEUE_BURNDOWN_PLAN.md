# Compliance queue burn-down plan

## Start order

1. **rule_review** — Rules page topic review; never batch  
2. **source_update_pending** — Confirm source write or document workbench-only  
3. **filing_task_dependency** — Linked filing tasks  
4. **low_confidence** — Fields/evidence to reach 98%  
5. **missing_evidence** — Link receipts/imports  
6. **near_eligible** — Fix 1–2 issues for batch safety (not rule_review)

## Commands

```bash
npm run compliance:queue-burndown
npm run compliance:operator-review-export-v2
```

## Impact labels (in queue-burndown.json)

| Label | Meaning |
|-------|---------|
| clears_filing_blocker | Helps filing readiness |
| improves_reconciliation | GoodChange / bank path |
| may_become_batch_eligible | Could reach 98% + gates |
| requires_human_rule_decision | rule_review item |
| waiting_on_source_file | Bank CSV or evidence on disk |

## UI

- April queue: quick filter chips + next best action  
- Workbench: 7-step review stepper  
- Batch page: explains zero eligible  
