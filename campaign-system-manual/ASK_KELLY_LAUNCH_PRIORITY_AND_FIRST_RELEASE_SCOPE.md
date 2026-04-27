# Ask Kelly — launch priority and first release scope (Manual Pass 5H)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Doctrine and sequencing** for the **first** **Ask** **Kelly** **/ ** **Campaign** **Companion** **public** **release** **—** **not** a **shipped** **product** **claim,** not **a** **substitute** for **`APPROVAL_AUTHORITY_MATRIX` ** **or** **LQA** **(see** `MANUAL_PASS_5H_COMPLETION_REPORT.md` **,** `ASK_KELLY_PRODUCTION_GRADE_AGENT_FOUNDATION_CHECKLIST.md` **).**

**Ref:** `CANDIDATE_WEBSITE_REVIEW_WIZARD_AND_APPROVAL_WORKFLOW.md` · `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` · `WEBSITE_EDIT_IMPACT_ANALYSIS_AND_DOWNSTREAM_DEPENDENCY_RULES.md` · `CANDIDATE_EDITING_RIGHTS_AND_NO_APPROVAL_EXCEPTIONS_POLICY.md` · `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md` · `ASK_KELLY_SUGGESTION_BOX_AND_FEEDBACK_INTAKE_RULES.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**45

**Product honesty:** This manual **does** **not** assert that **all** **first**-**release** **items** **exist** **in** **code** **today;** it **sets** **priority** **and** **scope** **before** **and** **during** **build.**

---

## 1. First-release priority (order)

1. **Candidate** **website** **review** **wizard** **/ ** **website** **editing** **flow** (governed candidate→admin **packets,** **impact** **triage** **per** 5G).  
2. **Candidate** **onboarding** **through** **Ask** **Kelly** (plain **language,** **progress** **checklist,** **no** **auto**-**publish** on **high**-**impact** **lines**).  
3. **Beta** **volunteer** **onboarding** (invite, **role,** **suggestion** path **—** not **P5** as **GOTV** **persuasion**; **see** `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP` **§**22).  
4. **Ask** **Kelly** **suggestion** **box** (structured **intake,** not **a** **random** **DM**).  
5. **Admin** **/ ** **candidate** **approval** **feed** (review **queue,** **statuses,** **no** **public** **argument** **loop** **—** `ASK_KELLY_BETA_FEEDBACK_TO_APPROVAL_FEED_WORKFLOW.md`).

**Sequencing rule:** **Do** **not** **build** **unrelated** **major** **subsystems** (full **CM** “**live** **intelligence**,” **VFR,** **full** **CRM** **automation) ** **before** **this** **path** is **production**-**grade** **per** **`ASK_KELLY_PRODUCTION_GRADE_AGENT_FOUNDATION_CHECKLIST.md` **. **A **lightweight** **public** **web** experience **(e.g. ** **Netlify** **) ** can **ship** **while** **deeper** **Workbench** **work** **continues,** with **the** **same** **governance** **and** **public** **naming** **rules.**

**Pass** **5I (Workbench** **/ ** **ops** **,** not **a** **5H** **insert):** **Morning** **brief,** **objective** / **get**-**involved** **cards,** and **the** **thank**-**you** / **appreciation** **workflow** are **separate** **design** / **emulation** **artifacts** (`MANUAL_BUILD_PLAN.md` Pass 5I). **Do** **not** **reorder** or **delay** the **5H** list **§**1 **above** to **build** **these** **first;** they **are** **staff**-**facing** **/ ** **CM**-**facing** **foundation** that **can** **land** **after** **or** in **parallel** **with** **production**-**grade** **5H,** with **RACI** **unchanged.**

---

## 2. What is in first release (design target)

| Pillar | In scope (when built) |
|--------|------------------------|
| **Invites** | **Candidate** **email** to **start** **website** **review** **/ ** **Ask** **Kelly** **onboarding** (`CANDIDATE_WEBSITE_EDITING_ONBOARDING_EMAIL.md`); **beta** **volunteer** **invite** (`BETA_VOLUNTEER_ONBOARDING_INVITE_AND_ROLE_EXPLAINER.md`). |
| **Public surface** | **Simple** **Ask** **Kelly** **widget;** **plain** **“** **guided** **help** **”** **/ ** **“** **suggestion** **box** **”** **—** not **“** **AI** **”** in **public** **copy** (`CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md`). |
| **Modes** | **Candidate** **review** **mode;** **beta** **feedback** **mode;** **suggestion** **intake** **(structured).** |
| **Content** | **Plain**-**language** **answers** to **“** **why** **is** **this** **built** **this** **way?** **”** **(**`ASK_KELLY_EXPLAIN_WHY_GUIDE.md` **).** |
| **Operator path** | **Admin** **packet** **queue;** **approval** **status** **labels** **(**`CANDIDATE_TO_ADMIN_...` **,** `ASK_KELLY_BETA_FEEDBACK_...` **).** |

---

## 3. What is not in first release

- **Full** **live** **campaign** **intelligence** **(CM** **command** **briefing** **—** 5F **design,** not **v1** **public** **or** **beta** **priority).  
- **Voice** **/ ** **TTS** **/ ** **IVR** **(**`ASK_KELLY_VOICE_...` **;** **MI** **§**43 **).**  
- **Arkansas** **history** **KB** **(**post**-**launch** **—** 5G **).**  
- **Voter**-**file** **row** **access** in **a** **chat** **/ ** **model** **(**no **VFR** **in** **public** **Ask** **Kelly** **;** 5B **/ ** **RACI** **).**  
- **Full** **CRM** **or** **automation** of **all** **relationships** **—** not **a** **substitute** for **2A** **triage** **or** **MCE/NDE.**  
- **Public** **claim** **auto**-**publishing** **(especially** **high**-**impact: ** $** **, ** **legal,** **4B,** **GOTV,** **contrast) **—** default **N** per **`CANDIDATE_EDITING_RIGHTS_...` ** + **`WEBSITE_EDIT_IMPACT_...` **.

---

## 4. Production-grade minimums (before calling “ready”)

- **No** **internal** **system** **leakage** (paths, 0–6, stack traces, task ids on public) — `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md`.  
- **Graceful** **missing**-**content** **copy** (bridge, “coming soon,” not schema talk).  
- **Clear** **suggestion** **structure** (required **fields) **— **`ASK_KELLY_SUGGESTION_BOX_...` **. **  
- **Admin** **review** **queue** **+ ** **RACI**-**blessed** **owner** **(**MI** **§**45** **).**  
- **Candidate** **/ ** **admin** **packet** **visibility** **where** **governed;** **not** **public** **sensitive** **drafts** **(see** 5G **).**  
- **Audit** **trail** **(who** **saw** **/** **approved,** **at** **what** **step) **— **design** **target** **,** not **a** **claim** **in** **this** **repo** **. **  
- **Role** **separation** (voter / beta / candidate / staff) **per** **5E** **+ ** **Pass** **5H** **. **  
- **Safe** **fallbacks** (escalation to **human,** not **a** **hallucinated** **stat** **—** `playbooks/ESCALATION_PATHS` **,** 5B **/ **5D** **as** **needed** **).**  

---

## 5. Netlify / lightweight web path

- A **lean** **public** experience **(e.g. ** **Netlify** **) ** can **launch** **so** **Kelly**-**facing** **and** **beta**-**facing** **copy** **ships** **without** **waiting** for **full** **Workbench** **parody** **. **  
- **Public** **copy** **avoids** **“** **AI** **”** as **a** **product** **label;** use **“** **Ask** **Kelly** **,”** **“** **Campaign** **Companion** **,”** **“** **guided** **help** **,”** or **“** **suggestion** **box** **”** (see `SYSTEM_READINESS_REPORT.md` naming line).  
- **Environment** and **governance** **(who** **approves** **what** **before** **link** **goes** **wide) ** = **MI** **§**45 **+ **`APPROVAL_AUTHORITY_MATRIX` **. **

---

## 6. Success criteria (launch doctrine)

- The **candidate** can **review** **website** **pages** in **a** **governed** **flow.  
- The **candidate** can **submit** **edits** **as** **usable** **admin** **packets,** not **unstructured** **noise** **. **  
- **Admins** **receive** **packets** **with** **enough** **context** to **triage** **(page,** **delta,** **impact).**  
- A **beta** **volunteer** **understands** **their** **role** **(test,** **clarity,** **suggest** **—** not **GOTV** **cuts** from **a** **chat) **. **  
- A **beta** **user** can **ask** **why** **something** **exists** and **get** **plain** **explanations** **without** **internal** **jargon** **(see** `ASK_KELLY_EXPLAIN_WHY_GUIDE` **).**  
- A **beta** **/ ** **public** **user** can **submit** **specific** **suggestions** **through** the **suggestion** **box** path **(not** only **ad** **hoc** **texts) **. **  
- **No** **confusing** **backend** **language** **appears** to **voters** **or** **beta** **testers** **(see** 5E **+ **5F** **+ **5H** **) **. **

---

**Last updated:** 2026-04-28 (Pass 5H + 5I)
