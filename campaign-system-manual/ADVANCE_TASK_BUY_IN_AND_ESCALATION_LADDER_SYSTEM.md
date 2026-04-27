# Advance task buy-in and escalation ladder system (Manual Pass 5K)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Doctrine** for **asking** **early,** **earning** **buy**-**in,** **giving** **a** **clear** **claim** **landing,** and **escalating** **before** **crisis** **—** **not** a **shipped** **auto**-**assign** **or** **shame** **nudge** **engine;** **RACI** and **`playbooks/APPROVAL_AUTHORITY_MATRIX.md`** + **`playbooks/ESCALATION_PATHS.md`** still **govern** **sends,** **$,** and **compliance** **(see** `DAILY_APPROVAL_LAUNCH_AND_TASK_ROUTING_SYSTEM.md` **,** `WORKBENCH_OPERATOR_RUNBOOK.md` **, **5J** **).**  

**Ref:** `TASK_FLOW_FORECASTING_AND_HUMAN_WORK_PLAN.md` · `HUMAN_INTERACTION_TASKS_IN_EVERY_BRIEF.md` · `VOLUNTEER_RETENTION_ENGAGEMENT_AND_LOW_TURNOVER_SYSTEM.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§**48**)

---

## 1. Core concept

- **Ask** **early** so **people** can **plan** **capacity,** not **be** **surprised** **at** the **last** **minute. ** **  
- **Get** **buy**-**in** **: ** **explicit** **claim** or **decline** **/ ** **adjust,** not **“** **it**’**s** on **your** **name**”** in **a** **silent** **row** **. ** ** **  
- **Create** **a** **landing** **place** (see **§**5** **) **: **one** **URL** or **governed** **task** **view** with **outcome,** **time,** **and** **help** **path** **(when** **built) ** **. ** **  
- **Escalate** **before** **crisis: ** when **a** **task** is **stuck** in **unclaimed** or **stale,** **move** it **up** the **ladder** **(§**4** **)** **—** not **a** **public** **shame** **thread** **. ** **

**No** **auto**-**assignment** to **a** **named** **volunteer** **without** **buy**-**in** **unless** **emergency** or **RACI**-**blessed** **break**-**glass** **(MI) **. **

---

## 2. Task lifecycle (labels)

| Status | Meaning |
|--------|---------|
| **Forecasted** | On **horizon;** **not** **yet** **routed** to **a** **person** **(see** `TASK_FLOW_...` **). ** ** |
| **Suggested** | **Proposed** **owner** or **role;** **not** **sent** as **an** **ask** **. ** ** |
| **Asked** | **Outreach** **delivered;** **clock** for **view** / **claim** **starts** **(see** **§**3** **) **. ** ** |
| **Viewed** | **Recipient** **opened** **the** **landing** **(when** **product** **tracks;** **or** **logged** in **SOP) **. ** ** |
| **Claimed** | **Assignee** **accepts** **ownership** **(may** still **be** before **“** **started** **”** **) **. ** ** |
| **Accepted** **with** **adjustment** | **“** **I**’**ll** do **it** but **not** by **X** / **need** **Y**”** **—** **logged** **+ ** **CM** or **lead** **confirms** **(see** `WORKBENCH_OPERATOR_RUNBOOK` **). ** ** |
| **Needs** **help** | **Stuck;** not **a** **failure** **—** **routes** to **ladder** **(§**4** **) **. ** ** |
| **Declined** **with** **reason** | **Valid;** **triggers** **reassign** **/ ** **escalation,** not **a** **black** **mark** **. ** ** |
| **Unclaimed** | **After** **ask** **window,** no **claim** **(see** **§**3** + ** **§**6** **) **. ** ** |
| **Escalated** | **To** next **rung** **(§**4** **);** **per** `ESCALATION_PATHS` **if** **sensitive** **. ** ** |
| **Reassigned** | **New** **owner** **+ ** **reason;** **no** **silent** **moves** **(5J) **. ** ** |
| **Completed** | **Substantive** **work** **done** **(may** need **LQA+** for **outbound) **. ** ** |
| **Closed** **with** **evidence** | **Audit**-**ready** **: ** **link,** **summary,** **or** **“** **no** **send** **”** **as** **governed** **(see** `WORKBENCH_OPERATOR_RUNBOOK` **closeout) **. ** ** |

---

## 3. Advance ask windows (default; Steve locks in **MI** **§**48** **) **

| Window | Typical** **use** ** |
|--------|--------------------|
| **Same**-**day** **emergency** | **P0** **, ** **safety,** **press,** **fraud**-**adj;** **RACI** may **bypass** **leisure** **notices,** **not** **matrix** **. ** ** |
| **48**-**hour** **ask** | **Tight** **turn;** still **a** **real** **ask** **(typical** **use) **. ** ** |
| **72**-**hour** **ask** | **Default** **tour** / **meeting** **/ ** **event**-**adj** follow-up (where **3F** / **3G** **SOP) **. ** ** ** ** ** |
| **7**-**day** **ask** | **Prep** **/ ** **training** / **comms** **/ ** **field** **blocs** **. ** ** ** ** ** |
| **14**-**day** **ask** | **Bigger** **builds,** **multi**-**step** **. ** ** ** ** ** |
| **30**-**day** **planning** **ask** | **Strategic** **/ ** **capacity**-**shaped** work **(see** 4B **/ ** **sim) **; **not** a **lock** without **`CampaignTask` **+ **LQA+** for **outbound) **. ** ** ** ** ** ** |

**Timestamps** in **X** **hours** **unviewed,** **X** **hours** **unclaimed** = **TBD** in **MI** **(no** **invented** **SLA** in **this** **file) **. **

---

## 4. Escalation ladder (internal ops / vol path)

1. **Assignee** (named or **pooled) ** **  
2. **Team** **lead** (field, **comms,** **data**-**as**-**governed) ** **  
3. **County** **/ ** **role** **lead** (county **point,** **P5** lead where **SOP) ** **  
4. **Volunteer** **coordinator** (V.C.) ** ** **  
5. **CM** **/ ** **admin** **(Workbench) ** ** **  
6. **Owner** **/ ** **candidate** **only** when **matrix** or **O**+**C** **/ ** **break**-**glass** **says** so **(not** a **default** for **ordinary** **task** **escalation) **. **

**Candidate** is **not** a **triage** **inbox** for **every** **stuck** **vol** **card** **;** use **5** for **reassign,** not **6,** **unless** **RACI** **requires** **(see** `ESCALATION_PATHS` **).** **

---

## 5. Claim landing page requirements (design target)

When **built,** every **ask** **resolves** to **one** **clear** **surface** (or **emulated** **in** a **`CampaignTask` ** with **this** **checklist) **: **

- **What** the **task** is **(one** **plain** **paragraph) **. ** ** **  
- **Why** it **matters** **(strategy** **/ ** **relationship,** not **a** **guilt** **hook) **. ** ** ** ** **  
- **Expected** **outcome** **(deliverable** **or** **“** **done** **means** **…** **”) **. ** ** ** ** ** **  
- **Due** **date** or **window** **. ** ** ** ** ** **  
- **Estimated** **time** **(honest;** **TBD** is **ok) **. ** ** ** ** ** **  
- **Script** **/ ** **template** **(if** any) ** + ** **MCE** for **sensitive) **. ** ** ** ** ** **  
- **What** **“** **done** **”** **means** **(checklist) **. ** ** ** ** ** **  
- **Who** to **ask** for **help** (role) **,** not **a** **DM** to **a** **random** **cell** with **PII) **. ** ** ** ** ** **  
- **Decline** **/ ** **adjust** **(reason** **optional** **/ ** **required) **. ** ** ** ** ** **  
- **Complete** **(logs** **evidence) **. ** ** ** ** ** **

---

## 6. Escalation** **rules (examples; **X** = **set** in **MI** **) **

- **Unviewed** after **X** **hours** **from** **ask** (non**-**emergency) **. ** ** **  
- **Viewed** **but** **unclaimed** after **X** **hours** **. ** ** ** ** **  
- **Claimed** **but** **stale** (no** **update) **. ** ** ** ** ** **  
- **Deadline** **approaching** with **no** **progress** line **. ** ** ** ** ** **  
- **High**-**impact** **task** **blocked** (LQA, **T,** **C) **. ** ** ** ** ** **  
- **Repeated** **non**-**response** to **governed** **asks** (route** **V.C.,** not **a** **peer** **flame) **. **

---

## 7. Tone (non-negotiable)

- **Never** **shame**; **no** **“** **lowest** **performer** **”** **in** a **public** **brief** **(5C) **. ** **  
- **Assume** **capacity** **/ ** **life** first; **ask** for **clarity,** not **a** **loyalty** **test** **. ** ** ** ** ** **  
- **Protect** **dignity**; **escalation** = **reassign,** not **a** **public** **callout** **. ** ** ** ** ** **  
- **Buy**-**in,** not **task** **dumping**; **WIP** **and** **cool**-**down** see **`VOLUNTEER_RETENTION_...` **. **

---

## 8. Sample** **copy** **(fictive;** **MCE+** for **outbound) **

**First** **ask**  
“We’re [advance notice] out from [event/task]. This helps [outcome] because [one line]. If you can take it, you’d own [deliverable] by [date]. If not, a quick ‘’can’t’ with reason’ helps us reassign with respect.”

**Reminder**  
“Checking in on [task] — we’re at [T minus]. If you’re in, [one step]. If capacity shifted, that’s normal — use decline/adjust and we’ll route.”

**Escalation** (internal)  
“[Task] is unclaimed past window — routing to [next rung] to protect [assignee] from pile-on and [event] from risk. No names in #public.”

**Reassign**  
“Reassigning [task] to [role] for [date]. Prior assignee: capacity — thank you for the honest no.”

**Thank**-**you** after **completion**  
“We closed [task] — [specific, non-PII] impact. You made [county/team/hosts] more supported. Thank you.”

---

**Last** **updated:** 2026-04-27 (Pass 5K)
