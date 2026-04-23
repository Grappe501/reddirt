# Position / role system — foundation (RedDirt)

**Packet ROLE-1.** Defines **Position** as a **first-class system concept** for the **hierarchical campaign operating system**: every position has an **operational scope**, a **set of workbenches**, and a **place in the org tree**—**independent** of who is logged in. **ROLE-1** remains **docs + the `positions.ts` tree**; **no** position-based permissions. *Update — SEAT-1:* a **separate** admin **seating** surface and `PositionSeat` table exist for **staffing** **metadata**; they do **not** redefine **ROLE-1** or add **route** **RBAC** here.

**Cross-ref:** [`position-hierarchy-map.md`](./position-hierarchy-map.md) · [`workbench-job-definitions.md`](./workbench-job-definitions.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`assignment-rail-foundation.md`](./assignment-rail-foundation.md) · [`position-inbox-foundation.md`](./position-inbox-foundation.md) · [`position-workbench-foundation.md`](./position-workbench-foundation.md) · [`position-seating-foundation.md`](./position-seating-foundation.md) · [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) · [`position-development-matrix.md`](./position-development-matrix.md) · [`incoming-work-matrix.md`](./incoming-work-matrix.md) · `src/lib/campaign-engine/positions.ts` · `src/lib/campaign-engine/position-inbox.ts` · `src/lib/campaign-engine/seating.ts` · `prisma/schema.prisma` (`PositionSeat`)

---

## 1. Position as a system object

A **Position** is:

| Aspect | Definition |
|--------|------------|
| **Role in the campaign** | A named, durable **function** (e.g. “Field Director”) that exists on the **org chart** for the **race**, not a login record. |
| **Responsibilities** | A **closed set of outcomes** the campaign expects (see [`workbench-job-definitions.md`](./workbench-job-definitions.md)). |
| **Owner of work types** | Primary **steward** for certain **incoming work** kinds (e.g. `EmailWorkflowItem` **triage** for Email/Comms Manager) **once** those kinds are **routable** on the **incoming work** rail. |
| **Node in a hierarchy** | Every position has a **parent** (except **Campaign Manager**). Unfilled child positions **roll up** **operational** **scope** to the parent—**not** by duplicating data models. |
| **Controller of workbenches** | Each position **operates** one or more **admin routes** / **workbenches** in RedDirt (`/admin/workbench/*`, etc.); when **multiple** people share a workbench, the **org** still distinguishes **accountability** by position, not by tab count. |

**People vs positions**

- **Positions exist** in the system **before** a person is **seated** (e.g. “Comms Director” is **unfilled** in a 1-person campaign: **Campaign Manager** holds **all** child scopes).
- **People are assigned to positions** — **SEAT-1** adds **optional** **`PositionSeat`** rows (`userId` + `positionKey`); that is **staffing** **metadata** for the **org** chart, **not** a permission grant and **not** a replacement for **`assignedToUserId`** on work objects. **ROLE-1** **tree** in code remains the **structural** **source of truth** for `PositionId` names. A **user** is **not** a position; **vice versa** is false.

*Repo today:* `requireAdminPage` is **all-or-nothing** for the admin **board**; **`PositionSeat` does not** add route-level **RBAC**. The **hierarchy** and **workbench** map here are the **target** for **persona-based** navigation; **seating** + **UWR-1** **assignment** are **separate** rails.

---

## 2. Position hierarchy model

**Layers (top → entry)**

1. **Campaign Manager (root)** — **Orchestrates** the whole engine; default **holder** of any **unfilled** **executive** or **department** scope.
2. **Executive layer** — **Assistant Campaign Manager** (operations hub), **Communications Director**, **Field Director**, **Finance Director**, **Compliance Director**. **Own** strategy-level **escalation** and **inter-department** **routing** (conceptually).
3. **Department leads** — **Comms/Content/Social/Press** (under Comms), **Field org** (under Field), **Data** (under ACM in this model—see **map**), **Operations** (events, calendar, task ops under ACM in this model).
4. **Functional roles** — e.g. **Email/Comms Manager**, **County/Regional Coordinator**—**execute** on **shared rails** with **narrower** DTO filters (county, plan, queue).
5. **Entry / scale** — **Intern**, **Volunteer (general)**—**limited** **surfaces** (future); today they may be **data** in `VolunteerProfile` **without** a **personal** workbench in the **repo**.

**Rules**

| Rule | Behavior in the system (target) |
|------|----------------------------------|
| **Work escalates up** | A row **stuck** in a child **scope** (e.g. legal risk on a send) **surfaces** to the **parent** position’s **inbox** (future)—today: **operator** must **use** the **same** workbench; **FND-1** **incoming** list should **link** to the same **row**. |
| **Work delegates down** | When a child position is **filled**, new **work** in that **domain** is **routable** to that **position**’s default **queue** (future: **by `PositionId`** + **rules**; today: **manual** `assignedToUserId`). |
| **Unassigned roles roll up** | If **Comms Director** is **unfilled**, **Comms Director**’s workbench set is **treated** as **in scope** for **Campaign Manager** (or **ACM** if you adopt the tree in [`position-hierarchy-map.md`](./position-hierarchy-map.md))—**product** behavior, not a second copy of `CommunicationPlan` rows. |

*Scaling:* At **1 person**, **one** `User` **implicitly** holds **Campaign Manager** + **all** child positions. At **10**, **a few** named seats get **dedicated** **users**; the rest **roll up**. At **1000+**, most **work** is **routed** to **Volunteer/County** and **Task** edges; **only** high-leverage **objects** (send, PII, legal) require **upward** **visibility**.

---

## 3. Position ↔ workbench relationship

- **Own / operate:** A position **lists** the **workbenches** it **uses** in [`workbench-job-definitions.md`](./workbench-job-definitions.md). **“Own”** means **accountable** for **outcomes** on those routes, not **sole** **access** in code.
- **Shared workbenches:** e.g. **`/admin/workbench`** (main **hub**) is **shared** by **CM**, **Comms**, **Field** for **orchestration**; **comms** **plans** are **operated** by **Comms** line but **read** by **CM** for **health** cards. **No** new **route** in ROLE-1—**naming** only.
- **Specialized workbenches:** `email-queue`, `comms/*`, `social`, `festivals`, `voter-import`, `media-monitor` map to **one** or **two** **primary** positions; **overlaps** (orchestrator vs workbench) are **documented** in the job definitions.

*Evidence:* `workbench-build-map.md` **inventory** is the **source** for **“what exists in the repo** today.”

---

## 4. Position ↔ incoming work

- **Work types** (see [`incoming-work-matrix.md`](./incoming-work-matrix.md)) are **not** all **routable** by position **yet**; ROLE-1 assigns **default** **primary** **position** **owners** (e.g. `EmailWorkflowItem` → **Email/Comms Manager** with **Comms Director** / **CM** **escalation**).
- **Initial routing (today):** **All** open work is **de facto** visible to **whoever** has **admin**; **“Campaign Manager** sees **everything**” is the **solo** default. **Auto-routing** by position (future) requires **assignment rail** + **optional** `positionId` on **unified** read model.
- **Later:** **Rules** (packet, not this one): “new `Submission` type = **Volunteer Coordinator**” **unless** `county` **matches** **County/Regional** **Coordinator**’s **scope**, etc.

---

## 5. Position ↔ assignment rail

- **Today:** `assignedToUserId` on `EmailWorkflowItem`, `WorkflowIntake`, `CampaignTask` (where present)—**user-based**, not **position-based**.
- **Target:** `Position` → **0..n** `User` **seats**; **inbox for this role** = **union** of **open** rows where **(a)** **domain** **matches** position’s **workload** and **(b)** **assignee** is **in** the **seated** **user** set for that **position** **or** **unassigned** and **routed** by **rule** to that **position**.
- **ROLE-1:** **No** new columns; only **naming** the **ladder** so **FND-2/3** **assignment** **packets** can **attach** `positionId` **optional** to **unified** list rows.

---

## 6. Position ↔ automation

| Zone | **Automation-appropriate** (with policy + provenance) | **Review-first** (human or dual-control) |
|------|----------------------------------------------------------|----------------------------------------|
| **Comms / Email workflow** | Webhook **status** updates, **retries** (existing comms), **heuristic** interpretation **fields** (E-2) | **Queue-first** for `EmailWorkflowItem`, **any** public-facing **send**, **consent**-touching **batch** |
| **Field** | **Template** `CampaignTask` for events, **county** **filters** | **Door-to-door** **scripts** with **PII**, **voter** **data** **exports** |
| **Data** | **Batch** import jobs, **dedupe** **hints** | **Voter** **file** **correctness**, **opposition** **release** |
| **Events** | **Calendar** **suggestions** | **Event** **on record** for **compliance**-sensitive **venues** |
| **Compliance** | **Checklist** **state** (future) | **Disclaimers**, **treasury**, **coordination** **rules**—**no** unsupervised **auto-approve** |

*Email* policy is **spelled** in `email-workflow-intelligence-AI-HANDOFF.md`—**unchanged** by ROLE-1.

---

## 7. Scaling model (same architecture, different workload distribution)

| Scale | **People** | **System behavior (conceptual)** |
|-------|------------|-----------------------------------|
| **1-person campaign** | **1** | **One** `User` **holds** **Campaign Manager** + **all** **descendants**; **all** workbenches **available**; **roll-up** is **invisible** (everything **is** CM scope). **Orchestrator** = **`/admin/workbench`**. |
| **~10** | CM + a few **directors** or **managers** | **Seat** **Executives** or **leads**; **assign** `assignedToUserId` to **decompose**; **unfilled** **director** **slots** = **CM/ACM** **inbox** **fatter**. **Still** one **admin** product; **no** **per-seat** **RBAC** **required** to **function**. |
| **~100** | **Regional** and **comms** **staff** | **County/Regional** and **comms** **queues** **dominate**; **filters** (county, plan, **segment**) are **leverage**; **personal** **workbenches** = **saved** **views** on **shared** **rails** (future). **Escalation** **paths** must be **one click** to **Field Director** / **Comms Director**. |
| **1000+ volunteers** | **Network** of **low-trust** **actors** | **Edge** work is **Task**- and **event**-shaped, **not** full **comms** **plan** **access**; **Volunteer (general)** **sees** only **permitted** **surfaces** (future). **Data** and **compliance** **rails** **throttle** **bulk** and **sensitive** **objects**; **CM** **dashboard** **aggregates** **exceptions** not **every** **row**. |

**Architecture invariants** do **not** change: **shared** **Prisma** **models**, **queue-first** where **policy** says, **orchestration** at **top**.

---

## 8. Packet TALENT-1 — How talent / training ties to positions

Seating and roll-up (ROLE-1) still describe where work belongs in the org. TALENT-1 adds how advisory signals and recommendations attach to people (and eventually to seated `User`↔`Position`) so managers can develop capability without auto-promotion. Advancement-style recommendations move up the hierarchy per [`talent-recommendation-flow.md`](./talent-recommendation-flow.md); they do not mutate position assignments in the system.

**Scaffolding:** `src/lib/campaign-engine/talent.ts`, `training.ts` (types only). Not in Prisma; not in RBAC.

**Intentionally not built:** Scores, auto seat moves, training/talent permissions (later packets).

---

*Last updated: Packets ROLE-1, TALENT-1.*
