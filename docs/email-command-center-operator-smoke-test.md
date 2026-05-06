# Email Command Center — operator smoke test

**Packet:** **EMAIL-COMMAND-CENTER-FINAL-POLISH-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Purpose:** Manual QA path to confirm every Email Command Center surface loads, governance copy is visible, and **no send execution** appears in these routes.

**Companion:** **[`email-command-center-operator-manual.md`](./email-command-center-operator-manual.md)** — how staff run these surfaces **day to day** (this smoke test is **click-order QA**, not the full manual).

**Rules:** Use fake data only (`@example.com`, placeholder text). Do not paste secrets. **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** must remain **false** (do not change in code during this test).

---

## Prerequisites

- From `RedDirt/`: `npm run typecheck` and `npm run check` pass on the branch you are testing.
- Admin access to `/admin/workbench/*`.
- Optional: `OPENAI_API_KEY` set if you want to exercise queue AI (step 8).

---

## Steps

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Open **`/admin/workbench/email-command-center`** | Cockpit loads; “Do not send from here” rail visible; DB/migration banners match your environment (or degraded message if DB down). |
| 2 | Open **`/admin/workbench/email-command-center/map`** | Route map loads; route cards show live/partial/future; four flow sections visible; links back to cockpit + readiness work. |
| 3 | Open **`/admin/workbench/email-command-center/readiness`** | Checklist loads; statuses reflect snapshot (DB down → blocked/partial where appropriate); send execution rows show **Future**. |
| 4 | Open **`/admin/workbench/email-command-center/gmail`** | Gmail monitor loads; OAuth/sync/watch copy present; no send-from-UI. |
| 5 | Open **`/admin/workbench/email-command-center/gmail/review`** | Review page loads; governance box present; empty inbox shows **next steps** (sync + monitor) when list empty; no body text. |
| 6 | Open **`/admin/workbench/email-queue`** | Queue list loads; filters work; no “Send email” execution from queue. |
| 7 | Open any **`/admin/workbench/email-queue/[id]`** (or create manual item from queue page if none exist) | Detail loads; triage actions available; **no** provider send button tied to `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`. |
| 8 | On queue detail, open **AI Email Intelligence** panel | If `OPENAI_API_KEY` missing: “not configured” copy. If present: run analysis succeeds or shows clear error — still **no** auto-status change from AI alone. |
| 9 | Open **`/admin/workbench/email-command-center/profiles`** | Profile review loads; empty suggestions show **why empty + next step** links; governance list present. |
| 10 | Open **`/admin/workbench/email-command-center/audiences`** | Audience Studio loads; building blocks / clusters empty states explain **approve facts first** where applicable; governance present. |
| 11 | Open **`/admin/workbench/email-command-center/imports`** | Imports loads; empty batch table shows **upload + readiness** guidance; governance present. |
| 12 | Open **`/admin/workbench/email-command-center/sendgrid`** | SendGrid Foundation loads; env cards show set/missing **names only**; empty events/suppressions show **wire webhook / migrate** guidance; no send CTA. |
| 13 | Open **`/admin/workbench/email-command-center/message-studio`** | Message Studio loads; draft types visible; **operator start** links to map/readiness/queue; no send buttons. |
| 14 | Open **`/admin/workbench/email-command-center/automation`** | Automation Studio loads; tiers + trigger tables visible; **first-time** guidance if shown; “Activated automation: None”. |
| 15 | Open **`/admin/workbench/email-command-center/analytics`** | Analytics loads; queue + intelligence sections render; SendGrid section env-only; governance footer present. |
| 16 | Spot-check **no send buttons** on the routes above | No “Send broadcast”, “Send now”, or Gmail send-from-queue on these Command Center pages. (Workbench comms may still exist elsewhere — out of scope.) |
| 17 | Spot-check **governance warnings** | Rose/amber panels mention no-send, no auto-profile merge, suppression honor, import consent posture where relevant. |
| 18 | From `RedDirt/`, run **`npm run check`** | Completes successfully (warnings in unrelated files are acceptable if already baseline). |

---

## Failure triage (quick)

| Symptom | Likely cause | Safe next step |
|--------|--------------|----------------|
| Blank counts / all zeros on cockpit + analytics | `DATABASE_URL` unreachable | `npm run email:db:diagnose` from `RedDirt/` |
| Migrations banner on cockpit | ECC migrations not applied on this DB | `npx prisma migrate deploy` when steering allows — **not** part of this smoke test’s scope |
| Gmail review “not connected” | Staff Gmail not linked | Gmail monitor → connect OAuth |
| Queue AI not configured | Missing `OPENAI_API_KEY` | Set server env in deployment; never paste key in chat |

---

*Companion: [`email-dashboard-operator-runbook.md`](./email-dashboard-operator-runbook.md) · [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)*
