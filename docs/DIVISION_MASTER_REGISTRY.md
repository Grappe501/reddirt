# Division master registry

**Packets:** **DIV-OPS-1** · **DIV-OPS-2**  
**File:** `docs/DIVISION_MASTER_REGISTRY.md`

**Purpose:** **Single source of truth** for **divisions** in the campaign operating system: names, levels (**L0–L5**), **Priority level** (steering), primary **lanes**, dependencies, and **next packet** hints. **Conservative** maturity — do not overstate. Keep aligned with [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) **Blueprint Progress Ledger** and update both when a division **materially** moves.

**Protocol:** [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) (**PROTO-2** + **BLUEPRINT-OPS-1** + **DIV-OPS-1** + **DIV-OPS-2**). **Thread handoff:** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md).

**Definition (DIV-OPS-1):** A **division** is a **top-level system area** of the campaign OS. Divisions **map to one or more lanes**; **balance** and **active steering** are **permanent** protocol concerns.

**Priority level (DIV-OPS-2):** Used to **steer** builds — **CRITICAL** = system balance **at risk** if neglected; not the same as “L level.” Values: **CRITICAL** | **HIGH** | **MEDIUM** | **LOW**.

**Status legend:** **Docs** = mostly documentation · **Partial** = some code/real surface, incomplete · **Active** = ongoing implementation · **Stable** = mature enough to build on without surprise gaps.

---

## Division table

| Division name | Priority level | Description | Key models / systems | Primary lanes | Current level (L0–L5) | Status (Docs / Partial / Active / Stable) | Dependencies | Next required packet (typical) |
|---------------|---------------|-------------|------------------------|---------------|------------------------|---------------------------------------------|--------------|--------------------------------|
| **1. Comms / Email Workflow Intelligence** | **MEDIUM** (do not expand by default) | Triage and intelligence for campaign email; queue-first, approval-first. | `EmailWorkflowItem`, E-1/E-2, `Communication*`, `src/lib/email-workflow/` | E-1, E-2, COMMS-UNIFY | **L2–L3** (emerging) | **Active** / **Partial** | Identity, comms send rails, policy for any auto-send | Policy/depth only with **Build steering** — avoid **L4+** while **CRITICAL** lags **unless** justified |
| **2. Relational Organizing** | **HIGH** (ready for REL-3) | Power of 5, networks, optional voter match, relational KPIs. | `RelationalContact`, `relational-contacts.ts`, `relational-matching.ts`, admin relational pages | REL-1, REL-2, REL-3+ | **L2** (REL-2) | **Active** / **Partial** | Voter/identity rails; field geography | **REL-3** (volunteer home, rollups, dedupe) or match sprint per **steering** |
| **3. GOTV / Turnout System** | **CRITICAL** (blocking balance) | Turnout planning, universe reads — not a full commercial GOTV product yet. | Voter file, `VoterRecord`, election ingest, signals, GOTV **docs** | DATA-4, VOTER-MODEL-1, GOTV-1 (doc) | **L1–L2** | **Partial** | PRECINCT-1, honest geography; data layer | **GOTV-1** read model **or** ingest/quality — **do not** starve for **comms** polish |
| **4. Volunteer / Field Operations** | **CRITICAL** (blocking balance) | Volunteer experience, field units, county-led work. | `VolunteerProfile`, `FieldUnit` / `FieldAssignment`, forms, events | VOL-CORE-1, FIELD-1, REL-1 | **L1–L2** | **Partial** | Relational/REL-2 for honest rollups | **VOL-CORE-2** shell / field **or** GEO — **steer** before more **workbench** depth |
| **5. Workbench / Operator System** | **MEDIUM** | Admin shell, CM hub, unified open work, position/seat surfaces. | `workbench/*`, `open-work.ts`, UWR, `CampaignManagerDashboardBands` | UWR-1/2, WB-CORE-1, SEAT-1, CM-2 | **L2–L3** | **Active** / **Partial** | Truth snapshot, identity, assignment | UWR/CM **only** with **declared** target — **not** default “comfort” lane |
| **6. Truth Snapshot / Deterministic Brain** | **MEDIUM** | Classified truth, governance bands, **advisory** snapshot. | `truth.ts`, `truth-snapshot.ts`, `getTruthSnapshot` | BRAIN-OPS-1, BRAIN-OPS-2/3 | **L2** (advisory) | **Active** / **Partial** | Data coverage, policy docs, seats | CM-3 / snapshot honesty per priority |
| **7. Data Layer / Voter File / Ingest** | **MEDIUM** | Voter file, metrics, election results ingest, signals — honest storage. | `VoterRecord`, `CountyVoterMetrics`, election models, ingest CLIs, `targeting.ts` | DATA-1–4, ELECTION-INGEST-1 | **L2** (strong) | **Active** / **Partial** | No invented precinct master | PRECINCT-1 / inventory / ingest QA |
| **8. Content / Author Studio** | **HIGH** | Stories, blog, owned media, editorial, DAM-adjacent flows. | Content routes, owned media, editorial tools | (scattered) | **L1–L2** | **Partial** / **Fragmented** | Review queue, comms | Publishing governance + queue reuse — **not** only **E-lane** |
| **9. Finance / Compliance** | **MEDIUM** (guarded) | Budget, ledger, compliance documents — **approval-first**. | `BudgetPlan`, `FinancialTransaction`, `ComplianceDocument`, `policy.ts` | POLICY-1, COMP-1/2, FIN-1, BUDGET-2 | **L1** | **Partial** | Human approval, audit | FIN/COMP as needed; **no** auto-spend |
| **10. AJAX Organizing Hub (Discord layer)** | **LOW** | Community channel — not DB truth. | Discord foundation docs, future integration | Discord docs | **L1** | **Docs** / **Partial** | Policy, voice | Integration when **steering** allows |
| **11. Campaign Intelligence / Reporting** | **HIGH** | Cross-cutting metrics, “health,” analytics — must not invent authority. | Analytics routes, rollups, future reporting | LAUNCH-1, DBMAP-1, ad hoc | **L1–L2** | **Partial** | Truth snapshot, data coverage | Read-model / honest dashboard — **not** a substitute for **field** truth |

---

## How to use this registry

- **Before** the **next** packet: read this table **and** the **Blueprint Progress Ledger** in [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md). **Check** **imbalance** and **CRITICAL** rows (see **DIV-OPS-1** / **DIV-OPS-2** in [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md)).  
- **Every** Cursor return includes **Build steering decision** (target, reason, non-target) **and** **division status** — **enforcement**, not only reporting.  
- **Update** this file when a division’s **level**, **status**, **priority** interpretation, or **next packet** **materially** changes.

---

*Last updated: **DIV-OPS-2** (active build steering + **Priority level**).*
