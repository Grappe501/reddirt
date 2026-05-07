# Post–migration-history Netlify retry packet

**Slice:** `REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0`  
**Generated:** 2026-05-07T17:27:31.920Z  
**Machine JSON:** [`../data/post-migration-history-netlify-retry-packet.json`](../data/post-migration-history-netlify-retry-packet.json)  
**Status:** READY (operator)

## Purpose

Governed readiness for the **first** production Netlify deploy retry after additive schema install, postcheck, and **Prisma migration history baseline** alignment. This document and JSON **do not** trigger Netlify, **do not** approve live send, and **do not** mutate production.

## Preconditions (from preflight)

Production migration-history preflight must show: ref confirmed, legacy + app tables present, `auth.users`, `_prisma_migrations` with **71** rows, `prisma migrate status` exit **0**, summary contains “Database schema is up to date”, pending migrations **0**.

## Netlify build

`netlify.toml` uses `bash scripts/netlify-build.sh`, which runs `npx prisma migrate deploy`. When the database is already up to date, **migrate deploy** is expected to be a **no-op** (no pending migrations). **`db push`** and **`migrate reset`** remain forbidden on production.

## Build gate result

**All preflight gates passed** for this generator run.

## Netlify script inspection

- **migrate deploy in build script:** yes

## Operator checklist

See [`post-migration-history-deploy-checklist.md`](./post-migration-history-deploy-checklist.md) and [`../data/post-migration-history-deploy-checklist.json`](../data/post-migration-history-deploy-checklist.json).

## Next slice

**`REDDIRT-NETLIFY-OPERATOR-RETRY-1.0`** — operator-triggered Netlify retry with Steve-approved procedure outside this repo automation.
