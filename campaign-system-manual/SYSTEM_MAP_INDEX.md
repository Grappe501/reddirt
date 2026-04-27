# System Map — Index

**Purpose:** High-level visual index for the Campaign Operating System. **Detailed** diagrams live in `maps/`. Mermaid is used here as in `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`.

---

## 1. User journey (first touch → active organizing)

```mermaid
flowchart LR
  subgraph public
    A[Site: Get Involved / messages / counties]
    B[Form POST /api/forms]
  end
  subgraph data
    C[FormSubmission + optional classification]
    D[WorkflowIntake]
  end
  subgraph ops
    E[Admin Workbench + Tasks]
    F[Comms / social actions]
  end
  A --> B
  B --> C
  C --> D
  D --> E
  D --> F
```

---

## 2. Dashboard hierarchy (drill down)

**Law:** Organizing **rolls up** bottom → top; UIs **drill** top → bottom (OIS-1, dashboard audit).

```mermaid
flowchart TB
  S[State /organizing-intelligence]
  R[8 Regions /organizing-intelligence/regions/...]
  C[County: command + OIS v2]
  P[Planned: city / precinct / community]
  U[Planned: personal / leader /dashboard]
  S --> R
  R --> C
  C --> P
  P --> U
```

*Note: `/counties/*` and `/organizing-intelligence/*` are related but not identical product trees (see audit).*

---

## 3. Approval and open-work flow (operator)

```mermaid
flowchart LR
  WI[WorkflowIntake statuses]
  OW[open-work: unified queue]
  WB[/admin/workbench]
  T[Tasks + CampaignTask]
  WI --> OW
  OW --> WB
  WI --> T
```

**Code refs:** `src/lib/campaign-engine/open-work.ts`, `prisma` `WorkflowIntake`, `WorkflowIntakeStatus`.

---

## 4. Power of 5 rollup (conceptual)

```mermaid
flowchart BT
  I[Individual / Power node]
  T[Power Team ~5]
  Pr[Precinct aggregate]
  Ci[City]
  Co[County]
  Re[Region]
  St[State]
  I --> T
  T --> Pr
  Pr --> Ci
  Ci --> Co
  Co --> Re
  Re --> St
```

**Document:** `docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`. **Product** routes for full drill-down not complete.

---

## 5. Message and narrative (MCE + NDE)

```mermaid
flowchart LR
  subgraph mce[Message engine language]
    MP[Patterns / playbooks]
    CP[Channel packages / drafts]
  end
  subgraph nde[Narrative distribution]
    NS[Scope + wave + calendar]
    CH[Channel checklist + owners]
  end
  subgraph exec[Execution]
    PL[CommunicationPlan + sends]
  end
  mce --> nde
  nde --> exec
  MP --> CP
```

**Docs:** `docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md`, `docs/NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md`.

---

## 6. Workbench flow map (simplified)

```mermaid
flowchart TB
  WB[Campaign Workbench /admin/workbench]
  CO[Comms: plans, broadcasts, email queue]
  SO[Social workbench + monitor]
  EV[Events + tasks + calendar]
  IN[Intake: volunteers, event requests]
  WB --> CO
  WB --> SO
  WB --> EV
  WB --> IN
```

---

## See also

| Topic | File |
|--------|------|
| Full dashboard URL inventory | `maps/DASHBOARD_MAP.md` |
| Roles | `maps/ROLE_MAP.md` |
| Data movement | `maps/DATA_FLOW_MAP.md` |
| Power of 5 detail | `maps/POWER_OF_5_MAP.md` |
| MCE/NDE channels | `maps/MESSAGE_AND_DISTRIBUTION_MAP.md` |
