# Compliance weakness discovery report
Generated: 2026-05-19T23:23:14.734Z · Commit: `39e3441`
## Severity summary
| Critical | High | Medium | Low | Info |
| ---: | ---: | ---: | ---: | ---: |
| 2 | 7 | 4 | 0 | 0 |
## All weaknesses
### Filing readiness
#### Filing status remains red (critical)
- Evidence: 10 blocker(s); overall red
- Affected: 10
- Why: Cannot represent filing-ready until gates clear.
- Blocked: Final filing export and green status
- Owner: compliance_officer
- Fastest fix: Clear reconciliation + documentation blockers
- Permanent fix: All hard gates pass qa-filing
- Route: /admin/compliance/filing-readiness
- Command: `npm run compliance:qa-filing`
- Doc: COMPLIANCE_FILING_READINESS.md
- Risk if ignored: Premature or inaccurate filing
### QA coverage
#### qa-full not fully green (high)
- Evidence: Launch QA score 66 (yellow)
- Why: Yellow QA means some compliance scripts still warn or fail soft gates.
- Blocked: Launch confidence
- Owner: engineer
- Fastest fix: npm run compliance:qa-full and fix failing slice
- Permanent fix: All qa-* scripts green in CI
- Route: /admin/compliance/command-center
- Command: `npm run compliance:qa-full`
- Doc: COMPLIANCE_PROGRESS_MATRIX.md
- Risk if ignored: Regressions ship to Netlify
### Checks
#### Uploaded checks without ledger expenditure match (high)
- Evidence: 36 of 44 uploaded check records unmatched
- Affected: 36
- Why: Cannot prove check cleared bank or tie to expense without pairing.
- Blocked: Expenditure reconciliation closure
- Owner: treasurer
- Fastest fix: Run april-audit-checklist Part A vs physical checks
- Permanent fix: Enter fields + match or mark contribution-only
- Route: /admin/compliance/april26
- Command: `npm run compliance:april-audit-checklist`
- Doc: COMPLIANCE_APRIL_AUDIT_CHECKLIST.md
- Risk if ignored: Missing or duplicate disclosures
#### Few exact check-to-ledger matches (medium)
- Evidence: 8 exact of 44 checks vs 56 expenditures
- Affected: 8
- Why: Most work still requires human pairing.
- Blocked: Automated reconciliation confidence
- Owner: treasurer
- Fastest fix: Manual audit — do not auto-match uncertain items
- Permanent fix: Vision extract + treasurer confirm matches
- Route: /admin/compliance/reconciliation
- Doc: COMPLIANCE_APRIL_AUDIT_CHECKLIST.md
- Risk if ignored: Wrong payee or amount on report
### Ledger expenditures
#### Bank debits without check/receipt pairing (high)
- Evidence: 48 of 56 April expenditures unmatched
- Affected: 48
- Why: Card/POS and fees need receipts; check payments need images.
- Blocked: Expense documentation completeness
- Owner: operator
- Fastest fix: Run april-audit-checklist Part B vs bank CSV
- Permanent fix: Receipt intake + approval for each debit
- Route: /admin/compliance/receipts
- Command: `npm run compliance:april-expenditure-inventory`
- Doc: COMPLIANCE_APRIL_EXPENDITURE_INVENTORY.md
- Risk if ignored: Unsupported expenditures in filing
### Missing addresses
#### Vendor/payee addresses not on file (high)
- Evidence: 72 address gap flags
- Affected: 72
- Why: Arkansas disclosure may require vendor addresses when identified.
- Blocked: Address-complete filing dataset
- Owner: operator
- Fastest fix: Collect from W-9/invoice after payee confirmed
- Permanent fix: Vendor memory model + /admin/compliance/vendors
- Route: /admin/compliance/vendors
- Doc: COMPLIANCE_VENDOR_ADDRESS_COMPLETION_PLAN.md
- Risk if ignored: Incomplete expenditure disclosures
### Reconciliation
#### Treasurer reconciliation decisions pending (critical)
- Evidence: 12 item(s) need treasurer draft or decision
- Affected: 12
- Why: Bank credits must match GoodChange payouts before filing lock.
- Blocked: Reconciliation lock → filing green
- Owner: treasurer
- Fastest fix: Open reconciliation workbench; pick payout or investigation draft
- Permanent fix: All credits matched or ignored with note
- Route: /admin/compliance/reconciliation
- Command: `npm run compliance:reconciliation-review-report`
- Doc: COMPLIANCE_RECONCILIATION_REVIEW_PASS.md
- Risk if ignored: Deposit totals disagree with bank
### Rule review
#### Rule topics pending verification (high)
- Evidence: 44 topics; 44 queue items gated
- Affected: 44
- Why: rule_review items cannot batch-approve until topic reviewed.
- Blocked: Queue batch eligibility
- Owner: compliance_officer
- Fastest fix: Rules page → review each topic; sync to needs_review only
- Permanent fix: All topics verified; individual approve with notes
- Route: /admin/compliance/rules
- Command: `npm run compliance:rule-resolution-report`
- Doc: COMPLIANCE_RULE_RESOLUTION_PASS.md
- Risk if ignored: Approving without rule basis
### Storage/evidence protection
#### Production storage / evidence path not ready (high)
- Evidence: Mode local_private; ready=false
- Why: Evidence must be protected in production.
- Blocked: Production evidence upload
- Owner: steve
- Fastest fix: Complete Supabase storage + RLS plan
- Permanent fix: Storage preflight green
- Route: /admin/compliance/command-center
- Command: `npm run compliance:storage-preflight`
- Doc: COMPLIANCE_STORAGE.md
- Risk if ignored: Evidence loss or exposure
### DB migration
#### DB migration not applied (JSON authoritative) (medium)
- Evidence: Steve approval + backup + rehearsal before cutover
- Why: Prisma path blocked until Steve approves.
- Blocked: DB-backed compliance records
- Owner: steve
- Fastest fix: Continue JSON workflow; do not apply migration without approval
- Permanent fix: Approved migration + deploy
- Doc: COMPLIANCE_DB_MIGRATION.md
- Risk if ignored: Split brain between JSON and DB
### Approval queue
#### Large open approval queue (high)
- Evidence: 221 open of 222
- Affected: 221
- Why: Throughput blocks launch and filing.
- Blocked: Batch approval and filing package
- Owner: operator
- Fastest fix: queue-burndown + category filters
- Permanent fix: Category-by-category approval with evidence
- Route: /admin/compliance/approval/april-2026-compliance-review
- Command: `npm run compliance:queue-burndown`
- Doc: COMPLIANCE_QUEUE_BURNDOWN_PLAN.md
- Risk if ignored: Stale items hide real blockers
### UX/operator clarity
#### Progress spread across many reports (medium)
- Evidence: Multiple MD/JSON outputs without single completion command
- Why: Operators lose time finding next step.
- Blocked: 30-second clarity
- Owner: engineer
- Fastest fix: Use command center Completion Engine panel
- Permanent fix: completion-engine + audit checklist as home
- Route: /admin/compliance/command-center
- Command: `npm run compliance:ai-completion-engine`
- Doc: COMPLIANCE_AI_COMPLETION_ENGINE_BRIEF.md
- Risk if ignored: Wrong priority work
### Bank data
#### Bank CSV may exist only on local April26 folder (medium)
- Evidence: Primary file_and_database; file true; chunks 1
- Affected: 12
- Why: Netlify build does not include Compliance/April26 unless imported.
- Blocked: Production parity
- Owner: treasurer
- Fastest fix: Admin bank import on target environment
- Permanent fix: Verified production chunks
- Route: /admin/compliance/imports/bank
- Command: `npm run compliance:bank:qa`
- Doc: COMPLIANCE_SOURCE_TRUTH_UNLOCK_PASS.md
- Risk if ignored: Empty bank on production
Regenerate: `npm run compliance:weakness-discovery`