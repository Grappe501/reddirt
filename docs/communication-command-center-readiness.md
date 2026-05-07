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
```

Validate prints **PASS/FAIL** to stdout (no extra artifact). Build writes **`data/communication-command-center-launch-report.json`**.

---

## Companion docs

- [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md)  
- [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)  
- Hosted DB proof: [`email-hosted-db-proof.md`](./email-hosted-db-proof.md)

---

*No secrets in responses; never paste bearer tokens into tickets or chat.*
