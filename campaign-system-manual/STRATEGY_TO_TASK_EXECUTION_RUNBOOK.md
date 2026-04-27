# Strategy-to-task execution runbook (Manual Pass 5)

**Purpose:** **Bridge** `INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md` (Pass 4B) to **`WorkflowIntake`**, **`CampaignTask`**, and **Workbench** **execution** with **no** **auto**-**execution** of $, **public** comms, **GOTV** **lists,** or **voter** **exports**.

**Ref:** `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `playbooks/TASK_TEMPLATE_INDEX.md` (TT-01…TT-31 in repo; **TT-32**–**35** = **Pass** **5** **naming** **slots** for **governance** **records** **—** add to **index** when productized) · `workflows/TASK_QUEUE_AND_APPROVALS.md` · `SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md`

---

## 1. Definitions (must match 4B)

| Term | Meaning |
|------|--------|
| **Preview** | **What**-if **assumptions**; **no** **operational** **lock**; **no** $ **commitment**; may live in sim **spreadsheet** or **UI** when built |
| **Proposed** | **Human**-authored **change** **package** **pending** **LQA**; **RACI** **filled**; may **create** a **`WorkflowIntake` “strategy-change”** or **`CampaignTask`** with **“PROPOSED”** in **title** **until** **approved** |
| **Locked baseline** | **This** **week**’s (or **period**’s) **agreed** **assumptions** for **resourcing** **plan** — **not** a **public** **promise** of **outcome**; **document** **in** **meeting** **notes** + **task** **close** **with** **approver** **names** |

**Nothing** in **Preview** **creates** **CONFIRMED** `FinancialTransaction` **or** **sends** **comms** **or** **exports** **file** **data**.

---

## 2. How a strategy assumption change becomes work (master flow)

1. **Signal** — slider/assumption **moved** in **Preview** (or **paper** **proposal** from leadership).  
2. **Human** **review** — **CM** (owner if **$** or **narrative** **risk** per matrix).  
3. **LQA** **from** `APPROVAL_AUTHORITY_MATRIX` (strategy row, $ row, **targeting** row, **GOTV** row, **VFF** row as needed). **No** **LQA** = **no** **locked** **baseline** for that **lever** **.  
4. **Workbench** **record**  
   - **Option A:** New **`WorkflowIntake`** (internal form or operator-created) with `metadata.purpose: strategy_change` and **links** to **which** levers.  
   - **Option B:** **`CampaignTask`** from **`STRATEGY-YYYYMMDD-<topic>`** using **template** from §5 **below** or **custom** with **RACI** in **body** **.  
5. **Assign** `CampaignTask` to **owning** **role** (V.C., field, paid, **etc.**) **.  
6. **Execution** + **evidence** (event created, tranche id, list **import** **ticket,** **not** **voter** **paste** in **chat**).  
7. **Closeout** — see `WORKBENCH_OPERATOR_RUNBOOK.md` **§**10.  
8. **Next** **lock** **—** **weekly** (or **set** **cadence**); **MI** **§**39 **TBD** on **who** **clocks** **lock** **authority** **.

**Forbidden:** **“The** **model** **approved** it”** **or** **“****Sim** **green** **=** **ship**”** **.**

---

## 3. Master loop diagram (narrative)

`Scenario (Preview) → human review → LQA → Workbench record (intake or task) → owner role executes → evidence → closeout → locked baseline in meeting + dated note`

**Strategy** **changes** **must** **not** **bypass** **this** **loop** **—** if **it**’s **not** in **tasks** or **intakes** with **RACI,** it **does** **not** **exist** for **the** **org** **.**

---

## 4. Flows by domain

### 4.1 Fundraising pace change

| Step | Suggest | Can’t do | Approvals | TT mapping (examples) |
|------|---------|----------|------------|------------------------|
| Lower/raise **weekly** **raise** **assumption** | Recompute **sim** **readiness,** open **V.C./fin** follow-up | **Imply** public **$** **claims**; **set** **ledger** **rows** | T for **$**; O high **$**; **stretc**h **unlock** per strategy §3 | TT-07 (call), TT-19 (if paid assist), **TT-32** **slot** “Baseline lock” |
| “**Do** more **call** **time**” as **implied** | `CampaignTask` to **call**-**time** with **calendar** | Book **donor** **time** in **voter** file **in** DMs | Candidate **time** + T if **$** at **ask** | TT-07 |

**Sample** **packet** (fake): *Task* `STRATEGY-2026-10-15-fund-pace-BaseToMomentum` **Body:** “**Move** **Preview** from Base→Momentum **after** T **confirmed** **COH** **\>** **floor;** V.C. **+**2 **recruit** **events** in **2** **weeks,** no **$** **claim** in **public** until **MCE** **."**

---

### 4.2 Travel / county **priority** change

| Suggest | Can’t | LQA | TT |
|--------|--------|-----|-----|
| Reorder **weekly** **tour** **stops,** add **rural** **stops** | **Invent** **meeting** **dates**; **bypass** 72h **FU** SOP | M + (NDE if public copy); T if $ travel; candidate **time** | TT-08, TT-10, field **sync** task |

**Fake** **packet:** *“**Shift** 2 **units** of **tour** **from** **RegionA** to **RuralB**; **OIS** **county** **ladder** **+1** in **B** when **FUs** **close**; **Event** **rows** TBD+owner** **only** **.”**  
---

### 4.3 Paid **media** change

| Suggest | Can’t | LQA | TT |
|--------|--------|-----|-----|
| **Increase** **weekly** cap **in** sim | **Create** **vendor** **order** | T+M+C+O; **MCE** on **copy** | TT-19, 21+ **paid** SOPs |

**Fake:** *“**Preview** +$1k **digital** **test**; **requires** T **+** **APA**-**compliant** **vendor** **scope;** **comms** **opens** `CommunicationPlan` **draft,** not **auto**-**post** **.”*  

---

### 4.4 **Segmentation** / **message** **lane** change

| Suggest | Can’t | LQA | TT |
|--------|--------|-----|-----|
| **Rebalance** % effort **across** recruit/persuade/**GOTV** **(aggregate** **plan** **only** **)** | **Microtarget** **protected** **traits;** show **voter** **rows** in **vol** tools | M+**ST**+C as needed; MCE/NDE for **shipped** | TT-**13/17/19/20**; see `SEGMENTED_MESSAGE_...` |

**Fake:** *“**Persuade** **+10%** **airtime** on **econ** **lane,** no **stereotype** adjectives; **NDE** **defects** **cleared** first** **.”*  

---

### 4.5 Volunteer **activation** / **P5** change

| Suggest | Can’t | LQA | TT |
|--------|--------|-----|-----|
| **Add** P5 team **formation** **targets** in **model** | **Create** a **faked** “**complete**” team **KPI** without **SOP** | CM; O if **public** **count** | TT-**03/04** **and** V.C. **WIP** |

**Fake:** *“**+3** P5 **invites** **/ week**; **V.C.** **owns** **TT-04** with **RosterA** **.”*  

---

### 4.6 **GOTV** **readiness** change

| Suggest | Can’t | LQA | TT |
|--------|--------|-----|-----|
| **Add** **shift** **count** in **model** and **print** **internal** **capacity** | **Enroll** **persons** in **GOTV** program **by** name in **unsecured** **chats** | **ST**+C+T+**M**; **compliance** on **text** | TT-27, TT-25 |

**Fake:** *“**+20** **shifts** **/ week** **in** sim; **GOTV** lead **recruits** with **counseled** **script** **only** **.”*  

---

### 4.7 **Crisis** / **rapid** **response** change

| Suggest | Can’t | LQA | TT |
|--------|--------|-----|-----|
| **Triage** comms + **contrast** **path** in **1**-**hour** | **Auto**-**post** from **sliders** | **O**+C; **M** **executes** | TT-**28,** 20; **Crisis** in `ESCALATION_PATHS` |

**Fake:** *“**Crisis** **packet**; **comms** **holds** **non**-**MCE** **messages**; **single** **owner** of **outbound** **.”*  

---

## 5. Task template map (strategic work → TT-01…)

| Strategy topic | **Typical** TT ids (pick **all** that apply) |
|----------------|---------------------------------------------|
| **Money** / **tranche** / **ask** | TT-**06,** **07,** 19, **21,** 22 (visibility $) — **+** T **confirm** path |
| **Field** / **turf** / **county** | **08,** 10, **11,** 25, 26, **10** (72h) |
| **Comms** / **press** / **N**DE | 17, 19, **20,** 13 |
| **GOTV** | 25, **27** (future depth) |
| **Data** / **precinct** | 24, **(export** = **O** **path) ** |
| **Training** | 29, 30 |
| **Governance** **record** | **Proposed** `CampaignTask` **or** **intake** **without** a **new** **TT** **id** **until** **TT-32+** in **index** **—** use **title** **prefix** `STRATEGY-` |

**TT-32**–**35** (Pass 5 **naming** **slots**; **add** to `TASK_TEMPLATE_INDEX` **with** **Steve** if **formalize**d): **32** = weekly **baseline** **lock** **record,** **33** = **scenario** **publish** to **staff** **(internal),** **34** = **segmentation** **plan** **revision** **(aggregate),** **35** = **emergency** **governance** **override** **request** (owner).

---

## 6. **Example** **packets** (all **fake** **/ sample**; **no** **PII**; **no** real **$**)

**A. Fundraising (Preview** **only** **)**  
- **Task** title: `PREVIEW-2026-05-01-fund-pace-1.1x`  
- **Body:** “**Sim** only. **V.C.** to **add** 1 **house** **party** **host** **ask** **if** **CM** approves** **;** no **outreach** **spend** **.”** **TT-05** **if** **approved** **.**

**B. Travel (Proposed** **→** **locked** after **approvals) **  
- **Intake** `metadata.strategy: travel_shift` + **link** to **calendar** **diff** (internal).  
- **Subtasks** **TT-08,** 18** **as** **needed** **.**

**C. **Segment** **lane (Proposed)**  
- `CampaignTask` `SEG-LANE-2026-06-10-persuade-econ+` **→** comms/NDE **+** `SEGMENTED_...` **checklist** **.**

---

## 7. **Approval** **gate** **cheat** **sheet** ($ / **targeting** / **GOTV** / **public** / **export**)

| Gate | **LQA** **(see** **matrix) **| **Block** if |
|------|-----------------------------|-------------|
| **$** out | T+(M)+O | **no** `FinancialTransaction` **CONFIRMED** path |
| **targeting** / **file**-**adjacent** | O+C+**ST**+**data** | no **counseled** **audience** **definition** |
| **GOTV** / **reg** text | **ST**+C+(T) | no **counseled** **script** **version** |
| **public** **message** | MCE+comms+**O** in **crisis** | **N** **defect**-**open** in **MCE** |
| **VFR** **export** | O **policy** | **Bulk** without **log** **+** **approval** ** |

---

**Last updated:** 2026-04-28 (Pass 5)
