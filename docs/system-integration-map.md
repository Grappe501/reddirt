# System integration map (BLUEPRINT-LOCK-1) (RedDirt)

**Packet BLUEPRINT-LOCK-1 (Part C).** **Honest** view of **what connects**, what is **isolated**, and where **data does not flow** as the blueprint implies. **No** new architecture—audit only.

**Cross-ref:** [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`system-domain-flow-map.md`](./system-domain-flow-map.md) · [`system-maturity-map.md`](./system-maturity-map.md)

---

## 1. Legend

| Status | Meaning |
|--------|---------|
| **Connected** | Real FKs, shared `User` spine, or production import/read path **in code**. |
| **Weak tie** | Same IDs possible but **manual**, **string**, or **partial** join. |
| **Doc-only** | Specified in foundation docs; **no** enforcing schema or UI path. |
| **Isolated** | Domain works **without** feeding the other in the **current** build. |

---

## 2. Integration matrix (high value seams)

| Seam | Status | Evidence / gap |
|------|--------|----------------|
| **REL-1 → FIELD → County goals** | **Doc-only** | REL-1 KPIs assume **`RelationalContact`**; **no** table. **`FieldUnit`** not FK-linked to **`County`**. **`CountyCampaignStats.registrationGoal`** exists but **not** tied to relational rows or `FieldUnit` ([`goals-system-status.md`](./goals-system-status.md)). |
| **GAME-1 → assignment / permissions** | **Doc-only** | GAME-1 unlocks **not** enforced in `assignment.ts` or admin RBAC; `requireAdminPage` remains **binary**. |
| **VOL-CORE → onboarding → actions** | **Weak tie** | Public **forms** create `User`/`VolunteerProfile`/`Submission`; **no** unified VOL-CORE journey object; **first action** specs **not** productized. |
| **COMMS → targeting → execution** | **Partial** | Segments, plans, sends exist; **Tier-2 JSON** segments and **voter file** are **not** one engine; COMMS-UNIFY-1 **conceptual**. |
| **DATA → voter file → decisions** | **Partial** | Import + `CountyVoterMetrics` feed **public** county experience components; **campaign “decisions”** (who to text at scale) **not** one governed pipeline in code. |
| **FINANCE → budget → decisions** | **Weak tie** | Budget vs **CONFIRMED** ledger actuals in admin; **not** automatically gating sends/events in product (policy **human**). |
| **Identity (`User`) → all divisions** | **Connected** | Forms, comms recipients, tasks, volunteer profile **hang** off `User`. |
| **UWR-1 → workbenches** | **Partial** | Hub shows merged open work; **not** all incoming matrix sources; deep links vary by domain. |
| **ROLE-1 positions → routing** | **Doc-only** | `PositionId` on **`FieldAssignment`** only (FIELD-1); **no** `positionId` on `EmailWorkflowItem` / `CampaignTask` in schema. |
| **SEAT-1 → inbox** | **Weak tie** | Seat **metadata** and position page **read** alignment; **no** auto-route by seat. |

---

## 3. Isolated or near-isolated domains

- **`county-goals.ts` helpers:** exported **read** API with **zero** importers in `src/` as of this audit (helpers are **orphaned** from call sites—goals still used via **other** paths). See [`goals-system-status.md`](./goals-system-status.md).
- **Fundraising types (`fundraising.ts`):** **no** desk route; **isolated** from operational workflows.
- **Youth types:** **isolated** from volunteer/comms flows.
- **Talent types:** **isolated** from runtime UI.

---

## 4. Data flow failures (frank)

1. **County organizing story vs field ops:** `County` (public) and `FieldUnit` (operational) can **diverge**; captains in VOL-CORE **cannot** rely on a **single** join today.
2. **Goals vs volunteers:** `registrationGoal` is **per county stats row**, not **allocated** to volunteers or PODs in DB.
3. **Relational program vs metrics:** Without REL-2, **KPI rollups** in docs **cannot** be queried honestly from Prisma.
4. **Comms scale vs consent:** Execution paths **multiply** (Tier 1/2, social, email workflow); **unification** is **documentation**, not a **single** provenance graph.

---

## 5. Anti-drift rule (BLUEPRINT-LOCK-1)

Before adding **large** new features in **Communications**, require a **named integration beneficiary** in **Field**, **Data**, or **Identity**—or explicitly mark the work as **experimental** and **non-authoritative** for organizing metrics.

---

*Last updated: Packet BLUEPRINT-LOCK-1 (Part C).*
