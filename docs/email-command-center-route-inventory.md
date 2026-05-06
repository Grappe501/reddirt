# Email Command Center — Route Inventory

**Packet:** **EMAIL-COMMAND-CENTER-CLOSEOUT-1.0** + **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Companion:** [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md) · [`email-command-center-operator-smoke-test.md`](./email-command-center-operator-smoke-test.md) · [`email-command-center-closeout-2026-05-05.md`](./email-command-center-closeout-2026-05-05.md) · [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) · [`email-command-center-first-run-operator-checklist.md`](./email-command-center-first-run-operator-checklist.md)

This document inventories **admin workbench** routes that belong to the **Email Command Center** narrative (cockpit, map, readiness, Gmail, queue, profiles, audiences, imports, SendGrid foundation, message planning, automation shell, analytics shell, **send execution governance**). Paths are **relative to the site root** (full path prefix: `/admin/workbench/…`).

**Legend — status**

| Status | Meaning |
|--------|---------|
| **Live** | Route renders for authorized operators; core read paths work when DB/auth env allow. |
| **Partial** | Route is real but depends on credentials, manual steps, or future execution packets. |
| **Future** | Documented intent only; execution or automation not shipped on this surface. |

**Governance (all rows):** **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** remains **`false`** — no SendGrid broadcast send, no Gmail send-from-queue, no auto-reply from **`EmailWorkflowItem`**. Optional workbench Gmail send scope is **separate** from email-workflow execution.

**Launch posture:** ECC is **operator-ready, execution-gated** — Daily + cockpit + Message Studio + governance are safe for daily triage and drafting; provider execution and automation activation remain **future** packets. Heuristic **`npm run email:no-send-scan`** is a sanity aid, not a security proof.

---

## Core cockpit and operator guidance

### `/admin/workbench/email-command-center`

| Field | Detail |
|--------|--------|
| **Status** | **Live** |
| **Purpose** | Command Center cockpit — queue snapshot, integration readiness (env **names** only), links into every ECC surface. |
| **Can do today** | Navigate to Gmail, queue, **Daily Operator Console** (`/daily`), map, readiness, profiles, audiences, imports, SendGrid, Message Studio, Automation, Analytics; see **operatorGate** when DB/migration checks fail. |
| **Cannot do** | Send mail; auto-sync Gmail bodies; auto-create queue rows from Pub/Sub; change hosted DB state. |
| **Upstream** | Workbench auth; Postgres for counts. |
| **Downstream** | Any route in this inventory; **map** and **readiness** for orientation. |
| **Smoke expectation** | Page loads; **Do not send** / **operator-ready, execution-gated** copy visible; quick links resolve. |
| **Governance** | Read-only re external APIs; queue remains on **`/admin/workbench/email-queue`**. |

### `/admin/workbench/email-command-center/map`

| Field | Detail |
|--------|--------|
| **Status** | **Live** |
| **Purpose** | Visual/text **system map** — route cards, inbound / import / broadcast / suppression flows. |
| **Can do today** | Read how surfaces connect; follow links to list routes (queue item uses list + manual open pattern). |
| **Cannot do** | Mutate data; substitute for **`readiness`** checklist verification. |
| **Upstream** | Cockpit, operator docs. |
| **Downstream** | Target routes per card. |
| **Smoke expectation** | All cards render; safety notes visible. |
| **Governance** | Describes **partial/future** honestly — no send. |

### `/admin/workbench/email-command-center/daily`

| Field | Detail |
|--------|--------|
| **Status** | **Live** |
| **Purpose** | **EMAIL-DAILY-OPERATOR-CONSOLE-1.0** — start-of-day console: snapshot **today’s priorities** (queue, profiles, imports, audiences, SendGrid signals, AI-analyzed count), **rule-based next actions**, ordered **operator work queue** links, **client-only** Message Studio draft summary from **`localStorage`** (this browser). |
| **Can do today** | Open linked surfaces; see degraded copy when DB unreachable; refresh draft counts by revisiting (no server persistence of drafts). |
| **Cannot do** | Send mail; write Postgres; upload local draft payloads; activate automation. |
| **Upstream** | **`getEmailCommandCenterSnapshot`**; browser **`reddirt:email-command-center:message-studio-drafts:v1`**. |
| **Downstream** | Queue, Gmail review/monitor, profiles, imports, audiences, Message Studio (**`#editorial-review-desk`**), send governance, analytics, automation, readiness, map. |
| **Smoke expectation** | Page loads; badges + next-actions visible; DB-unavailable banner when snapshot degraded. |
| **Governance** | **No demo mode**; queue-first; review-first; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged **false**. |

### `/admin/workbench/email-command-center/readiness`

| Field | Detail |
|--------|--------|
| **Status** | **Live** (data **partial** when DB or keys missing) |
| **Purpose** | Operator checklist from **`getEmailCommandCenterSnapshot`** — local vs hosted gates, Gmail, SendGrid, OpenAI, imports, etc. |
| **Can do today** | See **ready / partial / blocked / future** rows; follow verify links/commands where shown. |
| **Cannot do** | Certify hosted Kelly/Supabase DB without operator-run gate on that env. |
| **Upstream** | Cockpit; snapshot read model. |
| **Downstream** | Preflight scripts (`email-command-center-preflight`, `email:db:diagnose`, `email:contact-import:gate` per runbook). |
| **Smoke expectation** | Page loads; hosted sections stay **partial** until explicitly verified. |
| **Governance** | Send execution and automation activation remain **blocked/future**. |

---

## Gmail

### `/admin/workbench/email-command-center/gmail`

| Field | Detail |
|--------|--------|
| **Status** | **Partial** — requires **StaffGmailAccount** OAuth and operator actions |
| **Purpose** | Gmail monitor — connection status, **manual** metadata sync, watch start/renew/stop, history preview counts. |
| **Can do today** | Run safe metadata sync; manage watch where configured; see Pub/Sub scaffold status. |
| **Cannot do** | Auto-fetch full messages into queue; send from email workflow. |
| **Upstream** | OAuth (`/api/gmail/oauth/*`); **`gmailSyncState`**. |
| **Downstream** | **`…/gmail/review`**, **`…/gmail/connect`** (shim). |
| **Smoke expectation** | Page loads; without OAuth, shows connect guidance. |
| **Governance** | **METADATA**-class operations on monitor; no bodies in sync path as designed. |

### `/admin/workbench/email-command-center/gmail/review`

| Field | Detail |
|--------|--------|
| **Status** | **Partial** |
| **Purpose** | INBOX list (**METADATA**); operator **manually** creates **`EmailWorkflowItem`** with **`metadataJson.gmailReviewSource`**. |
| **Can do today** | Review headers; create queue item with duplicate guard (JSON provenance). |
| **Cannot do** | Store bodies; auto-queue on Pub/Sub. |
| **Upstream** | **`…/gmail`** (sync); OAuth. |
| **Downstream** | **`/admin/workbench/email-queue`**, **`…/email-queue/[id]`** (AI, profile panels). |
| **Smoke expectation** | Empty inbox shows **why empty** + next steps (sync, queue). |
| **Governance** | **`bodyStored: false`** contract; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** false. |

**Related (not in numbered sprint list):** **`/admin/workbench/email-command-center/gmail/connect`** — OAuth redirect shim; **Live** when routed from monitor.

---

## Email workflow queue

### `/admin/workbench/email-queue`

| Field | Detail |
|--------|--------|
| **Status** | **Live** (list quality depends on DB) |
| **Purpose** | E-1/E-2 triage list — **`EmailWorkflowItem`** work queue. |
| **Can do today** | Filter, assign, open items; honest empty state when no rows. |
| **Cannot do** | Provider send from queue item. |
| **Upstream** | Gmail review manual create; other intake (per product). |
| **Downstream** | **`…/email-queue/[id]`**. |
| **Smoke expectation** | List or empty state; links to detail. |
| **Governance** | Queue-first doctrine; no blind auto-send. |

### `/admin/workbench/email-queue/[id]`

| Field | Detail |
|--------|--------|
| **Status** | **Live** / **Partial** (OpenAI panel **partial** without key) |
| **Purpose** | Item detail — triage, **advisory AI** (**`runEmailWorkflowAiAnalysisAction`**), Contact/Profile Intelligence (stored AI only). |
| **Can do today** | Triage fields; run AI when configured; inspect profile suggestions context. |
| **Cannot do** | Auto-approve queue; auto-write **`User`/`VolunteerProfile`**; send. |
| **Upstream** | **`/admin/workbench/email-queue`**. |
| **Downstream** | **`…/profiles`**, **`…/audiences`**, **`…/message-studio`** (handoff query params per UI). |
| **Smoke expectation** | Detail loads; AI panel shows gated message if no key. |
| **Governance** | AI output stored in **`metadataJson.emailAiAnalysis`** — advisory only. |

---

## Profile graph

### `/admin/workbench/email-command-center/profiles`

| Field | Detail |
|--------|--------|
| **Status** | **Live** |
| **Purpose** | Approve **`EmailContactProfileFactSuggestion`** → **`EmailContactProfileFact`**; manage audience hints. |
| **Can do today** | Operator approve/deny staged suggestions; see approved facts. |
| **Cannot do** | Auto-merge CRM; push segments to SendGrid. |
| **Upstream** | Queue AI JSON; Gmail-derived metadata context (no bodies). |
| **Downstream** | **`…/audiences`** (building blocks, previews). |
| **Smoke expectation** | Empty states explain **approve first** + link to queue AI. |
| **Governance** | Facts carry provenance; no auto profile updates. |

---

## Audience Studio

### `/admin/workbench/email-command-center/audiences`

| Field | Detail |
|--------|--------|
| **Status** | **Live** |
| **Purpose** | Preview audiences over **ACTIVE** facts; draft **`EmailAudienceDefinition`**; audit **`EmailAudiencePreviewRun`**. |
| **Can do today** | Previews (cap-limited); save/archive draft definitions. |
| **Cannot do** | Execute SendGrid list sync; send campaigns. |
| **Upstream** | **`…/profiles`**; imports (committed facts). |
| **Downstream** | **`…/message-studio`**; future **EMAIL-SENDGRID-CONTACT-SYNC-1.1**. |
| **Smoke expectation** | Building-blocks empty state links to profiles. |
| **Governance** | Preview-only; caps documented in UI. |

---

## Contact import staging

### `/admin/workbench/email-command-center/imports`

| Field | Detail |
|--------|--------|
| **Status** | **Live** locally; **Partial** on hosted DB until gate passes |
| **Purpose** | List import batches; start validate pipeline. |
| **Can do today** | See batches; navigate to detail. |
| **Cannot do** | Bypass **`email:contact-import:gate`** for production without operator verification. |
| **Upstream** | CSV upload flow (per actions). |
| **Downstream** | **`…/imports/[id]`**. |
| **Smoke expectation** | Table or empty guidance + readiness link. |
| **Governance** | No SendGrid/OpenAI on import path; hosted import remains gated. |

### `/admin/workbench/email-command-center/imports/[id]`

| Field | Detail |
|--------|--------|
| **Status** | **Live** / **Partial** per batch state |
| **Purpose** | Batch detail — validate → approve → commit to **`EmailContactProfile`** + **`CONTACT_IMPORT`** facts. |
| **Can do today** | Operator-driven staging lifecycle on healthy DB. |
| **Cannot do** | Silent production import without env + policy. |
| **Upstream** | **`…/imports`**. |
| **Downstream** | **`…/profiles`**, **`…/audiences`**. |
| **Smoke expectation** | Detail loads for known id; governance copy present. |
| **Governance** | Commit is explicit operator action. |

---

## SendGrid foundation

### `/admin/workbench/email-command-center/sendgrid`

| Field | Detail |
|--------|--------|
| **Status** | **Partial** |
| **Purpose** | Readiness UI + local previews of events/suppressions/audience maps; **receive-only** webhook path documented. |
| **Can do today** | Inspect stored **`SendGridEvent`** / **`SendGridSuppression`** when present; readiness copy. |
| **Cannot do** | Trigger broadcast send; auto two-way contact sync. |
| **Upstream** | **`POST /api/sendgrid/events`** (signed in prod). |
| **Downstream** | **`…/analytics`**; future sync + send packets. |
| **Smoke expectation** | No send buttons; governance warnings visible. |
| **Governance** | Foundation ≠ execution. |

---

## Message Studio

### `/admin/workbench/email-command-center/message-studio`

| Field | Detail |
|--------|--------|
| **Status** | **Live** (browser **`localStorage`** + optional **server** OpenAI when `OPENAI_API_KEY` set) |
| **Purpose** | **LOCAL-DRAFTS-1.1** + **CAMPAIGN-VOICE-1.2** + **EDITORIAL-REVIEW-DESK-1.0** + **PRODUCTION-TEMPLATES-1.0** + **EMAIL-SEND-PACKET-BUILDER-1.0** — **Send Packet Builder** (`#send-packet-builder`: no-send review packet — completeness, suppression/consent + approval manual checklists, copy/export `.json`/`.txt`, optional **`lastSendPacketJson`** snapshot on draft) plus **Production Templates** panel (`message-templates.ts` registry: category/audience filters, risk/approval/compliance, apply modes with body-replace confirm, template history on draft), Campaign Voice, **Editorial Review Desk** (claim/voice/compliance checklists, readiness tier, last-applied template strip, send-governance handoff), optional **admin-server** AI (advisory; optional one-shot template context on **Generate**); multi-draft workspace, autosave, copy/export, content blocks; queue/audiences/imports query params. |
| **Can do today** | Save drafts locally (`reddirt:email-command-center:message-studio-drafts:v1`); duplicate/delete; export .json/.txt; insert content blocks; filter/preview/apply production templates; queue template for next AI generate; apply AI suggestions manually; build/copy/export **send packet** review artifact (no provider execution). |
| **Cannot do** | Server or Postgres persistence; auto-send; client-side direct OpenAI (all model calls are **server actions**). |
| **Upstream** | **`…/email-queue/[id]`**, **`…/audiences`**, **`…/imports`** (query chips: `source`, `id`, `audienceDefinitionId`, `importBatchId`). |
| **Downstream** | **`…/send-execution`** (gates); future server drafts + **EMAIL-SEND-EXECUTION-1.0**. |
| **Smoke expectation** | “Saved locally” / library sidebar; **Editorial Review Desk** visible below workspace; governance copy warns browser-only. |
| **Governance** | Drafts not shared across staff; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged. |

---

## Automation and analytics shells

### `/admin/workbench/email-command-center/automation`

| Field | Detail |
|--------|--------|
| **Status** | **Live** (governance **shell** only) |
| **Purpose** | Automation Studio — tiers, triggers, actions, playbooks, **no** engine activation. |
| **Can do today** | Read maps and blocked/future callouts. |
| **Cannot do** | Activate automations; enqueue sends. |
| **Upstream** | Cockpit; master plan / automation map docs. |
| **Downstream** | Policy packets (**EMAIL-AUTOMATION-STUDIO-1.1** activation). |
| **Smoke expectation** | Static educational UI; explicit **no activation**. |
| **Governance** | Activation is future and policy-gated. |

### `/admin/workbench/email-command-center/analytics`

| Field | Detail |
|--------|--------|
| **Status** | **Live** / **Partial** (aggregates need DB) |
| **Purpose** | Analytics & Deliverability readiness — **`getEmailCommandCenterSnapshot`**, suppression breakdown when healthy. |
| **Can do today** | One-page readiness + quiet-queue messaging. |
| **Cannot do** | Deep scheduled reporting (**EMAIL-ANALYTICS-DELIVERABILITY-1.0**). |
| **Upstream** | Queue counts; SendGrid tables; imports snapshot. |
| **Downstream** | Future charts and exports packet. |
| **Smoke expectation** | Loads with DB or graceful degradation per app patterns. |
| **Governance** | Read-only observability. |

---

## Send execution governance (no-send shell)

### `/admin/workbench/email-command-center/send-execution`

| Field | Detail |
|--------|--------|
| **Status** | **Live** (doctrine only — **no** provider APIs) |
| **Purpose** | **EMAIL-SEND-EXECUTION-GOVERNANCE-SHELL-1.0** — future Gmail/SendGrid rails, pre-send checklist (**includes “Send packet prepared”** — Message Studio **Send Packet Builder**), suppression gate, approval roles, text decision tree, **Blocked today** panel. |
| **Can do today** | Read send rails, checklist, and doctrine; follow verify links to Audience, imports, SendGrid, Analytics, readiness, queue, Message Studio **`#send-packet-builder`**. |
| **Cannot do** | Send mail; call SendGrid/Gmail execute APIs; change **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`**; persist send approvals. |
| **Upstream** | Message Studio, Analytics, SendGrid Foundation, Audience Studio, Automation Studio, imports, readiness. |
| **Downstream** | Future **EMAIL-SEND-EXECUTION-1.0** (governed execution packet). |
| **Smoke expectation** | Page loads; badges show **No live sends**; checklist rows render. |
| **Governance** | Queue **APPROVED** ≠ send approval; suppressions override audience membership; imports not assumed opted-in. |

---

## Quick reference table

| Route | Status |
|-------|--------|
| `/admin/workbench/email-command-center` | Live |
| `/admin/workbench/email-command-center/map` | Live |
| `/admin/workbench/email-command-center/readiness` | Live |
| `/admin/workbench/email-command-center/gmail` | Partial |
| `/admin/workbench/email-command-center/gmail/review` | Partial |
| `/admin/workbench/email-queue` | Live |
| `/admin/workbench/email-queue/[id]` | Live / Partial |
| `/admin/workbench/email-command-center/profiles` | Live |
| `/admin/workbench/email-command-center/audiences` | Live |
| `/admin/workbench/email-command-center/imports` | Live / Partial |
| `/admin/workbench/email-command-center/imports/[id]` | Live / Partial |
| `/admin/workbench/email-command-center/sendgrid` | Partial |
| `/admin/workbench/email-command-center/message-studio` | Live (localStorage + optional server AI) |
| `/admin/workbench/email-command-center/automation` | Live (shell) |
| `/admin/workbench/email-command-center/analytics` | Live / Partial |
| `/admin/workbench/email-command-center/send-execution` | Live (doctrine — no send) |

---

*Last updated: **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0** (launch posture + companion docs + smoke line).*
