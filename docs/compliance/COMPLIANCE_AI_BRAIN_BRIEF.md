# Compliance AI brain brief

Generated: 2026-05-19T15:26:24.263Z  
Commit: 9f02543  
Command center: /admin/compliance/command-center

> Human review required — not legal certification. Green only when source-backed.

## Launch status

- **Overall:** not_ready (13% checklist)
- **Filing:** red (9 blockers)
- **Open queue:** 133 · Batch eligible: 0
- **Bank CSV:** missing
- **Rule topics unverified:** 24

## Recommended next human action

Add bank CSV at H:\SOSWebsite\Compliance\April26\bank-april-2026.csv

## Recommended next AI action

Run compliance:ai-brain and compliance:ai-daily-brief; surface next-actions and risks; never auto-approve or fake green.

## Top next actions

1. **Add bank-april-2026.csv** (treasurer) — Treasurer export at H:\SOSWebsite\Compliance\April26\bank-april-2026.csv. Then npm run compliance:bank:qa
2. **Review unverified rule topics** (human) — 24 topic(s) on Rules page — not legal certification.
3. **Burn down approval queue** (operator) — 133 open; start: rule_review, source_update_pending, filing_task_dependency, low_confidence
4. **Configure production storage** (steve) — Local private storage fallback active. Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and private bucket.
5. **DB migration (Steve approval)** (steve) — Steve approval + backup + rehearsal before cutover

## Top risks

- **critical** Bank CSV missing: Add real treasurer export; run compliance:bank:qa
- **critical** Filing readiness red: Resolve blockers on filing readiness page; source-backed only
- **critical** PII in git or exports: Redacted exports only; gitignore tasks JSON
- **critical** Automated fake compliance green: Use AI brain; never bypass gates
- **high** Zero batch-eligible items: Fix fields/evidence; never batch rule_review

## Unsafe actions (never automate)

- batch_approve_rule_review
- lower_confidence_threshold_below_98
- fake_filing_green
- invent_bank_csv_or_transactions
- commit_data_compliance_tasks_json
- export_unredacted_donor_names
- apply_db_migration_without_steve_approval
- bypass_storage_or_rls_gates
- auto_certify_legal_compliance
- delete_approval_or_filing_records

## Machine-readable outputs

- `data/compliance/ai/brain-snapshot.json`
- `data/compliance/ai/next-actions.json`
- `data/compliance/ai/risk-report.json`
- `data/compliance/ai/launch-readiness.json`

Regenerate: `npm run compliance:ai-brain`
