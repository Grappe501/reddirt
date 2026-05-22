# May 2026 month-to-date travel review

## Seeding

```bash
cd RedDirt
npm run campaign-events:seed-may
```

Script: `scripts/seed-may-campaign-events.ts` → `seedCampaignEventRecordsForPeriod("2026-05")`.

Rows are taken only from `calendar-items.normalized.json` events whose start date falls in **2026-05**. If the export has no May rows, the script exits successfully with a clear message and **does not fabricate** events.

## URLs (May MTD)

| Surface | URL |
|---------|-----|
| Workbench | `/admin/campaign-events/workbench?month=2026-05` |
| Tentative travel log | `/admin/campaign-events/travel-log?month=2026-05` |
| Travel approval | `/admin/campaign-events/review?month=2026-05&mode=travel_needs_approval&autostart=1` |
| Month review (chronological) | `/admin/campaign-events/review?month=2026-05&mode=chronological` |
| Travel report | `/admin/campaign-events/travel-report?month=2026-05` |
| Official reimbursement | `/admin/campaign-events/reimbursement?month=2026-05` |
| Month readiness | `/admin/campaign-events/month-readiness?month=2026-05` |

## Empty state

When JSON has zero May rows, pages show:

> No calendar rows in normalized JSON for 2026-05 …

Operators can still open all routes; tables are empty until the calendar export is updated and seed is re-run.

## Auto-seed on page load

`loadCampaignEventsWorkbench` calls `ensureCampaignEventRecordsForPeriod` for the requested month, so May rows appear after JSON exists without a separate manual step (explicit seed is still recommended for CI/ops).
