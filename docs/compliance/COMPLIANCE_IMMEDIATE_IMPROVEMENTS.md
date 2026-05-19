# Compliance immediate improvements

Fastest path to higher readiness. Run `npm run compliance:ai-expert` after each batch.

| # | Action | Command / page | Expected impact | Owner |
|---|--------|----------------|-----------------|-------|
| 1 | Validate bank source | `npm run compliance:source-truth-audit` then `npm run compliance:bank:qa` — CSV at `Compliance/April26/bank-april-2026.csv` **or** admin bank import chunks | Confirms file vs database provenance; unlocks recon when valid | Treasurer |
| 2 | Open command center daily | `/admin/compliance/command-center` | Single source of truth; reduces confusion | Operator |
| 3 | Run operator smoke test | `COMPLIANCE_OPERATOR_SMOKE_TEST.md` | Catches broken routes before demo | Operator |
| 4 | Review 3 rule topics | `/admin/compliance/rules` + `compliance:rule-topic-packet` | Reduces rule_review blockers | Human |
| 5 | Clear source_update_pending | April queue filter | Unblocks near-eligible items | Operator |
| 6 | Review 5 near-eligible items | `/admin/compliance/approval/batch` | Moves toward batch safety (not rule_review) | Operator |
| 7 | Storage preflight | `npm run compliance:storage-preflight` | Surfaces prod gap before evidence upload | Steve |
| 8 | Netlify verify (when deployed) | `COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md` | Production confidence | Operator |
| 9 | Regenerate expert snapshot | `npm run compliance:ai-expert` | AI + docs stay current | AI assist |
| 10 | Progress matrix refresh | `npm run compliance:ai-progress-chart` | Updates `COMPLIANCE_PROGRESS_MATRIX.md` | Engineering |

**Do not:** fake filing green, batch rule_review, commit `data/compliance/tasks/*.json`, invent bank rows.
