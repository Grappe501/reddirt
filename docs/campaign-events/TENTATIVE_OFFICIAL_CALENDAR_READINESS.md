# Tentative / official calendar readiness

## Current state (Sprint 3)

| Lane | DB | Google | Ledger write |
|------|-----|--------|--------------|
| Tentative | `CalendarSource` KELLY_GOOGLE_TENTATIVE | Read via sync-kelly | **Disabled** |
| Official | `CalendarSource` KELLY_GOOGLE_CONFIRMED | Read via sync-kelly | **Disabled** |
| Website intake | `TENTATIVE_CALENDAR` status on row | Not linked by default | N/A |
| Normalized JSON | `IMPORTED_ONLY` calendar status | Optional `sourceId` | N/A |

## Readiness signals on ledger row

- `TENTATIVE_CALENDAR_READY` — `calendarStatus === TENTATIVE_CALENDAR` or `tentativeCalendarId` set
- `OFFICIAL_CALENDAR_READY` — `calendarStatus === OFFICIAL_CALENDAR` or `officialCalendarId` set
- `resolveCalendarLanes()` still lists promotion blockers (review incomplete, Google not linked, etc.)

## Before Sprint 5 (Google write)

All of the following should be green for an event:

1. Operator decision **approved** on fact card
2. City, county, ZIP, travel reviewed
3. Truth status **Google matched** or operator accepts **Imported JSON** / **Website only** path
4. No **GOOGLE_READ_CONFLICT** without override note
5. Kelly lane OAuth healthy on calendar sync dashboard
6. Normalized JSON not stale OR Google ingest newer than JSON file

## Sprint 5 scope (not built)

- `pushCampaignEventToGoogle` or lane-specific promote from ledger
- Populate `officialCalendarId` after human confirm
- `googleSyncStatus: SYNCED` after successful write
- Audit via `EventSyncLog`

Until then, UI shows **Write disabled** on every row.
