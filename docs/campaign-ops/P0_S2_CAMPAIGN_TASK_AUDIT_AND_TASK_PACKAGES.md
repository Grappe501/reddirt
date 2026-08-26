# P0-S2 — CampaignTask Deep Audit + Guided Task Package Build

Status: BUILT ON CLEAN BRANCH — PR/CI gate pending

## Executive result

RedDirt already has a mature `CampaignTask` primitive. This slice does **not** create a competing task table and does **not** require a Prisma migration.

The guided Task Package system is implemented as a typed, versioned `taskPackage` object nested inside the existing `CampaignTask.opsMetadataJson` field. This preserves all existing task relations and workflow behavior while adding a usable lifecycle for claimable work, worksheets, proof, submission, PM review, dependencies, and verification.

## Existing CampaignTask audit

The current schema already provides the durable operational spine required for Task Packages:

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

## Architecture decision — no migration for P0-S2

`CampaignTask.opsMetadataJson` is already an operations extension field. It is sufficient for the first real Task Package contract.

The package metadata is namespaced under:

```ts
opsMetadataJson.taskPackage
```

Every write preserves unrelated existing metadata keys.

## Task Package lifecycle

Package-specific lifecycle:

1. `OPEN`
2. `CLAIMED`
3. `IN_PROGRESS`
4. `SUBMITTED`
5. `VERIFIED`

A reviewer may move a submitted package to `CHANGES_REQUESTED`, after which it can be worked and resubmitted.

The underlying `CampaignTask.status` remains operational truth:

- starting work moves a `TODO` task to `IN_PROGRESS`
- submission remains `IN_PROGRESS`
- **verification is the Task Package action that sets `CampaignTask.status = DONE`**
- requesting changes returns the canonical task to `IN_PROGRESS` and clears completion state

This prevents an unreviewed submission from falsely improving event readiness.

## Package contract

Version 1 stores:

- package state
- objective
- step-by-step instructions
- acceptance criteria
- worksheet scalar key/value answers
- proof items with label, URL, note, timestamp, and actor
- runtime dependency `CampaignTask` ids
- claimant and claim timestamp
- submitter, timestamp, and submission note
- verifier, timestamp, and verification note
- change-request reviewer, timestamp, and required-change note

The parser is defensive. Malformed or unrelated JSON metadata does not crash the task reader, and unrelated keys are preserved.

## Dependency behavior

Task Package runtime dependencies use canonical `CampaignTask.id` values.

Before claim or submission, every dependency must resolve to a concrete task whose operational status is `DONE`. A missing dependency is a blocker rather than something silently ignored.

This is intentionally distinct from `WorkflowTemplateTask.dependsOnTaskKey`, which expresses dependency intent at template-generation time. The Task Package dependency list refers to instantiated work.

## Claim behavior

The P0-S2 operator console is an internal administrative beta surface. An authenticated administrator selects the campaign `User` acting on the task.

Claiming:

- records claimant + timestamp
- assigns the canonical `CampaignTask` only when it was previously unassigned
- moves `TODO` to `IN_PROGRESS`
- rejects unfinished dependencies
- rejects invalid lifecycle transitions

A later volunteer-facing surface should bind the actor directly to the authenticated volunteer rather than exposing an administrator user selector.

## Worksheet and proof behavior

Worksheet answers use open typed scalar key/value entries during beta. This avoids prematurely normalizing a form schema before real campaign usage demonstrates what deserves first-class tables.

Proof items support:

- label
- optional URL
- optional note
- actor
- timestamp

The contract can later add owned-media/file identifiers without changing the lifecycle.

## Submission and verification behavior

Submission means **ready for PM review**, not complete.

Verification:

- requires `SUBMITTED`
- records reviewer + verification note
- marks package `VERIFIED`
- marks canonical `CampaignTask` `DONE`
- writes `completedAt`
- preserves or supplies completion notes

Request Changes:

- requires `SUBMITTED`
- records required changes + reviewer
- returns package to `CHANGES_REQUESTED`
- restores canonical task to `IN_PROGRESS`
- clears completion timestamp and notes

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
- preserve `/admin/tasks` as the broader canonical task list

## Concurrency / duplicate-engine finding

During the build, the earlier working branch acquired a separate event-planning-local `EventTaskPackage[]` implementation under `EventPlanningData`.

That implementation creates a second task-package identity disconnected from canonical `CampaignTask` rows. The clean P0-S2 branch intentionally excludes it.

**Guardrail:** do not merge the event-planning-local Task Package experiment alongside this implementation unless a future explicit migration/adaptor design makes `CampaignTask` the durable identity. RedDirt should not have two independently completable task engines for the same event work.

## Files added in the clean implementation

- `src/lib/campaign-ops/task-packages.ts`
- `src/lib/campaign-ops/task-package-service.ts`
- `src/app/admin/(board)/campaign-ops/task-packages/actions.ts`
- `src/app/admin/(board)/campaign-ops/task-packages/page.tsx`
- `docs/campaign-ops/P0_S2_CAMPAIGN_TASK_AUDIT_AND_TASK_PACKAGES.md`

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

Production data changes only when an authenticated administrator intentionally uses the Task Package actions.

## Next build — Event Operations / Launch Operations

The next Event Operations slice should use current `WorkflowTemplate` / `WorkflowTemplateTask` + `CampaignTask` rather than creating another project/task framework.

Recommended order:

1. define the Event Operations template/workstream package for candidate advance, communications, staffing, day-of operations, listening capture, media capture, and closeout
2. add idempotent `Launch Operations` for an existing canonical `CampaignEvent`
3. add Create/Duplicate event actions under the P0-S1 history-copy guardrails
4. dry-run September 2026 events against the launch service
5. add the volunteer-facing claim/work surface after actor identity is bound to authenticated volunteer users
6. normalize worksheet/proof tables only if beta usage proves JSON storage insufficient

## P0-S2 acceptance criteria

PASS when:

- no duplicate task engine is introduced
- no public event contract changes
- no Prisma migration is required
- package metadata is typed/versioned and preserves other ops metadata
- dependency blocking works
- claim/work/proof/submission/review transitions exist
- submission does not mark the task done
- verification marks the canonical task done
- Request Changes reopens the canonical task
- admin actions use the existing admin gate
- a usable internal operator page exists
- branch diff contains no competing event-planning task engine
- CI/typecheck is green before merge
