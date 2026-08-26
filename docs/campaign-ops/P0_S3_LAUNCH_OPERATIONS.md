# P0-S3 — Launch Operations

Status: BUILT — CI gate pending

## Purpose

Turn an existing canonical `CampaignEvent` into a managed volunteer project without creating a second event universe.

One explicit **Launch Operations** action generates the beta operating package for that event using the canonical `CampaignTask` + P0-S2 Task Package engine.

## Architecture

`CampaignEvent` remains canonical. Launching operations does not copy the event.

Each generated task:

- links to the existing `CampaignEvent.id`
- carries `countyId` when the event has one
- uses existing `CampaignTask` status/priority/type/readiness fields
- initializes a guided `opsMetadataJson.taskPackage`
- records launch provenance under `opsMetadataJson.launchOperations`
- uses `sourceTemplateTaskKey = campaign-ops-v1:<blueprint-key>` for idempotency
- is visible to operators
- is generated from an event-template source

No Prisma migration is required for P0-S3.

## Idempotency

Launch may be run more than once. Existing v1 blueprint tasks are never duplicated. If a launch was interrupted or a future deployment adds missing v1 tasks, running **Fill missing tasks** creates only absent blueprint tasks.

Task execution history is never cloned.

## Safety boundaries

Launch Operations does **not**:

- publish/unpublish the public event
- change public event DTOs
- send email or SMS
- post social content
- spend advertising dollars
- order printing automatically
- contact media automatically
- bypass existing campaign approval/send rails

It creates assignable work and instructions only.

Travel legs and canceled events cannot launch first-class event operations packages.

## Beta workstreams

### Project Management

1. Complete and verify master event record — T-21
2. Run 72-hour event verification — T-3

### Communications

1. Prepare event graphics package — T-18
2. Create Facebook event — T-16
3. Prepare event announcement email — T-14
4. Produce Kelly direct-to-camera invitation — T-10
5. Personally invite local media — T-9
6. Prepare one-week event invitation email — T-7
7. Run local Power of Five invitation push — T-6
8. Order and distribute 200 event door hangers — T-5
9. Prepare day-before radius text — T-1
10. Complete attendee communications follow-up — T+1

### Event Operations

1. Prepare Kelly event brief — T-3
2. Fill event volunteer roles — T-5
3. Prepare event materials kit — T-2
4. Set up campaign presence — event day
5. Manage Kelly arrival and handoff — event day
6. Capture what the community tells Kelly — event day
7. Capture event contacts and attendance — event day
8. Capture required event photo and video — event day
9. Break down and account for campaign materials — event day
10. Close out event operations — T+1

Total beta package: **22 guided Task Packages per first-class event**.

## Dependencies

Runtime dependencies are resolved to concrete `CampaignTask.id` values during launch. Examples:

- graphics depends on master event record
- Facebook event depends on master record + graphics
- day-before text depends on 72-hour verification
- setup depends on materials + staffing
- Kelly arrival depends on 72-hour verification + candidate brief + staffing
- closeout depends on listening, contact capture, content capture and breakdown
- attendee follow-up depends on event closeout

P0-S2 dependency enforcement prevents blocked packages from being claimed/submitted before required predecessor tasks are `DONE`.

## New operator surface

`/admin/campaign-ops/launch-operations`

The page lists upcoming non-travel, non-canceled campaign events and shows:

- event/time/place
- generated operational task count
- expected task count
- launch status
- Launch Operations / Fill Missing Tasks action
- full beta blueprint grouped by workstream

## Beta principle

The package is intentionally dense. September's real event schedule should be loaded through this engine and actual volunteer usage should determine which procedures deserve deeper specialization, which can be combined, and which are rarely used.

## Next slice

P0-S4 should make the generated work usable at event level:

- Event Project Manager command center
- readiness by workstream
- unclaimed / overdue / blocked / submitted-for-review counts
- event-specific task list
- assignment/claim visibility
- missing-information gate
- direct links from an event into its operations project

After that, the September schedule can be operated from the system rather than merely generated into it.
