# Division master registry

**Packets:** **DIV-OPS-1** · **DIV-OPS-2** · **BLUEPRINT-EXP-1** · **AUTO-BUILD-1** (unattended mode — see [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md))  
**File:** `docs/DIVISION_MASTER_REGISTRY.md`

**Purpose:** **Single source of truth** for **divisions**: names, levels (**L0–L5**), **Priority level** (steering), primary **lanes**, and **forward path** (**current state → next stage → unlocks → dependencies**). **Conservative** maturity. Keep aligned with [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) **Blueprint Progress Ledger** and **Future-state blueprint**.

**Protocol:** [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) (**PROTO-2** + **BLUEPRINT-OPS-1** + **DIV-OPS-1** + **DIV-OPS-2** + **BLUEPRINT-EXP-1**). **Thread handoff:** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md). **Today’s build pathway (division levels, gates, ordered packets):** [`BUILD_LEVEL_AUDIT_TODAY.md`](./BUILD_LEVEL_AUDIT_TODAY.md) (**BLUEPRINT-AUDIT-LEVEL-PATH-1**).

**Definition (DIV-OPS-1):** A **division** is a **top-level system area** of the campaign OS. Divisions **map to one or more lanes**; **balance**, **steering**, and **forward mapping** are **permanent** protocol concerns.

**Priority level (DIV-OPS-2):** **CRITICAL** | **HIGH** | **MEDIUM** | **LOW** (steering, not L-level).

**Status legend:** **Docs** = mostly documentation · **Partial** = some code/real surface, incomplete · **Active** = ongoing implementation · **Stable** = mature enough to build on without surprise gaps.

---

## Division table (summary)

| Division name | Priority level | Description | Key models / systems | Primary lanes | Current level (L0–L5) | Status (Docs / Partial / Active / Stable) | Dependencies (summary) | Next required packet (typical) |
|---------------|---------------|-------------|------------------------|---------------|------------------------|---------------------------------------------|------------------------|--------------------------------|
| **1. Comms / Email** | **MEDIUM** | Triage + intelligence; queue-first. | `EmailWorkflowItem`, E-1/E-2, `Communication*` | E-1, E-2, COMMS-UNIFY | **L2–L3** | **Active** / **Partial** | Identity, send rails, policy | Policy/depth with **Build steering** |
| **2. Relational** | **HIGH** | Networks, power of five, match seams. | `RelationalContact`, `/relational`, rollups, dedupe | REL-1–3 | **L2–L3** (partial) | **Active** / **Partial** | Voter/identity, geography | County / cross-vol rollups (see forward path) |
| **3. GOTV** | **CRITICAL** | Turnout planning; not a full commercial GOTV. | Voter file, `RelationalContact`, `VoterInteraction`, **GOTV-1** + **GOTV-2** on admin `…/gotv` (contact-plan review + CSV **preview**; **no** send/assignment/score) | DATA-4, VOTER, GOTV-1–2 | **L2** | **Partial** / **Active** | Data, REL-3 activity | **GOTV-3** reviewed **assignment** workflow (**GOTV-2** **review-only** **shipped**) |
| **4. Volunteer / Field** | **CRITICAL** | Volunteer experience, field, counties. | `VolunteerProfile`, `/relational`, `FieldUnit` | VOL-CORE, FIELD, REL-3 | **L2–L3** (partial) | **Partial** / **Active** | REL-3, auth | **VOL-CORE-2** / field GEO |
| **5. Workbench** | **MEDIUM** | CM hub, open work, positions. | `workbench/*`, UWR, `CampaignManagerDashboardBands` | UWR, WB-CORE, SEAT, CM-2 | **L2–L3** | **Active** / **Partial** | Truth, identity | CM depth per steering |
| **6. Truth snapshot** | **MEDIUM** | Advisory `getTruthSnapshot`, bands. | `truth.ts`, `truth-snapshot.ts` | BRAIN-OPS | **L2** (advisory) | **Active** / **Partial** | Data, policy, seats | CM-3 / snapshot fields |
| **7. Data layer** | **MEDIUM** | Voter file, ingest, metrics. | `VoterRecord`, CLIs, `targeting.ts`, [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) | DATA-1–4, ELECTION-INGEST, **INGEST-OPS-2+**, **INGEST-OPS-4** | **L2** (strong) | **Active** / **Partial** | — (foundation) | **INGEST-OPS-5** **parser** **when** **steered**; PRECINCT-1; **`ingest:brain-manifest`** **refresh** |
| **8. Content / Author** | **HIGH** | Editorial, media, stories. | Content routes, owned media | (scattered) | **L1–L2** | **Partial** / **Fragmented** | Review, comms | Publishing governance |
| **9. Finance / Compliance** | **MEDIUM** (guarded) | Budget, ledger, compliance — approval-first. | `BudgetPlan`, `FinancialTransaction`, `ComplianceDocument` | POLICY, COMP, FIN, BUDGET | **L1** (partial) | **Partial** | Human approval, audit | FIN/COMP packets |
| **10. AJAX Organizing Hub** | **—** (**external**) | **Discord** — **not** part of **active** **RedDirt** **build**; **separate** **project** / **track** **elsewhere**. **Historical** **docs** **remain**. | Discord **refs** **in** **copy** **/** **docs** **only** | *(out of queue)* | **—** | **Dropped** **from** **prioritization** **here** | *N/A* — **do** **not** **schedule** **Discord** **integration** **packets** **in** **this** **repo** |
| **11. Campaign intelligence** | **HIGH** | Cross-cutting metrics, **analytics**, **competitor** / **opposition** **intelligence** (**INTEL-OPS-1** + **INTEL-OPS-2** + **INTEL-2** + **INTEL-3** + **INTEL-4A**), **COUNTY-PROFILE-ENGINE-1** + **COUNTY-INTEL-2** — **county** **workbench** **`/admin/county-intelligence`**, **aggregate** **turnout/registration/ACS/50K**, **static** **briefing** ( **no** **individual** **targeting** ) + **Pope** **static** / **public** / **admin** **surfaces**. **Public-record** **only**; **no** **private** **surveillance**; **no** **external** **publish** **without** **human** **review**; **no** **AI** **claims** **without** **citations**; **no** **fabricated** **party** **registration**. | Analytics, rollups, DBMAP, **[`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md)**, [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md), [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) **§6.5**–**§6.6**, **`county-political-profile.ts`**, **`aggregate-dropoff`**, **`registration-kpis`**, **`ingest:county-demographics`** | LAUNCH, DBMAP, **INTEL-1**–**INTEL-5+** (roadmap), ad hoc | **L1–L2** | **Partial** | Truth, data; **INGEST-OPS-4** ** file** **manifest** ([`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md)); **Election** **Ingest** **Gate** **satisfied** on **canonical** **13** **here** — **INTEL-3** **migration** (per **env**) + **helpers** + **`/admin/intelligence`** + **INTEL-4A** **`ingest:opposition-intel`**; **INTEL-4B+** **bulk** **automation** **still** **parser-** **/** **steering-** **gated** (**§6.4** **still** **applies**) | **INTEL-4B**–**INTEL-5** **packets** + **COUNTY-PROFILE-2/3** when **steered** |

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

- **Current state (GOTV-1 + GOTV-2):** **`getGotvPriorityUniverse`** / **`getGotvSummary`** (`gotv-read-model.ts`); **`buildGotvContactPlanPreview`** (overlapping preview counts) and **`buildGotvContactPlanReview`** (`gotv-contact-plan.ts`) — **mutually** **exclusive** **review** **buckets** with **explainable** **`priorityReason`** **only**; **read-only** **admin** **`/admin/gotv`**. **No** turnout **prediction**, **no** support **scoring**, **no** auto **outreach**, **no** **assignment** **mutation**. **Forward path:** **GOTV-3** = **reviewed** **assignment** **workflow**; **GOTV-4** = **field** **execution** **dashboard**; **GOTV-5** = **governed** **automation** **after** **approval** **rails**.  
- **Next stage:** **GOTV-3** **persisted** **queues** / **assignment** **handoff** (still **human**-owned); optional **deeper** **geography** (**PRECINCT-1**).  
- **Unlock conditions (met for read slice):** **REL-3** + **voter** **file** + **INTERACTION-1** **logs**; **Election** **Ingest** **Gate** **satisfied** on **local** **dev** per [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) (**verify** **other** **environments**).  
- **Dependencies:** **Drives** **comms** / **field** **planning** **narrative**; **does** **not** **claim** **contacts** = **votes**.  

### 5. Workbench / operator system

- **Current state:** **Admin** **CM** **hub**, **UWR**, **positions**, **seats**, **bands**; **L2–L3** **partial**.  
- **Next stage:** **Unified** **command** **center**; **decision** **panels** (GOTV, field, comms) **tied** to **same** **read** **models**.  
- **Unlock conditions:** **Data** + **intel** / **truth** **layers** **honest** **enough** to **not** **fake** a **single** **pane** of **glass**.  
- **Dependencies:** **Displays** **all** **divisions**; does **not** **own** **truth** ( **Truth** + **Data** do).  

### 6. Campaign intelligence / reporting

- **Current state:** **Fragmented** **insights**, **ad** **hoc** **routes**; **L1–L2**. **INGEST-OPS-4** = **normalized** **brain** **manifest** ([`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md), **`npm run ingest:brain-manifest`**) — does **not** **alone** **raise** **L3**. **INTEL-OPS-1** / **INTEL-OPS-2** + **INTEL-2** ([`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md)) + **INTEL-3** + **INTEL-4A** (**Prisma** **tables**, **`opposition-intelligence.ts`**, read-only **`/admin/intelligence`**, manual **JSON** **`ingest:opposition-intel`**, `data/intelligence/*`): **[`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md)** — **public** **records** **only**, **confidence** **+** **review**, **no** **voter** **scoring**, **no** **unreviewed** **publication**, **no** **AI** **factual** **claims** **without** **source** **citations**; **queues** in [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) **§6.5**–**§6.6**; **canonical** **election** **JSON** **audit** **`COMPLETE`** on **local** **dev** — **INTEL-4B+** **pipelines** **/** **analysis** **steered** **separately** (**§6.4** **guardrails** **unchanged**); **INTEL-1** **manual** / **cited** **entry** **unchanged**.  
- **Next stage:** **Unified** **reporting**; **INTEL-2** (**docs**) + **INTEL-3** + **INTEL-4A** (**manual** **JSON** **path**) → **INTEL-4B** (**governed** **public-source** import / **parsers**) → **INTEL-5** (**analysis** + **dashboard** **layer**); **INTEL-6+** **views** / **dashboards** / **AI** **summaries** **with** **human** **review**.  
- **Unlock conditions:** **Data** + **interactions** + **comms** **enough** for **honest** **rollups**; **truth** **snapshot** **fields** **trusted**; **ingest** **provenance** **disciplined** (election **+** **brain** **queues** in [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md)).  
- **Dependencies:** **Feeds** **workbench** **decisions**; **must** **not** **replace** **deterministic** **brain** or **DB**; **comms** **and** **finance** **consume** **intel** **only** with **governance** **per** **INTEL-OPS-1** / **INTEL-OPS-2**.  

### 7. Content / Author studio

- **Current state:** **Fragmented** **creation** **tools** (content, **owned** media, **editorial**).  
- **Next stage:** **Managed** **publishing** **pipeline**; **message** **governance** (queue, **approval**).  
- **Unlock conditions:** **Comms** **queues** and **invariants** **stable** **enough** to **align** **outbound** **story** with **ops** **reality**.  
- **Dependencies:** **Feeds** **comms**; **depends on** **review** / **compliance** **posture**.  

### 8. Data layer / Voter file / Ingest

- **Current state:** **Strong** **ingest** + **schema** relative to **greenfield**; **L2** **strong**. **INGEST-OPS-2** adds a **standing** **election-first** + **brain/source** **queue** ([`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md)).  
- **Next stage:** **Clean** **read** **model** **abstractions**; **stable** **contracts** for **county** / **precinct** / **signals**; **normalization** where **product** **locks** **rules**; **INGEST-OPS-3/3B** **audit** — **canonical** **13** **COMPLETE** on **local** **dev** (**SLICE-13**); **INGEST-OPS-5** **parser** **next** **when** **steered**; **other** **envs** **still** **run** **audit** **per** **DB**.  
- **Unlock conditions:** **Ingest** **QA**; **PRECINCT-1** / **crosswalk** as **needed**; **inventory** **fresh** (`npm run ingest:inventory` **→** [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md); **`npm run ingest:brain-manifest`** **→** [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md)).  
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

### 11. AJAX Organizing Hub (Discord layer) — **external / dropped from active RedDirt build**

- **Posture:** **Removed** from **this** **repo’s** **active** **build** **path** and **packet** **queue** per **steering** — **AJAX** **is** **a** **separate** **project**; **do** **not** **prioritize** **integration** **work** **here**. **User-facing** **copy** may **still** **name** **Discord**; **blueprint** **history** **is** **preserved**.  
- **Current state (RedDirt):** **No** **scheduled** **lanes** **or** **ledger** **targets** **for** **Discord** **in** **this** **codebase**.  
- **Next stage (elsewhere):** **Track** **only** **outside** **RedDirt** **if** **the** **campaign** **runs** **a** **parallel** **Discord** **program**.  
- **Unlock conditions:** *N/A* **for** **RedDirt** **queue**.  
- **Dependencies:** *None* **on** **critical** **path** **in** **this** **repo**; **ingest** **+** **embedding** **+** **manifest** **gates** **govern** **today’s** **path** ([`BUILD_LEVEL_AUDIT_TODAY.md`](./BUILD_LEVEL_AUDIT_TODAY.md)).  

---

## How to use this registry

- **Before** the **next** packet: read this file **and** the **Blueprint Progress Ledger** + **Future-state** section in [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md); for **today’s** **ordered** **packets** **and** **gates**, see [`BUILD_LEVEL_AUDIT_TODAY.md`](./BUILD_LEVEL_AUDIT_TODAY.md). **Check** **imbalance**, **Priority**, and **which** **next** **stage** you are **unlocking** (**BLUEPRINT-EXP-1**).  
- **Every** Cursor return includes **Build steering** + **division** **status** (**DIV-OPS-2** / **1**).  
- **Unattended** / **self-build** ( **AUTO-BUILD-1** ): read [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) **in addition**; **pick** **one** **target** **division** and **one** **approved** **queue** item (or **script**-**locked** **low-risk** **packet**); **do** **not** **bypass** **hard** **stops**; **synchronize** this **file** with the **ledger** if **maturity** **or** **next** **stage** **changes**.  
- **Update** this file when **levels**, **forward** path, or **next** **stage** **materially** **changes**.  

---

*Last updated: **BLUEPRINT-EXP-1** + **DIV-OPS-2** + **AUTO-BUILD-1** + **INGEST-OPS-2/3/3B** + **INGEST-OPS-3D-SLICE-13** + **INTEL-OPS-1** + **INTEL-2** + **INTEL-3** + **INTEL-4A** + **BLUEPRINT-AUDIT-LEVEL-PATH-1** ([`BUILD_LEVEL_AUDIT_TODAY.md`](./BUILD_LEVEL_AUDIT_TODAY.md); **AJAX** **Organizing** **Hub** **marked** **external** **/** **dropped** **from** **active** **RedDirt** **queue**). **Implemented** **post-gate:** **INGEST-OPS-4** ([`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md)), **GOTV-2** (review-only contact-plan on `/admin/gotv`), **INTEL-2** ([`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md)), **INTEL-3** (opposition **Prisma** **schema** + helpers + **`/admin/intelligence`**) + **INTEL-4A** (`data/intelligence/*`, **`ingest:opposition-intel`**, `scripts/verify-opposition-intel-tables.ts`).*
