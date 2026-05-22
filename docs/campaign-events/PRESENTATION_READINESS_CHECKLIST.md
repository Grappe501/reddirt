# Presentation Readiness Checklist

## Kelly SOS demo path

- [ ] `/admin/ai-command-center` — command center + presentation score visible
- [ ] `/admin/campaign-manager-dashboard?month=2026-03` — executive summary + guidance
- [ ] `/admin/candidate-dashboard` — approvals + reimbursement cards
- [ ] `/admin/campaign-events/workbench` — month review entry
- [ ] `/admin/campaign-events/reimbursement` — print path (no real PII)
- [ ] `/admin/onboarding` — new volunteer walkthrough
- [ ] `/admin/ai-command-center/dashboard-builder` — treasurer blueprint demo

## Automated score

`scorePresentationReadiness()` in command center — target **≥82** for `demo_ready`.

## Netlify

- Run lane tests before merge to `main`
- Repo-wide `typecheck` may still fail on unrelated lanes — do not claim green CI without verification
- Set `NEXT_PUBLIC_CAMPAIGN_OS_DEV_TENANCY` only in local dev (never production demo)

## Paused (do not deepen)

- Multi-tenant billing, hosted auth, ledger `tenantId` isolation, client portal SaaS
