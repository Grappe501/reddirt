# Candidate dashboard — events and travel

**Route:** `/admin/candidate-dashboard`  
**Component:** `CandidateCampaignDashboard`  
**Data:** `loadCampaignEventsDashboard(period)` — default `2026-03`; use `?month=2026-04` for April after seed

## Role

Kelly-facing operations hub (admin-authenticated today). Surfaces pending approvals, monthly travel totals, upcoming calendar, action items, and approval-package inbox scaffold.

## Sections

1. **Pending approvals** — counts + links to Month Review Wizard and workbench  
2. **Monthly travel** — `MonthlyTravelSummaryCard` → full travel report  
3. **Upcoming calendar** — next 14 days from Chicago “today”  
4. **Candidate action items** — approve/deny/hold, missing info, travel review, hot wash pending  
5. **Approval package inbox** — preview links (not sent)

## Related routes

| Route | Purpose |
|-------|---------|
| `/admin/campaign-events/review?month=2026-03` | Month Review Wizard |
| `/admin/campaign-events/travel-report?month=2026-03` | Travel ledger report |
| `/admin/calendar-command-center/kelly` | Legacy Kelly cockpit (schedule settlement) |
| `/admin/campaign-calendar/timeline` | Campaign calendar OS |

## Kelly cockpit

`/admin/calendar-command-center/kelly` remains the travel/settlement cockpit. The candidate dashboard is the **campaign-events ledger** entry point; both are linked from nav.
