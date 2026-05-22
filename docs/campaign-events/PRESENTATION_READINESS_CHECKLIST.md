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

## Netlify / CI (feature branch proof)

Verified on `feature/kelly-schedule-settlement-dashboard` @ `1be16b0` (local, May 2026):

| Gate | Result |
|------|--------|
| `npm run typecheck` | Pass (0 errors) |
| `npm run lint` | Pass (warnings only) |
| `npm run build` | Pass (~6 min) |
| `agents:test-single-campaign-hardening` | Pass |
| `agents:test-dashboard-nav` | Pass |
| `agents:test-sprint-10` | Pass |

`npm run check` = strategy-manual + lint + typecheck + build — run before merging to `main`.

**Main branch** was not re-verified in this pass; merge only after `check` on the merge result.

- Set `NEXT_PUBLIC_CAMPAIGN_OS_DEV_TENANCY` only in local dev (never production demo)

## Paused (do not deepen)

- Multi-tenant billing, hosted auth, ledger `tenantId` isolation, client portal SaaS
