# P0-S1 — RedDirt Event System Audit

Status: COMPLETE — architecture/audit only

## Purpose

Establish the existing RedDirt campaign event system as the canonical seed for the Campaign Volunteer Operating System before adding new operational workflow code.

This slice intentionally changes no public event behavior, no Prisma schema, no task execution behavior, and no production data.

## Findings

### Canonical event identity

`CampaignEvent` in `prisma/schema.prisma` is the canonical campaign event record.

Existing durable identity and public/event fields include:

- `id` — stable CUID primary key
- `slug` — unique public/event slug
- `title`
- `description`
- `eventType`
- `attendanceType`
- `campaignPurposes`
- `locationName`
- `address`
- `startAt`
- `endAt`
- `timezone`
- `ownerUserId` / `ownerUser`
- county relationship/indexing
- `notes`
- `eventWorkflowState`
- `isPublicOnWebsite`
- approval/publication timestamps and staff approval relationship
- Google Calendar synchronization fields/indexing

The model already has relationships to campaign tasks and a broad set of calendar/event operational records. New Campaign Volunteer OS work must extend this record rather than create a second event identity.

### Public website boundary

The public calendar is read through `src/lib/calendar/public-events.ts`.

Public visibility is explicitly gated by `whereLivePublicOnWebsite()`:

- `isPublicOnWebsite = true`
- `isTravelLeg = false`
- `eventWorkflowState = PUBLISHED`
- operationally canceled, tentative, and draft events are excluded

The public reader maps database rows into a deliberately restricted `PublicCampaignEvent` DTO. It also has a snapshot fallback at `data/calendar-command-center/public-campaign-calendar.snapshot.json` for database-unavailable conditions.

**Boundary rule:** Campaign Volunteer OS fields, task worksheets, assignees, internal contacts, candidate advance notes, listening notes, volunteer information, budget information, and operational status must never be added to the public DTO unless a later explicit public-safe slice approves a field.

### Existing event operations rails

RedDirt already contains significant event infrastructure that the new system should reuse rather than duplicate:

- `CampaignTask` model with assignee, creator, status, priority, due/start timing, event relationship, task type, and readiness blocking support.
- Calendar staffing-plan helpers.
- Event coverage-plan helpers.
- Volunteer callout/reminder helpers.
- Calendar readiness helpers.
- Campaign event approval/upload surfaces under `src/app/campaign-events/`.
- Existing campaign-event seed/test scripts, including planning drilldown, communications, email readiness, calendar promotion, finance operations, intake bridge, and calendar sync verification.

Therefore the Campaign Volunteer OS is an extension/deepening of existing CampaignOS rails, not a greenfield task-management application.

## Architecture decisions locked by this audit

### AD-001 — One event identity

There will be one canonical `CampaignEvent` identity. Public event pages, Communications, Event Operations, candidate advance, volunteer assignments, worksheets, closeout, and later Field/GOTV work attach to that identity.

### AD-002 — Public event is a projection, not the operational record

The public `/events` and campaign-calendar surfaces continue to receive only the approved public DTO. Internal operations can become arbitrarily dense without expanding the public data contract.

### AD-003 — Launch Operations is promotion, not duplication

`Launch Operations` will attach/generate an operational project/workstreams/task instances for an existing `CampaignEvent`. It must not create another event row merely to manage operations.

### AD-004 — Create Event uses the canonical event model

A future `Create Event` workflow creates a canonical `CampaignEvent` once. It may remain internal/draft, enter approval, publish publicly, and/or launch operations according to existing workflow gates.

### AD-005 — Duplicate Event clones facts, not history

A future `Duplicate Event` workflow may copy explicitly approved reusable event facts such as venue/location, event type, organization/contact references, and selected descriptive fields.

It must generate a new event identity and must NOT clone:

- task instances or completion history
- assignees
- worksheet answers
- proof/deliverable submissions
- media outreach results
- email/SMS send history
- advertising spend
- attendance/contact results
- listening notes
- photographs/video artifacts
- closeout metrics
- project/readiness history

After duplication, `Launch Operations` generates fresh tasks from the current template versions.

### AD-006 — Reuse CampaignTask

The existing `CampaignTask` model is the starting task primitive. Before schema expansion, the next task-engine slice must audit all `CampaignTask` fields, relations, enums, and existing UI/actions to determine the minimum extensions needed for task packages, worksheets, proof, claim/unclaim, verification, dependencies, and template versioning.

### AD-007 — September 2026 is the beta operating dataset

The already-booked September schedule should become the first real beta dataset after the read/write and migration gates are proven. Do not manufacture a parallel demo calendar when real events can safely exercise the system.

## Target operational layering

All layers attach to `CampaignEvent`:

1. **Public facts** — title, public summary, date/time, public venue/location, county, public event type, public links/CTA.
2. **Project management** — Event PM, readiness, deadlines, blockers, priority, workstream status.
3. **Candidate advance** — arrival, parking, host/on-site contact, speaking expectations, people to meet, local brief, departure constraints.
4. **Communications** — audience counts, email, social, Kelly invite video, media, paid media, graphics, Power of Five, phone/SMS, door hangers.
5. **Event Operations** — staffing, setup, materials, arrival lead, check-in/contact capture, listening capture, photo/video capture, breakdown.
6. **Closeout** — attendance, contacts, volunteer hours, follow-ups, assets, lessons, metrics.

## Required next slices

### P0-S2 — CampaignTask deep audit

Map the existing `CampaignTask` schema, task enums, actions, pages, readiness logic, staffing helpers, and volunteer callout paths. Produce the extension contract for the guided Task Package system. No duplicate task engine.

### P0-S3 — Event Operations extension contract

Define the minimum database additions for:

- operational launch state
- Event PM ownership where existing owner semantics are insufficient
- workstreams
- task templates/template versions
- task packages
- guided steps
- worksheets/answers
- deliverables/proof
- task claim/unclaim
- submitted/verified/closed lifecycle
- dependencies/blockers

No migration until this contract is reviewed against existing models.

### P0-S4 — Create / Duplicate / Launch Operations service contract

Specify transactional behavior, authorization, audit history, idempotency, template-version selection, and public-site isolation for all three event actions.

### P0-S5 — September beta bootstrap plan

Inventory September canonical events, identify missing skeleton details, assign Event PM readiness, and prepare an idempotent operations-launch process. This slice must be preview/dry-run first.

## Non-negotiable guardrails

- Do not create a second calendar/event table for Campaign Volunteer OS.
- Do not expose operational fields through `PublicCampaignEvent` by default.
- Do not clone execution history when duplicating events.
- Do not auto-send email/SMS/social content as a side effect of launching operations.
- Do not auto-spend advertising budgets.
- Do not mutate production September events until migration, authorization, preview, and rollback gates are proven.
- Every implementation slice closes with local validation, commit, push, Netlify deploy/preview where available, smoke test, and build-status update.

## P0-S1 acceptance result

PASS if this document is committed without changing runtime behavior.

P0-S1 is an audit-only architecture checkpoint. The next implementation work begins with P0-S2, not with speculative new schema.