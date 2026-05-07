# Production baseline command checklist (review only)

**Slice:** **REDDIRT-PRODUCTION-BASELINE-EXECUTION-REVIEW-1.0**  
**Lane:** `RedDirt/` only · **Mode:** review-only · **No production execution implied**

**Data:** [`data/production-baseline-command-checklist.json`](../data/production-baseline-command-checklist.json)  
**Review:** [`production-baseline-execution-review.md`](./production-baseline-execution-review.md) · [`data/production-baseline-execution-review.json`](../data/production-baseline-execution-review.json)

---

## Global rule

**DO NOT RUN UNTIL EXECUTION PACKET IS APPROVED.**

Every command template below is for **human review** and **shadow** preparation only. Do **not** paste real passwords, tokens, or full database URIs into chat, tickets, or this repository.

---

## Pre-flight requirements

| # | Requirement |
|---|----------------|
| 1 | **Backup / PITR:** Confirmed snapshot or logical backup; restore drill documented. |
| 2 | **Correct production DB target:** Operator confirms canonical Supabase project in host UI (not in this doc). |
| 3 | **No concurrent deploy:** No overlapping migration or schema job on the same database. |
| 4 | **Maintenance window:** Agreed if first production migrate needs low traffic. |
| 5 | **Latest Git commit:** Exact SHA/tag recorded for the execution packet. |
| 6 | **Shadow proof:** `data/shadow-db-migration-proof.json` present and validated (`validate-shadow-db-migration-proof.mjs`); live shadow **or** `offlineConsolidatedAttestation` per [`shadow-db-migration-proof.md`](./shadow-db-migration-proof.md). |
| 7 | **Steve approval:** Written approval for the **exact** production command path. |
| 8 | **Exact command path:** Matches execution packet line-by-line; no terminal improvisation. |
| 9 | **Rollback path:** PITR or backup restore; owner and time target named. |
| 10 | **Netlify retry path:** Retry only after build `DATABASE_URL` points at a schema that already matches migrations; see [`netlify-production-retry-readiness.md`](./netlify-production-retry-readiness.md). |
| 11 | **Hosted DB proof route:** Test bearer `GET` hosted-db proof against **approved non-production** first. |
| 12 | **Email diagnostics:** Plan `npm run email:db:diagnose` / `npm run email:no-send-scan` against the same **class** of DB as post-migrate production. |

---

## Forbidden on production (until approved)

- `npx prisma migrate deploy`
- `npx prisma migrate resolve`
- `npx prisma db push`
- `npx prisma migrate reset`
- Bulk `DROP` / `TRUNCATE` / DML “fixups” outside DBA governance

---

## Command templates (shadow placeholders only)

**DO NOT RUN UNTIL EXECUTION PACKET IS APPROVED.**

```powershell
# SHADOW DATABASE ONLY — replace placeholders in your secure vault / Netlify UI; do not commit secrets.
$env:DATABASE_URL = "<SHADOW_DATABASE_URL_PLACEHOLDER>"
$env:DIRECT_URL   = "<SHADOW_DIRECT_URL_PLACEHOLDER>"
Set-Location H:\SOSWebsite\RedDirt
npx prisma validate
npx prisma migrate deploy
npx prisma migrate diff --from-migrations prisma/migrations --to-url $env:DATABASE_URL
```

**Production (commented — forbidden until execution packet):**

```text
# DO NOT RUN UNTIL EXECUTION PACKET IS APPROVED.
# npx prisma migrate deploy
# npx prisma migrate resolve
# npx prisma db push
# npx prisma migrate reset
```
