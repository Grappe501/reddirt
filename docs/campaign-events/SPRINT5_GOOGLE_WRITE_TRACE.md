# Sprint 5 — Google write surface trace

**Lane:** `RedDirt/`  
**Purpose:** Audit every path that mutates Google Calendar before opening the Event OS promotion lane.

---

## What writes exist already?

| Surface | Path | Mutates Google? | Safe to reuse? | Risk |
|---------|------|-----------------|----------------|------|
| `pushCampaignEventToGoogle` | `src/lib/calendar/google-sync-engine.ts` | Yes — `upsertGoogleEvent` | **Partial** — legacy `CampaignEvent` model, not ledger-first | Auto-routing via `selectOutboundCalendarSource`; can delete old copy on lane move |
| `pushCampaignEventToGoogleSafe` | same file | Yes (wrapped) | Same | Fire-and-forget from lifecycle hooks |
| `kelly-sync-campaign-event-google` | `src/lib/calendar/kelly-sync-campaign-event-google.ts` | Yes | Kelly lane forcing | Falls back to legacy push |
| `event-lifecycle.ts` | `src/lib/calendar/event-lifecycle.ts` | Yes (void safe push) | **Dangerous for Event OS** | Multiple workflow transitions trigger background push |
| `calendar-hq-actions.ts` | `src/app/admin/calendar-hq-actions.ts` | Yes | Admin HQ only | Operator-initiated, separate UI |
| `promote-approved-kelly-events.ts` | `scripts/google-calendar/promote-approved-kelly-events.ts` | Yes | CLI batch | `npm run calendar:google:promote-approved` — not wired to Event OS UI |
| **`promoteLedgerEventToGoogle`** | `src/lib/campaign-events/calendar-promotion/promote-ledger-event.ts` | Yes (gated) | **Sprint 5 authority** | Human + `GOOGLE_CALENDAR_WRITE_ENABLED` + readiness |

## What is safe to reuse?

- `upsertGoogleEvent` / `deleteGoogleEvent` — `src/lib/integrations/google/calendar.ts`
- Kelly policy helpers — `findKellyTentativeCalendarSource` / `findKellyConfirmedCalendarSource` in `kelly-google-calendar-policy.ts`
- OAuth refresh on `CalendarSource.oauthJson.refresh_token`
- Payload shaping patterns from `toGoogleEventBody` (legacy) — Sprint 5 uses `build-google-payload.ts` + `previewToGoogleEventBody`

## What is dangerous?

- Any **automatic** call to `pushCampaignEventToGoogleSafe` from ledger approval (blocked by `approval-google-write-blocker` on approval paths)
- Running `calendar:google:promote-approved` without per-event human review
- Promoting to **official** while a **tentative** Google copy still exists (v1 may leave duplicate on tentative calendar — document limitation)
- Missing env / expired refresh token → partial failure; ledger preserved, audit logged

## Duplicate creation risk

- Re-promote same lane without existing `tentativeGoogleEventId` / `officialGoogleEventId` → new Google event
- Legacy push uses `event.googleEventId` upsert; ledger promotion stores IDs on `factCard._calendarPromotion`
- Readiness checker flags duplicate-excluded decisions and schedule conflicts; `duplicate-google-event-detector` is heuristic v1

## Tentative vs official calendars

| Lane | Kelly source finder | Ledger fields |
|------|---------------------|---------------|
| Tentative | `findKellyTentativeCalendarSource` | `tentativeGoogleEventId`, `tentativePromotedAt` |
| Official | `findKellyConfirmedCalendarSource` | `officialGoogleEventId`, `officialPromotedAt` |

Env gates: `GOOGLE_CALENDAR_WRITE_ENABLED` (Sprint 5), separate from Sprint 3 sync dashboard `writeEnabled: false` (read-only truth UI).

## What bypasses Event OS today?

- Legacy `CampaignEvent` lifecycle → `pushCampaignEventToGoogleSafe`
- Calendar HQ admin actions
- CLI `calendar:google:promote-approved`
- Public site publishing hooks in `kelly-sync-campaign-event-google`

Sprint 5 **does not** disable legacy paths; it adds the **first human-controlled ledger promotion workbench**.
