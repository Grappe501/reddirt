# Compliance progress matrix

Generated: 2026-05-19T21:26:39.816Z · Commit: d47d472 · **Overall: 57%**

> Regenerate live metrics: `npm run compliance:ai-progress-chart` and `npm run compliance:ai-expert`. Percentages are heuristic — honest status beats fake green.

| Area | Purpose | Status | % | Complete work | Started incomplete | Needs hardening | Missing for 100% | Immediate improvement | Owner | Launch |
|------|---------|--------|---|---------------|-------------------|-----------------|------------------|----------------------|-------|--------|
| Source intake | All April26 sources validated | in_progress | 98 | Core built | In progress | Add bank-april-2026.csv or admin bank import | All April26 sources validated; bank:qa ok; april26 | Add bank-april-2026.csv or admin bank import | treasurer | critical |
| April26 import desk | Bank validated on desk | in_progress | 80 | Core built | In progress | Open April26 desk | Bank validated on desk; Reconciliation rehearsal r | Open April26 desk | operator | critical |
| Bank source | compliance:bank:qa status ok | complete | 100 | Core built | — | Treasurer adds bank-april-2026.csv or imports via admin bank import | compliance:bank:qa status ok; readyForReconciliati | Treasurer adds bank-april-2026.csv or imports via admin bank import | treasurer | critical |
| GoodChange CSV | Contributions approved in queue | in_progress | 95 | Core built | In progress | Verify 52 rows staged in April26 | Contributions approved in queue | Verify 52 rows staged in April26 | operator | critical |
| Receipts/checks/in-kind evidence | Evidence linked for each expense/check/i | in_progress | 75 | Partial | In progress | Match receipt images to expense approvals | Evidence linked for each expense/check/in-kind ite | Match receipt images to expense approvals | operator | high |
| Ethics workbook | Optional source present or waived by pol | not_started | 10 | Partial | — | Add workbook if campaign uses it | Optional source present or waived by policy | Add workbook if campaign uses it | human | low |
| Reconciliation | Unmatched lists resolved or accepted wit | in_progress | 50 | Partial | In progress | Run bank rehearsal | Unmatched lists resolved or accepted with notes | Run bank rehearsal | treasurer | critical |
| Approval queues | Open count 0 or documented exceptions | in_progress | 5 | Partial | 221 open items | Start burn-down: rule_review | Open count 0 or documented exceptions | Start burn-down: rule_review | operator | critical |
| Workbench review | Each item approved/needs_info/rejected w | in_progress | 78 | Partial | 133 items need per-item human decision | Use Review next best item | Each item approved/needs_info/rejected with initia | Use Review next best item | operator | critical |
| Batch approval | Batch page shows eligible >0 for safe it | in_progress | 40 | Partial | Batch eligible 0 by design until confidence ≥98% and no rule_review | Fix fields/evidence on near-eligible items | Batch page shows eligible >0 for safe items only | Fix fields/evidence on near-eligible items | operator | medium |
| Rule review | Per-item approve with override only afte | in_progress | 35 | Partial | 44 rule_review queue items | Review topics on Rules page first | Per-item approve with override only after topic re | Review topics on Rules page first | human | critical |
| Rule topic packet | unverifiedCount 0 | in_progress | 28 | Partial | 24 unverified topics | npm run compliance:rule-topic-packet | unverifiedCount 0 | npm run compliance:rule-topic-packet | human | high |
| Filing readiness | All hard gates green with human sign-off | blocked | 5 | Partial | — | Open filing readiness page | All hard gates green with human sign-off | Open filing readiness page | human | critical |
| Filing blockers | Each blocker greenCondition met | blocked | 0 | Partial | — | Resolve: Rule verification missing | Each blocker greenCondition met | Resolve: Rule verification missing | human | critical |
| Storage/evidence protection | Private storage verified | in_progress | 45 | Partial | Local private storage fallback active. Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and private bucket. | Review settings storage panel | Private storage verified; No public evidence URLs | Review settings storage panel | steve | critical |
| Supabase production storage | storage-preflight ready:true | not_started | 25 | Partial | — | Configure Netlify env vars | storage-preflight ready:true; RLS checklist signed | Configure Netlify env vars | steve | critical |
| DB migration | Backup, rehearsal, cutover, post-migrati | not_started | 20 | Partial | — | Read migration execution plan | Backup, rehearsal, cutover, post-migration QA | Read migration execution plan | steve | medium |
| AI brain | Brain QA passes | in_progress | 85 | Core built | In progress | npm run compliance:ai-brain | Brain QA passes; Handoff includes snapshot | npm run compliance:ai-brain | ai_assist | high |
| AI next actions | Actions match live blockers | in_progress | 85 | Core built | In progress | compliance:ai-next-actions | Actions match live blockers | compliance:ai-next-actions | ai_assist | high |
| AI risk register | Critical risks have mitigations | in_progress | 85 | Core built | In progress | compliance:ai-risk-report | Critical risks have mitigations | compliance:ai-risk-report | ai_assist | high |
| AI launch readiness | Checklist 100% for launch_ready | blocked | 25 | Partial | — | compliance:ai-launch-readiness | Checklist 100% for launch_ready | compliance:ai-launch-readiness | ai_assist | critical |
| AI handoff | New threads get full context | in_progress | 90 | Core built | In progress | compliance:ai-thread-handoff | New threads get full context | compliance:ai-thread-handoff | ai_assist | medium |
| Command center | Operator uses CC as home base without tr | in_progress | 88 | Core built | Operator rehearsal and Netlify verify pending | Open command center daily | Operator uses CC as home base without training | Open command center daily | operator | critical |
| Operator exports | Burn-down export drives daily work | in_progress | 85 | Core built | In progress | operator-review-export-v2 | Burn-down export drives daily work | operator-review-export-v2 | operator | high |
| Operator smoke test | All smoke steps pass in browser | in_progress | 60 | Partial | Not run on production yet | Walk COMPLIANCE_OPERATOR_SMOKE_TEST.md locally | All smoke steps pass in browser | Walk COMPLIANCE_OPERATOR_SMOKE_TEST.md locally | operator | high |
| Launch rehearsal | Pass/fail checklist complete | in_progress | 65 | Partial | Bank source validated; recon matches need review | COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md | Pass/fail checklist complete | COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md | operator | critical |
| Netlify production verification | Checklist signed after deploy | not_started | 10 | Partial | — | COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md | Checklist signed after deploy | COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md | operator | critical |
| UI/UX clarity | UX plan implemented per route | in_progress | 70 | Partial | Tables still dense on queue page | Use shared What this means / Do this next panels | UX plan implemented per route | Use shared What this means / Do this next panels | engineering | high |
| Accessibility | WCAG spot-check on compliance routes | not_started | 40 | Partial | — | Nav aria-label present | WCAG spot-check on compliance routes | Nav aria-label present | engineering | medium |
| Audit trail | Export audit log for filing period | in_progress | 70 | Partial | In progress | Verify initials on approvals | Export audit log for filing period | Verify initials on approvals | operator | high |
| Security/privacy | No PII in repo or public exports | in_progress | 75 | Partial | Production RLS not verified | Confirm gitignore for tasks JSON | No PII in repo or public exports | Confirm gitignore for tasks JSON | steve | critical |
| Documentation | All phases documented with exit criteria | in_progress | 88 | Core built | In progress | Keep STATE_OF_BUILD current | All phases documented with exit criteria | Keep STATE_OF_BUILD current | engineering | high |
| QA automation | qa-full green when real gates pass | in_progress | 82 | Core built | qa-full yellow 66 | npm run compliance:qa-full | qa-full green when real gates pass | npm run compliance:qa-full | engineering | high |
| Market readiness | Demo + operator + filing + public launch | blocked | 25 | Partial | — | COMPLIANCE_MARKET_READINESS_PLAN.md | Demo + operator + filing + public launch gates | COMPLIANCE_MARKET_READINESS_PLAN.md | human | critical |
| AI expert v2 | Expert QA passes | in_progress | 85 | Core built | Coaches need live bank data to be fully actionable | npm run compliance:ai-expert | Expert QA passes; Operators use coach steps daily | npm run compliance:ai-expert | ai_assist | high |

## Top 10 risks (program)

1. Reconciliation ambiguous/unmatched matches need treasurer review  
2. 133 open approvals — human throughput  
3. 24 unverified rule topics — rule_review guard  
4. Filing red — do not export  
5. Zero batch eligible — intentional until ≥98% confidence  
6. Production storage/RLS not verified  
7. DB migration not applied — JSON authority  
8. Netlify deploy not operator-verified  
9. PII leak risk in exports/commits  
10. Fake green via automation — guarded by AI expert unsafe list  

## Launch completion checklist

- [x] Bank source validated (file or import chunks)  
- [ ] Reconciliation unmatched resolved  
- [ ] Rule topics reviewed on Rules page  
- [ ] Approval queue burned down  
- [ ] Filing readiness green (source-backed)  
- [ ] Supabase private storage + RLS  
- [ ] Operator launch rehearsal pass  
- [ ] Netlify production verify  
- [ ] Treasurer/compliance sign-off  

See `COMPLIANCE_MARKET_READINESS_PLAN.md` and `COMPLIANCE_COMPLETION_PLAN.md`.
