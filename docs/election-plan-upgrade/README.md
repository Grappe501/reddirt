# Election Plan + Executive Book — system upgrade walkthrough

**Lane:** `RedDirt/` only  
**Audience:** Steve (operator), Kelly (candidate review), engineering agents  
**Last audit:** 2026-06-16

This folder is the **single walkthrough spine** for bringing every Election Plan portal page up to the same production standard as the Executive War Room and Executive Book — without inventing new product lanes.

## How to use these docs

Read in order with campaign leadership / operator review sessions:

| Doc | Purpose |
|-----|---------|
| [00-SYSTEM-AUDIT.md](./00-SYSTEM-AUDIT.md) | Build pipeline, link audit, pilot smoke, UI critic notes |
| [01-UPGRADE-RECOMMENDATION.md](./01-UPGRADE-RECOMMENDATION.md) | Full system upgrade recommendation (what to build, what to defer) |
| [02-OPERATOR-BUILD-WALKTHROUGH.md](./02-OPERATOR-BUILD-WALKTHROUGH.md) | Session-by-session build script for operator-led review |
| [03-PAGE-TIER-MATRIX.md](./03-PAGE-TIER-MATRIX.md) | Thick vs thin pages — leveling checklist |

## Sandbox commands (run from `RedDirt/`)

```bash
node scripts/run-with-h-drive-env.cjs npm run election-plan:build
node scripts/run-with-h-drive-env.cjs npm run campaign-brain:executive-book:completion
node scripts/run-with-h-drive-env.cjs npm run election-plan:search:build
node scripts/run-with-h-drive-env.cjs npm run election-plan:audit:routes
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:pilot-smoke
```

## Admin doorway (Steve smoke test)

`/admin/election-plan` — pinned smoke-test links:

- Faulkner county playbook
- Jacksonville city workbench
- Sherwood city workbench + `#events`
- Grassroots & Guitar Strings event workbench (not city leadership)

## Engineering priority lock

Do **not** add coalition scoreboards. Next engineering after this upgrade spine:

1. Finish Jacksonville + G&G pilot smoke in production UI
2. PPEN A.0b Person + Participation
3. PPEN A.0c intake / activation

See `docs/KELLY_SOS_ENGINEERING_PRIORITY.md`.

## Naming cleanup

User-facing Election Plan copy no longer uses placeholder persona names. Campaign leadership roles are labeled **Campaign Manager (assign owner)** until PPEN assigns real people. Compliance admin route rename (`/admin/compliance/ernie` → operator workflow) is Phase 4 in the upgrade recommendation.
