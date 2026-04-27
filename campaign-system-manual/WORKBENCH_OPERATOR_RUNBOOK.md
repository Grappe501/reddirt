# Workbench operator runbook (Manual Pass 5)

**Lane:** `RedDirt/campaign-system-manual`  
**Audience:** **Admin** / **operator**, **CM**, leads who share queue duty  
**Public vocabulary:** **Campaign Operating System**, **Workbench**, **Pathway Guide**, **Organizing Guide** — not “**AI**” in public copy. **Internal** `metadata` on `WorkflowIntake` may contain classification keys — do **not** restate as public “scores” on people.

**Canonical refs:** `workflows/TASK_QUEUE_AND_APPROVALS.md` · `playbooks/TASK_TEMPLATE_INDEX.md` · `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `playbooks/ESCALATION_PATHS.md` · `playbooks/DASHBOARD_ATTACHMENT_RULES.md` · `SYSTEM_READINESS_REPORT.md`  
**Not** a replacement for `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` or treasurer/counsel **truth**.  
**Pass 5I / 5J:** `WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM.md` · `DASHBOARD_OBJECTIVE_AND_GET_INVOLVED_CARD_SYSTEM.md` · `WORKBENCH_DAILY_BRIEF_TEMPLATE_LIBRARY.md` · `THANK_YOU_CARD_AND_APPRECIATION_WORKFLOW.md` · `DAILY_APPROVAL_LAUNCH_AND_TASK_ROUTING_SYSTEM.md` · `TASK_FLOW_FORECASTING_AND_HUMAN_WORK_PLAN.md` · `HUMAN_INTERACTION_TASKS_IN_EVERY_BRIEF.md` (design only — not a shipped daily brief) · MI **§**46**–**47

---

## 1. What Workbench is and is not

| Workbench **is** | Workbench **is not** |
|------------------|----------------------|
| Unified **open-work** list (`open-work`) merging intakes, tasks, email queue items, comms threads, festival review | A **fully automated** “strategy engine” that decides contrast, spend, or audiences |
| **Primary** **staff** home for **triage** when DB is up (`/admin/workbench`) | **Guaranteed** **iPad**-perfect UI for every sub-route — verify device before long sessions (`IPAD_MOBILE...`) |
| **Spine** for **`POST` `/api/forms`** → `WorkflowIntake` (when configured) | **Substitute** for **bank** / **FEC** / **filing** **systems** — money **truth** = treasurer + `FinancialTransaction` **CONFIRMED** rules (3H) |
| A place to **link** intakes to **comms** plans and **events** with human judgment | A place to **show** **row**-level **voter** **data** to **untrained** **volunteers** — **forbidden** by policy |

**Honest product status (Pass 5):** Intake + open-work + tasks are **mature** in code terms (`SYSTEM_READINESS_REPORT.md`). **Not** every **role**-specific **dashboard** or **GOTV** / **ED** “command” surface is **shipped** or **audited** to **depth**; **OIS** mixes **live** and **placeholder**; **voter** **UIs** require **DPA** + training for “production-grade.” **Sliders** and **full** **strategy** **UI** from Pass **4B** = **design** + **SOP** until a **separate** **build** **completes**.

### Start of day: morning brief rhythm (Pass 5I — when built)

- **First** **open** of **Workbench** **(or** **#ops** **summary) ** should **land** in **a** **“** **today** / **this** **week** / **this** **month** **”** **frame** + **P0** **/ ** **blocked** / **15m** **/ ** **DNT,** not **a** **stack** **of** **raw** **errors** (see `WORKBENCH_MORNING_BRIEF_...`, `USER_FRIENDLY_...`). **Emulate** with **a** **one**-**page** **doc** **or** **standup** **if** the **UI** is **not** **live** **(MI** **§**46) **. **

### Start of day: daily approval launch (Pass 5J — when built; emulate if not)

- **After** the **brief** is **read,** **run** the **“** **approve** **the** **day** **”** **step** per `DAILY_APPROVAL_LAUNCH_...` **(RACI** **+ **`APPROVAL_AUTHORITY_MATRIX` **). ** **  
- **No** **work** **starts** before **P0** **/ ** **approval** **sweep: ** do **not** **start** **new** **discretionary** **owned** **work** **until** **P0** **triage** is **touched** **and** the **day** **(or** **role** **slice) ** is **Approved** **for** **today** **/ ** **adjusted** **per** **5J** **(same** **spirit** as **§**2** **“** **no** **new** **work** **before** **P0** **”** **, ** **extended** to **the** **brief** **+ ** **routing) **. **

---

## 2. Daily open-work triage rhythm

| Block | Time (default) | Owner | Do |
|-------|----------------|--------|-----|
| **Open sweep** | First 20–30 min (CM or assigned admin) | CM | Open `/admin/workbench`; **sort** by **age** and **P0**; **no** new work **started** before **P0** **queue** is **touched** |
| **Triage** | Mid-morning 45–60 min | CM + comms/field as needed | Each **PENDING** `WorkflowIntake`: **IN_REVIEW** or **assign** or **ask**; **duplicates** **merged** in **SOP** (manual) |
| **Re-sweep** | After lunch 15 min | CM | Stuck **>SLA** (see **§6**; **TBD** in MI **§**39) **→** `ESCALATION_PATHS` |
| **EOD** | Last 20 min | CM | **Close** or **date** all items **touched** today; **parking** **lot** (§8) only with **date**; **log** handoffs in **task** or **intake** **note** — **not** in **unlogged** DMs (§9) |

---

## 3. Weekly leadership rhythm

| When | What |
|------|------|
| **Mon** | **Capacity** check: V.C., field, comms, **compliance** **flags**; **set** WIP (§7) for the week |
| **Mid-week** | **72h** **tour** / **meeting** **follow-up** **audit** (if meeting program active) — TT-10 class |
| **Fri (or set day)** | **Locked** **baseline** **review** (see `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md`) if strategy program exists; **KPI** **truth** = treasurer + V.C. **definitions** — **not** **simulation** only |
| **Weekly** | **Risk** **register** (CM **+** **owner**): legal, $, PII, **contrast** — **R/Y/G** in `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md` |

---

## 4. Queue types (what appears in open-work)

| Type | System object | Default operator action | Approval hook |
|------|---------------|-------------------------|--------------|
| **Form intake** | `WorkflowIntake` (from `/api/forms`) | Triage → **convert** to **comms** / **task** / **event** or **decline** with reason | PII, **$** ask, **contrast** → `APPROVAL_AUTHORITY_MATRIX` |
| **CampaignTask** | `CampaignTask` | Assign or complete; **link** to **evidence** | Per template TT-xx |
| **Email workflow** | `EmailWorkflowItem` | Review, reply, or route | Comms/CM |
| **Comms** **plans** / **drafts** | `CommunicationPlan`, drafts | NDE/MCE path | `APPROVAL_AUTHORITY_MATRIX` (public **message** rows) |
| **Social** **threads** | `CommunicationThread` (actionable) | **Monitor**; **defect** to comms if risk | MCE/NDE |
| **Events** / **calendar** | `CampaignEvent`, GCal SOP | Reconcile; **no** **ghost** **public** **events** | T when **$**; candidate when **time** **risk** |
| **Festival** **ingest** | **Pending** festival review in open-work | **Approve** or **reject** **with** **reason** | Field + CM |
| **Finance** / **compliance** | `FinancialTransaction` **DRAFT** / flags; `ComplianceDocument` | **T** = **confirm**; **not** in **“done”** for **$** outflow **without** T | T + C as policy |

**Cross-ref:** `TASK_QUEUE_AND_APPROVALS.md` **§** end-to-end table.

---

## 5. Intake aging rules (default until Steve sets in MI §39)

| Age | Bucket | Action |
|-----|--------|--------|
| **&lt;24h** | Fresh | Triage; **P0** = **fraud/PII/press**-adjacent (CM **same** day) |
| **24–72h** | Risk | **CM** or **assignee** **must** **pick** or **reassign** |
| **&gt;72h** | Stale | **CM** **escalation**; **if** no owner → `ESCALATION_PATHS` (owner for break-glass) |
| **&gt;7d** | Exception | **Owner** **review**; **not** “**quiet** **close**” **—** **document** **decline** or **convert** |

*Replace numbers when MI §39 locks SLA.*

---

## 6. WIP limits by role (defaults — adjust with MI §39)

| Role / queue | Default max **open** **owned** items | Breach action |
|--------------|----------------------------------------|---------------|
| **CM (total triage WIP)** | 25 **actionable** **stops** (not all rows in DB) | Stop new **ad-hoc** projects; **owner** re-prioritizes |
| **V.C.** | 15 **active** follow-ups in **own** name | V.C. **+** **CM** reassign or **punt** to **parking** **lot** (§8) |
| **Comms** / **NDE** | 8 **in-edit** **waves** with **defects** | **MCE** **triage**; **drop** a **non**-**ship** |
| **Field** | 6 **turf** **preps** without **debrief** | Field **+** **CM** **close** or **reassign** |
| **Single** **intake** **assignee** | 10 **in-review** on **their** name | Reassign to **pooled** **admin** |

**Rule:** WIP = **work you** **touched** **or** **own**; **archived** **intakes** do **not** count.

---

## 7. Parking lot rules (must not be infinite)

- **Format:** A **dated** `CampaignTask` with title `PARK: <short topic>` or **separate** **ops** **doc** (owner-approved).  
- **Max age:** 14 days in **PARK** without **decision** **→** **owner** **resolves** or **deletes** **scope**.  
- **No** “**we**’ll** **get** **to** **it**” in **Slack** **without** a **dated** **Workbench** **or** **task** **anchor**.

---

## 8. Assignment rules

- **Intake** **first** **touch:** **CM** or **designated** **admin**; **county**-**tagged** intakes go to **V.C.**/field **per** `TASK_QUEUE` **RACI**.  
- **No** “**silent**” **reassign** — **note** the **new** **owner** and **reason** in **intake** or **task** **body** (audit).  
- **Sick** / **unavailable** **owner:** **CM** **reassigns** same day; **no** **P0** **sitting** 24h unowned.

---

## 9. Escalation rules

- Use **`playbooks/ESCALATION_PATHS.md`**. **Quick** **triggers**  
  - PII misfire → **data** + **compliance** path + **O** if public  
  - **$** over threshold (internal) → **T** + **O**  
  - **Crisis** comms → **O** + **C**; **M** **coordinates** **execution**  
- **Not** a **separate** **in-app** “**Escalate**” **for** every **row**; **use** **task** or **@** in **governed** **comms** + **log**.

---

## 10. Closeout rules (definition of done)

- **Intake:** `CONVERTED` or **archived** **with** **reason**; **link** to **outcome** (task id, `CommunicationPlan` id, `CampaignEvent` id, or **decline**).  
- **Task:** **Done** = **all** checkboxes in **template** (TT-xx) + **if** $ **=** `FinancialTransaction` **CONFIRMED** **or** **explicit** “**no** **spend**” **decision** **logged**  
- **Comms** **ship:** NDE/ship log **+** **no** **defects** in **MCE** **if** that’s **SOP**  
- **Never** “**closed**” **by** **deleting** **—** `MANUAL_...` and **compliance** **favor** **archive** and **log**

---

## 11. What must never happen in chat / DMs

| Never | Instead |
|-------|---------|
| **Final** $ **approval** | Treasurer path + `FinancialTransaction` **CONFIRMED** |
| **Voter** **row** or **list** in **iMessage** / **text** to **unapproved** | Governed **export** + `APPROVAL_AUTHORITY_MATRIX` |
| “**Ship** the **ad**” **with** no **LQA** | **T**+**C**+**M**+**O** per matrix |
| **PII** **on** **screenshots** to **all**-**volunteer** **channels** | **Redact**; **use** **aggregate** in **OIS** only |
| **Strategy** “**locked**” **only** in **DM** | `STRATEGY_TO_TASK_...` **+** **dated** **task** or **meeting** **minutes** |

---

## 12. Checklists

### 12.1 Morning (operator on duty)

- [ ] **Open** **health:** DB **up**; **if** 503 on forms, **ack** in **#ops** (no PII)  
- [ ] **P0** **sweep** **(no** **new** **work** **before** **this** + **5J** **daily** **approval** **where** **used) **: ** **press**, **fraud** **suspect**, **contrast** **leaks** **→** comms+CM  
- [ ] **Stale** **&gt;72h** intakes **n**= **counted**; **oldest 5** **assigned** or **escalated**  
- [ ] **Calendar** **ghosts** (events **TBD** **without** **owner**): **0** or **filed** **under** `CampaignEvent` **SOP**  
- [ ] **Pass** **5J:** **skim** **upcoming** **task** **flow** (today / 72h / week / watch) **per** `TASK_FLOW_...` **(honest) **; **confirm** **human** **follow**-**up** **line** **exists** in **brief** **or** **stand**-**in** **ops** **doc** **(see** `HUMAN_INTERACTION_...` **). **

### 12.2 Midday

- [ ] **Field**+**V.C.** **sync** (15 min) **or** **async** **note** in **task** `FIELD-SYNC-YYYY-MM-DD`  
- [ ] **Comms** **defects** from **MCE/NDE** **review** **&lt;** team **WIP** cap (§6)

### 12.3 Evening (last block)

- [ ] **EOD** handoff **line** in **#ops** or **task** **comment:** **N** P0, **M** P1, **K** new **tickets** **tomorrow**  
- [ ] **No** **unowned** P0s  
- [ ] **Pass** **5J:** **note** what **moved** **in** the **72h** **/ ** **week** **forecast;** **re**-**date** or **reassign** **stale** **human**-**follow**-**up** **lines** **(see** `TASK_FLOW_...` **+ **`HUMAN_INTERACTION_...` **). **

### 12.4 Weekly (Friday or fixed)

- [ ] **Parking** lot **&lt;** 14d **or** **cleared**  
- [ ] **KPI** **sources** **labeled** (treasurer, **not** only **simulation**)  
- [ ] **Risk** **R/Y/G** **with** **owner** **per** `CM_DAILY_...`  

---

## 13. Views: CM, owner, V.C., comms, field

| View | Primary surface | What they open first | Pass 5 note |
|------|-----------------|----------------------|-------------|
| **CM** | Workbench + `/admin/tasks` | **P0** intakes, **TTF** for **V.C.**-owned **stops** | **Strategy** **Preview** in **docs** or **sim** **sheet** — **lock** in **meeting** **per** 4B |
| **Owner** | All **surfaces** (policy) + **break**-**glass** | **Risk** **+** **$** **floor** | **Not** to **bypass** **T** for **spend** |
| **V.C.** | Workbench (assigned) + **V.C.** **queue** in **task** | **TT-01/02/03** **stuck** | **WIP** §6 |
| **Comms** / **NDE** | NDE+comms+ **Workbench** for **routed** **items** | **Defect** **+** **ship** **queue** | **LQA** in **matrix** |
| **Field** | OIS + **tasks** + **event** | **Turf** **prep** **TT-25,** **signs** **TT-26** | **No** **voter** **rows** in **public** **screens** |

---

**Last updated:** 2026-04-27 (Pass 5 + 5I + 5J)
