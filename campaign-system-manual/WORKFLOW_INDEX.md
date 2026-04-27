# Workflow — index (Pass 2B; Pass 3 cross-links)

| # | File | Description |
|---|------|-------------|
| 1 | `workflows/FIRST_EMAIL_TO_ACTIVE_VOLUNTEER.md` | First touch → first action |
| 2 | `workflows/POWER_OF_5_ONBOARDING.md` | P5 public path |
| 3 | `workflows/VOLUNTEER_TO_LEADER_PATHWAY.md` | Pathway progression |
| 4 | `workflows/COUNTY_LEADER_ONBOARDING.md` | County point person |
| 5 | `workflows/CANDIDATE_ONBOARDING.md` | Candidate (system use) |
| 6 | `workflows/CAMPAIGN_MANAGER_ONBOARDING.md` | CM on Workbench |
| 7 | `workflows/TASK_QUEUE_AND_APPROVALS.md` | **Pass 2A** `WorkflowIntake` spine and file map |
| 8 | `workflows/MESSAGE_CREATION_TO_DISTRIBUTION.md` | MCE + NDE + sends |
| 9 | `workflows/FIELD_REPORTING_TO_DASHBOARD_ROLLUP.md` | Field → OIS |
| **10** | `workflows/DAY_ONE_TO_ELECTION_DAY_CAMPAIGN_LIFECYCLE.md` | **Pass 2A/B** Phases 0–17 + repo support |
| **11** | `workflows/PRECINCT_SIGN_HOLDER_AND_VISIBILITY_PROGRAM.md` | **Pass 2A/B** program design (no P5 `Sign` model) |
| **12** | `workflows/CANDIDATE_AND_CAMPAIGN_MANAGER_INTAKE_GAP_ANALYSIS.md` | **Pass 2A** gap list for future intake build |

**Intake anchor:** `POST /api/forms` → `src/lib/forms/handlers.ts` → `WorkflowIntake` (see `SYSTEM_CROSS_WIRING_REPORT.md`).

**Pass 3 strategy tome (not a `workflows/*` file):** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` expands phase 0–17, fundraising/field/GOTV/Sim layer, Workbench rhythm; **Pass 3B** adds Part B ($250K base, $500K stretch, 5K active stretch, road/travel, county ladder, no-hired-staff) + `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`; **Pass 3C** adds Part C + `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` (APA vendor channel, paid governance, 2028/2030 doctrine); **Pass 3D** adds Part D + `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md` + `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` + `PAID_MEDIA` §13; **Pass 3E** adds Part E + `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md` + `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md` (NAACP mapping if unverified) + `FOCUS_CATEGORY_ORGANIZING_PLAN.md` + `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` + `PAID_MEDIA` §14; **Pass 3F** adds Part F + `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` + `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` + `WEEKLY_TRAVEL` §22 + `PAID_MEDIA` §15; **Pass 3G** adds **Part** **G** + ten 3G standalone manuals (see `MANUAL_PASS_3G_COMPLETION_REPORT.md` **table)** **+** `WEEKLY_TRAVEL` §**23,** `SIMULATION` §**24,** `PAID_MEDIA` §**16,** `PRECINCT` **addenda,** `MANUAL_INFORMATION_REQUESTS` §**26**–**35;** **Pass** **3H** **adds** **Part** **H,** `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md`**,** `WEEKLY_TRAVEL` §**24,** `SIMULATION` §**25,** `MANUAL_INFORMATION_REQUESTS` §**36** (ledger = **CONFIRMED** **truth;** **no** **fixture** **$** in **repo** **seed). **No** invented “active” campus teams, **NAACP** **branch** **names,** **or** **county** **meeting** **dates.** `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` — forecasts + Pass 3B/3C/3D/3E/3F/3G/3H assumptions (no app code).

**Pass 4 (manual, not a new `workflows/*` file):** `playbooks/ROLE_PLAYBOOK_INDEX.md` + 41 `playbooks/roles/*.md` playbooks; `APPROVAL_AUTHORITY_MATRIX`, `ESCALATION_PATHS`, `TASK_TEMPLATE_INDEX` — operator review path stays `TASK_QUEUE_AND_APPROVALS` + `WorkflowIntake` (see `SYSTEM_CROSS_WIRING_REPORT.md`).

**Pass 4B (manual + design, not a new `workflows/*` file):** `INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md` (assumptions + 18 levers; approval gates) + `SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md` + iPad/CM/candidate dashboard requirements.  

**Pass 5 (complete, runbooks only — not new code or routes):** `WORKBENCH_OPERATOR_RUNBOOK.md` + `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` + `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md` + `CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md` + `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md` — **maps** `WorkflowIntake` + `CampaignTask` + LQA; **`POST` `/api/forms`** **unchanged**; **`MANUAL_PASS_5_COMPLETION_REPORT.md`**.

**Last updated:** 2026-04-28 (Pass 3C + 3D + 3E + **3F** + **3G** + **3H** + **4** + **4B** + **5**)
