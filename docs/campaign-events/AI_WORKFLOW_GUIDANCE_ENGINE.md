# AI Workflow Guidance Engine

**Sprint 9** — deterministic guidance cards with routes, risk, and confidence.

## Card shape

- Title (plain language)
- Why it matters
- Next step
- Route (`href`)
- Estimated minutes
- Risk level / AI confidence

## Generator

`src/lib/dashboard-orchestration/workflow-guidance-generator.ts`

Uses ledger snapshot blockers (mileage, approvals, calendar stale, promotion failures) plus `workflow-router-v1` recommendations.

## UI

`src/components/admin/navigation/WorkflowGuidanceCards.tsx`

## Observations

- `workflow_guidance_followed` — operator opened linked workflow
- `workflow_guidance_ignored` — dismiss without navigation

## V2

LLM copy refinement; still human-gated execution.
