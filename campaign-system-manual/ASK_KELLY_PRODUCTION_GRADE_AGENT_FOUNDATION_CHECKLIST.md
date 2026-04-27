# Ask Kelly — production-grade agent foundation checklist (Manual Pass 5H)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Pre**-**build** **readiness** **checklist** **(manual)** **—** **not** **a** **test** **suite** in **repo,** **not** a **shipped** **“** **agent** **”** **claim,** not **a** **waiver** of **LQA** **or** **the** **approval** **matrix** **(see** `ASK_KELLY_LAUNCH_PRIORITY_...` **,** `playbooks/APPROVAL_AUTHORITY_MATRIX` **,** `MANUAL_INFORMATION_REQUESTS_...` **§**45** **).**  

**Ref:** `CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md` (5E) · `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md` · `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` · `ASK_KELLY_SUGGESTION_BOX_AND_FEEDBACK_INTAKE_RULES.md` · `ASK_KELLY_BETA_FEEDBACK_TO_APPROVAL_FEED_WORKFLOW.md` · **Pass** **5I** `WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM.md` · `THANK_YOU_CARD_AND_APPRECIATION_WORKFLOW.md` (staff / CM surfaces; **not** a substitute for **5H** sequencing)

**Explicit sequencing rule (Pass 5H):** The **Ask** **Kelly** **launch** path **(**website** **editing** **+** **candidate** **onboarding** **+** **beta** **suggestion** **box,** with **governed** **packets) ** must **be** **completed** **and** **held** **production**-**grade** **per** **this** **checklist** **before** **the** **campaign** **invests** in **unrelated** **major** **subsystems** (full **CM** “**live** **intelligence**” **at** **scale,** **VFR,** **full** **CRM** **automation) **. **A **lean** **Netlify**-**class** public surface **can** **run** in **parallel,** with **the** **same** **governance** **(see** `ASK_KELLY_LAUNCH_PRIORITY_...` **). **

---

## 1. Content readiness

- [ ] Vetted public answers and FAQ pointers for the **first** **slices** (5D/5B where used).  
- [ ] Candidate-reviewed **B**-class areas for website review sessions **(not** A **till** MCE) **(5F) **. **  
- [ ] **Missing**-**content** **/fallback** **library** (bridge lines, not **null** talk).  
- [ ] **Election** **confidence** language **(sourced,** not **hype) **. **  
- [ ] **GOP** / **listening** language per 5E/5D (respectful, no unsourced contrast).  

---

## 2. UX readiness

- [ ] **Simple** **public** / **beta** **widget;** not **a** **full** **Workbench** **in** the **voter** **face** **(5C/5E) **. **  
- [ ] **Candidate** **mode** (review + **packet**-**shaped** **edits) **. **  
- [ ] **Beta** **mode** (role, expectations, no PII in tests) **(Pass** **5H** **). **  
- [ ] **Suggestion** **mode** (structured **per** **`ASK_KELLY_SUGGESTION_...` **). **  
- [ ] **Admin** **/ ** **staff** view **for** **packets** and **suggestion** **triage** **(design) **. **  
- [ ] **Progress** **checklist** (plain, **not** 0**–**6) **(5G) **. **  
- [ ] **Mobile** **/ ** **iPad** **usable** **(touch** **targets,** no **hover**-**only** **musts) **(5C) **. **  
- [ ] **Staff** / **CM** **morning** **brief** **+ ** **objective** **/ ** **get**-**involved** **cards** **(Pass** **5I) ** **—** **when** **those** **surfaces** **ship;** **not** **ahead** **of** **the** **5H** **first**-**release** **path** **(see** **`ASK_KELLY_LAUNCH_PRIORITY_...` **). **

---

## 3. Safety readiness

- [ ] **No** **PII** **/ ** **voter** **row** **/ ** **donor** **row** in **a** **public** **or** **unauth** **model** **(5C/3H,** **3H) **. **  
- [ ] **No** **stack** **traces** or **raw** **errors** to **voters** **(5E/5F) **. **  
- [ ] **No** **unapproved** **new** **policy** **/ ** **legal** **/ ** **$$** **claims** as **A**-**class;** **D**-**gaps** **get** a **bridge** **(5F) **. **  
- [ ] **No** **auto**-**publish** of **high**-**impact** **edits** **(5G** **+ ** `WEBSITE_EDIT_IMPACT_...` **+ **`CANDIDATE_EDITING_...` **). **  
- [ ] **Brief** / **ops** **copy** **(5I) ** **does** **not** **leak** **0**–**6** **, ** **paths,** **or** **sensitive** **IDs** **to** **unauth** **users** **(per** **public** **simple**-**view** **rules) **. **  
- [ ] **Thanks** / **appreciation** **(Pass** **5I) ** **does** **not** **ship** **PII,** **donor** **rows,** **or** **unapproved** **contrast** **in** **public** **/ ** **beta** **lines** **(see** **`THANK_YOU_...` **, ** `APPROVAL_AUTHORITY_MATRIX` **). **

---

## 4. Governance readiness

- [ ] **Admin** **review** **owner** **for** **feedback** / **suggestions** **(MI** **§**45** **+ **2A) **. **  
- [ ] **Candidate** **approval** **rules** where **voice** **/ ** **high**-**impact** **(matrix) **. **  
- [ ] **Suggestion** **triage** **SOP** **(dedupe,** **route,** **escalation) **. **  
- [ ] **Escalation** **(press,** **contrast,** **legal) **per **`playbooks/ESCALATION_PATHS` **. **  
- [ ] **Retention** **(logs,** **chats) **per **DPA/owner;** **not** in **this** **repo** as **raw** data **(§**45) **. **  
- [ ] **Audit** **/ ** **handoff** log **(who** **saw,** who **moved** **state) **— **product** **target** **. **

---

## 5. Technical readiness (for *later* engineering; design shapes here)

- [ ] **Role**-**aware** **auth** (public / beta / candidate / staff).  
- [ ] **Source** **+ ** **provenance** on **A**-**class** **chunks** **(5F) **. **  
- [ ] **Redaction** in **triage** and **RAG-****adjacent** **views** if **used. **  
- [ ] **Packet** **model** (fields **aligned** to **`CANDIDATE_TO_ADMIN_...` **). **  
- [ ] **Suggestion** / **feedback** **model** (categories, specificity, **status) **(Pass** **5H) **. **  
- [ ] **Candidate** **review** **sessions** **(resume,** page **pointer) **(5G) **. **  
- [ ] **State** **machine** (New** **→** **Implemented,** **etc.) **(beta** **feed** **file) **. **  
- [ ] **Netlify** (or other) **env** **separation** (public, **not** **admin** **secrets) **. **  
- [ ] **Fallbacks** (offline, rate limit) **=** **calm** **copy,** not **trace** **(5E) **. **

---

## 6. Launch readiness levels (operational, not 0–6 in public UI)

| Level | What it means |
|-------|-----------------|
| **Internal** **demo** | Team-only; can break. |
| **Candidate** **alpha** | **Kelly-**facing, **MCE+** **guardrails,** no wide link. |
| **Beta** **volunteer** **test** | **Approved** **list;** **suggestion** path **+ ** **explain-****why. ** |
| **Controlled** **public** **soft** **launch** | **Small** **audience,** still **LQA+** for **A**-**lines. ** |
| **Broader** **public** **launch** | **Full** **governance;** not **a** **claim** in **this** **manual. **

---

**Last updated:** 2026-04-28 (Pass 5H + 5I)
