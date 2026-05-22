# Campaign Event Ledger — month seeding

**Source:** `data/calendar-command-center/calendar-items.normalized.json`  
**Core:** `src/lib/campaign-events/persistence/seed-period.ts`

## Commands

| Command | Purpose |
|---------|---------|
| `npm run campaign-events:seed-march` | Upsert March 2026 (`2026-03`) |
| `npm run campaign-events:seed-april` | Upsert April 2026 (`2026-04`) |
| `npm run campaign-events:seed-month -- 2026-04` | Any `YYYY-MM` with JSON rows |

Equivalent:

```powershell
cd H:\SOSWebsite\RedDirt
npx tsx scripts/seed-campaign-events-month.ts 2026-04
```

## Idempotent behavior

- Upsert key: `sourceKey` from normalized calendar `id`
- **Re-run** updates title, times, location, source metadata
- **Does not** overwrite `factCard` on existing rows (preserves review edits)
- **Does not** delete rows or create duplicates

## Auto-seed on page load

Opening workbench, month review, travel report, or dashboards for a month with JSON data runs `ensureCampaignEventRecordsForPeriod` automatically (same upsert rules).

Campaign calendar surface auto-seeds **March + April** pilot periods on load.

## April 2026 verification (normalized JSON)

| Metric | Value |
|--------|-------|
| Calendar rows in JSON | 37 (36 unique `id` — one duplicate id in source file) |
| Ledger rows after seed | 36 |
| Event types | community_event 18, county_party_meeting 8, campaign_event 6, personal_admin 3, virtual_statewide 2 |
| Missing city (merged) | 32 |
| Missing county | 21 |
| With travel line / miles | 4 |
| Needs mileage review | 36 |
| Work-hours warnings | 3 |
| Schedule conflicts | 9 |

Run `npm run campaign-events:seed-april` for live DB verification output (missing city/county, travel, conflicts).

## URLs after April seed

| Surface | URL |
|---------|-----|
| Workbench | `/admin/campaign-events/workbench?month=2026-04` |
| Month review | `/admin/campaign-events/review?month=2026-04&mode=chronological` |
| Travel report | `/admin/campaign-events/travel-report?month=2026-04` |
| Candidate dashboard | `/admin/candidate-dashboard?month=2026-04` |
| CM dashboard | `/admin/campaign-manager-dashboard?month=2026-04` |

Use **Month** chips (March 2026 / April 2026) on each surface to switch.

## Month readiness (close checklist)

`/admin/campaign-events/month-readiness?month=2026-04` — see `MONTH_READINESS_AND_APRIL_COMPLETION.md`. Finish April here before May seed.

## March / April review workflow

1. Seed month (`seed-march` / `seed-april`)
2. Open workbench with `?month=YYYY-MM`
3. **Start Month Review** or `/review?month=…`
4. Open travel report for mileage totals
5. Candidate / CM dashboards use same `?month=` parameter
