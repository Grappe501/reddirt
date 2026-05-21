# Sprint 3 — Google Calendar trace audit

**Lane:** `RedDirt/` · Read/sync truth only (no ledger write to Google)

## What reads live Google Calendar?

| Path | Role |
|------|------|
| `src/lib/integrations/google/calendar.ts` | OAuth + Calendar API list/get/upsert/delete |
| `src/lib/calendar/google-sync-engine.ts` | `runIncrementalIngestForSource`, `fullListEstablishSyncToken`, `processInboundGoogleEvent` |
| `scripts/google-calendar/sync-kelly-campaign-calendars.ts` | CLI: `npm run calendar:google:sync-kelly` |
| `src/app/admin/calendar-command-center/cockpit-actions.ts` | Admin incremental ingest (server action) |
| `/api/admin/google-calendar/*` | OAuth connect + webhook hooks |

**Inbound read** populates `GoogleCalendarEventRecord` and may link/create `CampaignEvent` — **not** `CampaignEventLedgerRecord` directly.

## What writes to Google Calendar?

| Path | Role |
|------|------|
| `pushCampaignEventToGoogle` | Outbound write from `CampaignEvent` |
| `scripts/google-calendar/promote-approved-kelly-events.ts` | `npm run calendar:google:promote-approved` |
| Kelly cockpit actions | Promote tentative → confirmed |

**Sprint 3 / Event OS:** All write paths remain **disabled** from ledger UI. Operators see `WRITE_NOT_ENABLED` / “Write disabled” badges.

## Tables

| Model | Use |
|-------|-----|
| `CalendarSource` | OAuth, `externalCalendarId`, sync tokens, Kelly tentative/confirmed lanes |
| `GoogleCalendarEventRecord` | Ingested Google events (read mirror) |
| `CampaignEvent` | Legacy/public campaign event workflow + outbound sync target |
| `CampaignEventLedgerRecord` | **Event OS truth** — seeded from normalized JSON + website intake |
| `EventSyncLog` | Push/pull audit for `CampaignEvent` |
| `KellyCalendarDecision` | Command-center settlement (parallel to ledger) |

## Relation to CampaignEvent

- Google ingest creates/updates `CampaignEvent` rows and links `GoogleCalendarEventRecord.campaignEventId`.
- Ledger rows are seeded separately via `ensureCampaignEventRecordsForPeriod` from `calendar-items.normalized.json` (`sourceKey: normalized_calendar:{id}`).
- **Gap (documented):** GCal ingest does not auto-upsert ledger; operators run seed after sync.

## Relation to CampaignEventLedgerRecord

- Fields: `googleEventId`, `googleSyncStatus`, `tentativeCalendarId`, `officialCalendarId`, `googleLastSyncedAt`, `googleEventUrl`
- Sprint 3 adds **computed** truth in `factCard._calendarSync` pattern + row fields `calendarTruthStatus` / `calendarSync` on workbench load (no silent DB write).

## Normalized JSON path

| Step | Location |
|------|----------|
| Source workbook / reconcile | `scripts/travel-calendar-xlsx-reconcile.ts` (and related calendar-command-center pipeline) |
| Output file | `data/calendar-command-center/calendar-items.normalized.json` |
| Loader | `src/lib/campaign-events/load-march-events.ts` |
| Ledger seed | `npm run campaign-events:seed-month -- YYYY-MM` → `seedCampaignEventRecordsForPeriod` |

## Env / constants

- `getGoogleCalendarEnv()` / `isGoogleCalendarConfigured()` — `src/lib/calendar/env.ts`
- Kelly lane names — `src/lib/calendar/kelly-google-calendar-constants.ts`
- Package scripts — `calendar:google:ensure`, `sync-kelly`, `list-sources`, `promote-approved`

## Safe to reuse (Sprint 3)

- Read ingest: `runIncrementalIngestForSource`
- Source status: `google-calendar-source-status.ts`
- CLI sync + seed commands on operator machine
- `GoogleCalendarEventRecord` for match priority `googleEventId`

## Do not reuse without approval

- `pushCampaignEventToGoogle` from ledger approval (Sprint 5)
- `promote-approved-kelly-events` from Event OS UI
- Auto-publish public ingest (`GOOGLE_CALENDAR_AUTO_PUBLISH_PUBLIC_FACING`)

## Key new files (Sprint 3)

- `src/lib/campaign-events/calendar-sync/*`
- `/admin/campaign-events/calendar-sync`
- `npm run campaign-events:verify-calendar-sync`
