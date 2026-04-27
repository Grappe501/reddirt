# Campaign manager — daily and weekly operating system (Manual Pass 5)

**Lane:** `RedDirt/campaign-system-manual`  
**Role:** **Campaign manager (CM)** — not treasurer, not counsel, not **lone** **public** approver of **contrast** **.  
**Vocabulary:** **Workbench**, **Pathway Guide**, **Guided Campaign System**, **Field Intelligence** — not “**AI**” **.  
**RACI** **+** `playbooks/APPROVAL_AUTHORITY_MATRIX.md` always **win** over **one**-**on**-**one** **habit** **.  

**Paired** **docs:** `WORKBENCH_OPERATOR_RUNBOOK.md` · `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` · `playbooks/ESCALATION_PATHS.md`

---

## 1. First 30 minutes of day (CM)

| # | Do | If blocked |
|---|----|----|
| 1 | **Open** `/admin/workbench` and **P0** **intakes** (press, **PII** **risk,** **contrast** **leak** **fear) **| **O**+**C** for **contrast;** data for **PII** |
| 2 | **TTF** for **V.C.-owned** **stale** **\>**48h (MI §39 to **set** **SLA** **)| **reassign** or **V.C.** **sync** **same** **day** **|
| 3 | **Calendar** / **ghost** **events** (no **owner** or **TBD+no** **surname** **) **: **0** or **one** `CampaignTask` to **own** the **fix** **|
| 4 | **Comms** defects from MCE/NDE (if any): one-line priority order for comms standup | **MCE** queue cap (see WIP) |

**Not** in **first** 30: **new** **creative** **projects,** long **donor** **reads,** or **ad-hoc** **spend** **approval** (that’s **T** + **LQA) **.  

---

## 2. **Daily** triage **block** (60–90 min, **fixed** on **calendar**)

- **Intakes:** `WorkflowIntake` **age** **buckets** from `WORKBENCH_OPERATOR_RUNBOOK` **§5** **. **Convert** to **comms,** **event,** or **`CampaignTask`**; **or** **decline** with **civil** **reason** in **log** (no **ghost** **closes**).  
- **Tasks:** **P1** first; **$**- **linked** **=\>** verify **T** path **open** or **“no** **$**” **explicit** in **body** **.  
- **End** of **block** **: **record** in **#ops** or **one** `CampaignTask` `CM-TRIAGE-YYYY-MM-DD` **: **N** in, M out, P0=**k** **.  

---

## 3. **Daily** comms **approval** **block** (20–30 min, **or** **merged** in **triage** if **low** **volume**)

- **LQA** **per** **matrix** for **comms** **outbound**; **if** you’re **not** LQA, **move** to **MCE/NDE** + **add** `CampaignTask` **nudge** with **SLA** **.  
- **Crisis** **touches** this **block** first — **O**+**C** in **loop** (see `ESCALATION_PATHS`).

---

## 4. **Volunteer** / field **sync** (15 min **daily** or **3×** / week if **rural**)

- **OIS**-honest **counties**; **V.C.** WIP; **P5** **backlog** **(definition** of **“complete**” = **SOP) **.  
- **No** new **rural** **tour** **stops** **without** 72h **path** in **3F/3G** **SOPs** **(no** **invented** **chairs** / **dates** **).**  

---

## 5. **Finance** / **compliance** check (15 min **daily**; **M**+**T** **touch** on **$**)

- **View** only **`FinancialTransaction` CONFIRMED** for **trend,** not **“sim**” **as** **truth** **.  
- **Flags:** **unconfirmed** **spend,** **pending** **reimburse,** **compliance** **doc** not **in** `ComplianceDocument` **. **If** **red** **: **T**+**C**+**O** as **in** **matrix** **. **Do** not **approve** $ **out** of **this** check **if** you’re **not** T **.  

---

## 6. **Candidate** **schedule** check (5–10 min)

- **Rest** **blocks;** no **4**+ **hops** in **1** day **without** **advance** **; **public** **time** = **LQA** with **MCE/NDE** on **messaging** **.  
- **Tie** to **`CampaignEvent` **reconcile** in **3G/3H** **SOPs** **(no** **ghost**).  

---

## 7. **Scenario** / **strategy** **review** (20 min **2–3×** / week **until** **full** **UI** **+** then **in** **locked**-**baseline** **meeting**)

- **Preview** only **: **read** `INTERACTIVE_...` **+** `STRATEGY_TO_TASK_...` **. **Proposed** **changes** : **RACI** before **own** **.  
- **If** it’s **not** a **`CampaignTask` **or** `WorkflowIntake` **,** it’s **not** **real** for **the** **org** **.  

---

## 8. **Weekly** **locked**-**baseline** **meeting** (30–60 min, **with** **owner,** T **as** **needed,** MCE/NDE **as** **needed** for **messaging**)

- **Input:** **Proposed** **scenario** **diffs**; **KPIs** with **data** **labels** (treasury, **V.C.,** OIS).  
- **Output:** **Dated** **“Locked** **baseline** for **&lt;dates&gt;`”` **in** **notes** + **strategic** `CampaignTask` **or** **intake** **STRATEGY-** as **in** 4B **.  
- **Who locks:** O+M minimum; T for $-linked; C for narrative risk (see MI §38, §39).  

---

## 9. **Weekly** **KPI** **truth** **review** (45 min)

- **$:** **T**-**sourced** **+** `FinancialTransaction` **.  
- **Vols** **: **V.C.** + **SOP** **def** of **“active`”` **(no** **inflating) **.  
- **Field** **: **OIS** + **ladder,** not **vibes** **.  
- **Comms** **: **MCE/NDE** **defects** and **on**-**time** **(see** `ROLE_KPI_INDEX`) **.  
- **No** public **5K** **or** **precinct** **%** without **counsel+treasurer+owner** on **form** of **number** **.  

---

## 10. **Weekly** **county** + **P5** (30 min with **V.C.**, field)

- **County** **: **3**-**5** real **benches** = **pilot,** not **75** **(strategy** tome) **. **Ladder** **move** = **log** in **OIS** **/ task,** not **in** **DMS** only **.  
- **P5** **: **“**complete`”` **=** product **+** SOP; **if** not **in** product, **use** **TT-04/03** **+** **honest** **metrics** **.  

---

## 11. **Weekly** **message** / **narrative** (20 min with **MCE/NDE**)

- Lanes (recruit / persuade / GOTV) = % of effort, not a vibe check. Contrast and legal = counsel, not M alone.  
- **If** `SEGMENTED_...` **plan** **changed** **: **LQA** **+** `CampaignTask` **(see** **Pass** **5** **SOP) **.  

---

## 12. **Weekly** **risk** **register** (20 min with **owner** if **R/Y**)

| Risk | R/Y/G | Owner | Mitigation **task** id |
|------|--------|--------|------------------------|
| **$** **floor** / **spend** | | T, O | |
| Contrast / legal | | C, O | |
| **PII** / **export** | | Data, O | |
| **Field** **coverage** | | CM, field | |

**Green** = on-SOP, not on-hype.  

---

## 13. **End**-**of**-**week** **closeout** (Fri, 20 min)

- **Parking** lot **&lt;** 14d **(WORKBENCH** **runbook) **.  
- **EOW** line **: **P0=0,** **P1** **&lt;** cap,** **K** **tickets** **to** **Mon** **. **No** new **strategic** **scope** **Fri** **4pm+** without **O** **.  

---

## 14. R/Y/**G** (decision **rules,** **internal**)

| **Signal** | **Red** | **Yellow** | **Green** |
|------------|---------|------------|-----------|
| **Open** P0s | **&gt;0** for **&gt;4h** | 1, **&lt;**4h | **0** |
| **Intake** **&gt;72h** on **one** name | **&gt;5** or **P0** in **stale** | 2**–**4 | **0**-**1** |
| **COH** | **&lt;** T **floor** (when **set** **)** | n **ear** | **&gt;** **floor** |
| MCE defects | ships with open defects | &lt;2 nagging | 0 or N/A |
| **72h** after **tour** **/ meeting** (if program on) | **&lt;** SOP | **1**-**2** **misses** | **0** **misses** |

**R**ed **: **owner** in **&lt;**24h** **on** that **row** **. ** 

---

## 15. **What** **CM** **owns** **vs** **owner** / **T** / **C**

| CM **owns** | T **owns** | C **owns** | Owner **owns** |
|-------------|------------|------------|----------------|
| Triage, WIP, task quality, RACI routing, field/V.C. cadence, MCE/NDE defects to LQA | $ truth, `FinancialTransaction` CONFIRMED, public $ voice (with C) | Contrast, reg/ethics edges | Break-glass, PII + $ + narrative in late/weird risks |

**CM** does not “approve” GOTV text, exports, or voter-file audiences without the approval matrix.  

---

## 16. **When** **CM** must **stop** **expanding** **scope** (red **lines**)

- **&gt;1** new **pilot** **/ week** (county, tool, program) without **O**+**T** **+** **closing** a **pilot** **.  
- **&gt;3** new **unfunded** **vendors** in **one** week **(see** 3C/3H) **.  
- **R**-**Y** in **&gt;2** **categories** in **section** 14 for **&gt;1** week **: **all** new **strategic** **intake** through **O**+**sync** with **SOP** **(strategy**-to-**task**).  

---

**Last updated:** 2026-04-28 (Pass 5)
