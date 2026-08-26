# P0-S4 — Event Project Manager Command Center

Status: BUILT — CI gate pending

## Purpose

Turn the P0-S3 generated event tasks into an event-level operating cockpit for campaign leadership and Event Project Managers.

The command center answers four questions without reconstructing work from texts or memory:

1. Is this event actually ready?
2. What is missing, late, blocked or unclaimed?
3. Who owns each piece of work?
4. What is waiting for PM review?

## Canonical architecture

P0-S4 does not create a new project/event/task table.

- `CampaignEvent` remains the event identity.
- `CampaignEvent.ownerUserId` is used as the beta Event Project Manager assignment.
- `CampaignTask` remains operational task truth.
- `opsMetadataJson.taskPackage` remains guided-work truth.
- `opsMetadataJson.launchOperations` identifies the generated workstream and blueprint key.

No Prisma migration is required.

## New portfolio command center

Route:

`/admin/campaign-ops/events`

Shows every upcoming event that has Launch Operations tasks, including:

- Event Project Manager
- overall verified readiness percentage
- missing-information count
- unclaimed work count
- overdue work count
- dependency/status blocked count
- submitted-for-review count

Top-level exception cards aggregate these counts across the entire active event portfolio.

## Event Project Manager cockpit

Route:

`/admin/campaign-ops/events/[eventId]`

### Event Project Manager

Campaign leadership can assign the event owner/PM from existing campaign users.

### Information Gate

The beta gate checks whether the canonical event has:

- title
- valid start/end time
- county
- city/town
- venue/location name
- street address
- Event Project Manager
- operational purpose (`campaignIntent` or `internalSummary`)

The gate does not invent missing information. The PM is sent back to the canonical event record to correct it.

### Workstream readiness

Separate progress is calculated for:

- Project Management
- Communications
- Event Operations

Readiness counts only canonical `CampaignTask.status = DONE`. A Task Package that is merely submitted does not improve the readiness score.

### Exception flags

Every operational task may surface:

- `OVERDUE`
- `UNCLAIMED`
- `REVIEW`
- `READINESS`
- dependency blockers

### Operational task board

The event cockpit groups all generated work by workstream and shows:

- task title
- due date
- target role
- assigned volunteer
- Task Package state
- canonical task state
- dependency state
- exception flags
- direct guided-work link

## Single-task guided work screen

Route:

`/admin/campaign-ops/task-packages/[taskId]`

This is the sit-with-the-instructions-open experience the volunteer system is designed around.

It presents:

- assignment objective
- numbered step-by-step instructions
- explicit “Done means” acceptance criteria
- task claim action
- worksheet entry
- proof/deliverable entry
- submit-for-PM-review action
- PM Verify & Close / Request Changes review controls

The screen links directly back to the parent Event PM cockpit.

## Readiness rules

Overall readiness = verified operational tasks / total operational tasks.

Workstream readiness uses the same rule within the workstream.

The PM command center separately reports:

- tasks marked `blocksReadiness` that are not `DONE`
- unfinished runtime dependencies
- overdue tasks
- unassigned open Task Packages
- packages in `SUBMITTED`
- missing information-gate fields

These are intentionally separate. A 70% completion number should not hide an urgent missing address or an unfilled candidate-handler assignment.

## Safety boundaries

P0-S4 remains internal and administrative. It does not:

- expose operational data publicly
- send campaign communications
- publish social posts
- spend advertising dollars
- mark submitted volunteer work complete without PM verification
- fabricate missing event details

## Integration note discovered during P0-S4

The inherited P0-S3 server action incorrectly assumed `requireAdminAction()` returned an actor object. P0-S4 corrects the action to use it only as an authorization gate and launches without a `createdByUserId` until the auth layer exposes a durable campaign user identity.

A separate inherited P0-S3 enum spelling issue (`CANCELED` vs canonical `CampaignEventStatus.CANCELLED`) was identified during review and must be green in CI before the P0-S3/P0-S4 chain is merged to main.

## Next slice

P0-S5 should move from admin-managed work to the first true volunteer experience:

- volunteer “My Work” dashboard
- available claimable tasks
- authenticated volunteer identity binding
- eligibility/qualification hooks
- mobile-first guided task screen
- task completion history
- simple blocked/help escalation

That will let real September volunteers receive work directly from the Event PM system rather than requiring an administrator to operate every task for them.
