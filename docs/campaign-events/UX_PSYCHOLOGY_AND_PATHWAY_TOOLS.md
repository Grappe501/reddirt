# UX psychology and pathway tools

**Code:** `src/lib/agents/ux-intelligence/microcopy-registry.ts`  
**UI:** `MicrocopyHint` component

## Microcopy registry

Terms: tentative_event, official_event, reimbursement, sync_stale, readiness_score, approval_package, etc.

`getMicrocopy(term, role?)` returns short tooltip + expanded explanation + optional related route.

## Surfaces (V1)

- Month readiness
- Calendar sync dashboard
- (extend to reimbursement, workbench)

## Tool contracts

`user-friction-detector`, `dashboard-overwhelm-detector`, `progressive-disclosure-advisor`, `hover-help-router`, `new-user-onboarding-guide`, etc.

All V1 deterministic/scaffold — no autonomous UI changes.
