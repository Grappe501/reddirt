# Compliance AI expert brief

Generated: 2026-05-19T18:50:42.479Z  
Commit: 3c6754b  
Overall completion: **51%** across 35 areas

> Not legal advice. Human review required. Green only when source-backed.

## Launch

- **Status:** not_ready (13% checklist)

## Top 5 now

1. **Add bank-april-2026.csv** (treasurer) — Treasurer export at H:\SOSWebsite\Compliance\April26\bank-april-2026.csv. Then npm run compliance:bank:qa
2. **Review unverified rule topics** (human) — 24 topic(s) on Rules page — not legal certification.
3. **Burn down approval queue** (operator) — 133 open; start: rule_review, source_update_pending, filing_task_dependency, low_confidence
4. **Configure production storage** (steve) — Local private storage fallback active. Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and private bucket.
5. **DB migration (Steve approval)** (steve) — Steve approval + backup + rehearsal before cutover

## Top 5 risks

- **critical** Bank CSV missing
- **critical** Filing readiness red
- **critical** PII in git or exports
- **critical** Automated fake compliance green
- **high** Zero batch-eligible items

## Next best workflow

Work the April queue (133 open). Start with rule review items, then near-eligible confidence fixes. Never batch rule_review.

## Next human / AI

- **Human:** Add bank CSV at H:\SOSWebsite\Compliance\April26\bank-april-2026.csv
- **AI:** Run compliance:ai-expert and guide operator through operator-coach steps; never auto-approve.

## What would make filing green

- All required rule topics marked reviewed with initials on Rules page.
- bank-april-2026.csv validates and reconciliation rehearsal passes.
- Open approval items reach approved/needs-info/rejected terminal states.
- Storage health probe reports ready with RLS verified flag.
- Steve-approved migration + COMPLIANCE_DB_MIGRATED=true after backfill.
- Hard gate "Required rule topics have official sources" passes or authorized override with initials.
- Hard gate "Filing period / due date verified or overridden" passes or authorized override with initials.
- Hard gate "Filing snapshot generated" passes or authorized override with initials.
- Hard gate "Audit manifest generated" passes or authorized override with initials.
- Compliance officer human sign-off (not legal certification)
- All hard gates pass in source-backed workflow

## Must not do

- batch approve rule review
- lower confidence threshold below 98
- fake filing green
- invent bank csv or transactions
- commit data compliance tasks json
- export unredacted donor names
- apply db migration without steve approval
- bypass storage or rls gates
- auto certify legal compliance
- delete approval or filing records

## Outputs

- `data/compliance/ai/expert-snapshot.json`
- `data/compliance/ai/completion-progress.json`
- `data/compliance/ai/*-coach.json`
- `data/compliance/ai/ux-audit.json`

Regenerate: `npm run compliance:ai-expert`
