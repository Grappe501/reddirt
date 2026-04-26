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
| DB local truth | Local Postgres on `127.0.0.1:5433` is currently not reachable in this Codex session; build falls back with Prisma warnings. |
| Day 3 code | `WorkflowIntake` is created for public `/api/forms` successes (see `handlers.ts`). **Staging smoke** (fake POST → admin visibility) is still the proof gate. `/admin/volunteers/intake` remains **uploaded** sheet intake, not the public JSON form queue. **Day 4** runbook: `KELLY_SOS_COMMS_READINESS.md`. |

## Slice 3 Gate

Days 4–7 compression is allowed only after all of these are true or explicitly waived by Steve:

- [ ] DB reachable in the target environment.
- [ ] `npm run dev:prepare` succeeds in that environment.
- [ ] A safe public form POST to `/api/forms` succeeds.
- [ ] The POST creates or links `User`, `Submission`, and `WorkflowIntake`.
- [ ] `volunteer` submissions create/update `VolunteerProfile`.
- [ ] Operator can see the resulting intake in an admin route.
- [ ] Review/export/report path is documented.
- [ ] `npm run check` passes or exception is logged.

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
