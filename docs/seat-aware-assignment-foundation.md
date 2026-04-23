# Seat-aware assignment — foundation (ASSIGN-2) (RedDirt)

**Packet ASSIGN-2 (with SKILL-1 handoff).** This doc **binds** the **user-level assignment rail** to **seats** **read-only** so workbenches can show **honest** **context** (occupant, inherited attention, **slice vs** **assignee** **match**) **without** **mutating** **queue** **rows**, **without** **RBAC**, and **without** **automated** **routing**.

**Prerequisites:** `docs/position-seating-foundation.md` (SEAT-1) · `docs/assignment-rail-foundation.md` (ASSIGN-1) · UWR-1 in `open-work.ts`  
**Code:** `src/lib/campaign-engine/assignment.ts` (types) · `seating.ts` (`getSeatAssignmentContext`) · `open-work.ts` (`getOpenWorkForSeat`, `getOpenWorkForSeatOccupant`, `getSeatInboxWorkAlignment`, re-export of `getSeatAssignmentContext`)

---

## 1. North star

- **Assignment** in the product **still** targets **work** to **users** on **concrete** Prisma fields (`assignedToUserId` / `assignedUserId` on the **three** UWR-1 v1 sources) — **this** is the **only** **persisted** **execution** path in ASSIGN-2.
- **Seats** (from `PositionSeat`) define **structural** **responsibility** in the org tree: **who** is **named** for that **positionKey**, and **where** **vacant** **attention** **narratively** **inherits**.
- **Work routing** — i.e. **automatic** or **model-driven** **rebinding** of **assignees** — remains **governed** and **out of** **scope**; **recommend** **assignee** (E-3) remains **advisory** **elsewhere** (`recommendedAssigneeUserId` = `null` in `SeatAssignmentContext`).

---

## 2. Current state (repo-honest)

| Layer | What exists |
|--------|------------|
| **User assignment fields** | `EmailWorkflowItem.assignedToUserId`, `WorkflowIntake.assignedUserId`, `CampaignTask.assignedUserId` — **per-row**, **user** scope only. |
| **Position inbox (WB-CORE-1)** | Heuristics: **structural** **merge** of **unassigned** + **relevant** **sources** per `PositionId` (CM triage, comms-lean, field-lean, or **empty**). **Not** a claim that the DB has `positionId` on every row. |
| **SEAT-1** | `PositionSeat` (unique `positionKey`, optional `userId`, `status`, `actingForPositionKey`, …) — **staffing** **metadata** only. |
| **True position ID on work rows** | **Not** in ASSIGN-2. **Inboxes** and **slices** are **derived** from **UWR-1** + **heuristics**, not from a Prisma `positionId` on each email/intake/task. |

---

## 3. Seat-aware assignment model (vocabulary)

| Concept | Definition |
|--------|------------|
| **Assigned user** | The `assigned*UserId` on a **concrete** open-work row, if any. |
| **Seat occupant** | `PositionSeat` **userId** (resolved user) for that `positionKey`, when **filled** / **acting** / **shadow** with a user. |
| **Seat / structural “owner”** | The `PositionId` in ROLE-1: **what** **role** the seat is **an instance** of. |
| **Inherited owner (roll-up)** | **When** the seat is **vacant**, **narrative** **attention** **inherits** to the **parent** in `POSITION_TREE` (see `inheritedAttentionToPositionId` in `getSeatAssignmentContext`) — **no** **queue** **row** **moves**. |
| **Recommended assignee** | Reserved for **E-3+**; **not** **persisted** in ASSIGN-2. |
| **Acting coverage** | `PositionSeatStatus.ACTING` + optional `actingForPositionKey` — **human**-entered **on** the **seat** **row** only. |

---

## 4. What can be done now (safe)

- **Show** **occupant-aware** **copy** on the **position** workbench (`getSeatAssignmentContext` + `getPositionWorkbenchSeatContext`).
- **Show** “**inherited** **by** **parent** **role**” for **vacant** seats (display name + id).
- **“For** **occupant**” **work:** **`getOpenWorkForSeatOccupant` → `getOpenWorkForUser(occupant)`** — the **entire** **per-user** **open** work **merge** (**not** limited to the position heuristic).
- **“For** **seat** (structural):” **`getOpenWorkForSeat` = `getInboxForPosition`** — **same** **UWR-1** **slice** as **role-shaped** **inbox** (WB-CORE-1).
- **Compare** **slice** **to** **occupant:** **`getSeatInboxWorkAlignment`** — **counts** of rows **in** the **heuristic** **slice** **assigned** **to** the **occupant** vs **others** vs **unassigned**; `allAssignedInSliceMatchOccupant` when every **row** **with** an **assignee** **matches** the **occupant** (or `null` if **n/a**). **Analytic** only.

---

## 5. What must wait

- **No** **mass** **reassignment** or **one-click** “**sync** **seat** **to** **rows**.”
- **No** **auto-**rebinding of `assigned*UserId` from **model** or **seat** **changes.**
- **No** **permissions** **enforcement** or **position-scoped** **route** **guards.**
- **No** **automatic** **routing** **engine** that **pushes** work by **position** (requires **policy**, **ASSIGN-3+**, and likely **opt-in** per domain).

---

## 6. Next packets (suggested)

- **ASSIGN-3** — **Optional** `suggestedPositionId` / **E-3** **persistence** **story** (still **human**-accept) **+** **audit** when **suggestion** != **eventual** **assignee**.
- **ASSIGN-3** — **Optional** **Prisma** **column** `positionKey` (nullable) on **one** **domain** (e.g. `EmailWorkflowItem` only) with **backfill** **rules** — **separate** **risk** **review** **gate**.
- **SEAT-2** — **Audit** on **PositionSeat** **changes** + optional **nudge** to CM when **slice** and **occupant** **diverge** **persistently** (still **read-only** **default**).

*Last updated: Packets SEAT-1, ASSIGN-2, SKILL-1 (handoff).*
