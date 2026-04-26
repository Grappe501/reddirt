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
| **2026-04-27** | Cursor | `build/reddirt-public-copy-pass-03` | Node v22+ / npm 10+ | `npm run check` | **(run)** | **Day 5 pass:** legal pages, footer, compliance + deploy docs, comms SLA; see [`KELLY_SOS_DAY_5_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_5_COMPLETION_REPORT.md). |
| **2026-04-27** | Cursor | (local) | — | `POST /api/forms` intake smoke (see [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md)) | **Complete** | Same session as 2026-04-26 local E2E row below (log date alignment). |
| **2026-04-26** | Cursor | (local) | Node v22.22.0 / npm 10.9.3 | `npm run dev:db` + `npx prisma migrate deploy` | **Exit 0** | Container `reddirt-db-1` running. `prisma generate` logged EPERM renaming `query_engine-windows.dll.node` on Windows; **migrate deploy** succeeded — no pending migrations. |
| **2026-04-26** | Cursor | (local) | — | `npm run db:ping` | **Exit 0** | `pg_isready` OK. |
| **2026-04-26** | Cursor | (local) | — | `npm run dev` + intake smoke [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md) | **OK** | **`join_movement`** and **`volunteer`** POSTs to `http://localhost:3000/api/forms` → `ok: true` with `submissionId`, `userId`, `workflowIntakeId`. Postgres: two **`WorkflowIntake`** rows **PENDING**; **`VolunteerProfile`** row for volunteer submit. Fake data only (`@example.com`). **Workbench UI** not re-tested in browser this run; open-work data is present for `/admin/workbench`. |
| **2026-04-26** | Cursor | (local) | Node v22.22.0 / npm 10.9.3 | `npm run check` | **Exit 0** | Post–Day 3 E2E: lint warnings only; `next build` completed (Docker Postgres was up during build). |
| **2026-04-26** | Cursor | (local) | — | **Day 6 Section 1** — deploy QA + CI | **Complete** | **`deployment.md`** aligned with `netlify.toml` / `scripts/netlify-build.sh`; **Kelly SOS deploy checklist** added; **`KELLY_SOS_INTAKE_SMOKE.md`** accepts `$base` for preview URLs; **`.github/workflows/check.yml`** added (`migrate deploy` + `npm run check` vs Postgres). **Hosted snapshot:** `www.kellygrappe.com` **`/`** + **`/donate`** OK; **`/privacy`**, **`/terms`**, **`/get-involved`** returned **404** on automated fetch — use **Netlify deploy preview** for full route parity smoke. Report: [`KELLY_SOS_DAY_6_SECTION_1_REPORT.md`](./KELLY_SOS_DAY_6_SECTION_1_REPORT.md). **Prod `POST /api/forms`** intentionally not run here. |
| **2026-04-26** | Cursor | (local) | — | **Section 2** — `section2-preview-smoke.ps1` + demo route GETs | **OK** | **`http://localhost:3001`** (`next dev` used **3001** because **3000** was in use). **GET** `/`, `/privacy`, `/terms`, `/disclaimer`, `/get-involved`, `/donate` → 200. **POST** `/api/forms` `join_movement` → `ok: true`, `workflowIntakeId=cmogemy1z000411zpgyy9ajkh`. **`/admin`** → 307, **`/admin/login`** → 200. Demo paths checked: `/priorities`, `/direct-democracy`, `/county-briefings`, `/donate`, `/disclaimer`. Sign-off: [`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md). **Follow-up:** run same script against a **Netlify deploy preview** URL when available; treasurer/counsel formal initials still recommended. |
| **2026-04-26** | Cursor | (local) | — | **Section 3** — launch lock + maintenance handoff | **Complete** | Docs: [`KELLY_SOS_SECTION_3_LAUNCH_LOCK.md`](./KELLY_SOS_SECTION_3_LAUNCH_LOCK.md); [`KELLY_SOS_NEXT_PASS_SCRIPT.md`](./KELLY_SOS_NEXT_PASS_SCRIPT.md) → **post-launch / maintenance**; execution board + decision log updated. |

### Commands not re-run separately (Day 1)

`npm run check` already runs **`lint:all`**, **`typecheck`**, and **`build`**. Separate `npm run lint`, `npm run typecheck`, and `npm run build` were **not** duplicated after `check` succeeded.

### How to run full gate

```bash
cd H:\SOSWebsite\RedDirt
npm run dev:db    # optional: if using Docker Postgres
npm run check     # lint + typecheck + next build
```
