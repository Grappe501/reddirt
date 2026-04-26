# Kelly SOS — Day 3 completion report

**Date:** 2026-04-26  
**Theme:** Intake, DB, admin workflow, automation

## Objective

Make the operational intake chain real:

```text
public form -> /api/forms -> Kelly DB -> Submission + WorkflowIntake -> admin/operator visibility
```

## Status

**Partially complete.** The code bridge from public form submissions to `WorkflowIntake` is implemented and typechecked. Full DB smoke remains pending because the local Docker/Postgres check was not completed in this session.

## What changed

- `src/lib/forms/handlers.ts`
  - Public form persistence now creates a linked `WorkflowIntake` row after each successful `Submission`.
  - Existing `User`, `Submission`, `VolunteerProfile`, and `Commitment` behavior is preserved.
  - `PersistResult` now includes `workflowIntakeId`.
  - Intake metadata stores routing hints such as form type, county, ZIP, interests, leadership interest, host-gathering type, and AI classification summary when available.
  - Queue titles avoid extra PII and use form type plus county or ZIP when available.

- `src/app/(site)/priorities/page.tsx`
  - Added a public transparency vision section: a searchable public-records / FOIA request library starting with the Secretary of State's own office, with broader cross-agency use framed as future leadership-by-example rather than unilateral authority.

## Operator path

Once DB is reachable and a public form is submitted:

1. Public form posts to `/api/forms`.
2. `persistFormSubmission` creates:
   - `User`
   - `Submission`
   - `WorkflowIntake`
   - `VolunteerProfile` for `formType: "volunteer"`
3. Existing workbench open-work surfaces can read `WorkflowIntake`.
4. A staffer can open `/admin/workbench` and use the unified open work section to find the intake.
5. Workflow intake rows link into the existing comms-plan creation path:
   - `/admin/workbench/comms/plans/new?intakeId=...`

## Export / reporting path

No broad CSV export was added in this pass. For Day 3, the safe operator path is:

- review in admin workbench;
- use linked `Submission` / `WorkflowIntake` records for follow-up;
- add a post-Day-3 backlog item for minimum-necessary CSV export if staff need a spreadsheet handoff.

## Commands

| Command | Result |
|---------|--------|
| `npm run typecheck` | Exit 0 |
| `npm run db:ping` | Exit 1 in sandbox: Docker config access denied / compose flag issue |
| `npm run db:ping` with elevated Docker access | Not completed in this session |
| `npm run check` | Exit 1: lint + typecheck completed, build blocked by sandbox `spawn EPERM` |
| `npm run build` with elevated worker access | Exit 1: compiled successfully, then failed reading `.next/build-manifest.json`; likely stale/interrupted `.next` artifact from prior timed-out build; not cleaned because no-delete rule is active |

## Remaining blockers

1. **DB smoke pending:** run Docker/Postgres, `npm run dev:prepare`, then submit one fake public form.
2. **Admin proof pending:** confirm the new `WorkflowIntake` appears on `/admin/workbench`.
3. **Export decision pending:** decide whether Day 4–7 needs a CSV export or a manual admin workflow is enough for launch.

## Required smoke test

Use fake data only:

```bash
npm run dev:db
npm run dev:prepare
npm run dev
```

Then submit a safe test payload through the site or POST `/api/forms`.

Confirm in DB:

- one `User`
- one `Submission`
- one `WorkflowIntake` linked by `submissionId`
- one `VolunteerProfile` if testing `formType: "volunteer"`

## Compression call

**Days 4–7 compression is not safe yet** until DB smoke proves the full Day 3 chain. The implementation is ready for proof; the environment verification is the gate.
