# Daily approval launch and task routing system (Manual Pass 5J)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Doctrine** for turning the **morning Workbench brief** from **informational** into a **daily approval and routing launchpad** — **not** a shipped feature claim, **not** a bypass of `playbooks/APPROVAL_AUTHORITY_MATRIX.md`, `playbooks/ESCALATION_PATHS.md`, PII policy, or treasurer/comms authority.

**Ref:** `WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM.md` · `WORKBENCH_DAILY_BRIEF_TEMPLATE_LIBRARY.md` · `WORKBENCH_OPERATOR_RUNBOOK.md` · `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md` · `TASK_FLOW_FORECASTING_AND_HUMAN_WORK_PLAN.md` · `HUMAN_INTERACTION_TASKS_IN_EVERY_BRIEF.md` · `ADVANCE_TASK_BUY_IN_AND_ESCALATION_LADDER_SYSTEM.md` (Pass 5K) · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§47, §48)

---

## 1. Daily approval launch (concept)

**Daily approval launch** = the **explicit moment** (after the brief is read) when **authorized leadership** (per RACI) **confirms, adjusts, or rejects** the **day’s operating plan** **before** that plan is treated as **active internal work** for the org.

- The brief **suggests** priorities, owners, and timing; **approval** **commits** the org to a **governed** set of **internal** actions (tasks, reassignments, follow-up windows) **subject** to the rules below.  
- **No** public audience sees “approval” as **permission to ship** — external sends, spend, and legal/compliance actions stay on **their** **matrix** paths.

---

## 2. “Approve the day” workflow

| Step | Action |
|------|--------|
| 1 | **Review** the **morning brief** (objectives, P0, blocks, DNT, human follow-ups, forecast — see 5I + `TASK_FLOW_...` + `HUMAN_INTERACTION_...`). |
| 2 | **Approve priorities** (top 3 or fewer) or **edit** the list with **brief rationale** in the **audit** surface (task note, intake log, or ops doc as used today). |
| 3 | **Approve or reject** **suggested routing** (which queue, which **role** owner) for items the brief **proposes** to move. **Reject** = **parking** or **escalation**, not silence. |
| 4 | **Reassign** **owners** where RACI and capacity require it — see **§5**. |
| 5 | **Schedule** **task** **blocks** (see `TASK_FLOW_...` and **§6**): human follow-ups, review windows, time-sensitive work. |
| 6 | **Escalate** **sensitive** items (contrast, PII, $, press, legal) per `ESCALATION_PATHS` — **not** by approving a **public** path from the brief alone. |
| 7 | **Defer or park** **nonessential** work with **dated** **parking** (see `WORKBENCH_OPERATOR_RUNBOOK` parking rules). |
| 8 | **Lock the day’s operating focus** = **one** **clear** **statement** of **what** **“** **done** **today** **”** **means** for **this** **role** / **CM** / **all-staff** slice **(internal) **. |

---

## 3. Approval statuses (brief / task / routing)

Use **consistent** **labels** in **doctrine** and **(when** **built) ** in **product** so **ops** and **audit** match.

| Status | Meaning |
|--------|---------|
| **Draft suggestion** | System or staff **proposed** line — **not** **active** for execution. |
| **Ready for review** | Queued for **the** approver per RACI. |
| **Approved for today** | **Internal** **work** may **proceed** per **this** **brief** **cycle** **(subject** to **gates** on **sends** / **$** **/ ** **legal** **). ** |
| **Reassigned** | **Owner** **changed** with **reason** and **history** (**§**6** **). ** |
| **Scheduled** | **Due** / **block** time **set**; **not** the same as **“** **shipped** **. **” |
| **Parked** | **Intentional** **defer**; **dated**; **not** a **ghost** close. |
| **Escalated** | On **`ESCALATION_PATHS` ** or **owner**-**set** break-glass. |
| **Blocked** | **Dependency** or **unavailable** approver; **document** who **unblocks** **. ** |
| **Completed** | **Task** or **brief** line **closed** with **evidence** per **workbench SOP. ** |

---

## 4. What approval *does* (internal motion)

When **Approved for today** (per RACI) **is** **recorded** **(design** or **emulated) ** **:**

- **Sets** **internal** **tasks** **in** **motion** — assignees can **treat** **work** as **authorized** to **start** (within their **role**).  
- **Notifies** **owners** when **product** **exists** (email, in-app, **#**ops **as** **SOP) **. ** **  
- **Creates** **/ ** **updates** **`CampaignTask`** or **`WorkflowIntake`** where **appropriate** **(conversion** **/ ** **link** **to** **outcome) **. ** **  
- **Records** **audit** **trail** — who **approved,** **when,** what **changed** from **draft** **. ** **

---

## 5. What approval does *not* do (hard walls)

- **No** **public** **send** of **comms** **—** MCE+ / LQA / matrix **unchanged. ** **  
- **No** **spend** **or** **vendor** **commit** **—** treasurer + **`FinancialTransaction` ** path **. ** **  
- **No** **voter** **export** or **row**-level **audience** **action** from **a** **brief** **line** **. ** **  
- **No** **legal,** **contrast,** or **GOTV** **action** **solely** because **a** **brief** **was** **“** **approved** **. **” **  
- **No** **sensitive** **publication** (site, ad, **email** to **opt**-in **lists) ** without **LQA+** and **RACI** **. **

---

## 6. Reassignment rules

- **Who** **can** **reassign** **: **per **`APPROVAL_AUTHORITY_MATRIX` ** and **SOP** **(typically** **CM** **/ ** **owner** / **admin** for **pooled** **work;** **not** **silent** **peer** **grabs) **. ** **  
- **Reason** **required** **—** one **line** in **intake** **/ ** **task** **/ ** **brief** **log** **(audit) **. ** **  
- **No** **silent** **reassignment** **(see** `WORKBENCH_OPERATOR_RUNBOOK` **assignment** **rules) **. ** **  
- **Preserve** **ownership** **history** **—** prior **owner** and **date** **remain** **visible** **in** **the** **record** **(not** **overwritten) **. **

---

## 7. Scheduling rules

- **Schedule** **human** **follow**-**ups** **(calls,** **texts,** **thanks,** **host** **check**-**ins) ** with **concrete** **windows** where **appropriate** **(no** **fake** **precision) **. ** **  
- **Set** **due** **dates** for **routed** **internal** **tasks** **(TT** **/ ** **MI** **SLA** **). ** ** **  
- **Set** **review** **blocks** for **LQA,** **MCE,** **treasurer,** **counsel** as **governed** **. ** **  
- **Identify** **time**-**sensitive** **items** (aging intake, event-adjacent, **press**-**adjacent) **. ** **  
- **Avoid** **overloading** **one** **user** **—** **balance** WIP (see `WORKBENCH_OPERATOR_RUNBOOK` **WIP** **§**6** **). **

---

## 8. Sample daily launch screen copy (stylized; no PII)

*Internal-only labels; replace brackets when product or standup template exists.*

**Header:** [Date] — **Daily approval launch** — [Campaign-wide | CM | Role]

**Today’s one-line focus (after approval):** [What “done” means for today]

**From the brief — approve or adjust**

- [ ] **Priorities** (top 3): …  
- [ ] **Suggested routing** (accept / **reject** with reason / **reassign**): …  
- [ ] **Human follow-ups** (at least one where role-appropriate): see `HUMAN_INTERACTION_...`  
- [ ] **Park / escalate**: …  

**Status:** [ ] **Approved for today**   [ ] **Adjusted** (notes below)   [ ] **Blocked** (owner: …)

**Lock line (internal):** “We are executing A, B, and C before starting new D.”

**Audit (required on adjust):** Approver: [role] · Time: [TZ] · Notes: [short]

---

## 9. Advance ask and escalation ladder **after** approval (Pass 5K)

- **After** the **day** is **approved** (§**1**–**2**), **routed** **work** that **uses** **volunteer** / **pooled** **assignees** should **follow** **`ADVANCE_TASK_BUY_IN_AND_ESCALATION_LADDER_SYSTEM.md` **: **ask** **early,** **claim** **landing,** **escalate** before **crisis,** **not** **auto**-**assign** without **buy**-**in** **unless** **emergency** **/ ** **RACI. ** ** ** **  
- **Escalation** **rung** and **sensitive** **rows** still **use** `playbooks/ESCALATION_PATHS.md` and **`APPROVAL_AUTHORITY_MATRIX` **(no **shame,** no **GOTV** from **a** **brief** **or** **slider) **. **

---

**Last updated:** 2026-04-27 (Pass 5J + 5K)
