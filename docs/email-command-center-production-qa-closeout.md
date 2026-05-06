# Email Command Center — Production QA Closeout

**Packet:** **EMAIL-COMMAND-CENTER-PRODUCTION-QA-CLOSEOUT-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Mode:** Final QA, inventory cross-check, safety verification, staging guidance — **no new product features** in this packet.

**Companion:** [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md) · [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md) · [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) · [`email-command-center-selective-staging-guide.md`](./email-command-center-selective-staging-guide.md) · **[`email-command-center-morning-upgrade-closeout.md`](./email-command-center-morning-upgrade-closeout.md)** (follow-on morning verify after stacked upgrades)

---

## Executive summary

| Item | Status (this QA pass) |
|------|------------------------|
| **`npm run email:db:diagnose`** | **PASS** — `DATABASE_URL` / `DIRECT_URL` **loopback** `127.0.0.1:5433`; TCP + Prisma `SELECT 1` **ok**; **`prisma migrate status`** clean; **ECC migration rows** all **applied**. |
| **`npm run typecheck`** | **PASS** (exit 0). |
| **`npm run check`** | **PASS** (exit 0) — lint **warnings** repo-wide (pre-existing noise); **Next.js build** completed. |
| **`npm run email:no-send-scan`** | **WARN** — **expected** integration/comms baseline hits; script reports **ECC paths clean**. |
| **Hosted Kelly-Grappe-App gate** | **Not claimed** — diagnose target was **local Docker**, not `*.supabase.co`. |
| **Real provider sends tested** | **Not claimed** — Send Execution path is **built + gated**; operator-proven test/broadcast remains **Steve-owned**. |

**Ledger rubric (honest %):**

- **~99%** overall if Send Execution is **built** but **no** real sends were operator-tested on the intended stack.
- **~99.5%** overall when **EMAIL-SEND-EXECUTION-1.0** (governed ops) **plus** **EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0** **plus** **EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0** **plus** **EMAIL-AUTOMATION-POLICY-ACTIVATION-1.0** (read-only policy eval) **plus** stacked doc/operator packets through **EMAIL-COMMAND-CENTER-MORNING-QA-CLOSEOUT-1.0** are **reflected in repo** — still **not** a proof of live mail.
- **Deployment / Env Readiness** stays **lower** until **hosted** `DATABASE_URL` / `DIRECT_URL` Kelly-Grappe-App chain passes (see ledger layer **14**).

---

## Email Command Center progress ledger (snapshot)

Primary bar: **[`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)**.

| Layer | ~% (ledger) | QA note |
|-------|-------------|---------|
| 1. Command Center Shell / Cockpit | **100** | Routes present; cockpit links verified in inventory. |
| 2. Email Queue / Triage | **93** | No queue send; `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` **false**. |
| 3–5. Gmail OAuth / Metadata / Watch | **80 / 88 / 82** | Production watch hardening shipped; hosted renew proof still operator-owned. |
| 6. SendGrid Foundation | **90** | Events + suppressions + contact sync + governed mail send path in code; hosted gate for upsert/send. |
| 7. OpenAI Email Intelligence | **70** | Advisory only; key-gated. |
| 8–9. Profiles / Audiences | **72 / 80** | Preview/staging posture; no auto-SendGrid from hints. |
| 10. Message Studio | **98** | Local + shared drafts; no send from Studio. |
| 11. Automation Studio | **88** | **Policy evaluations** read-only; **no** worker activation. |
| 12. Analytics / Deliverability | **89** | Reconciliation UI + snapshot fields. |
| 13. Governance / Compliance Rails | **100** | Doctrine + scan + docs. |
| 14. Deployment / Env Readiness | **88** | **Local** diagnose green this pass; **hosted** verification still required for production claims. |
| **15. Overall Email Command Center** | **99.5** | Matches shipped packets in ledger intro; **not** operator send proof. |

---

## Route checklist (operator smoke order)

Prefix every path with **`/admin/workbench`** except the queue (listed as full path below).

| # | Surface | Path (suffix after `/admin/workbench/`) | Anchors / notes |
|---|---------|----------------------------------------|-----------------|
| 1 | **Daily** | `/email-command-center/daily` | Priorities, policy warnings, work queue. |
| 2 | **Command Center** | `/email-command-center` | Cockpit, `operatorGate` when DB unhealthy. |
| 3 | **Map** | `/email-command-center/map` | Flow cards. |
| 4 | **Readiness** | `/email-command-center/readiness` | Snapshot checklist. |
| 5 | **Gmail** | `/email-command-center/gmail` | Monitor + production watch strip. |
| 6 | **Queue** | `/email-queue` and `/email-queue/[id]` | Full paths from site root under `/admin/workbench/`. |
| 7 | **Profiles** | `/email-command-center/profiles` | Suggestions → approve path. |
| 8 | **Audiences** | `/email-command-center/audiences` | Previews; contact sync link out. |
| 9 | **Imports** | `/email-command-center/imports` (+ `[id]`) | Staged CSV; commit gated on hosted DB. |
| 10 | **SendGrid** | `/email-command-center/sendgrid` | `#contact-sync`, reconciliation strip. |
| 11 | **Message Studio** | `/email-command-center/message-studio` | Base drafting surface. |
| 12 | **Shared Drafts** | same + **`#shared-drafts`** | Postgres `MessageStudioDraft`. |
| 13 | **Editorial Review** | same + **`#editorial-review-desk`** | Local draft editorial fields. |
| 14 | **Send Packet** | same + **`#send-packet-builder`** | Client review artifact; **no** send. |
| 15 | **Send Execution** | `/email-command-center/send-execution` | Doctrine + **`#ops`** governed SendGrid mail UI (**gated**). |
| 16 | **Automation** | `/email-command-center/automation` | Policy evaluations table; **Evaluate policies now** = revalidate only. |
| 17 | **Analytics** | `/email-command-center/analytics` | **`#reconciliation`** operator reconcile forms. |

---

## Migrations relevant to overnight Email Command Center stack

**No new migrations** in **EMAIL-COMMAND-CENTER-PRODUCTION-QA-CLOSEOUT-1.0** (docs + QA only).

**Email / ECC-related migrations** applied on the DB used for this diagnose (subset; see diagnose output for full ECC list):

| Migration folder | Packet context |
|------------------|----------------|
| `20260504120000_email_workflow_e1` | E-1 queue |
| `20260505190000_staff_gmail_sync_state` | Gmail sync state |
| `20260505203000_email_contact_profile_graph` | Profile graph |
| `20260505220000_email_audience_studio_foundation` | Audience studio |
| `20260506120000_email_sendgrid_foundation` | SendGrid foundation |
| `20260507180000_email_contact_import_staging` | Import staging |
| `20260508120000_message_studio_server_drafts` | Shared Message Studio drafts |
| `20260509120000_sendgrid_contact_sync_run` | Contact sync runs |
| `20260510140000_email_send_execution` | Send execution + recipients + approvals |

---

## Local vs hosted DB status

| Target | This pass |
|--------|-----------|
| **Local Docker** (`127.0.0.1:5433`, `reddirt`) | **Healthy** — parse ok, DNS ok, connection ok, Prisma query ok, migrate status clean, ECC rows applied. |
| **Supabase SSR** (`NEXT_PUBLIC_SUPABASE_*`) | **Partial** — `NEXT_PUBLIC_SUPABASE_URL`: present; **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`**: absent (SSR client not “complete” per diagnose). |
| **Hosted Kelly-Grappe-App** | **Not exercised** — `DATABASE_URL` did **not** match hosted Supabase hostname heuristic. **Operator** must point env at hosted URLs and re-run diagnose → migrate status/deploy → `email:command-center:preflight` → `email:contact-import:gate` per runbooks. |

---

## No-send scan

- **Result:** **WARN** (expected).  
- **Meaning:** Known **integration / comms** files still contain `sendgrid.send` / Gmail `users.messages.send` patterns **outside** ECC “no new send seams” expectation.  
- **ECC:** Script message: **ECC paths clean.**  
- **Governance constant:** `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` remains **`false`** in `src/lib/email-workflow/governance.ts` — do **not** flip without explicit packet + review.

---

## What is safe to use now

Same as [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) **§ What is safe to use now**, plus:

- **Automation Studio — Policy evaluations:** Read-only snapshot signals; **Evaluate policies now** only **revalidates** pages (no workers, no sends).  
- **Analytics — Reconciliation:** Operator-initiated Postgres reconcile actions only (**no** SendGrid API send).  
- **Send Execution — `#ops`:** Governed SendGrid mail **only** through existing final gates (preflight, suppression, ASM for broadcast, hosted DB gate where coded) — treat **production** use as **blocked** until hosted verification + operator test plan complete.

---

## What remains blocked / Steve-owned

1. **Hosted Kelly-Grappe-App** full chain on **production** URLs.  
2. **Operator-proven** SendGrid **test** + **broadcast** (and Gmail one-to-one if steered) — code may exist; **proof** does not.  
3. **Automation worker / cron activation** — **EMAIL-AUTOMATION-STUDIO-1.1** or explicit future packet only.  
4. **Pub/Sub auto-fetch / auto-queue** from Gmail — still not claimed as production-safe without separate packet.

---

## Tomorrow operator steps

1. Re-run **`npm run email:db:diagnose`** on the **machine and env** you will use tomorrow (confirm target DB).  
2. If on **hosted** Supabase: follow **`KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0`** chain in launch hardening + contact import readiness doc.  
3. Walk **[Route checklist](#route-checklist-operator-smoke-order)** top to bottom; note any **auth** or **env** gaps.  
4. Optional: **`npm run email:contact-import:gate`** when imports are in scope for that DB.  
5. **`npm run email:no-send-scan`** before merge when ECC files changed.  
6. **`npm run check`** before push.

---

## Git / staging advice (human-in-the-loop)

- **Do not** `git add` **`.env`**, **`.env.*`**, **`.env.local`**, or secrets exports — ever.  
- **Review** `prisma/schema.prisma` whenever migrations or models were part of the overnight stack (this closeout packet adds **none**).  
- **Review** `package-lock.json` if `package.json` changed (scripts/deps) — confirm no accidental major bumps.  
- **Packet-based commits** (suggested buckets for the current dirty tree — adjust to what you actually keep):

| Suggested commit theme | Typical paths |
|------------------------|----------------|
| Gmail production watch | `src/lib/email-command-center/gmail-production-watch.ts`, `scripts/gmail-watch-renewal-check.*`, `src/lib/gmail/monitor-read-model.ts`, `…/gmail/page.tsx`, `package.json` if script added |
| SendGrid reconciliation | `sendgrid-event-reconciliation.ts`, `sendgrid-event-reconciliation-actions.ts`, Analytics/SendGrid pages + views |
| Send execution + mail | `send-execution.ts`, `mail-send.ts`, `email-send-execution-actions.ts`, `SendExecution*.tsx` |
| Contact sync | `sendgrid-contact-sync.ts`, `…/sendgrid/page.tsx` |
| Automation policy eval | `automation-policies.ts`, `automation-policy-runner.ts`, `automation-policy-eval-actions.ts`, `AutomationStudioView.tsx`, `DailyOperatorConsoleView.tsx`, `read-model.ts`, `automation/page.tsx` |
| Docs / maps | `docs/**` including this file, ledger, route inventory, launch hardening, handoff, `PROJECT_MASTER_MAP`, `THREAD_HANDOFF`, `DIVISION_MASTER_REGISTRY` |

- **List new untracked files** (as of QA closeout authoring — verify with `git status` before commit):

  - `scripts/gmail-watch-renewal-check.impl.ts`, `scripts/gmail-watch-renewal-check.mjs`  
  - `src/app/admin/automation-policy-eval-actions.ts`  
  - `src/app/admin/sendgrid-event-reconciliation-actions.ts`  
  - `src/lib/email-command-center/automation-policies.ts`  
  - `src/lib/email-command-center/automation-policy-runner.ts`  
  - `src/lib/email-command-center/gmail-production-watch.ts`  
  - `src/lib/email-command-center/sendgrid-event-reconciliation.ts`  
  - `docs/email-command-center-production-qa-closeout.md` (this file)

---

## What landed overnight (summary for humans)

Repo currently carries (among prior ECC work): **Gmail production watch hardening** (readiness + CLI dry-run + snapshot fields), **SendGrid event → recipient reconciliation** (read + operator reconcile), **governed SendGrid mail send execution** (`#ops` + libraries + actions), **Marketing Contacts upsert execution** for approved sync runs, **read-only automation policy evaluation** (registry + runner + Automation/Daily surfaces), and **this QA closeout** documentation. **No** automation activation, **no** `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` flip, **no** new migrations in the QA packet itself.

---

*Last updated: **EMAIL-COMMAND-CENTER-PRODUCTION-QA-CLOSEOUT-1.0** — 2026-05-06 QA pass on local Docker Postgres (`127.0.0.1:5433`).*
