# Compliance launch rehearsal pass — Burt

## Commit base

- **Base:** `7c849b5` — Harden compliance launch candidate workflow
- **Pass commit:** (this pass) — Advance compliance launch rehearsal readiness

## What changed

### Bank CSV ingestion and reconciliation rehearsal

- `src/lib/compliance/imports/bank-csv-parse.ts` — shared parse, column detection, amount/date normalization, duplicate/malformed reporting
- `src/lib/compliance/imports/bank-reconciliation-rehearsal.ts` — unmatched bank/payouts, ambiguous/high-confidence matches, confidence reason strings, operator next steps (non-fatal when file missing)
- April26 page: reconciliation rehearsal card + column diagnostics
- `npm run compliance:bank:qa` — focused bank QA (status `missing_file` when absent)
- `april26-qa` extended with `bankRehearsal` summary

### Operator launch rehearsal

- `docs/compliance/COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md` — full walkthrough + pass/fail checklist

### Queue burn-down v2

- `src/lib/compliance/approval/approval-burn-down-v2.ts` — redacted rows, `BURN_DOWN_START_ORDER`, summary grouping
- `npm run compliance:operator-review-export-v2` → `reports/compliance/operator-review-list-v2-redacted.json`
- Queue page: “Where to start” from v2 summary

### Rule topic review packet

- `src/lib/compliance/knowledge/rule-topic-review-packet.ts`
- `npm run compliance:rule-topic-packet` → `data/compliance/reports/rule-topic-review-packet.json` (gitignored)
- `docs/compliance/COMPLIANCE_RULE_TOPIC_REVIEW_PACKET.md`

### Filing blockers v2

- `filing-blocker-burn-down.ts` — severity, `greenCondition`, `operatorFixableToday`, dependency flags
- Filing readiness UI shows turn-green condition and deps

### Netlify production verify

- `docs/compliance/COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md`

### Storage hardening follow-up

- `npm run compliance:storage-preflight`
- Settings page CLI hint; storage checklist updated

## Routes touched

- `/admin/compliance/april26`
- `/admin/compliance/approval/[queueId]`
- `/admin/compliance/filing-readiness`
- `/admin/compliance/settings`

## Scripts added/changed

| Script | Purpose |
|--------|---------|
| `compliance:bank:qa` | Bank CSV + rehearsal QA |
| `compliance:operator-review-export-v2` | Redacted burn-down export |
| `compliance:rule-topic-packet` | Rule topic JSON packet |
| `compliance:storage-preflight` | Storage mode / RLS checklist JSON |
| `compliance:april26:qa` | + bank rehearsal section |

## Source safety gates preserved

- Confidence ≥ 98% batch gate unchanged
- `rule_review` excluded from batch; override required
- Filing readiness stays red until hard gates clear (not faked)
- No `data/compliance/tasks/*.json` committed
- Bank CSV not invented; missing-file non-fatal
- No DB migration applied

## Metrics (before → after)

| Metric | Before (7c849b5) | After pass |
|--------|------------------|------------|
| Filing blockers | 6 | 6 |
| Filing overall | red | red |
| Open approval items | 133 | 133 |
| Batch eligible | 0 | 0 |
| qa-full score | 66 yellow | 66 yellow |
| Bank CSV | missing | missing |
| Rule topics unverified (packet) | — | 24 |

## Bank CSV status

- **Missing:** `H:\SOSWebsite\Compliance\April26\bank-april-2026.csv`
- `compliance:bank:qa` → `status: missing_file`, `readyForRehearsal: false`
- When file is added: re-run `compliance:bank:qa`, `april26:qa`, refresh April26 page

## QA command results

All exit 0:

- `compliance:approval:build` — 134 items, 10 queues
- `compliance:qa-approval` — batchEligible 0, blockedGuard true
- `compliance:qa-reconciliation` — ok
- `compliance:qa-filing` — ok, overallStatus red, blockers 6
- `compliance:qa-storage` — local_private
- `compliance:qa-full` — score 66 yellow, filing red
- `compliance:april26:dry` / `april26:qa` — ok
- `compliance:bank:qa` — missing_file (expected)
- `compliance:rule-topic-packet` — ok
- `compliance:storage-preflight` — ok
- `compliance:operator-review-export-v2` — ok (133 open; summary: rule_review 44, low_confidence 81, …)
- `typecheck` — ok
- `lint` — warnings only (pre-existing)
- `build` — ok

## Remaining launch blockers

1. Add **bank-april-2026.csv** (human treasurer export)
2. Work approval queue (133 open; 0 batch eligible)
3. Rule topic review on Rules page (24 unverified in corpus audit)
4. Production Supabase storage + RLS verification
5. Filing remains red until source-backed gates clear
6. Ethics workbook optional gap on April26 desk

## Next human action

Place real bank export at:

`H:\SOSWebsite\Compliance\April26\bank-april-2026.csv`

Then run operator launch rehearsal per `COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md`.

## Docs added

- `COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md`
- `COMPLIANCE_RULE_TOPIC_REVIEW_PACKET.md`
- `COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md`
- `COMPLIANCE_LAUNCH_REHEARSAL_PASS.md` (this file)
