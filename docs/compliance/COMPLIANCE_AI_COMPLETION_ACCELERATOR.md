# Compliance AI completion accelerator

Generated: 2026-05-19T21:26:36.377Z  
Commit: d47d472

## Top 10 actions

1. **Review unmatched bank lines** (operator) — 10 unmatched bank transaction(s).
2. **Review unverified rule topics** (human) — 24 topic(s) on Rules page — not legal certification.
3. **Burn down approval queue** (operator) — 221 open; start: rule_review, source_update_pending, filing_task_dependency, low_confidence
4. **Configure production storage** (steve) — Local private storage fallback active. Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and private bucket.
5. **DB migration (Steve approval)** (steve) — Steve approval + backup + rehearsal before cutover
6. **Risk: Filing readiness red** (human) — Resolve blockers on filing readiness page; source-backed only
7. **Risk: PII in git or exports** (human) — Redacted exports only; gitignore tasks JSON
8. **Risk: Automated fake compliance green** (ai_assist) — Use AI brain; never bypass gates
9. **Risk: Zero batch-eligible items** (operator) — Fix fields/evidence; never batch rule_review
10. **Risk: Rule review items require human topic review** (human) — Rules page review + per-item override if approving

## Before deploy

- npm run compliance:deploy-readiness
- npm run build
- No tasks JSON staged; no unredacted exports
- COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md

Regenerate: `npm run compliance:ai-completion-accelerator`
