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
| Media & outreach | [MEDIA-OUTREACH-BUDGET.md](./MEDIA-OUTREACH-BUDGET.md) | **Modeled** — rural newspaper/radio · campus · community ads |
| Community activation & swag | [COMMUNITY-ACTIVATION-SWAG-BUDGET.md](./COMMUNITY-ACTIVATION-SWAG-BUDGET.md) | **Modeled** — $500/immersion visit |
| Compliance & reporting | [COMPLIANCE-BUDGET.md](./COMPLIANCE-BUDGET.md) | **Modeled** — $750/month hard expense |
| County event sponsorships | [COUNTY-SPONSORSHIPS-BUDGET.md](./COUNTY-SPONSORSHIPS-BUDGET.md) | **Modeled** — fairs · forums · civic events |
| Digital advertising | [DIGITAL-ADVERTISING-BUDGET.md](./DIGITAL-ADVERTISING-BUDGET.md) | **Modeled** — field force multiplier · $30K working |
| Digital content production | [DIGITAL-CONTENT-PRODUCTION-BUDGET.md](./DIGITAL-CONTENT-PRODUCTION-BUDGET.md) | **Modeled** — $500/mo production |
| Communications (tools) | [COMMUNICATIONS-BUDGET.md](./COMMUNICATIONS-BUDGET.md) | Email · Mobilize · SMS platforms |
| Fundraising goals | [FUNDRAISING-GOAL-MODEL.md](./FUNDRAISING-GOAL-MODEL.md) | Scenario targets — not guarantees |

## Scenario totals (planning)

| Scenario | Total projected need |
|----------|---------------------:|
| Bare minimum | $181,783 |
| Working campaign | $232,053 ($225,000–$250,000 range) |
| Aggressive statewide | $339,123 ($300,000–$350,000 range) |

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
