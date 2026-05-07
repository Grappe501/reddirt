# Gmail + Google Calendar — OAuth connection proof

**Lane:** `RedDirt/` only · **Slice:** **REDDIRT-GMAIL-CALENDAR-OAUTH-PROOF-1.0**

## Purpose

After hosted Communication Command Center readiness is green, this slice adds:

- A **read-only** readiness payload for **Gmail + Calendar OAuth surfaces** (no Google API calls from the readiness API).  
- A **bearer-protected JSON route** using the same diagnostics token pattern as hosted DB proof.  
- A simple **admin page** and **readiness card** so operators can run **connection proof** without turning on live send.

**Security:** If `ADMIN_DIAGNOSTIC_TOKEN` (or any bearer) was pasted into chat, **rotate it in Netlify** and redeploy before relying on bearer-protected routes.

---

## HTTP API (read-only)

- **Method:** `GET` only  
- **Path:** `/api/admin/communication-command-center/gmail-calendar-readiness`  
- **Auth:** `Authorization: Bearer <token>` — **`EMAIL_DIAGNOSTICS_TOKEN`** (primary) or **`ADMIN_DIAGNOSTIC_TOKEN`** (fallback), **timing-safe** HMAC digest comparison (same pattern as `/api/admin/production-readiness/hosted-db` and `/api/admin/communication-command-center/readiness`).  
- **Responses:** `503` if no diagnostics token · `401` / `403` for bad bearer · `200` with JSON (**`ok` may be false** if route files are missing).

Payload is built by **`src/lib/communication-command-center/gmail-calendar-readiness.ts`** (static checks only).

---

## Admin UI

- **Path:** `/admin/workbench/communication-command-center/gmail-calendar`  
- Server-rendered; uses the same read-model function as the API (no bearer in the browser).

**Email Command Center → Readiness** includes a card linking here.

---

## Operator test steps

### Gmail proof

1. Open the Gmail OAuth start route: **`/api/gmail/oauth/start`** (same origin, signed-in admin context as required by your deployment).  
2. Complete Google consent for the campaign inbox.  
3. Confirm the OAuth callback completes without error.  
4. Confirm token / readiness in admin tools (no blast send required).  
5. Confirm metadata-first posture; **no sending** occurred.  

### Calendar proof

1. Open **Workbench → Calendar** and start the Google connection flow.  
2. Complete consent so **`/api/calendar/google/callback`** can store tokens.  
3. Confirm calendar list or event read in the staff UI (read-first).  
4. **Do not** assume bulk event writes are allowed until explicitly approved later.

---

## Offline validation

```bash
cd H:\SOSWebsite\RedDirt
node scripts/validate-gmail-calendar-oauth-proof.mjs
node scripts/build-gmail-calendar-oauth-proof-report.mjs
```

Artifacts:

- [`data/gmail-calendar-oauth-proof-contract.json`](../data/gmail-calendar-oauth-proof-contract.json)  
- [`data/gmail-calendar-oauth-proof-report.json`](../data/gmail-calendar-oauth-proof-report.json)  
- [`data/gmail-calendar-next-operator-steps.json`](../data/gmail-calendar-next-operator-steps.json)  
- [`develop_notes/REDDIRT_GMAIL_CALENDAR_OAUTH_PROOF_1_0_REPORT.md`](../develop_notes/REDDIRT_GMAIL_CALENDAR_OAUTH_PROOF_1_0_REPORT.md)

---

## Companion docs

- [`communication-command-center-readiness.md`](./communication-command-center-readiness.md)  
- [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md)  
- [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)

---

*No secrets in JSON responses; never paste bearer tokens into tickets or chat.*
