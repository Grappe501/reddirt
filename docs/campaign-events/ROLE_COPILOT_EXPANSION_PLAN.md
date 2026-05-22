# Role Copilot Expansion Plan

**Scope:** Kelly SOS single-campaign · human-gated AI · no autonomous sends/approvals/writes

Existing copilot-adjacent surfaces: command center, onboarding placement, dashboard builder, OS control panel, writing agent, next-action engine. This plan adds **five role-specific copilots** with shared contract shape.

Tool stubs: `sprint-kelly-os-planning-tools.ts` (`volunteer-copilot`, `intern-copilot`, `field-manager-copilot`, `social-media-copilot`, `communications-lead-copilot`).

---

## Shared copilot template

Each copilot defines:

| Field | Purpose |
|-------|---------|
| Mission | One sentence role purpose |
| Daily tasks | 3–7 recurring actions |
| First-week onboarding | Training module IDs (see training layer) |
| Dashboard modules | Registry block IDs from `dashboard-component-registry.ts` |
| Permissions | Allowed routes + **do-not-touch** |
| AI tools | Catalog IDs that assist this role |
| Escalation | Human supervisor role |
| Success metrics | Observable outcomes (tasks completed, errors avoided) |
| Progression | Levels 1–3 (see `ROLE_PROGRESS_LEVELS_AND_UNLOCKS.md`) |

---

## Volunteer copilot

| Item | Detail |
|------|--------|
| **Mission** | Help volunteers show up prepared, check in, and capture field signal safely. |
| **Daily tasks** | View assignments; read run-of-show summary; check in; upload photos (metadata); flag missing info. |
| **First week** | Volunteer L1 training path; event basics checklist; photo upload hands-on. |
| **Dashboard modules** | `upcoming-events`, `volunteer-needs`, `onboarding-checklist`, `role-training`, `ai-next-actions` |
| **Do-not-touch** | Approvals, reimbursement finalize, GCal promote, email send, finance exports |
| **AI tools** | `volunteer-copilot`, `role-training-path-builder`, `first-task-recommender` |
| **Escalation** | Volunteer coordinator → campaign manager |
| **Metrics** | Check-ins recorded; photos uploaded; zero finance route visits |
| **Levels** | L1 view/check-in · L2 host follow-up notes · L3 county event support |

---

## Intern copilot

| Item | Detail |
|------|--------|
| **Mission** | Accelerate intern productivity on events and finance prep under supervision. |
| **Daily tasks** | Assigned task list; upload receipts; fill event detail drafts; complete checklists; flag gaps. |
| **First week** | Intern L1 modules; reimbursement basics (read-only); event planning intro. |
| **Dashboard modules** | `onboarding-checklist`, `event-planning-checklist`, `receipt-gaps`, `missing-mileage`, `recent-activity` |
| **Do-not-touch** | Finalize reimbursement; approve/deny; promote calendar; send email |
| **AI tools** | `intern-copilot`, `task-confidence-scorer`, `supervisor-approval-gate` |
| **Escalation** | Campaign manager or treasurer for finance touches |
| **Metrics** | Tasks closed; receipt gaps reduced; supervisor approval rate |
| **Levels** | L1 tasks/receipts · L2 event detail drafts · L3 materials list prep |

---

## County intelligence training (all field roles)

Add modules (see `CAMPAIGN_OS_TRAINING_LAYER.md`):

- How to read a county dashboard (countyWorkbench dashboard-v2)  
- How to use county goals in event planning (EventCountyIntelligenceCard)  
- How Power of 5 works (`POWER_OF_FIVE_INTELLIGENCE.md`)  
- How to identify county weaknesses (readiness + coverage)  
- How to use county data after an event (hot wash impact panel)  

Copilots **field-manager**, **volunteer**, **intern**, **campaign-manager**, and **candidate** should call `composeCountyDashboardContext()` / `buildCountyActionPlan()` in V2 surfaces.

---

## Field manager copilot

| Item | Detail |
|------|--------|
| **Mission** | Coordinate county field priorities, volunteers, and host follow-up. |
| **Daily tasks** | County priority review; volunteer needs; field notes; hot wash prompts; county memory read. |
| **First week** | County lead overlap training; countyWorkbench bridge overview. |
| **Dashboard modules** | `county-memory`, `volunteer-needs`, `host-follow-up`, `upcoming-events`, `executive-summary` |
| **Do-not-touch** | Voter file export; bulk email send; finance finalize |
| **AI tools** | `field-manager-copilot`, `county-memory-synthesizer` (Sprint 7), gap detector |
| **Escalation** | Campaign manager; Steve for cross-county conflicts |
| **Metrics** | Counties with updated memory; volunteer slots filled |
| **Levels** | L1 read priorities · L2 update field notes · L3 host/coalition coordination |

---

## Social media copilot

| Item | Detail |
|------|--------|
| **Mission** | Plan and draft owned-media content aligned to events and hot-wash learnings. |
| **Daily tasks** | Content calendar review; draft posts; media approval queue; messaging alignment check. |
| **First week** | Brand voice module; approval workflow; no auto-publish rule. |
| **Dashboard modules** | `promotion-readiness`, `hot-wash-queue`, `recent-activity`, `ai-next-actions` |
| **Do-not-touch** | Auto-publish; approval tokens; finance; voter targeting |
| **AI tools** | `social-media-copilot`, writing agent tools, `psychology-intelligence` (Sprint 10) |
| **Escalation** | Communications lead → candidate for sensitive posts |
| **Metrics** | Drafts approved; posts scheduled (human); engagement tracked manually V1 |
| **Levels** | L1 draft · L2 calendar ownership · L3 crisis/comms coordination |

---

## Communications lead copilot

| Item | Detail |
|------|--------|
| **Mission** | Unify outreach, hosts, coalition, and email lanes with relationship memory. |
| **Daily tasks** | Inbox triage; host follow-up; coalition notes; approval package prep; volunteer nurture list. |
| **First week** | Sprint 4 email rules; relationship engine preview (Sprint 12); do-not-send gates. |
| **Dashboard modules** | `approval-queue`, `host-follow-up`, `volunteer-needs`, `executive-summary`, `command-palette` |
| **Do-not-touch** | `EMAIL_SEND_ENABLED` without human; FIN exports; GCal write |
| **AI tools** | `communications-lead-copilot`, Sprint 4 email tools, future Sprint 12 tools |
| **Escalation** | Campaign manager; candidate for public statements |
| **Metrics** | Response time; host confirmations; email dry-run pass rate |
| **Levels** | L1 triage · L2 outreach campaigns · L3 coalition strategy |

---

## Existing roles (maintain)

Candidate, campaign manager, treasurer, event planner, volunteer coordinator, county lead, host helper, finance helper, new admin, operator — already in onboarding engine; each gets copilot **V2** by merging next-action engine + role placement + dashboard matcher.

---

## Build order for copilots

1. Volunteer + intern (low risk, high volume)  
2. Treasurer + CM (reuse finance/approval modules)  
3. Field manager (needs county packet)  
4. Social + communications lead (needs Sprint 12 comms scaffold)
