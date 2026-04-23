# Position hierarchy map (RedDirt)

**Packet ROLE-1.** **Text** org tree: **parent → child** relationships for the **hierarchical campaign operating system**. **Unfilled** positions **roll up** operational scope to **parent** (see `position-system-foundation.md` §2). This is **not** a permissions matrix.

**Cross-ref:** [`workbench-job-definitions.md`](./workbench-job-definitions.md) · `src/lib/campaign-engine/positions.ts`

---

## Department groupings (legend)

- **(CM)** = Campaign Manager subtree  
- **(Exec)** = executive layer, report to CM  
- **(ACM ops)** = operational spine under CM for data/calendar/task when ACM is used as hub  

**Flow:** **work escalates ↑** to parent; **delegates ↓** to first **filled** child in scope. **Solo** campaign: CM holds **all** nodes implicitly.

---

## Tree

```text
Campaign Manager (root)
│
├─ Assistant Campaign Manager
│  ├─ Data Manager
│  │  └─ Voter Insights / Analytics  [often Data Manager; else direct to ACM for roll-up]
│  ├─ Opposition Research Lead       [narrative release via Comms Director + Compliance]
│  ├─ Events Manager
│  ├─ Scheduler / Calendar Manager
│  ├─ Task/Workflow Manager
│  ├─ Intern (general)
│  └─ Platforms / Integrations       [optional; may sit under Comms in some orgs]
│
├─ Communications Director
│  ├─ Email/Comms Manager
│  ├─ Content Manager
│  ├─ Social Media Manager
│  └─ Media Relations / Press
│
├─ Field Director
│  ├─ Volunteer Coordinator
│  ├─ County/Regional Coordinator
│  │  └─ Field Organizer            [default parent; in tiny org, may report to Field Director]
│  └─ [Volunteer (general) rolls up: Coordinator → Director → CM]
│
├─ Finance Director
│
└─ Compliance Director
```

**Volunteer (general)** is **not** always a **child of** one County Coordinator: when **no** county lead exists, **Volunteer (general)** scope rolls to **Volunteer Coordinator** or **Field Director** then **CM** per `workbench-job-definitions.md`.

---

## Up / down (operational, not org politics)

| Direction | Meaning in system (target) |
|-----------|----------------------------|
| **Up** | **Escalation queue** (future) or **manual** **assignment** to **parent** position’s **default** user when **sensitivity** or **blocker**; **CM** = **orchestrator** of **unified** **incoming** list. |
| **Down** | **Delegation** = **new** work **routed** to **child** **position** **inbox** when **seat** **filled**; else **stays** on **parent**’s workbench set. |
| **Sideways** | **Comms** ↔ **Field** = **intake** or **CM**-mediated **(WorkflowIntake,** **tasks)**—**not** a second org tree. |

---

## Repo reality (no `Position` in DB)

Today **all** of the above is **planning** only. `requireAdminPage` does **not** branch by position. The **hierarchy** guides **which** workbenches **we** **attach** to **which** **persona** in **future** **packets** (assignment rail, optional `positionId` on unified read model).

*Last updated: Packet ROLE-1.*
