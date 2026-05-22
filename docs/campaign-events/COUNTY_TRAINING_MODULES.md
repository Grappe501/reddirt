# County Training Modules (V2)

**Data:** `src/lib/agents/training/training-modules-data.ts`  
**Registry:** `src/lib/agents/training/training-module-registry.ts`

## V2 modules (10)

| ID | Title |
|----|-------|
| `tr-county-read-dashboard-v2` | Read a county dashboard |
| `tr-county-kpi-v2` | Use county KPIs |
| `tr-county-po5-interpret-v2` | Interpret Power of 5 targets |
| `tr-county-event-plan-v2` | Plan a county event |
| `tr-brief-kelly-county-v2` | Brief Kelly on a county |
| `tr-county-volunteer-gaps-v2` | Identify volunteer gaps |
| `tr-hotwash-county-memory-v2` | Hot wash → county memory |
| `tr-county-comms-intel-v2` | County intelligence for communications |
| `tr-intern-county-data-v2` | Intern county data help |
| `tr-field-prioritize-counties-v2` | Field managers prioritize counties |

Modules unlock county dashboard blocks via `unlocksDashboardModules`.

## Test

`npm run agents:test-county-copilots`
