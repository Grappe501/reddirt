# Campaign OS Training Layer

**Principles:** Unobtrusive · available everywhere · role + skill + time aware · human-gated for risk

---

## Architecture (four layers)

```text
[Microcopy / tooltips] ──► [Contextual explainers] ──► [Modules & walkthroughs] ──► [Supervisor gates]
         │                           │                          │
         └──────────────► [Progress store] ◄── task completion / observations
                                    │
                         [Dashboard unlock manager]
```

---

## Components

| # | Component | V1 (now) | V2 |
|---|-----------|----------|-----|
| 1 | Role onboarding | `/admin/onboarding` wizard | Persist progress in DB |
| 2 | Skill assessment | `skill-assessment-agent` (experience → band) | Quiz + history |
| 3 | Available time | `available-time-router` (stub) | Calendar integration |
| 4 | First tasks | `user-role-placement-agent` | Copilot daily list |
| 5 | Training modules | Docs + catalog stubs | CMS / JSON modules |
| 6 | Drilldown explainers | `WorkflowGuidanceCards` | Per-field tooltips on `[recordId]` |
| 7 | Tooltip layer | Partial via guidance cards | `data-training-id` + hover |
| 8 | Learn-before-do gates | Design only | Soft block with override + supervisor |
| 9 | Task completion | `user-observations` events | `task-achievement-recorder` |
| 10 | Progressive unlocks | `training-unlock-manager` (stub) | Registry-driven dashboard |
| 11 | Certification levels | `ROLE_PROGRESS_LEVELS_AND_UNLOCKS.md` | Badge UI |
| 12 | Supervisor escalation | `supervisor-approval-gate` (stub) | Admin approve UI |
| 13 | AI tutor | Command palette + copilot stubs | Inline chat with route context |

---

## Module types

| Type | Duration | Example |
|------|----------|---------|
| Short explanation | 1–2 min | “What is tentative vs official calendar?” |
| Checklist | 5 min | Reimbursement month checklist |
| Guided walkthrough | 10 min | First approval from workbench |
| Hands-on task | 15 min | Upload one receipt (supervised) |
| Quiz / checkpoint | 5 min | Finance do-not-touch quiz |
| Supervised approval | — | Unlock treasurer L2 |
| Advanced module | 30 min | GCal promotion dry-run |
| Reference guide | — | Link to `OFFICIAL_REIMBURSEMENT_REPORT.md` |

---

## Role coverage

All roles in onboarding engine plus: volunteer, intern, field manager, social media, communications lead.

**Routing:** `available-time-router` picks pace (light / standard / intensive). `role-training-path-builder` orders modules. `onboarding-readiness-scorer` gates dashboard complexity (`simple-mode-dashboard-builder` vs advanced).

---

## UX rules

- Never block critical safety paths (logout, help, supervisor contact).  
- Gates are **soft** with “I’m trained” + supervisor override logged.  
- Tooltips dismiss permanently per user (localStorage V1).  
- Training drawer: optional right rail on admin shell (V2).  
- AI tutor cites catalog tool id + doc path — no secret leakage.

---

## Integration points

| Surface | Training hook |
|---------|----------------|
| Admin shell | “?” on nav group → module link |
| Workbench | `WorkflowGuidanceCards` + focus modes |
| Reimbursement | Month checklist + treasurer module |
| Dashboard builder | “Learn modules before adding” hint |
| Command center | `KellyOsCompletionPlanPanel` + copilot plan |
| AI tools page | Lifecycle `kelly_os_planning` |

---

## AI tools (planning lifecycle)

See `sprint-kelly-os-planning-tools.ts` — training-* and guided-walkthrough-builder.

---

## Success metrics

- Time-to-first-successful-task per role  
- Training module completion rate  
- Support questions reduced (observation `help_requested` down)  
- Zero unauthorized finance/approval actions by new users
