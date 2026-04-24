# Unified open work — foundation (RedDirt)

**Packet ASSIGN-1** defines **open work** as a **cross-domain, read-only abstraction**: every “something the campaign should still act on” row, addressable with a small **handle** so orchestration and position inboxes can *compose* without a single `UnifiedWorkItem` table (FND-1 stays honest: *evidence* is many Prisma models; the **contract** is `OpenWorkItemRef` + query functions in `open-work.ts`). **Packet UWR-1** implements the first **real merged queries** and `UnifiedOpenWorkItem` (see [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md)).

**Cross-ref:** [`incoming-work-matrix.md`](./incoming-work-matrix.md) · [`assignment-rail-foundation.md`](./assignment-rail-foundation.md) · [`position-inbox-foundation.md`](./position-inbox-foundation.md) · [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md) · `src/lib/campaign-engine/open-work.ts` · `src/lib/campaign-engine/assignment.ts`

---

## 1. Concept: “open work”

**Open work** = a row in a **source model** that is *not* in a **terminal** state for that domain, and (where relevant) still needs a staff action, reply, or resolution.

- **Not** a new Prisma type in ASSIGN-1; **not** a write path.
- **Normalizes to** `OpenWorkItemRef`: `{ source, id, statusLabel, title, createdAt, assignedUserId, positionId? }` + optional `countyId`, `priorityLabel`, `href` for UI.

`positionId` is **null** in ASSIGN-1 (future mapping from domain rules or optional column).

---

## 2. Source models (v1 set)

| Source | Model | “Open” rule (v1, ASSIGN-1) | Notes |
|--------|--------|-----------------------------|--------|
| Email queue | `EmailWorkflowItem` | `status` not in `CLOSED`, `ARCHIVED`, `SPAM` | Queue-first policy unchanged ([`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md)). |
| Ops intake | `WorkflowIntake` | `status` in `PENDING`, `IN_REVIEW`, `AWAITING_INFO`, `READY_FOR_CALENDAR` | `CONVERTED` / `DECLINED` / `ARCHIVED` = not open. |
| Tasks | `CampaignTask` | `status` in `TODO`, `IN_PROGRESS`, `BLOCKED` | `DONE` / `CANCELLED` = not open. |
| Comms | `CommunicationThread` | *Actionable* narrow set in optional counter: `threadStatus` in `NEEDS_REPLY`, `FOLLOW_UP` | Broader “active with unread” can be a later product rule. |

*Additional* matrix sources (`Submission` without intake, `ArkansasFestivalIngest`, `InboundContentItem`, `OwnedMediaAsset`, …) **append** the same `OpenWorkItemRef` pattern when those packets add queries—**not** in ASSIGN-1’s minimal counter.

Geography: **`countyId`** on intake, task, thread, and related User — filter dimension for [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) “Geography / county rail.”

---

## 3. Minimal read model

- **No** giant new table.  
- **UWR-1 + UWR-2 + WB-CORE-1 deliver:** `getOpenWorkForUser`, `getOpenWorkForCampaignManager`, `getUnassignedOpenWork`, `getEscalatedOpenWork` (see [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md), [`unified-open-work-expansion-notes.md`](./unified-open-work-expansion-notes.md)); **`getInboxForPosition` / `getOpenWorkForPosition`** (alias) in `position-inbox.ts` — **position-narrowed** heuristics where defined (see [`position-workbench-foundation.md`](./position-workbench-foundation.md)). `getOpenWorkCountsBySource` — **five** domain counts (email, intake, task, actionable thread, **pending festival ingest**). **UWR-2** merges **threads** + adds **festival** rows to CM triage. Read-only workbench: CM triage block + **CM-2** bands + **position** pages.

This matches FND-1 §6.2: a **contract** in code (here) before one mega-UI.

---

## 4. Composing queries across sources

1. **Same filters** in spirit: `assignedUserId` / `assignedToUserId` / `assignedUserId` = X **or** null for “unassigned” pool.  
2. **Status** open rules per model (§2).  
3. **Priority** — `EmailWorkflowItem.priority`, `CampaignTask.priority`, thread `priorityScore` / workbench rules—*union* sort is **application-defined**; document **per-source** first.  
4. **Position** — *future* `positionId` or **rules** (intake `source` + county + matrix). ASSIGN-1: **narrative +** `getOpenWorkForPosition` placeholder.

---

## 5. Filtering dimensions

| Filter | How |
|--------|-----|
| **User** | `assigned*UserId` = `userId` **OR** (optional) *created by* / *watching* not in v1. |
| **Status** | Per-enums above. |
| **Priority** | Per-model field; no unified enum in ASSIGN-1. |
| **County / geography** | `countyId` on row or joined `User` where present. |
| **Position** | *Future*; today **derive** from **work type** + [`positions.ts`](../src/lib/campaign-engine/positions.ts) + job defs. |

---

*Last updated: Packets ASSIGN-1, UWR-1.*
