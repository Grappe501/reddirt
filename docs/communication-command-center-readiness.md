# Communication Command Center — hosted readiness diagnostics

**Lane:** `RedDirt/` only · **Packet:** **REDDIRT-COMMUNICATION-COMMAND-CENTER-HOSTED-DIAGNOSTICS-1.0**

## Purpose

Give Steve/admin a **single bearer-protected JSON surface** plus an **in-app dashboard** that shows whether the Communication / Email stack is ready for **controlled connection tests** (OAuth, calendar hooks, webhooks) after:

- Hosted DB proof passes the **canonical production** contract, and  
- Netlify is live with **`DATABASE_URL` / `DIRECT_URL`** on ref **`giozeoqulfojhxpywjil`**.

This slice **does not** enable live send, Gmail send, SendGrid mail send, Twilio SMS send, social posting, contact import execution, or automation workers.

---

## Hosted route detection (Netlify / serverless)

- **Source tree may be absent** in the function bundle: `src/app/api/**/route.ts` often does not exist on disk at runtime even though the deployed app serves those HTTP paths.
- **Readiness therefore uses a static route contract** implemented in **`resolveApiRouteHandlerPresent()`** in **`readiness.ts`**: in a full checkout it verifies the handler file exists; when **`src/app/api`** is missing from the bundle, known contract segments are treated as **present** so hosted diagnostics are not false-red. Offline validators still prove the files exist in git before deploy trust.
- **Route readiness means** “this deployment is built to expose the integration HTTP surface (OAuth start/callback, webhooks, diagnostics),” **not** that OAuth has been completed, tokens exist, or Google has granted consent.
- **Gmail and Calendar** readiness flags mean **ready for connection / OAuth proof** steps in a controlled, no-send posture — **not** authorization for live Gmail send or calendar writes beyond what separate gates allow.
- **Email sandbox readiness** is for **one internal/admin diagnostic send path** when headquarters and process explicitly approve — **not** list mail, blast outreach, or volunteer/voter sends. **Live send remains blocked** by governance and explicit `…Approved: false` safety fields until a separate approval slice changes that (this doc slice does not).

---

## HTTP API (read-only)

- **Method:** `GET` only  
- **Path:** `/api/admin/communication-command-center/readiness`  
- **Auth:** Same as hosted DB proof — `Authorization: Bearer <token>` matching **`EMAIL_DIAGNOSTICS_TOKEN`** (primary, checked first) or **`ADMIN_DIAGNOSTIC_TOKEN`** (fallback only if primary is unset), **timing-safe** HMAC digest comparison. Do not use the typo **`ADMIN_DIAGNOSTICS_TOKEN`** (extra “S”).  
- **Responses:** `503` if no diagnostics token configured · `401` / `403` for bad/missing bearer · `200` with JSON body ( **`ok` may be false** when checks fail).

### JSON contract

Machine contract: [`data/communication-command-center-readiness-contract.json`](../data/communication-command-center-readiness-contract.json).

Payload is built by **`src/lib/communication-command-center/readiness.ts`**:

- **`database`** — `reachable` and **`productionCanonical`** from **`getHostedDbProofSummary()`** (no duplicate auth).  
- **`tables`** — `information_schema` existence for the eight public tables listed in the contract.  
- **`routes`** — **`resolveApiRouteHandlerPresent()`** in **`readiness.ts`**: when `src/app/api` exists on disk, checks each **`route.ts`** path; when the tree is absent (some bundles), returns **`true`** for all route keys (offline validator still proves repo layout). Gmail/Calendar and email-sandbox readiness reuse the same helper for their narrower route lists.  
- **`safety`** — explicit **`…Approved: false`** fields plus **`noSendPosture`** from **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** (must be **`false`** for **`ok: true`**).  
- **`nextRecommendedStep`** — operator-facing string for the next proof slice (Gmail / Calendar / Twilio, then Text + Reach MVP).

### Gmail + Calendar OAuth proof (narrower JSON)

- **Path:** `GET /api/admin/communication-command-center/gmail-calendar-readiness`  
- **Auth:** Same bearer as above (`EMAIL_DIAGNOSTICS_TOKEN` / `ADMIN_DIAGNOSTIC_TOKEN`, timing-safe).  
- **Body:** Built by **`src/lib/communication-command-center/gmail-calendar-readiness.ts`** — OAuth/Pub/Sub + Calendar route presence via **`resolveApiRouteHandlerPresent()`** (same bundle rule as main readiness: when `src/app/api` is absent on disk, contract routes are treated present; offline validators prove files), **send capability detected vs locked** (no Google calls from this route).  
- **Human doc:** [`gmail-calendar-oauth-proof.md`](./gmail-calendar-oauth-proof.md) · **Admin UI:** `/admin/workbench/communication-command-center/gmail-calendar`

### Email sandbox send proof readiness (precondition-gated)

- **Path:** `GET /api/admin/communication-command-center/email-sandbox-readiness`  
- **Auth:** Same bearer as above.  
- **Precondition:** `data/gmail-calendar-oauth-proof-contract.json` must **`status: "pass"`**; otherwise `node scripts/validate-email-sandbox-send-proof.mjs` writes **`data/email-sandbox-send-proof-blocked.json`** and stops.  
- **Body:** **`email_sandbox_send_readiness`** — hosted + comms + Gmail/Calendar artifact gate; **does not** authorize live or list send.  
- **Doc:** [`email-sandbox-send-proof.md`](./email-sandbox-send-proof.md) · **Admin UI:** `/admin/workbench/communication-command-center/email-sandbox`

### Gmail + Calendar — operator hosted connection proof (after gates green)

- **Path:** `GET /api/admin/communication-command-center/gmail-calendar-operator-proof`  
- **Auth:** Same bearer (`EMAIL_DIAGNOSTICS_TOKEN` first, `ADMIN_DIAGNOSTIC_TOKEN` fallback), timing-safe.  
- **Body:** **`gmail_calendar_operator_proof`** — read-only aggregation: CCC + Gmail/Calendar + email sandbox readiness must all be **`ok: true`** and **`noSendPosture`** true for **`ok: true`**; includes operator-facing **`oauthStartUrl`** and steps text. **Does not** call Google APIs, send mail, import contacts, or enable workers.  
- **Admin UI:** `/admin/workbench/communication-command-center/gmail-calendar/operator-proof`  
- **Doc:** [`gmail-calendar-operator-proof.md`](./gmail-calendar-operator-proof.md)

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
node scripts/validate-gmail-calendar-operator-proof.mjs
node scripts/build-gmail-calendar-operator-proof-report.mjs
```

Validate prints **PASS/FAIL** to stdout (no extra artifact). Build writes **`data/communication-command-center-launch-report.json`**. Gmail/Calendar proof writes **`data/gmail-calendar-oauth-proof-contract.json`** and related report artifacts. Email sandbox proof writes **`data/email-sandbox-send-proof-contract.json`** (or **`data/email-sandbox-send-proof-blocked.json`** if Gmail/Calendar proof is not green).

---

## Companion docs

- [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md)  
- [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)  
- Hosted DB proof: [`email-hosted-db-proof.md`](./email-hosted-db-proof.md)

---

*No secrets in responses; never paste bearer tokens into tickets or chat.*
