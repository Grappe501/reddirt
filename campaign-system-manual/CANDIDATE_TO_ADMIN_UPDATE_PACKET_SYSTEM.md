# Candidate-to-admin update packet system (Manual Pass 5G)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Governance** for how **candidate** **↔** **agent** **or** **wizard** **sessions** **become** **operator**-**visible** **packets** **—** **not** a **shipped** **product,** not **a** **public** **voter** **view,** not **raw** **PII,** not **a** **donor** **list,** not **a** **voter** **row** **(see** `MANUAL_INFORMATION_REQUESTS_FOR_STEVE` **§**44,** **`CANDIDATE_EDITING_RIGHTS_...` **,** **`playbooks/APPROVAL_AUTHORITY_MATRIX` **).**

**Ref:** `WEBSITE_EDIT_IMPACT_ANALYSIS_AND_DOWNSTREAM_DEPENDENCY_RULES.md` · `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` · `WORKBENCH_OPERATOR_RUNBOOK.md` · `playbooks/ESCALATION_PATHS.md` · **Pass** **5H** `ASK_KELLY_SUGGESTION_BOX_AND_FEEDBACK_INTAKE_RULES.md` **+ **`ASK_KELLY_BETA_FEEDBACK_TO_APPROVAL_FEED_WORKFLOW.md` **(beta** **/** **suggestion** **items** **→** **same** **triage** **/ ** **packet** **shapes,** not **GOTV** **persuasion) **

---

## 1. Every **candidate**-**agent** **exchange** **(design** **log** **shape) **

*PII** **is** **not** **stored** **in** **a** **packet** **for** **unnamed** **roles;** **names** **/ ** **phones** **/ ** **addresses** **stay** **in** **the** **stewarded** **system** **of** **record,** **not** **in** **a** **markdown** **export** **to** **this** **repo** **or** **an** **unencrypted** **share. **

| **Field** | **Content** **(design) ** |
|-----------|----------------------------|
| **Source** **conversation** | **ID** **or** **session** **—** **internal,** not **voter**-**facing** **. ** |
| **Timestamp** | **UTC** **+** **who** **(role) ** **can** **see** **it** **(RACI) **—** **see** **§**44 **. ** |
| **Topic** | **Tag** **(e.g. ** county,** **trust,** **events) ** **. ** |
| **Page** **/ ** **section** **affected** | **Home** **/ ** **About,** **etc.,** **not** **`src/app/...` **(5E) **. ** |
| **Candidate** **exact** **wording** | **If** **the** **candidate** **typed** **it;** **redact** **if** **it** **includes** **PII** **of** **others** **. ** |
| **Summarized** **intent** | **One** **plain** **sentence,** **not** **a** **model** **hallucination** **(see** 5F **). ** |
| **Proposed** **knowledge** **update** | **A**-**chasing** **or** **B** **in** **`CONTINUOUS_...` **; **not** **A** **till** **MCE+comms** **(see** 5F **). ** |
| **Proposed** **website** **update** | **Static** **diff;** **not** **live** **till** **LQA+publish** **. ** |
| **Proposed** **Ask** **Kelly** **answer** **update** | **Only** **after** **A/B;** **not** **a** **second** **ship** **path** **(5B) **. ** |
| **Downstream** **impact** | **From** **`WEBSITE_EDIT_IMPACT_...` **; **none** **/ ** **low** **/ ** **med** **/ ** **high** **. ** |
| **Approval** **state** | **Packet** **queue,** not **“** **Kelly** **clicked** **publish** **”** on **a** **high**-**impact** **line** **(see** **no**-**approval** **exceptions) **. ** |

---

## 2. **Admin** **packet** **types** **(non**-**exhaustive) **

| **Type** | **Typical** **owner** **(see** **matrix) ** |
|----------|------------------------------------------|
| **Website** **copy** **edit** | **Comms** **+** **LQA** **. ** |
| **Candidate** **voice** **refinement** | **MCE+comms** **(B** **→** **A) ** **(5F) **. ** |
| **Policy** **position** **update** | **Candidate+comms+counsel** **as** **needed** **. ** |
| **FAQ** **update** | **5D** + **MCE,** **no** **new** **stats** **(see** `CAMPAIGN_COMPANION_ELECTION_...` **) **. ** |
| **Bio** **/ ** **story** **update** | **Comms;** **no** **new** **private** **facts** **without** **A** **(5F) **. ** |
| **Event** **/ ** **travel** **update** | **OIS+GCal** **truth,** not **a** **phantom** **(5D) **. ** |
| **Strategy** **/ ** **planning** **implication** | **CM+4B;** **may** **spawn** **`WorkflowIntake` **/ ** **`CampaignTask` ** **Preview,** not **Lock** **(2A) **. ** |
| **Budget** **implication** | **Treasurer** **/ ** **R2+;** not **a** **number** **in** **a** **non**-**R2** **packet** **(3H) **. ** |
| **Legal** **/ ** **compliance** **review** | **Counsel** **+** **MCE** **on** **contrast** **/ ** **fraud** **/ ** **statute** **. ** |
| **Research** **needed** | **Ops** **/ ** **comms** **;** not **a** **voter** **row** **quarry** **. ** |
| **Arkansas** **history** **/ ** **civics** **reference** **needed** | **Post**-**launch** **KB** **(see** `ARKANSAS_HISTORY_...` **),** not **a** **new** **unsourced** **claim** **in** **public** **copy** **. ** |

---

## 3. **Approval** **routing** **(summary) **

- **Candidate**-**owned** **wording** **edits** **with** **no** **downstream** **per** `WEBSITE_EDIT_IMPACT_...` **+** `CANDIDATE_EDITING_...` **: ** can **be** **implemented** **by** **admin** **/ ** **comms** **without** **a** **second** **candidate** **click,** but **not** if **MCE+** **LQA** **says** the **line** is **a** **legal** or **5D** **citation,** and **not** if **a** **high**-**impact** **(see** next **). **  
- **Legal,** **public** **claim,** **policy,** **contrast,** **finance,** **targeting,** **GOTV,** **budget** **(see** **matrices) **: ** must ****go** through **`APPROVAL_AUTHORITY_MATRIX` **+ **`playbooks/ESCALATION_PATHS` **+ **R2+** when **$** **(see** 5F **/ **2A **/ **3H) **. **  
- If **a** **change** **touches** **path**-**to**-**win,** **a** **public** **promise,** or **a** **campaign** **structure,** the **packet** **must** **show** **“** **downstream** **impact** **”** **in** **plain** **language** **before** **any** **publish** **(see** 4B,** **strategy** **tome) **. **

---

## 4. **Admin** **report** **format** **(per** **packet) **

1. **What** **Kelly** **changed** **(or** **asked) **, **in** **her** **words** when **relevant,** **redacted. ** **  
2. **Where** **it** **applies** **(page,** **FAQ,** **MCE) **. ** **  
3. **Why** **it** **matters** **(1–3** **lines) **, **not** a **dunk,** not **a** **smear,** not **a** **new** **unsourced** **opponent** **(see** 5B **MCE) **. ** **  
4. **What** **can** **be** **implemented** **now** **(low** **/ ** **none) **, **if** any **, ** with **LQA+comms,** not **a** **GOTV** **cut,** not **VFR** **(see** 5C) **. ** **  
5. **What** **needs** **review** **(who,** **by** **when) **. ** **  
6. **What** **should** **become** **a** `WorkflowIntake` **/ **`CampaignTask` **(Preview) **(see** `STRATEGY_...` **,** **4B) **. ** **  
7. **What** **should** **enter** **candidate** **A/B** **knowledge** **(see** `CONTINUOUS_...` **) **, **and** at **which** **state** **(not** **A** **till** **signed) **. ** **  
8. **What** **should** **update** **the** **public** **website** **only** **vs** **Ask** **Kelly** **only,** and **in** **what** **order** **(MCE) **, **if** both **(see** 5B **). **

**No** **raw** PII,** **no** **donor** **rows,** **no** **voter** **rows,** not **a** **full** **transcript** **to** **a** **non**-**authorized** **ear** **(see** **MI** **§**44) **. **

---

**Last** **updated:** 2026-04-28 (Pass 5G + 5H)
