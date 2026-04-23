# Position seating — foundation (SEAT-1) (RedDirt)

**Packet SEAT-1** makes **seats** a **first-class, partially persisted** concept: a **position** in ROLE-1 still **defines** the role; a **seat** is the **operational slot** that may be **filled**, **vacant**, or held in **acting** / **shadow** modes; a **user** is who **occupies** a seat when present. This packet is **governance-explicit** and **additive** — it does **not** add RBAC, automatic routing, or a permissions engine.

**Cross-ref:** [`position-system-foundation.md`](./position-system-foundation.md) · [`position-workbench-foundation.md`](./position-workbench-foundation.md) · [`assignment-rail-foundation.md`](./assignment-rail-foundation.md) · [`seat-aware-assignment-foundation.md`](./seat-aware-assignment-foundation.md) (ASSIGN-2) · [`delegation-and-coverage-foundation.md`](./delegation-and-coverage-foundation.md) · `prisma/schema.prisma` (`PositionSeat`, `PositionSeatStatus`) · `src/lib/campaign-engine/seating.ts` · `src/lib/campaign-engine/positions.ts` · `src/lib/campaign-engine/open-work.ts` (`getSeatInboxWorkAlignment`)

**Distinct from `TeamRoleAssignment`:** That model is a **separate** staff/volunteer **role key** (often county-scoped) and is **not** the ROLE-1 org tree. **`PositionSeat`** is the **single** operational slot per **`PositionId`** for campaign **structure** and **workbench** narratives.

---

## 1. North star

- A **seat** is the **operational instance** of a **position** in the chart: the thing that is **staffed** or **empty**.
- A seat **exists** in the product model even when **unfilled** (either a **synthetic** vacant in code or a **`PositionSeat` row** with `VACANT` / no `userId`).
- The seat is the **unit of staffing, delegation, vacancy, and (later) personalization** (user-scoped workbench, AI context keyed to `userId` + `positionKey`).
- **Same** architecture whether the slot is **automated**, **fully staffed**, or **partially** staffed — we only add **metadata** in SEAT-1, not new automation.

---

## 2. Position vs seat vs user

| Concept | Definition in SEAT-1 |
|--------|----------------------|
| **Position** | **Structural** `PositionId` in `positions.ts` — **display** name, **parent** in the tree, **workbench route hints**. Immutable **identity** of the *role type*. |
| **Seat** | The **one** fillable **slot** per `positionKey` in v1 (`PositionSeat` **unique** on `positionKey`). Not a second org chart. |
| **User** | A **`User` id** in Prisma. **Optional** on the seat. **Occupancy** is **not** a grant of **route** access (admin remains whatever `requireAdminPage` is today). |

---

## 3. Vacancy and roll-up

- **Vacant** — No `userId` on the `PositionSeat` row, **or** no row (read layer treats as **synthetic** vacant), **or** explicit `VACANT` status.
- **Roll-up (conceptual)** — When a child seat is vacant, **attention** to that department’s work is still **inherited** in **org** narrative: the **parent** in `POSITION_TREE` (often **Campaign Manager** for top-level **direct reports**) is where **coverage** visibility lands first. **SEAT-1 does not** move **UWR-1** rows, **reassign** `assignedToUserId`, or **duplicate** work items.
- **Campaign Manager** — Uses **`getCoverageSummary`**, **counts of vacant** seats **under** CM, and the **heuristic** “vacant with vacant child” in `seating.ts` to surface **holes**; **not** a workload or SLA engine.

---

## 4. Seating states (`PositionSeatStatus`)

| Status | When to use in v1 |
|--------|--------------------|
| **VACANT** | No occupant. Default when `userId` is cleared. |
| **FILLED** | Primary **named** occupant. |
| **ACTING** | **Temporary** coverage. Optional `actingForPositionKey` (another `PositionId`) if we document **backfill** (e.g. covering a **sibling** hole). **Not** automatic. |
| **SHADOW** | **Trainee** / co-pilot: seat has a `userId` but we **distinguish** from **primary** for future **TALENT** and **governance** copy. **No** hidden authority. |

States **not** in SEAT-1: complex multi-person splits, time-bound rotations in DB, org-wide approval workflows.

---

## 5. Relation to other rails

- **Assignment (ASSIGN-1 / UWR-1)** — Still **`assignedToUserId`** on each source object. **PositionSeat** is **parallel** **staffing** metadata; no join required for **open work** lists in v1.
- **Position inboxes (WB-CORE-1)** — Heuristics are **structural**; with SEAT-1, a **future** packet can **narrow** or **relabel** “for this occupant” **without** changing **assignment** in this packet.
- **Talent / training (TALENT-1)** — `SHADOW` and **known** `userId` + `positionKey` are inputs for **future** training targeting.
- **AI / user context (ALIGN-1, BRAIN-1)** — `PositionSeat` gives a **grounded** `(userId, positionKey)` for **user-scoped** copy when both exist.
- **Override / audit** — Seat changes are **not** in the **override** event stream in SEAT-1; **future** optional audit table can log **who** changed **staffing** for compliance.

---

## 6. What is out of scope

- **No RBAC** — `PositionSeat` does **not** gate **routes** or **APIs**.
- **No** automatic work **reassignment** or **transfers** when a seat is filled or vacated.
- **No** automatic **promotion** or **authority** escalation.
- **No** per-seat **permission** model or **enforcement** in middleware.
- **No** “high load” **metrics** in the DB for SEAT-1 (coverage summary is **counts** + heuristics only).

---

## 7. Next packets (suggested)

- **SEAT-2** — **Audit** / **change log** for seat edits; optional **time bounds**; optional **email** to CM when a **vacancy** is created.
- **SEAT-2** — Tighter **UWR-1** or inbox **narrative** that **mentions** the named occupant when `userId` matches (still read-only, still no auto-routing).
- **Multi-seat** per position (e.g. two **Field Organizer** slots) — **new** model or `slotIndex` — only when product **requires** it.

*Last updated: Packet SEAT-1.*
