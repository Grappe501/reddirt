# Candidate dashboard and decision runbook (Manual Pass 5)

**Lane:** `RedDirt/campaign-system-manual`  
**Audience:** **Candidate** + **CM** + **advance** + **owner** (policy)  
**Public language:** **Campaign Companion**, **Guided Campaign System**, **Workbench** — not “**AI**” as a product name for planning tools.

**Related:** `CANDIDATE_AND_CAMPAIGN_MANAGER_STRATEGY_DASHBOARD_REQUIREMENTS.md` · `IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md` · `INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md` · `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md`

**Honesty:** A **single** **shipped** **“candidate** **strategy** **app**” is **not** guaranteed. **Until** product ships, **emulate** this runbook with **calendar** + **briefing** **doc** + **`CampaignTask`** **routed** through **CM**.

---

## 1. Candidate daily view (when dashboard exists — or emulate)

| Time | Check | Owner | Workbench tie |
|------|--------|--------|----------------|
| **Start** | **Rest** block **intact?** **Next** **3** **public** **obligations** | Advance + candidate | `CampaignEvent` **+** **brief** |
| **Midday** | **Comms** **defects** **/** **crisis** **holds** | Comms + CM | **No** **ship** **without** **MCE** |
| **End** | “What moved the plan today?” (one line internal) | CM or self-log | Task or meeting note |

**Emulation** without UI: one **15**-**min** call or **asynchronous** **brief** from **CM** with the **same** **three** **questions** **.  

---

## 2. **Time** load and **rest** **blocks**

- **No** “**green** on **sim**” = **ok** to **double**-**book. ** **Sim** = **resourcing** **model,** not **a** **calendar** **that** **bends** without **CM**+**advance** **.  
- **If** a **4B** **Preview** **implies** **more** **travel,** that **is** **not** **a** **schedule** **change** **until** **`CampaignEvent` **+** **candidate** **time** **confirm** + **LQA** **(see** **STRATEGY_TO_TASK** **).**  

---

## 3. **Message** **discipline**

- **All** public words **: **MCE/NDE **+** **counsel** on **contrast. **“**Rapid**” **: **O**+**C**+**M** in **`ESCALATION_PATHS` **. **Candidate** does **not** **solo**-**ship** in **a** **crisis** **without** that **RACI** **.  

---

## 4. **Calendar** and **travel** **review** (10 min, **2–3×** / week **min**)

- Ghosts = 0 (see `CM_DAILY_...`); TBD+owner only (3F/3G).  
- Rural / county stops: tied to OIS-honest ladder, not a sim slider alone.  

---

## 5. **Fundraising** **comfort** **boundaries**

- **Candidate** **says** what **is** / **isn’t** **comfortable** in **ton**; **$** **routing** and **tranche** **confirm** = **T** **(see** **matrix) **.  
- **Call**-**time** **: **no** **PII** **lists** on **unsecured** **phones** **(see** **WORKBENCH** runbook) **.  

---

## 6. **Public**-**schedule** **approvals**

- LQA per `APPROVAL_AUTHORITY_MATRIX`: MCE/NDE for phrasing; time and safety = CM+advance+O on edge. No public schedule slot without that path.  

---

## 7. **Read**-**only** vs **request**-**only** **strategy** **controls** (4B + MI **§**38, **39**)

| Control class | Default for candidate (until **Steve** **locks** **) **| Mechanism |
|---------------|--------------------------------|------------|
| **$**-**linked** **sliders** or **vendors** | **Request** to **CM**+**T** | **`CampaignTask` **+ **treasurer** **. |
| **Travel** + **call**-**time** | **Request** to **CM**+**advance** | **`CampaignEvent` **+ **task** **. |
| **GOTV** / **turf** / **file**-**adj** | **Read** **only**; **all** **changes** through **LQA** | **ST**+**data**+**C** **. |
| **Narrative** / **contrast** | **Request** to **MCE**+**C** on **any** new **contrast** | **Comms** **plan** **+** **LQA** **. |

**Policy** TBD: **Owner** and **MI** **§**39 **: **“**direct** **edit**” on **iPad** for **low**-**risk** levers. **If** in **doubt,** **request** **path** only **.  

---

## 8. **What** the **candidate** **should** **not** see **by** **default**

| **Never** default-on | **Why** | **Exception** (policy) |
|----------------------|--------|------------------------|
| **Row**-**level** **voter** **file** | PII/role **law**; **DPA** | **Counseled** **turf** **view** in **governed** **UI** for **set** **roles** only |
| **Raw** `Submission` with **unredacted** PII in **intake** **detail** (if ever exposed) | Same | **Redacted** **summary** in **ops** view |
| **Un**-**counseled** **targeting** **/ persuasion** **packs** | **Legal**+**reputation** | **MCE/NDE**+**C**-**signed** **only** **. |
| **Internal** **volunteer** **gossip** **or** **peer**-**comparisons** in **Roster** | **Toxic,** PII-**adj** | **Aggregate** only |
| **“**Model**” **outputs** as **certainty** or **opponent** **claims** | **Sourcing**+**ethics** | **Labeled** **scenarios,** not **a** **scoreboard** of **voters** **. |

---

## 9. **Weekly** **candidate** + **CM** **decision** **meeting** (30**–**60 min)

- **Input:** **KPIs** (treasury-**sourced** **$**; **OIS**-honest field); **Preview** diffs; **MCE/NDE** **queue** **.  
- **Output:** **Decisions** = **`CampaignTask`** or **`WorkflowIntake` + **dated** **minutes**; **if** it’s only **DMS,** it **does** **not** **count** **(STRATEGY_TO_TASK) **.  
- **Agenda** **(fixed** **order) **: **$** **floor** **→** **time** / **rest** **→** **tour** **→** **messaging** **next** week **→** **one** **risk** **row** **.  

---

## 10. **Crisis** **decision** **lane** (`ESCALATION_PATHS` + `APPROVAL_AUTHORITY_MATRIX`)

- **O**+**C**+**M**+**comms** **: **one** **owner** of **outbound,** one **** log **line,** one **** legal **check** **. **No** new **4B** **sliders** **during** **active** **crisis** **response** without **O** **.  

---

## 11. **How** **candidate** **feedback** **becomes** **Workbench** **tasks**

1. **Capture** in **governed** **channel** (email to **ops**@ or **`WorkflowIntake` **or **`CampaignTask` **from** **CM) **. **No** PII in **iMessage** **.  
2. **CM** **classifies** (TT-**xx** when possible) **.  
3. **LQA** **if** it **touches** **$**, **public** **,** or **voter** **.  
4. **Assign** and **close** with **evidence** **(see** **WORKBENCH** runbook) **.  

**Example (fake):** *Candidate* **asks** to **reorder** a **rural** **tour** **. **Result** = **`CampaignTask` **+ **`CampaignEvent` **TBD+owner,** **not** **a** **text** to **V.C.** with **a** **list** of **voters** **.  

---

**Last updated:** 2026-04-28 (Pass 5)
