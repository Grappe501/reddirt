# Compliance operator launch rehearsal

Walkthrough for the first **real operator launch rehearsal** once `H:\SOSWebsite\Compliance\April26\bank-april-2026.csv` is present. Auth required on all admin routes.

## Prerequisites

- Clean `main` at commit `7c849b5` or newer
- `H:\SOSWebsite\RedDirt\.env` loaded (never commit)
- April26 folder on disk with GoodChange CSV and images
- Bank CSV at `H:\SOSWebsite\Compliance\April26\bank-april-2026.csv` (human-provided; do not invent)

```bash
cd H:\SOSWebsite\RedDirt-main-travel-ledger
npm run dev
```

## 1. Localhost startup

- [ ] App starts at `http://localhost:3000`
- [ ] Admin session can reach `/admin/compliance`

## 2. Approval dashboard

- [ ] `/admin/compliance/approval` — operator checklist visible
- [ ] Queue counts match `npm run compliance:ai-thread-handoff`
- [ ] Do **not** batch-approve `rule_review` items

## 3. April26 source desk

- [ ] `/admin/compliance/april26`
- [ ] Bank CSV banner: **missing** (red) or **validated** (amber/green) — honest state
- [ ] Reconciliation rehearsal card shows match/unmatch counts when CSV present
- [ ] “What to fix next” list is actionable

## 4. Bank CSV status

- [ ] Expected path shown when missing
- [ ] After file added: `npm run compliance:bank:qa` and `npm run compliance:april26:qa` pass
- [ ] Column diagnostics visible on April26 page when parsed

## 5. Review queue filters

- [ ] `/admin/compliance/approval/april-2026-compliance-review`
- [ ] Filters: status, confidence, rule_review, source_update_pending, etc.
- [ ] Sorts change ordering predictably

## 6. Rule review filter

- [ ] Filter to `rule_review` source type
- [ ] Items show rule panel; approve requires override + documented reason
- [ ] Never appear on batch readiness as eligible

## 7. Next-best-item flow

- [ ] **Review next best item** opens high-leverage item
- [ ] Order respects risk / ready / needs-info (not random)

## 8. Workbench item review

- [ ] Evidence panel loads
- [ ] **What happens when you approve?** visible
- [ ] Override reason when blockers present
- [ ] Initials required

## 9. Override reason behavior

- [ ] Cannot approve blocked items without override text
- [ ] Rule review override references rules review (see rule topic packet)

## 10. Approve preview

- [ ] Preview shows downstream effects before confirm

## 11. sourceUpdatePending banner

- [ ] Banner when source still updating; operator knows not to treat as final

## 12. Batch readiness page

- [ ] `/admin/compliance/approval/batch` — expect **0 eligible** until confidence ≥ 98% and no rule_review
- [ ] Reason breakdown listed (not silent zero)

## 13. Filing readiness page

- [ ] `/admin/compliance/filing-readiness` — overall **red** until source-backed gates pass
- [ ] Each blocker: severity, green condition, dependencies, fixable today vs not
- [ ] Filing QA command may pass while UI stays red (honest)

## 14. Export review list

- [ ] `npm run compliance:operator-review-export` — redacted v1
- [ ] `npm run compliance:operator-review-export-v2` — burn-down grouping, no donor names
- [ ] No `data/compliance/tasks/*.json` committed

## 15. Expected red/yellow states (honest)

| Area | Expected before full launch |
|------|-----------------------------|
| Filing readiness | Red (~6 blockers) |
| qa-full score | Yellow (~66) |
| Batch eligible | 0 |
| Bank CSV | Red/missing until file added |
| Storage | Yellow `local_private` locally |
| Rule topics | ~13 need human review on Rules page |

## Pass/fail checklist (rehearsal complete)

**Pass** when an operator can complete steps 1–14 without bypassing gates, and automated helpers agree:

```bash
npm run compliance:ai-thread-handoff
npm run compliance:qa-full
npm run compliance:april26:qa
npm run compliance:bank:qa
npm run compliance:rule-topic-packet
npm run compliance:storage-preflight
```

**Fail** if: filing shows green without source proof, batch approves rule_review, exports contain donor names, or bank CSV is faked in repo.

## Related docs

- `COMPLIANCE_OPERATOR_SMOKE_TEST.md` — shorter smoke pass
- `COMPLIANCE_RULE_TOPIC_REVIEW_PACKET.md` — 13 rule topics
- `COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md` — production deploy
- `COMPLIANCE_LAUNCH_REHEARSAL_PASS.md` — engineering pass report
