# Campaign strategy, lifecycle baseline, and simulation readiness

**Lane:** `RedDirt/` · **Pass 3** + **3B (acceleration)** + **3C (paid media & long-term infrastructure)** + **3D (endorsements & precinct path)** + **3E (youth, NAACP, focus categories, travel projection)** · **2026-04-27**  
**Audience:** Owner, campaign manager (CM), leads, operators  
**Public language:** **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — **not** “AI” as a product name for guided features.

**Scope:** Strategy, operations design, and readiness **documentation** only. **No** application code changes. **Forecasts are directional** — ranges, scenarios, **not** certainty.

---

## 1. Executive campaign reality

### What exists today

- A **broad** RedDirt stack: public site, **Workbench** (`open-work` merges intakes, tasks, email), form intake (`POST /api/forms` → handlers → `WorkflowIntake`), **Message Engine** and **Narrative Distribution** admin paths, OIS/region/county public surfaces, events, comms, finance and compliance **objects** in Prisma (see `SYSTEM_READINESS_REPORT.md`).
- **Fundraising and field momentum** off-paper: house parties, in-person events, organic support; **leads** identified for social, fundraising, and events; **4–5 county coordinators**; **~100** volunteer signups, **~70** in the organizing hub, **~10** **active** there (per Steve, **as of 2026-04-27**).
- **Money:** **~$55,000** total raised; **~$15,000** cash on hand; spend to date **directionally** on lift/setup, road and event materials, banners, yard signs, shirts, palm cards, business cards, tablecloth, visibility (exact ledger categories belong in treasurer workflow).

### What is strong

- **Intake → database → operator queue** is **proven in code** (`SYSTEM_CROSS_WIRING_REPORT.md`), not a slide-deck only.
- **Multi-channel growth**: events, parties, and visibility create **recognition** in parallel with **digital** organizing.
- **Human leadership emerging**: event leads, fundraising lead, **field/social** leadership — a spine for **delegation** without over-structuring on day one.

### What is fragile

- **One-operator / small-team** capacity vs **exponential** Workbench and comms **surface area** — **burnout** and **triage** debt if SOPs are not enforced.
- **Hub membership ≠ active work:** **~10 / ~70** in-hub active (~**14%**) — **dormant** members **inflate** the sense of field capacity.
- **Cash** vs **$250K base by August 31, 2026** — see **§3**; **$500K** is **stretch** only when **pace** **unlocks** it. To **base**, **implied** weekly need from late April is **higher** than **trailing** run rate unless **momentum** **compounds** (see **Part B** for acceleration design).

### What cannot be assumed

- **Steady** weekly fundraising — events and major-donor moments create **lumpy** **cash**; do **not** model as flat **$X**/week for every week without a **buffer**.
- **Volunteer** **counts** = **voter** **contacts** or **signs placed** — **define** “active” and “completion” in **SOPs**, not dashboard vanity.
- **County** **coordinators** = **full** **geographic** **coverage** — **4–5** is a **pilot** **scale**, not 75 **county** **benches** **filled**.

### What must be built next (manual-wide priority; see also §21)

- **Ruthless** **Workbench** **rhythm** (§9) and **KPI** **honesty** (§10) so **suggestions** do **not** **become** **commands**.
- **Candidate** and **CM** **intake** **design** (§5) **tied** to **approval** **boundaries** and **narrative** **discipline** (§16).
- **P5** and **county** **playbooks** as **procedures** before **automation** **claims** **readiness** (§8, §15).

---

## 2. Baseline as of 2026-04-27

**Source:** Steve narrative + operator estimates (not audited ledger in this document). **Separate** “**reported**” from “**inferred**.”

| Metric | Value / range | Notes |
|--------|---------------|--------|
| **Total money raised (cumulative)** | **~$55,000** | **Reported** |
| **Cash on hand** | **~$15,000** | **Reported** — **implied** **burn** **~$40k** **to** date (55−15) **directional**; **reconcile** to **accounting** |
| **Spend focus (qualitative)** | Setup/lift, road/event materials, banners, signs, shirts, cards, tablecloth, visibility | **Reported** — **not** a **taxonomy** from **this** **manual** |
| **Fundraising — base goal** | **$250,000** cumulative by **2026-08-31** | **Pass 3B** **—** **working** plan; **manage** to this first |
| **Fundraising — stretch goal** | **$500,000** cumulative (only if **pace** **unlocks;** see §3) | **Not** the default **operating** number |
| **Gap to base goal** | **~$195,000** (from **$250K** **−** **$55K** through baseline date) | **Directional** |
| **Gap to stretch goal** | **~$445,000** (from **$500K** **−** **$55K**) | **Only** if **stretch** **rules** in §3 are met |
| **Active volunteer target (Pass 3B stretch)** | **5,000** **active** by **2026-08-31** | **Aggressive** **movement**-scale; **not** “likely” from **~10** without **structural** **growth** (Part B) |
| **Serious fundraising push start** | **2026-03-04** | **Reported** |
| **Fundraising** **also** **began** | Second week of **February** | **Context** **—** **portion** of **$55k** **may** **pre**‑**date** **Mar** **4** |
| **Volunteers signed up (total)** | **~100** | **Reported** |
| **Organizing hub membership** | **~70** | **Reported** |
| **Active in hub (approx.)** | **~10** | **Reported** **—** **define** **“active”** **in** **SOP** |
| **Active / signed-up ratio** | **~10%** (10/100) | **Inferred** |
| **Active / hub ratio** | **~14%** (10/70) | **Inferred** |
| **Leads identified** | Social, fundraising, **several** **strong** **event** **leads** | **Reported** |
| **County coordinators** | **4–5** | **Reported** |
| **Momentum** | House parties, in-person events, organic support | **Qualitative** |

**Fundraising momentum notes (honest):** Trailing **~$5.5k–$8.5k**/week (if all **$55k** is post Mar 4) must **rise** to meet the **$250k** **base** **pace** in §3. **Stretch** **$500k** is **not** the **operating** **target** until **unlocked** (see rule below).

---

## 3. Fundraising trajectory

**All figures directional.** Calendar: **2026.** **Base** goal: **$250,000** cumulative by **August 31, 2026.** **Stretch** goal: **$500,000** only when **unlocked** (below). **Current** **raised** **~$55,000**; **remaining to base** **~$195,000**; **remaining to stretch** **~$445,000**.

**Operating rule (Pass 3B):** The campaign **manages** to the **$250k** **base** goal. The **$500k** **stretch** is **unlocked** only when **actual** **weekly** **receipts** **beat** the **required** **pace** for the **relevant** goal for **two** **consecutive** **reporting** **periods** (define **period** with treasurer: e.g. **Sun–Sat** **week** or **biweekly** **tranche**). Until then, **budget** and **narrative** **default** to **base** **math** **and** **COH** **floor**, not **stretch** **spend**.

**Definitions:**

- **D₀** = **2026-03-04** (serious push). **D₁** = **2026-04-27** (baseline). **Runway** starts **2026-04-28** for “need per week” **to** **Aug** **1** **or** **Aug** **31.**  
- **Span** Mar 4–Apr 27 = **55** **days** **≈** **7.9** **weeks** → **trailing** **~$7k**/week (simple) **or** **~$5.5k–$8.5k**/week **ranged** (lumpiness / pre–Mar 4 **attribution**).

**Weekly need (from 2026-04-28, day-count math):**  
- **To $250k by Aug 1:** $195,000 **÷** **(96** **days** **/** **7)** **≈** **$14.2k**/week **(order** of **magnitude;** **range** **$13k–$16k**).  
- **To $250k by Aug 31:** $195,000 **÷** **18.0** **weeks** **(126** **days)** **≈** **$10.8k**/week **(range** **$9.5k–$12k**).  
- **To $500k by Aug 1 (stretch, not default):** $445,000 **÷** **13.7** **weeks** **≈** **$32.5k**/week **(range** **$30k–$35k**).  
- **To $500k by Aug 31 (stretch, not default):** $445,000 **÷** **18** **weeks** **≈** **$24.7k**/week **(range** **$22k–$28k**).

| Scenario | Weekly raise range (directional) | Aug 31 cumulative raised (cumulative, directional) | What must be true | Fundraising + **volunteer** lead capacity | House party cadence (order of magnitude) | Donor follow-up cadence | Risk | Trigger to change plan |
|----------|----------------------------------|--------------------------------------|---------------------|---------------------------------------------|--------------------------------------------|---------------------------|------|-------------------------|
| **Floor** | **~$5k–$9k**/week (near **trailing** or **worse** if lumpy) | **~$150k–$190k** **by** **Aug** **31** (example) — **risks** **missing** **$250k** | **Steady** **events,** no **new** **burn**; **COH** **discipline** | **1** **fundraising** **lead** + **owner** **cover**; **V.C.** **nudges** only | **0–1**/month **(under** **stress)** | **Thank-you** in **72h;** next **ask** in **2–3** **weeks** only if **permitted** | **High** **(liquidity,** **morale)** | **Two** **periods** **below** **floor** **—** **cut** **travel** and **merch,** **emergency** **house** **party** **SOP,** **CM** **review** **(see** **Part** **B** **§B.3** **redundancy)** |
| **Base** | **~$9.5k–$13k**/week (aligned to **$250k** by **Aug** **31)** | **~$250k** **by** **Aug** **31** (if **average** **holds**) | **Lumpy** **weeks** that **average**; **P5** and **county** **asks** in **loop** (Part B **flywheel**) | **Fundraising** **lead** + **deputy;** **host** **captain;** **county** **captains** in **6+** **counties** (example) | **2–4**/month **statewide** | **48h,** **7d,** **30d** **touch** per **SOP** | **Med** | **Two** **periods** **at** or **above** **stretch** **pace** **—** **consider** **unlocking** **stretch** **budget** **+** **narrative** (treasurer) |
| **Momentum** | **~$12k–$16k**/week (between **base** and **early** **$250k**) | **$250k** **before** **late** **Aug** **(directional);** then **assess** **stretch** | **Unlocked** **stretch** **messaging** only after **rule**; **recurring** and **events** compounding | **Team** of **+** **follow-up** and **recurring** **vol** **leads** (no **hired** **default**; **Part** **B**) | **4–6**/month | **Tighter** **7d** **for** **mid** **+** | **Med** | **Pace** **sags** **two** **periods** **—** **revert** **to** **base** **narrative,** **freeze** **stretch** **spend** |
| **Stretch** | **~$22k–$30k**/week (to **$500k** by **Aug** **31**, if sustained) | **~$500k** by **Aug** **31** (only if sustained) | Unlock + major donor, institutional, or earned gravity; compliance on all paid | Fundraising + digital + regional leads; no hired staff assumed | **6+**/month + county tours | CRM-style stages | **High** | Beats required stretch pace 2 periods → formal stretch mode; else momentum only |
| **Breakout** | **~$32k+**/week | **$500k+** by end of summer (directional) | Network effects, house party chains, major gifts | Scalable volunteer fundraising cells + treasurer + owner on contrast | High (multiple tours) | White-glove + small dollar at scale | **Very high** | Drops below stretch pace → reclassify to Momentum or Base; new plan |

**Separation of current truth vs target trajectory:** **Today’s** **truth** = **~$55k** **raised,** **~$15k** **COH.** **Base** **trajectory** = **$250k** by **Aug** **31**; **stretch** = **$500k** only if **unlocked** and **sustained** — **neither** is a **promise**. **Detail:** `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`, **Part** **B** (below).

---

## 4. One-person campaign launch model

**Assumption at launch:** **One** **operator** (e.g. **Steve** **or** **one** **admin**) runs the **Guided** **system** and **Workbench**.

**What one person can realistically manage**

- **Triage** **all** **WorkflowIntake** **items** **within** **SLA** **only** **if** **volume** **stays** **low** **or** **non**‑**urgent** **channels** **defer** to **batch** **windows**.
- **One** **daily** **comms** **approvals** **pass** (not **real**‑**time** **on** **every** **platform**).
- **Weekly** **finance** **reconciliation** **touch** (not **full** **treasurer** **—** **role** **depends** on **hires** **/ volunteers).

**What must be automated or guided (product + SOP)**

- **Form** **routing** to **WorkflowIntake**; **email** **threads** in **Workbench**; **checklists** in **Pathway** **Guide**; **suggested** **next** **task** **types** (not **auto**‑**send** of **sensitive** **comms**).

**What still requires human approval**

- **Paid** **/ regulated** **comms,** **contrast** **claims,** **voter** **data** **exports,** **large** **spend** (thresholds in **MANUAL_INFORMATION_REQUESTS**), **GOTV** **scripts** (compliance).

**What must be queued in Workbench**

- **Intakes,** **tasks,** **comms,** **event** **follow**‑**ups,** **volunteer** **placements,** **finance** **flags** **—** **one** **queue** **per** **role** with **WIP** **limits** (§9).

**How the system prevents overload**

- **WIP** **caps,** **batch** **windows,** **lowest**‑**qualified** **approver** **(LQA)** **so** **owner** **isn’t** **default** for **all**; **deferred** “**parking** **lot**” for **low** **priority** **suggestions** from **readiness** **models** (§11–12).

| Horizon | Focus |
|--------|--------|
| **First 7 days** | **SOP** for **triage,** **no** **new** **programs**; **verify** **form** **→** **intake,** **fix** **broken** **paths**; **single** **comms** **cadence** |
| **First 30 days** | **Delegate** **one** **vertical** (e.g. **events** or **V.C.)**; **P5** and **county** **pilot** **in** **one** **region**; **first** **house** **party** **pipeline** (§14) |
| **First 60 days** | **Second** **operator** **or** **CM** **part**‑**time** **if** **Workbench** **age** **SLA** **missed;** **expand** **county** **or** **drop** **scope** **explicitly** |

---

## 5. Candidate-first onboarding (future final build — design only)

**Do not** treat this as **shipped** product — this is the **target** experience for the **Campaign Companion** + **profile** attachment (§20). **Public** product vocabulary: **Guided** **Campaign** **System**, **Organizing** **Guide** — not “AI” as a brand (workspace rule).

- **Candidate intake goals:** Aligned one-page **values**, **wins**, **non‑negotiables**; what success looks like for this race; **opposition** research **rules** (sourcing) — see `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §1–2.  
- **Campaign philosophy capture:** **Service** posture, **elections** and **ethics** framing (SOS-specific, policy-bound, **not** raw chat dump).  
- **Message and tone capture:** Approved **phrases,** avoid list, **verbal tics,** “sounds like Kelly” examples **(compliance**-reviewed where needed).  
- **Approval boundaries:** What may ship without same-day **candidate** read (often **zero** or **extremely** narrow: **house** **party** scripts vs **paid** **ads**).  
- **Scheduling preferences:** Public vs **rest** / **family** windows; **travel** and **day-of-week** **constraints** (operations, not PII in the manual).  
- **Fundraising comfort:** **Call** **time** tolerance, **house** **parties,** **digital** **asks,** what the candidate will **not** do (set once, enforce in comms + finance + **Narrative** **Distribution**).  
- **Public and private boundaries:** **Safety,** **family,** **schools,** what must **never** appear in public copy or volunteer-facing scripts.  
- **What the Campaign Companion must learn (structured fields only):** **Top** **5** **policy** priorities in **fixed** **order,** **geographic** **emphasis** (aggregate regions, not **micro** **dossier**), **tone** **snippets** **approved** for **Message** **Engine** / handoffs. **No** **unsolicited** **inference** from private chats.  
- **What must never be automated:** Contrast and **opponent** **claims** without **sourcing**; **paid** and **regulated** **comms;** **voter** **data** **export**; **GOTV** and **text** **scripts** without **compliance;** any **safety**-critical **narrative** (§11–12, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE` §3–5, 12–16).  
- **What candidate dashboards and manual sections attach to the profile (future):** **chapters** 12, 20, **Part** X **(candidate);** **briefs,** **message** **queue** **(read** **/ approve),** **calendar** **(internal),** **fundraising** **comfort** **settings,** **training** **completion** for **on-camera** and **compliance** (see **§20** for generic attachment pattern).

---

## 6. Organic growth model

**Path (no premature titles):** **one** **operator** **→** **candidate** **visibility** **→** **first** **volunteer** (form/email) **→** **Power** **of** **1** (solo tasks) **→** **Power** **of** **2** (pair) **→** **Power** **of** **5** (team) **→** **team** **leader** **→** **county** **coordinator** **→** **field** **lead** **→** **CM** **→** **full** **structure** **(only** when **WIP** and **funding** support it).

- **No** **premature** **appointments** — **names** follow **sustained** **weekly** **activity** and **reliability** **(90** **days** is a good **hurdle** **for** **titled** **county** **roles** where **unfilled** is **worse** than **unstable).**  
- **Roles** **emerge** from **activity,** **not** org charts.  
- **People** **choose** **Pathways** **(Pathway** **Guide)**; **sideways** **moves** (events **→** **data** **help)** are **valid**.  
- **Automation** (Workbench **suggestions,** **checklists)** **fills** **gaps** **until** **humans** **take** **over** — **LQA** **applies** (§9).

---

## 7. Volunteer activation model

**Start (baseline):** **~100** signups, **~70** in organizing **hub,** **~10** **active** (§2). **Target named in** `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` and **Part** **B: **5,000** **active** **volunteers** **statewide** **by** **2026-08-31** is an **aggressive** **stretch** **—** **not** “likely” from ordinary **signup** **velocity**; it **requires** **movement**-scale **relational** and **field** **growth** (P5, house parties, **county** **tours,** **OIS**-scale **funnels** **—** all **in** **Part** **B**). **Do** **not** **present** **5,000** **as** **expected** in **public** **copy** without **Steve** and **compliance** **(no** **false** **urgency**).**

**Defining “active volunteer” (choose one; Steve + V.C. decide):**  
- **14-day** **window:** at least **one** **meaningful** **completed** **campaign** **action** in the **last** **14** **days** (stricter, **higher** **churn** **visibility**).  
- **30-day** **window:** same, **in** the **last** **30** **days** (looser, **smoother** for **rural** **/** **irregular** **volunteers**). **Recommendation (manual,** **not** **binding):** **30-day** for **rural**-heavy state; **14-day** if **GOTV**-style **intensity** **needed** **earlier** **(must** **not** **punish** **ethically** in **UI**).**  

**Implied** **arithmetic (honest,** **not** **a** **plan** **by** **itself):** **Gap** from **~10** **to** **5,000** **active** **≈** **+4,990** **net** **active** **(not** all **“new** **signups**”** —** some **dormant** **reactivate).** **Apr** **28** **→** **Aug** **31** **≈** **126** **days** **=** **18** **weeks** **→** **~277** **net** **new** **active** **/ week** if **linearized** **—** **this** is **why** **5k** is **“stretch** **/ movement** **scale,**” **not** **a** **default** **dashboard** **promise.**

| Scenario (end **Aug** **31** **active,** **directional) | **Total** **active** (band) | **Signups** **likely** **needed** (order of magnitude) | **Activation** **rate** **assumptions** | **County** **coordinator** / **deputy** **scale** | **P5** / **event** / **house** **party** | **Training** **load** | **Risk** | **What** **must** **be** **true** |
|--------|------------------|-------------------|----------------------|-----------------|-----------|---------|------|------------------|
| **Floor** | **~250** (band **~200–~350**, directional) | **+200**–**+500** gross signups (need ≠ active) | **~15–25%** of pool to 30d active | **+2–5** new county anchors; **4–5** existing + deputies | **Low**; **1–2** events/mo. in stronger regions | Onboarding only | **Med** (misses $250K if dollars also on floor) | Sustain OIS + forms; not a 5K path |
| **Base** | **~500**–**1,200** | **+2k**–**+5k** **signups** over **summer;** **~10–20%** **30d** **active** **if** **funnels** work | **Improving** over **Q2**; **P5** and **tours** | **2** per **pilot** **county** **×** **10**–**20** **counties** = **~20–50** **leads;** not **all** **filled** | **House** **parties** **+** **road** **stops;** see **Part** **B** | **Regional** **train-the-trainer** | **Med–high** | **$250k** **fundraising** **+** **Base** **scenario** in **§3**; **V.C.** and **P5** **not** **bottlenecked** by **one** **person** only |
| **Momentum** | **~1,500**–**2,500** | **+5k**–**+12k** **signups;** **activation** **discipline** | **~20–30%** **of** **hub** to **30d** **active** in **mature** **regions** (example, **not** **uniform) **| **2** **contacts** / **county** where **possible;** **regional** **OIS** **truth** | **4–6** **parties**/**month;** **county** **tour** **cadence** | **Scalable** **Pathway** **+** **Organizing** **Guide** | **High** | **Tours** + **MCE/NDE** + **P5** **in** **sync;** **workbench** **SOPs** **scale** **(Part** **B.6) **| 
| **Stretch (5,000** **by** **Aug** **31)** | **~3,500**–**5,000+** (upper **=** **hard** **ceiling** **culturally) **| **Tens** **of** **thousands** **of** **touches,** **~10k+** **signups** in **scenarios,** **viral** **P5** and **tour** **earned** **media;** **all** **directional) **| **~30–50%** of **cumulative** **pool** in **best** **counties,** much **lower** **elsewhere** | **~75** **counties** with **some** **cell** **(not** all **titled) **+** **8** **regions;** **2-deep** every **line** (Part B) | **Daily**-**ish** **field** **+** **party** **surge** in **Q3** (example) | **Statewide** **train** **+** **async**; **GOTV** **preview** | **Very** **high** (burnout, **data** **hygiene) **| **Movement**-level **earned** **attention** **+** **no** **single**-**point** **failure;** **still** **not** **“**likely**”** as **default** **forecast** |
| *Dangerous* *over*-*promise* | *Any* *public* *“*we* *will* *hit* *5,000*”* *without* *SOP* *and* *treasurer* *aligned* *to* *$250k* *base* | *—* | *—* | *—* | *—* | *—* | *Catastrophic* *trust* | *Treat* *5,000* *as* *simulation* *stretch* *until* *pace* *proves* |

**Cross-reference:** **Full** **design** in **Part** **B** (this **file),** **`FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`.**

---

## 8. Power of 5 operating plan

- **Power** **of** **1:** **Valid** **entry** **—** **solo** **actions** **(textbank** **eligibility,** **one** **event,** **one** **donor** **ask) ** without **forming** a team.  
- **Power** **of** **2:** **Pair** **—** **shared** **commitment,** **buddy** **check**‑**ins,** **split** **asks.**  
- **Power** **of** **5:** **Team** **completion** **—** **five** **named** **commitments** **(as** **defined** in **P5** **product/Prisma** **when** **built) **+** **leader** when **mature.**  
- **Team** **leader** **pathway** **(§6):** **only** after **reliability** + **mentorship** **capacity.**  
- **County** **rollup** **(§15):** **P5** **metrics** **aggregate** to **county** **KPIs** **without** **exposing** **rosters** **inappropriately.**  
- **Dashboard** **KPIs** **(examples):** P5s **started,** P5s **complete,** **median** **time** **to** **5,** **stale** **invites.**  
- **Training** **(Organizing** **Guide** **+** **role** **manuals).** **Gamification** **(honest** **badges,** **no** **shaming).** **Message** **support** **(Message** **Engine** + **NDE,** **approved** **snippets).** **Follow**‑**up** **cadence** **(7/14/30d** for **P5** **stuck** **states).**

---

## 9. Workbench operating rhythm

**Central** **nervous** **system** **(§**`open-work` **/ admin/workbench).** **Daily/weekly** **skeleton:**

| Timebox | **Action** |
|---------|------------|
| **Daily** | **Triage** **WorkflowIntake**; **age** **oldest;** **assign** or **parking** **lot;** **incident** **or** **press** **fast** **path** (owner/CM) |
| **Intake** **review** | **classify,** **link** to **user/county,** **no** **PII** in **logs** |
| **Task** **queue** | **WIP** **limit** per **role** |
| **Comms** **queue** | **One** **batch** **for** **non**‑**time**‑**critical;** **legal** on **separate** **swim** **lane** |
| **Event** **queue** | **Confirm,** **materials,** **follow**‑**up,** **asks** (§14) |
| **Volunteer** **queue** | **Placement,** **training** **nudge,** **inactive** **re**‑**engagement** (policy) |
| **Finance** **/** **compliance** | **Tranche** from **intake,** **COH** **alerts,** **disclosure** **due** (treasurer) |
| **Approval** **routing** | **LQA** **(lowest** **qualified** **approver):** **e.g. field** **draft** **→** **field** **lead,** not **default** **owner;** **only** **escalate** on **time** or **threshold** |
| **Risk** if **skipping** | **Dormant** **hub,** **missed** **compliance,** **volunteer** **burnout** (§22) |

---

## 10. KPI control system (top-down and bottom-up)

**Layers:** **State** **→** **Region (OIS 8)** **→** **County** **→** **City** **→** **Precinct** **→** **Team (P5)** **→** **Individual** **(when** **appropriate**). **Every** **layer** can **surface** (when **data** **exists**):  

| Layer | **Readiness** | **Growth** | **Money** | **Volunteer** | **Message** | **Event** | **P5** | **GOTV** | **Risk** |
|--------|-------------|------------|------------|-------------|-------------|-----------|--------|----------|----------|
| **State** | Headroom to goal | Momentum | Burn vs inflow | Active vs signup | MCE+NDE cycle | Trailing 30d | P5 state proxy | T‑days | Compliance queue |
| **Region** | Same, regionalized | Trailing 7d/30d | — | — | Local gaps | — | — | County bench | Stale OIS |
| **County** | CC present Y/N | Funnel | Local asks | Active % hub | NDE for county | Events/mo | P5 in county | Early vote (when set) | Ordinance (signs) |
| **City** | — | — | — | — | — | — | — | — | **Lower** data |
| **Precinct** | Sign coverage (program) | — | — | — | — | — | P5 in precinct | **ED** | Safety |
| **Team** | P5 “complete” | Invites out | N/A (unless ask) | Attendance | Script use | N/A | 0–1 | N/A | Data leak |
| **Individual** | Training done | N/A | Donor? | N/A | N/A | N/A | Role | N/A | **PII** — restrict |

**Scores** (0–100 or 0–6) **are** **models** **—** **rebaseline** with **assumptions** (see **SIMULATION** **PLAN**).

---

## 11. Adaptive strategy model (future; human gates)

**Questions** the **readiness** **simulation** **answers** (suggests, **not** **auto**‑**executes**):  

- **Ahead** or **behind?** (fundraise vs week-to-date **band,** **volunteer** **active** **vs** **plan**)  
- **What** **changed** **this** **week?** (inputs: **$** in, **#** **events,** **#** **new** **intakes)  
- **What** **inputs** **changed** **readiness?** (e.g. **new** **county** **CC,** **GOTV** **window** **added**)  
- **What** **KPI** **moved?** (OIS, **P5,** **GOTV** **proxy**)  
- **What** **task** **type** should **suggest?** (Workbench **suggestion,** **human** **creates** **CampaignTask**)  
- **What** **requires** **approval?** (§9, **MANUAL** **requests**) **Who** **gets** **it?** (RACI) **What** **dashboard** **changes?** (highlight, **not** **rewrite** **strategy** **in** **app**)

**Critical:** This is a future simulation and projection layer. It must not auto-execute sensitive strategy (contrast, spend, GOTV scripts) without human approval.

---

## 12. Simulation readiness layer (plan — no code)

**Full** companion spec: `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`. This section is the *design checklist*; **no** code, **no** implied deployment.

| Design element | Role |
|----------------|------|
| **Input variables** | Cash, burn, goal date, signups, hub size, **active** count (SOP), P5 state (when in DB), events, county CC count, sign coverage, EV/GOTV dates, comms/NDE throughput |
| **Assumptions registry** | Versioned, owner-named; every forecast names which assumptions it used |
| **Scenario engine** | Named runs (e.g. Conservative, Base, Momentum); outputs **ranges**, not point certainty |
| **Readiness adjustment model** | When an input flips (e.g. new county coordinator), which **readiness** subscores change and why (human-readable) |
| **KPI movement model** | Which KPIs are **stocks** vs **flows**; weekly delta vs level |
| **Fundraising forecast model** | Weekly raise **bands**, **implied** need-to-goal, sensitivity to a bad week |
| **Volunteer growth model** | Funnel: signup → hub → active → P1 / P2 / P5; **conversion** as assumptions |
| **County activation model** | Bench depth, event cadence, OIS/Field Intelligence data freshness |
| **Sign holder coverage model** | Precinct/road **coverage** **goals** as ranges; legal/safety gating |
| **GOTV readiness model** | Contact capacity, script compliance status, not individual voter “scores” in public |
| **Election Day pressure model** | Operational **load** (incidents, comms queue, ride desk) — **not** a public “prediction” of vote margin |

Vocabulary: **forecast**, **scenario**, **projection**, **readiness model**. **Never** claim certainty, true **prediction**, or replacement for **compliance** / **treasurer** / **counsel**.

---

## 13. Campaign phases 0–17 (expanded prose)

**Source:** `workflows/DAY_ONE_TO_ELECTION_DAY_CAMPAIGN_LIFECYCLE.md` (table + repo support column). **Below:** each phase with **goals, owner, dashboard focus, workflow, KPIs, risks, next actions, approvals, system vs human.** “Dashboard” = required **attention** in that **slice** (may be static/spreadsheet until product exists). See **§19** for the **matrix** of dashboard types by phase.

### Phase 0 — Candidate intake and philosophy

- **Goals:** One aligned narrative: **tone, boundaries, priorities,** opposition **rules** (sourcing), contrast **red lines** (compliance).  
- **Primary owner:** Owner with candidate; **CM** and **compliance** support.  
- **Dashboard focus:** candidate-facing truth (briefs), **comms** internal queue for drafts.  
- **Workflow:** `admin/candidate-briefs` (as applicable), `CANDIDATE_AND_CAMPAIGN_MANAGER_INTAKE_GAP_ANALYSIS` gaps until structured “candidate config” exists.  
- **KPIs (examples):** **Conflict** **rate** on public copy (qualitative), time-to-update after external event.  
- **Risks:** Unsourced attacks; drift between site and OIS.  
- **Next actions:** Written one-pager of non-negotiables; counsel sign-off on contrast.  
- **Approvals:** **Counsel** on claims; **owner** on crisis tone.  
- **What the system does:** Serves stored briefs and internal notes; **does not** invent philosophy.  
- **What humans do:** Interviews, written boundaries, sign-off on **Message Engine** and **Narrative Distribution** use.

### Phase 1 — One-person campaign setup

- **Goals:** A **single** operator can run **intake, site, Workbench** without dropping SLA on critical paths.  
- **Primary owner:** Owner (or **admin**).  
- **Dashboard focus:** **owner** triage, **open-work** count, optional **CM** if shadowing.  
- **Workflow:** `admin/login`, workbench, site CMS; `WorkflowIntake` as spine.  
- **KPIs:** Intake age, open work, email backlog.  
- **Risks:** **Burnout;** `ADMIN_SECRET` hygiene.  
- **Next actions:** Batching, WIP limits (§4, §9).  
- **Approvals:** **Owner** for spend and strategic messaging until CM exists.  
- **What the system does:** **Queues and surfaces** work.  
- **What humans do:** Triage, triage, **stop** new programs if SLA fails.

### Phase 2 — First volunteer (form / email)

- **Goals:** Convert interest into **`WorkflowIntake`** and a first human **response**.  
- **Primary owner:** V.C. / admin.  
- **Dashboard focus:** **owner** / **CM** triage, **volunteer** “first action” (when product exists).  
- **Workflow:** `POST /api/forms` → `handlers` → `WorkflowIntake` (see `SYSTEM_CROSS_WIRING_REPORT.md`).  
- **KPIs:** **Time to first** meaningful response, **PII** handling errors (should be **zero**).  
- **Risks:** PII in logs, duplicate people.  
- **Next actions:** Autoresponder *design*; match to `VolunteerProfile` where used.  
- **Approvals:** **CM** triage rules; **V.C.** for placement.  
- **What the system does:** Persists `Submission` + `WorkflowIntake` + user linkage.  
- **What humans do:** Reply, set expectations, no hype.

### Phase 3 — Power of 5 (relational)

- **Goals:** **Relational** growth through P1 → P2 → P5, not name-collection theater.  
- **Primary owner:** P5 members + team leaders; **V.C.** and **county** support.  
- **Dashboard focus:** **leader,** **volunteer,** (future) **P5** graph.  
- **Workflow:** `onboarding/power-of-5`; product gap: full P5 in Prisma.  
- **KPIs:** Teams started, complete, **stale** invites, median time to five.  
- **Risks:** **Over**-collection of contacts; rosters visible without consent.  
- **Next actions:** P5-**packet** per build plan.  
- **Approvals:** **Leader** for team roster; **compliance** on SMS/peercast.  
- **What the system does:** Public path + tasks (today); full graph = future.  
- **What humans do:** **Coaching,** **follow** **up** 7/14/30d (§8).

### Phase 4 — County, city, precinct structure

- **Goals:** **Place** leadership and visibility **without** voter dossiers in UI.  
- **Primary owner:** **County** leaders, field; **regional** as hub scales.  
- **Dashboard focus:** **county,** **region,** **state** OIS, **Field Intelligence**.  
- **Workflow:** `/counties/*`, OIS; city/precinct still thin in product (documented).  
- **KPIs:** **Captain** bench, coverage proxy, not microtarget.  
- **Risks:** Public “targeting” language; FIPS/slug **errors** (see **MANUAL_INFORMATION_REQUESTS**).  
- **Next actions:** Pilot counties after Pope; **one** **canonical** slug **rule** for **staff**.  
- **Approvals:** **CM** for **public** **titles;** **owner** for **regional** **override** (if ever).  
- **What the system does:** `County` + page snapshots where built.  
- **What humans do:** Recruiting, **narrative** **grounding** to **policy**.

### Phase 5 — Campaign manager in Workbench

- **Goals:** **CM** owns **triage** cadence; **RACI** for tasks and **comms** clear.  
- **Primary owner:** **CM;** **owner** break-glass.  
- **Dashboard focus:** **CM,** **owner,** **finance** (as assigned), **comms** queue.  
- **Workflow:** `admin/workbench`, `tasks`, open-work.  
- **KPIs:** **Median** triage time, WIP by assignee, defect rate on shipped comms.  
- **Risks:** **Shared** admin patterns; key rotation **not** in chat.  
- **Next actions:** RBAC when product **allows;** runbooks for **assignees**.  
- **Approvals:** **MANUAL_INFORMATION_REQUESTS** §5-6, §13-15.  
- **What the system does:** Merges intakes, tasks, email, festivals, threads.  
- **What humans do:** **Daily** stand-up **discipline,** LQA (§9).

### Phase 6 — Volunteer coordination (V.C. pipeline)

- **Goals:** **Quality** of placement, **de-dup,** **asks** that match capacity.  
- **Primary owner:** V.C.  
- **Dashboard focus:** **CM,** **volunteer** funnel, (future) **V.C.** **view**.  
- **Workflow:** `volunteers/intake`, asks, `SignupSheet*`.  
- **KPIs:** Placement %, time in stage, **code** **of** **conduct** incidents (should be low).  
- **Risks:** Mismatch, **harassment** **unhandled** **(see** **Pledge** in **MANUAL** **requests).**  
- **Next actions:** Pledge + dismissal path in manual **and** SOP.  
- **Approvals:** **CM** for sensitive placements.  
- **What the system does:** Stores asks and signups.  
- **What humans do:** **Conversations,** not **automation** as **empathy** **substitute**.

### Phase 7 — Field manager (turf, capacity)

- **Goals:** **Safe** use of data; **capacity** plan vs real volunteers.  
- **Primary owner:** **Field** manager.  
- **Dashboard focus:** **Field** **assignments,** **events,** **workbench** tasks.  
- **Workflow:** `FieldAssignment`, `CampaignEvent`, workbench.  
- **KPIs:** **Capacity** vs plan, **unsafe** use **(should** **trend** **zero).**  
- **Risks:** **Voter** **data** in wrong hands.  
- **Next actions:** Walk-list / policy UI; **Data** on exports.  
- **Approvals:** **Data** lead + **compliance** on export classes.  
- **What the system does:** **Models** in Prisma; **visibility** is **governed** **(see** ch **15).**  
- **What humans do:** **Training,** **spot** **checks,** **revoke**.

### Phase 8 — Comms, Message Engine, Narrative Distribution

- **Goals:** **Message** discipline; **Narrative Distribution** to channels **with** **approvals**.  
- **Primary owner:** Comms, **message** lead, **Narrative** **Distribution** lead.  
- **Dashboard focus:** **comms,** **owner,** **candidate** (read for sensitive), **CM**.  
- **Workflow:** MCE, NDE, workbench comms, `CommunicationPlan` paths.  
- **KPIs:** **Cycle** time, defect rate, **compliance** flags.  
- **Risks:** Leaks, **unreviewed** paid/regulated.  
- **Next actions:** MCE+NDE **telemetry** “what shipped this week” when available.  
- **Approvals:** **Counsel** for regulated/paid; **owner** for crisis.  
- **What the system does:** **Plans,** drafts, **queues**; **not** one-button “send everything.”  
- **What humans do:** **Message** **Engine** **curation,** NDE **wave** **owners**.

### Phase 9 — County leaders at scale

- **Goals:** **Field** **Intelligence** is **honest;** every county’s story **policy-grounded**.  
- **Primary owner:** **County** **leaders;** **regional**; **CM**.  
- **Dashboard focus:** **county,** **region,** **state,** OIS.  
- **Workflow:** **County** **admin,** intakes with `countyId`.  
- **KPIs:** **County** funnel health, event throughput, **narrative** **gaps** **(aggregate).**  
- **Risks:** Mixed **messaging,** **stale** **OIS** **tiles** **(verify** **provenance** **before** **public** “live” **claims**).**  
- **Next actions:** Merged **county** **VM** (build plan).  
- **Approvals:** **CM** for **regional** **messaging;** **compliance** for **sensitive** **local** **hooks**.**  
- **What the system does:** OIS and county public pages where built.  
- **What humans do:** **Coaching,** **conflict** **resolution** between **counties**.

### Phase 10 — Surrogates, local, down-ballot (policy-bound)

- **Goals:** **Event** and **ally** use **with** **legal** and **narrative** **alignment**.  
- **Primary owner:** **CM** + **field;** **compliance**.  
- **Dashboard focus:** **events,** **comms,** **candidate,** **owner**.  
- **Workflow:** `CampaignEvent`, **admin** **events,** **surrogate** **packets** (where documented).  
- **KPIs:** **Event** **throughput,** **incident** **count** (should be **low**).**  
- **Risks:** **Op** **smear** **response** without **sourcing** **(see** **MANUAL** **requests).**  
- **Next actions:** **Surrogate** **one-pagers** in **compliance** **folder**.**  
- **Approvals:** **Counsel,** **owner** in **last** **10d** per **MANUAL** **requests** **(when** **set**).**  
- **What the system does:** **Event** **records,** **tasks** **(see** build).**  
- **What humans do:** **Brief** **allies,** **no** **unattributed** **contrast** **in** **the** **room**.

### Phase 11 — Petition, ballot, filing windows

- **Goals:** On-time, legal access to the ballot (if in cycle for this race).  
- **Primary owner:** Compliance + counsel (not the Message Engine unattended).  
- **Dashboard focus:** **compliance,** **owner,** **finance** **(filing** **fees** **if** any).**  
- **Workflow:** Mostly **offline;** `ComplianceDocument` and manual calendar.  
- **KPIs:** **Filing** **deadlines,** **zero** **missed** **windows** **(operational** **KPI**).**  
- **Risks:** **Missed** **window,** **bad** **signatures** **(process** error).**  
- **Next actions:** **Petition** **workflow** in **product** **(pass** **2** **gap**).**  
- **Approvals:** **Legal** only for **filing** **and** **ballot** **text**.**  
- **What the system does:** **Store** and **remind** (when built); **not** file **on** its **own**.**  
- **What humans do:** **Verify** every **filing,** **double**-**count** where **required**.

### Phase 12 — Voter contact (aggregate-first)

- **Goals:** **Relational** and **permitted** contact at **scale**; **PII** **gated** **(see** **ch** **15,** **MANUAL** **requests**).**  
- **Primary owner:** **Field** + **data;** **CM** **(capacity).**  
- **Dashboard focus:** **Voter** **import** (admin), **not** to **public**; **owner** for **escalation**.**  
- **Workflow:** Voter import, `RelationalContact` **(RBAC** **required**).**  
- **KPIs:** **Contacts** **attempted** **(permissioned)**,** **not** conflated **dials+doors** **without** **label**.**  
- **Risks:** PII, **NCOA,** **dead** **voter** **(process** in **MANUAL** **requests**).**  
- **Next actions:** **Volunteer**-**safe** **UI** **limits,** **export** **logging**.**  
- **Approvals:** **Data** on **row**-**level** and **retention** **(written** **policy**).**  
- **What the system does:** **Model** **+** **staff** **tools**.**  
- **What humans do:** **Training,** **audit,** **revoke** **on** **exit** **(relational** **notes**).**  

### Phase 13 — Sign and visibility

- **Goals:** Precinct and roadside presence (see `PRECINCT_SIGN_HOLDER_AND_VISIBILITY_PROGRAM.md`).  
- **Primary owner:** Sign captain, field; safety / legal per local rules.  
- **Dashboard focus:** County, tasks (no dedicated `Sign` model in Pass 2 — tasks/ops in practice).  
- **Workflow:** Shifts, **tasks,** **events;** **materials** **in** **ops**.  
- **KPIs:** % precincts with **planned** **coverage;** **incidents** (should be **rare**).**  
- **Risks:** Trespass, **injury,** **ordinance** **issues**.**  
- **Next actions:** **Sign** program **as** **standard** **task** **pack** or **dedicated** **model** (build).**  
- **Approvals:** **Local** **ordinance** **owner** in **RACI;** **safety** **before** **scale** **(see** **MANUAL** **requests** **§8–9**).**  
- **What the system does:** Tracks work it is told about.  
- **What humans do:** Legal review, captain confirmations, §17.

### Phase 14 — Early vote

- **Goals:** Turn reliant supporters through the EV window; GOTV prep (see ch 18).  
- **Primary owner:** GOTV + field; V.C. (capacity).  
- **Dashboard focus:** GOTV, county, region, state, finance (late paid if any).  
- **Workflow:** `gotv` admin, public VR pages; re-verify depth in deploy.  
- **KPIs:** EV turnout proxy, not a poll in OIS; label data lag.  
- **Risks:** Bad or stale info in tiled OIS.  
- **Next actions:** EV-specific dashboard (build gap).  
- **Approvals:** Comms on GOTV scripts; CM on turf.  
- **What the system does:** What the build supports; verify per `SYSTEM_READINESS_REPORT.md`.  
- **What humans do:** Phone and in-person nudges, rides / assistance per policy (§18).  

### Phase 15 — GOTV (esp. last 72 hours)

- **Goals:** Complete contact work for the policy-defined universe; compliance on SMS and dialer.  
- **Primary owner:** GOTV lead, field, CM; V.C. (people).  
- **Dashboard focus:** GOTV, comms, CM, owner, finance (late paid).  
- **KPIs:** Contact-attempt completion; do not conflate dials and doors in one number (SOP).  
- **Risks:** Harassment, bad scripts, false urgency.  
- **Next actions:** GOTV comms gating; real-time only where the build allows.  
- **Approvals:** CM and compliance; owner in tight windows (per `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` when set).  
- **What the system does:** Tasks and comms (verify real-time comms in build for SMS compliance).  
- **What humans do:** Crisis discipline; no toxic urgency.  

### Phase 16 — Election Day command

- **Goals:** Polling place reality, incidents, visibility, legal first (ch 22). Repo support is partial; unified ED C2 is a gap.  
- **Primary owner:** CM + owner; field, comms, legal on-call.  
- **Dashboard focus:** ED command, workbench, tasks, comms, candidate schedule (internal), owner, region (visibility).  
- **Workflow:** Workbench and incidents as tasks/logs; not a public “war room” guided system (public naming: Campaign Operating System, Workbench, etc.).  
- **KPIs:** Coverage, incident response time — not a “win score.”  
- **Risks:** Disinfo, police/legal, media without RACI.  
- **Next actions:** ED rollup dashboard (readiness in `SYSTEM_READINESS_REPORT.md` was low in Pass 2).  
- **Approvals:** Legal for police/incident statements; owner for press in crisis.  
- **What the system does:** Tracks and surfaces; no unapproved comms.  
- **What humans do:** Command decisions, de-escalation, visibility at compliant sites.  

### Phase 17 — Post-election closeout

- **Goals:** Data retention, narrative, legal and dignified end (win or lose).  
- **Primary owner:** Owner; compliance, data.  
- **Dashboard focus:** Compliance, finance, owner; exports policy.  
- **Workflow:** `SiteSettings`, exports, audit trail.  
- **KPIs:** Archive completeness; no leaked PII; thank-yous to funders and volunteers.  
- **Risks:** Data misuse, retaliation, abandoned accounts.  
- **Next actions:** Retention automations; access offboarding.  
- **Approvals:** Counsel; owner for any narrative about opponents (no unsourced claims).  
- **What the system does:** Retention and lockdown when built.  
- **What humans do:** Thank the team; close the book with the treasurer.  

**Approvals (cross‑cutting all phases):** **Legal** (paid, contrast, claims), **treasurer** (money classes), **data** (exports, row-level), **owner** (crisis, high spend, break-glass) — **document** thresholds in **MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md** when **Steve** **sets** them.

---

## 14. Fundraising system (design)

- **Call** **time,** **house** **parties,** **donor** **pipeline** **(stages,** **next** **touch,** **owner** **field** **in** **CRM** **or** **manual** **log**).  
- **Event**‑**based** **and** **county**‑**based** **asks** **(§2** **+** **county** **OIS** **when** **live**). **P5** **fundraising** **asks** (peer, **not** coercive).  
- **Follow**‑**up** **cadence** **(48h,** **7d,** **30d** **thank** **+** **next** **step).** **Donor** **thank**‑**you** **workflow** **(comms** **queue,** **NDE** **optional,** **no** **auto** from **sensitive** **data).** **COH** **monitoring** **(finance** **dashboard** + **alerts**). **Budget** **burn** **control** **(scenarios** **§3;** **CM** + **owner**). **Escalation** **to** **fundraising** **lead** / **owner** when **tranche** **missed** **two** **weeks** **in** **a** **row** **(example).**  
- **Paid** **media** **(Pass** **3C)** **as** **amplification** **only:** **planned** **Arkansas** **Press** **Association** **vendor** / **channel** for **social,** **digital,** **radio,** **TV** **(if** **budget),** **paper,** **paid** **PR** **—** **must** **feed** **donor** / **volunteer** / **event** **follow**‑**up** **and** **respect** **base** / **stretch** **fundraising** **pace** **(§3).** **Does** **not** **replace** **relational** **fundraising** **or** **treasurer** **truth.** **Detail:** `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md`.

---

## 15. Field system (design)

- **County** **coordinator** **onboarding** **(COUNTY** **workflow,** **expectations** **from** **MANUAL** **requests** **§11).** **Targets** (events, **P5,** **signs**). **Event** **cadence** (monthly **local** **minimum** as **assumption** **per** **county,** **not** **mandated** in **this** **doc** **without** **Steve**). **Volunteer** **activation** (§7). **Local** **captains** where **warranted.** **Sign** **holders** (§17). **Tabling,** **canvassing** **readiness** **(policy,** **training).** **County** **dashboard** **(OIS+county+tasks).**

---

## 16. Communications and narrative system (design)

- **Message** **Engine** **(MCE):** **weekly** **theme,** **what** **to** **say,** **risks,** **local** **hooks** **(aggregate** **—** no **doxxing).**  
- **Narrative** **Distribution** **(NDE):** **rollout,** **surrogates,** **county** **one** **pagers,** **approval** **chain** **(compliance** + **owner** for **sensitive**). **Channels:** **house** **party,** **county,** **volunteer,** **donor,** **candidate** **—** **each** with **RACI** and **SOPs** in **Workbench.**  
- **Paid** **media** **as** **amplification** **(not** **the** **strategy) **: **vendor** **creative** **(e.g. **APA** **bundle) ** **must** **align** **to** **MCE/NDE** **—** **no** **orphan** **paid** **copy** **that** **contradicts** **approved** **themes** **or** **compliance.** **Paid** **does** **not** **replace** **field,** **house** **parties,** **or** **relational** **follow**‑**up** **(see** **Pass** **3C** **chapter).**  
- **Long**-**horizon** **infrastructure** **doctrine** **(Pass** **3C) **: **2026** **builds** **durable** **county** **and** **community** **teams** **where** **possible;** **aspirational** **north** **star** **=** **move** **toward** **no** **uncontested** **seat** **across** **Arkansas** **by** **2030** **through** **recruitment** **and** **training** **—** **not** **guaranteed** **outcomes,** **not** **a** **substitute** **for** **compliance** **or** **local** **law.** **Detail:** `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` **§9–11.**
- **Endorsement program + national attention (Pass 3D):** MCE/NDE + earned + optional paid press/boosts; all through approval and Workbench follow-up (no invented endorsers in repo). See `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md` and Part D (above).  
- **Fundraising + field:** Endorsement announcements should feed house parties, county ladder moves, and dollar pace (base first) — not hype without treasurer truth. See `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` (Pass 3D addendum).  
- **Precinct path + canvass (Pass 3D):** Field Intelligence at **county first**; precinct when data and governance allow; acquisition **flag** for strategic gaps. See `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` and Part D (above).  

---

## 17. Sign holder and visibility system (expansion)

**Build** on `workflows/PRECINCT_SIGN_HOLDER_AND_VISIBILITY_PROGRAM.md`, **(§8** **P5,** **§15** **field).** **Design** **elements:** **per**‑**precinct** **coverage** **goal** **(range** **not** **100%** **unless** **law** **+** **safety** **allow);** **county** **visibility** **map;** **shift** **boards;** **materials** **tracking;** **safety** **/** **legal** **review;** **captain** **confirmations;** **Election** **Day** **visibility** **(§18).** **Risks:** **trespass,** **ordinances** **(MANUAL** **requests** **§8–9).**

---

## 18. GOTV and Election Day (design)

- **Early** **vote,** **absentee** **/ mail** **(when** **applicable** **—** **state** **calendar** in **assumptions**). **Final** **30/7/72** **hours** **(tasks,** **comms,** **visibility). **ED** **command** **(Workbench+tasks),** **precinct** **coverage,** **sign** **holders,** **incident** **reporting,** **rides/assistance** **escalation,** **candidate** **schedule** **(internal),** **comms** **approval** **(fast** **path),** **closeout** **(phase** **17).**

---

## 19. Dashboard requirements by phase

**Method:** For each **phase 0–17**, which **dashboard surfaces** (when built) should **exist or be emulated** (spreadsheet, stand-up) so **someone** is **on point**. **P** = **primary** focus for that phase, **S** = **secondary** / monitor, **—** = **not** a **default** need (still may exist in product).

**Dashboard key:** Cnd = candidate, Own = owner, CM = campaign manager, Vol = volunteer, Ldr = leader, Cty = county, Reg = OIS **region,** St = OIS state, Fin = finance, Com = comms, GTV = GOTV, ED = **Election** **Day** **command** (not “AI” in public copy).

| Ph | Cnd | Own | CM | Vol | Ldr | Cty | Reg | St | Fin | Com | GTV | ED |
|----|-----|-----|----|----|-----|-----|-----|----|----|----|----|----|
| **0** | P | P | S | — | — | — | — | — | — | S | — | — |
| **1** | — | P | S | — | — | — | — | — | S | — | — | — |
| **2** | — | P | S | P | — | — | — | — | — | — | — | — |
| **3** | — | S | S | P | S | — | — | — | — | S | — | — |
| **4** | — | S | S | S | S | P | S | S | — | — | — | — |
| **5** | — | S | P | S | S | — | — | — | S | S | — | — |
| **6** | — | S | P | P | S | — | — | — | — | — | — | — |
| **7** | — | S | S | S | S | S | S | S | — | — | — | — |
| **8** | S | S | S | S | — | S | S | S | S | P | — | — |
| **9** | — | S | P | S | S | P | S | S | S | S | — | — |
| **10** | S | S | P | S | — | S | — | — | S | S | — | — |
| **11** | — | P | S | — | — | — | — | — | S | — | — | — |
| **12** | — | S | P | S | — | S | — | — | — | — | S | — |
| **13** | — | S | S | S | S | P | S | — | — | — | S | — |
| **14** | — | S | S | S | — | S | S | S | S | S | P | S |
| **15** | — | P | P | S | S | S | S | S | S | P | P | S |
| **16** | S | P | P | S | S | S | S | S | S | S | S | P |
| **17** | S | P | S | S | — | — | — | — | P | P | S | — |

**Notes (directional, not a build order):** **Phases 8, 9, 14–16** are the **heaviest** on **comms,** OIS, **GOTV,** and **ED;** product **readiness** for **GOTV** and **unified** ED **command** must be **re-verified** in deploy (see `SYSTEM_READINESS_REPORT.md`, `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`). **LQA** (§9): **not** every **role** needs every **widget** every **day.**

---

## 20. Manual-to-profile attachment (future)

**Per** **user** **(role** **aware):** **link** to **role** **manual** **(`roles/*`),** **training** **path,** **dashboard** **slice,** **KPIs,** **next** **action,** **promotion** **/** **sideways** **pathway,** **approval** **authority** **(if** any),** **escalation** **route** **(RACI).** **Campaign** **Companion** **recommendations** **draw** from **this** **structure** **—** **no** **auto** without **governance** **(§5,** **11).**

---

## 21. What must be built next (ordered priorities)

1. **Candidate** **onboarding** **(structured,** **§5)**  
2. **CM** **dashboard** (Workbench+role **widgets**)  
3. **Personal** **dashboard** (member **auth+PII** **policy)  
4. **P5** **real** **graph** in **Prisma/UX** (see **P5** **plan)  
5. **Fundraising** **pipeline** **(CRM** or **in**‑**app)  
6. **Volunteer** **activation** **pipeline** **(V.C. **metrics)**  
7. **County** **coordinator** **dashboard** **(OIS** **+** **tasks)**  
8. **GOTV** **dashboard** **(verify** **current** **route** **depth)**  
9. **Simulation** / **readiness** **engine** **(suggest,** **not** **auto)** per **§12** + **SIM** **plan**  
10. **Election** **Day** **command** **center** **(rollup)**

---

## 22. Risks and constraints

- **Legal** **/** **compliance** (finance, **text,** **contrast)  
- **Voter** **data** (access, **exports,** **NCOA)  
- **Fundraising** **overprojection** **(moral,** **donor,** **staff)** **—** use **§3** **ranges**  
- **Volunteer** **burnout,** **inactive** **hub** **fiction** **—** **honest** **KPIs** **(§2,** **7)  
- **Over**‑**automation** **(§11–12)  
- **Candidate** **approval** **bottlenecks** **(§5)  
- **Data** **quality** **(OIS,** **demos)  
- **County** **reliability** **(bench** **v.** **theater)  
- **Cash** **burn** **(COH,** **lumpy** **events) **—** **treasurer** **truth** **beats** **dashboards**  
- **Unrealistic** **schedule** **compression** **(GOTV** **+** **build** **conflict)**
- **Over**-**promising** **5,000** **active** or **$500K** **stretch** in **public** before **SOP** and **pace** **prove** (Pass **3B**)
- **Paid** **media** **without** **follow**‑**up** **capacity** **(ghost** **leads,** **COH** **bleed) **—** **see** **Pass** **3C** **governance**
- **Treating** **2028/2030** **pipeline** **or** **“no** **uncontested** **seat**” **as** **guaranteed** **in** **public** **messaging** **(aspirational** **infrastructure** **only) **
- **Claiming** endorsement or **precinct** readiness without process, compliance, or data (Pass 3D).  
- **Treating** canvass as the only “real field” (relational, P5, and events remain primary where appropriate).

---

## Part B — Pass 3B: Fundraising acceleration, 5,000 active stretch, travel, and no-hired-staff model

**Canonical** **detail** and **print**-**friendly** **copy:** `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`. **This** **Part** **summarizes** **+** **ties** to **the** **Guided** **Campaign** **System** (Workbench, **not** public “**AI**”).

### B.1 Grassroots Fundraising Acceleration System

**Flywheel (directional, repeat every stop/county):** **travel** **or** **county** **touch** **→** **local** **story** (aggregate, NDE) **→** **event** **/ house** **party** **→** **donor** **ask** **(compliance) **→** **volunteer** **ask** (Pathway) **→** **P5** **ask** **→** **county** **captain** / **fundraiser** **identification** **→** **next** **host** **/ next** **stop** **→** **donor** **&** **volunteer** **follow**‑**up** (Workbench) **→** **thank**‑**you** **→** **recurring** (where *permitted) **. **A** **break** **in** the **chain** = **a** `WorkflowIntake` **or** `CampaignTask` **(see** `SYSTEM_CROSS_WIRING_REPORT.md` **).**

**Components** to **stand** **up** (volunteer-**minded**; **RACI** to **owner/CM/ treasurer** for **$** and **contrast) **: **call** time **(candidate** + **pooled** **volunteer** **dial** **buddies) **; **house** **parties;** **road** **events** **tied** to **`CampaignEvent` **(county, **time,** **location) **; **county**-**based** **fundraising** **captains;** **donor** **follow**‑**up** **teams;** **thank**‑**you** **teams;** **recurring** **donor** **teams;** **small**-**dollar** **online** **asks** (compliance) **; **event** **host** **recruitment;** **P5**-**linked** **asks;** **county** **challenge** / **bracket** **(honest,** not **a** **lottery) **; **house**-**party**-**in**-**a**-**box** **(SOP** **+** MCE) **; **candidate** **travel** **fundraising** **loop** **(every** **stop** **=** **intake,** **donor,** **vol,** **story) **. **

**Fundraising** **lead** **dashboard** **(requirements,** when **built):** **(1) **$** to **$250K** **base** **by** week **(range) **(2) **trailing** **2**-**and** **4**-**week** **(3) **party** & **tour** **count** **(4) **donor** **stage** **ages** **(5) **stretch** **unlock** **eligibility** **(manual) **(6) **V.C.**-**linked** **“asks** **in** **progress” **(7) **compliance** **queue** for **any** **paid** / **contrast. **. **

**Finance** / **compliance** **boundaries: **(see** `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **—** no **unattributed** **contrast,** no **unconfirmed** `FinancialTransaction` **as** “real” **spend,** no **GOTV** or **regulated** text **from** a **model** without **sign**-**off** **(see** **§3** **unlock** and **ch** **14).**

### B.2 5,000 active volunteers by end of August (stretch, not a promise)

**Full** **scenario** **table** **(Floor** 250, **Base** 1,000, **Momentum** 2,500, **Stretch** 5,000) **+** **definitions** in **§7** of **this** **file**. **5,000** is **an** **aggressive** **stretch** requiring **~277** **net** **new** **active** **/ week** if **smoothed** — **treat** **as** **movement**-**scale,** **not** “**likely**” **in** **simulation** **defaults.** **5,000** is **not** a **suggested** public **slogan** without **treasurer,** **owner,** and **SOP** **(see** **FUNDRAISING** plan **+** `SIMULATION` **update** **). **

### B.3 No-hired-staff campaign structure

**Default:** **grassroots** — no paid staff in **planning** **assumptions** (owner may add later; **RACI** updates in real time).  

**Principles: **(1) **As** **many** **named** / **benched** **volunteer** **positions** **as** **sustainable,** **(2) **redundant** **leads,** **(3) **no** **single** **point** of **failure,** **(4) **county** **point** + **deputy** **where** **possible,** **(5) **turnover** **=** **loss** of **a** **title** **row** only **(Workbench** + **manuals** **retain) **(6) **Pathway** **sideways,** not **firing,** for **burnout. **. **

**Stewarded** **roles** **(pass** 3B **laundry** **list;** **map** to `roles/*` **in** **Pass** **4):** fundraising **captain,** **house** **party** **host** **captain,** **county** **coordinator,** **county** **deputy,** **precinct** **captain,** **sign** **holder** **captain,** **event** **lead,** **road** **team** **lead,** **merch/materials,** **social** **lead,** **story** **collector,** **message** / **Narrative** **Distribution** **helper,** **volunteer** **follow**‑**up,** **data** **steward,** **compliance** **liaison,** **finance** **helper,** **GOTV** **lead,** **Election** **Day** **precinct** **lead,** **(plus** **P5** **leader,** **CM,** **owner,** **candidate** in **RACI** **as** **non**-**volunteer** where **applicable) **. **

### B.4 Road campaign and county visit system (Steve + repo)

**Context: **(1) **Steve: **~3,200** **miles,** **27** **stops,** **≈** **a** **county** a **day** in **February; **(2) **paid** **travel** **=** **third**-**largest** **expense, **(3) **“list** of **everywhere** **we’ve** **been”** **exists** but **is** **not** **kept** **current** in **this** **repo; **(4) **goal: **each** **stop** **=** **data,** **follow**‑**up,** **fundraiser,** **volunteer,** **local** **story,** **CC** **ID,** **materials,** **(optional) **visibility. **. **

**What** **the** **repo** **offers** **(Pass** **3B,** no **app** **changes):**  
- `CampaignEvent` **(Prisma) **: **time,** **place,** `countyId`, **workflows,** **comms,** `relatedOwnedMedia*`, can **link** **to** `FinancialTransaction` **(`relatedEventId`) **. **. **- **`CountyCampaignStats.campaignVisits` **: **integer** per **county;** **not** a **per**-**stop** **log,** **can** be **stale. **- **`FinancialTransaction` **: **expense** **categor**y **(e.g. **travel) **for **burn** **+** **ROI. **- **No** `RoadTrip` **/ **miles** / **tank** **receipts** as **a** **first**-**class** **entity** in **this** **grep; **= **SOP,** **spreadsheet,** or **future** model. **- **UI: **`CountyCommandExperience` **(campaign **“visits” **+ **latest** **visit** **content) **— **depends** on **content** **ops** and **data** **hygiene. **. **

**Design** **elements** (manual) **: **county** **stop** log **(paper** or **intake) **+ **import** to **`CampaignEvent` **/ **or** **row** in **CSV;** **event** **outcome** **(donors,** **vols,** **story** **captured) **; **donor** **&** **vol** **follow**-**up** **queues;** **local** **story** for **MCE/NDE;** **OIS** / **ladder** **bump;** **materials** **reconciliation;** **mileage** **&** **cost** **(ledger) **; **travel** **ROI** **(projection) **: **$** **raised** **+** **vols** **recruited** **/ **$** **travel** + **(qualified) **time** “cost;” **“next** **stop”** **(scenario** **/** **triage,** not **autopilot) **. **. **

### B.5 County activation ladder (0–9)

**One** **row** per **county,** **versioned** in **OIS** and **(future) **simulation. **. **

| **Stage** | **0** | **1** | **2** | **3** | **4** | **5** | **6** | **7** | **8** | **9** |
|-----------|----|----|----|----|----|----|----|----|----|----|
| **Name** | No **contact** | **Contact** **ID’d** | **Vol** **active** | **CC** **ID’d** | **Event** **held** | **House** **party** | **P5** **active** | **Sign** / **vis** | **GOTV** **captain** | **Ops** **cell** |
| **Move** **up** | First **touch** | Responds | **1**+ **act**ion | **Commit** | **Debrief+ask** | **Date**+**host** | **P5** **on** **path** | **Plan**+**safety** | **Named+train** | **2**+ **+** **RACI** |

**Detail** in **`FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` **(full) **+** **KPI/owner** **(see** that **file) **. **. **

### B.6 Redundant human network design

- **At** **least** **two** **known** **contacts** **in** a **county** **if** **possible** (primary + **deputy) **- **LQA** for **triage,** **not** **owner**-**only** (§9) **- **“**Low**-**effort** **substitute**” **(e.g. **batch** **thank**-**yous) **- **Pathway** **sideways,** not **dismissal,** when **overloaded. **- **Readiness** **/ **simulation: **redundancy** **index,** **burnout** **risk** (see `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` **) **- **When** a **role** **empties,** **Work** **(Workbench) + **this** **manual** **+** `roles/*` **keep** the **playbook. **. **

---

## Part C — Pass 3C: Paid media ramp, APA vendor channel, and 2028/2030 infrastructure doctrine

**Canonical** **chapter:** `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` (executive summary through grassroots integration).

- **Arkansas** **Press** **Association** (planned) as **vendor** / **channel** for **social,** **digital,** **radio,** **TV** (if **budget),** **paper,** **paid** **press** **releases** — **price** **sheet** **pending** (Steve). **Paid** **social** **ramp,** **governance,** **KPI** **dashboard** **spec,** **and** **Workbench** + **`/api/forms`** **source** **tagging** **SOP** in **that** **file** (§2–8).  
- **2026** as **infrastructure** **election** + **2028/2030** **candidate** **pipeline** and **uncontested-seat** **north** **star** (aspirational, **not** **guaranteed) **—** §9–11 **there**. **“Full** **community** **team**” **—** §11 **+** **Pass** **3B** **no-hired-staff** **lists** (align in **Pass** **4).** **Simulation** **inputs** (paid **ROI,** **APA** **placeholder) **—** `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` **§20.**

---

## Part D — Pass 3D: Endorsement program, national attention, and precinct path to victory

**Canonical** chapters: `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md`, `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` (Pass 3D is **manual only**; there is no dedicated `Endorsement` model in scope—use `WorkflowIntake` / tasks / SOP. Field graph and voter models exist in Prisma—see `SYSTEM_READINESS_REPORT.md` for what is product-exposed vs. staff-only.)

- **Strategic lane — endorsements (process, not names):** initiate → track → approve → announce (earned + optional APA paid PR per Pass 3C) → county + V.C. follow-up. **Lanes:** direct democracy; election integrity / transparency / accountability; working-class, worker, and citizen protections; Arkansas local. **No invented endorsers** in the repo. **Endorsement ask packet** requirements are in the endorsement chapter.  
- **National attention:** intentional, sourced, compliance-first; should drive to forms, house parties, and P5 — not vanity alone.  
- **Flywheel (directional):** endorsement → **Message Engine** + **Narrative Distribution** → press/owned → **Workbench** follow-up → volunteer + **fundraising** (base/stretch pace per §3) + **paid** social boost of **approved** creative (Pass 3C).  
- **Precinct path to victory + canvassing:** **county-first** when precinct data is missing. For **strategic** counties without usable precinct data, use the **operator flag** *Precinct data acquisition required before full path-to-victory modeling* and RACI: data lead, county coordinator, field manager, CM. Canvassing is one Pathway, not required of every volunteer; walk lists = authorized users only.  
- **2028 / 2030:** durable community teams, candidate **pipeline (opt-in),** and uncontested-seat **north star** remain **aspirational** — not guaranteed outcomes; complements Pass 3B/3C infrastructure doctrine.

---

## Part E — Pass 3E: Youth/campus, NAACP, Extension Homemakers & focus categories, travel projection

**Canonical chapters:** `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md`, `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md`, `FOCUS_CATEGORY_ORGANIZING_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` (all manual-only; no app changes in this pass).

- **Youth and campus organizing (high focus):** Steve baseline — strong students on **3–4 campuses**, mainly **Central and Northwest** Arkansas, plus a few high school students; **rapid** buildout; ambition of volunteers and relationships on **major** higher-ed sites statewide (use ADHE’s **40+** institutions as **coverage** context — **not** a claim of active teams everywhere). **Campus ladder** 0–8; every institution **status**-**labeled** (active, contact identified, target, unknown, needs research) — no invented “active” chapters. **Calendar**- and **travel**-driven: see weekly travel system.  
- **NAACP branch buildout (relationship-first):** **Map** before scale; if no verified list exists, system action: **NAACP branch mapping required**. Visit ladder 0–8; **not** transactional; **not** assumed endorsement from a meeting. Integrates with county teams and `CampaignEvent` / travel **projection**.  
- **Extension Homemakers and focus categories:** EHC and other categories (caregivers, working-class, veterans, faith, small business, transparency, rural) are **listening** and **service** **lanes** — not assumed supporter lists. EHC: cite **3,200+** members / **320+** clubs (bracket) unless Steve locks a single stat; **Extension** has presence **across 75 counties** in public materials — not “we are in 75” unless field truth.  
- **Weekly travel projection:** Composite **place** / county / campus / NAACP / focus **scores**; inputs include **`CampaignEvent`**, `CountyCampaignStats.campaignVisits` (shallow; reconcile with **events** + Steve’s “everywhere we’ve been”), `FinancialTransaction` + `relatedEventId`, festival ingest, county ladder, precinct gap flags, **fundraising** and **host** **pipeline** — see Part B.4 in this manual. **Statewide** events and **where** the campaign has / has not been should feed **1-week**, **4-week**, and **12-week** **templates** in the travel chapter. **Burnout** guardrails: caps and redundancy (link Pass 3B B.6).  
- **Calendar-driven organizing:** `CampaignEvent` and public **calendar** routes are the **spine** for **scheduling** **stops** when **populated** and **SOP-**reconciled; **no** “ghost” **tour** **without** **Workbench** follow-up.  

---

## Part F — Pass 3F: County party relationships, rural Arkansas priority, meeting tour

**Canonical chapters:** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` (manual-only; **no** `CountyParty` Prisma model — use `CampaignEvent`, `WorkflowIntake`, `CampaignTask`, governed rosters).

- **Doctrine:** County **(Democratic)** parties are **local** **infrastructure** for **relationships,** **recruits,** and — where **true** — **volunteers** **and** **dollars** **(see** **Steve** on **state**-**level** **formal** **support** **—** **do** **not** **overstate).** **Meetings** **are** **not** **endorsements.** If **75**-**county** **meeting** **schedules** **are** **unverified,** **system** **action:** **county party meeting mapping required** (named **owner,** **sources,** **no** **fake** **rows).  
- **Rural Arkansas:** **Core** **priority** **in** **travel** **and** **organizing** **—** **not** **a** **side** **trip** (`COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` §3; `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` Pass 3F addendum §22).  
- **Meeting tour:** **Map** **or** **document** **unknowns;** **priority**-**score** **visits;** **pair** **with** **EHC,** **NAACP,** **campus,** **house** **party,** **fair** **stops;** **force** **48–72h** **follow**-**up** **in** **Workbench** **(tour** **system** **§9–11).**  
- **Fundraising** **and** **compliance:** **Same** **treasurer** **/** **MCE/NDE** **discipline** **as** **other** **lanes** **(county** **plan** **§9).**  
- **Integrations:** **Weekly** **travel** **scores,** **fundraising** **flywheel,** **P5,** **precinct** **/** **GOTV** **readiness** **flags,** **2028/2030** **pipeline** **(opt**-**in)** **—** **as** **in** **county** **plan** **§14–16.**

---

## 23. Steve decision list (from MANUAL_INFORMATION_REQUESTS + new from Pass 3)

**Incorporate** the full set in `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§1–**25**). **Additions** from **Pass 3, 3B, 3C, 3D, 3E, 3F** include:

- **Confirm** **definition** of “active volunteer” (14d vs 30d; one meaningful action — see **§7**).  
- **Confirm** **$250K** **base** (Aug 31) and **$500K** **stretch;** **treasurer**-agreed **reporting** **period** for **two**-**consecutive**-**week** **stretch** **unlock** (replaces ad hoc “Aug 1 vs 31 on $500K only” as the primary question). **Rough** **attribution** of **$55K** to pre– vs post–Mar 4.  
- **5,000** **active** **by** **Aug** **31:** **if** and **how** to **name** in **public;** default **=** **internal** **stretch** only **(Pass** **3B).**  
- **Reconcile** **external** “everywhere we’ve been” to **`CampaignEvent`**, OIS, **or** **explicit** **off**-**line** **SOP** with **named** **owner**; **mile** / **receipt** **/ stop** log **(manual** **or** **future** **ingest) **.  
- **Tranche** / miss **windows** for **fundraising** **leads** (escalation to **owner) **.  
- **Sign** **program** **minimum** **visibility** **—** **hard** **KPI** **or** **explicit** **“not** **a** **win** **metric**” (see **old** **§9** **requests**).  
- **P5** **product** **definition** of **“complete** **team**” for **KPIs** (when **Prisma** **ready).**  
- **Pass 3C** (paid media + long-term infrastructure): Arkansas Press Association price sheet and contract scope; authorized channels; dollar thresholds; paid social ramp cap; UTM/source tags; compliance disclaimers; retargeting policy (if any); 2028/2030 pipeline expectations; “full community team” definition; target offices/seats list when available — not in repo with PII.  
- **Pass 3D** (endorsements + precinct path): Endorsement priority list, off-limits orgs, who may ask, quote/announcement rules, national press targets (separate from repo if needed). Precinct: priority county order, voter file as-of, canvass contact definition, turf access per role, counties where county-only modeling is accepted vs. where precinct acquisition is mandatory. **No** fabricated endorsements or precinct data in the manual.  
- **Pass 3E** (youth, NAACP, EHC / focus, travel): Campus contact list and true **status** labels; high school / youth **rules**; **NAACP** **mapping** **source** and **relationship** **owner**; EHC and focus **lane** (listening vs partnership); **calendar** of record; “places we’ve been” reconciliation; **travel** cap and **who** **moves** the **week**; see **`MANUAL_INFORMATION_REQUESTS` §21–24**.  
- **Pass 3F** (county party + rural + meeting tour): **Rural** **priority** **weighting** **and** **county**-**party** **inputs** **to** **travel** (`WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` §22); **75**-**county** **meeting** **map** **owner** **and** **verification** **rules;** **surrogate** **/** **presenter** **policy;** see **`MANUAL_INFORMATION_REQUESTS` §25** and **Part** **F** **above.**

**Last updated:** 2026-04-27 (Pass 3 + 3B + 3C + 3D + **3E** + **3F**)
