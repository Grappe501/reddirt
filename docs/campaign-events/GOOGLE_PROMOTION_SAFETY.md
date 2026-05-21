# Google promotion safety

## Human control (absolute)

1. Operator chooses **tentative** or **official** lane
2. Operator reviews **payload preview** (title, time, location, description, calendar target)
3. Operator clicks **Promote** (or **Promote acknowledge warnings**)
4. No cron, webhook, or AI agent may call write APIs

## Environment gates

| Variable | Default | Effect |
|----------|---------|--------|
| `GOOGLE_CALENDAR_WRITE_ENABLED` | off | Blocks all live writes; dry-run still logs audit |
| Kelly `CalendarSource` OAuth | per DB row | `calendar-lane-health-checker` / `official-calendar-safety-blocker` |

Sprint 3 sync UI remains **read-only** (`writeEnabled: false` in sync meta). Promotion uses a **separate** write gate intentionally.

## AI boundaries

- Allowed: readiness summary, risk summary, payload draft, lane suggestion, conflict warnings
- Forbidden: autonomous `promoteLedgerEventToGoogle`, auto-retry without human, official lane when config unhealthy

## Rollback / failure behavior

- Google API failure: ledger row **preserved**; `promotionError` + audit `promotion_failed`
- Dry-run: no `upsertGoogleEvent`; audit `dry_run` / `promotion_attempted`
- Retry: same record, increments `promotionAttemptCount`
- Never deletes local fact card on failed push

## `official-calendar-safety-blocker`

Blocks official promotion when:

- Write env disabled
- Official Kelly source missing or OAuth not ready
- Readiness `BLOCKED`

Implemented in `sprint5-tool-helpers.ts` and enforced in `promote-ledger-event.ts`.
