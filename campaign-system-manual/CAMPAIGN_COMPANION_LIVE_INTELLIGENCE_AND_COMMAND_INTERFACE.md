# Campaign Companion — live intelligence and command interface (Manual Pass 5F)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Design and governance** for a **future** **internal** **campaign** **manager** **(CM) / **leadership**-**class** **command** **view** **—** **not** a claim that this **omniscient** **real**-**time** **UI** is **shipped,** and **not** public “**AI**” **branding** (`USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md`).

**Extends:** `CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md` (Pass 5E Layer A/B) — 5E defines **orchestration;** 5F defines **what** **authorized** **operators** **may** **ask,** **from** **which** **signals,** and **how** **answers** **separate** **summary** **from** **action.**

**Ref:** `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` · `WORKBENCH_OPERATOR_RUNBOOK.md` · `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `playbooks/ESCALATION_PATHS.md` · `playbooks/DASHBOARD_ATTACHMENT_RULES.md` · `SYSTEM_READINESS_REPORT.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**43 · **Pass** **5G** `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` · `CANDIDATE_WEBSITE_REVIEW_WIZARD_AND_APPROVAL_WORKFLOW.md` (candidate-driven content still becomes **packets** and **impact** **triage** before public **or** **A**-**class; **not** a **CM** **chat** **that** **auto**-**ships** **static) **

---

## 1. What “live intelligence” means — and does not mean

| **Means (design target)** | **Does not mean** |
|---------------------------|-------------------|
| **Aggregated,** **role**-**authorized** **glimpses** of **workbench** **and** **comms** **queues** (aging, count by **type,** not by named voter) | **Live** access to **voter** **rows,** **full** **DM** **text** **in** **bulk,** or **secret** **ops** in **chat** |
| **“** **Right** **now** **”** in **the** **sense** of **time**-**bounded** **rollups** **(today,** **this** **week)** **backed** **by** **auditable** **system** **objects** (when **those** **objects** **exist** **in** **product) | **A** **guarantee** **of** **zero** **latency** **or** **completeness** **—** OIS, **inbox** **slices,** and **ingest** **can** **be** **partial** per `SYSTEM_READINESS_REPORT.md` |
| **Provenance**-**first** **answers:** **this** **number** **comes** **from** **[approved** **view],** **not** **from** **a** **model** **inventing** **campaign** **facts** | **“I** **know** **everything**” **as** an **orchestrator** **persona;** public **facing** **companion** still uses **5E** **B**-**layer** **rules** |

**Product honesty:** **Pass** **5F** is **manual** only. A **read**-**shaped** **command** **briefing** **product** may **not** **exist** **in** **code;** this **file** is **governance** **for** **when** it **is** **built**.

---

## 2. Public vs internal visibility

| **Surface** | **May** **see** | **Must** **not** **see** **(casually)** |
|-------------|----------------|----------------------------------------|
| **Public** **Ask** **Kelly** / **site** | **Vetted** **public** **copy,** **Pathway/CTA,** **high**-**level** **values;** **event** **pointers** **from** **published** **sources** | **Internal** **queue** **age,** **task** **ids,** **readiness** **grades,** **degraded** **backend** **signals** **(see** `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md` **)** |
| **Role**-**gated** **volunteer** | **That** **user’s** **Pathway,** **assigned** **missions,** **county/interest** **they** **volunteered,** **sanitized** **“** **what**’**s** **next** **”** | **Other** **volunteers’** **PII,** **other** **counties**’ **rosters,** **donor** **or** **targeting** **detail** |
| **Insider/CM/owner** (when **product** + **RACI** allow) | **Aggregates** on **`WorkflowIntake`**, **`CampaignTask`**, **approval** **queues,** **event** **follow**-**up,** **finance** **flags** **at** **matrix**-**blessed** **depth** | **Voter**-**row** **exports,** **unapproved** **opposition** **dossier,** **raw** **conflict,** **treasurer**-**only** **detail** without **R2+** (per `playbooks/ROLE_READINESS_MATRIX.md` **+** `PROGRESSIVE_ONBOARDING_...` **)** |

**Separation** the **orchestrator** must **output** (see **also** `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md` **)**:

- **Public** **voter**-**facing** **answer** (plain, human, no leakage).  
- **Volunteer** **next** **step** (one **action,** one **CTA,** no **bypass** of **LQA** **/ **MCE** **)**.  
- **Staff**-**facing** **operational** **report** (counts, **aging,** **priority,** **where** **to** **look** in **Workbench**).  
- **Candidate**-**refinement** **item** (missing **policy** / **position** / **wording,** not **auto**-**published** **)**.  
- **Escalation** / **approval** **requirement** (comms, **counsel,** **treasurer,** **MCE** **+** `APPROVAL_AUTHORITY_MATRIX` **).

---

## 3. What the campaign manager should be able to ask (design prompt catalog)

*Examples are **governance** only — **not** a **promise** the **app** can **run** them **right** **now** **or** with **infinite** **precision** **without** **missing** **fields** in **schema/UX** **.**

| **Prompt** | **Intended** **safe** **shape** of **answer** | **Gates** |
|------------|---------------------------------------------|-----------|
| **Who** **is** **currently** **active?** (volunteers, **staff,** **assigned** **roles) | **Time**-**bound** **aggregate** (e.g. “**X** **pathway** **actions** in **last** **24h**” **or** “**N** **tasks** **in** **progress** **by** **type**”) — **not** a **voter** **census** | **Role,** no **row** **dump**; **may** be **TBD** if **source** not **connected** (say **provenance**-**first** per **5F** public **simple** **view** for **non**-**CM** **if** same **Q** is **routed** **wrong** **)** |
| **Who** **has** **interacted** **today?** (campaign **touch** **points) | **Funnel** **aggregates,** not **a** **list** of **residents**; **or** “**M** **form** **submissions,** **K** **inbox** **touches,** **see** **queue**” **(when** **those** **exist) | **No** PII in **insecure** **channel**; **de**-**identify** in **any** **summary** **pushed** to **a** **model** without **DPA/authorization** |
| **What** **tasks** **are** **moving?** (status **churn) | **By** `CampaignTask` / **or** **SOP-****mapped** **queue**; **stale** **def** in **SOP;** not **a** **motivation** **judgment** | **LQA** **still** **owns** **ship;** no **“auto** **approve**” |
| **What** **tasks** **are** **stale?** | **SLA** **from** `WORKBENCH_OPERATOR_RUNBOOK` **(Pass** **5) **+** **aging** **fields** | **Triage** = **suggest,** not **reassign** **sensitive** **roles** without **RACI** |
| **Which** **counties** **have** **activity** **this** **week?** | **OIS**-**honest,** **field**-**report** **rollup** or **“**TBD,** need** **county** **captain** **report**” **—** not **invented** **precinct** **hot** **maps** | **3D**-**3F** data **gaps** = **acquisition** first |
| **Which** **volunteers** **are** **stuck?** | **State**-**machine** / **onboarding** **drop**-**off,** not **a** **shame** **list**; **suggest** **touches** to **VCoord** / **regional** | **GDPR**-**ish** **care:** **“**stuck**”** = **no** **progress** in **7d,** not **a** **character** **label** |
| **Which** **conversations** **need** **human** **follow**-**up?** | `CommunicationThread` / **inbox** **classes** (when **in** product); **escalation** to **per** `ESCALATION_PATHS` | **Comms/press** for **sensitive** **traces** |
| **Which** **messages** **are** **waiting** **for** **approval?** | **LQA/NDE** **queue,** not **the** **draft** **in** a **public** **chat** | `APPROVAL_AUTHORITY_MATRIX` |
| **Which** **events** **need** **follow**-**up?** (thank**-**yous,** **nurture) | `CampaignEvent` + **OIS,** or **GCal** **SOP;** not **a** **fake** “**I** **was** there**”** | **Seed** **vs** **live** in **5D/website** **motion** **docs** |
| **Which** **finance** **items** **need** **treasurer** **action?** | **Exception** list **in** `FinancialTransaction` / **compliance** **SOP,** at **R2+** | **Not** a **dollar** **amount** in **a** **CM** **chat** to **a** **non**-**R2** **user**; **not** a **line**-**item** **donor** **list** in **a** **summary** for **an** **unauth** user |
| **Which** **candidate** **questions** **are** **unresolved?** (refinement) | **From** `CANDIDATE_REFINEMENT_INTAKE_AND_QUESTION_BANK.md` **—** not **a** **position** **until** **approved** | **Only** **candidate/CM/comms** **may** see **full** **bank,** not **a** **public** **voter** **by** **default** |
| **What** **changed** **since** **yesterday?** (delta) | **Deltas** on **intakes,** **tasks,** **events,** **approvals,** with **provenance,** or **“**no** **reliable** **diff**”** | **No** **hallucinated** **deltas;** if **ingest** **incomplete,** **say** **so** (internal **framing** **per** this **file;** public **sees** `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md` **)** |
| **What** **should** **I** **look** **at** **first?** (priority) | **A** **ranked** **triage,** from **P0/aging** in **5**-**SOP,** not **a** **substitute** for **CM** **judgment** | **Same** as **4B/CM** **dashboard** **RACI**; **suggest** not **lock** **strategy** |

---

## 4. Data sources the interface may **summarize** (when built and authorized)

*Naming **internal** **objects** is **for** **this** **manual;** the **B**-**layer** does **not** **surface** them **to** **voters** **(see** 5E **/ **public** **simple** **view** **)**.*

| **Source (design** **candidates)** | **Safe** **summary** | **Not** a **voter** **export** **tool** |
|-------------------------------------|----------------------|----------------------------------------|
| **`WorkflowIntake`** | **Types,** **aging,** **jurisdiction** **(non**-**row),** **next** **owner** | **Not** a **name**+**address** **dump** |
| **`CampaignTask`** | **Status,** **stale,** **assignee** **(role)**,** **type** | **Not** a **GOTV** **cut** **from** **here** without **LQA/role** **gates** |
| **`CommunicationThread`** (if **in** use) | **Count** of **unread**-**triage,** **aging,** **category** (no **transcript** in **model** **unless** **authorized) | **Not** a **snoop** for **sensitive** **legal** without **comms/CM** **review** **loop** |
| **`EmailWorkflowItem`**, **inbox** **classes** | **Backlog,** **SLA,** not **all** **message** **bodies** in **a** **single** **LLM** **context** at **row** level | **Ingest** = **DPA,** **redaction,** **retention** **law**s |
| **`CommunicationPlan`**, `CommunicationPlan` **siblings** in **MCE/NDE** | **Stuck/approved,** not **a** **free** **ship** of **copy** to **a** **public** **user** from **a** **CM** **chat** that **bypasses** **LQA** | **LQA** **wins** per **5** **+** `SEGMENTED_MESSAGE_...` |
| **`CampaignEvent`**, OIS, GCal, **festival** **SOP** | **Upcoming,** **follow**-**up** **gaps,** no **invented** **appearances** | **WEBSITE_...** and **3E** / **3G** **event** **coverage** may be **incomplete** |
| **Pathway,** **volunteer,** **missions** (when **productized**) | **Progress** by **journey,** not **a** **public** **leaderboard** of **voters** | **5C** **unlocks** **limit** what **a** **vol** **sees** of **others** |
| **Public** **form** **submissions** | **Count**+**class,** **routed** to **triage,** PII to **steward,** not **into** **a** **model** **at** **raw** if **unauthorized** | **/api/forms** **—** not **a** **change** in **5F**; **2A** **spine** |
| **Social** / **email** / **press** / **county/field** **ingest** (if **and** **only** if **a** **pipeline** **exists) | **As** in `CONTINUOUS_CAMPAIGN_KNOWLEDGE_INGESTION_AND_REFINEMENT_ENGINE.md` **—** **tags,** not **a** **firehose** to **a** **public** **voter** | **No** **synthetic** “**the** **people** of **X** all **believe** Y”** |

**Candidate** **refinement** **notes,** **website** **updates:** **knowledge** **state**s **(see** **continuous** **engine** **doc** **)**; **not** **auto**-**publishing** **to** **Ask** **Kelly** without **MCE+comms** **approval** **+** `ASK_KELLY_...` **levels** **A–D** **.

---

## 5. What the system must **never** casually **expose** (CM channel included)

- **Voter** **rows** and **VFR/Targeting** **details** to **a** user **not** in **R2+** (per `playbooks/ROLE_READINESS_MATRIX` **+** 5C **/ **3H** **/ **3G** data **rules** **)**.  
- **Raw** PII, **or** a **reconstructable** **profile,** in **a** **model** **or** **public** **answer** (see **5F** data **hygiene,** **DPA,** and **redaction** in **continuous** **engine** **doc** **)**.  
- **Line**-**item** **donor** **identity** **or** **amounts,** or **a** **“**our** top **donors**”** **narrative** in **a** **CM** **briefing** to **a** **non**-**treasury**-**cleared** **ear** **(even** if **a** **role** is **“CM”** **in** **org** **chart** **—** the **product** enforces **matrix** **)**.  
- **Unauthorized** **finance** (treasurer) **jurisdiction**; **suggest** a **routed** `WorkflowIntake` **or** `CampaignTask` **to** R2+ **for** the **row** if **a** **decision** **is** **needed,** not **a** **number** in **this** **chat** **(unless** `MANUAL_...` **+** `FINANCIAL_...` **/ **treasurer** **SOPs** allow **and** the **view** is **blessed** **)**.  
- **Internal** **conflict,** **HR**-**like** **traits,** **or** “**X** is **a** **problem**”** when **X** is **a** **named** **vol** **—** not **a** **CM** **tool** in **5F**; **if** a **genuine** **safety** **issue,** **escalation** to **a** **human,** not **a** **model** **gossip** **line** (see `ESCALATION_PATHS` **+** 5E **antipatterns** **)**.  
- **Sensitive** **classification,** **contrast,** or **unapproved** **opposition** **research** in **a** **summary** to **a** **role** **not** in **MCE/counsel** **RACI** **.**  
- **Proprietary** or **stolen** data from **a** **third** **party,** or **a** **claim** the **orchestrator** “**knows**” **a** **private** fact **not** in **vetted** **knowledge** **base** **(see** `ASK_KELLY_CANDIDATE_VOICE...` **)**.  

---

## 6. Kinds of output: **summary** vs **report** vs **recommendation** vs **draft** vs **approved**

| **Output** | **Definition** | **Can** it **spend,** **export,** **ship** **comms,** or **lock** **strategy?** |
|------------|----------------|------------------------------------------------------------------------------|
| **Summary** | **Factual,** **bounded** **rollup** of **an** **authorized** **view**; **cites** **provenance;** can **end** in **“**TBD/unknown**”** | **No** to **all** **without** a **separate** **human** **action** in **the** **right** **system** of **record** **.** |
| **Report** (internal) | **A** **longer** **slice** of **a** **summary,** with **gaps,** **links** to **Workbench,** and **R/Y/G** **on** **health;** not **a** **substitute** for **4B/CM** **dashboards** if **the** **dashboard** **is** the **SOT** for **4B** **(see** `CANDIDATE_DASHBOARD_...` **)** | **No** to **sensitive** **actions**; **it** may **include** a **link** to **create** a **templated** `WorkflowIntake` / **`CampaignTask` **(Preview/Propose,** not **Lock) **in** the **4B** / **2A** **pattern** from **`STRATEGY_TO_TASK_...` **. |
| **Recommendation** (what **to** **do** **next**) | **Prioritized** **“**look** **here,** then **this**”** in **SOP-****aligned** **language,** with **a** **matrix**-**shaped** **rationale**; **not** a **moral** **accusation** of **a** **person** | **No;** a **suggestion** **is** a **recommendation;** it **is** not **an** **approval** of **$** **/ **MCE/NDE** **/ **LQA** **. |
| **Draft** **task** | **Proposed** **`CampaignTask` **or** **intake** **payload** in **a** **preview** state | **Not** an **action** in **VFR,** not **a** **send,** not **a** **final** **state**; **Propose,** not **Lock** (see **2A,** 4B, **5**). |
| **Approved** **action** | **Human** **in** the **SOT** (Workbench,** **treasurer,** **LQA) **+** **logging** | **The** only **class** that **moves** **money,** **data** **out,** **public** **comms,** or **GOTV** **cuts,** and **the** only **one** that **is** a **definitive** **strategic** **lock** **when** the **4B/CM** **process** **says** so **(see** `APPROVAL_AUTHORITY_MATRIX` **).** |

**Rule (non**-**negotiable):** a **command**-**side** **report** or **recommendation** may **suggest** a **task** and **its** **owner**-**shaped** **RACI;** it **may** **not** **approve** **spend,** **export** **data,** **send** **public** comms, **lock** **strategy** **(4B** **or** else),** or **assign** **sensitive** **authority** `APPROVAL_AUTHORITY_MATRIX` **reserves** for **a** **named** **human** **.**

---

## 7. Sample CM prompts and **safe** **answer** **shapes** (no real PII, no real rows)

*These** **are** **stylized** **examples**; **in** **a** **real** build,** **numbers** **and** **fields** must **come** from **a** **query** of **a** **blessed** **view,** or **the** **answer** is **a** **polite,** **auditable** **“**we** **don**’**t** **have** **this** **slice** **yet** / **TBD**”** **(internal** phrasing) **/ **a** **public** **reframe** (see** **public** **simple** **view) **. ***

1. **“**What**’**s** **hottest** in **intake** **right** **now?**” **→** “**M** intakes in **T**+**0**–**24h**; **P0** n**;** by **class:** **[types]**; **oldest** **unclaimed** in **[bucket]**; **see** [Workbench **queue** **link** **pattern** **]**.”  
2. **“**Is** **anyone** **dropping** on **onboarding?**” **→** “**Drop**-**off** at **[step] **is** high **vs** **baseline,** n**; **suggest** **VCoord** **nudge** (no **name**-**leak** in **a** **model**).”  
3. **“**Do** we **need** a **deputy** in **[region] **?**” **→** “**I** can**’**t **assign** people;** **this** is **a** **people** **decision;** here**’**s **capacity** **signal** and **a** **draft** `WorkflowIntake` for **“**regional** **help****” to **Preview** in **4B/CM** **(not** **auto** **)**.”  
4. **“**What**’**s** **in** the **LQA** **queue?**” **→** “**n** **items**; **C**-**flag** **k**; **oldest** **T**+**;** **I** can**’**t **approve**; **open** **LQA** **(see** MCE/NDE **SOP) **.”  
5. **“**Read** me **a** **voter** **list** for **[county] **for** a **GOTV** **cut** **.”** **→** “**No**;** **I**’**m** not **that** **tool;** **R2+** in **VFR,** and **GOTV** is **LQA**-**gated;** **I**’**m** a **suggest** **+** **route,** not **a** **file** **pipe** (see 5E/5C **+** this **file) **.”  

---

**Last** **updated:** 2026-04-28 (Pass 5F + 5G)
