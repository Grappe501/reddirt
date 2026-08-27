# P0-S4 — Event Project Manager Command Center

Status: BUILT — CI gate pending

## Purpose

Give the campaign manager and each Event Project Manager one operational cockpit for every event launched through P0-S3.

P0-S4 does not create another project/task system. It aggregates the canonical `CampaignEvent` and its P0-S3 `CampaignTask` / Task Package graph into a management view that answers:

- Is the event ready?
- What information is missing?
- Who is the Event PM?
- What is unclaimed?
- What is overdue?
- What is blocked by dependencies?
- What is waiting for PM review?
- Which readiness-blocking tasks are still open?
- Where does the PM go to work the exact task?

## Routes

### Portfolio

`/admin/campaign-ops/events`

Campaign-level view of all upcoming events with launched operations.

Shows:

- Event PM
- overall verified-task readiness percentage
- missing information count
- unclaimed task count
- overdue task count
- blocked task count
- packages waiting for review

The top summary aggregates danger across all launched upcoming events.

### Event cockpit

`/admin/campaign-ops/events/[id]`

Shows:

- event identity, time and place
- overall readiness
- missing information
- unclaimed work
- overdue work
- dependency/status blockers
- submitted-for-review work
- Event PM assignment
- Information Gate
- readiness by Project Management / Communications / Event Operations
- Needs Attention Now queue
- complete operational task board
- direct link to each guided Task Package

### Guided task page

`/admin/campaign-ops/task-packages/[id]`

This is the work surface a volunteer or staff member can keep open in front of them while doing the job.

It provides:

1. assignment objective
2. exact step-by-step instructions
3. explicit acceptance criteria / “Done means”
4. claim flow
5. worksheet
6. proof/deliverables
7. submit-for-review action
8. PM verification or changes-requested action
9. verified/closed state

The beta admin surface still lets an authenticated admin choose the acting campaign User. A later volunteer-auth slice should bind the actor directly to the logged-in volunteer.

## Information Gate

P0-S4 calculates a compact beta information gate from canonical event fields:

- title
- valid start/end time
- county
- city/town
- venue/location name
- street address
- Event Project Manager
- campaign purpose (`campaignIntent` or `internalSummary`)

The gate deliberately links back to the canonical event editor instead of creating a second copy of event facts.

This is a beta gate. Later event-advance slices should deepen it with host/on-site contact, parking, candidate arrival/departure, speaking expectations, accessibility, weather contingency and other structured fields after usage shows the best permanent schema.

## Event PM ownership

For beta, `CampaignEvent.ownerUserId` is the Event Project Manager field.

P0-S4 allows assigning/changing that owner from the event cockpit.

This avoids a premature schema migration while maintaining one clear owner per event. A future slice can separate Event PM from other event ownership semantics if beta proves that distinction necessary.

## Readiness rules

Readiness is based on verified canonical work, not volunteer self-report.

- `CampaignTask.status = DONE` counts as completed.
- Task Package `SUBMITTED` does **not** count as done.
- PM verification from P0-S2 is what moves the canonical task to `DONE`.
- `blocksReadiness = true` tasks are separately counted as readiness blockers.
- unfinished dependencies are surfaced as blocked work.

This keeps the command center from turning green before PM review.

## Danger signals

An event can surface these independent signals:

- **MISSING INFO** — canonical event information gate item incomplete
- **UNCLAIMED** — open package has no assigned user
- **OVERDUE** — due date has passed and canonical task is not DONE/CANCELLED
- **BLOCKED** — package dependencies are unfinished or canonical task status is BLOCKED
- **REVIEW** — volunteer submitted work and PM must verify/request changes
- **READINESS** — task is a readiness blocker and remains unfinished

The event detail page pulls the most actionable items into **Needs Attention Now** before the full task board.

## Workstream progress

Three P0-S3 workstreams are summarized independently:

- Project Management
- Communications
- Event Operations

Each displays:

- verified / total
- percentage verified
- open readiness blockers

This gives the PM both a single event score and a way to see which division is behind.

## Launcher integration

P0-S4 adds navigation from `/admin/campaign-ops/launch-operations` into the Event PM Command Center.

Once an event has operations launched, its event title links to the cockpit. Fully generated events show **Open cockpit** rather than a dead-end “Launched” label.

## Data and safety boundaries

P0-S4 adds no Prisma migration.

It does not:

- alter public event DTOs
- publish/unpublish events
- send email/SMS
- post social media
- spend advertising dollars
- trigger media contact
- change P0-S3 blueprint generation

The only new write in P0-S4 is explicit Event PM assignment through the existing `CampaignEvent.ownerUserId` field plus the already-existing P0-S2 Task Package actions used on the single-task screen.

## Acceptance criteria

P0-S4 passes when:

- portfolio loads all upcoming launched first-class events
- event cockpit calculates task and information signals without duplicating data
- Event PM can be assigned
- PM can identify danger without scanning the full task list
- every operational row links to a guided single-task work page
- volunteer work can be claimed, documented, submitted and PM-verified through the guided page
- only PM verification improves task completion/readiness
- launcher links launched events into the cockpit
- no public event or database schema regression is introduced

## Next build

Recommended P0-S5: **Volunteer Assignment + Available Jobs Board**.

That slice should take the event/task system now built and make it self-service for volunteers:

- available jobs by event/date/location/remote status
- “I’ll do it” claim flow
- skill/qualification filtering where available
- My Work dashboard
- direct task-package launch
- unclaim/reassignment controls
- volunteer-facing identity binding instead of admin actor selectors
- PM view of staffing gaps and claim velocity

After P0-S5, the system will have the complete core loop: event -> operations package -> management cockpit -> volunteer claims task -> guided execution -> worksheet/proof -> PM verification.
