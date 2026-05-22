# Dashboard + Navigation Operating System (Sprint 9)

**Lane:** `RedDirt/`  
**Status:** V1 functional (May 2026)

## Purpose

Reduce operator overwhelm by unifying Campaign OS navigation, surfacing executive summaries first, and routing workflows through a global AI command palette.

## Architecture

| Layer | Path |
|-------|------|
| Nav config | `src/lib/dashboard-orchestration/campaign-os-nav-config.ts` |
| Operator context | `src/lib/dashboard-orchestration/operator-context-session.ts` |
| Workflow router | `src/lib/dashboard-orchestration/workflow-router-v1.ts` |
| Adaptive dashboards | `src/lib/dashboard-orchestration/adaptive-dashboard-orchestrator.ts` |
| Cognitive load | `src/lib/dashboard-orchestration/operator-cognitive-load-analyzer.ts` |
| Guidance | `src/lib/dashboard-orchestration/workflow-guidance-generator.ts` |
| Executive summary | `src/lib/dashboard-orchestration/executive-summary-builder.ts` |
| Palette routing | `src/lib/dashboard-orchestration/palette-query-router.ts` |
| Bundle loader | `src/lib/dashboard-orchestration/load-dashboard-navigation-bundle.ts` |
| UI shell | `src/components/admin/AdminBoardShell.tsx`, `src/components/admin/navigation/*` |

## Operator entry points

- **Left rail:** workflow groups (Today, Calendar, Approvals, Travel, Reimbursements, Finance, …)
- **Ctrl+K / floating AI button:** global command palette
- **Focus mode:** nav rail toggle — collapses low-priority dashboard cards
- **Executive summary strip:** top of CM/candidate dashboards, workbench, reimbursement, AI command center

## Guardrails

- No autonomous sends, GCal writes, or FIN-1 posts
- Palette and router are **recommend-only**
- Operator context stored in **browser localStorage** (no PII fields)

## Test

```bash
npm run agents:test-dashboard-nav
```

## V2 pathway

- Server-persisted operator context
- Per-role nav ACL
- LLM-enhanced palette routing with same gate matrix
