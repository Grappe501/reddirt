# EMAIL-AUTOMATION-POLICY-DETAILS-1.0

**Lane:** `RedDirt/` only  
**Goal:** Make **Automation Studio** explainable for every **non-send** automation policy — what each policy watches, recommends, will never do, where data comes from, current eval status, and where to act next — without workers, cron, sends, or contact/audience mutation.

## Shipped behavior

| Area | Change |
|------|--------|
| **`automation-policy-details.ts`** | `AUTOMATION_POLICY_EXPLAIN_BY_ID` — static explainability copy keyed by **`AutomationPolicyId`** (all registry policies, including **`suppressions_before_send`**). |
| **`AutomationPolicyDetailAccordions.tsx`** | Client accordions under **`#automation-policy-details`**; each policy has **`#policy-detail-{id}`** for deep links; on load / **`hashchange`**, matching **`#policy-detail-…`** opens that **`<details>`** and scrolls into view; jump nav; live status from **`automationPolicyEval`** rows (**`detailSafe`**, **`recommendedActionSafe`**, status pill); **Route to act** uses eval **`href`**. |
| **`AutomationStudioView.tsx`** | Header anchor **`#automation-policy-top`**; section wires detail accordions; primary control labeled **Revalidate snapshot (read-only)** with governance note. |
| **`automation-policy-eval-actions.ts`** | Documented as **`revalidatePath`** only (no evaluation jobs, no sends). |
| **`DailyOperatorConsoleView.tsx`** | **Top automation policy warnings** — up to **3** non-OK policies (alert before warn); links to **`/admin/workbench/email-command-center/automation#policy-detail-{id}`**; **all OK** empty state; next-actions mention strip. |
| **`ecc-operator-ux.tsx`** | Automation / Daily surfaces reference policy detail anchors and revalidate-only posture. |

## Policy registry (explainability + eval)

All ids in **`automation-policies.ts`** have explain rows, including:

- Stale queue item  
- Shared draft needs review  
- Send packet ready but not preflighted  
- Approved sync not executed  
- Failed sync needs review  
- Unreconciled events  
- Gmail watch expiring  
- Hosted DB not verified  
- Suppressions before send (governance advisory)

## Hard constraints

- **No background workers** · **no cron activation** · **no sends** · **no contact mutation** · **no audience mutation**.  
- **Evaluate / revalidate** = server **revalidate** of the Command Center tree only — refreshes snapshot-backed UI, does **not** run a separate policy job or write policy state.

## Anchors

- **`/admin/workbench/email-command-center/automation#automation-policy-top`** — top of Automation Studio.  
- **`#automation-policy-details`** — explainability section.  
- **`#policy-detail-{id}`** — per-policy accordion (exact ids match **`AutomationPolicyId`** in code).  
- **Daily** links use full path **`…/automation#policy-detail-…`**.

## Operator checks

From `RedDirt/`:

- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`

## Ledger impact

- **Automation Studio** → **~92%** (explainability + Daily top-3 integration).  
- **Daily Operator Console** — copy and next-actions aligned with policy deep links (**polished** triage strip).  
- **Overall** → **99.5%** maintained unless a separate packet moves deployment proof.
