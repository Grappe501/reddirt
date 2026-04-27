# Manual Pass 5 — completion report

**Active lane:** `RedDirt/campaign-system-manual`  
**Work type:** Markdown / manual only  
**Date:** 2026-04-28  
**Confirmation:** No application code, Prisma, DB, auth, migrations, or dependencies changed. No secrets or real PII. No commit in this pass.

---

## Files read (per Pass 5 plan)

- `H:\SOSWebsite\CURSOR_CODEX_COORDINATION_PROTOCOL.md` (context)  
- `H:\SOSWebsite\START_HERE_FOR_AI.md`  
- `H:\SOSWebsite\RedDirt\README.md`  
- `MANUAL_BUILD_PLAN.md`, `MANUAL_TABLE_OF_CONTENTS.md`, `WORKFLOW_INDEX.md`, `SYSTEM_READINESS_REPORT.md`  
- `SYSTEM_CROSS_WIRING_REPORT.md` (spine)  
- `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`  
- `INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md`, `SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md`  
- `CANDIDATE_AND_CAMPAIGN_MANAGER_STRATEGY_DASHBOARD_REQUIREMENTS.md`, `IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md`  
- `workflows/TASK_QUEUE_AND_APPROVALS.md`  
- `playbooks/README.md`, `playbooks/TASK_TEMPLATE_INDEX.md`, `playbooks/APPROVAL_AUTHORITY_MATRIX.md`, `playbooks/ESCALATION_PATHS.md`, `playbooks/DASHBOARD_ATTACHMENT_RULES.md`, `playbooks/ROLE_KPI_INDEX.md`  
- `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (through §38)

---

## Files created

| File | Role |
|------|------|
| `WORKBENCH_OPERATOR_RUNBOOK.md` | Daily/weekly **Workbench** SOP, queues, WIP, parking lot, checklists, role views, honest **product** status |
| `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` | Preview/Proposed/Locked; strategy → LQA → intake/task **—** no auto-execution; domain flows; TT mapping; fake samples only |
| `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md` | CM first 30m, triage, comms block, weekly lock, KPI truth, R/Y/G, **vs** T/C/O, scope **red** lines |
| `CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md` | Candidate view + **emulation** until product; read-only **vs** request-only; what **never** to see; **CM** **sync**; crisis lane |
| `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md` | Lanes to **MCE/NDE/paid/field,** do-not-do, TT-by-lane |
| `MANUAL_PASS_5_COMPLETION_REPORT.md` | This file |

---

## Files updated

| File | Change |
|------|--------|
| `MANUAL_BUILD_PLAN.md` | Pass 5 **complete;** next **Pass 5B** (Message Engine + Narrative chapter depth) **or** `Pass 6` (OIS productization) **or** P5 op tickets (owner choice) |
| `MANUAL_TABLE_OF_CONTENTS.md` | Pass 5 runbooks in Workbench / lifecycle / ops sections |
| `WORKFLOW_INDEX.md` | Pass 5 runbooks = **SOP,** not new **routes** |
| `SYSTEM_READINESS_REPORT.md` | Pass 5 **artifacts** in key **list;** no **0–6** grade **changes** |
| `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` | **§**39 (Pass 5 SOP / SLA / RACI TBD) + **intro** + **“when** **list”** + **last** **updated** |
| `playbooks/README.md` | “Read first” + last updated: Pass 5 cross-links to operator + strategy runbooks |

---

## Product honesty (required)

- **Workbench** (open-work merge) is **strong** in **code;** not **all** **role** dashboards, **4B** **slider** **UI,** full **GOTV** **command,** or **iPad-**hardened **admin** for **all** **flows** are **shipped** or **one**-**to**-**one** with this **manual.  
- **Strategy** **=** **docs** + **RACI** **until** **Steve** and **build** **close** **gaps.  
- **P5** “complete team” and **GOTV** depth stay **SOP** + field truth, not a full ERD in every UI.

---

## How Pass 5 connects strategy → `WorkflowIntake` → `CampaignTask` → Workbench

1. **4B** sliders / assumptions = **Preview** (no ops) or **Proposed** (RACI pending) per `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md`. A **locked** baseline is a meeting + dated `WorkflowIntake` and/or `CampaignTask` record—not an informal DM or ad-hoc chat.
2. **LQA** follows `playbooks/APPROVAL_AUTHORITY_MATRIX.md` (money, targeting, GOTV, public, export).
3. **Record** work in `WorkflowIntake` and/or `CampaignTask` (TT-xx from `playbooks/TASK_TEMPLATE_INDEX.md`) per `workflows/TASK_QUEUE_AND_APPROVALS.md`.
4. **Execution** uses admin routes and OIS-adjacent SOPs; attach evidence in the task or linked plan.
5. **Closeout** per `WORKBENCH_OPERATOR_RUNBOOK.md` (no ghost closes).

---

## Remaining blockers (Steve / MI)

- **§**39: CM daily **authority** limits, WIP, SLA, who **locks** weekly baseline, candidate visibility, request-only, lane names, TT ownership, Workbench **closeout** hours, **emergency** windows — plus **§1–**38.  

---

## Recommended next pass

- **Option A — Pass 5B (manual):** Message Engine + Narrative Distribution chapter depth; align with `docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md` and `docs/NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md` and `docs/MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md` (per `MANUAL_BUILD_PLAN.md`).  
- **Option B — Pass 6 (manual):** County / OIS productization when city/precinct keys exist.  
- **Option C (engineering, outside this manual pass):** Power of 5 operational build tickets; owner + eng scope.  

**Last updated:** 2026-04-28 (Pass 5)
