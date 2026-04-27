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

## Pass 3G (complete): Immersion, contact lists, call time, institutional outreach, listening tour, visibility fundraising, training, path-to-win data, calendar pipeline

**Script name:** *Manual Pass 3G — Immersion Stops, Contact Intake, Call Time, Faith/Fire/Chamber, Listening Tour, Visibility Fundraising, Grassroots Ambassador Model, Training, Political Analysis, Google Calendar Pipeline*  

- **Delivered:** `IMMERSION_STOPS_AND_LOCAL_HOST_SYSTEM.md`, `CONTACT_LIST_INTAKE_AND_RELATIONSHIP_DATABASE_PLAN.md`, `CALL_TIME_AND_CANDIDATE_FUNDRAISING_EXECUTION_PLAN.md`, `FAITH_FIRE_CHAMBER_AND_COMMUNITY_EVENT_OUTREACH_PLAN.md`, `COMMUNITY_ELECTION_INTEGRITY_AND_BALLOT_INITIATIVE_LISTENING_TOUR.md`, `POSTCARDS_SIGNS_BANNERS_AND_VISIBILITY_FUNDRAISING_PLAN.md`, `GRASSROOTS_FUNDRAISING_AMBASSADOR_AND_COMMISSION_MODEL.md` (proposed only — legal banner in file), `TRAINING_AND_TRAINER_CERTIFICATION_SYSTEM.md`, `POLITICAL_ANALYSIS_AND_PATH_TO_WIN_DATA_MODEL.md`, `GOOGLE_CALENDAR_AND_EVENT_PIPELINE_OPERATING_SYSTEM.md`  
- **Updated:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Part G), `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`, `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`, `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md`, `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`, `FOCUS_CATEGORY_ORGANIZING_PLAN.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§**26**–**35**), indexes, this build plan, `SYSTEM_READINESS_REPORT.md`  
- **Report:** `MANUAL_PASS_3G_COMPLETION_REPORT.md`  
- **No** application code, **no** DB/auth/migrations/deps; **no** real PII samples; **no** unsourced opponent claims; commission / ambassador model **uncounseled** until treasurer + counsel

## Pass 3H (complete): Financial baseline, burn rate, fundraising progression, budget-to-field calibration (evidence rules)

**Script name:** *Manual Pass 3H — Financial Baseline, Burn-Rate, Fundraising Progression, and Budget-to-Field Calibration*  

- **Delivered:** `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md` (22 sections: executive summary, ledger rules, spend categories, burn, COH, field/paid/travel/visibility/ask links, budget scenarios, weekly rhythm, dashboard spec, simulation inputs, gaps, Steve list — **no** **invented** **dollar** **totals;** **repo** **inspection** found **no** `FinancialTransaction` **amounts** in `prisma/seed.ts`)  
- **Updated:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (**Part** **H**), `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` (Pass 3H addendum), `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (§**25**), `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` (§**24**), `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§**36** + footer), indexes, `SYSTEM_READINESS_REPORT.md`  
- **Read for evidence (paths only, no app edits):** `prisma/schema.prisma` (`FinancialTransaction`, `BudgetPlan`); `src/lib/campaign-engine/budget-queries.ts`, `budget.ts`, `src/lib/campaign-engine/truth-snapshot.ts` (ledger status); `prisma/seed.ts` (no financial seed rows)  
- **Report:** `MANUAL_PASS_3H_COMPLETION_REPORT.md`  
- **No** application code, **no** DB/migrations; **no** public finance claims from raw `FinancialTransaction` without treasurer/counsel

## Pass 4 (complete, markdown): Role playbooks, training index, dashboard rules, authority / escalation

**Script name:** *Manual Pass 4 — Role Playbooks, Training Modules, and Dashboard Attachment*  

- **Delivered:** `playbooks/README.md` and index/authority docs (`ROLE_PLAYBOOK_INDEX`, `DASHBOARD_ATTACHMENT_RULES`, `TRAINING_MODULE_INDEX`, `TASK_TEMPLATE_INDEX`, `ROLE_KPI_INDEX`, `APPROVAL_AUTHORITY_MATRIX`, `ESCALATION_PATHS`, `PROMOTION_AND_SIDEWAYS_PATHWAYS`, `ROLE_READINESS_MATRIX`); **41** × `playbooks/roles/*.md` (25 sections each, Pass 4 book-style; generator `playbooks/_gen_role_playbooks.py` optional)  
- **Updated:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **Part I**; `TRAINING_AND_TRAINER_CERTIFICATION_SYSTEM.md` (Pass 4 pointer); `MANUAL_TABLE_OF_CONTENTS.md`, `WORKFLOW_INDEX.md`, `SYSTEM_READINESS_REPORT.md` (headers / cross-refs), `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**37; `roles/*/**/README.md` where 1:1 match to a playbook filename (link only)  
- **Report:** `MANUAL_PASS_4_COMPLETION_REPORT.md`  
- **Not in Pass 4:** app code, Prisma, secrets, or workflow redrafts (Pass 5+)

## Pass 4B (complete, markdown): Interactive strategy Workbench, scenario sliders, segmentation, iPad/desktop UX

**Script name:** *Manual Pass 4B — Interactive Strategy Workbench, Scenario Sliders, Segmented Targeting, KPI Impact Modeling, and iPad-First Dashboard Design*  

- **Delivered:** `INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md` (18 slider rows + SOPs), `SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md`, `IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md`, `CANDIDATE_AND_CAMPAIGN_MANAGER_STRATEGY_DASHBOARD_REQUIREMENTS.md`  
- **Updated:** `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (§**26**), `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Part J), `playbooks/DASHBOARD_ATTACHMENT_RULES.md`, `playbooks/APPROVAL_AUTHORITY_MATRIX.md`, `playbooks/ROLE_KPI_INDEX.md`, `playbooks/README.md`, `MANUAL_TABLE_OF_CONTENTS.md`, `WORKFLOW_INDEX.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§**38**)  
- **Report:** `MANUAL_PASS_4B_COMPLETION_REPORT.md`  
- **Not in 4B:** app code, DB, auth, migrations, dependencies, secrets, commits; **no** new voter **segments** or “app **ready**” **claims** **without** `SYSTEM_READINESS_REPORT.md`

## Pass 5 (complete, markdown): Workbench operator runbooks, strategy-to-task, CM/candidate SOP, segmented distribution

**Script name:** *Manual Pass 5 — Workflow SOPs, Workbench Runbooks, and Strategy-to-Task Automation*  

- **Delivered:** `WORKBENCH_OPERATOR_RUNBOOK.md`, `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md`, `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md`, `CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md`, `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md`  
- **Updated:** `MANUAL_TABLE_OF_CONTENTS.md`, `WORKFLOW_INDEX.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§**39**), `MANUAL_BUILD_PLAN.md` (this file)  
- **Report:** `MANUAL_PASS_5_COMPLETION_REPORT.md`  
- **Not in Pass 5:** app code, Prisma, or new workflow routes; **not** a claim that 4B slider UI or iPad-hardening is complete for all admin flows

## Pass 5C (complete, markdown): Progressive onboarding, unlocks, and guided Workbench UX doctrine

**Script name:** *Manual Pass 5C / UX Doctrine — Progressive Onboarding, Unlocks, and Guided Workbench*

- **Delivered:** `PROGRESSIVE_ONBOARDING_AND_UNLOCK_SYSTEM.md`, `ROLE_BASED_UNLOCK_LADDERS.md`, `GUIDED_REPORT_BUILDER_AND_ASSISTED_QUERY_SYSTEM.md`, `USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md`, `WORKBENCH_LEARNING_GAMEPLAY_MODEL.md`, `MANUAL_PASS_5C_COMPLETION_REPORT.md`
- **Updated:** `MANUAL_TABLE_OF_CONTENTS.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§40), `playbooks/DASHBOARD_ATTACHMENT_RULES.md`, `playbooks/ROLE_KPI_INDEX.md`, this `MANUAL_BUILD_PLAN.md`
- **Not in Pass 5C:** app code; no change to 0–6 system grades without code proof; no public “AI” product name; no automatic unlock of voter export, row-level data, $ confirm, public comms, or targeting/GOTV levers
- **Recommended next engineering packet (owner approval):** Progressive Onboarding + Guided Workbench UX (readiness gating, canned reports, Campaign Companion “what’s next?”, training/demo mode) — *or* manual **Pass 5B** (MCE/NDE) or **Pass 6** (OIS) per below

## Pass 5D (complete, markdown): Election confidence, transparency, website motion, public FAQ doctrine

**Script name:** *Manual Pass 5D — Election Confidence, Transparency, Website Motion, and Public FAQ Doctrine*

- **Delivered:** `ELECTION_CONFIDENCE_TRANSPARENCY_AND_GET_UNDER_THE_HOOD_DOCTRINE.md`, `KELLY_PUBLIC_TRUST_TALKING_POINTS_AND_FAQ.md`, `WEBSITE_CLEANUP_MOTION_AND_LIVE_PLATFORM_PLAN.md`, `CAMPAIGN_COMPANION_ELECTION_QUESTIONS_POLICY.md`, `MANUAL_PASS_5D_COMPLETION_REPORT.md`
- **Updated:** `MANUAL_TABLE_OF_CONTENTS.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§41), `WORKFLOW_INDEX.md`, `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md`, this `MANUAL_BUILD_PLAN.md`
- **Not in Pass 5D:** app code; no uncounseled legal claims; no overclaim “no fraud ever”; EPI and SBEC language must be verified from **primary** sources at publish; election-security copy is one bounded slice of the public story, not the whole site
- **Recommended next (owner):** MCE/NDE publish path for vetted FAQ + SOS page; **or** **Pass 5B** (MCE/NDE manual) **or** **Pass 6** (OIS)

## Pass 5E (complete, markdown): Campaign Companion Layer A/B orchestration and mode doctrine

**Script name:** *Manual Pass 5E — Campaign Companion “omniscient agent” architecture (internal orchestration only)*

- **Delivered:** `CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md`, `MANUAL_PASS_5E_COMPLETION_REPORT.md`
- **Updated:** `MANUAL_TABLE_OF_CONTENTS.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§42), `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md` (§20), `WORKFLOW_INDEX.md`, this `MANUAL_BUILD_PLAN.md`
- **Not in Pass 5E:** app code; no public “AI” product name; “omniscient” = internal broad read-context for routing, not a user-facing total-knowledge or voter-file claim; no LQA or approval bypass; no claim that full Layer A/B, mode switching, or live “everywhere” wiring is shipped for all surfaces
- **Recommended next (owner):** Companion build within LQA + MI §42 decisions; **or** **Pass 5B** (MCE/NDE) **or** **Pass 6** (OIS)

## Pass 5F (complete, markdown): Live intelligence, Ask Kelly voice, continuous learning, and voice/IVR doctrine

**Script name:** *Manual Pass 5F — Campaign Companion / Ask Kelly live intelligence, candidate voice, refinement bank, and spoken-agent plan (design only)*

- **Delivered:** `CAMPAIGN_COMPANION_LIVE_INTELLIGENCE_AND_COMMAND_INTERFACE.md`, `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md`, `CANDIDATE_REFINEMENT_INTAKE_AND_QUESTION_BANK.md`, `CONTINUOUS_CAMPAIGN_KNOWLEDGE_INGESTION_AND_REFINEMENT_ENGINE.md`, `ASK_KELLY_VOICE_INTERFACE_AND_SPOKEN_AGENT_PLAN.md`, `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md`, `MANUAL_PASS_5F_COMPLETION_REPORT.md`
- **Updated:** `MANUAL_TABLE_OF_CONTENTS.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§43), `WORKFLOW_INDEX.md`, `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md`, `CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md`, `CAMPAIGN_COMPANION_ELECTION_QUESTIONS_POLICY.md`, this `MANUAL_BUILD_PLAN.md`
- **Not in Pass 5F:** app code; no live omniscient product claim; no fabricated Kelly positions; no voter/PII/donor detail in public surfaces; no automated approval, send, or LQA/approval-matrix bypass; no synthetic “Kelly” voice without MI §43 consent; no 0–6 grade lift without product proof
- **Recommended next (engineering, owner):** **Campaign** **Companion** **/ **Ask** **Kelly** **knowledge** **ingestion** (sanitized) **+** **role**-**aware** **answer** **service** **within** **RACI** **and** **LQA** **—** *or* **manual** **Pass** **5B** (MCE/NDE) **/ **Pass** **6** (OIS) per prior tracks

## Pass 5G (complete, markdown): Website review wizard, admin update packets, edit impact, progressive interview, editing rights, Arkansas history KB roadmap

**Script name:** *Manual Pass 5G — Candidate review wizard, admin approval packet, website edit impact, and Arkansas history knowledge base roadmap (design only)*

- **Delivered:** `CANDIDATE_WEBSITE_REVIEW_WIZARD_AND_APPROVAL_WORKFLOW.md`, `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md`, `WEBSITE_EDIT_IMPACT_ANALYSIS_AND_DOWNSTREAM_DEPENDENCY_RULES.md`, `CANDIDATE_PROGRESSIVE_INTERVIEW_AND_SITE_WALKTHROUGH_PLAN.md`, `ARKANSAS_HISTORY_CIVICS_AND_POLITICAL_CULTURE_KNOWLEDGE_BASE_ROADMAP.md`, `CANDIDATE_EDITING_RIGHTS_AND_NO_APPROVAL_EXCEPTIONS_POLICY.md`, `MANUAL_PASS_5G_COMPLETION_REPORT.md`
- **Updated:** `MANUAL_TABLE_OF_CONTENTS.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§44), `WORKFLOW_INDEX.md`, `CAMPAIGN_COMPANION_LIVE_INTELLIGENCE_AND_COMMAND_INTERFACE.md`, `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md`, `CONTINUOUS_CAMPAIGN_KNOWLEDGE_INGESTION_AND_REFINEMENT_ENGINE.md`, `CANDIDATE_REFINEMENT_INTAKE_AND_QUESTION_BANK.md`, `WEBSITE_CLEANUP_MOTION_AND_LIVE_PLATFORM_PLAN.md`, `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md`, this `MANUAL_BUILD_PLAN.md`
- **Not in Pass 5G:** app code; no shipped wizard or packet queue; no auto-publish on high-impact lines; no PII, voter rows, or donor data in examples; A–D knowledge states and `APPROVAL_AUTHORITY_MATRIX` still govern public use; Arkansas history KB is post-launch, not a database in repo; no 0–6 grade lift without product proof
- **Superseded for sequencing by Pass 5H (manual complete):** launch onboarding + suggestion box doctrine — see `ASK_KELLY_LAUNCH_PRIORITY_AND_FIRST_RELEASE_SCOPE.md` and `MANUAL_PASS_5H_COMPLETION_REPORT.md`

## Pass 5H (complete, markdown): Ask Kelly launch onboarding, candidate/beta comms, suggestion box, explain-why, production-grade readiness

**Script name:** *Manual Pass 5H — Ask Kelly first release scope, email templates, beta invite, suggestion box, explain-why guide, and production-grade checklist (design and doctrine only)*

- **Delivered:** `ASK_KELLY_LAUNCH_PRIORITY_AND_FIRST_RELEASE_SCOPE.md`, `CANDIDATE_WEBSITE_EDITING_ONBOARDING_EMAIL.md`, `BETA_VOLUNTEER_ONBOARDING_INVITE_AND_ROLE_EXPLAINER.md`, `ASK_KELLY_SUGGESTION_BOX_AND_FEEDBACK_INTAKE_RULES.md`, `ASK_KELLY_EXPLAIN_WHY_GUIDE.md`, `ASK_KELLY_PRODUCTION_GRADE_AGENT_FOUNDATION_CHECKLIST.md`, `ASK_KELLY_BETA_FEEDBACK_TO_APPROVAL_FEED_WORKFLOW.md`, `MANUAL_PASS_5H_COMPLETION_REPORT.md`
- **Updated:** `MANUAL_TABLE_OF_CONTENTS.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§45), `WORKFLOW_INDEX.md`, `CANDIDATE_WEBSITE_REVIEW_WIZARD_AND_APPROVAL_WORKFLOW.md`, `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md`, `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md`, `USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md`, `WEBSITE_CLEANUP_MOTION_AND_LIVE_PLATFORM_PLAN.md`, `CONTINUOUS_CAMPAIGN_KNOWLEDGE_INGESTION_AND_REFINEMENT_ENGINE.md`, `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md`, `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md` (§22), this `MANUAL_BUILD_PLAN.md`
- **Not in Pass 5H:** app code, Prisma, auth, new routes, shipped emails, Netlify deploy configuration in repo; no claim that production-grade Ask Kelly, suggestion queue, or approval feed exists in product; no PII in templates; no public “AI” product naming; A–D + `APPROVAL_AUTHORITY_MATRIX` + LQA still govern; no 0–6 grade lift; beta access only with MCE+owner per MI §45
- **Superseded in sequencing note by Pass 5I (manual):** `MANUAL_PROJECT_STATUS_AND_REMAINING_WORK_REPORT.md` and `MANUAL_PASS_5I_COMPLETION_REPORT.md` keep **5H** first; **5I** adds **briefs** + **objectives** + **thanks** doctrine **in** **parallel** to **ending** the **manual** **phase,** not **a** **reorder** of **5H** **engineering** **. **

## Pass 5I (complete, markdown): Project status, Workbench morning briefs, objectives, thank-you workflow

**Script name:** *Manual Pass 5I — project status, daily morning brief doctrine, dashboard objective and get-involved cards, template library, thank-you/appreciation SOP (design only)*

- **Delivered:** `MANUAL_PROJECT_STATUS_AND_REMAINING_WORK_REPORT.md`, `WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM.md`, `DASHBOARD_OBJECTIVE_AND_GET_INVOLVED_CARD_SYSTEM.md`, `THANK_YOU_CARD_AND_APPRECIATION_WORKFLOW.md`, `WORKBENCH_DAILY_BRIEF_TEMPLATE_LIBRARY.md`, `MANUAL_PASS_5I_COMPLETION_REPORT.md`
- **Updated:** `MANUAL_TABLE_OF_CONTENTS.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§46), `WORKFLOW_INDEX.md`, `WORKBENCH_OPERATOR_RUNBOOK.md`, `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md`, `CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md`, `USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md`, `ASK_KELLY_LAUNCH_PRIORITY_AND_FIRST_RELEASE_SCOPE.md`, `CONTINUOUS_CAMPAIGN_KNOWLEDGE_INGESTION_AND_REFINEMENT_ENGINE.md`, `ASK_KELLY_PRODUCTION_GRADE_AGENT_FOUNDATION_CHECKLIST.md`, this `MANUAL_BUILD_PLAN.md`
- **Not in Pass 5I:** app code, shipped Workbench morning brief, dashboard cards, or thank-you queue; no 0**–**6 grade lift; no voter/donor rows in doc examples; no public “**AI**” naming; 5H Ask Kelly launch path still first engineering sequence before unrelated major work
- **Recommended next (engineering, owner):** (1) **Ask** **Kelly** **/ ** **candidate** **website** **review** + **suggestion** **/ ** **beta** path **(5H** **) **. **(2) ** **Workbench** **morning** **brief** + **objective** **/ ** **get** **involved** **card** **surfaces** **(5I** **) **. **(3) ** **Thank**-**you** / **appreciation** **task** / **`CampaignTask` **+ **RACI** **(5I** **+ ** **MI** **§**46** **) **. ** *Then* MCE/NDE depth, OIS/brief **wiring,** P5, VFR, **or** **manual** **Pass** **5B** / **6** as **separate** **tracks** **(see** `MANUAL_BUILD_PLAN` **/ **`MANUAL_PROJECT_STATUS_...` **). **

## Pass 5B (markdown, next manual track option): Message Engine + Narrative Distribution depth

- Expand manual chapters 08–09 from `RedDirt/docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md` and `RedDirt/docs/NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md`; align vocabulary with `RedDirt/docs/MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md`  
- **Or** (owner choice): **Pass 5C** engineering packet (above) — **or** **Pass 6** (county / OIS productization) — **or** P5 **engineering** build tickets (outside this manual lane)

(Older optional track: *workflow second drafts* with redacted screenshot placeholders and Prisma map — can merge with **Pass 5B** or run as 5b.)

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
