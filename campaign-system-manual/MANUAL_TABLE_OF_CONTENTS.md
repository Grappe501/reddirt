# Manual — Table of Contents (book-first, 500–1000+ pages)

**Version:** Pass 2B + Pass 3 + Pass 3B + Pass 3C + Pass 3D + **Pass 3E** + **Pass 3F** (2026-04-27). Chapters 20–23 are operating extensions. **Pass 3B** adds `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` and Part B in `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`. **Pass 3C** adds `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md`, Part C, `MANUAL_PASS_3C_COMPLETION_REPORT.md`, and updates the simulation plan and `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §18. **Pass 3D** adds `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md`, `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`, Part D, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` §21, and `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §19–20. **Pass 3E** adds Part E in the strategy manual, `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md`, `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md`, `FOCUS_CATEGORY_ORGANIZING_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` §22, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §21–24, and `MANUAL_PASS_3E_COMPLETION_REPORT.md` (no invented campus/NAACP facts; **NAACP branch mapping required** when unverified). **Pass 3F** adds Part F, `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` §22, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` §23, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §25, and `MANUAL_PASS_3F_COMPLETION_REPORT.md` (no invented meeting dates or chairs; **county party meeting mapping required** when unverified). **Vocabulary** in public copy: **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — not “AI” as a product name.

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

## Part IV: Role manuals — `chapters/04` + `roles/*`

- Framework + **Pathway**  
- *Per-role* full chapters in future print volumes; **index:** `ROLE_MANUAL_INDEX.md` (Pass 2B, **26** catalog roles) **+** **Pass 4** depth order **(27,** `MANUAL_PASS_3F_COMPLETION_REPORT.md`)  
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
- *Pass 4 (recommended next):* role playbooks, training, manual/dashboard attachment — `MANUAL_PASS_3F_COMPLETION_REPORT.md` (**27**-role order = **23** + **four** 3F depth roles; see that report)

---

## **Appendix**

- A — Glossary (public / internal)  
- B — `inventories/ROUTE_INVENTORY`  
- C — `inventories/DATA_MODEL_INVENTORY`  
- D — `SYSTEM_CROSS_WIRING_REPORT`  
- E — `MANUAL_INFORMATION_REQUESTS_FOR_STEVE`  
- F — `WORKFLOW_INDEX`  
- G — `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL` (Pass 3 + 3B + 3C + 3D + 3E + 3F)  
- H — `SIMULATION_AND_FORECASTING_SYSTEM_PLAN` (Pass 3 + 3B + 3C + 3D + 3E + 3F)  
- I — `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN` (Pass 3B + 3D + 3E + 3F)  
- J — `MANUAL_PASS_3B_COMPLETION_REPORT` (Pass 3B)  
- K — `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN` (Pass 3C + 3D §13 + 3E §14 + 3F §15)  
- L — `MANUAL_PASS_3C_COMPLETION_REPORT` (Pass 3C)  
- M — `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM` (Pass 3D + 3E)  
- N — `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN` (Pass 3D + 3E + 3F)  
- O — `MANUAL_PASS_3D_COMPLETION_REPORT` (Pass 3D)  
- P — `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN` (Pass 3E)  
- Q — `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN` (Pass 3E)  
- R — `FOCUS_CATEGORY_ORGANIZING_PLAN` (Pass 3E)  
- S — `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM` (Pass 3E + 3F §22)  
- T — `MANUAL_PASS_3E_COMPLETION_REPORT` (Pass 3E)  
- U — `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN` (Pass 3F)  
- V — `COUNTY_PARTY_MEETING_TOUR_SYSTEM` (Pass 3F)  
- W — `MANUAL_PASS_3F_COMPLETION_REPORT` (Pass 3F)

**Last updated:** 2026-04-27 (Pass 3C + 3D + 3E + 3F)
