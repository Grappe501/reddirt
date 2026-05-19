# Netlify production verification checklist

Operator checklist — **do not assume deploy succeeded**. Verify in browser after Netlify build completes.

## Deploy identity

- [ ] Production commit is `7c849b5` or newer (`Harden compliance launch candidate workflow` minimum; launch rehearsal pass adds rehearsal tooling)
- [ ] Netlify deploy log green; note deploy URL

## Protected admin routes

- [ ] Unauthenticated user cannot access `/admin/compliance/*` (redirect or 401)
- [ ] Authenticated admin can load compliance hub

## Approval dashboard

- [ ] `/admin/compliance/approval` loads
- [ ] Queue metrics plausible (compare to handoff if run against same data snapshot)

## April26 page

- [ ] `/admin/compliance/april26` loads
- [ ] Bank CSV state honest (missing vs present on server filesystem — production may use mounted storage path)

## Bank CSV state

- [ ] Missing file: red banner, non-fatal, expected path documented
- [ ] Present file: readiness checks + rehearsal counts (no fake green)

## Filing readiness

- [ ] `/admin/compliance/filing-readiness` shows **red** until real gates clear
- [ ] Blocker cards show severity, green condition, dependencies

## Storage fallback warning

- [ ] If Supabase env missing: yellow `local_private` or explicit warning on settings/dashboard
- [ ] `/admin/compliance/settings#storage-setup` reflects health probe

## Private exports not public

- [ ] No `data/compliance/tasks/*.json` in repo or static assets
- [ ] No donor names in operator review exports
- [ ] Report JSON under `data/compliance/reports/` not served as public static files

## QA / build expectations (CI or manual on release branch)

```bash
npm run compliance:approval:build
npm run compliance:qa-approval
npm run compliance:qa-reconciliation
npm run compliance:qa-filing
npm run compliance:qa-storage
npm run compliance:qa-full
npm run typecheck
npm run lint
npm run build
```

Acceptable: filing QA passes while filing UI red; qa-full yellow; batch eligible 0.

## Rollback notes

- Redeploy previous Netlify publish
- Do not revert DB migrations in panic (migration not applied in rehearsal pass)
- Preserve env vars; never commit secrets in rollback PR
- If bad export leaked PII: rotate keys, remove artifact, audit access logs

## Related

- `COMPLIANCE_SUPABASE_STORAGE_PRODUCTION_CHECKLIST.md`
- `COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md`
