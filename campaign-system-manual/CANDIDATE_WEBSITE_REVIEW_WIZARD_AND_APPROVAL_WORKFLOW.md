# Candidate website review wizard and approval workflow (Manual Pass 5G)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Design and governance** for a **future** **guided** **candidate** **review** of **the** **public** **site** **—** **not** a **shipped** **UI;** not **a** **claim** the **candidate** can **auto**-**publish** **(see** `CANDIDATE_EDITING_RIGHTS_AND_NO_APPROVAL_EXCEPTIONS_POLICY.md` **,** `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` **,** `playbooks/APPROVAL_AUTHORITY_MATRIX` **).**

**Ref:** `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md` · `CANDIDATE_REFINEMENT_INTAKE_AND_QUESTION_BANK.md` · `CANDIDATE_PROGRESSIVE_INTERVIEW_AND_SITE_WALKTHROUGH_PLAN.md` · `WEBSITE_CLEANUP_MOTION_AND_LIVE_PLATFORM_PLAN.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**44 · **Pass** **5H** `CANDIDATE_WEBSITE_EDITING_ONBOARDING_EMAIL.md` **(**approved** **send** **per** **MI** **§**45** **)** **+ **`ASK_KELLY_LAUNCH_PRIORITY_AND_FIRST_RELEASE_SCOPE.md` **(first** **session: ** e.g. **Home** per **MCE;** **not** a **shipped** **flow** **claim) **

---

## 1. Purpose of the wizard

- Give the **candidate** a **calm,** **plain**-**language** way to **read** and **improve** **every** **public** page **(design** **target) **, **one** page **(or** **section) **at** a **time,** **with** **no** **raw** **system** **jargon,** no **0–6** **readiness,** and **no** **internal** **task** **ids** **(see** `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES` **;** **5G** is **the** **candidate** **surface,** not **a** **voter** **surface) **.  
- Turn **site** **review** into a **governed** **knowledge**-**update** **stream: ** every **proposed** **change** that **is** not **a** **pure,** **low**-**impact** **wording** **tweak** per **`WEBSITE_EDIT_IMPACT_...` **and **`CANDIDATE_EDITING_...` **spawns **an** **admin** **packet** **(see** Pass **5G) **, **not** a **chat**-**driven** **MCE/NDE** **bypass. **

---

## 2. Candidate-friendly review flow (UX principles)

- **One** page **(or** **a** **single** **scroll** **of** a **page) ** per **unit**; **“** **Next** **/ ** **Back** **/ ** **Save** **and** **return** **.”** **  
- **Text** the **voter** **would** **see,** not **the** **component** **tree**; **if** a **CTA** **is** a **form,** show **the** **button** **wording** and **a** **short** **description** of **where** it **leads,** not **API** **or** **route** **names** **(see** 5E/5F **). **  
- **Progress** is **visibly** **clear** (see **model** **below) **, **not** a **guilt**-**trip. **

---

## 3. “Walk me through every page” mode

- **Ordered** **tour: ** e.g. **Home** **→** **About** **→** **Priorities** **…** **(see** **checklist** **) **, **or** a **shuffled** **tour** **if** the **candidate** **prefers**—**the** **order** is **a** **UX** **choice,** not **a** **moral** **test** **. **  
- **“** **Resume** **where** I **left** off** **”** with **a** **single** **plain** **summary** of **the** **last** **page** **(no** **internal** **JSON) **. **

---

## 4. Progress bar model (page or section is the unit of record)

| **State** | **Meaning** (design) |
|-----------|------------------------|
| **Not** **started** | **Wizard** has **not** **surfaced** **this** page **. ** |
| **Presented** **to** **candidate** | **Page** **in** view; **read**-**only** **or** **draft** **edit** **box** per **UI** **(when** **built) **. ** |
| **Candidate** **reviewed** | **Candidate** **says** **“** **I**’**ve** read **it**” or **“****next****”** **without** **a** **content** **change**—**still** may **not** be **A**-**knowledge;** **MCE+comms** may **own** **publish. ** |
| **Candidate** **edited** | **There** is **a** **delta** in **a** **candidate**-**owned** **text** **or** a **suggestion;** **triage** to **“** **simple** **wording** **”** **vs** **“** **needs** **packet** **”** per **`WEBSITE_EDIT_IMPACT_...` **. ** |
| **Admin** **review** **needed** | **Packet** **is** open **;** not **a** **public** **voter** **facing** **string** **(see** `CANDIDATE_TO_ADMIN_...` **). ** |
| **Approved** **for** **website** | **LQA+comms** (and **as** **needed** **treasurer** **/ ** **counsel) **; **MCE** **+** **static** **publish** path **(see** 5B **) **. ** |
| **Approved** **for** **Ask** **Kelly** | **A/B** in **`ASK_KELLY_...` **+ **`CONTINUOUS_...` **states;** **not** before **A**-**or** **B** **sign**-**off,** **as** per **5F **. ** |
| **Approved** **for** **MCE/NDE** **reuse** | **Reusable,** **vetted** **module**; **LQA+ship,** not **a** **chat** **bypass** **(see** 5B,** **`SEGMENTED_` **) **. ** |
| **Published** | **Live** to **a** **public** **or** **operator**-**facing** **surface,** with **a** **date** and **SOT,** not **a** **model**-**flick** **(see** 5D **/ **5F **) **. ** |

**One** object **(page** **/ ** **section) ** can **be** in **at** most **one** **primary** state **;** **a** **single** **edit** **may** **queue** **multiple** **“** **approved** **for** X**”** when **MCE+comms** **splits** **(website** **vs** **Ask** **Kelly) **. **

---

## 5. Checklist by page (minimum campaign web map)

*Exact** **slugs** **/ ** **routes** are **SOT**-**TBD;** **this** is **a** **manual** **skeleton** for **5G **.*

| **Page** **(candidate** **facing) ** | **What** the **candidate** **checks** **(non**-**exhaustive) ** |
|------------------------------------|----------------------------------|
| **Home** | **Hero,** **SOS** **frame,** **CTA,** no **invented** **stats** (5D) **,** **5D/website** **motion** **(see** `WEBSITE_CLEANUP_...` **) **. ** |
| **About** **/ ** **Meet** **Kelly** | **Bio,** **photo** **credit,** **no** **new** **private** **facts;** A/B (see **5F) **. ** |
| **Priorities** | **SOS**-**relevant,** not **a** **fake** **legislative** **promise** **(see** 5F **) **. ** |
| **Election** **confidence** **/ ** **FAQ** | **5D**-**cited,** **EPI/SBEC,** not **a** **new** number **(see** `CAMPAIGN_COMPANION_ELECTION_...` **) **. ** |
| **County** **clerks** | **Process**-**and**-**service,** not **a** **named** **dunk,** OIS **if** **county** **(honest) **. ** |
| **Voting** **rights** **/ ** **ballot** **access** | **Counsel**-**sensitive,** not **a** **chat** **invention** (see **4B+**5F) **. ** |
| **Get** **involved** / **Pathway** | **CTA** **+** **5C,** not **GOTV** **cut,** not **VFR** in **a** **wizard** **(see** 5C) **. ** |
| **Events** **/ ** **where** **Kelly** **is** | **OIS** **+** **GCal** **truth,** not **a** **phantom** **(see** 5D) **. ** |
| **Donate** | **Complies** with **tres+** **+** **disclaimers;** not **$** **totals** **invented,** (see 3H,** **5) **. ** |
| **Blog** **/ ** **updates** | **MCE+NDE** **+** LQA,** not **a** **one**-**click** **from** the **candidate** to **a** **ship** (5B) **. ** |
| **County** **pages** | **OIS**-**honest,** not **a** **fake** **precinct** **(see** 3D–3F) **. ** |
| **Ask** **Kelly** **/ ** **public** **answer** **snippets** | **5F** A–D,** **not** a **D**-**faked** **A**; **5G** **wizard** may **suggest,** not **auto**-**publish. **

---

## 6. Candidate **actions** (per page or **block**)

- **Approve** **as**-**is** **(I**’**m** **comfortable** with **this** **vetted** **public** **text) **. **  
- **Suggest** **a** **wording** **edit** **(single**-**line** or **block) **. **  
- **Rewrite** **section** **(longer;** **triage** to **admin** **if** not **a** **simple** **wording) **. **  
- **Flag** **as** **inaccurate** **(needs** **ops** **/ ** **research) **, **not** a **dox** in **a** **chat** log **(see** **_packet_ **) **. **  
- **Ask** **admin** to **research** (creates a **“** **research** **”** line **in** **a** **packet) **, not **a** **volunteer** to **hunt** **a** **voter** **(see** 5C) **. **  
- **Mark** **as** **personal** **voice** (signals **B**-**touched;** **MCE+comms** for **A**-**or** **broadcast) **(see 5F) **. **  
- **Mark** **as** **not** **how** I **would** **say** **it** (same **5F) **, **+** a **D**-**triage** for **a** **refined** line **(see** **bank) **, **pulled** **gradually,** not **at** **once** **(see** `CANDIDATE_PROGRESSIVE_...` **) **. **  
- **Add** **a** **story** **/ ** **example** **(may** be **B**-**touched,** not **A**-**till** **signed) **. **  
- **Remove** **a** **claim** **(may** **tighten** **5D+**5F;** **MCE+** **counsel** on **a** **legal** or **fraud** **line) **. **

---

## 7. “Easy** **first,** **deeper** **later**” (pass** **order**)

1. **First** **pass:** **tone,** **obvious** **typos,** **“** **this** is **/ **is** **n’t** me**”** **(see** 5F **B) **. **  
2. **Second** **pass:** **accuracy,** **dates,** **OIS,** **citations** (5D) **, ** not **a** **new** number **(see** 5D **) **. **  
3. **Third** **pass:** **policy** **nuance,** **SOS** **vs** **non**-**SOS** (5F) **. **  
4. **Fourth** **pass:** **values** and **biography,** with **A/B,** not **D**-**faked (5F) **. **  
5. **Fifth** **pass:** **hard** **/ ** **hostile** **frames,** with **MCE+comms+** `ESCALATION_PATHS` **(see** 5E **) **, **in** a **dedicated** **session,** not **a** **shame**-**drip. **

---

## 8. Natural **question** **weaving** (from **the** **bank,** not **a** **dump**)

- **~**1 **light** **refinement** **question** **per** page **in** the **first** **pass** (e.g. “** **Does** this **sound** like **you?**” **(see** `CANDIDATE_PROGRESSIVE_...` **) **, **pulled** from **the** **bank,** not **all** 25 **categories** **(see** `CANDIDATE_REFINEMENT_...` **) **) **. **  
- **Deeper** **Q**s **only** after **completes** of **an** **easier** **tranche**; **if** a **D**-**triage** is **open,** **de**-**dupe** **(see** `CANDIDATE_TO_ADMIN_...` **) **. **  
- **Do** not **shove** **the** full **25**-**row** **bank** in **a** **single** **session. **

---

## 9. Candidate** **experience** **(must** **have** in **a** **real** **build) **

- **Simple** **language;** no **`WorkflowIntake` **name** in **a** **candidate** **facing** **(see** 5E **B) **. **  
- **Only: ** page **text,** one **+** to **n ** **related** **questions,** an **edit** **/ **suggest** **/ ** **approve,** and **a** **“** **send** to **the** **team** **”** **that** **creates** **a** **packet,** not **a** **voter**-**facing** **raw** **log** (see `CANDIDATE_TO_ADMIN_...` **,** **§**44 **) **. **  
- **No** **backend** **clutter,** no **0–6,** no **readiness** **(see** 5F **/ **5G **) **. **

---

**Last** **updated:** 2026-04-28 (Pass 5G + 5H)
