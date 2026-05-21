# Official travel reimbursement request

## Route

`/admin/campaign-events/reimbursement?month=YYYY-MM`

Examples:

- March 2026: `?month=2026-03`
- April 2026: `?month=2026-04`
- May 2026 MTD: `?month=2026-05`

## What it shows

- Campaign and candidate header (from `constants.ts`)
- Month, reimbursement rate, prepared date
- Month status (operator): **Draft** · **Needs review** · **Ready** · **Finalized** (`data/campaign-events/reimbursement-status.json`)
- Derived report hint: **draft** / **ready** / **empty** from row data when not finalized
- Table: one line per **approved** reimbursable travel event
- Totals: events, miles, reimbursement amount
- Signature blocks (candidate + campaign manager / treasurer)
- **Appendix**: denied / personal / duplicate rows retained but excluded from the total

## Print and download

| Action | Status |
|--------|--------|
| **Print** (browser) | Functional — print stylesheet hides admin chrome |
| **Download CSV** | Functional |
| **Download JSON** | Functional |
| **PDF** | Scaffold only (button disabled) |

## Difference from travel report

| Surface | Includes | Use |
|---------|----------|-----|
| Tentative travel log | All travel candidates | Pre-approval triage |
| Monthly travel report | All travel-related lines + filters | Working ledger / CM review |
| **Official reimbursement request** | Approved reimbursable only + appendix | Submit / print for reimbursement |

## Implementation

- Builder: `src/lib/campaign-events/travel-reimbursement/reimbursement-report.ts`
- UI: `src/components/admin/campaign-events/travel-reimbursement/OfficialReimbursementReport.tsx`
