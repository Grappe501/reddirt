# Prisma migration history status (repo + governance)

**Slice:** `REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0` · **Generated:** 2026-05-07T15:36:46.126Z

Machine JSON: [`data/prisma-migration-history-status.json`](../data/prisma-migration-history-status.json)

## Repo

- **71** migration directories under `prisma/migrations/`.

## Production

- Operator statement: additive install **did not** insert Prisma migration history.
- **Do not** run blind `migrate deploy` on production until the baseline packet slice runs with Steve approval.

## Netlify

`scripts/netlify-build.sh` still runs `npx prisma migrate deploy` — see Netlify readiness decision doc.
