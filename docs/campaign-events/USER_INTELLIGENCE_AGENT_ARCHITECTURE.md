# User intelligence agent architecture

**Sprint:** Agent Intelligence 1  
**Code:** `src/lib/agents/user-intelligence/`

## Components

| Module | Purpose |
|--------|---------|
| `user-personas.ts` | 12 roles — goals, friction, density, overwhelm rules |
| `user-observations.ts` | 22 UX observation events; global JSON log |
| `next-action-engine.ts` | Deterministic primary + secondary actions |
| `load-next-actions.ts` | Server helper for pages |

## UI

- `AgentNextActionPanel` on candidate/CM dashboards, month readiness, calendar sync
- Observations also append to `factCard._aiObservations` when record-scoped (via extended `AiObservationEvent`)

## Rules

- Internal campaign ops only — no external analytics
- No voter manipulation or hidden tracking
- Suggestions only — human clicks routes
