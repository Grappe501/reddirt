# Position workbench — foundation (WB-CORE-1) (RedDirt)

**Packet WB-CORE-1** defines a **position workbench** as the **read-first operational home** for a seat in the org tree: a **single place** to see *role-appropriate* open work (when heuristics exist), **where to click next** (linked domain tools from `positions.ts`), and **empty slots** for future guidance, training, and AI—**without** seat persistence, **without** RBAC, **without** auto-routing.

**Cross-ref:** [`position-system-foundation.md`](./position-system-foundation.md) · [`position-seating-foundation.md`](./position-seating-foundation.md) · [`seat-aware-assignment-foundation.md`](./seat-aware-assignment-foundation.md) (ASSIGN-2 read seams) · [`workbench-job-definitions.md`](./workbench-job-definitions.md) · [`position-inbox-foundation.md`](./position-inbox-foundation.md) · [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · `src/lib/campaign-engine/position-inbox.ts` · `src/lib/campaign-engine/personalized-workbench.ts` · `src/lib/campaign-engine/seating.ts` · `src/lib/campaign-engine/open-work.ts` (`getSeatInboxWorkAlignment`, …)

---

## 1. North star

- **Operational home** — Not the only place work exists in the app, but the **lens** that answers “what does *this* role need to see first?”
- **Visibility of role-owned and escalated work** — Where the unified read model (UWR-1) *can* be **narrowed** with honest rules (structural, not true assignment-by-position in v1)
- **Future personalization** — The same page shape when the seat is **unfilled** (roll-up to parent), **one user**, or **shared**; today there is **no** `User`↔`Position` binding in the database
- **Same architecture, staffed or not** — `POSITION_TREE` and route hints are always shown; the **inbox** list may be **empty** when we have no heuristic yet

---

## 2. Position inbox vs workbench (this packet)

| Concept | In WB-CORE-1 |
|---------|----------------|
| **Inbox (cross-source feed)** | `getInboxForPosition` — subset of UWR-1 rows, **read-only** |
| **Workbench** | Inbox + **role title/parent** + **linked routes** from `workbenchRouteHints` + **high-priority slice** (escalation / URGENT/HIGH) + **placeholder** guidance (types only in `personalized-workbench.ts`) |

---

## 3. v1 position workbench model (minimal)

- **Role summary** — `displayName`, parent position (from `POSITION_TREE`)
- **Open work list** — From `getInboxForPosition` (bounded, **capped** like UWR-1)
- **High-priority / escalated** — `getHighPriorityInboxItemsForPosition` on the same merged list
- **Linked tool destinations** — `workbenchRouteHints` (no new routes in this packet except the position pages)
- **Guidance / training / AI** — **Placeholder** types only; **no** model calls, no hidden ranking

**Writes:** only via **links** to existing admin surfaces; no new mutations in WB-CORE-1

---

## 4. First positions (repo-honest)

| Position | Inbox support | Heuristic (see `position-inbox.ts`) |
|----------|---------------|----------------------------------------|
| **Campaign Manager** | `full` | Same as UWR-1 CM triage: unassigned (all v1 sources) + escalated / risk email |
| **Communications Director** | `partial` | Comms-lean: **email + workflow intake** (no generic tasks) |
| **Email/Comms Manager** | `partial` | Same comms-lean (shared narrow slice with Comms Director) |
| **Volunteer Coordinator** | `partial` | Field-lean: **intake + tasks** (no email queue) |
| **Field Director** | `partial` | Same field-lean; festival / other field rails still **out** of UWR-1 v1 |

**All other** `PositionId` values: **destinations only** — page shows org context + **links**; **inbox = []** (honest: no heuristic yet)

---

## 5. Relations to other rails

- **Assignment (ASSIGN-1):** UWR-1 uses **user-level** `assigned*UserId` only; position inbox is **structural** filtering, not a second assignment layer
- **Unified incoming work (UWR-1):** Inbox is built **on** those queries
- **Talent / training (TALENT-1):** Future `WorkbenchGuidanceSlot` can point to training; **not** in WB-CORE-1 UI
- **AI brain / alignment / overrides:** **No** automatic prioritization; optional future slots must stay **governed** (ALIGN-1) and **override**-auditable
- **Future seating:** `User`↔`Position` in a later packet; then `filterStrategy` can evolve (documented in `getWorkbenchSummaryForPosition`)

---

## 6. Out of scope (explicit)

- **No RBAC** and **no** route guards per position
- **No** seat occupancy table or `User`↔`Position` persistence
- **No** true position-based **routing** of new work
- **No** AI **re-ranking** of the list
- **No** large or redundant workbench **redesigns**

---

## 7. Next packets (suggested)

- **WB-CORE-2** — Intake / task **typing** (or `source` tag) to tighten volunteer vs comms vs field lists; optional county filter once consistent on rows
- **WB-CORE-2** — `CommunicationThread` when product defines **one** “actionable” query aligned with workbench
- **SEAT-1** (shipped) — `PositionSeat` + seat banner on this page; see [`position-seating-foundation.md`](./position-seating-foundation.md). Optional **`positionId` on** UWR-1 **source** rows **remains** a **separate** packet (not required for workbench v1)

---

*Last updated: Packets WB-CORE-1, SEAT-1 (cross-ref to seating).*
