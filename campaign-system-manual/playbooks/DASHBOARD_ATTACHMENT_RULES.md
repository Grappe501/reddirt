# Dashboard attachment rules — Pass 4

**Purpose:** Map **which surface** each **role** uses when the product can support it. Today: **admin Workbench** + **public** pages are **not** a full per-role app for all 41 roles. See `../SYSTEM_READINESS_REPORT.md`. **Public language:** Field Intelligence, Campaign Companion, Workbench, Pathway Guide — not “**AI**.”

**Pass 5C (progressive disclosure):** When **built,** **dashboard** **cards,** **queues,** and **strategy** **/ **sim** **previews** should **unlock** **by** **role** **readiness** and **training** **gates** — **not** **all** **tiles** **on** **day** **one** **(see** `../PROGRESSIVE_ONBOARDING_AND_UNLOCK_SYSTEM.md`**, **`../ROLE_BASED_UNLOCK_LADDERS.md`**, **`../USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md` **).** Locked **surfaces** **must** **explain** **why** **and** **who** **approves** **(see** **`../MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**40**).** **Pass** **5C** **does** **not** **claim** **the** **product** **already** **implements** **this** **for** **every** **route** **.**

**Pass 3H gate (money):** No paid, postcard, sign, visibility, or banner **escalation** is “**funded**” until **CONFIRMED** `FinancialTransaction` actuals, **treasurer** **COH,** **budget** **scenario,** and **stretch-unlock** — `../FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md`, `../PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` §**17**, `../POSTCARDS_SIGNS_BANNERS_AND_VISIBILITY_FUNDRAISING_PLAN.md` §**16**.

## Dashboard and surface types (product truth, Pass 2A)

| Type | What it is today | Typical roles |
|------|------------------|--------------|
| **Personal volunteer** | Member `/dashboard` = **placeholder** | New volunteer, P1 |
| **Power of 5** | Public P5 path; P5 ERD in DB not single graph | P5 member, P5 **leader** |
| **Leader** | `/dashboard/leader` = **placeholder** | Team / city / prec captains |
| **County** | Public county + OIS when populated | **County** coordinator, county leader work |
| **Region** | OIS region (8) | Regional organizer, **road** team |
| **State** | OIS state | **Owner**-level review |
| **Workbench** | `admin` open-work: `WorkflowIntake`, `CampaignTask`, threads, festivals | **CM**, **admin**, most **staff** **leads** |
| **Finance** | **Admin** financial transactions + **future** **budget** **variance** **UI** | **Finance** lead, **treasurer** (policy) |
| **Paid media** | Comms + **governance**; **not** a full ad stack in this manual | **Paid**-media **coordinator** |
| **Narrative** | `admin/narrative-distribution` | **NDE** lead |
| **Field** | Events + OIS (mixed **demo** / **live**) | Field manager, event-adjacent |
| **Travel / calendar** | `CampaignEvent` + **GCal** SOP; **reconcile** **in** **manuals** | **Calendar-travel,** **GCal** **scheduler,** **advance** |
| **Training** | **Manual** + **tasks** for assignments; no LMS in repo as “live” for all | **Training** **director,** **trainer** |
| **GOTV** | Route exists; depth **TBD** | (Future SOP) |
| **Election Day** | **Command** in **docs**; **not** a guaranteed shipped ED command **UI** | **CM,** **owner** |
| **Candidate** | **Schedule** + **comms** **briefs**; **not** a single “candidate app” claim | **Candidate** |
| **Campaign manager** | **Primary** = **Workbench** + **RACI** | **CM** |
| **Owner** | **All** **surfaces,** break-glass (policy) | **Owner** |

**Per-role primary/secondary, queues, and KPIs** are specified in each `playbooks/roles/<name>.md` (sections 6, 7, 13–15) and rolled up in `ROLE_KPI_INDEX.md`.

## Pass 4B — strategy panels, scenario sliders, and device class (design)

| Element | Who views | Who proposes edits | Who approves operational impact | Product state |
|--------|-----------|-------------------|---------------------------------|-----------------|
| **Candidate strategy panel** (master plan + ahead/behind) | **Candidate** (+ counsel/staff with policy) | **CM,** advance, **candidate** (time) per MI §38 | **MCE/NDE** for public; **O** in crisis; **$**-linked → **T** | **Not** a guaranteed shipped **route** in repo — see `../CANDIDATE_AND_CAMPAIGN_MANAGER_STRATEGY_DASHBOARD_REQUIREMENTS.md` |
| **CM strategy panel** (full) | **CM,** **owner** (break-glass) | **CM,** data as policy | LQA by category: **$** **→** T; **GOTV/paid/audience** **→** ST+C+O as in matrix | same |
| **Scenario slider** **Preview** | **CM,** **owner,** (candidate **if** **policy**) | **any** with **auth** in admin | **N/A** (no ops change) | **Spreadsheet** or **future** sim UI |
| **Proposed** **/ locked** **baseline** (week) | **all** with **read**-**right**; **sensitive** **KPIs** **staff**-**only** | **CM** (draft) | **owner** and/or **M**+**T**+**C**+**O** by row — `APPROVAL_AUTHORITY_MATRIX` 4B | TBD product |
| **iPad** **/ mobile** | **read**-**leaning**; **edits** **gated** | **as** per **IPAD** **doc** | same | **iPad-**first **SOP,** not **a** full **redesign** **claim** in **this** pass |

**Behavior:** **Propose** **assumption** **changes** **in** **Preview**; **operationalize** only through **RACI** and **`CampaignTask`** / **SOPs** (Pass 5). **No** **voter** **row** in **any** **strategy** **tile** for **volunteer** **roles**. **Ref:** `../INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md`, `../IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md`.

## Attachment pattern (all roles)

| Element | Source |
|--------|--------|
| **Primary dashboard** | Table above + role playbook |
| **Secondary** | OIS, public county, `CampaignEvent` list (admin) |
| **Manual chapters** | Listed per role in each playbook |
| **Training shown** | `TRAINING_MODULE_INDEX.md` (levels + **module** **id**) |
| **KPIs** | `ROLE_KPI_INDEX.md` + playbook **§**13 |
| **Next-best-action queue** | **Workbench** open `WorkflowIntake` + `CampaignTask` (when staff) |
| **Approval queue** | `APPROVAL_AUTHORITY_MATRIX.md` (category → **LQA**) |
| **Escalation** | `ESCALATION_PATHS.md` — **not** a guaranteed **in-product** “escalation button” today |
| **Coaching** | `PROMOTION_AND_SIDEWAYS_PATHWAYS.md` + **trainer** playbooks |
| **Progress** | Ladder, **OIS** (honest), P5; **not** public PII “leaderboards” |
| **Election Day view** | **Conceptual** in manuals; comms + incident **RACI**; **not** a guaranteed full ED product for every role (`SYSTEM_READINESS_REPORT.md`) |

**Last updated:** 2026-04-28 (Pass 4 + **4B** + **5C**)
