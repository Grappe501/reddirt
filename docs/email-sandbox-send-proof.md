# Email sandbox send proof (internal only)

**Lane:** `RedDirt/` only · **Slice:** **REDDIRT-EMAIL-SANDBOX-SEND-PROOF-1.0**

## What this is — and is not

- **This is** a read-only **readiness** surface so operators can see when a **single internal** SendGrid/Gmail diagnostic test could be prepared — **after** hosted DB proof, Communication Command Center readiness, and **Gmail + Calendar OAuth proof** are green.  
- **This is not** authorization for live campaign email, **not** list or blast sends, **not** volunteer/voter/donor outreach, **not** Gmail “live send” from queue tools, **not** SendGrid marketing broadcast, **not** contact import, **not** automation workers.

A **separate operator approval slice** is still required before any real send.

---

## Preconditions (enforced)

1. **`data/gmail-calendar-oauth-proof-contract.json`** exists with **`status: "pass"`** (from `node scripts/validate-gmail-calendar-oauth-proof.mjs`).  
   If missing or failed, `node scripts/validate-email-sandbox-send-proof.mjs` writes **`data/email-sandbox-send-proof-blocked.json`** and **`develop_notes/REDDIRT_EMAIL_SANDBOX_SEND_PROOF_1_0_BLOCKED_REPORT.md`** and **exits non-zero** — no sandbox contract pass.  
2. At request time, **hosted DB proof** and **Communication Command Center readiness** must both be green (same checks as existing readiness libraries).

---

## HTTP API (read-only)

- **Method:** `GET` only  
- **Path:** `/api/admin/communication-command-center/email-sandbox-readiness`  
- **Auth:** `EMAIL_DIAGNOSTICS_TOKEN` (primary) or `ADMIN_DIAGNOSTIC_TOKEN` (fallback), **timing-safe** bearer match — same as hosted DB / comms readiness. **Do not** use typo `ADMIN_DIAGNOSTICS_TOKEN`.  
- **Response:** JSON built by **`src/lib/communication-command-center/email-sandbox-readiness.ts`** — **no** secrets, **no** send execution.

---

## Admin UI

- **Path:** `/admin/workbench/communication-command-center/email-sandbox`  
- **Email Command Center → Readiness** includes a **Sandbox email proof** card when this slice is deployed.

---

## First allowed proof shape

- **One** internal staff address only (`allowedRecipientMode`: `internal_admin_test_only` in JSON — documentation label, not an automatic enforcer).  
- Use existing **diagnostic** routes (e.g. SendGrid auth check / sandbox-send) **only** under explicit operator approval and process — this slice does not invoke them from the new readiness route.

---

## Offline validation

```bash
cd H:\SOSWebsite\RedDirt
node scripts/validate-email-sandbox-send-proof.mjs
node scripts/build-email-sandbox-send-proof-report.mjs
```

Artifacts: [`data/email-sandbox-send-proof-contract.json`](../data/email-sandbox-send-proof-contract.json), report + next steps + `develop_notes/REDDIRT_EMAIL_SANDBOX_SEND_PROOF_1_0_REPORT.md`.

---

## Companion docs

- [`communication-command-center-readiness.md`](./communication-command-center-readiness.md)  
- [`gmail-calendar-oauth-proof.md`](./gmail-calendar-oauth-proof.md)  
- [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md)

---

*Rotate `ADMIN_DIAGNOSTIC_TOKEN` in Netlify if it was ever exposed; never paste bearer tokens into chat.*
