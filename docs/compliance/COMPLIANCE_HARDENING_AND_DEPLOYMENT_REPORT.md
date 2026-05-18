# Compliance Hardening and Deployment Report

Generated: 2026-05-18 (RedDirt lane hardening pass)

## Summary

Hardening pass focused on deploy stability, consistent corporate styling, honest filing readiness, privacy/gitignore coverage, and aggregate QA — without adding major new feature scope.

## What was fixed

- **Shared compliance UI** — `ComplianceStatusBadge`, `ComplianceMetricCard`, `ComplianceEmptyState`, `ComplianceWarningPanel`, `ComplianceActionButton`, `ComplianceHeroActions`, `ComplianceStagedNotice`; refreshed nav and card contrast (navy headings, white cards, slate body text).
- **Layout** — `compliance/layout.tsx` with soft gray page background (`#eef1f6`) across all compliance routes.
- **Command center** — prominent Wizard + Lightning Approval hero cards, “What should I do next?” panel, completion/commercial/filing/approval metrics, honest status badges.
- **Filing readiness** — overall status cannot stay green when hard gates are red or blockers exist; blocker panel and metric cards on UI.
- **Wizard** — storage + staged-not-filed notices.
- **Privacy** — expanded `.gitignore` for filing exports, nested import CSV/XLSX, bank CSV, generated reports.
- **QA** — `compliance:qa-hardening` + `compliance-route-registry.ts` (21 routes, page existence, approval guards, filing honesty, gitignore patterns).

## Styling improvements

- Dark navy (`#0f2744`) headings on white cards
- Red reserved for blockers; emerald/amber for status
- Larger primary CTAs on home and wizard
- Improved nav density (Approval + Can we file? prioritized)
- Removed low-contrast kelly-wash-only patterns on primary dashboards

## QA results

| Script | Result |
|--------|--------|
| `compliance:rules:build` | Pass (27 sources, 42 chunks; topics incomplete — expected) |
| `compliance:rules:audit` | Pass (warn: corpus incomplete) |
| `compliance:qa-hardening` | Pass (21 routes, 157+ approval items) |
| `compliance:qa-approval` | Pass |
| `compliance:qa-reconciliation` | Pass |
| `compliance:qa-filing-export` | Pass |
| `compliance:qa-tasks` | Pass (48 tasks) |
| `compliance:qa-mobile` | Pass |
| `compliance:qa-approvals` | Pass |
| `compliance:qa-storage` | Pass (local_private) |
| `compliance:qa-rule-retrieval` | Pass |
| `compliance:qa-receipts` | Pass (approve → awaiting_bank_match) |
| `compliance:qa-coverage` | Pass |
| `compliance:qa-filing` | Pass (overall **red**, 9 blockers) |
| `compliance:qa-full` | Pass (score 59, filing red) |
| `typecheck` | See commit CI / local run |
| `lint` | See commit CI / local run |
| `build` | See commit CI / local run |

All listed scripts exist in `package.json`. None were falsely claimed.

## Route smoke (registry + page files)

Static validation via `compliance-route-registry` + `qa-hardening` confirms `page.tsx` exists for:

- `/admin/compliance` through `/admin/compliance/settings` (21 routes)

Runtime browser smoke should still be run on Netlify preview after deploy.

## Current completion

| Metric | Value |
|--------|-------|
| Compliance completion | **~59%** (executive score) |
| Commercial readiness | **~37%** (derived from score + filing status) |
| Filing readiness | **red** (9 blockers) |
| Approval queue | 10 queues, 157+ items (local JSON) |

## Remaining blockers

1. Rule corpus — 8 missing topics; 0 verified sources; broken AEC links on some topics.
2. Filing hard gates — money approved, documentation, bank locks, treasurer chain, period verification.
3. Reconciliation — most bank lines still unmatched in typical dev data.
4. Storage — JSON fallback; production should use private object storage + Postgres ops draft.
5. `main` branch — merge feature branch or cherry-pick compliance commits before Netlify production tracks `main`.

## Next recommended 10 fixes

1. Merge compliance hardening commit to `origin/main`.
2. Run `compliance:approval:build` on production after deploy with April26 path configured.
3. Fix broken Arkansas Ethics / SOS source links (`compliance:rules:verify-links`).
4. Complete missing rule topics in corpus ingest.
5. Wire Supabase/private storage for receipt/cash uploads on Netlify.
6. Treasurer approval chain UI on filing packages.
7. Bank CSV import from live April26 folder on server (env `COMPLIANCE_APRIL26_DIR`).
8. Reduce rule-review noise in approval queue (cap or separate virtual queue).
9. Add runtime E2E smoke for approval workbench on preview URL.
10. Legal review workflow flag per topic on Rules page.

## Netlify deployment expectation

- Build uses `netlify:build` / `next build`; Prisma may log DB URL warnings during static generation — blog routes degrade gracefully.
- Compliance pages are **dynamic** (`force-dynamic` on key routes) and read JSON from `data/compliance` — ensure Netlify build does not commit private JSON; configure env for production storage when ready.
- After push to `main`, Netlify should deploy; compliance UI will load with empty queues until operator runs imports + **Rebuild queues**.
