# Campaign Budget Framework

> Planning budget framework only — not final accounting, not guaranteed fundraising, not donor-facing claims.

**Reference date:** 2026-06-15 · **Election Day:** 2026-11-03

## Purpose

This is the first projected campaign budget for Kelly Grappe for Secretary of State — from now through Election Day. It supports **fundraising goal-setting**, not final accounting.

## Known fixed assumptions

| Item | Amount | Notes |
|------|-------:|-------|
| Fuel allowance | $2,500/month | Planning baseline |
| Food (travel) | $150/day | Steve + Kelly on travel days |
| Lodging | $175/night | |
| T-shirts | $9 each | |
| Yard signs | $9 each | |
| Kelly replacement salary | $12,000/month | Leave-of-absence from work |

## Salary — highest priority line item

Kelly cannot campaign full-time without leave-of-absence replacement income.

| | |
|---|---|
| Monthly | $12,000 |
| Months | 6 (June 2026 through November 2026 (Election Day)) |
| **Total salary need** | **$72,000** |

## Budget categories

| Category | Document | Status |
|----------|----------|--------|
| Travel | [TRAVEL-BUDGET.md](./TRAVEL-BUDGET.md) | Modeled from locked calendar + scenarios |
| Field materials | [FIELD-MATERIALS-BUDGET.md](./FIELD-MATERIALS-BUDGET.md) | Known unit costs · sign/shirt scenarios |
| Postcards & mail | [POSTCARD-AND-MAIL-BUDGET.md](./POSTCARD-AND-MAIL-BUDGET.md) | Quantities from People Power · print/postage needs quote |
| Sherwood 60% | [SHERWOOD-60-BUDGET.md](./SHERWOOD-60-BUDGET.md) | Revenue model + cost placeholders |
| Volunteer leadership | [VOLUNTEER-LEADERSHIP-BUDGET.md](./VOLUNTEER-LEADERSHIP-BUDGET.md) | June 28 launch · July retreat |
| Communications | [COMMUNICATIONS-BUDGET.md](./COMMUNICATIONS-BUDGET.md) | Motion · Forward Motion · digital |
| Fundraising goals | [FUNDRAISING-GOAL-MODEL.md](./FUNDRAISING-GOAL-MODEL.md) | Scenario targets — not guarantees |

## Scenario totals (planning)

| Scenario | Total projected need |
|----------|---------------------:|
| Bare minimum | $126,783 |
| Working campaign | $167,553 |
| Aggressive statewide | $246,123 |

## Plan artifacts used

- Election Plan / 20-week plan (`data/election-plan/twenty-week-plan.json`)
- Locked events (`data/campaign-brain/locked-events-steve.json`) — 40 events
- Calendar Fill Phase C proposed blocks — 10 blocks
- Executive Field Calendar / upcoming stops queue
- People Power / postcards field (`data/campaign-brain/postcards-field.json`)
- Sherwood 60% operation (`data/campaign-brain/win-sherwood-operation.json`)
- Forward Motion · Motion & Storytelling · GOTV framework

## Unknowns

All line items marked **needs_quote** in `campaign-budget-assumptions.json` require vendor quotes before committing budget numbers.

## Rebuild

```bash
npm run campaign-brain:budget:build
```
