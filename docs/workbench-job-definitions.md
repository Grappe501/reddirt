# Workbench job definitions (system-facing)

**Packet ROLE-1.** **Operational** contracts: what each **position** is **for** in RedDirt—**which workbenches**, which **incoming** **types**, what **escalates**, what **can** be **machine-assisted**. **Not** HR job posts. **Not** permissions. Routes refer to `workbench-build-map.md` **inventory** unless noted.

**Parent:** See [`position-hierarchy-map.md`](./position-hierarchy-map.md) for the **tree** and **roll-up** rules.

---

## Top level

### Campaign Manager

| Field | Content |
|-------|---------|
| **PARENT POSITION** | *(none — root)* |
| **CORE RESPONSIBILITY** | **Orchestrate** the campaign: **prioritize** what must happen next across comms, field, data, and compliance; **own** the **unfilled** **scope** of all **subordinate** positions. |
| **WORKBENCHES USED** | Primary hub: `src/app/admin/(board)/workbench/page.tsx` (`/admin/workbench`). **Also:** `tasks`, `events/*`, any route needed when **other** seats are **unfilled** (email-queue, comms, social, festivals, voter-import, review-queue, **orchestrator** for `InboundContentItem`). |
| **TYPES OF INCOMING WORK** | **Entire** [`incoming-work-matrix.md`](./incoming-work-matrix.md): `Submission` triage, `WorkflowIntake`, `EmailWorkflowItem`, `CommunicationSend` **failures**, `ConversationOpportunity` **escalations**, `ArkansasFestivalIngest` **pending**, `CampaignTask` **overdue**, `InboundContentItem`, **media** **mentions**—as **orchestrator**, not always **closer**. |
| **DECISIONS THEY MAKE** | **Go/no-go** on **narrative** and **resource** **tradeoffs**; **reassign** (today: **manual** + `assignedToUserId`); **override** when **subordinate** **queues** are **empty** or **wrong**. |
| **WHAT THEY CAN AUTOMATE** | **Inherit** from children: allow **heuristic** **email** **interpretation** (E-2) **on** their **triage**; **cron** **ingests**; **not** unilateral **auto-send** (per handoff). |
| **WHAT MUST BE REVIEWED** | **All** first-time **outbound** **public** comms, **voter/PII**-touching **exports**, **opposition** **releases**, **legal**-sensitive **event** **records**—or **delegate** to **named** **Compliance** / **Comms** with **accountability** on **position**. |
| **WHAT ESCALATES UP** | **Nothing** above CM in-tree; **external** = party/legal/treasury (out of band). **Internal** “escalation” to CM = **any** item **exceeding** a **child**’s **authority** (future **rule**). |
| **WHAT DELEGATES DOWN** | **Everything** that has a **filled** **child** **position** in-scope; else **keeps** at hub. |
| **SUCCESS SIGNALS (SYSTEM-LEVEL)** | `EmailWorkflow` / **intake** **queues** **not** **stale** **beyond** **SLA**; **comms** **send** **error** **rate** **bounded**; **event** **readiness** **flags** **green** for **upcoming** **milestones**; **festival** **pending** **review** **count** **trending** down. |

---

## Executive layer

### Assistant Campaign Manager

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Campaign Manager |
| **CORE RESPONSIBILITY** | **Day-to-day** **operations** **spine** when the campaign has **>1** **seat**: **coordinates** data, **calendar**, **task** **throughput**, **interns**; **backfills** **unfilled** **department** **gaps** that sit **under** them in the **map** (Data, **Ops** **leads** in this model). |
| **WORKBENCHES USED** | `workbench/page.tsx` (orchestration), `workbench/calendar`, `tasks`, `events/*` **HQ**; `voter-import` **with** **Data** **lead**; **not** default **owner** of **comms** **plans** unless **Comms** **unfilled**. |
| **TYPES OF INCOMING WORK** | **Cross-dept** `CampaignTask` **dependency** **clogs**; `CampaignEvent` **readiness** **blocks**; **Submission** backlogs that need **triage** **assignment**; **calendar** **conflicts**. |
| **DECISIONS THEY MAKE** | **Rebalance** **load** between **leads**; **approve** **task** **templates** and **ops** **cadence**; **temporary** **assignee** for **unowned** work. |
| **WHAT THEY CAN AUTOMATE** | **Recurring** **task** **templates**; **reminder** **cron** patterns (if/when); **ingest** **validation** **queues**. |
| **WHAT MUST BE REVIEWED** | **Anything** that **moves** **money** or **legal** **disclosure** (hand off to **Finance** / **Compliance** **positions**). |
| **WHAT ESCALATES UP** | **CM**-level **narrative** or **hiring** **decisions**; **unfixable** **cross-department** **deadlock**. |
| **WHAT DELEGATES DOWN** | **Data** **Manager**, **Events**, **Scheduler**, **Task/Workflow** **Manager**, **Intern** (when those seats exist). |
| **SUCCESS SIGNALS** | **Task** **completion** **velocity**; **event** **pipeline** **lag**; **data** **snapshot** **freshness**; **no** **orphan** **tasks** with **no** **position** **owner** in **rubric**. |

### Communications Director

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Campaign Manager |
| **CORE RESPONSIBILITY** | **Owns** the **messaging** **program**: **comms** **plans**, **earned** and **press** **cadence** **in** **tension** with **field** and **compliance**; **not** every **keystroke** in social—**oversees** **Email/Comms**, **Content**, **Social**, **Press**. |
| **WORKBENCHES USED** | `workbench/comms/*` (entry, `plans/*`, `broadcasts/*`, `media/*`), `workbench/social`, `workbench/email-queue` **oversight**; `review-queue` / **content** **routes** when **messaging** **risk**; `media-monitor` **with** **Press** **lead**. |
| **TYPES OF INCOMING WORK** | `CommunicationPlan` **draft** **bottlenecks**; `CommunicationSend` **failures**; `EmailWorkflowItem` **re** **messaging** **risk**; `ConversationOpportunity` **narrative**; **opposition** **material** before **release** (with **Oppo**). |
| **DECISIONS THEY MAKE** | **Narrative** **priority** **order**; **when** a **message** is **ready** for **field** to **use**; **press** **response** **stance**; **rejects** or **sends** **back** **drafts** from **managers** **below** them. |
| **WHAT THEY CAN AUTOMATE** | **A/B** **structure** in **comms** **tooling**; **segment** **refresh** (existing patterns); **not** **auto-approve** **Tier-2** without **product** **policy** (out of band). |
| **WHAT MUST BE REVIEWED** | **All** **broadcast**-class **sends**; **first** **contact** in **sensitive** **segments**; **press** with **legal** **hooks**. |
| **WHAT ESCALATES UP** | **CM** for **opposition** **hits** **requiring** **candidate** **voice**; **compliance** **redlines**; **reputational** **crisis** **forks**. |
| **WHAT DELEGATES DOWN** | **Email/Comms** **Manager**, **Content** **Manager**, **Social** **Manager**, **Media** **Relations**; **Oppo** (if under **this** **branch** in **org**). |
| **SUCCESS SIGNALS** | **Plan** **status** **distribution**; **send** **success** **rate**; **email** **workflow** **queue** **age**; **press** **latency** to **ack**. |

### Field Director

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Campaign Manager |
| **CORE RESPONSIBILITY** | **Geography**-aware **field** **program**: **volunteer** **pipeline**, **county** **coverage**, **local** **events** **in** **tension** with **comms**; **own** **field** **KPIs** in **workbench** **county** **and** **festival** **rails**. |
| **WORKBENCHES USED** | `workbench/page.tsx` (**county** **context**), `workbench/festivals`, `workbench/social` (field-adjacent **opps**), `asks`, `volunteers/intake` **(if** **present)**, `events/*` for **rally** **ops**; **not** the **comms** **plan** **editor** as **primary** **tool**. |
| **TYPES OF INCOMING WORK** | `ArkansasFestivalIngest` (and **similar**); **unstaffed** **county**; `VolunteerProfile` / **commitment** **gaps**; `CampaignTask` **field**-tagged; `EventRequest` / **local** **event** **suggest** flows. |
| **DECISIONS THEY MAKE** | **Resource** to **county**; **which** **local** **events** get **field** **vs** **comms** **support**; **escalation** to **comms** for **message**. |
| **WHAT THEY CAN AUTOMATE** | **Template** **tasks** for **event** **readiness**; **county** **rollup** **metrics** (read models). |
| **WHAT MUST BE REVIEWED** | **Voter** **data** in **the** **field** (exports); **safety** **for** **door** programs. |
| **WHAT ESCALATES UP** | **CM** for **rare** **public** **event** with **reputational** **risk**; **legal** for **event** **liability** **edge** cases. |
| **WHAT DELEGATES DOWN** | **Volunteer** **Coordinator**, **County/Regional** **Coordinators**, **Field** **Organizers**. |
| **SUCCESS SIGNALS** | **County** **coverage** **maps**; **festival** **pending** **cleared**; **task** **completion** in **field** **lanes**; **RSVP** / **commitment** **growth**. |

### Finance Director

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Campaign Manager |
| **CORE RESPONSIBILITY** | **Treasury** **discipline** and **FEC**/state **reporting** **inputs**—in **tension** with **every** **send** and **event** that **moves** **money**; **in** **RedDirt** the **repo** has **comms** and **events** but **not** a **dedicated** **finance** **workbench** (see **gaps**). *Update (FUND-1):* **target** **future** **Fundraising** **Desk** **/** **revenue** **ops** **surface** is **specified** in [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md) and **related** **FUND-1** **docs** **(blueprint** **only**; **no** `…/workbench/fundraising` **in** the **build** **yet** **).** |
| **WORKBENCHES USED** | **Mostly** **out-of-app**; **in-app:** **read** `comms` **for** **paid** **media** **hooks**, `events` for **fundraiser**-class **(if** **wired)**, `settings` / **config** for **vendors** **(if** **present)**, **any** **future** **donation** **route** **;** **future** **(FUND-1+):** **see** `fundraising-desk-foundation.md` **(call** **lists,** **KPIs,** **research** **—** all **governed** **)**. |
| **TYPES OF INCOMING WORK** | **Reporting** **deadlines** (external); **exception** on **sends** or **vendors** **(future** **tickets)**. |
| **DECISIONS THEY MAKE** | **Sign-off** on **spend** **classes**; **prohibit** **auto** **batches** that **affect** **treasury**. |
| **WHAT THEY CAN AUTOMATE** | **Reconciliation** **imports** (when **built**); **not** **unsupervised** **ACH**. |
| **WHAT MUST BE REVIEWED** | **All** **material** **disbursement**; **coordinated** **expenditure** **rules**. |
| **WHAT ESCALATES UP** | **CM** for **strategic** **spend** **tradeoffs** **vs** **field** **/** **comms**. |
| **WHAT DELEGATES DOWN** | **None** in **repo** by **default**; **bookkeeper** (future) **or** **intern** for **data** **entry** **only** with **separation** of **duties**. |
| **SUCCESS SIGNALS** | **On-time** **filing** **flags** (external); **zero** **unexplained** **send**-related **vendors** (when **mapped**). |

### Compliance Director

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Campaign Manager |
| **CORE RESPONSIBILITY** | **Legal** **and** **policy** **constraints** on **comms** and **data**; **veto** or **redline** **automation** that **bypasses** **human** on **sensitive** **paths** (aligned with **email** **queue-first** / **voter** **PII**). |
| **WORKBENCHES USED** | **Read** `workbench/comms` (for **content** **risk**), `email-queue` (for **messaging** **risk**), `voter-import` **review**; **role** is **governance** **overlay,** not a **separate** **compliance** **desk. ** *COMP-1:* **rail** in [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) **+** **`compliance.ts` **;** **paperwork** in [`compliance-paperwork-simplification-foundation.md`](./compliance-paperwork-simplification-foundation.md) **. ** *COMP-2+POLICY-1+BUDGET-1:* **first** **file** **intake** at **`/admin/compliance-documents` **(see [`compliance-document-ingest-foundation.md`](./compliance-document-ingest-foundation.md)) **,** **policy** **defaults** in [`campaign-policy-foundation.md`](./campaign-policy-foundation.md) **`policy.ts` **,** **spend** **rail** in [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md) **—** still **no** **full** **compliance** **/ budget** **workbench** **.**
| **TYPES OF INCOMING WORK** | **Exception** on **sends** with **new** **disclaimers**; **voter** **data** **export** **requests**; **opposition** **use** in **messaging**; `WorkflowIntake` with **legal** **tag** (if **product**). |
| **DECISIONS THEY MAKE** | **Approve** / **block** **go-live** for **certain** **content** and **automation** **rules**; **define** what **is** “sensitive” for **this** **campaign**. |
| **WHAT THEY CAN AUTOMATE** | **Checklist** **state** (future); **not** **auto-approve** **public** **statements** without **human** **signer**. |
| **WHAT MUST BE REVIEWED** | **All** first-time **pattern**s that **ship** to **voters** at **scale**; **voter** **file** **usage**; **earned** **media** with **legal** **exposure**. |
| **WHAT ESCALATES UP** | **CM** and **legal** **outside** **counsel** (out of **band**). |
| **WHAT DELEGATES DOWN** | **None** for **veto** **power**; **may** **train** **managers** on **rubric**. |
| **SUCCESS SIGNALS** | **No** **policy**-violating **sends** **slipping**; **audit** **trail** in **provenance** **rails** on **sensitive** **changes**. |

---

## Communications (under Communications Director in tree)

### Email/Comms Manager

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Communications Director |
| **CORE RESPONSIBILITY** | **Operates** the **messaging** **execution** **layer**: `CommunicationPlan`, **threads**, and **`EmailWorkflowItem`** **triage** in **alignment** with **queue-first** **policy** (not **replacing** **Send** with **email** **workflow** as **source** of **truth** for **provider** **state**). |
| **WORKBENCHES USED** | `workbench/comms/*`, `workbench/page.tsx` **thread** **lane**, `workbench/email-queue/*`, `inbox` **if** **used** for **staff** **mail** **(distinct** in **map)**. |
| **TYPES OF INCOMING WORK** | `EmailWorkflowItem` **(primary)**, `CommunicationThread` **/needs** **reply**; `CommunicationSend` **error**; **intake** **items** **routed** to **messaging**; `ConversationOpportunity` **(when** **handed** **off** to **outbound**). |
| **DECISIONS THEY MAKE** | **Draft** → **ready**; **which** **queue** **item** → **link** to **thread**; **reassign** **within** **comms** **(today** `assignedToUserId`). |
| **WHAT THEY CAN AUTOMATE** | **Interpretation** **pass** (E-2) **(manual** **trigger)**, **webhook** **status** **updates**; **not** **auto** **from** `EmailWorkflow` **to** **Send** in **current** **policy** **doc**. |
| **WHAT MUST BE REVIEWED** | **Every** **outbound** at **first**; **sensitive** **segments**; **reply** to **hostile** or **press**-adjacent **threads** **(with** **Press**). |
| **WHAT ESCALATES UP** | **Comms** **Director** for **messaging** **forks**; **Compliance** for **redlines**; **CM** for **rare** **narrative** **choice**. |
| **WHAT DELEGATES DOWN** | **(none** **below** this **in** **comms** **branch** in **our** **minimal** **tree;** **in** **larger** **orgs,** **specialists**). |
| **SUCCESS SIGNALS** | **Email** **workflow** **status** **throughput**; **send** **success**; **time-to-first** **response** on **threads**; **no** **orphan** **failed** **sends** **without** **ticket** **link** **(future** **rule**). |

### Content Manager

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Communications Director |
| **CORE RESPONSIBILITY** | **Long-form** and **site** **messaging** **(stories,** **editorial,** **homepage,** **blog)**; **DAM** **and** **review** **pipeline** for **on-brand** **assets** **before** **they** **feed** **comms** or **social**. |
| **WORKBENCHES USED** | `content`, `editorial`, `stories`, `blog`, `homepage`, `owned-media/*`, `review-queue` **(when** **used** for **content**), `distribution` **(if** **wires** to **outbound**). |
| **TYPES OF INCOMING WORK** | `Submission` (story) **(see** **matrix)**, `OwnedMediaAsset` **review**; **content**-typed **intakes**; **opposition** **packages** for **messaging** **(from** **Oppo**). |
| **DECISIONS THEY MAKE** | **Copy** and **asset** **approval**; **which** **asset** **lands** in **which** **plan** **slot** (with **Email/Comms**). |
| **WHAT THEY CAN AUTOMATE** | **Resize** / **transcode** **(future)**, **lint** for **style**; **not** **auto** **publish** to **voter**-facing **blast** without **Comms** **Director** **/…** **(policy)**. |
| **WHAT MUST BE REVIEWED** | **All** **public** **facing** **narrative** on **the** **site**; **endorsement** and **opposition** **claims** **(with** **Oppo/Compliance**). |
| **WHAT ESCALATES UP** | **Comms** **Director** for **message**; **CM** for **narrative** **that** **touches** **the** **candidate** **directly**. |
| **WHAT DELEGATES DOWN** | **Intern** for **asset** **prep**; **(future)** **copy** **sub-leads** **(not** **in** **repo**). |
| **SUCCESS SIGNALS** | **Review** **queue** **depth**; **asset** **latency**; **story** **publish** **cadence** **aligned** to **plan** **(when** **linked**). |

### Social Media Manager

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Communications Director |
| **CORE RESPONSIBILITY** | **Operates** **social** **monitoring** and **`SocialContentItem`**; **turns** **monitoring** **hits** into **drafts** or **handoffs** to **Email** or **intake**—**no** **blind** **auto** **outbound** to **voters** **without** **product** **policy** **(queue-first** where **sensitive**). |
| **WORKBENCHES USED** | `workbench/social/*`, `orchestrator` **(Inbound** **Content** **—** **different** **from** main **workbench,** per **orchestration** **map)**, `workbench/page.tsx` for **opps** that **cross**-link. |
| **TYPES OF INCOMING WORK** | `SocialContentItem` **(native** **+** **synced)**, `ConversationItem` / `ConversationOpportunity` **clusters**; `InboundContentItem` **(orchestrator)**, `WorkflowIntake` **create**d from **monitoring** **actions** **(when** **wired)**. |
| **DECISIONS THEY MAKE** | **Post** / **no** **post**; **which** **hit** **becomes** **intake**; **escalation** to **Press** or **Comms** **(email** **workflow**). |
| **WHAT THEY CAN AUTOMATE** | **Ingestion** from **connectors**; **clustering** **suggest**; **not** **auto** **public** **reply** without **human** **(policy** per **E** **/…**). |
| **WHAT MUST BE REVIEWED** | **Hot** **threads**; **opposition** **trolls**; **anything** **linking** **to** **voter** **data** **or** **donations**. |
| **WHAT ESCALATES UP** | **Comms** **Director** for **message**; **Press** for **reporter** **threads**; **Compliance** for **defamation** **risk**. |
| **WHAT DELEGATES DOWN** | **(future)** **community** **mods**; **volunteer** **amplifiers** **(restricted**). |
| **SUCCESS SIGNALS** | **Time-to-ack** on **opps**; **queue** **depth**; **cross-links** to **EmailWorkflowItem** or **intake** when **product** **expects** it. |

### Media Relations / Press

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Communications Director |
| **CORE RESPONSIBILITY** | **Press** **pipeline**: **`media-monitor`**, **response** to **inquiries**, **coordinating** with **Comms** **(plans)** and **Field** **(local** **earned)**; **earned** is **not** the **same** as **comms** **broadcast**. |
| **WORKBENCHES USED** | `media-monitor` **(or** `lib/media-monitor/`), `workbench/comms` for **messaging** **alignment**, **(future)** **press**-specific **list**; **inbox** if **inquiries** **land** **there** **(verify** in **org**). |
| **TYPES OF INCOMING WORK** | `ExternalMediaMention` / **alerts**; **reporter** **emails** **(routed** to **intake** **or** **email** **workflow)**, `ConversationItem` on **X**-class **(when** **monitored**). |
| **DECISIONS THEY MAKE** | **Response** or **no** **comment**; **which** **outlet** to **prioritize**; **on/off** the **record** **stance** **(with** **CM** on **big** **hits**). |
| **WHAT THEY CAN AUTOMATE** | **Mention** **digest** **cron**; **not** **auto** **statement** to **press** without **Comms+Compliance** on **sensitive** **topics** **(policy**). |
| **WHAT MUST BE REVIEWED** | **All** **quotes** **on** the **record**; **opposition** **reactive** **statements** **(Oppo+Compliance**). |
| **WHAT ESCALATES UP** | **Comms** **Director**; **CM** for **defining** **moments**; **Compliance** for **liability**. |
| **WHAT DELEGATES DOWN** | **(none** **in** **minimal** **repo** **hierarchy).** |
| **SUCCESS SIGNALS** | **Cycle** time on **inquiries**; **mention** **volume** **vs** **message** **lift**; **no** **orphan** **reactive** **moments** **without** **thread** in **comms** **or** **email** **workflow** **(future** **link**). |

---

## Field / organizing (under Field Director)

### Volunteer Coordinator

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Field Director |
| **CORE RESPONSIBILITY** | **Volunteer** **pipeline** **health**: `VolunteerProfile` **/** **intake** **paths**, `asks` **/** **recruitment** **surfaces** **in** the **map**; **converts** **interest** to **shifts** **and** **tasks** **(with** **Task/Workflow** **Manager**). |
| **WORKBENCHES USED** | `volunteers/intake` **(if** **present)**, `asks`, `workbench/social` **(recruiting)**, `tasks` **(assignment** to **field**), `workbench/page.tsx` for **rollups**. |
| **TYPES OF INCOMING WORK** | **Movement** `Submission` **types** (join/vol) **(matrix)**, `WorkflowIntake` **(vol)**, unassigned **shifts** **(if** **modeled)**. |
| **DECISIONS THEY MAKE** | **Which** **prospect** to **call**; **template** for **nurture**; **reassign** to **county** **lead** **(manual**). |
| **WHAT THEY CAN AUTOMATE** | **Drip** **(future)**, **segment** **tags**; **not** **auto** **import** to **voter** **file** from **unverified** **list**. |
| **WHAT MUST BE REVIEWED** | **PII** **exports**; **any** **text** to **voters** at **scale** **(hand** to **Comms** for **messaging**). |
| **WHAT ESCALATES UP** | **Field** **Director** for **turf** **conflict**; **CM** for **narrative** on **a** **recruitment** **drive**. |
| **WHAT DELEGATES DOWN** | **Field** **Organizers** **(turf)**; **Volunteer** **(general)** **(limited)**, **(future)**. |
| **SUCCESS SIGNALS** | **New** **Volunteer** **profiles** **per** **week**; **commitment** **coverage**; **intake** **age**. |

### County/Regional Coordinator

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Field Director |
| **CORE RESPONSIBILITY** | **Geographic** **slice** of the **map**: `County` **filters** on **workbench**, **festival** and **local** **event** **ownership**; **is** the **default** **assignee** for **field** **tasks** in **their** **territory** when **routed** **(future** **by** **countyId**). |
| **WORKBENCHES USED** | `workbench/page.tsx` **(county** **selector)**, `workbench/festivals` **(local)**, `events/*` **(local)**, `tasks` **(filtered)**, `workbench/social` **(local** **opportunities**). |
| **TYPES OF INCOMING WORK** | `ArkansasFestivalIngest` **(local)**, **county**-tagged `CampaignTask`, `CampaignEvent` **(local)**, `Submission` **(local** **team)**. |
| **DECISIONS THEY MAKE** | **Staffing** and **turf** **bounds**; **which** **local** **leaders** to **activate**; **escalation** to **Comms** for **local** **messaging** **(with** **Director**). |
| **WHAT THEY CAN AUTOMATE** | **County** **rollups** **(read** **models)**, **template** **tasks** per **festival** **(pattern** **in** **repo)**, **(future)**. |
| **WHAT MUST BE REVIEWED** | **First** **use** of **voter** **data** in **turf** **(with** **Data/Compliance**). |
| **WHAT ESCALATES UP** | **Field** **Director**; **Comms** for **messaging**; **Compliance** for **coordination** **(if** **applicable**). |
| **WHAT DELEGATES DOWN** | **Field** **Organizers** **in** **county**; **Volunteer** **(general)** **for** **event** **day** only. |
| **SUCCESS SIGNALS** | **Zero** **uncovered** **counties** (product **metric)**, **festival** **readiness** **in** **territory**; **local** **task** **overdue** **=** **0**. |

### Field Organizer

| Field | Content |
|-------|---------|
| **PARENT POSITION** | County/Regional Coordinator **(default)**; **or** **Field** **Director** in **very** **small** **orgs** |
| **CORE RESPONSIBILITY** | **Execution** on **a** **turf**: **door** and **event** **shifts**, **local** **leader** **activation**; **uses** **tasks** and **event** **HQ** as **day-to-day** **(no** **comms** **plan** **ownership**). |
| **WORKBENCHES USED** | `tasks`, `events/*` **(limited)**, `workbench/festivals` **(on** **the** **ground)**, `workbench/page.tsx` **(narrow** **county)**, `asks` for **one-to-one** **asks**. |
| **TYPES OF INCOMING WORK** | `CampaignTask` **(field)**, **local** `CampaignEvent` **(setup)**, **volunteer** **no-shows** **(as** **tasks)**. |
| **DECISIONS THEY MAKE** | **Shift** **coverage**; **which** **volunteer** to **nudge**; **local** **tactical** **no**-**gos** (with **county** **coord**). |
| **WHAT THEY CAN AUTOMATE** | **Reminders** **(if** **SMS**); **not** **voter** **outreach** **at** **scale** without **comms** **(policy**). |
| **WHAT MUST BE REVIEWED** | **All** **first**-**contact** **voter** **data** **exports**; **safety** **for** **events**. |
| **WHAT ESCALATES UP** | **County** **Coordinator** for **turf**; **Field** **Director** for **inter-county** **conflict**. |
| **WHAT DELEGATES DOWN** | **Volunteer** **(general)** for **a** **single** **event**; **(future)** **team** **leads** **(not** **in** **repo**). |
| **SUCCESS SIGNALS** | **Task** **completion** **rate**; **commitment** **fulfillment**; **no** **stale** **festival** **tasks** in **turf**. |

---

## Data / research (under Assistant Campaign Manager in map)

### Data Manager

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Assistant Campaign Manager |
| **CORE RESPONSIBILITY** | **Voter** **file** and **ingest** **(operations** of **`voter-import`**)—**right** data for **comms/field** without **leaking** **PII** **downstream** **scope**. |
| **WORKBENCHES USED** | `voter-import` **(and** `lib/…` **in** **voter** **domain)**, `insights` **(if** **not** **placeholder)**, `settings` for **data** **connectors** **(if** **any)**. |
| **TYPES OF INCOMING WORK** | **Ingest** **errors**, **file** **snapshots** **stale** **vs** **election** **calendar**; **segment** **definition** **requests** from **Comms** and **Field**. |
| **DECISIONS THEY MAKE** | **Field** **schema** and **key** **(precinct** / **county)**, **dedupe** **rules**; **which** **export** **is** **allowed** for **which** **role** **(with** **Compliance)**. |
| **WHAT THEY CAN AUTOMATE** | **Batch** **ingest** **jobs**; **validation** **scripts**; **not** **unsupervised** **append** to **production** **voter** **file** on **untrusted** **upload**. |
| **WHAT MUST BE REVIEWED** | **All** **new** **vendors**; **all** **exports**; **key** **redefinitions** that **affect** **outreach** **lists** **(with** **Comms/Compliance**). |
| **WHAT ESCALATES UP** | **ACM** for **resourcing**; **CM** for **voter** **data** that **affects** **messaging** **strategy**; **Compliance** for **jurisdiction** **(legal)**. |
| **WHAT DELEGATES DOWN** | **(future)** **data** **associates**; **Intern** for **data** **entry** **only** in **a** **sandbox** **(policy**). |
| **SUCCESS SIGNALS** | **File** **freshness**; **ingest** **error** **rate** **→** **0**; **segment** **requests** **SLA** for **comms/field** **(when** **tickets**). |

### Opposition Research Lead

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Assistant Campaign Manager **(research** **spine)**, with **narrative** **clearance** through **Comms** **/** **Compliance** (see **map** **note**) |
| **CORE RESPONSIBILITY** | Source and classify opposition intel; feed Content and Comms (no unilateral ship to voters). Public site has search/RAG; no dedicated Oppo workbench in repo (gap). |
| **WORKBENCHES USED** | **(future)** **dedicated** **(gap)**; **today:** `content` **/** **editorial** for **messaging** **handoff**, `media-monitor` for **reactive**; **(external)** **docs**. |
| **TYPES OF INCOMING WORK** | **Inquiries** that **come** as **`WorkflowIntake`**, **(future)** `Submission` for **“research** **request**,” **media** **hits** **for** **oppo** **angles**. |
| **DECISIONS THEY MAKE** | **What** **to** **recommend** as **a** **line** of **attack**; **not** **final** **copy** (Content/Comms) **(policy)**. |
| **WHAT THEY CAN AUTOMATE** | **Scraping** **ingest** **(if** **allowed** by **TOS)**, **clustering** **of** **hits**; **not** **public** **release** **without** **Comms+Compliance** **(policy**). |
| **WHAT MUST BE REVIEWED** | All public opposition claims; coordination questions (e.g. IE overlap); defamation/foreign-interference/sensitive-sourcing; anything that becomes a paid or voter-facing line (Comms + Compliance in loop). |
| **WHAT ESCALATES UP** | Comms Director and CM for what to *say*; Compliance for *whether* the release is legally safe. |
| **WHAT DELEGATES DOWN** | Intern for clipping and filing (supervised, no public voice). |
| **SUCCESS SIGNALS** | Oppo request turnaround; no unreviewed claim inside a `CommunicationPlan` or site story; (future) provenance on Oppo packets. |

### Voter Insights / Analytics

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Data Manager (default) or Assistant Campaign Manager if Data seat unfilled |
| **CORE RESPONSIBILITY** | Turn voter file and engagement data into *decisions*: cohort health, program lift, and **read** surfaces that feed Comms/Field/CM. Repo: analytics-style routes in `workbench` / `insights` (verify live vs placeholder). |
| **WORKBENCHES USED** | `insights` (if not placeholder), `voter-import` (read for definitions), workbench **cards** and **any** `analytics` route; external BI optional. |
| **TYPES OF INCOMING WORK** | “Why did segment X drop?”, A/B result interpretation, county turnout modeling requests from Field/CM. |
| **DECISIONS THEY MAKE** | What metrics the campaign treats as *leading* vs *lagging*; which dashboards block a launch (with Comms/Field). |
| **WHAT THEY CAN AUTOMATE** | Nightly rollups, deduped event counts, (future) anomaly flags—no public messaging from models alone. |
| **WHAT MUST BE REVIEWED** | Voter-PII extracts; any stat quoted to press or in paid media (Comms + Compliance). |
| **WHAT ESCALATES UP** | ACM/CM for strategic reallocation; Data Manager for data-definition disputes; Compliance for public-file usage. |
| **WHAT DELEGATES DOWN** | Intern for spreadsheet hygiene under supervision. |
| **SUCCESS SIGNALS** | Segment definitions reused across Comms and Field; fewer conflicting “truths” in workbench copy. |

---

## Operations (under Assistant Campaign Manager in map)

### Events Manager

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Assistant Campaign Manager |
| **CORE RESPONSIBILITY** | Program-level **event pipeline**: public-facing events, HQ views, and readiness (tasks) so Field and Comms are not each inventing a calendar. |
| **WORKBENCHES USED** | `events/*`, `workbench/calendar`, `workbench/festivals` (coordination with Field), `tasks` (readiness), links from `workbench/page.tsx` calendar lanes. |
| **TYPES OF INCOMING WORK** | `CampaignEvent` blocks, `EventRequest` (if used), `ArkansasFestivalIngest` that needs a campaign touchpoint, `CampaignTask` tied to event readiness. |
| **DECISIONS THEY MAKE** | Which events get campaign resources; cut lines for venues and staffing asks; hand messaging asks to Comms, turf asks to Field. |
| **WHAT THEY CAN AUTOMATE** | Recurring event shells, template `CampaignTask` bundles for recurring formats (align with existing task patterns). |
| **WHAT MUST BE REVIEWED** | First-time formats with legal/venue liability; events that interact with money or sensitive attendance (Compliance + Finance). |
| **WHAT ESCALATES UP** | CM for major megaphone events; Field Director for turf-heavy rallies; Comms for narrative timing. |
| **WHAT DELEGATES DOWN** | County/Field organizers for on-site execution; Volunteer (general) for day-of. |
| **SUCCESS SIGNALS** | Event readiness flags green on time; no orphan events without task coverage. |

### Scheduler / Calendar Manager

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Assistant Campaign Manager |
| **CORE RESPONSIBILITY** | **Time** conflict resolution: campaign calendar of record vs comms windows and event holds—*coordination* without owning every plan. |
| **WORKBENCHES USED** | `workbench/calendar`, `events/*` (holds and deadlines), Comms for send windows (read-only in plans). |
| **TYPES OF INCOMING WORK** | Double-booked principles, blackout windows, debate prep holds, media hits that need calendar blocks. |
| **DECISIONS THEY MAKE** | What gets the “hard” hold on the calendar; when to ask Comms to move a send (process, not DMs in the repo). |
| **WHAT THEY CAN AUTOMATE** | ICS or internal reminders (if/when integrated); not auto-moving `CommunicationSend` without Comms. |
| **WHAT MUST BE REVIEWED** | Anything that implies candidate time or public commitment. |
| **WHAT ESCALATES UP** | CM for principal time; Comms Director for message-day tradeoffs. |
| **WHAT DELEGATES DOWN** | Intern for data entry on calendar. |
| **SUCCESS SIGNALS** | Fewer “surprise” same-day comms+event collisions; clear upcoming-week view for CM hub. |

### Task/Workflow Manager

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Assistant Campaign Manager |
| **CORE RESPONSIBILITY** | **Workflow throughput** *across* departments: `CampaignTask` hygiene, `WorkflowIntake` that is ops-shaped (not Comms copy), and handoffs between Field and data. |
| **WORKBENCHES USED** | `tasks`, intakes and monitoring that create `WorkflowIntake` (see `workbench-build-map`), `workbench/page.tsx` for “what is blocked” cards. |
| **TYPES OF INCOMING WORK** | Overdue `CampaignTask`, `WorkflowIntake` stuck in no-owner state, cross-team dependencies surfaced as tasks. |
| **DECISIONS THEY MAKE** | Default assignee and priority order; when to *force* a handoff to Comms/Field/Compliance by creating the right object (intake vs email workflow vs task). |
| **WHAT THEY CAN AUTOMATE** | Template task creation from `CampaignEvent` (patterns already in repo for event readiness), recurring checklist tasks. |
| **WHAT MUST BE REVIEWED** | Task templates that send communications or touch voter data (Comms + Data + Compliance). |
| **WHAT ESCALATES UP** | ACM/CM for priority disputes between departments. |
| **WHAT DELEGATES DOWN** | Department leads to clear their sub-queues. |
| **SUCCESS SIGNALS** | Median time-to-first-owner on intakes; overdue task count trending down; fewer duplicate tasks for the same real-world object. |

---

## Entry / scale layer

### Intern (general)

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Assistant Campaign Manager (or department lead for specialized interns) |
| **CORE RESPONSIBILITY** | **Supervised** execution: prep assets, data entry, monitoring lists—**no** unsupervised public voice or send authority. |
| **WORKBENCHES USED** | Subset of `owned-media` (upload/prep), `tasks` (assigned only), `content` (draft in sandbox if product allows), *no* default access to `comms` broadcast or `voter-import` without Data/Compliance pairing. |
| **TYPES OF INCOMING WORK** | `CampaignTask` items explicitly scoped for interns; research tickets as `WorkflowIntake` or task. |
| **DECISIONS THEY MAKE** | Low-risk formatting and scheduling *drafts* only—never final. |
| **WHAT THEY CAN AUTOMATE** | None that touches voters without human sign-off. |
| **WHAT MUST BE REVIEWED** | Everything they would publish, export, or send. |
| **WHAT ESCALATES UP** | Their manager lead (ACM/department). |
| **WHAT DELEGATES DOWN** | N/A. |
| **SUCCESS SIGNALS** | Tasks closed without manager rework loops; no policy incidents. |

### Volunteer (general)

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Volunteer Coordinator (default) → Field Director → Campaign Manager (roll-up) |
| **CORE RESPONSIBILITY** | **Edge** actor: execute shifts and one-to-one work with **no** org-wide workbench in v1; represented in DB as `VolunteerProfile` / `User` and tasks assigned to a known person. |
| **WORKBENCHES USED** | **Future** limited or volunteer portal (not in current inventory for mass volunteers); **today** may receive **no** admin board—**tasks** and **comms to volunteer** are out of band. System contract: *they do not* hold Campaign Manager or Comms Director scope. |
| **TYPES OF INCOMING WORK** | Shift reminders, `CampaignTask` assigned to them, (future) `Submission` as volunteer interest already in matrix. |
| **DECISIONS THEY MAKE** | Accept/decline shifts; *local* door tactics within Field SOP. |
| **WHAT THEY CAN AUTOMATE** | Reminders; not voter outreach with campaign-wide messaging without Comms. |
| **WHAT MUST BE REVIEWED** | First time using voter lists or scripts with PII. |
| **WHAT ESCALATES UP** | Field Organizer → County/Regional → Field Director for turf and safety. |
| **WHAT DELEGATES DOWN** | N/A. |
| **SUCCESS SIGNALS** | Commitment fulfillment rate; low no-show; Field tasks completed on time. |

---

## Optional: Platforms / Integrations (repo-supported)

| Field | Content |
|-------|---------|
| **PARENT POSITION** | Assistant Campaign Manager or Communications Director (split by org) |
| **CORE RESPONSIBILITY** | Keep `settings/*`, `platforms`, and integration keys healthy so **automation** (webhooks, senders, social connectors) is **reliable**—*not* narrative ownership. |
| **WORKBENCHES USED** | `settings/*`, `platforms` (see workbench map). |
| **TYPES OF INCOMING WORK** | API failures, OAuth expiry, broken webhook, misconfigured segment connector. |
| **DECISIONS THEY MAKE** | **When** to rotate keys; *who* to page (Comms vs Data) for domain-specific breakages. |
| **WHAT THEY CAN AUTOMATE** | Health checks, alerting (future). |
| **WHAT MUST BE REVIEWED** | Any new integration that reads voter or message content (Compliance + Data/Comms). |
| **WHAT ESCALATES UP** | CM for vendor spend; Compliance for new data processors. |
| **WHAT DELEGATES DOWN** | N/A. |
| **SUCCESS SIGNALS** | Webhook and send error rates within known bounds; no silent credential drift. |

---

*Last updated: Packet ROLE-1.*