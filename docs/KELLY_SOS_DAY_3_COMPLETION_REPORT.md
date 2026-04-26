# Kelly SOS — Day 3 completion report

**Date:** 2026-04-26  
**Theme:** Intake, DB, admin workflow, automation

## Objective

Make the operational intake chain real:

```text
public form -> /api/forms -> Kelly DB -> Submission + WorkflowIntake -> admin/operator visibility
```

## Status

**Complete for local E2E (2026-04-26).** Code path is implemented and **verified** with Docker Postgres: `join_movement` and `volunteer` POSTs → `User`, `Submission`, `WorkflowIntake` (PENDING), `VolunteerProfile` for volunteer. Evidence: [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md). **Staging URL** smoke is deferred to Day 6 ([`KELLY_SOS_DEMO_AND_DEPLOY.md`](./KELLY_SOS_DEMO_AND_DEPLOY.md)). **Workbench browser login** was not repeated in the proof session; open-work rows exist at the data layer.

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
| `npm run dev:db` | Exit 0 — Postgres container running |
| `npx prisma migrate deploy` | Exit 0 — no pending migrations (`prisma generate` may EPERM-rename query engine on Windows) |
| `npm run db:ping` | Exit 0 |
| `npm run dev` + `POST /api/forms` | See [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md) — `ok: true` with IDs |
| `npm run typecheck` | Exit 0 (historical) |
| `npm run check` | Run after pulls; prior sessions hit sandbox `spawn EPERM` on `next build` |

## Remaining blockers

1. **Staging/production smoke:** repeat [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md) against **staging URL** (Day 6).
2. **Admin UI pass (optional):** log into `/admin/workbench` once with `ADMIN_SECRET` and visually confirm new intakes in open work (data already present locally).
3. **Export decision:** CSV export remains backlog unless ops require a spreadsheet before launch (workbench review is the documented path).

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

**Local Day 3 chain is proven.** Days 4–7 doc work was already advanced in calendar time; **staging deploy + smoke** remains the integration gate before launch lock.
