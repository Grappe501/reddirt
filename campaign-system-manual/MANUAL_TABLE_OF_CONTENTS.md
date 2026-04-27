# Manual — Table of Contents (book-first, 500–1000+ pages)

**Version:** Pass 2B + Pass 3 + Pass 3B + Pass 3C + Pass 3D + **Pass 3E** + **Pass 3F** + **Pass 3G** + **Pass 3H** + **Pass 4** + **Pass 4B** + **Pass 5** (2026-04-28). **Pass 4** adds `playbooks/` (41 role playbooks + index/authority **docs**) and **Part I** in `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`. **Pass 4B** adds **Part** **J,** `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` **§**26, and four 4B design manuals + **`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**38. **Pass 5** adds operator runbooks: **`WORKBENCH_OPERATOR_RUNBOOK.md`**, **`STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md`**, **`CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md`**, **`CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md`**, **`SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md`**, **`MANUAL_PASS_5_COMPLETION_REPORT.md`**, and **`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**39.** Chapters 20–23 are operating extensions. **Pass 3B** adds `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` and Part B in `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`. **Pass 3C** adds `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md`, Part C, `MANUAL_PASS_3C_COMPLETION_REPORT.md`, and updates the simulation plan and `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §18. **Pass 3D** adds `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md`, `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`, Part D, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` §21, and `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §19–20. **Pass 3E** adds Part E in the strategy manual, `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md`, `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md`, `FOCUS_CATEGORY_ORGANIZING_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` §22, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §21–24, and `MANUAL_PASS_3E_COMPLETION_REPORT.md` (no invented campus/NAACP facts; **NAACP branch mapping required** when unverified). **Pass 3F** adds Part F, `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` §22, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` §23, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §25, and `MANUAL_PASS_3F_COMPLETION_REPORT.md` (no invented meeting dates or chairs; **county party meeting mapping required** when unverified). **Pass 3G** adds **Part** **G,** the Pass 3G **standalone** manuals (immersion, contact intake, call time, faith/chamber, listening tour, visibility fundraising, **proposed** ambassador/commission, training, path-to-win data, GCal pipeline), `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**26**–**35**, and `MANUAL_PASS_3G_COMPLETION_REPORT.md` (commission/ambassador and county lists remain **uncounseled** until sign-off). **Pass 3H** adds **Part** **H,** `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**36**,** `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` **§**25**,** `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` **§**24**, and `MANUAL_PASS_3H_COMPLETION_REPORT.md` (**no** invented **ledger** **totals** **from** **Git;** **CONFIRMED** **`FinancialTransaction`** **+** **treasurer** **are** **truth** **when** **available** **).** **Vocabulary** in public copy: **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — not “AI” as a product name.

---

## Front matter (manual meta)

- Title page, edition, version (see `package.json` / release tags)  
- How to use: **by role**, **by phase**, **by workflow** (maps to `web-presentation/`)  
- Maturity 0–6, route naming, PII and **secret** handling  
- **MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md** as **unresolved** dependency list  
- Document history, sign-off (owner/CM for ops chapters)

---

## Part I: System vision — `chapters/00–01`

- **00 Executive overview**  
- **01 System vision**  
- *Subchapters (expand as volumes):* stakeholder map, theory of change, service doctrine, **honest** data posture

---

## Part II: Campaign Operating System (architecture) — `chapters/02`

- Stack, boundaries, `WorkflowIntake` as spine  
- *Subchapters:* integration packets, VAN / file **reference** only, `SYSTEM_CROSS_WIRING_REPORT.md` as **appendix**

---

## Part III: User journey — `chapters/03`

- **Volunteer entry by email** and forms → Workbench (see `workflows/FIRST_EMAIL...`)  
- *Subchapters:* Day One / first 72h follow-up, consent, re-engagement, LAUNCH-1 segmentation

---

## Part IV: Role manuals — `chapters/04` + `roles/*` + **`playbooks/roles/*` (Pass 4)**

- Framework + **Pathway**  
- *Per-role* full chapters in future print volumes; **index:** `ROLE_MANUAL_INDEX.md` (Pass 2B, **26** catalog roles) **+** **Pass 4** depth order **(27,** `MANUAL_PASS_3F_COMPLETION_REPORT.md`)  
- **Pass 4 book-style playbooks:** **`playbooks/ROLE_PLAYBOOK_INDEX.md`** lists **41** filenames; each has a **25-section** chapter in **`playbooks/roles/<slug>.md`** (links from matching `roles/<folder>/README.md` where 1:1). **Authority** docs: `playbooks/APPROVAL_AUTHORITY_MATRIX.md`, `playbooks/ESCALATION_PATHS.md`, `playbooks/ROLE_KPI_INDEX.md`, `playbooks/ROLE_READINESS_MATRIX.md`, `playbooks/DASHBOARD_ATTACHMENT_RULES.md`, `playbooks/PROMOTION_AND_SIDEWAYS_PATHWAYS.md`.  
- **26 roles (catalog, Pass 2B):** new volunteer; **Power of 1** (solo contributor); Power of 5 member; Power team leader; **neighborhood/block** captain; precinct captain; city captain; county leader; regional organizer; event lead; sign holder captain; **GOTV** lead; **narrative distribution** lead; **voter file / data** steward; volunteer coordinator; field manager; **communications** lead; **message** lead; data lead; finance lead; compliance lead; campaign manager; **candidate**; **admin (operator)**; **owner**; (plus: legacy **volunteer** umbrella, **regional** vs NWA, etc. — see index)

---

## Part V: Power of 5 — `chapters/05`

- **Power of 5 growth model**; pipelines; missions  
- *Subchapters:* consent, roster visibility, honest gamification, integration w/ OIS

---

## Part VI: Dashboards and KPIs — `chapters/06`, `14`

- Hierarchy; **role-based** dashboards (when built)  
- *Subchapters:* demo vs live, **Pathway** KPIs, **Field Intelligence** vs internal metrics

---

## Part VII: Workbench, approvals, task flow — `chapters/07`

- `TASK_QUEUE_AND_APPROVALS` workflow; **RACI** for intake  
- *Subchapters:* **Task queue** and **approval** **system** (SOP, not a single `Approval` table for everything)  
- **Workbench** operations: email, intakes, tasks, comms, festivals, threads

---

## Part VIII: Message Engine + Narrative — `chapters/08–09`

- MCE, NDE, public language, counsel flags  
- *Subchapters:* **Narrative distribution** lead, **comms** approval chain

---

## Part IX: Field, county, city, precinct — `chapters/10–11`

- **County / city / precinct** buildout; FIELD-1  
- *Subchapters:* **sign holders** and **precinct visibility** (`PRECINCT_SIGN_HOLDER...` workflow)  
- **Field manager** and **regional** coordination  
- **Pass 3D (manual only):** `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` — path-to-victory as **operational** (capacity, turf, GOTV), not prediction; **precinct data gaps** = acquisition before full modeling; schema references in repo, not a claim of full UI

---

## Part X: Candidate and CM — `chapters/12`

- **Day One campaign** **launch** (one-person)  
- *Subchapters:* **Campaign manager** **operating** **model**; `CANDIDATE_AND_CAMPAIGN_MANAGER_INTAKE_GAP_ANALYSIS.md`  
- **Candidate** **intake** and **philosophy** (policy content)

---

## Part XI: Training — `chapters/13`

- **Organizing Guide**; leadership development  
- *Subchapters:* **by role**, **by phase**

---

## Part XII: Data and privacy — `chapters/15`

- *Subchapters:* `RelationalContact`, `VoterRecord`, exports, `MANUAL_INFORMATION_REQUESTS` data section

---

## Part XIII: Admin + system administration — `chapters/16`, `19`

- *Subchapters:* **system** **administration** (workbench, env, no secrets in chat)

---

## Part XIV: Technical architecture — `chapters/17`

- Next.js, Prisma, APIs (internal), **no** public adversarial API map  
- *Subchapters:* **author**-studio as **operator** tool only; **RAG** boundaries

---

## Part XV: Production + deployment — `chapters/18` + addendum

- *Subchapters:* **Netlify** / **GitHub**; `netlify.toml`; **DATABASE_URL** at build; `docs/NETLIFY_FIRST_DEPLOY.md`  
- **Manual** **maintenance** (this repo’s `campaign-system-manual/`) and Pass cadence

---

## Part XVI: Future roadmap — `chapters/19`

- Packets, P5, MCE/NDE, OIS v2, member auth

---

## Part XVII: Campaign Companion — `chapters/20`

- **Guided** **system** (public name); human approvals; `WorkflowIntake` and **not** a single chat product today  
- *Subchapters:* task queue, learning boundaries, one-person start

---

## Part XVIII: Adaptive strategy — `chapters/21`

- **Current** vs **future** adaptation; what **must** stay human (paid/compliance/contrast)  
- *Subchapters:* KPIs that **suggest** strategy changes to **CM**

---

## Part XIX: Election week / Election Day / closeout — `chapters/22`

- **GOTV** **command**; **Election** **Day** **command**; EV window  
- *Subchapters:* **visibility**, incidents, comms, **post-election** data preservation, **rollups**

---

## Part XX: Pathway campaign — `chapters/23`

- Pathways, sideways movement, work split, **Power** of **5** + **Workbench**  
- *Subchapters:* training to mastery; public vs operator truth

---

## **Lifecycle and workflows** (book sections map to `workflows/`)

- **Day One to Election** — `workflows/DAY_ONE_TO_ELECTION_DAY_CAMPAIGN_LIFECYCLE.md` (phases 0–17)  
- **Pass 3 strategy tome (complete)** — `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (phases 0–17 in prose, **$250K** base / **$500K** stretch, **Part** **B** Pass **3B: **fundraising** **flywheel,** **5K** **active** **stretch,** **road** **/ **travel,** **county** **ladder,** **no**-**hired**-**staff,** **redundancy) **- **Pass** **3B** **acceleration** **—** `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` **(standalone) **+ **`MANUAL_PASS_3B_COMPLETION_REPORT.md` **- **Pass 3 simulation plan (complete + Pass 3B)** — `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (forecasts, scenarios, readiness — *future* build, no code)  
- **First email → volunteer**  
- P5, county leader, CM, **candidate (gap analysis)**  
- **Message** to **distribution**  
- **Field** reporting → dashboards  
- **Task** and **approvals**  
- **Sign** + **visibility**  
- **Pass 3C (complete) —** `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` (APA vendor channel, paid ramp, governance, 2026 infrastructure / 2028–2030 doctrine) + `MANUAL_PASS_3C_COMPLETION_REPORT.md`  
- **Pass 3D (complete) —** `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md` + `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` + `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` Part D + `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` §13 + `MANUAL_PASS_3D_COMPLETION_REPORT.md`  
- **Pass 3E (complete) —** `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md` + `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md` + `FOCUS_CATEGORY_ORGANIZING_PLAN.md` + `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` + `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` Part E + `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` §14 + `MANUAL_PASS_3E_COMPLETION_REPORT.md`  
- **Pass 3F (complete) —** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` + `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` + `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` Part F + `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` §22 + `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` §15 + `MANUAL_PASS_3F_COMPLETION_REPORT.md`  
- **Pass 3G (complete) —** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **Part** **G** + `MANUAL_PASS_3G_COMPLETION_REPORT.md` + the ten 3G standalone manuals in `MANUAL_PASS_3G_COMPLETION_REPORT.md` **table** (immersion, contact list, call time, faith/chamber, listening tour, visibility, ambassador **proposed,** training, path-to-win data, GCal) + `WEEKLY_TRAVEL` §**23,** `SIMULATION` §**24,** `PAID_MEDIA` §**16,** `PRECINCT` Pass 3G addenda, `MANUAL_INFORMATION_REQUESTS` §**26**–**35**  
- **Pass 3H (complete) —** `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md` + `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **Part** **H** + `FUNDRAISING_...` Pass 3H addendum + `SIMULATION_...` §**25** + `WEEKLY_TRAVEL_...` §**24** + `MANUAL_INFORMATION_REQUESTS` §**36** + `MANUAL_PASS_3H_COMPLETION_REPORT.md`  
- **Pass 4 (complete) —** `playbooks/`, 41 `playbooks/roles/*.md`, `MANUAL_PASS_4_COMPLETION_REPORT.md`  
- **Pass 4B (complete) —** `INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md` + `SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md` + `IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md` + `CANDIDATE_AND_CAMPAIGN_MANAGER_STRATEGY_DASHBOARD_REQUIREMENTS.md` + `CAMPAIGN_STRATEGY_...` Part **J** + `SIMULATION_...` **§**26 + `MANUAL_INFORMATION_REQUESTS` **§**38 + `MANUAL_PASS_4B_COMPLETION_REPORT.md` (design only; not shipped app)  
- **Pass 5 (complete) —** `WORKBENCH_OPERATOR_RUNBOOK.md` + `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` + `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md` + `CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md` + `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md` + `MANUAL_PASS_5_COMPLETION_REPORT.md` + `MANUAL_INFORMATION_REQUESTS` **§**39 (SOP; not new `workflows/*` code)

## **Message Engine / Workbench operations** (Pass 5 runbooks; future Pass 5B chapter depth)

- **Workbench** — `WORKBENCH_OPERATOR_RUNBOOK.md` (daily/weekly SOP)  
- **Strategy → task** — `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` (4B **Preview/Propose/Lock** to `WorkflowIntake` / `CampaignTask`)  
- **CM** — `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md`  
- **Candidate** — `CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md`  
- **Segmented** **messaging** — `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md`  
- **MCE/NDE** chapter depth (**Pass 5B** TBD): `RedDirt/docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md` and `RedDirt/docs/NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md` (see `MANUAL_BUILD_PLAN.md`)

---

## **Appendix**

- A — Glossary (public / internal)  
- B — `inventories/ROUTE_INVENTORY`  
- C — `inventories/DATA_MODEL_INVENTORY`  
- D — `SYSTEM_CROSS_WIRING_REPORT`  
- E — `MANUAL_INFORMATION_REQUESTS_FOR_STEVE`  
- F — `WORKFLOW_INDEX`  
- G — `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL` (Pass 3 + 3B + 3C + 3D + 3E + 3F + **3G** Part G + **3H** Part H)  
- H — `SIMULATION_AND_FORECASTING_SYSTEM_PLAN` (Pass 3 + 3B + 3C + 3D + 3E + 3F + **3G** §24 + **3H** §25)  
- I — `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN` (Pass 3B + 3D + 3E + 3F + **3H** addendum)  
- J — `MANUAL_PASS_3B_COMPLETION_REPORT` (Pass 3B)  
- K — `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN` (Pass 3C + 3D §13 + 3E §14 + 3F §15)  
- L — `MANUAL_PASS_3C_COMPLETION_REPORT` (Pass 3C)  
- M — `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM` (Pass 3D + 3E)  
- N — `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN` (Pass 3D + 3E + 3F)  
- O — `MANUAL_PASS_3D_COMPLETION_REPORT` (Pass 3D)  
- P — `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN` (Pass 3E)  
- Q — `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN` (Pass 3E)  
- R — `FOCUS_CATEGORY_ORGANIZING_PLAN` (Pass 3E)  
- S — `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM` (Pass 3E + 3F §22 + 3G §**23** + 3H §**24**)
- T — `MANUAL_PASS_3E_COMPLETION_REPORT` (Pass 3E)  
- U — `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN` (Pass 3F)  
- V — `COUNTY_PARTY_MEETING_TOUR_SYSTEM` (Pass 3F)  
- W — `MANUAL_PASS_3F_COMPLETION_REPORT` (Pass 3F)  
- X — Pass 3G pack — `MANUAL_PASS_3G_COMPLETION_REPORT` + `IMMERSION_STOPS_AND_LOCAL_HOST_SYSTEM` + `CONTACT_LIST_INTAKE_AND_RELATIONSHIP_DATABASE_PLAN` + `CALL_TIME_AND_CANDIDATE_FUNDRAISING_EXECUTION_PLAN` + `FAITH_FIRE_CHAMBER_AND_COMMUNITY_EVENT_OUTREACH_PLAN` + `COMMUNITY_ELECTION_INTEGRITY_AND_BALLOT_INITIATIVE_LISTENING_TOUR` + `POSTCARDS_SIGNS_BANNERS_AND_VISIBILITY_FUNDRAISING_PLAN` + `GRASSROOTS_FUNDRAISING_AMBASSADOR_AND_COMMISSION_MODEL` + `TRAINING_AND_TRAINER_CERTIFICATION_SYSTEM` + `POLITICAL_ANALYSIS_AND_PATH_TO_WIN_DATA_MODEL` + `GOOGLE_CALENDAR_AND_EVENT_PIPELINE_OPERATING_SYSTEM` (see report for **Pass 4** role expansion)  
- Y — Pass 3H — `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN` + `MANUAL_PASS_3H_COMPLETION_REPORT` (Prisma `FinancialTransaction` / `BudgetPlan` rules; no fixture dollars in repo seed)

**Last updated:** 2026-04-28 (Pass 3C + 3D + 3E + 3F + **3G** + **3H**)
