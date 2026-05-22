# Dashboard Module System

**Foundation:** Sprint 10.5 `dashboard-component-registry.ts` + blueprint builder (no live render yet).

---

## Module sources

| Source | Description |
|--------|-------------|
| **Registry (safe blocks)** | 20 canonical blocks with `id`, `riskLevel`, `requiredRole` |
| **User-added** | Operator pins from blueprint builder save (localStorage V1) |
| **AI-suggested** | `dashboard-module-recommender` / blueprint pipeline |
| **Supervisor-assigned** | CM assigns modules to intern/volunteer (V2) |
| **Role-required** | Always on for role (e.g. treasurer → reimbursement summary) |
| **Training-unlocked** | `training-unlock-manager` after module complete |
| **Pinned / hidden** | User preference overlay |

---

## Modes

| Mode | Rule |
|------|------|
| **Simple** | ≤4 modules; `new-user-friction-reducer`; no high-risk blocks for new skill |
| **Advanced** | Full layout planner + safety guard |

Toggle: `dashboard-complexity-scorer` + user skill band.

---

## Registry map (current)

| Block ID | Purpose | Risk |
|----------|---------|------|
| `approval-queue` | Pending decisions | medium |
| `upcoming-events` | Schedule slice | low |
| `travel-reimbursement-summary` | Month reimbursement | medium |
| `missing-mileage` | Mileage gaps | low |
| `finance-readiness` | Treasurer readiness | medium |
| `receipt-gaps` | Missing receipts | low |
| `calendar-sync-health` | Sync status | low |
| `promotion-readiness` | GCal promote queue | high |
| `event-planning-checklist` | Planning workbook entry | low |
| `hot-wash-queue` | Post-event learning | low |
| `county-memory` | County signals | low |
| `volunteer-needs` | Volunteer slots | low |
| `host-follow-up` | Host tasks | low |
| `ai-next-actions` | Agent recommendations | low |
| `onboarding-checklist` | New user steps | low |
| `role-training` | Training links | low |
| `command-palette` | Ctrl+K hint | low |
| `recent-activity` | Observations slice | low |
| `executive-summary` | Ops headline | low |
| `print-download-actions` | Reimbursement export | high |

---

## Lifecycle

```text
Blueprint (Sprint 10.5) → preview cards → save key
        ↓ (next build)
Rendered dashboard route /admin/dashboards/[blueprintId]
        ↓
Module unlock overlay (progression)
```

---

## Persistence (planned)

| V1 | V2 |
|----|-----|
| `localStorage` blueprint save | Prisma `UserDashboardLayout` |
| Operator context month | Per-role default layouts |

---

## AI tools

`dashboard-module-recommender`, `dashboard-module-unlock-manager`, `dashboard-complexity-scorer`, `simple-mode-dashboard-builder`, `advanced-mode-dashboard-builder`, plus Sprint 10.5 builder pipeline.

---

## Integration

- **Training layer:** unlock manager gates modules  
- **Copilots:** each copilot lists default module set per level  
- **Command center:** executive summary always available to operator
