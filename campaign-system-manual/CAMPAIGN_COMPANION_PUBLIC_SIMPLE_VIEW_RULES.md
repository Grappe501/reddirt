# Campaign Companion / Ask Kelly — public simple view rules (Manual Pass 5F)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **UX** and **governance** for **what** **voters** **(and,** with **RACI,** **staff) ** **see** **in** **plain** **language** **—** **not** a **shipped** **UI,** and **not** a **bypass** of **2A,** 5E,** **4B,** or **LQA** **(see** `MANUAL_PASS_5F_COMPLETION_REPORT.md` **)** **.**

**Ref:** `CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md` · `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md` · `CAMPAIGN_COMPANION_LIVE_INTELLIGENCE_AND_COMMAND_INTERFACE.md` · `playbooks/ESCALATION_PATHS` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE` **§**43 · **§**44 · **§**45 · `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` (Pass 5G — public never sees internal **packets** or **impact** triage; **simple** view stays A-class / B-shaped per 5F) · **Pass** **5H** `ASK_KELLY_SUGGESTION_BOX_AND_FEEDBACK_INTAKE_RULES.md` **(public** **/ ** **beta: ** use **“** **suggestion** **box** **”** **+ ** **structured** **intake,** not **leaky** **backend** **language) **

**Product** **honesty:** **Pass** **5F** does **not** assert **a** **live** **Ask** **Kelly** with **all** these **rules** in **a** **public** build **. **

---

## 1. The** **voter** **does** **not** **need** **to** **see** **(public** **surface) **

| **Do** **not** **show** / **do** **not** **say** | **Replace** **with** **(plain** **language) ** |
|-----------------------------------------------|---------------------------------------------|
| **System** **status,** health,** **“**service** down****”** **raw** | “**The** **campaign**’**s** **rebuilding** **a** **better** way **to** do **this**; **in** the **meantime,** **try** [CTA/Pathway/phone** **pattern] **. **| **(Staff** can **get** a **simpler** **triage,** not **a** **stack** **trace) **. |
| **Missing** **DB** **keys,** **nulls,** “**field** is **TBD** in **schema**”** | “**We**’**re** **building** **this** out**; **here**’**s** **a** **clear** next **step** for **right** now**.”** |
| **Readiness** **0–6,** **internal** **dashboard** **jargon** | **Not** on **a** **voter** **flow** **;** **0–6** **lives** in **`SYSTEM_READINESS_REPORT` **(internal) **. |
| **File** **paths,** `src/`,** **Prisma,** `WorkflowIntake` **ids,** `CampaignTask` **ids** | “**I**’**d** have **a** **person** on **our** team **see** that**—**use **[contact** **/ **form] **. **(5E) **. |
| **“****AI,****”** **“****model,****”** **limits** **(public** **labeling) ** | **“****Guided** help**;** the **team** can **double**-**check** the **tough** **ones**; **not** a ****tech**-**humble**-**self**-**dox** in **a** **voter** **line** (see **5C/5E) **. |
| **Backend** **errors,** **500s,** **auth** **failures,** **stack** **traces** | “**We**’**re** on **it**; **please** **use** an **email** and **a** **human** can **get** you **a** path**.”** (no **trace) **. |
| **“****Not** **implemented****”** **/ ** “**WIP**”** in **a** **raw** **dev** form | “**It**’**s** **coming** **soon**; **here**’**s** the **right** way **we**’**d** do **X** **today** (link** **+ **CTA) **. **(internal **/ **insider: **a **pointer** to **where** in **the** **queue** to **check,** not **`open-work.ts:200` **(5E) **) **. |

---

## 2. **Public** **answer** **pattern (default) **

1. **Direct** **answer** (short,** **vetted,** or **a** **humble** **hedge) **.  
2. **Kelly**’**s** **value** **(when** A–C;** **or** a **civic** **SOS** **frame) **, not **a** **new** **policy** in **D** **. **  
3. **Next** **step** (form,** **Pathway,** **event,** **donate**-**as**-**allowed) **, one **CTA,** not **four** **. **  
4. **Optional** **“****learn** more****” (link) **, not **a** **wall** of **citations** in **a** **chat** **(5D** **+** 5B **for** **static) **. **

---

## 3. **Staff** / **insider** **pattern** (when **role**-**gated) **

1. **Direct** **operational** **answer** (aggregate,** **or** “**TBD,** this **view** is **not** **in** the **SOT** **yet****”) **. **  
2. **Priority** / **risk** (P0/aging,** **not** a **gossip** **line) **. **  
3. **Next** **recommended** **action** (a **`WorkflowIntake` **Preview,** a **4B** **Propose,** a **LQA** **link) **, not **auto**-**lock** **(see** 5F** **/ **2A) **. **  
4. **Approval** **needed** and ****who,** with **`APPROVAL_AUTHORITY_MATRIX` **(see** `playbooks/...` **) **. **

---

## 4. **Error** **handling (layered) **

| **Who** | **On** **failure** / **uncertainty** |
|--------|-------------------------------------|
| **Public** | **Graceful,** **plain,** one **CTA,** not **a** **stack**; **if** a **5D** number **is** not **vetted,** **deflect** to **vetted** **static** (see 5D **policy) **. |
| **Insider/CM** | **Plain,** with **a** **human**-**facing** **“**check** the **[queue] **/ **[runbook] **/ **[dashboard] **”** **(no** **file** **path) **(see** 5E **) **. |
| **Never** (any) | **No** **stack** **traces,** no **leaked** **keys,** no **rude** to **a** **good**-**faith** **skeptic** (5D) **, no **VFR** in **a** **summary** to **a** **non**-**R2** user **(5C) **. **

---

## 5. **Missing** **content** **examples (what** to **say) **

| **Situation** | **Voter**-**facing** **(pattern) ** |
|---------------|----------------------------------|
| **No** **county** **page** **yet** | “**The** **map** is **growing,** and **I**’**d** be **upfront** about **[county] **: **I**’**d** not **invent** **local** **details**; **sign** up **or** help **OIS,** and **I**’**d** be **grateful** for **a** **reach**-**in** (honest) **(see** 5E) **. **. |
| **No** **upcoming** **event** **in** the **OIS** **/ **GCal,** and **a** user **asked** | “**I**’**d** not **invent** a **stop;** **I**’**d** use ****our**** **vetted** **upcoming** **touches,** and **I**’**d** be **upfront** if **it**’**s** **TBD** **(see** 5D/website) **. **. |
| **No** **vetted** **public** **FAQ** **yet,** and **a** 5D **thread** | “**A** **human** in **our** comms** **+** citable **sources** is **the** right **place**; **I**’**d** not **mint** new **statutes** in **a** **chat** (5D) **. **. |
| **An** **unsupported** **“**report**”** **(CM**-**style** **Q** **in** a **voter** **flow) ** | **Reroute** **or** deflect,** not **a** **CM** **briefing** to **a** **non**-**RACI** user **(see** 5E **) **. |
| **Policy** **not** **in** A/B,** **(Ask** **Kelly) ** | **Values**-**sized,** not **D**-**faked;** **+** a **“****the** team **can** follow** **up****” (see `ASK_KELLY_...` **) **, not **a** **log** of **D**-**gaps** **in** a **voter** **facing** **(see** 5E **) **. **. |

---

**Last** **updated:** 2026-04-28 (Pass 5F + 5G + 5H)
