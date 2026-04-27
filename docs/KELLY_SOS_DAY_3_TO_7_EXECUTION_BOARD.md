# Kelly SOS — Day 3 to Day 7 execution board

**Scope:** `H:\SOSWebsite\RedDirt` only.  
**Status date:** 2026-04-26.  
**Purpose:** Coordinate Cursor + Codex from Slice 3 through launch lock without cross-lane drift.

## Current Position

| Area | State |
|------|-------|
| Root alignment | Fixed. `H:\SOSWebsite` contains `START_HERE_FOR_AI.md`, `_WORKSPACE_ROOT_MARKER.txt`, `CURSOR_CODEX_COORDINATION_PROTOCOL.md`, and `RedDirt/`. |
| Production truth | `RedDirt/` is Kelly SOS production system for this sprint. Not template work. |
| Day 1 | Complete per launch status. |
| Day 2 / RD-1 | Complete for voter-visible public polish. Existing modified files are active Cursor/Steve work. |
| Quality gate | `npm run check` passes when worker spawning is allowed. Lint warnings remain. |
| DB local truth | Docker Postgres on `127.0.0.1:5433` verified 2026-04-26 (`npm run dev:db`, `db:ping`). Builds without DB still log Prisma warnings. |
| Launch lock | **Section 3** doc shipped ([`KELLY_SOS_SECTION_3_LAUNCH_LOCK.md`](./KELLY_SOS_SECTION_3_LAUNCH_LOCK.md)). **Maintenance** handoff in [`KELLY_SOS_NEXT_PASS_SCRIPT.md`](./KELLY_SOS_NEXT_PASS_SCRIPT.md). **Day 6 (2026-04-27):** production Netlify green; local `npm run check` green — **hosted GET + intake smoke + demo** still operator-run ([`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md), [`KELLY_SOS_DEMO_AND_DEPLOY.md`](./KELLY_SOS_DEMO_AND_DEPLOY.md)). P0: preview/apex smoke parity, formal counsel/treasurer when available. |

## Slice 3 Gate

Days 4–7 compression is allowed only after all of these are true or explicitly waived by Steve:

- [x] DB reachable in the target environment. *(local Docker: `127.0.0.1:5433` — 2026-04-26; **staging/prod** still Day 6.)*
- [x] `npm run dev:prepare` succeeds in that environment. *(migrate deploy OK; Windows may log EPERM on `prisma generate` rename — retry or close locking processes.)*
- [x] A safe public form POST to `/api/forms` succeeds.
- [x] The POST creates or links `User`, `Submission`, and `WorkflowIntake`.
- [x] `volunteer` submissions create/update `VolunteerProfile`.
- [x] Operator can see the resulting intake in an admin route. *(data layer + doc path: `/admin/workbench` open work / `WorkflowIntake`; browser login not re-run this session.)*
- [x] Review/export/report path is documented. *(workbench review; CSV export remains backlog per Day 3 report.)*
- [x] `npm run check` passes or exception is logged. *(historical rows in build log; re-run after major pulls.)*

## Cursor Owns Next

Cursor owns Day 3 implementation because it can inspect and edit the active code in context:

- `src/lib/forms/handlers.ts`
- `src/app/api/forms/route.ts`
- existing admin surfaces under `src/app/admin/(board)/**`
- docs touched by the Day 3 report

Cursor should not edit:

- `ajax/`
- `phatlip/`
- `countyWorkbench/`
- `sos-public/`
- root migration/reclassification/template docs unless Steve asks

## Codex Owns Next

Codex owns:

- reviewing Cursor's Day 3 diff;
- rerunning `npm run check`;
- updating or validating packet status;
- creating the Day 4–7 compressed packet only after Day 3 evidence exists;
- keeping the root/Cursor protocol aligned.

## Day 4–7 Compression Tracks

Start these only after the Slice 3 gate.

| Track | Owner | Goal | Must produce |
|-------|-------|------|--------------|
| A — Comms follow-up | Cursor with Codex review | Every intake has a 24h follow-up path, live or manual fallback | `KELLY_SOS_COMMS_READINESS.md` or launch-status section; env name list only |
| B — Compliance/security | Codex audit + Cursor fixes | Paid-for, privacy/terms, donation, admin finance/PII routes reviewed | compliance/security checklist; blockers logged |
| C — Deploy QA | Cursor commands + Codex verification | Netlify env names, build command, smoke steps, DB/runtime caveats | staging/deploy checklist update |
| D — Demo/launch lock | Codex draft + Steve review | 10-minute supporter/admin demo and go/no-go list | demo script + final launch report/backlog |

## Stop Conditions

Cursor must stop and report if any of these occur:

- DB migration would drop or rewrite data.
- A fix requires real secrets or secret values.
- Public form smoke requires real PII.
- Admin export exposes more columns than necessary.
- Any code suggests sharing Kelly data with AJAX, PhatLip, countyWorkbench, or a template.
- Legal/compliance copy needs judgment beyond typos and known approved lines.

## Day 3 Acceptance Summary

The phrase “Day 3 green” means:

```text
fake public form -> /api/forms -> Kelly DB -> Submission + WorkflowIntake -> admin can see it -> operator knows next action
```

Nothing about Days 4–7 should outrun that chain.
