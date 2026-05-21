# Google Calendar promotion workflow (Event OS)

## Lifecycle

1. Website / operator intake → ledger row (`WEBSITE_ENTRY_ONLY` / `TENTATIVE_INTERNAL`)
2. Approval workflow (Sprint 4) — **no Google write** on approve
3. `READY_FOR_TENTATIVE_PROMOTION` when approved + readiness passes
4. Operator opens **Calendar promotion workbench** → reviews readiness + payload preview
5. Explicit **Promote to tentative** → `upsertGoogleEvent` → `PROMOTED_TO_TENTATIVE`
6. After tentative promotion, `READY_FOR_OFFICIAL_PROMOTION` when official readiness passes
7. Explicit **Promote to official** → `PROMOTED_TO_OFFICIAL`
8. Failures → `PROMOTION_FAILED` with `promotionError` + audit log; retry via workbench

## Routes

| Route | Role |
|-------|------|
| `/admin/campaign-events/calendar-promotion` | Promotion command center |
| `/admin/campaign-events/calendar-sync` | Read-only sync truth + link to promotion |
| `/admin/campaign-events/[recordId]` | Drilldown + promotion audit panel |
| `/admin/campaign-events/ai-tools` (Sprint 5 tab) | Tool contracts + pipeline |

## Server actions

`calendar-promotion-actions.ts`: `previewPromotionPayloadAction`, `promoteLedgerEventAction`, `dryRunPromotionAction`

## Storage (additive, no Prisma migration)

- `factCard._calendarPromotion` — status, Google IDs, timestamps, errors
- `factCard._calendarPromotionLog` — append-only audit (max 100)
- `factCard._aiObservations` — promotion observation events

## Dry-run / testing

```bash
cd RedDirt
npm run campaign-events:test-calendar-promotion -- --dry-run
```

Optional `--live` only when `GOOGLE_CALENDAR_WRITE_ENABLED=true` and Kelly OAuth sources are healthy (staging calendars recommended).

## Future automation boundaries

- No background promotion jobs in Sprint 5
- No reply-by-email or SMS triggers
- AI may summarize, warn, and draft payloads — **never** call `promoteLedgerEventToGoogle` without human click
