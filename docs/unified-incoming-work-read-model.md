# Unified incoming work — read model (UWR-1) (RedDirt)

**Packet UWR-1** implements the first **code-first, read-only, cross-source** “incoming work” layer: **normalized list rows** built from **independent** Prisma queries, merged in memory—**no** master table, **no** routing automation, **no** new migrations.

**Cross-ref:** [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) · [`assignment-rail-foundation.md`](./assignment-rail-foundation.md) · [`position-inbox-foundation.md`](./position-inbox-foundation.md) · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) · `src/lib/campaign-engine/open-work.ts` · `src/lib/campaign-engine/assignment.ts`

---

## 1. North star

**Unified incoming work** is the **operational read layer** the unified campaign engine needs so operators (and a future CM hub) can answer: **“What still needs our attention, across the objects we already have?”** without a scavenger hunt through every workbench. It is **read-only**; work remains stored in `EmailWorkflowItem`, `WorkflowIntake`, `CampaignTask`, etc. **Assignment** is reflected via existing `assignedToUserId` / `assignedUserId` fields, not a new `positionId` in this packet.

---

## 2. v1 sources (strict set)

UWR-1 only includes models with **clear “open” status enums** and **assignee** columns:

| Source | Rationale | “Open” definition (UWR-1) |
|--------|------------|----------------------------|
| `EmailWorkflowItem` | Queue-first story; E-1/E-2; escalation + assignee in schema | Status in `NEW`, `ENRICHED`, `IN_REVIEW`, `READY_TO_RESPOND`, `APPROVED`, `ESCALATED` — **not** `CLOSED`, `ARCHIVED`, `SPAM` |
| `WorkflowIntake` | `assignedUserId` + `status` on row | `PENDING`, `IN_REVIEW`, `AWAITING_INFO`, `READY_FOR_CALENDAR` |
| `CampaignTask` | `assignedUserId` + `status` + priority | `TODO`, `IN_PROGRESS`, `BLOCKED` |

**Not in v1 (on purpose):**

- **`CommunicationThread`** — *Actionable* is product-sensitive (`NEEDS_REPLY` only vs `ACTIVE` + unread); still counted in `getOpenWorkCountsBySource` for health, **not** merged into unified **list** functions in this packet.
- **Submissions, festival ingests, inbound content, review queues** — “open” is domain-specific; add in UWR-2+ with honest filters and deep links.
- **Volunteer `SignupSheetDocument` route** at `/admin/volunteers/intake` is a **different** object from `WorkflowIntake` (Prisma) — do not conflate in this read model.

---

## 3. Normalized row shape

Implemented as `UnifiedOpenWorkItem` in `open-work.ts` (extends `OpenWorkItemRef` in `assignment.ts` with required `href`, `workbenchRouteHint`, `summaryLine`, `occurredOrCreatedAt`).

| Field | Meaning | Grounding |
|-------|---------|------------|
| `source` | Prisma model name | `OpenWorkSourceModel` |
| `id` | Primary key cuid | From row |
| `summaryLine` | One-line label | Email: `title` → `queueReason` → `whatSummary`; Intake: `title` / `source`; Task: `title` |
| `statusLabel` / `rawStatus` | Human + machine | Enum strings |
| `priorityLabel` | If present | Email + Task only; **Intake** has no priority column in schema |
| `assignedUserId` | Current assignee | `assignedToUserId` vs `assignedUserId` by model |
| `countyId` | Optional | When present on row |
| `escalationLabel` | Risk signal | Email: `ESCALATED` status and/or `escalationLevel` not `NONE`; task: `URGENT` as light hint; intake: null in v1 |
| `occurredAt` / `occurredOrCreatedAt` | Sort key | Email uses `occurredAt ?? createdAt`; others use `createdAt` (task: prefers `dueAt` when it orders earlier for tie-break via occurred choice in mapper) |
| `href` | **Deep link** | Email: `/admin/workbench/email-queue/{id}`. **Intake:** `/admin/workbench/comms/plans/new?intakeId={id}` (preloads intake on *New plan* — **no** standalone intake detail route in the repo). **Task:** `/admin/workbench/comms/plans/new?taskId={id}` (same pattern as `tasks/page.tsx` “New plan” link) |
| `workbenchRouteHint` | Broad surface | Email queue, comms *new plan* form, `/admin/tasks` for tasks |
| `positionId` | null | Awaiting position→work rules |
| `aiOrGovernance` | n/a | **Reserved** — null in v1; ALIGN-1 / E-2 can attach in later fields |

**Internal sort key** `_uwr1SortKey` is for stable ordering and **not** a business score; server-side only for lists.

**Sort (documented):** **(1)** Email escalation/risk, **(2)** domain priority (email + task; intake neutral), **(3)** *newer* `occurred`/`created` with higher **tie-break** value (implementation uses weighted numeric key).

---

## 4. Views (functions)

| View | Function | Semantics (v1) |
|------|----------|----------------|
| **Campaign Manager (triage slice)** | `getOpenWorkForCampaignManager` | **Merge + dedupe** of **unassigned** (all 3 sources) and **escalated email** (status `ESCALATED` or `escalationLevel` ≠ `NONE`). *Not* “every open item in the DB.” |
| **For me (user)** | `getOpenWorkForUser` | `assigned*UserId` = user, open statuses, same three sources. |
| **Unassigned** | `getUnassignedOpenWork` | All three sources with `assigned*Id` null. |
| **Escalated / risky (email only)** | `getEscalatedOpenWork` | Open email rows with escalation as above. |

*Position* inbox remains **narrative** (ASSIGN-1); not wired to `getOpenWorkForPosition` until domain→`PositionId` rules exist.

---

## 5. Out of scope for v1 (explicit)

- **No** master / unified work table; **no** migrations.
- **No** `positionId` **writes** or user↔position seating.
- **No** default inclusion of `CommunicationThread` in merged lists (see §2).
- **No** **routing** or auto-assignment.
- **No** large new inbox page; optional **one** read-only, additive block on the existing workbench (if shipped in this packet).

---

## 6. Next source candidates (UWR-2+)

| Candidate | Blocker or note |
|----------|-----------------|
| `CommunicationThread` | Agree *actionable* filter with comms; align with workbench `needsReply` metrics. |
| `Submission` w/o `WorkflowIntake` | When a **promotion** or **triage** list exists with stable id + link. |
| `ArkansasFestivalIngest` (`pending_approval` etc.) | Map to `/admin/workbench/festivals` + row id. |
| `EmailWorkflowItem`-adjacent | Already included when row exists. |
| `InboundContentItem` | Orchestrator + status semantics. |

*Prefer three clean sources over eight fuzzy ones* (per packet request).

---

*Last updated: Packet UWR-1.*
