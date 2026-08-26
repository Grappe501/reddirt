# P0-S2 — CampaignTask Deep Audit + Guided Task Package Build

Status: BUILT ON BRANCH — validation/PR gate pending

## Executive result

RedDirt already has a mature `CampaignTask` primitive. This slice does **not** create a competing task table and does **not** require a Prisma migration.

The guided Task Package system is implemented as a typed, versioned `taskPackage` object nested inside the existing `CampaignTask.opsMetadataJson` field. This preserves all existing task relations and workflow behavior while giving campaign operations a usable lifecycle for claimable work, worksheets, proof, submission, PM review, dependencies, and verification.

## Existing CampaignTask audit

The current schema already provides the durable operational spine required for task packages:

- stable `id`
- `title` and `description`
- `taskType`
- `status`: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `CANCELLED`
- priority
- `dueAt` and `startAt`
- `assignedUserId` / assignee relation
- `assignedRole`
- `blocksReadiness`
- `sourceTemplateTaskKey` for workflow-template idempotency
- county relation
- event relation
- optional Social Workbench relation
- workflow-run relation
- parent/subtask hierarchy
- creator relation
- `completionNotes` / `completedAt`
- time-matrix classification
- operations source/signal fields
- leader/lane fields
- operations visibility
- `opsMetadataJson`
- Campaign Project relation
- indexes for event/template, due/status, social/status, ops source/status, leader/status, visibility/status, and project/status

The schema also already has `WorkflowTemplateTask` support with required/readiness flags, minimum event stage, a task-key dependency concept, and `configJson`.

## Existing UI/action audit

`/admin/tasks` is a live administrative task surface. It already:

- creates `CampaignTask` rows
- optionally links tasks to `CampaignEvent`
- lists workflow-generated and manually-created tasks together
- edits operational `CampaignTaskStatus`
- records completion notes when manually marking a task `DONE`
- provides task-to-Comms plan linkage

The existing server actions are protected by `requireAdminAction()`.

Event-planning and calendar code already contains staffing-plan, coverage-plan, readiness, volunteer-callout/reminder, workflow-template, and planning-drilldown rails. Task Packages therefore extend the existing CampaignOS rather than replacing any of these systems.

## Architecture decision

### No migration for P0-S2

`CampaignTask.opsMetadataJson` is explicitly an operations extension field. It is sufficient for the first production-grade Task Package contract.

The package metadata is nested under one namespaced key:

```ts
opsMetadataJson.taskPackage
```

Other existing metadata keys are preserved on every write.

### Task Package lifecycle

The package-specific lifecycle is:

1. `OPEN`
2. `CLAIMED`
3. `IN_PROGRESS`
4. `SUBMITTED`
5. `VERIFIED`

A reviewer may move a submitted package to `CHANGES_REQUESTED`, after which it can be reclaimed/worked and resubmitted.

The underlying `CampaignTask.status` remains operational truth:

- starting work moves a `TODO` task to `IN_PROGRESS`
- submission stays `IN_PROGRESS`
- **verification is the only Task Package action that sets `CampaignTask.status = DONE`**
- requesting changes resets the task to `IN_PROGRESS` and clears completion state

This prevents unreviewed volunteer submissions from falsely improving event readiness.

## Package contract

Version 1 stores:

- package state
- objective
- step-by-step instructions
- acceptance criteria
- worksheet key/value answers
- proof items with label, URL, note, timestamp, and actor
- dependency `CampaignTask` ids
- claimant and claim timestamp
- submitter, timestamp, and submission note
- verifier, timestamp, and verification note
- change-request reviewer, timestamp, and required-change note

The parser is defensive. Malformed or unrelated JSON metadata does not crash the task system and unrelated keys are preserved.

## Dependency behavior

Task Package dependencies use canonical `CampaignTask.id` values.

Before a package can be claimed or submitted, every dependency must resolve to an existing task whose operational status is `DONE`. Missing dependencies are treated as blockers, not silently ignored.

This is intentionally separate from `WorkflowTemplateTask.dependsOnTaskKey`, which is template-generation intent. Runtime package dependencies refer to concrete task instances.

## Claim behavior

The P0-S2 admin operator console is an internal beta surface. An authenticated admin chooses the campaign `User` acting on the task. Claiming:

- records claimant + timestamp in package metadata
- assigns the `CampaignTask` to that user only when it was previously unassigned
- moves `TODO` to `IN_PROGRESS`
- rejects claims blocked by unfinished dependencies
- rejects inappropriate lifecycle transitions

A later volunteer portal should bind actor identity directly to the signed-in user rather than exposing an admin chooser.

## Worksheet + proof behavior

Worksheet answers are stored as typed scalar key/value entries inside the package metadata. P0-S2 intentionally uses an open key/value worksheet instead of adding a new form-schema table before real beta usage establishes what deserves normalization.

Proof items support:

- label
- optional URL
- optional note
- actor
- timestamp

The contract can later be extended to owned-media/file identifiers without changing the package lifecycle.

## Submission + verification behavior

Submission means **ready for PM review**, not complete.

Verification:

- requires package state `SUBMITTED`
- records reviewer and verification note
- marks package `VERIFIED`
- sets the canonical task `DONE`
- writes `completedAt`
- preserves or supplies completion notes

Request Changes:

- requires package state `SUBMITTED`
- records required changes and reviewer
- returns package to `CHANGES_REQUESTED`
- sets canonical task to `IN_PROGRESS`
- clears completion timestamp/notes

## Operator console built

New protected route:

`/admin/campaign-ops/task-packages`

Capabilities:

- select an existing non-cancelled `CampaignTask`
- turn it into a Task Package without duplicating the task
- define objective, steps, and acceptance criteria
- view active packages and linked event context
- claim a package
- save worksheet answers
- attach proof links/notes
- submit for PM review
- verify and close
- request changes
- display readiness-blocking status
- preserve existing `/admin/tasks` as the broader task list

## Files added

- `src/lib/campaign-ops/task-packages.ts`
- `src/lib/campaign-ops/task-package-service.ts`
- `src/app/admin/(board)/campaign-ops/task-packages/actions.ts`
- `src/app/admin/(board)/campaign-ops/task-packages/page.tsx`
- this audit/build record

## Public-site safety

This slice does not touch:

- `PublicCampaignEvent`
- public `/events` DTOs
- public campaign calendar filters
- `CampaignEvent` public visibility rules
- public event snapshot fallback

No Task Package field is exposed to the public site.

## Schema safety

This slice does not edit `prisma/schema.prisma` and creates no migration.

Production data is only mutated when an authenticated administrator intentionally uses the new Task Package admin actions.

## Remaining work after P0-S2

The next Event Operations slice should build **Launch Operations** using current `WorkflowTemplate` / `WorkflowTemplateTask` + `CampaignTask` rather than creating a second project/task framework.

Recommended next implementation order:

1. define the Event Operations template/workstream package for candidate advance, communications, staffing, day-of operations, listening capture, media capture, and closeout
2. add an idempotent `Launch Operations` service on a canonical `CampaignEvent`
3. add Create/Duplicate event actions with the P0-S1 copy-history guardrails
4. dry-run September 2026 events against the launch service
5. add the volunteer-facing claim/work surface once actor identity is bound to authenticated volunteer users
6. normalize worksheet/proof tables only if beta usage proves JSON storage is insufficient

## P0-S2 acceptance criteria

PASS when:

- no duplicate task engine is introduced
- no public event contract changes
- no Prisma migration is required
- package metadata is typed/versioned and preserves other ops metadata
- dependency blocking works
- claim/work/proof/submission/review transitions exist
- submission does not mark the task done
- verification does mark the canonical task done
- Request Changes reopens the canonical task
- admin actions use the existing admin gate
- a usable internal operator page exists
- branch validation/typecheck is green before merge
