# Month readiness and April completion

**Route:** `/admin/campaign-events/month-readiness?month=YYYY-MM`  
**April default:** page opens with `2026-04` when `month` is omitted.

## Purpose

Show what must be completed before a ledger month is operationally closed. Steve uses this for **April completion before May seed**.

## Readiness score (deterministic)

Per active event, weighted checks:

- Decision recorded (approve/deny/hold/request)
- City, county, ZIP (ZIP for physical event types)
- Mileage + reimbursement for travel candidates
- Conflicts / work-hours “cleared” when a decision exists

Month score = earned ÷ possible × 100.

| Score | Band |
|-------|------|
| 0–49% | Not ready |
| 50–79% | In progress |
| 80–94% | Nearly ready |
| 95–100% | Ready for month close |

**May handoff gate:** 80% (shown on Move-to-May panel). Target **95%** for month close.

## Queue links

Issue counts link to Month Review with `mode` + optional `focus`:

| Issue | URL pattern |
|-------|-------------|
| Missing city | `review?month=…&mode=needs_info&focus=missing_city` |
| Missing county | `…&focus=missing_county` |
| Missing ZIP | `…&focus=missing_zip` |
| Missing mileage | `…&mode=reimbursable&focus=missing_mileage` |
| Conflicts | `…&mode=conflicts` |
| Work-hours | `…&mode=work_hours` |
| Unreviewed | `…&mode=unreviewed_only` |

## April duplicate source JSON

Normalized file has **37** April rows and **36** unique calendar `id`s. Seed upserts by `sourceKey` (calendar id) — **one duplicate id does not create two DB rows**. Readiness page lists duplicate id, titles, and dates when present.

## Quick-fix throughput (April cleanup pass)

See **`APRIL_COMPLETION_WORKFLOW.md`** for Steve’s step-by-step order.

- Quick-action cards on readiness page with score impact estimates  
- Month Review `focus=` filters + one-click accept for city, county, mileage  
- Speed mode + readiness score preview per event  

## When to move to May

1. Run April queues until readiness ≥ 80% (target 95%).
2. `npm run campaign-events:seed-month -- 2026-05` (not enabled until Steve approves next pass).
3. Open May workbench / review / travel report / readiness the same way as March/April.

## Code

- `src/lib/campaign-events/month-readiness/*`
- `src/components/admin/campaign-events/month-readiness/MonthReadinessDashboard.tsx`
- `month-review-queue.ts` — `focus` filter support
