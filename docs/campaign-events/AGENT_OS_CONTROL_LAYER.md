# Agent OS Control Layer

**Lane:** `RedDirt/`  
**Code:** `src/lib/agents/os-control/`  
**UI:** `/admin/ai-command-center` → Campaign OS Control Layer panel

## Control loop

```
Observe → Interpret → Plan → Recommend → Prepare → Human Approve → Execute (gated) → Audit → Learn
```

## Modules

| Module | Role |
|--------|------|
| `campaign-os-state-snapshot.ts` | Cross-domain health, blockers, safe/gated/forbidden actions |
| `os-workflow-planner.ts` | Multi-step operating plans with routes + tools |
| `agent-action-preparer.ts` | Prepared-only packages (packets, plans, previews) |
| `human-approval-gate-matrix.ts` | What agent may never execute |
| `tool-execution-readiness.ts` | Catalog → canRead / canPrepare / canExecute |
| `load-os-control-bundle.ts` | Command center aggregator |

## Domain plug-in

Each domain feeds the snapshot:

- **intake** — website intake counts  
- **calendar** — sync stale, promotion ready  
- **approval** — pending approvals  
- **travel** — queues, mileage gaps  
- **reimbursement** — derived month status  
- **finance** — exceptions, pending receipts  
- **hot_wash / county_memory** — learning snapshot  
- **agent** — observations + runtime audit  

## Test

```bash
npm run agents:test-os-control
```

See also: `CAMPAIGN_OS_AUTONOMY_BOUNDARIES.md`
