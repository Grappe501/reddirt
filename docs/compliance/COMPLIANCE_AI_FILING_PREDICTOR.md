# Filing readiness predictor

Current: **red** (honest — not fabricated)

## Current blockers
- Rule verification missing
- Unapproved records
- Bank credits need treasurer review
- Rule topics awaiting officer review
- Storage not production-ready
- DB persistence not production-ready
- Required rule topics have official sources
- Filing period / due date verified or overridden
- Filing snapshot generated
- Audit manifest generated

## To yellow
- Audit spreadsheet materially complete
- Reconciliation exceptions documented or resolved
- Rule topics reviewed (campaign workflow)

## To green
- Treasurer sign-off recorded
- Production storage RLS verified
- Filing hard gates all pass
- Queue terminal states for April26 scope

## Fastest unblockers
- Ernie: SOS checks + Ozark rows
- Treasurer: 14 ambiguous bank matches
- Compliance officer: rule topic reviews

## Scenarios
### After audit spreadsheet complete
Expected: yellow
- human_answer filled
- import preview clean

### After addresses complete
Expected: yellow
- no invented addresses
- vendor confirmed

### After reconciliation locked
Expected: yellow
- treasurer lock
- exceptions documented

### After rule review cleared
Expected: yellow
- topics reviewed
- not batch approved

### After production storage ready
Expected: green_possible
- Supabase RLS
- operator checklist

Regenerate: `npm run compliance:ai-filing-predictor`