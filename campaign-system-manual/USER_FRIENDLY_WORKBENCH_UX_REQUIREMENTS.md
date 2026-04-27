# User-friendly Workbench UX requirements — Manual Pass 5C

**Lane:** `RedDirt/campaign-system-manual`  
**Purpose:** So **no** one opens **Workbench** and **feels** **lost** — every **dashboard** **teaches** **itself** through **Pathway** **Guide**, **Workbench** **Guide**, **Campaign** **Companion** entry points, and **plain** **language**. **Not** a promise that all **UIs** **match** this **spec** **today** (`SYSTEM_READINESS_REPORT.md`).

**Refs:** `IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md` · `playbooks/DASHBOARD_ATTACHMENT_RULES.md` · `PROGRESSIVE_ONBOARDING_AND_UNLOCK_SYSTEM.md` · `GUIDED_REPORT_BUILDER_AND_ASSISTED_QUERY_SYSTEM.md` · `WORKBENCH_LEARNING_GAMEPLAY_MODEL.md` · **Pass** **5H** `ASK_KELLY_EXPLAIN_WHY_GUIDE.md` **(companion** **explainability** **,** not **0**–**6) ** · **Pass** **5I** `DASHBOARD_OBJECTIVE_AND_GET_INVOLVED_CARD_SYSTEM.md` · `THANK_YOU_CARD_AND_APPRECIATION_WORKFLOW.md` · `WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM.md`

---

## 1. Dashboard layout principles

- **One** **focal** **column** (primary work) and **one** **context** **column** (help, next learning, org pulse).  
- **Progressive** **disclosure:** **advanced** **filters** **behind** “**More**” — default **is** **calm**.  
- **Branded** **clarity,** not **cluttered** “mission control” for **new** **users**.  
- **Every** **card** has: **title** (plain English), **one** **line** **why** **it** **matters,** and **if** **locked:** **how** to **unlock** + **who** **approves** (`PROGRESSIVE_ONBOARDING` §7–8).  
- **“** **Why** **is** **this** **built** **this** **way?** **”** **(Pass** **5H) **: ** for **public** **and** **beta,** the **companion** **/ ** **Ask** **Kelly** path **can** **explain** **service**-**shaped** **reasons** **(strategy,** **trust,** **onboarding) ** **per** `ASK_KELLY_EXPLAIN_WHY_GUIDE.md` **—** not **0**–**6,** not **VFR,** not **a** **second** **NDE** **bypass. **
- **Objective** and **get**-**involved** **cards (Pass 5I):** **one**-**line** **today** / **week** / **month** + **P0** **/ ** **blocked,** and **a** **safe** **“** **thank** **someone** **/ ** **get** **involved** **”** **pattern,** not **a** **second** **intelligence** **surface** **(see** `DASHBOARD_...` **+ **`THANK_YOU_...` **).**

---

## 2. Mobile and iPad-first

- **Touch** **targets** for **triage** in **work** **sprints**; **no** **hover**-**only** **must**-**have** **actions** (per iPad SOP; full **hardening** of **all** **routes** **not** **claimed**).  
- **Read**-**leaning** on **device** for **4B** **/ **comms** **approve**; **edits** **gated** per **4B** **+** **IPAD** **doc** **+** `APPROVAL_AUTHORITY_MATRIX` **(see** `DASHBOARD_ATTACHMENT_RULES` **Pass** **4B** **row).  
- **Offline**-**tolerant** **messaging** when **rural** **=** **“save** **draft,** **sync** **when** **online**” **—** not **silent** **data** **loss** **(design** **target). **

---

## 3. First-login experience

- **3** **steps** max before **any** real **work:** **(1)** **values** **(M-001)**, **(2)** **what** **this** **screen** **is,** **(3)** **one** **safe** **next** **action** **(see** `PROGRESSIVE_ONBOARDING` **).**  
- **No** **password**-**gated** **voter** **/ **$** on **day** **one**.  
- **Name** the **Pathway** (volunteer, P5, staff) so **copy** is **relevant** **—** not **one** **generic** **tour** **for** **every** **rôle**.

---

## 4. Empty states that teach

- **Empty** = **a** **Field** **Guide** **panel:** “**This** is **empty** because… **(no** **shifts,** **no** **assignments,** **awaiting** **CM) **+ **one** **link** to **unblock** (training, request, or example).**  
- **No** “**You** have **0**” **shame;** use **encouraging** **progress** **(see** **§**11).**

---

## 5. Tooltips and “why am I seeing this?”

- **(i)** on any KPI strip: one to two sentences plus “where this number comes from” (treasurer, OIS, or mock in demo).  
- **“**Why **locked?**” **links** to **training** **id,** **approver,** or **LQA** **row** in **help** (not a wall of text).

---

## 6. Locked cards and unlock prompts

- **Lock** = **icon** + **explanation** + **CTA** (“**Request** access,” “**Complete** M-**00**3**,” “**Ask** your **P5** **leader**”).  
- **Never** **treat** a **lock** as **a** **defect** **in** the **user** **—** it’s **a** **compliance** **feature**.

---

## 7. Task cards in plain English

- **Title** = **outcome,** not **jargon** (`TT-**xx**` **in** **metadata,** not **in** the **user**-**facing** **title** **unless** **staff** **mode** **).**  
- **“**Explain** **this** **task**”** **button** = **1**-**2** **paragraphs** from **playbook** **or** **template** **—** not **a** **legal** **brief**.

---

## 8. One-click “explain this task” and “what do I do next?”

- **Next** = **highest** **P0** in **user** **scope,** or **onboarding** **if** no **P0,** with **WIP** **respected** (Workbench runbook).  
- **Companion** **(see** `GUIDED_...` **):** “**I**’m **stuck**” **routes** to **help** or **suggested** **draft** **task,** not **sensitive** **action**.

---

## 9. “Ask the Campaign Companion” pattern

- **Persistent** entry on nav (when built): search-leaning for (a) how-to, (b) report, (c) escalation path (`playbooks/ESCALATION_PATHS.md`) — not a chat interface for voter data.  
- **Vocabulary:** **Guided** **help,** **assistant,** **Field** **Guide** **—** not **“**AI**”** **in** **public** **copy**.

---

## 10. Visual progress without shame

- **Milestones** = **onboarding,** first **contribution,** **7**-**day** **streak** **(optional)**, **training** **badges,** not ****who**-**dial**-**the**-**most**-**voters** **public** **ranks.  
- **Progress** **bars** = **clarity,** not **fear;** no **comparative** “**you**’re **behind** **Pulaski**” **in** a **way** that **drives** **data** **misuse** **(see** **§**12).**  

---

## 11. Badges, achievements, and milestones (ethical design)

- **OK:** **M-001** **complete,** “**first** **task** **closed,**” “**P5** **team** **launched** (honest **definition).**”  
- **Not** **OK:** **“**dial** 500** people** in **a** day** or **you**’re** **a** C**-****volunteer**;** any **badge** that **encourages** **bypass** **of** **PII,** **consent,** or **approval** **matrix**.  
- **Rural** / **elder** **/ **low**-**tech** **users** **=** **no** **penalty** for **slower** **progress** **;** **offline**-**first** where **relevant** **(§2).**

---

## 12. Avoid gamification that pressures data mishandling

- **No** “**unlock** $ **tools** at **10**-**K** **points**.” **No** **speed**-**to**-**voter**-**row** as **a** **game** **quest**.  
- **Incent** **right** **behavior:** follow-up **SLA,** **clean** **closeout,** **defect** **&lt;** **threshold,** with **coaching** if **defects** **rise** **(private,** not **a** **wall**-**shame** **board).**  

---

## 13. Accessibility and low-tech users

- **WCAG**-**directional** **(when** **built):** **contrast,** **focus** **order,** **no** **color**-**only** **status,** **large** **hit** **targets**.  
- **Readability** = **6th**-**8th** **grade** **for** **core** **task** **copy,** with **glossary** **for** **political** **jargon** **(Field** **Guide).**  

---

## 14. Rural connectivity assumptions

- **Assume** **sporadic** **LTE**; **retry** with **jitter,** show **“**saved** **—** will **send**” **.  
- **Avoid** **large** **auto**-**refreshed** **grids;** offer **paged** or **canned** **summary** **.  

---

## 15. Training mode / demo mode with fake data

- **Demo** **/ **“**practice**” **=** **clearly** **watermarked,** no **voter** **PII,** no **$** **that** could **conflate** with **reality,** and **obvious** “**this** is **a** **simulation**” **(see** `STRATEGY_TO_TASK_...` **Preview) **.  
- **Switch** **out** to **real** only **with** **readiness** and **LQA** **(see** `ROLE_BASED_UNLOCK_...` ** + ** `ROLE_READINESS_MATRIX` **).**  

---

**Last updated:** 2026-04-28 (Pass 5C + 5H + 5I)
