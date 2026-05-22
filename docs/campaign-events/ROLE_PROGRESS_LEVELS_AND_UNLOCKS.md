# Role Progress Levels and Unlocks

**Metaphor:** SimCity-style capability growth — simple dashboard first, modules unlock through training, tasks, and supervisor approval.

**Store V1:** localStorage keys `kelly-os-progress:{userId}:{role}`  
**Store V2:** Prisma `CampaignUserProgress` (not built)

---

## Unlock rules (global)

| Trigger | Unlocks |
|---------|---------|
| Complete onboarding | Base dashboard + `onboarding-checklist` |
| Complete first task | +1 role-specific module |
| Complete training module | Modules listed in module |
| Supervisor approval | Level 2+ finance/approval modules |
| Confidence score ≥ threshold | Advanced mode (`advanced-mode-dashboard-builder`) |
| New responsibility assigned | CM-assigned modules (`supervisor-assigned`) |

**Simple mode:** ≤4 modules, no `high` riskLevel blocks (see `dashboard-safety-guard.ts`).  
**Advanced mode:** full registry with safety guard.

---

## Progression tables

### Intern

| Level | Capabilities | Dashboard modules |
|-------|--------------|-------------------|
| **L1** | View assigned tasks; learn event basics; upload receipts; checklist items | `onboarding-checklist`, `recent-activity`, `upcoming-events` |
| **L2** | Help fill event details; draft materials list; flag missing info | + `event-planning-checklist`, `receipt-gaps` |
| **L3** | Run hot wash draft; county notes (read); supervised promotion preview | + `hot-wash-queue`, `county-memory` (read-only) |

### Volunteer

| Level | Capabilities | Modules |
|-------|--------------|---------|
| **L1** | View assignments; check in; upload photos; read instructions | `upcoming-events`, `volunteer-needs`, `role-training` |
| **L2** | Host follow-up notes; share field photos | + `host-follow-up` |
| **L3** | Coordinate with county lead on one event | + `county-memory` (limited) |

### Field manager

| Level | Capabilities | Modules |
|-------|--------------|---------|
| **L1** | County priorities; volunteer needs; field notes | `county-memory`, `volunteer-needs`, `executive-summary` |
| **L2** | Update county memory; assign volunteer slots | + `host-follow-up`, `hot-wash-queue` |
| **L3** | Cross-county escalation view | + `approval-queue` (read-only) |

### Treasurer

| Level | Capabilities | Modules |
|-------|--------------|---------|
| **L1** | View reimbursement packets; flag missing receipts | `travel-reimbursement-summary`, `receipt-gaps`, `missing-mileage` |
| **L2** | Month status transitions (supervised); print preview | + `finance-readiness`, `print-download-actions` |
| **L3** | Compliance export prep (human only) | + `executive-summary` |

### Campaign manager

| Level | Capabilities | Modules |
|-------|--------------|---------|
| **L1** | Global ops summary; approve workflows; assign people | `executive-summary`, `approval-queue`, `ai-next-actions` |
| **L2** | Calendar sync + promotion oversight | + `calendar-sync-health`, `promotion-readiness` |
| **L3** | Strategic intelligence panel | + full command center intelligence |

### Candidate

| Level | Capabilities | Modules |
|-------|--------------|---------|
| **L1** | Approval inbox; reimbursement status | `approval-queue`, `travel-reimbursement-summary` |
| **L2** | Event approvals with travel context | + `upcoming-events`, `finance-readiness` |
| **L3** | Strategic summary only (overload protection) | Cognitive load cap via `cognitive-load-analyzer` |

### Event planner

| Level | Capabilities | Modules |
|-------|--------------|---------|
| **L1** | Event planning checklist; upcoming events | `event-planning-checklist`, `upcoming-events` |
| **L2** | Run of show + materials modules on drilldown | + `hot-wash-queue` (post-event) |
| **L3** | Blueprint library access | + county memory read |

### Social media · Communications lead · County lead · Host · Finance helper · New admin · Operator

See `ROLE_COPILOT_EXPANSION_PLAN.md` — same L1/L2/L3 pattern with modules from `dashboard-component-registry.ts`.

---

## AI tools

`role-level-tracker`, `dashboard-unlock-recommender`, `task-achievement-recorder`, `role-progression-advisor`, `supervisor-approval-gate`, `training-unlock-manager`

---

## Anti-patterns

- Do not unlock `print-download-actions` for interns without supervisor.  
- Do not use progression to bypass `dashboard-safety-guard` high-risk blocks.  
- Gamification must not encourage speed over accuracy on finance.
