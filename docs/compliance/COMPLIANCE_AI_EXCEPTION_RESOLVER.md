# Exception resolver (recommendations only)

**No auto-fix.** Human review required for all groups.

## unmatched_ledger (48)
Find receipt/check or confirm card expense in spreadsheet
Route: /admin/compliance/reconciliation
Human only: true

## unmatched_checks (36)
Extract on SOS board; pair to bank or mark contribution
Route: /admin/compliance/checks/sos-entry
Human only: true

## missing_addresses (72)
Confirm vendor; add address from source only in audit CSV
Route: /admin/compliance/ernie
Human only: true

## ambiguous_bank (14)
Treasurer selects correct payout batch
Route: /admin/compliance/reconciliation
Human only: true

## rule_review (44)
Topic review on Rules page then individual item review
Route: /admin/compliance/rules
Human only: true

## source_update_pending (2)
Complete workbench decision; verify upstream write
Route: /admin/compliance/approval/april-2026-compliance-review
Human only: true

## production_sync (1)
Sync April26 or document prod-only workflow
Route: /admin/compliance/settings
Human only: true

Regenerate: `npm run compliance:ai-exception-resolver`