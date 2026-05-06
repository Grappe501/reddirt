# REDDIRT-EMAIL-DIAGNOSTICS-ENV-1.0 — Execution report

**Slice:** **REDDIRT-EMAIL-DIAGNOSTICS-ENV-1.0**  
**Lane:** `RedDirt/` only (allowed paths: this route + this report)  
**Date:** 2026-05-06

---

## Slice summary

Ship a **live-production-safe** `GET` handler at **`/api/admin/email-diagnostics`** so Netlify (or any Node server) can confirm **SendGrid-related** and **diagnostics** environment variables are **visible** to the runtime. Response is **`mode: "env_presence_only"`**: each known variable name maps to **`{ "present": true | false }` only**. No email sends, no SendGrid API calls, no Prisma, no DB writes, no secret values, prefixes, suffixes, lengths, hashes, or checksums in JSON, and no `console.log` of secrets.

---

## Files created / modified

| Path | Role |
|------|------|
| `RedDirt/src/app/api/admin/email-diagnostics/route.ts` | App Router route: `export const runtime = "nodejs"`; `export const dynamic = "force-dynamic"`; **GET** only; bearer auth; JSON shape per slice spec |
| `RedDirt/develop_notes/EMAIL_DIAGNOSTICS_ENV_1_0_REPORT.md` | This report |

---

## Route created

- **URL:** `GET /api/admin/email-diagnostics`  
- **File:** `src/app/api/admin/email-diagnostics/route.ts`  
- **200 body (success):** `ok`, `route`, `mode`, `sendgridEnv` (canonical + alias env names), `diagnosticsEnv` (`EMAIL_DIAGNOSTICS_TOKEN`, `ADMIN_DIAGNOSTIC_TOKEN` presence only), `warnings` (non-secret strings), `nextRecommendedTests` (placeholders for **future** routes — **not implemented** in this slice).

---

## Auth token used

| Priority | Environment variable | Role |
|----------|----------------------|------|
| 1 | **`EMAIL_DIAGNOSTICS_TOKEN`** | Preferred bearer secret |
| 2 | **`ADMIN_DIAGNOSTIC_TOKEN`** | Used only if `EMAIL_DIAGNOSTICS_TOKEN` is unset (empty after trim) |

**Request header:** `Authorization: Bearer <token>` (token must match the configured secret from the table above).

| Condition | HTTP status | Body (minimal) |
|-----------|-------------|----------------|
| Neither token env is set (non-empty) | **503** | `{ "ok": false, "error": "diagnostics_token_not_configured" }` |
| Missing / empty `Authorization`, or not `Bearer …` | **401** | `{ "ok": false, "error": "missing_authorization" }` |
| Bearer value does not match secret | **403** | `{ "ok": false, "error": "forbidden" }` |
| Valid bearer | **200** | Presence-only JSON per spec |

**Comparison:** HMAC-SHA256 digests of bearer material compared with **`crypto.timingSafeEqual`** on fixed-length buffers (no early exit on string length).

---

## Safety rules

- **No** outbound email, **no** SendGrid HTTP, **no** sandbox send from this route.  
- **No** Prisma / database access.  
- **No** returning or logging secret **values**, partial keys, lengths, hashes, or checksums.  
- **`diagnosticsEnv`** only reports whether each named env has a non-empty trimmed value (same as other keys: `present` only).  
- **`nextRecommendedTests`** are **documentation-only** strings for follow-on slices; those POST routes do **not** exist yet.

---

## Validation commands run

From `H:\SOSWebsite\RedDirt`:

```bash
npm run typecheck
```

```bash
npm run build
```

*(Build result recorded in “Limitations” if it failed.)*

---

## Expected live PowerShell test commands

After deploy, with `EMAIL_DIAGNOSTICS_TOKEN` set in Netlify (or `ADMIN_DIAGNOSTIC_TOKEN` as fallback):

```powershell
$Site = "https://kgrappe.netlify.app"
$Token = Read-Host "Paste EMAIL_DIAGNOSTICS_TOKEN"
$Headers = @{ Authorization = "Bearer $Token" }

Invoke-RestMethod `
  -Uri "$Site/api/admin/email-diagnostics" `
  -Method GET `
  -Headers $Headers
```

**Expected:** **HTTP 200**; JSON with **`ok: true`**, **`present`** booleans only under `sendgridEnv` / `diagnosticsEnv`, **`warnings`** array, **`nextRecommendedTests`** array; **no** secret values in output.

If the route file is not in the deployed build, Netlify may still return **404** until that revision is live.

---

## Limitations

- **Env presence ≠ correctness:** A variable can be present but wrong for production; this slice does not validate formats or connectivity.  
- **`nextRecommendedTests`** endpoints are **not** implemented here; calling them will 404 until separate slices add them.  
- **401 vs malformed header:** Missing `Authorization` and non-`Bearer` schemes both return **401** with `missing_authorization` (no secret leakage).  
- **Build:** See the validation section below for `npm run build` outcome on the machine that last ran this report.

---

## `npm run build` outcome (local)

Run from `H:\SOSWebsite\RedDirt` after this slice’s route change:

- **Exit code:** **0** (success).
- **Note:** `next build` reported **pre-existing ESLint warnings** elsewhere in the repo (unused vars, `<img>` vs `next/image`, one `react-hooks/exhaustive-deps`). These are **unrelated** to `email-diagnostics`; no broad lint cleanup was attempted per slice scope.

---

*End — **REDDIRT-EMAIL-DIAGNOSTICS-ENV-1.0**.*
