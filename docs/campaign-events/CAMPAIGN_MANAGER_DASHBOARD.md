# Campaign manager dashboard — events and travel

**Route:** `/admin/campaign-manager-dashboard`  
**Component:** `CampaignManagerOpsDashboard`  
**Data:** `loadCampaignEventsDashboard(period)` — default `2026-03`; use `?month=2026-04` for April after seed

## Role

Campaign manager command center for event operations, travel snapshot, approval queues, calendar health, and automation readiness scaffolds.

## Sections

1. **Event operations** — workbench, month review, calendar views (timeline/month/week/day/agenda)  
2. **Travel ledger snapshot** — `MonthlyTravelSummaryCard` + missing mileage / unapproved reimbursement stats  
3. **Approval queue** — pending, request info, holds, denials  
4. **Calendar health** — conflicts, work-hours, missing geo fields, tentative vs official counts  
5. **Automation readiness** — links to AI tool package; approval email / host / reminders / packet / compliance scaffolds

## Related routes

| Route | Purpose |
|-------|---------|
| `/admin/campaign-events/workbench` | Batch event review |
| `/admin/workbench` | Legacy CM orchestration hub |
| `/admin/candidate-dashboard` | Candidate-facing summary |
| `/admin/campaign-events/travel-report?month=2026-03` | Monthly travel report |

## CM email

Campaign manager recipient is **not configured** until Steve adds `campaignManagerEmail` in `approval-recipients.ts`.
