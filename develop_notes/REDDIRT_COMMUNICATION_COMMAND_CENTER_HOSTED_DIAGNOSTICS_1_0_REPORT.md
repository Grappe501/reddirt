# REDDIRT-COMMUNICATION-COMMAND-CENTER-HOSTED-DIAGNOSTICS-1.0 — Report

**Lane:** `RedDirt/` only · **Date:** 2026-05-07

## Mission

First **hosted** Communication Command Center diagnostics layer: bearer JSON + admin dashboard for **controlled connection tests**, with explicit **no-send** posture. Does **not** enable live Gmail send, SendGrid mail send, Twilio SMS, social posting, contact import execution, or automation workers.

## Delivered

| Area | Path / artifact |
|------|------------------|
| Readiness builder | `src/lib/communication-command-center/readiness.ts` — `getCommunicationCommandCenterReadiness()` reuses **`getHostedDbProofSummary()`** for **`database.reachable`** / **`productionCanonical`**; **`information_schema`** probes for eight public tables; **`routes`** from `src/app/api/**/route.ts` presence (or all `true` when `src/app/api` absent in bundle); **`safety`** constants + **`noSendPosture`** from **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`**. |
| HTTP API | `GET` **`/api/admin/communication-command-center/readiness`** — same bearer + timing-safe digest pattern as **`hosted-db/route.ts`**. |
| Admin UI | **`/admin/workbench/communication-command-center/readiness`** — server-rendered dashboard. |
| Email Command Center | Readiness page **no-send** card + nav link to comms diagnostics. |
| Contract JSON | `data/communication-command-center-readiness-contract.json` |
| Launch report | `data/communication-command-center-launch-report.json` (from `node scripts/build-communication-command-center-launch-report.mjs`) |
| Scripts | `scripts/validate-communication-command-center-readiness.mjs` · `scripts/build-communication-command-center-launch-report.mjs` |
| Docs | `docs/communication-command-center-readiness.md` + updates to launch hardening, **PROJECT_MASTER_MAP**, **THREAD_HANDOFF**, **progress ledger**. |

## Commands run (agent)

- `node scripts/validate-communication-command-center-readiness.mjs` — **PASS**
- `node scripts/build-communication-command-center-launch-report.mjs` — wrote launch report

## Operator probe (PowerShell pattern)

Use the **same** bearer as hosted DB proof; **never** paste the token into chat.

```powershell
$Site = "https://kgrappe.netlify.app"
$Headers = @{ Authorization = "Bearer <EMAIL_DIAGNOSTICS_TOKEN>" }
Invoke-RestMethod -Uri "$Site/api/admin/communication-command-center/readiness" -Method GET -Headers $Headers
```

## Safety

- **GET-only** route; no writes, no migrations, no provider sends triggered by this slice.
- JSON contains **no** secrets.

## Next

Gmail OAuth proof, Calendar proof, Twilio webhook proof (per **`nextRecommendedStep`** in JSON), then native Text + Reach MVP — still under separate execution packets; **live send** remains Steve-gated.
