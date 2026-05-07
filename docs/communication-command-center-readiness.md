# Communication Command Center — hosted readiness diagnostics

**Lane:** `RedDirt/` only · **Packet:** **REDDIRT-COMMUNICATION-COMMAND-CENTER-HOSTED-DIAGNOSTICS-1.0**

## Purpose

Give Steve/admin a **single bearer-protected JSON surface** plus an **in-app dashboard** that shows whether the Communication / Email stack is ready for **controlled connection tests** (OAuth, calendar hooks, webhooks) after:

- Hosted DB proof passes the **canonical production** contract, and  
- Netlify is live with **`DATABASE_URL` / `DIRECT_URL`** on ref **`giozeoqulfojhxpywjil`**.

This slice **does not** enable live send, Gmail send, SendGrid mail send, Twilio SMS send, social posting, contact import execution, or automation workers.

---

## HTTP API (read-only)

- **Method:** `GET` only  
- **Path:** `/api/admin/communication-command-center/readiness`  
- **Auth:** Same as hosted DB proof — `Authorization: Bearer <token>` matching **`EMAIL_DIAGNOSTICS_TOKEN`** (primary) or **`ADMIN_DIAGNOSTIC_TOKEN`** (fallback), **timing-safe** HMAC digest comparison.  
- **Responses:** `503` if no diagnostics token configured · `401` / `403` for bad/missing bearer · `200` with JSON body ( **`ok` may be false** when checks fail).

### JSON contract

Machine contract: [`data/communication-command-center-readiness-contract.json`](../data/communication-command-center-readiness-contract.json).

Payload is built by **`src/lib/communication-command-center/readiness.ts`**:

- **`database`** — `reachable` and **`productionCanonical`** from **`getHostedDbProofSummary()`** (no duplicate auth).  
- **`tables`** — `information_schema` existence for the eight public tables listed in the contract.  
- **`routes`** — when `src/app/api` exists on disk, checks each **`route.ts`** path; when the tree is absent (some bundles), returns **`true`** for all route keys (offline validator still proves repo layout).  
- **`safety`** — explicit **`…Approved: false`** fields plus **`noSendPosture`** from **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** (must be **`false`** for **`ok: true`**).  
- **`nextRecommendedStep`** — operator-facing string for the next proof slice (Gmail / Calendar / Twilio, then Text + Reach MVP).

### Gmail + Calendar OAuth proof (narrower JSON)

- **Path:** `GET /api/admin/communication-command-center/gmail-calendar-readiness`  
- **Auth:** Same bearer as above (`EMAIL_DIAGNOSTICS_TOKEN` / `ADMIN_DIAGNOSTIC_TOKEN`, timing-safe).  
- **Body:** Built by **`src/lib/communication-command-center/gmail-calendar-readiness.ts`** — OAuth/Pub/Sub + Calendar route presence, **send capability detected vs locked** (no Google calls from this route).  
- **Human doc:** [`gmail-calendar-oauth-proof.md`](./gmail-calendar-oauth-proof.md) · **Admin UI:** `/admin/workbench/communication-command-center/gmail-calendar`

### Email sandbox send proof readiness (precondition-gated)

- **Path:** `GET /api/admin/communication-command-center/email-sandbox-readiness`  
- **Auth:** Same bearer as above.  
- **Precondition:** `data/gmail-calendar-oauth-proof-contract.json` must **`status: "pass"`**; otherwise `node scripts/validate-email-sandbox-send-proof.mjs` writes **`data/email-sandbox-send-proof-blocked.json`** and stops.  
- **Body:** **`email_sandbox_send_readiness`** — hosted + comms + Gmail/Calendar artifact gate; **does not** authorize live or list send.  
- **Doc:** [`email-sandbox-send-proof.md`](./email-sandbox-send-proof.md) · **Admin UI:** `/admin/workbench/communication-command-center/email-sandbox`

---

## Admin dashboard (signed-in admin)

- **Path:** `/admin/workbench/communication-command-center/readiness`  
- Same read-model as the API (server component calls **`getCommunicationCommandCenterReadiness()`** directly — **no** bearer token in the browser).  
- A **no-send** card also appears on **Email Command Center → Readiness** linking here.

---

## Offline validation

```bash
cd H:\SOSWebsite\RedDirt
node scripts/validate-communication-command-center-readiness.mjs
node scripts/build-communication-command-center-launch-report.mjs
node scripts/validate-gmail-calendar-oauth-proof.mjs
node scripts/build-gmail-calendar-oauth-proof-report.mjs
node scripts/validate-email-sandbox-send-proof.mjs
node scripts/build-email-sandbox-send-proof-report.mjs
```

Validate prints **PASS/FAIL** to stdout (no extra artifact). Build writes **`data/communication-command-center-launch-report.json`**. Gmail/Calendar proof writes **`data/gmail-calendar-oauth-proof-contract.json`** and related report artifacts. Email sandbox proof writes **`data/email-sandbox-send-proof-contract.json`** (or **`data/email-sandbox-send-proof-blocked.json`** if Gmail/Calendar proof is not green).

---

## Companion docs

- [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md)  
- [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)  
- Hosted DB proof: [`email-hosted-db-proof.md`](./email-hosted-db-proof.md)

---

*No secrets in responses; never paste bearer tokens into tickets or chat.*
