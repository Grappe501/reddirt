# Google Calendar truth layer

## Purpose

Operators can see, per ledger event:

- Data from **website intake**, **normalized JSON**, or **Google read mirror**
- Whether Google read is **matched**, **stale**, or **conflicting**
- That **write/promotion is disabled** until Sprint 5

## Truth statuses

Computed at load time via `matchCalendarTruthToLedger` + `resolveLedgerCalendarSync`:

| Status | Meaning |
|--------|---------|
| `NOT_LINKED` | No Google id and no ingest row |
| `IMPORTED_FROM_NORMALIZED_JSON` | Ledger from normalized export only |
| `WEBSITE_ENTRY_ONLY` | Public schedule bridge, no Google match |
| `GOOGLE_READ_MATCHED` | `GoogleCalendarEventRecord` aligns with ledger |
| `GOOGLE_READ_STALE` | Google or JSON freshness warning |
| `GOOGLE_READ_CONFLICT` | Title/date mismatch vs ingest |
| `TENTATIVE_CALENDAR_READY` | Tentative lane / id on row |
| `OFFICIAL_CALENDAR_READY` | Official lane / id on row |
| `WRITE_NOT_ENABLED` | Shown as badge on all rows (policy) |
| `ERROR` | `googleSyncStatus === ERROR` or match error |

Stored optionally under `factCard._calendarSync` when persisted; UI uses live computation.

## Match priority

1. `googleEventId` exact (ledger or normalized `sourceId`)
2. `calendarSourceId` / normalized item id
3. `sourceKey` (`normalized_calendar:*` / `website_entry:*`)
4. Same date + similar title
5. Same date + city + title

Does **not** overwrite fact card fields.

## Surfaces

- `/admin/campaign-events/calendar-sync` — operator dashboard
- Workbench — badges + filters + JSON freshness banner
- Event drilldown — `CalendarSyncTruthPanel`
- Campaign calendar views — alerts via `buildCalendarEventFlags`
- Candidate / CM dashboards — summary stat cards

## Prisma fields (existing)

`CampaignEventLedgerRecord`: `googleEventId`, `googleSyncStatus`, `tentativeCalendarId`, `officialCalendarId`, `googleLastSyncedAt`, `googleEventUrl`

No migration in Sprint 3.
