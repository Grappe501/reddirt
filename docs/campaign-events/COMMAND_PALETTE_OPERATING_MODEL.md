# Command Palette Operating Model

**Sprint 9** — primary plain-language entry point for Campaign OS.

## Access

- Floating **AI** button (bottom-right)
- **Ctrl+K** (Cmd+K on Mac)
- Inline `AgentCommandPalette` on key pages (retained)

## Flow

1. Operator enters plain-language query
2. **Deterministic router** (`palette-query-router.ts`) via server action — reimbursement, approval, calendar, blockers
3. If no match → **campaign agent runtime** (existing Sprint 3 router, human-gated)

## Example

Query: `Close March reimbursement`

Returns:

- Blockers (mileage, travel review, pending approvals)
- Links: reimbursement, travel report, month readiness, candidate dashboard
- Readiness hint (printable vs not)

## Server action

`src/app/admin/dashboard-nav/actions.ts` → `routeCampaignPaletteQueryAction`

## Guardrails

- Read-only routing
- No autonomous execution
- Observation: `ai_command_palette_used`, `navigation_shortcut_used`

## V2

LLM intent + same gate matrix; prepared action bundles from OS control layer.
