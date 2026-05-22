# Work router

Commit ad4f8b4

## ernie

### 1. Complete April audit spreadsheet (human_answer columns)
- Route: /admin/compliance/ernie
- Command: npm run compliance:april-audit-spreadsheet
- Look at: Documents every check, ledger line, address, in-kind row
- Decide: Enables verified documentation pass
- Done when: Operator clarity +15–20%
- Do not: invent_addresses; auto_approve_rule_review

### 2. Extract and verify all physical checks on SOS board
- Route: /admin/compliance/checks/sos-entry
- Command: —
- Look at: Closes donation check documentation gap
- Decide: Contribution records defensible
- Done when: Check workstream unblocked
- Do not: copy_unverified_fields_to_sos

### 3. Enter Ozark auction in-kind lines in SOS
- Route: /admin/compliance/in-kind/ozark-auction
- Command: npm run compliance:in-kind-audit-export
- Look at: 49 auction lines documented
- Decide: In-kind reporting path clear
- Done when: In-kind workstream progress
- Do not: —

### 4. Fill missing vendor addresses from source only
- Route: /admin/compliance/ernie#spreadsheet
- Command: —
- Look at: 72 address gaps
- Decide: Vendor fields complete
- Done when: Data quality score up
- Do not: invent_addresses

## treasurer

### 1. Resolve ambiguous and unmatched bank credits
- Route: /admin/compliance/reconciliation
- Command: npm run compliance:reconciliation-review-report
- Look at: 24 bank exceptions
- Decide: Reconciliation lock possible
- Done when: Treasurer sign-off path
- Do not: auto_match_ambiguous

### 2. Treasurer reconciliation decisions
- Route: /admin/compliance/reconciliation
- Command: npm run compliance:reconciliation-review-report
- Look at: 12 bank credit(s) block reconciliation lock.
- Decide: Filing path after recon lock
- Done when: +10% toward filing if credits resolved
- Do not: batch_approve_rule_review; lower_confidence_threshold_below_98; fake_filing_green

### 3. Resolve ambiguous and unmatched bank credits
- Route: /admin/compliance/reconciliation
- Command: npm run compliance:reconciliation-review-report
- Look at: 12 rehearsal item(s) block honest reconciliation closure. Treasurer must pick payouts or create investigation drafts.
- Decide: Up to 12 rehearsal credit(s) move toward draft → approve → lock.
- Done when: Up to 12 rehearsal credit(s) move toward draft → approve → lock.
- Do not: batch_approve_rule_review; lower_confidence_threshold_below_98; fake_filing_green

### 4. Verify production bank import on Netlify
- Route: /admin/compliance/imports/bank
- Command: npm run compliance:source-truth-audit
- Look at: Local bank CSV does not prove production state.
- Decide: Production reconciliation rehearsal
- Done when: Launch rehearsal complete on production
- Do not: batch_approve_rule_review; lower_confidence_threshold_below_98; fake_filing_green

## operator

### 1. Regenerate audit spreadsheet after SOS/in-kind updates
- Route: /admin/compliance/ernie
- Command: npm run compliance:april-audit-spreadsheet
- Look at: Row counts vs inventory
- Decide: Whether main CSV is current
- Done when: CSV reflects latest workbook
- Do not: commit_private_json

## compliance_officer

### 1. Complete Rules page topic reviews
- Route: /admin/compliance/rules
- Command: npm run compliance:rule-resolution-report
- Look at: 44 rule_review queue items gated
- Decide: Rule gate cleared
- Done when: Queue burn-down unlock
- Do not: batch_rule_review

## steve

### 1. Verify Netlify April26 / bank import path
- Route: /admin/compliance/settings
- Command: npm run compliance:deploy-readiness
- Look at: Prod matches local rehearsal
- Decide: Remote operators can work
- Done when: Deploy OK
- Do not: —

## engineer

### 1. Run intelligence package after material changes
- Route: /admin/compliance/command-center
- Command: npm run compliance:ai-intelligence
- Look at: QA and typecheck
- Decide: Whether reports need refresh
- Done when: ai-intelligence:qa passes
- Do not: lower_confidence_threshold

## ai_assist

### 1. Refresh AI intelligence and briefs
- Route: /admin/compliance/command-center
- Command: npm run compliance:ai-briefs
- Look at: Diagnosis + memory delta
- Decide: Next global action
- Done when: Briefs match current commit
- Do not: batch_approve_rule_review; lower_confidence_threshold_below_98; fake_filing_green; invent_bank_csv_or_transactions

Regenerate: `npm run compliance:ai-work-router`