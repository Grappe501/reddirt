# Critical path v2 (top 25)

### 1. Complete April audit spreadsheet (human_answer columns)
- Owner: ernie
- Impact: critical · Urgency: immediate
- Human only: true
- Route: /admin/compliance/ernie
- Command: npm run compliance:april-audit-spreadsheet
- Filing gain: Enables verified documentation pass
- Do not: invent_addresses, auto_approve_rule_review

### 2. Extract and verify all physical checks on SOS board
- Owner: ernie
- Impact: critical · Urgency: immediate
- Human only: true
- Route: /admin/compliance/checks/sos-entry
- Command: —
- Filing gain: Contribution records defensible
- Do not: copy_unverified_fields_to_sos

### 3. Enter Ozark auction in-kind lines in SOS
- Owner: ernie
- Impact: high · Urgency: immediate
- Human only: true
- Route: /admin/compliance/in-kind/ozark-auction
- Command: npm run compliance:in-kind-audit-export
- Filing gain: In-kind reporting path clear
- Do not: —

### 4. Resolve ambiguous and unmatched bank credits
- Owner: treasurer
- Impact: high · Urgency: this_week
- Human only: true
- Route: /admin/compliance/reconciliation
- Command: npm run compliance:reconciliation-review-report
- Filing gain: Reconciliation lock possible
- Do not: auto_match_ambiguous

### 5. Complete Rules page topic reviews
- Owner: compliance_officer
- Impact: high · Urgency: this_week
- Human only: true
- Route: /admin/compliance/rules
- Command: npm run compliance:rule-resolution-report
- Filing gain: Rule gate cleared
- Do not: batch_rule_review

### 6. Fill missing vendor addresses from source only
- Owner: ernie
- Impact: high · Urgency: this_week
- Human only: true
- Route: /admin/compliance/ernie#spreadsheet
- Command: —
- Filing gain: Vendor fields complete
- Do not: invent_addresses

### 7. Run audit import preview after spreadsheet fill
- Owner: operator
- Impact: medium · Urgency: later
- Human only: false
- Route: —
- Command: npm run compliance:april-audit-import-preview
- Filing gain: Validates human work
- Do not: apply_import_without_preview

### 8. Verify Netlify April26 / bank import path
- Owner: steve
- Impact: medium · Urgency: later
- Human only: true
- Route: /admin/compliance/settings
- Command: npm run compliance:deploy-readiness
- Filing gain: Remote operators can work
- Do not: —

### 9. Treasurer reconciliation decisions
- Owner: treasurer
- Impact: medium · Urgency: later
- Human only: true
- Route: /admin/compliance/reconciliation
- Command: npm run compliance:reconciliation-review-report
- Filing gain: Filing path after recon lock
- Do not: batch_approve_rule_review, lower_confidence_threshold_below_98, fake_filing_green

### 10. Verify rule review topics on Rules page
- Owner: human
- Impact: medium · Urgency: later
- Human only: true
- Route: /admin/compliance/rules
- Command: npm run compliance:rule-resolution-report
- Filing gain: Individual rule_review items can move to needs_review
- Do not: batch_approve_rule_review, lower_confidence_threshold_below_98, fake_filing_green

### 11. Resolve ambiguous and unmatched bank credits
- Owner: treasurer
- Impact: medium · Urgency: later
- Human only: false
- Route: /admin/compliance/reconciliation
- Command: npm run compliance:reconciliation-review-report
- Filing gain: Up to 12 rehearsal credit(s) move toward draft → approve → lock.
- Do not: batch_approve_rule_review, lower_confidence_threshold_below_98, fake_filing_green

### 12. Verify production bank import on Netlify
- Owner: treasurer
- Impact: medium · Urgency: later
- Human only: true
- Route: /admin/compliance/imports/bank
- Command: npm run compliance:source-truth-audit
- Filing gain: Production reconciliation rehearsal
- Do not: batch_approve_rule_review, lower_confidence_threshold_below_98, fake_filing_green

### 13. Execute vendor/address completion (after audit)
- Owner: operator
- Impact: medium · Urgency: later
- Human only: true
- Route: /admin/compliance/vendors
- Command: —
- Filing gain: Disclosure-complete expenditures
- Do not: batch_approve_rule_review, lower_confidence_threshold_below_98, fake_filing_green

Regenerate: `npm run compliance:ai-critical-path-v2`