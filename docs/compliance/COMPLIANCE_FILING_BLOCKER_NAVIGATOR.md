# Filing blocker navigator

Generated: 2026-05-20T03:24:59.230Z

**Filing status:** red (honest — not green until sign-off)

| Blocker | Owner | Count | Route | Next action | Spreadsheet filter |
| --- | --- | ---: | --- | --- | --- |
| Rule verification missing | Compliance officer | 24 | /admin/compliance/rules | Review each topic with official sources — source reviewed for campaign workflow, | workflow_area=rule_review (44 rows) |
| Unapproved records | Compliance reviewer | 221 | /admin/compliance/approval/april-2026-compliance-review | Work Lightning Approval queue — high risk first, then ready items. | See docs/compliance/audit/april-2026-compliance-audit.csv |
| Bank credits need treasurer review | Treasurer | 12 | /admin/compliance/reconciliation | Resolve 2 ambiguous and 10 unmatched credits on reconciliation workbench (pick p | See docs/compliance/audit/april-2026-compliance-audit.csv |
| Rule topics awaiting officer review | Compliance officer | 44 | /admin/compliance/rules | Use Rules page workflow — mark each topic reviewed, then approve queue items ind | See docs/compliance/audit/april-2026-compliance-audit.csv |
| Storage not production-ready | Technical operator | 1 | /admin/compliance/settings#storage-setup | Configure Supabase private bucket and verify RLS. | See docs/compliance/audit/april-2026-compliance-audit.csv |
| DB persistence not production-ready | Technical operator | 1 | /admin/compliance/settings | Follow COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md before cutover. | See docs/compliance/audit/april-2026-compliance-audit.csv |
| Required rule topics have official sources | Compliance officer | 1 | /admin/compliance/filing-readiness | Each required topic needs an official Arkansas source loaded (human legal review | See docs/compliance/audit/april-2026-compliance-audit.csv |
| Filing period / due date verified or overridden | Compliance officer | 1 | /admin/compliance/filing-readiness | Placeholder period. Verify against Arkansas Ethics reporting calendar for the ex | See docs/compliance/audit/april-2026-compliance-audit.csv |
| Filing snapshot generated | Compliance officer | 1 | /admin/compliance/filing-readiness | Generate a draft filing package snapshot. | See docs/compliance/audit/april-2026-compliance-audit.csv |
| Audit manifest generated | Compliance officer | 1 | /admin/compliance/filing-readiness | Filing package must include hash manifest. | See docs/compliance/audit/april-2026-compliance-audit.csv |
| Complete April audit spreadsheet | Ernie (operator) | 387 | /admin/compliance/ernie | Fill human_answer and operator_notes in april-2026-compliance-audit.csv; run imp | workflow_area in (checks, ledger, address, in_kind) |

Regenerate: `npm run compliance:filing-blocker-navigator`
