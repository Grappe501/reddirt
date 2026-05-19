# Compliance AI thread handoff

Run `npm run compliance:ai-thread-handoff` for live JSON status.

## Active lane

- Path: `H:\SOSWebsite\RedDirt`
- Env: `H:\SOSWebsite\RedDirt\.env` only (never commit)
- Main baseline: `6b799ba` — Lightning Approval Workbench merged
- Local: `http://localhost:3000`

## What we are building

Kelly SOS **Compliance Command Center** — staged campaign finance workflow (contributions, receipts, cash, checks, reconciliation, filing readiness). **Not legal certification.** Human treasurer/compliance officer approval required.

## April26 operator data

- Folder: `H:\SOSWebsite\Compliance\April26`
- GoodChange CSV: present when file name matches importer
- **Missing:** `bank-april-2026.csv` (headers: date, amount, memo; credits positive)
- Admin desk: `/admin/compliance/april26`

## Lightning Approval Workbench

- Hub: `/admin/compliance/approval`
- April queue: `/admin/compliance/approval/april-2026-compliance-review`
- ~10 queues, ~134 items (rebuild with `npm run compliance:approval:build`)
- Batch strict: confidence ≥98%, low risk, evidence, no blockers → often **0 eligible**
- QA: `npm run compliance:qa-approval`

## Filing readiness

- Route: `/admin/compliance/filing-readiness`
- Status: **red** until gates pass — do not fake green
- Blocker burn-down with links to approval, reconciliation, rules, storage

## Storage & DB

- JSON under `data/compliance/**` (gitignored PII paths)
- Supabase private bucket: see `docs/compliance/SUPABASE_PRIVATE_STORAGE_SETUP.md`
- DB cutover: `docs/compliance/COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md` — not production yet

## Validation before push

```bash
npm run compliance:approval:build
npm run compliance:qa-approval
npm run compliance:qa-reconciliation
npm run compliance:qa-filing
npm run compliance:qa-storage
npm run compliance:qa-full
npm run compliance:april26:dry
npm run compliance:april26:qa
npm run typecheck
npm run lint
npm run build
```

## Hard rules

- No cross-lane edits (sos-public, ajax, phatlip, countyWorkbench)
- No donor PII, bank exports, or receipts in git
- No unrelated calendar/email/travel work in compliance passes
- Use clean `main` worktree when feature branch is dirty
