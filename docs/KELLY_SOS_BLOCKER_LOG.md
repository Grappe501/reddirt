# Kelly SOS — blocker log (KELLY-BLK-1)

**Rules:** Blocker = work **stopped** until resolved. Severity: **P0** launch / legal, **P1** major feature, **P2** nice-to-have. Do not paste env **values**.

| ID | Opened | Severity | Blocker | Owner | Resolution / date |
|----|--------|----------|---------|-------|---------------------|
| BLK-001 | 2026-04-26 | P1 | Local `npm run build` may log Prisma errors when Postgres not at `127.0.0.1:5433` — build can still exit 0; confusing for CI | Ops | Document “start `dev:db` before check” in runbook; optional CI service container |
| BLK-002 | 2026-04-26 | P0 | Day 3 chain is not yet proven in a live DB environment. Code bridge from `/api/forms` to `WorkflowIntake` is implemented, but fake public form -> DB -> admin visibility still needs smoke proof with Postgres running | Cursor + Codex | Run `dev:db`, `dev:prepare`, fake form POST, confirm `Submission` + `WorkflowIntake`, then verify `/admin/workbench` visibility |
| | | | | | |

### Cleared (archive)

*(Move rows here when done.)*
