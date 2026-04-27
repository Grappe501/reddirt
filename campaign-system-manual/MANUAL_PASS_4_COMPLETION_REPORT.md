# Manual Pass 4 — completion report

**Lane:** `RedDirt/campaign-system-manual` (markdown only)  
**Date:** 2026-04-28  
**Next pass:** **Manual Pass 5** — workflow SOPs, Workbench runbooks, Message Engine + Narrative (see `MANUAL_BUILD_PLAN.md` Pass 5 / historical Pass 4 optional track).  

**Constraints honored:** No app code, DB, auth, migrations, or secrets. Public vocabulary: Campaign Companion, Guided Campaign System, Organizing Guide, Workbench, Pathway — not “AI” as a product name. **3G money:** commission/ambassador remains **proposed** until O+T+C. **No** unsourced opponent claims, **no** real PII in examples.

---

## A. Files read (design / cross-ref)

- `H:\SOSWebsite\CURSOR_CODEX_COORDINATION_PROTOCOL.md` (not modified; context)  
- `H:\SOSWebsite\RedDirt\README.md` (not modified)  
- `H:\SOSWebsite\RedDirt\docs\KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md` (not modified)  
- Prior manual spine: `MANUAL_TABLE_OF_CONTENTS.md`, `MANUAL_BUILD_PLAN.md`, `WORKFLOW_INDEX.md`, `SYSTEM_READINESS_REPORT.md`  
- `TRAINING_AND_TRAINER_CERTIFICATION_SYSTEM.md`  
- `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§37 appended)  
- `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Part I inserted)  
- `playbooks/*` index docs as completed in this pass  

---

## B. `playbooks/` deliverables (inventory)

| Item | Count / note |
|------|----------------|
| `playbooks/README.md` | 1 |
| `playbooks/ROLE_PLAYBOOK_INDEX.md` | 1 (41 slugs) |
| `playbooks/DASHBOARD_ATTACHMENT_RULES.md` | 1 |
| `playbooks/TRAINING_MODULE_INDEX.md` | 1 |
| `playbooks/TASK_TEMPLATE_INDEX.md` | 1 |
| `playbooks/ROLE_KPI_INDEX.md` | 1 |
| `playbooks/APPROVAL_AUTHORITY_MATRIX.md` | 1 (cleaned) |
| `playbooks/ESCALATION_PATHS.md` | 1 (new) |
| `playbooks/PROMOTION_AND_SIDEWAYS_PATHWAYS.md` | 1 (new) |
| `playbooks/ROLE_READINESS_MATRIX.md` | 1 (new) |
| `playbooks/roles/*.md` | **41** (each **25** numbered sections) |
| `playbooks/_gen_role_playbooks.py` | 1 (optional; regenerates 41 from `ROLES` list) |

---

## C. Meta manuals updated

- `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` — **Part I** (Campaign Companion / Guided Campaign System vision; pointers to `playbooks/` and MI §37)  
- `TRAINING_AND_TRAINER_CERTIFICATION_SYSTEM.md` — Pass 4 cross-refs  
- `MANUAL_TABLE_OF_CONTENTS.md` — version line + **Part IV** playbooks row  
- `MANUAL_BUILD_PLAN.md` — **Pass 4** marked complete; duplicate “recommended next” block removed  
- `WORKFLOW_INDEX.md` — Pass 4 pointer (not a new `workflows/*` file)  
- `SYSTEM_READINESS_REPORT.md` — header + key artifacts (Pass 4 docs)  
- `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` — **§37** (role playbooks, training access, operator roster)  

---

## D. `roles/*` README one-line links (only 1:1 or noted filename)

Updated **12** `roles/<slug>/README.md` files with a **Pass 4 playbook** line where mapping is clear: `campaign-manager`, `candidate`, `owner`, `volunteer-coordinator`, `field-manager`, `communications-lead`, `voter-file-data-steward`, `sign-holder-captain`, `narrative-distribution-lead`, `county-leader` → `county-coordinator.md`, `power-team-leader` → `power-of-5-leader.md`. **Not** linked: e.g. `finance-lead` (ledger/ops) vs `fundraising-lead` (asks) — different scope; `data-lead` / `message-lead` / `admin` / catalog-only folders without a matching of the **41** playbook filenames.

---

## E. Commands and results

- `python playbooks\\_gen_role_playbooks.py` (from `campaign-system-manual`) — **exit 0**, **41** files written to `playbooks/roles/` (shell subagent; parent environment had PowerShell parse noise).  
- No `npm` / `pnpm` tests (markdown-only pass).  
- **No** git commit (per user instruction at handoff; confirm with Steve if a commit is desired).  

---

## F. `WorkflowIntake` / `/api/forms` / operator path (documentation)

- **Code spine unchanged** this pass. Per existing docs, **`POST /api/forms`** → handlers → **`WorkflowIntake`** remains the intake anchor (`WORKFLOW_INDEX.md`, `SYSTEM_CROSS_WIRING_REPORT.md`).  
- **Pass 4** adds **procedural** routing: `APPROVAL_AUTHORITY_MATRIX`, `ESCALATION_PATHS`, `TASK_TEMPLATE_INDEX` — **operator review** still flows through **Workbench** / task queue SOPs in `workflows/TASK_QUEUE_AND_APPROVALS.md` (not re-authored here). **WorkflowIntake** is **not** a new name in this pass; it is **referenced** in Part I and workflow index as the existing spine.  

---

## G. Remaining blockers (honest)

- **Policy gaps** in `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**37 and earlier § (thresholds, PII, trainer access, public titles) until owner/Steve locks.  
- **GOTV / ED** depth in product remains TBD per `SYSTEM_READINESS_REPORT.md`.  
- **LMS** / full role dashboards: not claimed.  

---

## H. Is Days 4–7 compression “safe”?

**Documentation-only judgment:** **Part I + playbooks** improve **SOP** clarity and **do not** add runtime risk. **Compression** of **build** work still depends on **treasurer-CONFIRMED** money truth, **operator** headcount, and **counseled** comms — **not** on this pass alone. **Safe** to compress **planning** if leadership accepts **unresolved** MI items; **not** safe to compress **compliance** or **money** without those inputs.

---

**Last updated:** 2026-04-28 (Pass 4)
