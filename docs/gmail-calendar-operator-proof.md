# Gmail + Google Calendar — operator hosted connection proof

**Lane:** `RedDirt/` only · **Slice:** **REDDIRT-GMAIL-CALENDAR-OAUTH-OPERATOR-HOSTED-PROOF-1.0**

## What this is

A **staff-facing** checklist page and a **bearer-protected read-only JSON** route that turn on **only after** all three hosted readiness gates are green:

1. Communication Command Center readiness — `ok: true`  
2. Gmail + Calendar readiness — `ok: true`  
3. Email sandbox readiness — `ok: true`  

This slice helps the **operator** run **OAuth connection proof** in production (sign in to Google for the campaign inbox and calendar). It does **not** authorize:

- Email sending (Gmail or SendGrid)  
- List or blast sends  
- Twilio SMS  
- Contact import  
- Automation workers  
- Calendar event writes (bulk or automated) — those stay **off** until a **separate** headquarters approval  

Gmail proof is **metadata / read-first**. Calendar proof is **read / sync first**. A **separate approval slice** is required before any real send or broad calendar writes.

---

## Admin page (signed-in admin)

- **Path:** `/admin/workbench/communication-command-center/gmail-calendar/operator-proof`  
- Plain-language steps: Gmail connect → metadata note → Calendar connect → safety locks → operator checklist.

---

## HTTP API (read-only)

- **Method:** `GET` only  
- **Path:** `/api/admin/communication-command-center/gmail-calendar-operator-proof`  
- **Auth:** `EMAIL_DIAGNOSTICS_TOKEN` (primary) or `ADMIN_DIAGNOSTIC_TOKEN` (fallback), **timing-safe** bearer — same pattern as other diagnostics readiness routes. Never use typo `ADMIN_DIAGNOSTICS_TOKEN`.  
- **Body:** Built by **`src/lib/communication-command-center/gmail-calendar-operator-proof.ts`** — aggregates readiness libraries only; **no** Google API calls, **no** secrets, **no** sends.

If any precondition readiness is not green, JSON returns **`ok: false`** with the same shape (preconditions show which gate failed).

---

## Operator actions (summary)

1. If a diagnostics token was pasted into chat, **rotate** it in Netlify and redeploy.  
2. Open **Operator connection proof** from Email Command Center readiness or Communication Command Center navigation.  
3. **Gmail:** use **Connect Gmail** → `/api/gmail/oauth/start`; complete consent; confirm callback success.  
4. **Calendar:** open **Calendar workspace**, connect Google, confirm read/sync.  
5. Record a **redacted** runbook note (no tokens, no secrets).

---

## Offline validation

```bash
cd H:\SOSWebsite\RedDirt
node scripts/validate-gmail-calendar-operator-proof.mjs
node scripts/build-gmail-calendar-operator-proof-report.mjs
```

---

## Related docs

- [`gmail-calendar-oauth-proof.md`](./gmail-calendar-oauth-proof.md) — technical OAuth proof slice  
- [`communication-command-center-readiness.md`](./communication-command-center-readiness.md) — hosted diagnostics  
- [`email-sandbox-send-proof.md`](./email-sandbox-send-proof.md) — sandbox layer (still not live send)
