# Compliance hardening audit

Generated: 2026-05-19T23:23:14.735Z · Status: **pass**

| Check | Pass | Severity | Message |
| --- | --- | --- | --- |
| ai_json_gitignored | yes | critical | data/compliance/ai/*.json gitignored |
| bank_analysis_gitignored | yes | high | Bank import analysis paths gitignored |
| pii_doc_docs/compliance/COMPLIANCE_APRIL_AUDIT_CHECKLIST.md | yes | critical | docs/compliance/COMPLIANCE_APRIL_AUDIT_CHECKLIST.md clean of donor field names |
| pii_doc_docs/compliance/COMPLIANCE_WEAKNESS_DISCOVERY_REPORT.md | yes | critical | docs/compliance/COMPLIANCE_WEAKNESS_DISCOVERY_REPORT.md clean of donor field names |
| no_invented_address_guidance | yes | high | Audit checklist instructs not to guess addresses |
| rule_review_batch_guard | yes | critical | Orchestrator unsafe shortcuts include batch_rule_review |
| production_bank_env | yes | info | No .env in repo root |
| manual_precommit_data/compliance/tasks/ | yes | high | Pre-commit: do not stage data/compliance/tasks/ |
| manual_precommit_data/compliance/imports/bank/ | yes | high | Pre-commit: do not stage data/compliance/imports/bank/ |
| manual_precommit_Compliance/April26/bank-april-2026.csv | yes | high | Pre-commit: do not stage Compliance/April26/bank-april-2026.csv |

Regenerate: `npm run compliance:hardening-audit`