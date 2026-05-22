# Monthly Travel Ledger Report

**Route:** `/admin/campaign-events/travel-report?month=YYYY-MM`  
**Default month (launch):** `2026-03`  
**Example:** `/admin/campaign-events/travel-report?month=2026-03`

## Audience

Candidate and campaign manager review (admin-authenticated today). Same data surfaces as workbench; read-only report with totals.

## Inclusion rules

A row appears if any of:

- Round-trip miles on record or fact card  
- Reimbursement amount present  
- Travel origin or destination (assumed or override)  
- Physical campaign event classification (house M&G, fair, fundraiser, etc.)  
- Non-cancelled in-person campaign types needing travel review  

## Columns

| Column | Source |
|--------|--------|
| Date / time | Ledger `startAt` + calendar |
| Event title | Calendar title → drilldown link |
| City / county | Fact card + calendar |
| Origin / destination | Travel section + default origin rules |
| Miles | `roundTripMiles` or fact card |
| Rate | `CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE` (0.70) unless override |
| Reimbursement | DB or miles × rate |
| Review / decision | `reviewStatus`, `_review.decision` |

## Filters (client)

- All travel candidates  
- Approved only  
- Needs travel info (missing city, county, or mileage)  
- Reimbursable only (miles > 0)

## Footer totals

- Event count  
- Total miles / reimbursement  
- Approved miles / reimbursement  
- Needs review count  

## Deterministic summary (top)

Narrative + bullets for missing city/county/mileage, unapproved reimbursement, work-hours warnings, Tuesday/Friday Little Rock origin count. **No OpenAI.**

## Export

| Control | Status |
|---------|--------|
| Export CSV | **Functional** — client-side download of filtered rows |
| Export PDF | Scaffolded (disabled) |
| Send to Candidate / CM | Scaffolded (disabled) |
| Attach to Reimbursement Packet | Scaffolded (disabled) |

## Dashboard links

- **Candidate dashboard** — `/admin/candidate-dashboard`  
- **Campaign manager dashboard** — `/admin/campaign-manager-dashboard`  
- Workbench — `/admin/campaign-events/workbench`  
- Month review — `/admin/campaign-events/review?month=YYYY-MM`  
- Kelly cockpit — `/admin/calendar-command-center/kelly`  
- Legacy CM workbench — `/admin/workbench`  
- Legacy JSON travel ledger — `/admin/travel-ledger`  
- Campaign calendar nav — Travel report + Candidate + CM chips on all calendar views

## Send scaffold (top of report)

`TravelReportSendScaffold` shows default candidate emails and disabled send buttons. See `APPROVAL_RECIPIENTS_AND_EMAIL_SCAFFOLD.md`.

## Summary card reuse

`MonthlyTravelSummaryCard` appears on travel report, candidate dashboard, and campaign manager dashboard.

## Report → reimbursement roadmap

1. **Now:** Monthly report + CSV for operator review.  
2. **Next:** Tie approved rows to compliance reimbursement packet (FIN bridge — not built).  
3. **Later:** PDF packet, email to candidate/CM, receipt attachment dashboard.  
4. **Blocked:** April ingestion, FIN-1, automated email — per launch constraints.

## Code map

- `src/lib/campaign-events/travel-report/travel-report-logic.ts`  
- `src/components/admin/campaign-events/travel-report/MonthlyTravelReport.tsx`  
- `src/app/admin/(board)/campaign-events/travel-report/page.tsx`
