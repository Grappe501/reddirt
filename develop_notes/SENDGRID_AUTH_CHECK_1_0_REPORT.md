# REDDIRT-SENDGRID-AUTH-CHECK-1.0 — Execution report

**Slice:** **REDDIRT-SENDGRID-AUTH-CHECK-1.0**  
**Lane:** `RedDirt/` only (allowed paths: `sendgrid-auth-check/route.ts` + this report)  
**Date:** 2026-05-06

---

## Slice summary

Add **`POST /api/admin/email-diagnostics/sendgrid-auth-check`**, protected with the **same bearer token** as `GET /api/admin/email-diagnostics` (`EMAIL_DIAGNOSTICS_TOKEN`, then `ADMIN_DIAGNOSTIC_TOKEN`). The handler uses **native `fetch`** (no new SendGrid SDK) to call SendGrid’s **read-only** APIs: **`GET /v3/scopes`** and **`GET /v3/verified_senders?limit=100`**. It returns **sanitized JSON** (counts, booleans, HTTP statuses for SendGrid calls) and **never** returns or logs the API key, raw error bodies, full scope lists, full sender records, or physical addresses. **No email is sent** (no Mail Send API, no sandbox mail).

---

## Files created / modified

| Path | Action |
|------|--------|
| `RedDirt/src/app/api/admin/email-diagnostics/sendgrid-auth-check/route.ts` | **Created** — `POST` handler, `runtime = "nodejs"`, `dynamic = "force-dynamic"` |
| `RedDirt/develop_notes/SENDGRID_AUTH_CHECK_1_0_REPORT.md` | **Created** — this document |

---

## SendGrid endpoints used

| Method | URL | Purpose |
|--------|-----|---------|
| `GET` | `https://api.sendgrid.com/v3/scopes` | Confirm API key works; detect **`mail.send`** and aggregate scope signals |
| `GET` | `https://api.sendgrid.com/v3/verified_senders?limit=100` | Count verified sender rows server-side; compare **`from_email`** to configured app sender only (no payload echo) |

Authorization header to SendGrid: `Authorization: Bearer <SENDGRID_API_KEY>` (server-side env only; **never** in JSON response).

---

## No-send confirmation

- **No** `POST /v3/mail/send` or other mail-delivery endpoints.  
- **No** sandbox send, marketing sends, or batch mail.  
- **No** database or Prisma usage.

---

## Auth protection

Same contract as **`/api/admin/email-diagnostics`**:

| Server / client condition | HTTP status |
|---------------------------|-------------|
| Neither `EMAIL_DIAGNOSTICS_TOKEN` nor `ADMIN_DIAGNOSTIC_TOKEN` set | **503** |
| Missing / invalid `Authorization: Bearer …` | **401** |
| Bearer does not match configured secret (HMAC digest + `timingSafeEqual`) | **403** |
| Authenticated; application-level SendGrid outcome | **200** JSON (`ok` true/false per checks) |

Diagnostic failures after auth (missing API key, SendGrid rejection, missing `mail.send`) return **`ok: false`** in JSON with **`status: 200`** on the HTTP response so clients can parse the body without Netlify/auth middleware ambiguity.

---

## Validation results

From `H:\SOSWebsite\RedDirt`:

```bash
npm run typecheck
```

**Result:** **PASS** (exit code 0).

```bash
npm run build
```

**Result:** **PASS** (exit code 0). **Pre-existing** ESLint warnings elsewhere in the repo during `next build` lint phase; **not** introduced by this slice. No broad lint repair attempted.

---

## Expected live PowerShell test commands

After deploy, with **`EMAIL_DIAGNOSTICS_TOKEN`** (or fallback **`ADMIN_DIAGNOSTIC_TOKEN`**) set on Netlify and **`SENDGRID_API_KEY`** set:

```powershell
$Site = "https://kgrappe.netlify.app"
$Token = Read-Host "Paste EMAIL_DIAGNOSTICS_TOKEN"
$Headers = @{ Authorization = "Bearer $Token" }

Invoke-RestMethod `
  -Uri "$Site/api/admin/email-diagnostics/sendgrid-auth-check" `
  -Method POST `
  -Headers $Headers
```

**Expected (healthy key):** `ok: true`, `sendgrid.reachable: true`, `sendgrid.hasMailSendScope: true`, numeric `scopesEndpointStatus` / `verifiedSendersEndpointStatus` where applicable, **no** email delivered.

---

## Known limitations

- **Configured from email** is resolved from the first non-empty trimmed value among: `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM`, `SENDGRID_SENDER_EMAIL`, `SENDGRID_DEFAULT_FROM_EMAIL` (case-insensitive match to SendGrid `from_email`). Other naming conventions are not consulted.  
- **Verified senders `403`:** Per slice rules, the check still returns **`ok: true`** if scopes succeeded, with a **warning** (sender match may be unknown).  
- **No raw SendGrid errors** in the response: only stable `error.code` / `message` / numeric `status` for failures.  
- **`nextRecommendedTest`** points at **`POST /api/admin/email-diagnostics/sandbox-send`**, which is **not** implemented in this slice.  
- Bearer auth logic is **duplicated** from `email-diagnostics/route.ts` to honor the **allowed-files-only** list (no shared `lib` helper added).

---

*End — **REDDIRT-SENDGRID-AUTH-CHECK-1.0**.*
