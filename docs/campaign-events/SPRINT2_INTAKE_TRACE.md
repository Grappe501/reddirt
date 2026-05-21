# Sprint 2 — Intake trace audit

**Lane:** `RedDirt/` · **Sprint:** Website intake → Campaign Event OS ledger

## Public surface

| Route | Component / handler |
|-------|---------------------|
| `/(site)/schedule` | `ScheduleCampaignEventForm` |
| `POST /api/forms/schedule-campaign-event` | Zod body → assistant → `persistPublicScheduleRequest` |

Honeypot field `website` returns `{ ok: true, accepted: true }` without persistence.

## API persist path

1. `persistPublicScheduleRequest` → DB or staged JSON fallback
2. `persistPublicScheduleToDatabase`:
   - Upsert `User` by email
   - `Submission` (`type: public_schedule_request`, `structuredData`)
   - `WorkflowIntake` (`source: public_schedule_request`, metadata includes assistant)
   - `EventRequest` (`OPEN`, tentative times from assistant)
   - **`bridgeWebsiteIntakeToLedger`** (Sprint 2) → `CampaignEventLedgerRecord`

## Staging fallback

`data/calendar-command-center/public-schedule-requests.staged.json` when DB write fails. Staged rows **do not** get ledger rows until replayed into DB.

## Fields collected (public form)

From `scheduleCampaignEventBodySchema`:

- Requester: name, organization, email, phone, permissionToContact
- Event: title, eventType, county, city, address
- Schedule: preferredDate, alternateDates, preferredStart/End, flexibility
- Audience: audienceSize, eventPurpose, visibility, press flags, localIssueAngle
- Logistics: speakingRequested, localHostAvailable, notes

**Persisted:** submission `structuredData`, intake metadata, event request location/details, assistant `recommendedTentativeEvent`, route miles estimate.

**Not on ledger row directly:** honeypot, raw alternateDatesText (merged server-side).

## Normalization before DB

- `toPersistedPublicScheduleBody` / `normalizeScheduleCampaignEventBody`
- County resolution via `resolveCountyFromText`
- Assistant: `runPublicSchedulingAssistant` (availability + staff flags)

## Pre–Sprint 2 gap (resolved)

| Layer | Before | After Sprint 2 |
|-------|--------|----------------|
| WorkflowIntake | ✅ | ✅ |
| EventRequest | ✅ | ✅ + `metadata.campaignEventLedgerRecordId` |
| CampaignEventLedgerRecord | ❌ | ✅ idempotent `website_entry:{workflowIntakeId}` |
| Workbench visibility | Shadow calendar only | Synthetic calendar from ledger + `load-workbench-events` |
| Month review / travel | No ledger row | Full row in queues with intake filters |

## Duplicate paths (intentional)

- **Command center shadow:** `public-schedule-shadow-items.ts` (calendar JSON UI)
- **Ledger truth:** `CampaignEventLedgerRecord` with `entrySource: WEBSITE_ENTRY`
- **Legacy EventRequest queue:** still used; linked via metadata

Future: converge shadow → ledger drilldown only.

## Inferred gaps (operator)

- ZIP often missing until address parsed or operator fills fact card
- Exact start time when `campaign_suggests` and no assistant window → placeholder date (2099-01-15) flagged in inference `missingFields`
- Google Calendar IDs empty until Sprint 3–5 (`googleSyncStatus: NOT_LINKED`)

## Migration notes

- Existing intakes without ledger: run `npm run campaign-events:test-intake-bridge` to list; optional one-off backfill via `bridgeWebsiteIntakeToLedger` inputs from intake metadata (not automated in this pass).
- Never change `sourceKey` format for existing website rows.

## Key files

- `src/lib/forms/public-schedule-persist.ts`
- `src/lib/campaign-events/intake/intake-ledger-bridge.ts`
- `src/lib/campaign-events/load-workbench-events.ts`
- `src/lib/campaign-events/intake/website-intake-calendar.ts`
