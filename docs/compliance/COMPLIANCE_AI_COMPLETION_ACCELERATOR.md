# Compliance AI completion accelerator

Generated: 2026-05-19T19:12:50.404Z  
Commit: e5b13cb

## Top 10 actions

1. **Add bank-april-2026.csv** (treasurer) — Treasurer export at H:\SOSWebsite\Compliance\April26\bank-april-2026.csv. Then npm run compliance:bank:qa
2. **Review unverified rule topics** (human) — 24 topic(s) on Rules page — not legal certification.
3. **Burn down approval queue** (operator) — 134 open; start: rule_review, filing_task_dependency, low_confidence
4. **Configure production storage** (steve) — Local private storage fallback active. Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and private bucket.
5. **DB migration (Steve approval)** (steve) — Steve approval + backup + rehearsal before cutover
6. **Risk: Bank CSV missing** (treasurer) — Add real treasurer export; run compliance:bank:qa
7. **Risk: Filing readiness red** (human) — Resolve blockers on filing readiness page; source-backed only
8. **Risk: PII in git or exports** (human) — Redacted exports only; gitignore tasks JSON
9. **Risk: Automated fake compliance green** (ai_assist) — Use AI brain; never bypass gates
10. **Risk: Zero batch-eligible items** (operator) — Fix fields/evidence; never batch rule_review

## Before deploy

- npm run compliance:deploy-readiness
- npm run build
- No tasks JSON staged; no unredacted exports
- COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md

Regenerate: `npm run compliance:ai-completion-accelerator`
