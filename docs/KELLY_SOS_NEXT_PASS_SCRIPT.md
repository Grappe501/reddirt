# Kelly SOS — next pass script for Cursor

**Current slice:** **Day 3 / Slice 3 — intake, DB, admin workflow, automation**  
**Active repo:** `H:\SOSWebsite\RedDirt`  
**Updated:** 2026-04-26 by Codex after repo inspection.

Paste this block into Cursor.

```text
ACTIVE PROJECT:
Kelly Grappe for Arkansas Secretary of State — RedDirt repo.
This is the Kelly SOS production system: public site + admin + database + workflows.

ACTIVE SLICE:
Day 3 / Slice 3 from docs/KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md.

HARD RULES:
- No deletes.
- No repo moves.
- No template extraction.
- No AJAX / PhatLip / countyWorkbench work.
- Kelly-only contacts, volunteers, finance, strategy, DB, env.
- No unsourced opponent claims.
- No secrets in chat, docs, commits, screenshots, logs, or code.
- Do not revert Codex/Steve changes unless explicitly instructed.

READ FIRST:
- docs/KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md
- docs/KELLY_SOS_DAY_3_TO_7_EXECUTION_BOARD.md
- docs/KELLY_SOS_CURSOR_CHATGPT_PROTOCOL.md
- docs/KELLY_SOS_ROUTE_MAP.md
- docs/KELLY_SOS_FIREWALL_RULES.md
- docs/KELLY_SOS_BUILD_LOG.md
- docs/KELLY_SOS_BLOCKER_LOG.md

CURRENT FACTS FROM CODEX:
- Root is H:\SOSWebsite; active repo is H:\SOSWebsite\RedDirt.
- RD-1 / Day 2 public polish is marked done.
- npm run check passes when Next worker spawning is allowed.
- Build still logs DB-unavailable fallbacks because local Postgres is not running at 127.0.0.1:5433.
- /api/forms persists Submission and VolunteerProfile/Commitment, but does not appear to create WorkflowIntake.
- /admin/volunteers/intake is for uploaded signup sheets, not public website form submissions.
- Existing open-work/admin surfaces can read WorkflowIntake when rows exist.

OBJECTIVE:
Make the Day 3 operational chain real:
public form submission -> Kelly DB -> visible admin/operator queue -> documented review/export path.

TASKS:
1) DB baseline
- From H:\SOSWebsite\RedDirt, run npm run db:ping.
- If DB is down and Docker is available, run npm run dev:db, then npm run dev:prepare.
- Optional only if safe/expected: npm run db:seed.
- Do not paste env values.
- Record results in docs/KELLY_SOS_BUILD_LOG.md.

2) Trace and patch intake bridge
- Inspect src/app/api/forms/route.ts and src/lib/forms/handlers.ts.
- Add the smallest safe additive bridge so successful public form submissions create or link a WorkflowIntake row.
- Preserve existing Submission, User, VolunteerProfile, Commitment behavior.
- Do not add destructive migrations unless absolutely necessary; WorkflowIntake already exists in prisma/schema.prisma.
- Suggested shape: after Submission create, create WorkflowIntake with submissionId, source/formType, title, status PENDING, priority based on formType, metadata with sanitized non-secret routing hints.
- Avoid storing extra PII beyond what Submission/User already stores.

3) Admin visibility
- Confirm the created WorkflowIntake appears in an existing admin surface:
  - /admin/workbench unified open work, or
  - /admin/inbox / review queue if already wired.
- If no clear public-form queue exists, add the smallest safe admin page or documented operator path.
- Do not refactor broad admin navigation unless needed.

4) Export / report path
- Document how an operator can review and export/report public form submissions today.
- If CSV export already exists, point to it.
- If not, document the manual path and add an explicit post-Day-3 backlog item instead of building a big export system.

5) Smoke proof
- With DB running, POST one safe test payload to /api/forms.
- Confirm records exist in User + Submission + WorkflowIntake, and VolunteerProfile when formType is volunteer.
- Use fake test contact data only.
- Do not commit real PII.

6) Docs update
- Create docs/KELLY_SOS_DAY_3_COMPLETION_REPORT.md.
- Update docs/KELLY_SOS_LAUNCH_STATUS.md Day 3 notes.
- Update docs/KELLY_SOS_BUILD_LOG.md.
- Update docs/KELLY_SOS_BLOCKER_LOG.md if DB/staging/admin proof remains blocked.
- Update docs/RED_DIRT_PACKET_QUEUE.md if RD-2/RD-4 status changes materially.

QUALITY GATE:
- Minimum: npm run check.
- If DB is down, still run npm run check and clearly note DB-unavailable build logs.
- If code touches only docs after a failed DB step, report the DB blocker and do not widen scope.

COMPLETION REPORT:
- Active slice
- Files changed
- Commands run + exit codes
- Smoke test payload type used (no PII)
- Whether WorkflowIntake is created
- Operator path to review/export
- Remaining blockers
- Whether Days 4–7 compression is safe to start
```

After Cursor finishes this pass, Codex should review the diff, rerun the quality gate, and decide whether to start the Days 4–7 compression board.
