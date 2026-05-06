# EMAIL-ANALYTICS-DRILLDOWN-1.0

**Lane:** `RedDirt/` only  
**Goal:** Turn **Analytics & Deliverability** into a richer **operator analysis surface** — drilldowns, bounded tables, next actions, and heuristic readiness scores — while staying **read-only** toward providers.

## Shipped behavior

| Area | Change |
|------|--------|
| **`analytics-operator-drilldown.ts`** | `buildEmailAnalyticsOperatorDrilldown()` — bounded Prisma samples: latest failed send executions, stale queue items (7d+, not CLOSED/ARCHIVED), pending final-approval executions, pending import approvals, failed contact sync runs, unreconciled SendGrid events (metadata lacks `eccReconciliation`). |
| **`analytics/page.tsx`** | Loads **`buildEmailAnalyticsOperatorDrilldown()`** in parallel with **`getEmailCommandCenterSnapshot()`** so other Command Center routes do not pay extra Prisma queries. |
| **`AnalyticsOperatorDrilldownPanels.tsx`** | Client UI: **readiness scores** (inbox, draft, audience, send, deliverability), **cross-surface tables**, per-area **drilldown** blocks with **next action** + **source route** link, nav anchor list. |
| **`AnalyticsDeliverabilityView.tsx`** | Wires drilldown panels; header copy notes this packet; **queue summary grid** removed in favor of drilldown (intelligence stats row retained). |
| **`ecc-operator-ux.tsx`** | Analytics next-action strip mentions drilldown anchors. |

## Hard constraints

- **Read-only** toward SendGrid/Gmail APIs from this packet (existing reconciliation **forms** on Analytics unchanged — operator DB updates only).  
- **No sends** · **no automation activation** · **no new provider calls** from drilldown builders beyond existing Prisma reads.

## Anchors (Analytics route)

- `#analytics-readiness-scores` — five 0–100 heuristic chips.  
- `#analytics-drilldown-queue` · `#analytics-drilldown-drafts` · `#analytics-drilldown-send` · `#analytics-drilldown-sync` · `#analytics-drilldown-suppression` · `#analytics-drilldown-automation` · `#analytics-drilldown-gmail`  
- Existing: `#contact-sync-health`, `#send-execution-preflight`, `#reconciliation`.

## Operator checks

From `RedDirt/`:

- `npm run email:db:diagnose`
- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`

## Ledger impact

- **Analytics / Deliverability** → **~92%** (operator drilldown + tables + scores).  
- **Automation Studio** → **+1** in ledger narrative (policy table reused in Analytics context).  
- **Overall** → **99.5%** maintained.
