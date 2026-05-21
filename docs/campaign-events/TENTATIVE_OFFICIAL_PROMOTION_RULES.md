# Tentative vs official promotion rules

## Calendar lanes

| Lane | When to use | Prerequisite |
|------|-------------|--------------|
| **Tentative** | Internal Kelly tentative calendar; approved events not yet on official schedule | Approved decision; readiness `READY` or acknowledged `WARNING` |
| **Official** | Confirmed / public-facing Kelly calendar | Typically after tentative promotion; official readiness must pass |

## Promotion status enum (derived + stored)

- `WEBSITE_ENTRY_ONLY` — intake only
- `TENTATIVE_INTERNAL` — ledger tentative, not on Google
- `READY_FOR_TENTATIVE_PROMOTION` / `READY_FOR_OFFICIAL_PROMOTION`
- `PROMOTED_TO_TENTATIVE` / `PROMOTED_TO_OFFICIAL`
- `PROMOTION_FAILED` / `PROMOTION_CONFLICT` / `PROMOTION_BLOCKED`

## Readiness levels

| Level | Meaning |
|-------|---------|
| `READY` | All required checks pass |
| `WARNING` | Promote allowed only with **acknowledge warnings** click |
| `BLOCKED` | No write; show blockers list |

Required checks include: approved, no hold/request-info, city/county, valid datetime, no duplicate-excluded decision, no unresolved conflict, host/location present, Google lane healthy.

## v1 limitations

- Moving tentative → official may not remove tentative Google copy automatically
- Duplicate detection is ledger-heuristic, not full GCal search
- `calendarStatus` on ledger row updated on success; legacy `CampaignEvent` rows are not auto-linked
