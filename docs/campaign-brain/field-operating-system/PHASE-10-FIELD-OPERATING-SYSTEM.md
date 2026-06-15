# Phase 10 — Arkansas Field Operating System

> PLAN → BRAIN → OPTIMIZER → **FIELD EXECUTION**

The strategic architecture is complete. This phase deploys people.

## Objectives

| # | System | Dashboard |
| - | ------ | --------- |
| 1 | County Strike Teams | [Dashboard](./county-strike-team-dashboard.md) |
| 2 | Power of 5 | [Dashboard](./power-of-5/power-of-5-dashboard.md) |
| 3 | House Parties | [Program](./house-parties/README.md) |
| 4 | Local Shirts | [Program](./local-shirts/local-shirt-program.md) |
| 5 | Postcards | [Dashboard](./postcards/postcard-program-dashboard.md) |
| 6 | Phone Banks | [Dashboard](./phone-banks/phone-bank-dashboard.md) |
| 7 | Candidate Partnerships | [Dashboard](./candidate-partnerships/candidate-partnership-dashboard.md) |
| 8 | Faith Outreach | [Dashboard](./faith-outreach/faith-outreach-dashboard.md) |
| 9 | Local Media | [Dashboard](./local-media/local-media-dashboard.md) |
| 10 | Command Center | [Trust Built This Week](./relationship-capital-command-center.md) |

## Current deployment

- Strike team coverage: **0%** (0 filled · 0 recruiting · 675 vacant)

## Field data files

All under [`data/campaign-brain/`](../../data/campaign-brain/):

- `county-strike-teams.json`
- `power-of-5.json`
- `house-parties.json`
- `local-shirts-field.json`
- `postcards-field.json`
- `phone-banks-field.json`
- `candidate-partnerships.json`
- `faith-outreach-network.json`
- `local-media-relationships.json`

```bash
npm run campaign-brain:field-os:build   # regenerate dashboards
npm run campaign-brain:build            # full Brain + Field OS
```

## What Phase 10 does NOT do

- No new vote models
- No new scenario engines
- No new prediction systems
- No additional strategic architecture

## Success question

The Brain should answer: **Who is responsible? Who is missing? Who is recruiting? Who is executing in every county?**
