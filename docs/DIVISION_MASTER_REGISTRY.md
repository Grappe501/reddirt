# Division master registry

**Packets:** **DIV-OPS-1** · **DIV-OPS-2** · **BLUEPRINT-EXP-1** · **AUTO-BUILD-1** (unattended mode — see [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md))  
**File:** `docs/DIVISION_MASTER_REGISTRY.md`

**Purpose:** **Single source of truth** for **divisions**: names, levels (**L0–L5**), **Priority level** (steering), primary **lanes**, and **forward path** (**current state → next stage → unlocks → dependencies**). **Conservative** maturity. Keep aligned with [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) **Blueprint Progress Ledger** and **Future-state blueprint**.

**Protocol:** [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) (**PROTO-2** + **BLUEPRINT-OPS-1** + **DIV-OPS-1** + **DIV-OPS-2** + **BLUEPRINT-EXP-1**). **Thread handoff:** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md).

**Definition (DIV-OPS-1):** A **division** is a **top-level system area** of the campaign OS. Divisions **map to one or more lanes**; **balance**, **steering**, and **forward mapping** are **permanent** protocol concerns.

**Priority level (DIV-OPS-2):** **CRITICAL** | **HIGH** | **MEDIUM** | **LOW** (steering, not L-level).

**Status legend:** **Docs** = mostly documentation · **Partial** = some code/real surface, incomplete · **Active** = ongoing implementation · **Stable** = mature enough to build on without surprise gaps.

---

## Division table (summary)

| Division name | Priority level | Description | Key models / systems | Primary lanes | Current level (L0–L5) | Status (Docs / Partial / Active / Stable) | Dependencies (summary) | Next required packet (typical) |
|---------------|---------------|-------------|------------------------|---------------|------------------------|---------------------------------------------|------------------------|--------------------------------|
| **1. Comms / Email** | **MEDIUM** | Triage + intelligence; queue-first. | `EmailWorkflowItem`, E-1/E-2, `Communication*` | E-1, E-2, COMMS-UNIFY | **L2–L3** | **Active** / **Partial** | Identity, send rails, policy | Policy/depth with **Build steering** |
| **2. Relational** | **HIGH** | Networks, power of five, match seams. | `RelationalContact`, `/relational`, rollups, dedupe | REL-1–3 | **L2–L3** (partial) | **Active** / **Partial** | Voter/identity, geography | County / cross-vol rollups (see forward path) |
| **3. GOTV** | **CRITICAL** | Turnout planning; not a full commercial GOTV. | Voter file, `RelationalContact`, `VoterInteraction`, **GOTV-1** read helpers, admin `…/gotv` | DATA-4, VOTER, GOTV-1 | **L2** | **Partial** / **Active** | Data, REL-3 activity | **GOTV-2** queues + assignment |
| **4. Volunteer / Field** | **CRITICAL** | Volunteer experience, field, counties. | `VolunteerProfile`, `/relational`, `FieldUnit` | VOL-CORE, FIELD, REL-3 | **L2–L3** (partial) | **Partial** / **Active** | REL-3, auth | **VOL-CORE-2** / field GEO |
| **5. Workbench** | **MEDIUM** | CM hub, open work, positions. | `workbench/*`, UWR, `CampaignManagerDashboardBands` | UWR, WB-CORE, SEAT, CM-2 | **L2–L3** | **Active** / **Partial** | Truth, identity | CM depth per steering |
| **6. Truth snapshot** | **MEDIUM** | Advisory `getTruthSnapshot`, bands. | `truth.ts`, `truth-snapshot.ts` | BRAIN-OPS | **L2** (advisory) | **Active** / **Partial** | Data, policy, seats | CM-3 / snapshot fields |
| **7. Data layer** | **MEDIUM** | Voter file, ingest, metrics. | `VoterRecord`, CLIs, `targeting.ts` | DATA-1–4, ELECTION-INGEST, **INGEST-OPS-2+** | **L2** (strong) | **Active** / **Partial** | — (foundation) | **INGEST-OPS-3** / **3B** election audit + runbook; **Election Ingest Gate** active until **COMPLETE**; then **INGEST-OPS-4**; PRECINCT-1; inventory QA |
| **8. Content / Author** | **HIGH** | Editorial, media, stories. | Content routes, owned media | (scattered) | **L1–L2** | **Partial** / **Fragmented** | Review, comms | Publishing governance |
| **9. Finance / Compliance** | **MEDIUM** (guarded) | Budget, ledger, compliance — approval-first. | `BudgetPlan`, `FinancialTransaction`, `ComplianceDocument` | POLICY, COMP, FIN, BUDGET | **L1** (partial) | **Partial** | Human approval, audit | FIN/COMP packets |
| **10. AJAX Organizing Hub** | **LOW** | Discord; not DB truth. | Discord **docs** | Discord | **L1** | **Docs** / **Partial** | Policy, voice | Integration when steered |
| **11. Campaign intelligence** | **HIGH** | Cross-cutting metrics, **analytics**, **opposition** **intelligence** ( **INTEL-OPS-1+** **blueprint**). | Analytics, rollups, DBMAP, **[`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md)** | LAUNCH, DBMAP, **INTEL-1–6** (roadmap), ad hoc | **L1–L2** | **Partial** | Truth, data; **INGEST-OPS-4+** **manifest** when **source** **inventory** **stabilizes**; **broad** **opp** **ingest** **automation** **gated** with **election** **ingest** | Honest reporting + **sourced** **opposition** **intel** |

---

## Division forward path (BLUEPRINT-EXP-1)

Each division: **current state** · **next stage** · **unlock conditions** · **dependencies** (what it feeds / what feeds it).

### 1. Comms / Email Workflow Intelligence

- **Current state:** Queue-first **philosophy** in design; E-1/E-2 **drafting + interpretation**; **L2–L3** emerging; **not** full policy-gated L4 auto-send.  
- **Next stage:** **Structured** queues, **triage** rules, **escalation** paths — **still** **approval-first** (no blind send).  
- **Unlock conditions:** Credible **GOTV** / **audience** **signals** (at least **read models** + segmentation contracts); **relational** / **voter** context **where** product ties comms to people.  
- **Dependencies (feeds / fed by):** **Driven by** **GOTV** + **relational** + **data** targeting; **feeds** **workbench** triage; must stay **governed** by **Finance/Compliance** for spend-sensitive paths.  

### 2. Relational organizing

- **Current state:** REL-2 **persistence** + **admin**; **REL-3** **volunteer** **`/relational`** (CRUD, rollups, dedupe **signals**, **`recordRelationalTouch`**).  
- **Next stage:** **Cross-volunteer** / **county** **rollups**; **governed** dedupe/merge **workflow** (human); optional **hardening** of auth and **match** UX (still no auto-classification).  
- **Unlock conditions:** **Stable** **user** context + **interaction** logging path (in progress); **geography** / **identity** **honest** in data layer.  
- **Dependencies:** **Feeds** **GOTV** (universes, contact **truth**); **feeds** **comms** **targeting** **narratives** — **not** vote counts.  

### 3. Volunteer / Field operations

- **Current state:** **Not** only admin: **REL-3** **organizer** **`/relational`**; **FieldUnit** / **assignments** and **forms** still **uneven** vs full **VOL-CORE** journey.  
- **Next stage:** **Volunteer dashboard** / home; **personal network** + **activity** in one **story**; **field** scaling **tools** (county-led).  
- **Unlock conditions:** **REL-3** (or successor) **stable**; **basic** **auth** beyond email-only as product requires; **relational** data **usable** in **field** views.  
- **Dependencies:** **Required for** **GOTV** and **field** **scale**; **drives** **relational** **honesty** (people, not only files).  

### 4. GOTV / Turnout system

- **Current state (GOTV-1):** **Read** **helpers** **`getGotvPriorityUniverse`** / **`getGotvSummary`** (`gotv-read-model.ts`); **preview-only** **contact** **buckets** **`buildGotvContactPlanPreview`** (`gotv-contact-plan.ts`); **read-only** **admin** **`/admin/gotv`**. **No** turnout **prediction**, **no** support **scoring**, **no** auto **outreach** — priority **reasons** are **explainable** from **stored** **rows** only. **Forward path:** **GOTV-2** = **contact** **plan** **queues** + **assignment** **review**; **GOTV-3** = **field** **execution** **dashboard**; **GOTV-4** = **governed** **automation** **only** **after** **approval** **rails**.  
- **Next stage:** **GOTV-2** **actionable** **queues** (still **human**-owned) + **review**; optional **deeper** **geography** **filters** ( **PRECINCT-1** ).  
- **Unlock conditions (met for read slice):** **REL-3** **relational** **activity** + **voter** **file** + **INTERACTION-1** **logs** can **back** a **first** **honest** **universe**.  
- **Dependencies:** **Drives** **comms** (who to **talk** to) and **field** **actions**; **depends on** **data** + **relational** + **volunteer** **path** — **does** **not** **claim** **contacts** = **votes**.  

### 5. Workbench / operator system

- **Current state:** **Admin** **CM** **hub**, **UWR**, **positions**, **seats**, **bands**; **L2–L3** **partial**.  
- **Next stage:** **Unified** **command** **center**; **decision** **panels** (GOTV, field, comms) **tied** to **same** **read** **models**.  
- **Unlock conditions:** **Data** + **intel** / **truth** **layers** **honest** **enough** to **not** **fake** a **single** **pane** of **glass**.  
- **Dependencies:** **Displays** **all** **divisions**; does **not** **own** **truth** ( **Truth** + **Data** do).  

### 6. Campaign intelligence / reporting

- **Current state:** **Fragmented** **insights**, **ad** **hoc** **routes**; **L1–L2**. **INGEST-OPS-2** / **4** = **source** **file** **inventory** **and** **manifest** when **ready** (does **not** **alone** **raise** **L3**). **INTEL-OPS-1** defines the **Opposition** **Intelligence** **Engine** (docs): **[`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md)** — **lawful** **public** **sources** **only**, **confidence** **+** **review**, **no** **voter** **scoring**; **broad** **opposition**-**related** **ingest** **automation** **waits** on **election** **ingest** **COMPLETE** (or **waiver**); **INTEL-1** **manual** / **cited** **entry** is **in** **scope** **earlier**.  
- **Next stage:** **Unified** **reporting**; **recommendation**-style **summaries** (**advisory** only — not **authority**); **phased** **INTEL-1**–**INTEL-6** per blueprint.  
- **Unlock conditions:** **Data** + **interactions** + **comms** **enough** for **honest** **rollups**; **truth** **snapshot** **fields** **trusted**; **ingest** **provenance** **disciplined** (election **+** **brain** **queues** in [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md)).  
- **Dependencies:** **Feeds** **workbench** **decisions**; **must** **not** **replace** **deterministic** **brain** or **DB**; **comms** **and** **finance** **consume** **intel** **only** with **governance** **per** **INTEL-OPS-1**.  

### 7. Content / Author studio

- **Current state:** **Fragmented** **creation** **tools** (content, **owned** media, **editorial**).  
- **Next stage:** **Managed** **publishing** **pipeline**; **message** **governance** (queue, **approval**).  
- **Unlock conditions:** **Comms** **queues** and **invariants** **stable** **enough** to **align** **outbound** **story** with **ops** **reality**.  
- **Dependencies:** **Feeds** **comms**; **depends on** **review** / **compliance** **posture**.  

### 8. Data layer / Voter file / Ingest

- **Current state:** **Strong** **ingest** + **schema** relative to **greenfield**; **L2** **strong**. **INGEST-OPS-2** adds a **standing** **election-first** + **brain/source** **queue** ([`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md)).  
- **Next stage:** **Clean** **read** **model** **abstractions**; **stable** **contracts** for **county** / **precinct** / **signals**; **normalization** where **product** **locks** **rules**; **INGEST-OPS-3/3B** **audit** + **operator** **runbook**; **if** **PARTIAL**, **only** **missing** **election** **JSONs**; **if** **COMPLETE**, **INGEST-OPS-4** **manifest**.  
- **Unlock conditions:** **Ingest** **QA**; **PRECINCT-1** / **crosswalk** as **needed**; **inventory** **fresh** (`npm run ingest:inventory` **→** [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md)).  
- **Dependencies:** **Feeds** **all** **divisions**; **not** a **substitute** for **field** or **relational** **truth**.  

### 9. Truth snapshot / Deterministic brain

- **Current state:** **Advisory** **`getTruthSnapshot`**, **CM** **bands** — **not** an **authority** **tier**.  
- **Next stage:** **Structured** **governance** **signals**; **deeper** **drill**-**downs** **where** **honest**.  
- **Unlock conditions:** **Metrics** and **coverage** **inputs** **stable** (data, **ledger**, **compliance** **flags**).  
- **Dependencies:** **Informs** **workbench**; **must** **not** **override** **policy** or **DB** **truth**.  

### 10. Finance / compliance

- **Current state:** **L1** **partial** — **budgets**, **ledger** **list**, **compliance** **documents**; **approval-** and **audit-first**; **not** a **full** **desk**.  
- **Next stage:** **Tracked** **approvals**; **append-only** **audit** **narrative** for **sensitive** **spend** / **messaging** **where** **policy** **requires**.  
- **Unlock conditions:** **Role** / **seat** **semantics** as **product** **defines** (not **RBAC** **fiction** in **one** **PR**).  
- **Dependencies:** **Must** **gate** **comms** + **spend**-**adjacent** **actions** as **blueprint** **extends** **automation**.  

### 11. AJAX Organizing Hub (Discord layer)

- **Current state:** **Concept** + **foundation** **docs**; **not** **org** **source of truth**.  
- **Next stage:** **Structured** **community** **layer** (threads → **tickets** / **intake** **handoff** as **designed**).  
- **Unlock conditions:** **Integration** **strategy** + **voice** / **policy** **locked**; **no** **silent** **mirroring** of **DB** **as** **canon**.  
- **Dependencies:** **External** **comms** **only**; **feeds** **ops** via **intake** **when** **wired** — **not** **deterministic** **truth**.  

---

## How to use this registry

- **Before** the **next** packet: read this file **and** the **Blueprint Progress Ledger** + **Future-state** section in [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md). **Check** **imbalance**, **Priority**, and **which** **next** **stage** you are **unlocking** (**BLUEPRINT-EXP-1**).  
- **Every** Cursor return includes **Build steering** + **division** **status** (**DIV-OPS-2** / **1**).  
- **Unattended** / **self-build** ( **AUTO-BUILD-1** ): read [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) **in addition**; **pick** **one** **target** **division** and **one** **approved** **queue** item (or **script**-**locked** **low-risk** **packet**); **do** **not** **bypass** **hard** **stops**; **synchronize** this **file** with the **ledger** if **maturity** **or** **next** **stage** **changes**.  
- **Update** this file when **levels**, **forward** path, or **next** **stage** **materially** **changes**.  

---

*Last updated: **BLUEPRINT-EXP-1** (forward path per division) + **DIV-OPS-2** + **AUTO-BUILD-1** (registry pointer for self-build) + **INGEST-OPS-2/3/3B** + **INTEL-OPS-1** ( **opposition** **intelligence** **engine** **blueprint** ).*
