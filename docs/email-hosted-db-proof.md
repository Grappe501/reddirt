# Hosted production database — read-only proof (REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0)

**Lane:** `RedDirt/` only · **Packet:** **REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0**  
**Companion:** [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) · [`email-hosted-db-readiness-assistant-1-0.md`](./email-hosted-db-readiness-assistant-1-0.md) · [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)

---

## Purpose

Give operators a **single, bearer-protected HTTP GET** that answers whether the **deployed** RedDirt app can reach Postgres using the **same** Prisma client and env wiring as the rest of the app — **without** writes, **without** migrations, **without** email sends, and **without** exposing connection strings or tokens.

---

## What this proves

- **`DATABASE_URL`** and **`DIRECT_URL`**: **presence** plus **Supabase project ref** alignment (`supabaseProjectRefConfirmed`, `parseHint`) — **no** full connection strings, passwords, or tokens in JSON (**REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0**).
- The app process can open a Prisma connection and run **`SELECT 1`** successfully.
- **`productionSchemaContract`**: canonical production ref **`giozeoqulfojhxpywjil`**, required **legacy** and **new** public tables (same list as migration-history preflight), **`auth.users`** metadata presence, and **`_prisma_migrations`** row count **71**; when **`DIRECT_URL`** is set, its parsed ref must match the same production ref.
- **`proof.productionCanonical`**: **`true`** when that contract is satisfied (same condition as **`productionSchemaContract.contractSatisfied`**). It does **not** replace operator attestation in **`develop_notes`** for audit trails, but it **is** set from live read-only probes, not from a separate manual flag.
- Optionally, a **fixed** read against the existing **`User`** table (`COUNT(*)` only) returns **success or failure as a boolean** per table row in **`safeCounts`** — **not** the numeric count (supplementary; **`ok`** does not depend on **`User`**).

---

## What this does not prove

- RLS posture, row-level data correctness, or **`email:contact-import:gate`** success — use CLI gates separately.
- SendGrid, Gmail, OpenAI, or automation health.
- That every business workflow is safe to execute (sends, imports, etc.) — still governed by [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md).

---

## Required environment variables

| Variable | Role |
|----------|------|
| **`DATABASE_URL`** | Prisma `url` — required for any proof beyond “not configured.” |
| **`DIRECT_URL`** | Prisma `directUrl` — often required for migrate/introspect when `DATABASE_URL` uses a pooler; absence yields a **warning** in the JSON, not a hard failure of `SELECT 1`. |
| **`EMAIL_DIAGNOSTICS_TOKEN`** | **Primary** bearer secret for this route and other email diagnostics. |
| **`ADMIN_DIAGNOSTIC_TOKEN`** | **Fallback** bearer secret only if **`EMAIL_DIAGNOSTICS_TOKEN`** is unset — same HMAC comparison behavior as **`/api/admin/email-diagnostics`**. |

Never commit token values; never paste tokens into tickets or chat logs.

---

## Protected route

- **Method:** `GET` only  
- **Path:** `/api/admin/production-readiness/hosted-db`  
- **Auth:** `Authorization: Bearer <token>` where `<token>` matches server **`EMAIL_DIAGNOSTICS_TOKEN`** or **`ADMIN_DIAGNOSTIC_TOKEN`**.  
- **Responses:** `503` if neither server token is configured · `401` if the header is missing or not `Bearer …` · `403` if the bearer does not match · `200` with JSON body on success or “proof failed” (still `200` with `"ok": false` when DB unreachable — check **`database.reachable`** and **`sanitizedError`**).

---

## Read-only proof behavior

Implemented in **`src/lib/email-command-center/hosted-db-proof.ts`**:

- **`getHostedDbEnvPresence()`** — booleans only.  
- **`runHostedDbReadOnlyProof()`** — `Prisma.sql` parameterized **`SELECT 1`**; optional **`SELECT COUNT(*)::bigint FROM "User"`** (count never returned).  
- **`getHostedDbProofSummary()`** — assembles the full JSON envelope with **`proof.readOnly: true`**, **`mutatedData: false`**, **`migrationsRun: false`**, and **`proof.productionCanonical`** set to **`true`** when **`productionSchemaContract.contractSatisfied`** is **`true`** (canonical production DB contract from read-only probes).

---

## Live PowerShell test

After **GitHub push** and **Netlify deploy** of the route:

```powershell
$Site = "https://kgrappe.netlify.app"
$Token = Read-Host "Paste EMAIL_DIAGNOSTICS_TOKEN"
$Headers = @{ Authorization = "Bearer $Token" }

Invoke-RestMethod `
  -Uri "$Site/api/admin/production-readiness/hosted-db" `
  -Method GET `
  -Headers $Headers
```

Paste **redacted** JSON (no secrets) into **`develop_notes/REDDIRT_EMAIL_HOSTED_DB_PROOF_1_0_REPORT.md`** under **Live route result** when claiming hosted verification.

---

## Safe result interpretation

- **`ok: true`** — same gates as a satisfied production schema contract: canonical ref on **`DATABASE_URL`**, **`SELECT 1`** OK, legacy + new tables, **`auth.users`**, **71** migration rows, and matching **`DIRECT_URL`** ref when **`DIRECT_URL`** is set. Then **`proof.productionCanonical`** is **`true`**.
- **`ok: true`** but **`proof.productionCanonical: false`** should not occur when the contract logic is aligned; if it appears, treat as a bug and capture redacted JSON for review.
- **`warnings`** mentioning **`DIRECT_URL`** — plan migrate/introspection with a direct/session URL per [`deployment.md`](./deployment.md).  
- **`safeCounts`** — `{ "table": "User", "ok": true }` means the count query succeeded; **`ok: false`** means that probe failed (permissions, missing table in an odd fork, etc.) — **`SELECT 1`** may still pass; **`ok`** for the route does **not** require **`User`**.

---

## Failure interpretation

| Signal | Likely meaning |
|--------|----------------|
| **503** `diagnostics_token_not_configured` | Set **`EMAIL_DIAGNOSTICS_TOKEN`** (or fallback) in Netlify env for this site. |
| **401** `missing_authorization` | Add `Authorization: Bearer …` header. |
| **403** `forbidden` | Wrong bearer value. |
| **`database_url_not_configured`** | **`DATABASE_URL`** missing on the server. |
| **`ok: false`** + **`sanitizedError`** | Connection refused, DNS, SSL, pooler, wrong password, etc. — message is **redacted**; fix env / network / Supabase dashboard strings privately. |

---

## Next gates after hosted DB proof

1. Operator **`migrate deploy`** + **`npm run email:contact-import:gate`** on the **same** hosted URLs (existing packets).  
2. **REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0** — **blocked** until Steve explicitly approves any live send proof.  
3. Production Marketing Contacts upsert and broadcast paths remain governed per [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md); **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged by this packet.
