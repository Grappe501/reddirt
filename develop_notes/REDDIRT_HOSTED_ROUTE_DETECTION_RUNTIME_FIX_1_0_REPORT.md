# REDDIRT_HOSTED_ROUTE_DETECTION_RUNTIME_FIX_1_0_REPORT

**Lane:** RedDirt only  
**Generated:** 2026-05-07  
**Scope:** Readiness route detection, validators, docs — no live send, no deploy.

---

## Issue summary

Hosted Netlify responses for `GET /api/admin/communication-command-center/gmail-calendar-readiness` and `email-sandbox-readiness` reported OAuth/SendGrid diagnostic routes as **missing** (`*RoutePresent: false`) even though the application served those routes. Operators saw **`ok: false`** for a **filesystem artifact** reason, not because OAuth failed or the database was wrong.

---

## Root cause

Readiness libraries used **`existsSync`** on paths under **`process.cwd()` + `src/app/api/.../route.ts`**. That tree exists in a developer checkout but is **often absent** inside the serverless function bundle. Main Communication Command Center readiness already avoided false negatives when **`src/app/api`** was missing; Gmail/Calendar and email-sandbox slices duplicated a **narrow** `routeFileExists` without that **hosted static route contract** fallback.

---

## Files changed

| Area | Path |
|------|------|
| Core helper | `src/lib/communication-command-center/readiness.ts` — export **`resolveApiRouteHandlerPresent`**, **`resolveRoutePresence`** uses it |
| Gmail/Calendar readiness | `src/lib/communication-command-center/gmail-calendar-readiness.ts` — route flags via helper |
| Email sandbox readiness | `src/lib/communication-command-center/email-sandbox-readiness.ts` — SendGrid route flags via helper |
| Validators | `scripts/validate-gmail-calendar-oauth-proof.mjs`, `scripts/validate-email-sandbox-send-proof.mjs`, `scripts/validate-communication-command-center-readiness.mjs` |
| Docs | `docs/communication-command-center-readiness.md`, `docs/gmail-calendar-oauth-proof.md`, `docs/email-sandbox-send-proof.md` |
| This report | `develop_notes/REDDIRT_HOSTED_ROUTE_DETECTION_RUNTIME_FIX_1_0_REPORT.md` |

---

## Gmail/Calendar hosted behavior

- **Route booleans** (`oauthStartRoutePresent`, `oauthCallbackRoutePresent`, `pubsubRoutePresent`, calendar callback/cron/webhook) use **`resolveApiRouteHandlerPresent`**: **on disk** when `src/app/api` exists; **contract `true`** when the API root folder is missing (bundle), matching main CCC readiness.
- **`ok`** still requires **no-send posture** (`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM === false`), all Gmail+Calendar route flags true (now achievable on Netlify), and unchanged metadata/token readiness logic.
- **Does not** call Google APIs, OAuth start/callback URLs, or send mail from the readiness function.

---

## Email Sandbox hosted behavior

- **SendGrid** `authCheckRoutePresent` / `sandboxSendRoutePresent` use the **same helper**; no false “missing route” from bundle layout alone.
- **`providers.gmail.oauthReady`** still depends on **`getGmailCalendarOAuthReadiness()`** (fixed) plus preconditions.
- **Overall `ok`** still requires hosted DB proof, CCC readiness, **`data/gmail-calendar-oauth-proof-contract.json`** with **`status: "pass"`** on the server where applicable, **`noSendPosture`**, and SendGrid route flags — **unchanged policy**, only route detection corrected.

---

## Safety posture

- Readiness libraries keep explicit **`…Approved: false`** literals for Gmail, SendGrid live, Twilio SMS, contact import, automation workers (and sandbox **`bulkSendApproved: false`**).
- **`ADMIN_DIAGNOSTIC_TOKEN`** remains supported as **fallback** after **`EMAIL_DIAGNOSTICS_TOKEN`** in diagnostics route **`getConfiguredDiagnosticsSecret()`** (primary read first; typo **`ADMIN_DIAGNOSTICS_TOKEN`** must not appear).
- Validators enforce: no **`users.messages.send`** / SendGrid **`send(`** / Twilio **`messages.create`** in readiness surfaces; bundle-safe route contract in **`readiness.ts`**; no direct **`path.join(process.cwd(), "src", "app", "api"`** in Gmail/Calendar or email-sandbox readiness libs for route detection.

---

## Checks

Run from `H:\SOSWebsite\RedDirt`:

```bash
node scripts/validate-gmail-calendar-oauth-proof.mjs
node scripts/validate-email-sandbox-send-proof.mjs
node scripts/build-gmail-calendar-oauth-proof-report.mjs
node scripts/build-email-sandbox-send-proof-report.mjs
node scripts/validate-communication-command-center-readiness.mjs
npm run typecheck
npm run check
npm run email:no-send-scan
```

Record stdout exit codes in CI or operator notes after deploy approval.

---

## What remains blocked

- **Live send**, list/blast outreach, volunteer/voter sends — not authorized by these readiness endpoints.
- **Deploy / production cutover** — only after Steve/operator review; this report does not approve deploy.
- **Gmail SendGrid Twilio execution** from readiness routes — still read-only JSON.

---

## Next recommended slice

- **Post-deploy verification:** hit bearer-protected readiness URLs on Netlify and confirm Gmail/Calendar and email-sandbox **`ok`** align with DB + artifact gates (not only route flags).
- **Operator OAuth proof:** run Gmail then Calendar connection flows in staging/production as already documented; then optional single internal sandbox send **only** under separate written approval.

---

## Final Cursor response format

Use the structured block in the agent reply: **IMPLEMENTED**, **FILES**, **ROOT CAUSE**, **GMAIL/CALENDAR FIX**, **EMAIL SANDBOX FIX**, **SAFETY LOCKS**, **CHECKS**, **WHAT IS SAFE NOW**, **WHAT REMAINS BLOCKED**, **NEXT RECOMMENDED SLICE**.
