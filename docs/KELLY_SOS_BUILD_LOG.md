# Kelly SOS — build log (KELLY-BLD-1)

Append a row per meaningful verification run. Do not paste secret values.

| Date (UTC) | Operator | Branch | Node / npm | Command | Result | Notes |
|------------|----------|--------|------------|---------|--------|-------|
| 2026-04-26 | Cursor | — | — | `npm run lint:all` | Exit 0 | ESLint warnings only |
| 2026-04-26 | Cursor | — | — | `npm run typecheck` | Exit 0 | `tsc --noEmit` |
| 2026-04-26 | (prior) | — | — | `npm run check` | Exit 0 | Prisma DB unreachable in some runs during SSG |
| **2026-04-26** | **Cursor** | **`build/reddirt-public-copy-pass-03`** | **Node v22.22.0 / npm 10.9.3** | **`npm run check`** | **Exit 0** | **Day 1 baseline:** `lint:all` + `typecheck` + `next build` completed. ESLint **warnings** only (unused vars, `<img>`, one hook deps). **`npm install` skipped** — `node_modules` present. **Prisma:** build output included **`prisma:error`** / “Can’t reach database server” during static generation (same class as prior audits) — **build still finished** and printed route table. **Likely fix:** run `npm run dev:db` (or ensure Postgres on `DATABASE_URL`) before `next build` for clean logs. **Blocks launch?** **No** for compile artifact; **yes** for production fidelity (forms, DB pages, counties) if prod DB down. |
| **2026-04-26** | Cursor | (local) | Node v22.22.0 / npm 10.9.3 | `npm run dev:prepare` | **Exit 1** | **P1001** — cannot reach `127.0.0.1:5433`. **Fix:** `npm run dev:db` then re-run. |
| **2026-04-26** | Cursor | (local) | — | `npm run check` | **Exit 0** | **Day 2** after public polish PR; lint warnings only; build success. |
| **2026-04-26** | Codex | (local dirty worktree) | — | `npm run check` | **Exit 0** | First sandboxed run failed at `next build` with `spawn EPERM`; rerun with worker spawning allowed passed. ESLint warnings only. Build still logged Prisma DB-unavailable fallbacks for `127.0.0.1:5433`, then completed route generation. |
| **2026-04-26** | Codex | (local dirty worktree) | — | `npm run typecheck` | **Exit 0** | Day 3 code bridge typechecked after adding public form -> `WorkflowIntake` creation and transparency copy section. |
| **2026-04-26** | Codex | (local dirty worktree) | — | `npm run db:ping` | **Exit 1** | Sandbox Docker access issue: config access denied and compose `-T` flag issue. Elevated Docker check was not completed in this session. |
| **2026-04-26** | Codex | (local dirty worktree) | — | `npm run check` | **Exit 1** | Lint + typecheck completed; `next build` failed with sandbox `spawn EPERM` when creating worker processes. |
| **2026-04-26** | Codex | (local dirty worktree) | — | `npm run build` | **Exit 1** | Elevated build compiled successfully, then failed at page-data phase with `ENOENT .next/build-manifest.json`, likely residue from prior timed-out build. Per no-delete rule, `.next` was not cleaned in this session. |
| **2026-04-27** | Cursor | (local) | — | (Day 4 doc + `FormSuccessPanel` blurb) | **Pending** | Run **`npm run check`** to verify after pull; no secrets. Day 4 deliverables: [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md), [`KELLY_SOS_DAY_4_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_4_COMPLETION_REPORT.md). |
| | | | | | | |

### Commands not re-run separately (Day 1)

`npm run check` already runs **`lint:all`**, **`typecheck`**, and **`build`**. Separate `npm run lint`, `npm run typecheck`, and `npm run build` were **not** duplicated after `check` succeeded.

### How to run full gate

```bash
cd H:\SOSWebsite\RedDirt
npm run dev:db    # optional: if using Docker Postgres
npm run check     # lint + typecheck + next build
```
