# Compliance deployment readiness

Pre-Netlify deploy verification. Run: `npm run compliance:deploy-readiness`

## Automated checks

- `npm run typecheck` passes
- Required docs exist (this file, Netlify verify, progress matrix, launch rehearsal)
- DB migration not accidentally applied (`COMPLIANCE_DB_MIGRATED` false)
- Filing and bank status documented in JSON output

## Manual pre-push checklist

- [ ] `git status` — no `data/compliance/tasks/*.json` staged
- [ ] No donor names in committed exports
- [ ] `npm run build` passes locally
- [ ] `npm run compliance:ai-expert:qa` passes
- [ ] `npm run compliance:deploy-readiness` reviewed

## Production blockers (expected until launch)

- Bank CSV may be missing — honest state in UI
- Filing red until source-backed gates clear
- Storage `local_private` until Supabase + RLS
- Operator Netlify browser checklist unsigned

## After deploy

Follow `COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md` in the browser.

## Output

`data/compliance/ai/deploy-readiness.json` (gitignored)
