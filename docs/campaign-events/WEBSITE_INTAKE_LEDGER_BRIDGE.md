# Website intake → ledger bridge

## Trigger

On successful `persistPublicScheduleToDatabase`, after `EventRequest` is created.

## Idempotency

| Key | Value |
|-----|--------|
| `sourceKey` | `website_entry:{workflowIntakeId}` |
| `calendarSourceId` | `website_intake:{workflowIntakeId}` |

`findUnique({ sourceKey })` — if present, return existing record (no duplicate ledger rows on retry).

## Default ledger state

| Field | Value |
|-------|--------|
| `entrySource` / `createdFromSource` | `WEBSITE_ENTRY` |
| `eventStatus` | `TENTATIVE` |
| `calendarStatus` | `TENTATIVE_CALENDAR` |
| `reviewStatus` | `NOT_STARTED` |
| `googleSyncStatus` | `NOT_LINKED` |
| `sourceCalendarName` | `Website intake (tentative)` |

Operator “needs review” is tracked in `factCard._review.intakeReviewStatus` and UI badges (not a separate Prisma enum).

## Fact card payload

- Core sections seeded from form + assistant
- `_intake`: duplicate/conflict assessment, deterministic inference, summary, recommended next action
- `_review.websiteIntake: true`

## API response (database mode)

`POST /api/forms/schedule-campaign-event` adds:

- `campaignEventLedgerRecordId`
- `ledgerCreated`
- `ledgerDuplicateRisk`
- `ledgerScheduleConflict`

## Workbench load

Rows without normalized JSON calendar match use `buildWebsiteIntakeCalendarItem(record)` so website events appear in workbench, month review, and travel surfaces.

## Google Calendar readiness (no writes)

Schema fields reserved: `tentativeCalendarId`, `officialCalendarId`, `googleSyncStatus`, `googleLastSyncedAt`. Sprint 3–5 will populate on promote/sync.

## Verification

```bash
cd RedDirt
npm run campaign-events:test-intake-bridge
```
