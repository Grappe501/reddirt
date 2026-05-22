# Month Review Wizard

**Months:** Any `YYYY-MM` with seeded ledger rows (March + April 2026 pilot). Use `?month=2026-04` after `npm run campaign-events:seed-april`. See `CAMPAIGN_EVENTS_MONTH_SEEDING.md`.

**Route:** `/admin/campaign-events/review`

**Entry:** Workbench → **Start Month Review**

## Query params

| Param | Default | Values |
|-------|---------|--------|
| `month` | `2026-03` | `YYYY-MM` ledger period |
| `mode` | `chronological` | See `MONTH_REVIEW_MODES` in `month-review-types.ts` |

Example: `/admin/campaign-events/review?month=2026-03&mode=unreviewed_only`

## Flow

1. **Setup dashboard** — pick month + queue mode; see counts (total, unreviewed, approved, denied, missing ZIP, etc.).
2. **Begin Review** — one event at a time on a full approval page (not the small modal).
3. **Decisions** — approve / deny / hold / request confirmation / personal / duplicate; optional note.
4. **Auto-advance** — checkbox + `localStorage`; after decision, moves to next event in queue.
5. **Navigation** — previous, skip/next, return to setup.

## Denial retention

- **Denied events are never deleted.**
- Decision stored in `factCard._review` with `eventStatus` typically `CANCELLED`.
- Row remains in `CampaignEventLedgerRecord` and in workbench/calendar views.
- Optional denial/hold reason in `decisionNote`.

## ZIP / county

- `factCard.where.zipCode` — editable on review page; flagged in AI summary when missing.
- County links to `/admin/counties/[slug]` when resolvable via `ARKANSAS_COUNTY_REGISTRY`.

## AI approval summary

Deterministic builder: `approval-summary-builder.ts` (no OpenAI).

Outputs: plain summary, critical missing, blockers, travel/conflict/work-hours lines, recommendation (`likely_approve` | `needs_info` | `hold` | `likely_deny`).

## Any-month support

Loader: `loadCampaignEventsWorkbench({ period: month })`.

March auto-seeds on load; other months (e.g. April) work once records exist — **do not seed April in wizard pass**.

## Region review

`mode=region` uses `ARKANSAS_COUNTY_REGISTRY` region labels when county is known on the row.

## Not built

Email send, GCal sync, bulk approve, April seed, automations.
