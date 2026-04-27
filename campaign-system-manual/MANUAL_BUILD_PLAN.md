# Manual — Build Plan

**Goal:** Grow this folder into a **500–1000 page** owner’s manual for the full Campaign Operating System, **book-first**, then a **polished web presentation** (see `web-presentation/`).

## Pass 1 (complete): Scaffold

- Root indices, `chapters/`, `roles/`, `maps/`, `inventories/`, `workflows/`, `web-presentation/`  
- `SYSTEM_READINESS_REPORT.md` from repository audit (no app code changes)  
- Mermaid maps at `SYSTEM_MAP_INDEX.md` and `maps/`  
- Stubs for all workflows and role READMEs

## Pass 2 (complete): Deep system audit + manual expansion (2A + 2B)

- **2A —** `SYSTEM_CROSS_WIRING_REPORT.md`; updated `inventories/ROUTE_INVENTORY|COMPONENT|DATA_MODEL|UNUSED_STUBS`, `workflows/TASK_QUEUE_AND_APPROVALS.md`, `workflows/DAY_ONE_TO_ELECTION_DAY_CAMPAIGN_LIFECYCLE.md`, `PRECINCT_SIGN_HOLDER...`, `CANDIDATE_AND_CAMPAIGN_MANAGER_INTAKE_GAP_ANALYSIS.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md`, regraded `SYSTEM_READINESS_REPORT.md`  
- **2B —** expanded `MANUAL_TABLE_OF_CONTENTS.md`, `ROLE_MANUAL_INDEX.md` (26 roles), `roles/**/README.md` (23-section template), `chapters/20`–`23`, `web-presentation/WEB_MANUAL_*`, `MANUAL_PASS_2_COMPLETION_REPORT.md`, `WORKFLOW_INDEX.md`  
- **Not done in Pass 2:** runtime E2E of every page; `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Pass 3)

## Pass 3 (complete): Campaign strategy, lifecycle baseline, simulation readiness

**Script name:** *Manual Pass 3 — Campaign Strategy, Lifecycle, Baseline, and Simulation Readiness*  

- **Delivered:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (major chapter: executive reality, baseline as of 2026-04-27, fundraising trajectory in ranges, one-person launch, candidate onboarding *design*, organic growth, volunteer activation, P5, Workbench rhythm, KPI control, adaptive strategy, simulation layer plan, phases 0–17 prose, fundraising/field/comms/sign/GOTV/ED, dashboards by phase, manual-to-profile, build priorities, risks, Steve decision list)  
- **Delivered:** `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (future forecast/scenario/readiness system — no code)  
- **Report:** `MANUAL_PASS_3_COMPLETION_REPORT.md`  
- **Dependencies:** `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (still the dependency register; Steve answers re-baseline the strategy doc)

## Pass 3B (complete): Fundraising acceleration, 5,000 active stretch, travel, no-hired-staff

**Script name:** *Manual Pass 3B — Fundraising acceleration, 5,000 active volunteer goal, travel field program, and no-hired-staff growth model*  

- **Delivered:** `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` (standalone chapter: $250K base / $500K stretch, pacing, flywheel, travel ROI + Prisma note, vol scenarios, county ladder 0–9, no-hired-staff, redundancy)  
- **Updated:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (§2–3, §7, **Part** **B,** §22–23), `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (Pass 3B inputs + §19)  
- **Report:** `MANUAL_PASS_3B_COMPLETION_REPORT.md`  
- **No** application code, **no** Prisma or migration changes in this pass

## Pass 3C (complete): Paid media ramp, Arkansas Press Association vendor channel, 2028/2030 infrastructure doctrine

**Script name:** *Manual Pass 3C — Paid Media Ramp, Arkansas Press Association Vendor Channel, and 2028/2030 Infrastructure Doctrine*  

- **Delivered:** `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` (paid as amplifier, APA vendor design with **price sheet pending**, phased ramp, governance, KPI dashboard spec, Workbench + `/api/forms` flow, long-term north star)  
- **Updated:** `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (§20), `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`, `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (§14, §16, Part C, risks, Steve list), `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§18), indexes, `SYSTEM_READINESS_REPORT.md`  
- **Report:** `MANUAL_PASS_3C_COMPLETION_REPORT.md`  
- **No** application code

## Pass 3D (complete): Endorsement program, national attention, precinct path-to-victory (operational)

**Script name:** *Manual Pass 3D — Endorsement Program, National Attention Strategy, and Precinct Path to Victory (operational doctrine)*  

- **Delivered:** `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md` (lanes, pipeline, Workbench metadata, **no** real endorsers in repo)  
- **Delivered:** `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` (county-first, turf/canvass/privacy, **flag** when strategic counties lack precinct data: *Precinct data acquisition required before full path-to-victory modeling*)  
- **Updated:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Part D, risks, §16, §23), `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (§21), `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` (Pass 3D addendum), `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` (§13), `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§19–20), indexes, `SYSTEM_READINESS_REPORT.md`  
- **Report:** `MANUAL_PASS_3D_COMPLETION_REPORT.md`  
- **No** application code, **no** DB/auth/migrations/deps

## Pass 3E (complete): Youth/campus, NAACP relationships, EHC & focus categories, weekly travel projection

**Script name:** *Manual Pass 3E — Youth, Campus, NAACP, Extension Homemakers, Focus Categories, and Weekly Travel Projection System*  

- **Delivered:** `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md` (ladder, coverage table, no invented “active” campuses)  
- **Delivered:** `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md` (map-first; **NAACP branch mapping required** if unverified)  
- **Delivered:** `FOCUS_CATEGORY_ORGANIZING_PLAN.md` (EHC **3,200+** / **320+** bracket; category maps)  
- **Delivered:** `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` (inputs, **priority** **scores,** templates; repo `CampaignEvent` / `campaignVisits` / `FinancialTransaction` / festival ingest)  
- **Updated:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Part E), `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`, `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` (§14), `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md` (§22), `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` (§22), `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (§22), `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§21–24), indexes, `SYSTEM_READINESS_REPORT.md`  
- **Report:** `MANUAL_PASS_3E_COMPLETION_REPORT.md`  
- **No** application code, **no** DB/auth/migrations/deps

## Pass 3F (complete): County party + rural Arkansas + 75-county meeting tour (operational manuals)

**Script name:** *Manual Pass 3F — County Party Integration, Rural Arkansas Priority, and County Party Meeting Tour System*  

- **Delivered:** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` (doctrine, rural priority, ladder, Workbench/SOP — no `CountyParty` Prisma model)  
- **Delivered:** `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` (75-county mapping sprint, calendar, scores, pairing, 72h follow-up, **§1–20**)  
- **Updated:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Part F), `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` (§22), `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (§23), `FOCUS_CATEGORY_ORGANIZING_PLAN.md`, `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` (§15), `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` (§23), `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§25), indexes, `SYSTEM_READINESS_REPORT.md`  
- **Report:** `MANUAL_PASS_3F_COMPLETION_REPORT.md`  
- **No** application code, **no** DB/auth/migrations/deps; **no** invented meeting dates or chairs; **county party meeting mapping required** when schedules are unverified

## Pass 4 (recommended next): Role playbooks, training, dashboard attachment

**Script name:** *Manual Pass 4 — Role Playbooks, Training Modules, and Dashboard Attachment*  

- Turn priority roles into **deeper** book-style chapters (beyond Pass 2 operational role READMEs)  
- **Training** modules by role; **onboarding** checklists  
- **Dashboard** / **manual** attachment **rules** (first 24h, 7d, 30d **task** templates)  
- **Promotion** / **sideways** **pathway** **logic** (procedural, not app code)  
- **Prepare** the **web** **manual** **presentation** **structure** for **role-based** **navigation** (`web-presentation/WEB_MANUAL_*`)  
- **Pass 3B + 3C + 3D + 3E + 3F — 27-role** priority for Pass 4 depth: **(1–23)** per `MANUAL_PASS_3E_COMPLETION_REPORT.md` **(same** **numbered** **list** **as** **3D** **eighteen** **+** **five** 3E **roles)** **+** **(24)** **county** **party** **relationship** **steward** **—** **(25)** **rural** **organizing** **lead** **—** **(26)** **county** **party** **meeting** **scheduler** **—** **(27)** **surrogate** **/** **volunteer** **presenter** **coordinator** **(titles** **with** **CM** **in** **Pass** **4).** **Canonical** **order:** `MANUAL_PASS_3F_COMPLETION_REPORT.md`.

(Older optional track: *workflow second drafts* with redacted screenshot placeholders and Prisma map — can merge with Pass 4 or run as Pass 4b.)

## Pass 5: Message Engine + Narrative Distribution

- Chapters 08–09 expanded from `docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md` and `docs/NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md`  
- Align vocabulary with `docs/MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md`

## Pass 6: County / OIS productization

- When city/precinct keys exist, update `11-county-city-precinct-system` and `maps/DASHBOARD_MAP.md`  
- Re-run readiness levels

## Pass 7: Print / PDF export (optional)

- Single-source from Markdown; page breaks by part; add glossary appendix

## Pass 8: Web manual (separate build)

- Implement `web-presentation/WEB_MANUAL_*` in a **future** app slice or static site (not in Pass 1)  
- Book structure remains canonical; web adds search and role filters

## Dependencies

- **None** for Markdown-only passes.  
- Web presentation may add tooling later **outside** the “no new dependencies” rule for the Pass 1 slice (owner decision).

## Review cadence

- After each major feature packet (OIS, P5, MCE/NDE), update readiness + inventories.  
- Align with `npm run check` and deployment docs before claiming production-ready language in the manual.
