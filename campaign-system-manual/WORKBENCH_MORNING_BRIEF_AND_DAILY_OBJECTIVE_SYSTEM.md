# Workbench — morning brief and daily objective system (Manual Pass 5I + 5J + 5K + 5L)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Doctrine** for **how** **every** **Workbench**-**facing** **dashboard** **should** **open** **with** a **calm,** **instructive** **morning** **brief** **—** **not** a **shipped** **UI** **claim,** **not** a **bypass** of **`APPROVAL_AUTHORITY_MATRIX` ** **or** **PII** **policy** **(see** `USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS` **,** `playbooks/ROLE_KPI_INDEX` **,** `MANUAL_INFORMATION_...` **§**46** **). **

**Ref:** `WORKBENCH_OPERATOR_RUNBOOK.md` · `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md` · `CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md` · `DASHBOARD_OBJECTIVE_AND_GET_INVOLVED_CARD_SYSTEM.md` · `WORKBENCH_DAILY_BRIEF_TEMPLATE_LIBRARY.md` · `DAILY_APPROVAL_LAUNCH_AND_TASK_ROUTING_SYSTEM.md` · `TASK_FLOW_FORECASTING_AND_HUMAN_WORK_PLAN.md` · `HUMAN_INTERACTION_TASKS_IN_EVERY_BRIEF.md` · `ADVANCE_TASK_BUY_IN_AND_ESCALATION_LADDER_SYSTEM.md` · `LEARNING_CULTURE_AND_COMMUNITY_BUILDING_SYSTEM.md` · `MANUAL_TO_DEVELOPMENT_BLUEPRINT_AND_RETURN_TO_CODE_PLAN.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§**46,** §**47,** §**48,** §**49) **·** `SYSTEM_READINESS_REPORT.md`

**Sequencing:** **Ask** **Kelly** **first**-**release** **engineering** **(5H) ** **stays** **first** **before** **unrelated** **major** **work;** **this** **file** **designs** **Work**bench **briefs** **and** **objectives** **as** **the** **next**-**after**-**v1** **/ ** **parallel** **ops** **foundation** **(see** `ASK_KELLY_LAUNCH_PRIORITY_...` **, **`MANUAL_PASS_5I_COMPLETION_REPORT` **). **

---

## 1. Morning brief philosophy

- **Every** **role**-**gated** **dashboard** should **teach** **what** **matters** **today** **—** not **a** **wall** of **metrics** **. ** **  
- **No** **user** should **wonder** **“** **what** **now?** **”** for **long**; **one** **primary** **action** per **day** is **enough** **(with** **overflow** **in** **tasks) **. ** **  
- **Calm,** **action**-**oriented,** **plain** **English**; **not** **shame,** not **0**–**6** on **a** **volunteer** **card** **(see** **5C) **. ** **  
- **Instructive,** not **noisy: ** “****What** **changed**”** **and** “****what** **to** **avoid**”** **beat** a **laundry** **list** **. **

---

## 2. Briefing levels (all role-aware)

| Level | Who | Primary reader |
|--------|-----|----------------|
| **Campaign**-**wide** | **Owner** / **CM** (aggregated) | **Leadership** **slice,** **not** **voter** **row** **detail** **. ** ** |
| **Candidate** | **Candidate** + **CM** / **advance** | **Public**-**facing** **/ ** **decision** **(no** **VFR) **. ** ** |
| **CM** | **CM** | **P0,** **approvals,** **blocks** **. ** ** |
| **Field** | **Field** **manager** / **regional** | **Capacity,** **events,** **honest** **OIS,** not **invented** **precinct** **heat** **. ** ** |
| **Volunteer** **coordinator** | **VCoord** | **Aging** **stale,** **Pathway,** not **dox** **. ** ** |
| **Comms** **/ ** **MCE** | **MCE** **+ ** **LQA** **path** | **Queue** **depth,** **not** **auto**-**send** **. ** ** |
| **Finance** **/ ** **treasurer** | **R2+** **/ ** **treasurer** | **Reconciled,** no **“** **top** **donors** **in** a **public** **brief) **(see** **3H) **. ** ** |
| **County** **coordinator** | **County** point | **County**-**ladder,** not **a** **fake** **map** **(3D) **. ** ** |
| **Power** **of** **5** **/ ** **volunteer** | **Member** / **P5** **lead** | **One** **next** **relationship** **action** **(P5) **. ** ** |
| **Ask** **Kelly** **/ ** **suggestion** **admin** | **Triage** **owner** (MI) | **New** **/ ** **routed,** not **GOTV** **persuasion** **(5H** **+ ** `SEGMENTED_` **§**22) **. ** ** |
| **Beta** **feedback** **admin** | **Same** or **separate** **(MI) ** | **Status** **(if** **allowed) **, **not** a **public** **argument** **(5H) **. ** ** |

---

## 3. Every morning brief should include (structure)

- **Today’s** **objective** **(one** **line) **. ** **  
- **This** **week’s** **objective** **(one** **line) **. ** **  
- **This** **month’s** **objective** **(one** **line) **. ** **  
- **Top** **3** **priorities** **(or** **fewer) **. ** **  
- **What** **changed** **since** **yesterday** **(honest) **. ** **  
- **What** **is** **blocked** **(who** **unblocks) **. ** **  
- **Who** **needs** **follow**-**up** **(roles,** not **a** **voter** **row) **. ** **  
- **What** **needs** **approval** **(matrix) **. ** **  
- **What** **can** **be** **done** in **~**15** **minutes** **. ** ** **  
- **What** **can** **be** **done** in **~**1** **hour** **. ** ** **  
- **What** **should** **not** **be** **touched** **today** **(risk** / **LQA) **. **

---

## 4. Data sources (when product exists; design)

- `WorkflowIntake` · `CampaignTask` · **Comms** **/ ** `CommunicationPlan` **/ ** `EmailWorkflowItem` **(as** **wiring** **exists) ** · `CommunicationThread` ** · `CampaignEvent` ** / ** **calendar** ** · **Ask** **Kelly** **suggestion** **/ ** **packet** **queues** **(5H) ** · **treasurer-**blessed **finance** **flags** (aggregates) · **Field** **reports** (sanitized) · **P5** **activity** **(where** **modeled) **. **

**Not** a **raw** **firehose: ** see **`CONTINUOUS_CAMPAIGN_...` **. **

---

## 5. Safety (non-negotiable)

- **No** **raw** **PII** in **a** **general** **brief** **(names** **/ ** **phones** in **R2+** / **VFR** **only) **. ** **  
- **No** **voter** **rows** or **donor** **rows** in **a** **non**-**R2** **view** **. ** ** **  
- **No** **stack** **traces,** **internal** **error** **strings,** or **0**–**6** on **a** **public** **/ ** **vol** **face** **(5C/5E) **. ** **  
- **No** **invented** **“** **we’re** **live** **everywhere** **”** **(OIS** **/ ** **demo** **mixed;** verify) **(see** `SYSTEM_READINESS_...` **). ** **  
- **Use** **“** **coming** **soon**”** or **TBD** **where** **the** **build** does **not** **match** the **SOP** **(honesty) **. **

---

## 6. Sample morning briefs (stylized; no PII, no real rows)

*Replace* **bracketed** **placeholders** *with* **system**-**sourced,** **RACI**-**blessed* **slices* **. **

### 6.1 Candidate

- **Today:** *Review one site section; one thank-you or delegation.*  
- **Week:** *Tie public calendar to vetted comms; clear one packet.*  
- **Month:** *Finish [priority theme] in voice with MCE.*  
- **Top** 3, **Changed,** **Blocked,** **Approvals,** 15m / 1h, **Do** **not** **touch: ** *high-impact publish without MCE+impact triage* **(see** 5G) **. **

### 6.2 CM

- **P0** **count,** **oldest** **stuck** **(no** **names** in **a** **model**-**facing** **line) **, **LQA** **nudge** **. ** **  
- **15m:** *Sweep P0* **. ** 1h: *Triage* **block** *with field lead* **. ** **Do** **not** *approve contrast without O+C path* **. **

### 6.3 Volunteer coordinator

- *Stale* **>**48h* **/ ** *Pathway* **bottlenecks* **(counts) **, *one* **VCoord* **nudge* **. **

### 6.4 County coordinator

- *OIS* **honest* **gaps* **, *one* **acquisition* **/ ** *event* *owner* **. **

### 6.5 Communications (MCE)

- *Queue* **depth* **(types) **, *not* **ship* **from* **a** *chat* *without* **LQA* **. **

### 6.6 Beta feedback admin

- *New* **/ ** *needs* *detail* **(counts) **, *routed* *to* **comms* **/ ** *product* *per* **5H* **, *no* **public** *debate* **. **

---

## 7. Daily approval launch (Pass 5J)

The **morning** **brief** is the **suggested** **day**; **authorized** approvers (per `playbooks/APPROVAL_AUTHORITY_MATRIX.md`) use **`DAILY_APPROVAL_LAUNCH_AND_TASK_ROUTING_SYSTEM.md` ** to **review,** **approve,** **reassign,** **schedule,** **park,** and **lock** the **day’s** **operating** **focus** for **internal** **work** only. **Public** **sends,** **spend,** **exports,** and **LQA**-**gated** **publishes** are **out** of **this** **gate;** the brief **does** **not** **ship** the **org** **. **

---

## 8. Task forecast in the brief (Pass 5J)

Every **brief** should **include** an **“** **Upcoming** **task** **flow** **”** **or** **equivalent** **(today** / **next** **72h** / **this** **week** / **watch** **list) ** as **a** **planning** **aid,** not **a** **promise** **—** see **`TASK_FLOW_FORECASTING_AND_HUMAN_WORK_PLAN` **. **

---

## 9. Mandatory human interaction block (Pass 5J)

Every **brief** **includes** a **“** **Human** **Follow**-**up** **”** **section** **per** **`HUMAN_INTERACTION_TASKS_IN_EVERY_BRIEF` ** (at **least** one **role**-**safe** **action** **unless** **exempt** **as** **documented) **. **

---

## 10. “Approval sets the day in motion” (doctrine)

**Approving** the **day** (Pass **5J) ** is **the** **internal** **go**-**signal** for **routed** **work** under **RACI** **: ** **tasks** may **be** **started,** **owners** **notified,** and **`WorkflowIntake` ** / **`CampaignTask` ** **updated** **with** an **audit** **trail. ** It **is** **not** **a** **substitute** for **MCE+** on **outbound,** **treasurer+** on **$** **, ** **counsel+** on **contrast,** or **VFR** **/ ** **export** **gates** **. **

---

## 11. Unclaimed asks, upcoming asks, escalation watch (Pass 5K)

**Role**-**gated** **briefs** should **include** an **escalation**-**safety** **slice** (counts, **not** **names** in **a** **general** **brief) **: **

- **Unclaimed** **asks** **(past** **window) **— **routed** per **`ADVANCE_...` **. ** ** ** ** ** ** ** ** **  
- **Upcoming** **asks** **(in** **the** **ask**-**to**-**claim** **pipeline) **. ** ** ** ** ** ** ** ** ** **  
- **Escalation** **watch** **(items** **nearing** **ladder** **or** **P0) **. **

**Not** a **shame** **list;** **not** **voter** **/ ** **donor** **rows. **

---

**Last updated:** 2026-04-27 (Pass 5I + 5J + 5K + 5L)
