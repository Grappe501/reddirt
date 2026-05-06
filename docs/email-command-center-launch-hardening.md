# Email Command Center — Launch Hardening

**Packet:** **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Purpose:** Operator-first **route health** inventory, **safe-now vs blocked** clarity, **no-send** posture, and pointers to first-run + staging docs. **Not** a security audit.

**Companion:** [`email-command-center-first-run-operator-checklist.md`](./email-command-center-first-run-operator-checklist.md) · [`email-command-center-selective-staging-guide.md`](./email-command-center-selective-staging-guide.md) · [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md)

---

## Status summary

| Dimension | Today |
|-----------|--------|
| **Operator posture** | **Operator-ready, execution-gated** — triage, drafts, readiness, and doctrine surfaces are usable daily; **no** Command Center provider send, **no** mass mail, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** remains **false**. |
| **Send Packet Builder** | **Panel on Message Studio** (`/message-studio#send-packet-builder`) — **not** a separate App Router path. |
| **Sanity script** | `npm run email:no-send-scan` — heuristic grep over `src/` (warnings only; **no** secret printing). |

---

## Route health inventory

Paths are under **`https://<host>`** in production; table uses **path only**.

| Route | Purpose | Current state | Safe to use now? | Blocked / degraded when | No-send | Smoke expectation |
|-------|---------|---------------|------------------|---------------------------|---------|---------------------|
| `/admin/workbench/email-command-center/daily` | **Daily Operator Console** — snapshot priorities, next actions, work queue, local draft stats | **Live** | **Yes** (UI always loads; DB-backed cards may show zeros if DB unreachable) | DB unreachable → follow Readiness; counts advisory | **Yes** — no send UI | Page loads; badges **No live sends**; links work |
| `/admin/workbench/email-command-center` | **Cockpit** — queue/readiness/Gmail/Message Studio cards | **Live** | **Yes** | Same as snapshot `operatorGate` | **Yes** | Cockpit renders; **operator-ready, execution-gated** copy visible |
| `/admin/workbench/email-command-center/map` | Route map + flows | **Live** | **Yes** | None material | **Yes** | All ECC routes listed |
| `/admin/workbench/email-command-center/readiness` | Checklist from snapshot | **Live** / **Partial** | **Yes** | Rows may show blocked/partial without DB | **Yes** | Rows render; links open |
| `/admin/workbench/email-command-center/gmail` | Gmail monitor / OAuth entry | **Partial** | **Yes** for navigation; OAuth requires env | Missing OAuth / DB → guided empty states | **Yes** | No send buttons |
| `/admin/workbench/email-command-center/gmail/connect` | OAuth connect helper (subset of Gmail flow) | **Partial** | **Yes** when steered to connect | Same as Gmail | **Yes** | Completes OAuth per docs; **no** ECC mass send |
| `/admin/workbench/email-command-center/gmail/review` | Metadata review → manual queue create | **Partial** | **Yes** when Gmail linked | No OAuth / no sync → operator message | **Yes** — manual create only | Create-from-metadata path documented |
| `/admin/workbench/email-queue` | Email workflow queue | **Live** | **Yes** | DB down → error/empty per app | **Yes** | List loads or graceful error |
| `/admin/workbench/email-queue/[id]` | Item detail + AI + profile panels | **Live** / **Partial** | **Yes** | DB down | **Yes** | No dispatch/send from ECC panels |
| `/admin/workbench/email-command-center/profiles` | Profile / hint review | **Live** / **Partial** | **Yes** | DB down → empty + copy | **Yes** | Approve/reject paths when DB OK |
| `/admin/workbench/email-command-center/audiences` | Audience definitions + previews | **Live** / **Partial** | **Yes** | DB down | **Yes** — no SendGrid sync | Previews when facts exist |
| `/admin/workbench/email-command-center/imports` | CSV staging list | **Live** / **Partial** | **Yes** for UI | **Real** commit path needs hosted DB gate (operator doc) | **Yes** — no SendGrid | Upload/list or empty |
| `/admin/workbench/email-command-center/imports/[id]` | Batch detail validate → approve → commit | **Live** / **Partial** | **Yes** when DB healthy | Wrong DB / gate failed → do not commit production lists | **Yes** | Batch workflow matches doc |
| `/admin/workbench/email-command-center/sendgrid` | SendGrid foundation / suppressions UI | **Partial** | **Yes** for doctrine + counts when DB OK | DB/env missing → zeros + warnings | **Yes** — receive/intake posture | No broadcast send |
| `/admin/workbench/email-command-center/message-studio` | Local drafts, Campaign Voice, Editorial, templates, **Send Packet** (`#send-packet-builder`) | **Live** | **Yes** | OpenAI optional; drafts **browser-only** | **Yes** | Autosave local; export/copy only |
| `/admin/workbench/email-command-center/automation` | Automation Studio **shell** | **Live** | **Yes** | N/A | **Yes** — **no activation** | Static maps |
| `/admin/workbench/email-command-center/analytics` | Analytics & deliverability **shell** | **Live** / **Partial** | **Yes** | DB down → degraded numbers | **Yes** | Read-only |
| `/admin/workbench/email-command-center/send-execution` | Send Execution Governance **doctrine** | **Live** | **Yes** | N/A | **Yes** — **doctrine only** | Checklist + blocked panel |

**Also:** `…/gmail/connect` — OAuth connect helper (partial; env-dependent). Treat as part of Gmail column for smoke.

---

## Remaining blockers (launch ≠ execution)

1. **Hosted Supabase / canonical DB verification** — operator-run `npm run email:contact-import:gate` (and diagnose) on **target** `DATABASE_URL`; wrong DB ⇒ wrong suppressions/audiences.  
2. **SendGrid contact sync** — not shipped from Command Center; foundation ≠ list execution.  
3. **Server / shared Message Studio draft persistence** — still `localStorage` per browser.  
4. **Governed provider send execution** — **`EMAIL-SEND-EXECUTION-1.0`** (future).  
5. **Production automation activation** — **`EMAIL-AUTOMATION-STUDIO-1.1`** (future).

---

## Checks (repo)

```bash
cd H:\SOSWebsite\RedDirt
npm run typecheck
npm run check
npm run email:no-send-scan
```

### Expected `email:no-send-scan` baseline (not failures)

The scan is **heuristic**. A clean operator posture may still print **warnings** for known **non–Email Command Center** integration seams:

1. **`src/lib/integrations/gmail/gmail-api.ts`** — references Gmail **send** API (workbench / integration path; **not** “send from queue” in ECC).
2. **`src/lib/integrations/sendgrid/env.ts`** — reads `process.env.SENDGRID_API_KEY` outside `src/lib/sendgrid/` + `src/app/api/sendgrid/` (integration env helper).

**New** warnings outside those files warrant a human diff review.

---

*Last updated: **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0**.*
