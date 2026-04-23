# Assignment rail — foundation (RedDirt)

**Packet ASSIGN-1** names the **Assignment rail** as a first-class, system-wide contract: *who* or *which seat* owns *which open work*—without pretending every Prisma model already has a `positionId`. **No new database columns in this packet.** This doc + types in `src/lib/campaign-engine/assignment.ts` and `open-work.ts` are the source of the vocabulary; behavior is minimal (see `getOpenWorkCountsBySource` in `open-work.ts` for optional read-only counts only).

**Cross-ref:** [`position-system-foundation.md`](./position-system-foundation.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) · [`position-inbox-foundation.md`](./position-inbox-foundation.md) · [`incoming-work-matrix.md`](./incoming-work-matrix.md) · `prisma/schema.prisma` (User relations)

---

## 1. North star

**Assignment** is the backbone of:

- **Delegation** — moving default accountability for a work item from one operator to another (or to a *seat* before a person is named).
- **Ownership** — a clear answer to “who is supposed to drive this to closure on our side,” distinct from the contact on the public record.
- **Accountability** — when something slips, the org can see whether it was unowned, miss-assigned, or waiting on escalation—not only “in the comms workbench.”
- **Position-based workbenches** — each [`PositionId`](../src/lib/campaign-engine/positions.ts) in ROLE-1 gets a *logical* home for work types the campaign already attributes to that seat in [`workbench-job-definitions.md`](./workbench-job-definitions.md), even if today only **user**-level fields exist in the database.

Solo mode remains valid: one admin user can hold *all* positions; the rail still **names** the concept so a future `User`↔`Position` seating table can attach without rewriting every workbench.

---

## 2. Current state (repo evidence)

| Area | What exists | Gap vs ASSIGN-1 target |
|------|-------------|-------------------------|
| **User-level assignee** | `EmailWorkflowItem.assignedToUserId`, `WorkflowIntake.assignedUserId` (intake), `CampaignTask.assignedUserId`, `CommunicationThread.assignedUserId` — see `User` relations in `schema.prisma` (`emailWorkflowItemsAssigned`, `workflowIntakesAssigned`, `tasksAssigned`, `threadsAssigned`). | **No** `positionId` on these rows. Assignment is *only* to a person (or null). |
| **Position-level** | `POSITION_TREE`, `PositionId` in `positions.ts`; narrative in ROLE-1 §5, §5 “Position ↔ assignment rail.” | **Not** in Prisma; no routing engine. |
| **Cross-system “open work”** | Separate list UIs: `workbench/email-queue`, workflow intake lists, `tasks`, comms thread rail on `workbench/page.tsx`—see [`workbench-build-map.md`](./workbench-build-map.md) and [`incoming-work-matrix.md`](./incoming-work-matrix.md). | **No** single read model, query contract, or CM “all open work” view (FND-1 §2 “Incoming work” + §6.2 already call this out). |
| **AI / heuristics** | E-2B provenance, `assigneeUserIdHint` stub in `email-workflow/intelligence/extension-points.ts`. | Suggested assignment is *not* persisted as a first-class `AssignmentKind` on the row yet. |

**Summary:** The **data model supports user assignment** in the hot paths; the **product model** for *position* and *unified open work* is still documentation + ASSIGN-1 types.

---

## 3. Assignment model

**Two scopes (both valid; today only the first is stored):**

1. **User level (`AssignmentScope.USER`)** — `assignedToUserId` / `assignedUserId` on the relevant model. This is the **only** scope persisted in ASSIGN-1.
2. **Position level (`AssignmentScope.POSITION`)** — *future* optional field or join: “this work belongs to the **Communications Director** seat” whether or not a user is currently seated. Enables roll-up, delegation, and (later) auto-routing *without* duplicating the underlying domain tables.

**Position-level assignment (target behavior, not built):**

- **Roll-up** — Work mapped to a child position appears in the **parent** Campaign Manager *view* when the child seat is unfilled (ROLE-1 roll-up story).
- **Delegation** — When a subordinate is seated, *new* work in that domain can default to the child position’s *inbox* (policy packet; not ASSIGN-1).
- **Auto-routing later** — Rules that set `positionId` and/or `userId` from intake type, county, or AI suggestion—**explicitly out of scope** for ASSIGN-1 (no automation).

**Represented in code:** `AssignedReference` and `AssignmentKind` in `assignment.ts`.

---

## 4. Position inbox concept (read model, not a new table)

- **Inbox for this position** — The **set of open work items** whose *domain* maps to that position (via [`workbench-job-definitions.md`](./workbench-job-definitions.md) + `workbenchRouteHints` on the node) **and** whose assignment (user or, later, position) *or* *escalation state* includes that position’s lane. *v1:* mostly **heuristic** union of queries; see [`position-inbox-foundation.md`](./position-inbox-foundation.md).
- **Inbox for me** — **Union** of (a) rows where `assigned*UserId` = my `User.id` and (b) *optional* “position inboxes I currently hold” once seating exists. *Today:* (a) only.
- **Inbox for Campaign Manager** — **Designed** as: **unassigned** open work in high-leverage domains + **escalated** email workflow items (e.g. `EmailWorkflowStatus.ESCALATED` or `EmailWorkflowEscalationLevel` above `NONE` per product rules) + anything the matrix marks as “no owner.” *Exact filters* = product decision in ASSIGN-2+; ASSIGN-1 only defines the **concept** and [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) query *shape*.

---

## 5. Assignment types

| Kind | Meaning | Repo today |
|------|---------|------------|
| **Direct** | A human (or import) set the assignee field on the row. | Default interpretation of any non-null `assignedToUserId` / `assignedUserId`. |
| **Inherited (roll-up)** | Work *counts* in a parent’s visibility because the accountable child seat is empty or policy says so. | **Narrative** in ROLE-1; **not** a separate DB field in ASSIGN-1. |
| **Suggested (AI / heuristic)** | Model or heuristics *propose* an assignee; human still confirms (align with ALIGN-1 `changed_assignment` override). | E-2 extension stubs; comms `aiNextBestAction` is *guidance* not `assignedUserId` write. |
| **Escalated** | Work *surfaced* to a higher lane because of triage/escalation fields (e.g. email workflow escalation). | `EmailWorkflowEscalationLevel`, `ESCALATED` status; *maps* to “CM / director” inbox conceptually. |

`AssignmentKind` in `assignment.ts` encodes the **vocabulary**; persistence of “suggested vs committed” is a future **provenance** concern (E-2 `metadataJson` pattern / override rail).

---

## 6. Relation to other rails

| Rail | How assignment connects |
|------|---------------------------|
| **Incoming work** | Each row in [`incoming-work-matrix.md`](./incoming-work-matrix.md) has a *destination model*; assignment is the **second** dimension after “it exists” (FND-1). |
| **Talent (TALENT-1)** | `assignedUserId` and task outcomes feed **reliability** and training signals; **not** a promotion decision. |
| **Alignment (ALIGN-1)** | Suggested assignment must respect `HumanGovernanceBoundary` and campaign alignment; wrong suggestion → human override + impact tracking. |
| **Override tracking** | `changed_assignment` in `overrides.ts` when human picks a different assignee than AI/heuristic default. |
| **AI recommendations** | `BrainRecommendationKind` / E-2 hooks: **suggest** only; assignment rail is where “accepted suggestion” would be recorded (future). |

---

*Last updated: Packet ASSIGN-1.*
