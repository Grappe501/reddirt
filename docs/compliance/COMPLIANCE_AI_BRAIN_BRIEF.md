# Compliance AI brain brief

Generated: 2026-05-19T21:26:33.186Z  
Commit: d47d472  
Command center: /admin/compliance/command-center

> Human review required — not legal certification. Green only when source-backed.

## Launch status

- **Overall:** rehearsal_ready (25% checklist)
- **Filing:** red (8 blockers)
- **Open queue:** 221 · Batch eligible: 0
- **Bank CSV:** present
- **Rule topics unverified:** 24

## Recommended next human action

Work approval queue (221 open) starting with: rule_review, source_update_pending, filing_task_dependency, low_confidence

## Recommended next AI action

Run compliance:ai-brain and compliance:ai-daily-brief; surface next-actions and risks; never auto-approve or fake green.

## Top next actions

1. **Review unmatched bank lines** (operator) — 10 unmatched bank transaction(s).
2. **Review unverified rule topics** (human) — 24 topic(s) on Rules page — not legal certification.
3. **Burn down approval queue** (operator) — 221 open; start: rule_review, source_update_pending, filing_task_dependency, low_confidence
4. **Configure production storage** (steve) — Local private storage fallback active. Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and private bucket.
5. **DB migration (Steve approval)** (steve) — Steve approval + backup + rehearsal before cutover

## Top risks

- **critical** Filing readiness red: Resolve blockers on filing readiness page; source-backed only
- **critical** PII in git or exports: Redacted exports only; gitignore tasks JSON
- **critical** Automated fake compliance green: Use AI brain; never bypass gates
- **high** Zero batch-eligible items: Fix fields/evidence; never batch rule_review
- **high** Rule review items require human topic review: Rules page review + per-item override if approving

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
