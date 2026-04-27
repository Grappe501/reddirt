# Day one → Election Day — campaign lifecycle (repo-aligned)

**Purpose:** Map **phases 0–17** to **owners**, **system surfaces** (as built or planned), and **gaps**. **Not** a legal compliance checklist. **Public language:** Pathway Guide, **Guided Campaign System**, **Workbench**, **Field Intelligence** — not “AI.”

| Phase | Goal | Primary owner | Supporting roles | System surfaces (evidence) | Data captured | KPIs (examples) | Approvals | Risks | Current repo support | Missing build | Manual sections |
|-------|------|----------------|-----------------|-----------------------------|---------------|-----------------|-----------|-------|----------------------|---------------|-----------------|
| **0** Candidate intake + philosophy | Align **tone**, **boundaries**, **priorities** | Owner / candidate | CM, compliance | Public site, `admin/candidate-briefs/*`, comms (when used) | Briefs, internal notes in admin | Consistency, conflict rate | **Counsel** on claims | Unsourced attacks | **Partial** (briefs route) | Structured **candidate config** object | Ch 12, 20–21, gap analysis file |
| **1** One-person campaign setup | Single operator can run intake + site + workbench | Owner or solo CM | — | `admin/login`, `admin/workbench`, site CMS | `User`, `SiteSettings`, intakes | Intake age, open work count | Owner | Burnout | **5** (ops shell) | Solo **on-call** SOP in-app | Ch 2, 7, 16 |
| **2** First volunteer by email / form | Convert interest to `WorkflowIntake` | V.C. / admin | Field | `POST /api/forms`, workbench | `User`, `Submission`, `VolProfile` (if volunteer) | Time to first response | CM triage rules | PII in logs | **5** (DB path) | Autoresponder productization | Ch 3, wf first-email |
| **3** P5 growth | Relational **circles of five** | P5 member, team leader | County | `onboarding/power-of-5`, (future) dashboard | (planned P5 graph) | My Five, pipeline | Leader | Over-collection of contacts | **3–4** | Full **PowerTeam** Prisma as plan | Ch 5, P5 wf |
| **4** County / city / precinct structure | **Place** leadership without dossiers | County leader, field | Regional | `/counties/*`, OIS, **no** city OIS route | `County`, field assignments | Captain bench, coverage | CM for **titles** on site | Public microtargeting | **3–4** county; **0–1** city/precinct | City route + precinct keys | Ch 10–11 |
| **5** CM plugs in | **Workbench** cadence | CM | Owner | `admin/workbench`, `tasks` | tasks, intakes, plans | Median triage time | Owner | **ADMIN_SECRET** shared | **5** | RBAC in product | Ch 7, 12, CM wf |
| **6** V.C. | Pipeline + quality | V.C. | Field | `volunteers/intake`, `asks` | `SignupSheet*`, `VolunteerAsk` | Placement % | CM | Mismatch / duplicates | **4** | Auto-match quality metrics | V.C. in role index |
| **7** Field manager | Turf, capacity, captains | Field mgr | Data (targets) | Workbench, events, **field** in schema | `FieldAssignment`, `CampaignEvent` | Capacity vs plan | CM | **Unsafe** list usage | **4** | Walk-list app policy UI | Ch 10 |
| **8** Comms + message + narrative | **Message** discipline + **distribution** | Comms, message, **NDE** (role) | Compliance | `workbench/comms/*`, `admin/narrative-distribution` | `CommunicationPlan`, etc. | Cycle time, defect rate | **Counsel** on paid/regulated | Leaks | **4** | NDE telemetry | Ch 8–9 |
| **9** County leaders at scale | **Field Intelligence** to counties | County leaders | Regional | County admin + public pages | `County*`, intakes w `countyId` | County funnel health | CM | Mixed messaging | **4–5** | One merged county VM | Ch 11 |
| **10** Surrogate / local candidates | **Down-ballot** (policy-bound) | CM / field | Compliance | `events`, `admin/events` as applicable | `CampaignEvent` | Event throughput | **Counsel** | Op smears | **4** (events) | Surrogate **packet** | Ch 12 |
| **11** Petition / ballot | Jurisdiction rules | **Compliance** + counsel | — | (mostly offline / docs) | `ComplianceDocument`? | Filing deadlines | **Legal** | Missed window | **2** (compliance store) | Petition **workflow** | Ch 15, legal |
| **12** Voter contact | **Aggregate-first** program | Field + data | CM | Voter import (admin), `RelationalContact` | `VoterRecord` (stewarded) | Contacts attempted (permissioned) | **Data** on exports | PII | **4** (models) | Volunteer-safe UI limits | Ch 10, 15 |
| **13** Sign / visibility | Precinct and roadside presence | **Sign captain** (see dedicated wf) | Field | **Tasks, events** — no dedicated `Sign` model in Pass 2 schema grep | Shifts, tasks in practice | % precincts w coverage | **Safety** (local law) | Injury, trespass | **1–2** (manual ops) | Program **models** or standard task pack | new wf, Ch 22 |
| **14** Early vote | Turnout to EV period | Field + GOTV lead | V.C. | `gotv` admin, public VR pages | (verify GOTV page depth) | EV utilization proxy | CM | Data lag | **TBD** | EV-specific dashboard | Ch 18, 22 |
| **15** GOTV | Final 72h push | GOTV / field / CM | — | `admin/.../gotv` (verify), tasks, comms | tasks, **Vote plans** in schema | Contact completion | CM | Harassment | **3?** (page exists) | Real-time comms gating for SMS compliance | Ch 14, 22 |
| **16** ED command | Polling, incidents, visibility | **CM** + owner | Field, comms | **Workbench**, tasks, (future) **command** | incidents as tasks/logs? | **Coverage, incidents** | **Legal** for police | Disinfo | **2** (no unified ED C2) | **ED** rollup dashboard | Ch 22 |
| **17** Post-election closeout | Data retention, narrative | Owner | Compliance, data | `SiteSettings`, exports policy | **audit** | Archive completeness | **Counsel** | Data misuse | **2** | **Retention** automations | Ch 15, 19 |

**Note:** Maturity in “Current repo support” is directional; re-verify in deploy.

**Cross-links:** `SYSTEM_CROSS_WIRING_REPORT.md` · `MANUAL_TABLE_OF_CONTENTS` (phases) · `CANDIDATE_AND_CAMPAIGN_MANAGER_INTAKE_GAP_ANALYSIS.md`

**Last updated:** 2026-04-27
