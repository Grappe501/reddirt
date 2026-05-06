# REDDIRT-SENDGRID-SANDBOX-SEND-1.0 — Execution report

**Slice:** **REDDIRT-SENDGRID-SANDBOX-SEND-1.0**  
**Lane:** `RedDirt/` only (allowed paths: `sandbox-send/route.ts` + this report)  
**Date:** 2026-05-06

---

## Slice summary

Add **`POST /api/admin/email-diagnostics/sandbox-send`**, protected with the **same bearer token** as the other email diagnostics routes (`EMAIL_DIAGNOSTICS_TOKEN`, fallback **`ADMIN_DIAGNOSTIC_TOKEN`**). The handler accepts JSON **`{ "to": "<email>", "subject"?: "..." }`**, validates **`to`** as a required email-shaped string (not persisted, not queued, not logged), and issues a **SendGrid v3 Mail Send** request via **`fetch`** with **`mail_settings.sandbox_mode.enable` hard-coded to `true`**. **No database writes**, no Prisma, no queue or automation changes. **`delivered`** is always **`false`** in the JSON response; a **200/202** from SendGrid means the **sandbox** payload was accepted, **not** inbox delivery or Event Webhook proof.

---

## Files created / modified

| Path | Action |
|------|--------|
| `RedDirt/src/app/api/admin/email-diagnostics/sandbox-send/route.ts` | **Created** — `POST`, `runtime = "nodejs"`, `dynamic = "force-dynamic"` |
| `RedDirt/develop_notes/SENDGRID_SANDBOX_SEND_1_0_REPORT.md` | **Created** — this document |

---

## Sandbox mode proof

The JSON body sent to SendGrid always includes:

```json
"mail_settings": {
  "sandbox_mode": {
    "enable": true
  }
}
```

This object is **not** merged from the client request; the route builds a fixed server-side payload. Inline comments in the route state that sandbox mode is **intentionally hard-coded** and that the endpoint **must never deliver** real mail.

---

## No-delivery guarantee

- **Sandbox mode** instructs SendGrid to validate the request **without** normal delivery (per SendGrid sandbox semantics).  
- **`delivered: false`** is returned on **every** response path.  
- The response **does not** claim Event Webhook or Email Activity success.  
- **Recipient** is used only inside the in-memory request to SendGrid; it is **not** written to the DB, queues, logs (avoid), or automation.

---

## Auth protection

| Condition | HTTP status |
|-----------|-------------|
| Neither diagnostics token env is set | **503** |
| Missing / invalid `Authorization: Bearer …` | **401** |
| Bearer mismatch | **403** |
| Authenticated | **200** with JSON (`ok` reflects SendGrid acceptance) |

SendGrid outcomes use **`ok: true | false`** in JSON; HTTP stays **200** for parseable diagnostic results after auth (same pattern as other diagnostics routes).

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

**Result:** Recorded at the time this report was written: **PASS** (exit code 0), with any **pre-existing** ESLint warnings during `next build` unchanged by this slice.

---

## Expected live PowerShell test commands

**Order after deploy:** (1) env presence, (2) auth check, (3) sandbox send.

### 1) Env diagnostics

```powershell
$Site = "https://kgrappe.netlify.app"
$Token = Read-Host "Paste EMAIL_DIAGNOSTICS_TOKEN"
$Headers = @{ Authorization = "Bearer $Token" }

Invoke-RestMethod `
  -Uri "$Site/api/admin/email-diagnostics" `
  -Method GET `
  -Headers $Headers
```

### 2) SendGrid auth check

```powershell
Invoke-RestMethod `
  -Uri "$Site/api/admin/email-diagnostics/sendgrid-auth-check" `
  -Method POST `
  -Headers $Headers
```

### 3) Sandbox send

```powershell
$Body = @{
  to      = "YOUR-REAL-TEST-EMAIL@example.com"
  subject = "RedDirt SendGrid Sandbox Test"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "$Site/api/admin/email-diagnostics/sandbox-send" `
  -Method POST `
  -Headers $Headers `
  -ContentType "application/json" `
  -Body $Body
```

**Expected success shape (illustrative):** `ok: true`, `mode: "sendgrid_sandbox"`, **`delivered: false`**, `sendgrid.requestAccepted: true`, `sendgrid.status` **200** or **202** (SendGrid commonly returns **202 Accepted** for `/mail/send`).

**Troubleshooting:**

| Symptom | Likely cause |
|---------|----------------|
| **404** | Route not in deployed build |
| **401 / 403** on diagnostics | Missing/wrong `EMAIL_DIAGNOSTICS_TOKEN` (or fallback) |
| **`ok: false`**, SendGrid **400** | Payload / sender config rejected in sandbox |
| **`ok: false`**, SendGrid **401** | API key invalid or missing scopes |
| **`ok: false`**, SendGrid **403** | Scopes or verified sender / domain posture |

---

## Risks / limitations

- **Sandbox acceptance ≠ production send proof** — operator must still run an explicit live-send proof packet when approved.  
- **`SENDGRID_FROM_EMAIL`** must be set (non-empty); other “from” env names are **not** used as a substitute for this diagnostic (canonical sender for the app).  
- **Recipient** must be supplied for a structurally valid Mail Send; choose a **non-sensitive** test address you control; the server does not retain it.  
- **Error bodies** are reduced to **`sanitizedDetails`** strings with **emails and long `SG.*` tokens redacted**.  
- Bearer auth logic is **duplicated** from sibling routes to respect the **allowed-files-only** list.

---

## Next recommended step

**Controlled live-send proof only after Steve explicitly approves** — same string as returned in successful JSON: `nextRecommendedStep`.

---

*End — **REDDIRT-SENDGRID-SANDBOX-SEND-1.0**.*
