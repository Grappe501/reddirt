# REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0 — develop_notes report

**Lane:** `RedDirt/` only · **Date:** 2026-05-06 · **Read-only diagnostic packet** — no DB writes, no sends, no automation.

---

## Slice summary

Shipped a bearer-protected **`GET /api/admin/production-readiness/hosted-db`** route backed by **`hosted-db-proof.ts`**: env presence booleans for **`DATABASE_URL`** / **`DIRECT_URL`**, Prisma **`SELECT 1`**, optional fixed-table **`User`** count probe (**boolean `ok` only** — no counts in JSON), sanitized errors, and operator doc **`email-hosted-db-proof.md`**.

**Production-canonical status:** Hosted DB route implemented; **production-canonical proof pending** live PowerShell result from `https://kgrappe.netlify.app` (paste redacted JSON below when available).

---

## Files created

- `RedDirt/src/lib/email-command-center/hosted-db-proof.ts`
- `RedDirt/src/app/api/admin/production-readiness/hosted-db/route.ts`
- `RedDirt/docs/email-hosted-db-proof.md`
- `RedDirt/develop_notes/REDDIRT_EMAIL_HOSTED_DB_PROOF_1_0_REPORT.md` (this file)

---

## Files modified

- `RedDirt/docs/campaign-email-command-center-progress-ledger.md`
- `RedDirt/docs/email-command-center-launch-hardening.md`
- `RedDirt/docs/email-command-center-operator-manual.md`
- `RedDirt/docs/PROJECT_MASTER_MAP.md`
- `RedDirt/docs/THREAD_HANDOFF_MASTER_MAP.md`
- `RedDirt/data/selfbuild/reddirt_selfbuild_queue_status.json` (metadata refresh only, if touched)
- `RedDirt/data/selfbuild/reddirt_selfbuild_next_recommendation.json` (operator next-step text, if touched)

---

## Route created

- **`GET /api/admin/production-readiness/hosted-db`** — `runtime: "nodejs"`, `dynamic: "force-dynamic"`, bearer **`EMAIL_DIAGNOSTICS_TOKEN`** with fallback **`ADMIN_DIAGNOSTIC_TOKEN`** (same HMAC digest pattern as **`/api/admin/email-diagnostics`**).

---

## DB proof behavior

- **`SELECT 1`** via `Prisma.sql` (parameterized).
- Optional **`SELECT COUNT(*)::bigint FROM "User"`** — success/failure only in **`safeCounts[].ok`**.
- Errors passed through **`sanitizeDbError`** (connection URL and password fragments redacted; length capped).
- **`proof.migrationsRun`** is always **false** in code paths; no `migrate`, no `executeRaw` writes.

---

## Env presence behavior

- Response includes **`env.DATABASE_URL.present`** and **`env.DIRECT_URL.present`** only.
- No string values, partials, lengths, or hostnames in JSON.

---

## Validation results

Recorded in the parent Cursor return under **CHECKS** (`npm run typecheck`, `npm run check`, `npm run email:no-send-scan`, self-build validators when run).

---

## Live route result

_Pending — operator runs the PowerShell block in `docs/email-hosted-db-proof.md` against Netlify after deploy and pastes **redacted** JSON here._

```json
{
  "_comment": "Paste redacted Invoke-RestMethod output when live proof is available."
}
```

When **`ok: true`** and **`database.selectOneOk: true`** on **live** Netlify, update this section and align **`productionCanonical`** narrative in the ledger per packet rules (code default remains **`false`**).

---

## Governance status

- **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`:** not modified (forbidden by packet).
- No sends, no contact import, no cron/worker activation, no secrets in responses.

---

## Production readiness effect

Adds an **operator-repeatable** hosted connectivity probe separate from CLI **`email:db:diagnose`**. Does **not** replace migration or import gates. **Live send proof** and **automation activation** remain **out of scope** and **blocked** until explicit approvals.

---

## Risks / limitations

- A “green” probe only proves **connectivity + minimal read** from the app’s configured URL — not business correctness or canonical project choice.
- **`User`** count probe failure with **`SELECT 1`** success may indicate permission or schema drift; investigate without exposing raw URLs in public channels.

---

## Next recommended slice

- **REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0** — **blocked** until Steve explicitly approves live send proof; do not run send probes without that approval.
