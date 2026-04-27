# Continuous campaign knowledge ingestion and refinement engine (Manual Pass 5F)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Design** for how **campaign** **signals** **become** **durable,** **reviewed** **knowledge** **and** **operational** **improvement** **—** **not** a **shipped** **ingest** **stack,** **vector** **DB,** **or** **24/7** **live** **feed** **(see** `SYSTEM_READINESS_REPORT.md` **and** `MANUAL_PASS_5F_COMPLETION_REPORT.md` **)** **.**

**Ref:** `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md` · `CANDIDATE_REFINEMENT_INTAKE_AND_QUESTION_BANK.md` · `CAMPAIGN_COMPANION_LIVE_INTELLIGENCE_AND_COMMAND_INTERFACE.md` · `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `playbooks/ESCALATION_PATHS.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**43 · **§**44 · **§**45 · `WORKBENCH_OPERATOR_RUNBOOK.md` · `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` · `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` (Pass 5G) · **Pass** **5H** `ASK_KELLY_SUGGESTION_BOX_AND_FEEDBACK_INTAKE_RULES.md` · **Pass** **5I** `WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM.md` · `THANK_YOU_CARD_AND_APPRECIATION_WORKFLOW.md`

---

## 1. Inputs (design** **catalog) **

| **Input** | **Use** in **a** **future** **build** | **Not** a **raw** **firehose** **to** **a** **public** **model** without **DPA+redaction** **.** |
|------------|--------------------------------------|----------------------------------|
| **Candidate** **conversations** (interviews,** **Q&A) **| **A/B** **refinement,** with **RACI** | **Not** a **leak** of **off**-**record** **(define** what **is** on**-**record) **in** a **knowledge** **node** without **consent** **.** |
| **Steve/CM** **direction** (briefings,** **SOP) **| **SOT**-**shaped** **“**how** we **work**”** **(internal) **, **pointers** to **tasks** not **a** **substitute** for **`CampaignTask` **| **Not** a **bypass** of **4B/approvals** **.** |
| **Volunteer** **reports** (field,** **events) **| **OIS,** **county** **updates** **(honest) **+ **suggested** **FAQs,** with **anonymize**-**first** | **Not** a **dox** of **a** **named** **volunteer** in **a** **public** **FAQ** from **a** **single** **unverified** **DM** **.** |
| **Public** **forms** | **`POST` `/api/forms` **spine,** `WorkflowIntake` **(2A) **; **triage,** not **voter** **row** in **a** **model** | **2A,** 5C/5E **/ **5F** **data** **rules** **.** |
| **Event** **reports** (attendance,** **follow**-**up) **| **`CampaignEvent` / **OIS,** not **a** **fake** “**I** was **there**”** in **a** **chat** if **OIS** **says** else | **3G,** 5D **motion** **docs** **.** |
| **Email** **content** (inbox,** **blast** **replies) **| **Triage,** **themes,** not **storing** **all** **PII** in **a** **vector** **store** by **default** | **Retention,** **consent,** **CAN**-**SPAM,** **DPA,** **LQA** **for** **ship** **copy** **.** |
| **Social** **(comments,** **DMs) **| **Tagging** (topic,** **toxicity,** not **a** **full** **transcript** in **RAG) **; **MCE+comms** for **outbound** | **5E** **+** this **file** **(no** **manipulation,** no **creepy** **inference) **. |
| **Press** | **Clips,** not **a** **claim** the **orchestrator** “**read** the **newspaper**” **in** a **voter**-**facing** **line** with **a** **made**-**up** **quote** | **See** 5B/MCE; **D** in **5F** for **a** **model**-**synthesized** **“**according** to **press**”** **if** not **sourced** **.** |
| **County** / **field** | **OIS,** path**-**to**-**victory** **(operational) **, **gaps** **as** **acquisition,** not **fake** **maps** | **3D**-**3F** **.** |
| **Workbench** **activity** (tasks,** **aging) **| **SOT**-**aligned** **for** **CM,** with **2A,** 5,** **4B** **Preview/Propose,** not **Lock** in **a** **chat** | **`CAMPAIGN_COMPANION_LIVE_...` **. |
| **Donor** / **fundraising** **(aggregates) **| **R2+** **and** **treasurer**-**shaped,** or **TBD,** not **“**our** top **5** **donors** are**”** in **a** **summary** to **a** **non**-**R2** **ear** | **3H,** `FINANCIAL_...` **,** `playbooks/ROLE_READINESS_...` **. |
| **Website** / **static** | **A**-**class** when **MCE+comms** **publish,** with **revalidation** on **edits** | **5D** **website** **motion** **.** |
| **Candidate** **wizard** / **site** **review** (Pass 5G) | **B**-**touched** or **D**-**triage** via **`CANDIDATE_TO_ADMIN_...` **+ **`WEBSITE_EDIT_IMPACT_...` **; not **A** **till** **LQA+** **and** **comms** **(see** **Pass** **5G** **docs) ** | **5G** + **2A** + **5B** + **3H** + **`APPROVAL_AUTHORITY_MATRIX` **(no** **$** / **VFR) ** |
| **Beta** / **suggestion** **(Pass** **5H) ** | **D**-**triage** **/ ** **ops**-**routed,** with **`ASK_KELLY_SUGGESTION_...` **+ **`ASK_KELLY_BETA_...` **; not **A**-**knowledge** **/ ** not **GOTV** **lane** **(see** `SEGMENTED_` **§**22) ** | **5H** + **2A** + **5B** + **3H** + **5F** **(no** **PII) ** ** |
| **Morning** / **end**-**of**-**day** **brief** **(Pass 5I)** | **SOT**-**shaped** **pointers** **(today** **/ ** **week** **/ ** **month) **+ **P0,** with **`WORKBENCH_MORNING_BRIEF_...` **; not **A**-**class** **/ ** not **GOTV** without **MCE+LQA** | **5I** + **2A;** **emulate** **if** **no** **UI** **(MI** **§**46) ** |
| **Thanks** / **appreciation** **closure** **(Pass 5I)** | **Task**-**routed** **/ ** **logged** **delegation** per **`THANK_YOU_...` **; not **a** **public** **“**we** **thanked** **X**”** **claim** **without** **RACI** if **outbound** | **5I** + **STRATEGY_TO_TASK;** **no** **PII** **/ ** **donor** **rows** **in** **ingest** **(MI** **§**46) ** |

## 2. **Each** **input** **becomes** (pipeline **shape) **

| **Stage** | **Meaning** |
|-----------|------------|
| **Raw** **signal** | **Append**-**only,** with **provenance,** not **a** **model**-**facing** **default** in **a** **public** **answer** without **A/B** **. |
| **Sanitized** **summary** | **PII/secret**-**removed** **(or** **not** **ingested) **+ **anonymize**-**by**-**default** for **trend** **(see** data **hygiene) **. |
| **Classification** (topic,** **urgency,** **sensitivity) **| **Drives** **RACI,** not **a** **personality** **label** on **a** **voter** **.** |
| **Candidate/Comms** **refinement** **need** | **When** A/B are **insufficient,** with **C/D** in **`ASK_KELLY_...` **. |
| **Possible** `WorkflowIntake` / `CampaignTask` | **Preview/Propose,** not **auto**-**lock** (4B+2A) **. |
| **Possible** **FAQ/website** **update** | **LQA+publish** only **(MCE) **, not **a** **chat**-**driven** **static** **edit** from **a** **public** user **. |

---

## 3. Data** **hygiene (non**-**negotiable) **

- **No** **raw** PII in **a** **model** **context** for **a** **public** **or** **unauthorized** **user** **(see** 5C/5E/5F **+** this **file) **.  
- **Redact** by **default**; **separate** **stewarded** **views** for **R2+** and **VFR,** with **RACI,** not **a** **clever** **prompt** in **a** **CM** **briefing** that **bypasses** **gating** **.**  
- **Provenance** on **every** **A**-**class** **chunk** (source,** **date,** **approver) **.  
- **Confidence** (high/medium/low) and **stale**-**on** (revalidate) **.  
- **Approval** **state** (see next **section) **— **no** **“**it**’**s **true**”** in **a** **public** **persona** **if** the **node** is **D** or **C**-**inferred** for **a** **hot** **issue** **.  

---

## 4. Knowledge** **states**

| **State** | **When** it **moves** here |
|-----------|----------------------------|
| **Raw** | **Ingest,** not **suitable** for **voters** **.** |
| **Summarized** | **Sanitized,** not **a** **position** **yet** **.** |
| **Reviewed** | **Comms/ops** **;** not **A** **yet** for **a** **hot** **issue** if **MCE+comms** **not** **done** **.** |
| **Candidate**-**refined** | **Kelly**-**touched,** not **A** for **all** **channels** if **B**-**only** **. |
| **Comms**-**approved** | **MCE+brand**; **LQA+ship** for **publish**-**facing** **. |
| **Counsel**-**reviewed** | **As** **needed** (contrast,** **legal) **. |
| **Public**-**ready** | **A**-**class** in **`ASK_KELLY_...` **+ **5D/FAQ** for **slices** **. |
| **Retired** / **superseded** | **Do** not **re**-**surface** in **a** **chat** without **SOT**; **if** a **voter** **asks,** use **a** **bridge,** not **a** **ghost** of **a** **retracted** **line** without **MCE+comms** **(see** 5B **+** 5D) **. |

---

## 5. Feedback** **loops (honest) **

- **Candidate** **refines** **→** A/B **→** public **(when) **+ **MCE+comms,** not **an** **instant** **global** **replace** in **a** **beta** without **LQA** **.  
- **Volunteers** **local** **knowledge** **→** OIS+county,** not **a** **private** **slur** in **RAG,** and **not** a **P5** **targeting** **cut** from **a** **chat** **.  
- **Voters** **reveal** **confusion** **→** **FAQ+refinement** **queue,** with **D**-**churn** **(see** 5B **) **+ **5F** public **UI** (no “**our** model **failed**” **) **.  
- **CM** **sees** **gaps** **in** `CAMPAIGN_COMPANION_LIVE_...` **→** SOP+task+**4B,** not **a** **chat**-**driven** **GOTV** **cut** **.  
- **Website** **updates** **→** **fewer** **D**-**tickets** in **a** **good** **path;** **incomplete** **OIS** **=** **honest** **TBD,** not **a** **phantom** **(see** 5D/website) **.  

---

## 6. “Do** **not** **personalize** **creepily**” (rule) **

- **You** may **remember** what **a** **user** **told** **us** in **a** **consented** form **(role,** **Pathway,** **county,** **interests) **if **product** and **SOPs** support **it** **(see** 5C) **.  
- **You** do **not** **infer** **sensitive** **traits** (health,** **ethnicity,** **income) **or **“**emotional** **vulnerability**”** from **a** **prompt** in **a** **public** **surface** to **nudge** a **manipulative** next **step** **(see** 5C **+** 5E) **.  
- **User**-**driven** **next** **step:** “**If** you **want** to **X,** **we**’**re** here**;** if **not,** you **can** still **Y****”** — not **a** **single**-**funnel** **addiction** **pattern** in **GOTV,** and **not** a **fear** **drip** on **5D**-**banned** **lanes** (see **SEGMENTED_** **) **.  

---

**Last** **updated:** 2026-04-28 (Pass 5F + 5G + 5H)
