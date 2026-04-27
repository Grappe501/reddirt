# Manual Pass 3 — completion report

**Lane:** `H:\SOSWebsite\RedDirt` (markdown / manual only — **no** app code, **no** dependencies, **no** commit)  
**Pass name:** *Manual Pass 3 — Campaign Strategy, Lifecycle, Baseline, and Simulation Readiness*  
**Date:** 2026-04-27

---

## Files read (for alignment; not all re-read line-for-line in this session)

As specified in the Pass 3 brief: `MANUAL_PASS_2_COMPLETION_REPORT.md`, `SYSTEM_CROSS_WIRING_REPORT.md`, `SYSTEM_READINESS_REPORT.md`, `workflows/DAY_ONE_TO_ELECTION_DAY_CAMPAIGN_LIFECYCLE.md`, `workflows/PRECINCT_SIGN_HOLDER_AND_VISIBILITY_PROGRAM.md`, `workflows/CANDIDATE_AND_CAMPAIGN_MANAGER_INTAKE_GAP_ANALYSIS.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md`, `ROLE_MANUAL_INDEX.md`, `MANUAL_TABLE_OF_CONTENTS.md`, `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`, `docs/deployment.md`, `prisma/schema.prisma` (where present), `src/lib/campaign-engine/open-work.ts`, `src/lib/forms/handlers.ts`, and admin/workbench-related patterns (from prior Pass 2 evidence and `SYSTEM_CROSS_WIRING_REPORT.md`).

---

## Files created

| File | Purpose |
|------|---------|
| `campaign-system-manual/CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` | Major manual chapter: §§1–23 (executive reality, baseline 2026-04-27, fundraising trajectory in **ranges**, one-person launch, candidate onboarding *design*, organic growth, volunteer activation, P5, Workbench rhythm, KPI control, adaptive strategy, simulation readiness layer, phases 0–17 prose, fundraising/field/comms/sign/GOTV/ED, dashboards by phase, manual-to-profile, build priorities, risks, Steve decision list) |
| `campaign-system-manual/SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` | Future **forecast** / **scenario** / **readiness** system design (no code); sections 1–18 per Pass 3 script |
| `campaign-system-manual/MANUAL_PASS_3_COMPLETION_REPORT.md` | This file |

---

## Files updated

| File | Change |
|------|--------|
| `MANUAL_BUILD_PLAN.md` | Pass 3 marked **complete**; **Pass 4** script = *Role Playbooks, Training Modules, and Dashboard Attachment* (per user spec) |
| `MANUAL_TABLE_OF_CONTENTS.md` | Version note + **Pass 3** documents + appendix G–H |
| `SYSTEM_READINESS_REPORT.md` | Pass 3 alignment note (strategic manual + simulation plan; no new app 0–6 regrade) |
| `WORKFLOW_INDEX.md` | **Pass 3** cross-links to strategy + simulation docs |

---

## Baseline assumptions used (Steve + directional math)

- **~$55,000** total raised; **~$15,000** cash on hand; spend qualitatively on lift/setup, materials, visibility.  
- **$500,000** goal by **August** (Aug **1** vs **31** called out in strategy doc as it changes weekly need).  
- **Serious push** from **2026-03-04**; **~100** signups, **~70** hub, **~10** **active**; **4–5** county coordinators; leads (social, fundraising, events).  
- **All forecasts marked directional;** **no** certainty claims. **Attribution** of **$55k** to pre/post Mar 4 is **uncertain** (strategy doc **ranges** average weekly and notes treasurer reconciliation).

---

## Fundraising trajectory summary (from `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` §3)

- **Span** Mar 4 → Apr 27, 2026: **55** calendar days ≈ **7.9** weeks.  
- **Implied** average weekly (if $55k is **all** post Mar 4 in simple model): **~$7,000**/week; **ranged** **~$5,500–$8,500**/week to reflect lumpiness and possible pre–Mar 4 dollars.  
- **Remaining to $500k:** **~$445,000** (from $500k − $55k, same assumption set).  
- **Apr 28 → Aug 1:** **96** days ≈ **13.7** weeks → **~$32,500**/week *directional* (**$30k–$35k** range).  
- **Apr 28 → Aug 31:** **126** days = **18** weeks → **~$24,700**/week *directional* (**$22k–$28k** range).  
- **Scenarios** (Conservative / Base / Momentum / Breakout) in the manual **include** **weekly** **order** **of** **magnitude**, **cash** **implications**, **ops** **needs**, **risk**, **“what** **must** **be** **true**.”

---

## Campaign lifecycle additions

- `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **§13** expands **phases 0–17** into **per-phase** **subsections** (goals, owner, dashboard focus, workflow, KPIs, risks, next actions, approvals, **what the system does** vs **what humans do**), aligned to `workflows/DAY_ONE_TO_ELECTION_DAY_CAMPAIGN_LIFECYCLE.md`.  
- **§12** lists the **simulation** design elements (input variables, assumptions registry, scenario engine, per-domain **readiness** models) with a pointer to `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`.  
- **§19** adds a **P/S/—** **matrix** (12 dashboard types × 18 phases). **Phases 14–16** still **note** **gaps** (e.g. **unified** ED **command**, **GOTV** **depth**) **without** claiming full product **ship**.

---

## Simulation system design (deliverable)

- **`SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`**: **purpose,** **forecasts,** **never**-**claims,** **inputs,** **outputs,** **baseline,** per-domain **models,** **confidence,** **approval** **gates,** **dashboard** **hooks,** **future** **data** **sketches,** **manual** **updates,** **build** **roadmap** (spreadsheet → admin read-only → suggested tasks w/ **opt**-**in**).

---

## Dashboard requirements added (Pass 3)

- **By phase (§19):** matrix language tying **candidate,** **owner,** **CM,** **volunteer,** **leader,** **county,** **region,** **state,** **finance,** **comms,** **GOTV,** **ED** **command** to **phases 0–17** and **DASHBOARD** **audit** (see `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md` for product truth).  
- **KPI control (§10):** **layered** **scores** (readiness, growth, money, volunteer, message, event, P5, GOTV, risk) with **“models** **—** **rebaseline**” **disclaimer**.

---

## Unresolved questions

- All items in `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **remain** **open** until Steve answers.  
- **Additions** listed in `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **§23** (e.g. **defining** “**active**” **for** **hub,** **Aug** **1** **vs** **31** **goal** **date,** **$55k** **attribution,** **tranche/escalation** **windows,** **sign** **KPI** **hard** **or** **explicit** **non**‑**KPI,** **P5** “**complete**” **def** for **KPIs**).  
- **Product** **depth** of **GOTV** **/ ED** **admin** **routes** still **TBD** **per** `SYSTEM_READINESS_REPORT.md` **(verify** with **steering** before **production** **claims**).

---

## Recommended Manual Pass 4 script

**Name:** *Manual Pass 4 — Role Playbooks, Training Modules, and Dashboard Attachment*  

- Turn **priority** **roles** into **deeper** **chapters** (playbook level).  
- **Training** **modules** by **role**; **onboarding** **checklists**; first **24h** / **7d** / **30d** **task** **templates** (procedural).  
- **Define** **dashboard** ↔ **manual** **attachment** **rules** and **promotion** / **sideways** **pathways**.  
- **Structure** the **web** **manual** **IA** for **role**‑**based** **navigation** (see `web-presentation/WEB_MANUAL_*`).

---

## Coordination protocol (Slice 3 alignment)

### WorkflowIntake from `/api/forms`

**Yes** (unchanged from Pass 2 **evidence**): `POST` **`/api/forms`** → `src/lib/forms/handlers.ts` → **`WorkflowIntake`** (and related `User` / `Submission` / volunteer paths per handler). **No** new runtime verification in Pass 3 (manual-only pass).

### Operator review / export path

- **Review:** **`/admin/workbench`** with **`open-work`** **merge** of **intakes,** **tasks,** **email,** **threads,** **festivals** (per `open-work` + `SYSTEM_CROSS_WIRING_REPORT.md`). **Export** **/** **PII** **/** **finance** follow **RACI** in **`TASK_QUEUE_AND_APPROVALS.md`** and **`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md`**.

### Remaining blockers (manual slice)

- **Steve** **answers** on **policy,** **calendar,** **compliance,** **and** **definitions** in **`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md`**.  
- **GOTV/ED** **product** **depth** **verification** (not a Pass 3 deliverable to **code**).  
- **P5** **graph** **in** **DB** still **a** **build** item **(not** **done** in **Pass** **3**).

### Days 4–7 compression (Kelly SOS production slice)

- **Pass 3** did **not** **change** **app** **code;** **compression** of **build** **days** **4–7** **depends** on **separate** **engineer** **capacity** and **unblocked** **dependencies** **(Prisma,** **auth,** **exports). **Manual** only: **recommend** not **over**‑**promising** **volunteer** or **$** **trajectories** without **SOPs** and **treasurer** **truth** — **read** **`CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` §3, §7, §22** before **setting** **external** **commitments**.

---

**Last updated:** 2026-04-27 (Pass 3)
