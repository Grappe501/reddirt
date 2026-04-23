# Position inbox — foundation (RedDirt)

**Packet ASSIGN-1** defines a **position inbox** as a *read model concept*: the **set of open work** that a given [`PositionId`](../src/lib/campaign-engine/positions.ts) is accountable for, derived from **existing** Prisma models + `POSITION_TREE` + [`workbench-job-definitions.md`](./workbench-job-definitions.md)—**not** a new `Inbox` table. **Inbox for me** and **inbox for Campaign Manager** are **views** over the same underlying rows with different *filters*.

**Cross-ref:** [`assignment-rail-foundation.md`](./assignment-rail-foundation.md) · [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) · [`workbench-build-map.md`](./workbench-build-map.md) · `src/lib/campaign-engine/positions.ts`

---

## 1. What a position inbox is

A **position inbox** is:

- A **named lens** (by `PositionId`) over **unified open work** (see [`unified-open-work-foundation.md`](./unified-open-work-foundation.md)).
- A **UX and accountability** tool: “what should this **seat** clear next?”—even before every row has a `positionId` column.
- **Composed** in ASSIGN-1 by: **(1)** mapping each open-work **source** to *primary* positions from the job definitions / incoming matrix, **(2)** applying **user** assignee and **(future)** position assignment when it exists, **(3)** applying **roll-up** rules (unfilled child → parent sees the same pool).

It is **not** a separate queue storage: it is **how we query and group** the same `EmailWorkflowItem`, `WorkflowIntake`, `CampaignTask`, and actionable `CommunicationThread` rows the campaign already has.

---

## 2. What it contains (conceptual)

- **Open items** of types that the position **owns** or **stewards** per [`workbench-job-definitions.md`](./workbench-job-definitions.md) (e.g. email workflow triage for Email/Comms line; tasks for `task_workflow_manager`; festival review for field/events lines).
- **Metadata** for each item sufficient to deep-link: model + id, status, title/summary, assignee, county if present (`OpenWorkItemRef` in `assignment.ts`).
- **Exclusions (by policy, not a new app):** items in terminal states (closed, archived, converted intakes) are not “open.”

---

## 3. How it differs from current workbenches

| Workbench (today) | Position inbox (target) |
|-------------------|-------------------------|
| **Route-scoped** — one URL per feature (`/admin/workbench/email-queue`, `tasks`, etc.) | **Accountability-scoped** — one *logical* list per **position** (may *link* to the same routes). |
| **Implementation-defined** which filters exist | **Contract-defined** in ASSIGN-1 + [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) so a future CM home can *aggregate*. |
| Often **all admins see all** | **v1** same visibility; **target** *filter by assignee* + *position mapping* as seating/RBAC land. |

Workbenches remain the **place you edit**; the position inbox is the **place you triage and prioritize in org order**.

---

## 4. Unifying multiple sources (same as unified open work)

The position inbox is a **grouped** presentation of the union in [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) §2–3:

- **`EmailWorkflowItem`** — Comms/CM lane; `communications_director` / `email_comms_manager` / `campaign_manager` (escalations).
- **`WorkflowIntake`** — Cross-cutting; default owners vary by `source` / county (e.g. volunteer coordinator, regional coordinator) per matrix.
- **`CampaignTask`** — Field, events, comms, ops by `taskType` and links (`eventId`, `socialContentItemId`, etc.).
- **`CommunicationThread`** — Comms workbench; **actionable** threads (`NEEDS_REPLY`, `FOLLOW_UP`, and product-defined *active* need-attention) per ASSIGN-1 count helper conventions.

*Other* matrix rows (e.g. `InboundContentItem`, `ArkansasFestivalIngest`, owned media) join in later packets with the same `OpenWorkItemRef` pattern.

---

## 5. Examples (illustrative)

**Campaign Manager (`campaign_manager`)**  
- Unassigned or escalated `EmailWorkflowItem` rows.  
- Open `WorkflowIntake` with no `assignedUserId` where the matrix marks CM/Vol.  
- High-priority `CampaignTask` with `blocksReadiness` and no assignee.  
- *Roll-up:* work that *would* sit with an **unfilled** child position in the **executive** layer (narrative; query rules in a later packet).

**Communications Director (`communications_director`)**  
- Open email workflow in comms-related statuses and threads tied to comms workbench.  
- `CommunicationThread` rows needing staff reply.  
- Comms-linked tasks.

**Volunteer Coordinator (`volunteer_coordinator`)**  
- Intakes from volunteer pipeline sources; volunteer-related tasks; `Submission`-promoted intakes (when a list exists) per matrix and job defs.

*These are product-facing examples;* ASSIGN-1 *does not implement filters for each id—only documents the mapping and supplies types + optional count helper.*

---

*Last updated: Packet ASSIGN-1.*
