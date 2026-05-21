# Travel reimbursement workflow (Kelly SOS)

**Active sprint:** 1 — see [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md#sprint-1--reimbursement-go-live-completion) and [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md).

End-to-end operator path for **March, April, and May 2026 month-to-date** travel reimbursement using the **Campaign Event Ledger** (`CampaignEventLedgerRecord`).

## Workflow steps

| Step | Route | Purpose |
|------|--------|---------|
| 1 | `/admin/campaign-events/travel-log?month=YYYY-MM` | **Tentative travel log** — all travel candidates before approval |
| 2 | `/admin/campaign-events/review?month=YYYY-MM&mode=travel_needs_approval` | **Travel approval wizard** — approve, deny, hold, send for more info |
| 3 | `/admin/campaign-events/travel-report?month=YYYY-MM` | **Monthly travel ledger report** — working chronological report + CSV |
| 4 | `/admin/campaign-events/reimbursement?month=YYYY-MM` | **Official reimbursement request** — approved lines only; print / CSV / JSON |

Supporting surfaces:

- `/admin/campaign-events/month-readiness?month=YYYY-MM` — readiness score and quick actions
- `/admin/campaign-events/workbench?month=YYYY-MM` — full event workbench
- `/admin/candidate-dashboard?month=YYYY-MM` — candidate reimbursement cards
- `/admin/campaign-manager-dashboard?month=YYYY-MM` — manager readiness + queues

## Month seeding

```bash
cd RedDirt
npm run campaign-events:seed-march
npm run campaign-events:seed-april
npm run campaign-events:seed-may
# or
npm run campaign-events:seed-month -- 2026-05
```

Source: `data/calendar-command-center/calendar-items.normalized.json`. Seeds are **idempotent** and do not wipe edited `factCard` data. If a month has no JSON rows, the UI stays functional but empty (no fabricated events).

## Review entry paths

From the tentative travel log or travel report:

- **Full month** — `review?month=…&mode=chronological`
- **Travel needing approval** — `mode=travel_needs_approval&autostart=1`
- **Missing mileage** — `focus=missing_mileage&autostart=1`
- **By date range** — `start=YYYY-MM-DD&end=YYYY-MM-DD` (week/day slices)

## Queue behavior (approved / denied)

- **Approved** and **denied** travel decisions are removed from the `travel_needs_approval` queue.
- **Denied** rows remain in the ledger and appear in the reimbursement report **appendix** (excluded from totals).
- **Hold** and **send for more information** stay in the active / needs-info queues until resolved.

## Edit / correction

**Edit / correct** on travel log, travel report, or reimbursement opens:

`/admin/campaign-events/{recordId}?from=travel&month=YYYY-MM`

Saves update the **internal campaign record** only. UI copy: *Google Calendar sync is not enabled yet.*

## Not built (this pass)

- Email send
- Google Calendar write/sync
- FIN-1 bridge
- Compliance / receipt matching packet
- Server-side PDF (browser print is supported)
- Legacy JSON travel-ledger (`/admin/travel-ledger/*`) is separate from this workflow
