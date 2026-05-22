# Email Command Center — Route Inventory

**Packet:** **EMAIL-COMMAND-CENTER-CLOSEOUT-1.0** + **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0** + **EMAIL-COMMAND-CENTER-PRODUCTION-QA-CLOSEOUT-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Companion:** **[`email-command-center-operator-manual.md`](./email-command-center-operator-manual.md)** (staff daily manual) · **[`email-command-center-morning-upgrade-closeout.md`](./email-command-center-morning-upgrade-closeout.md)** (morning QA verify log) · [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md) · [`email-command-center-operator-ux-polish-1-0.md`](./email-command-center-operator-ux-polish-1-0.md) · [`email-command-center-production-qa-closeout.md`](./email-command-center-production-qa-closeout.md) · [`email-command-center-operator-smoke-test.md`](./email-command-center-operator-smoke-test.md) · [`email-command-center-closeout-2026-05-05.md`](./email-command-center-closeout-2026-05-05.md) · [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) · [`email-command-center-first-run-operator-checklist.md`](./email-command-center-first-run-operator-checklist.md)

This document inventories **admin workbench** routes that belong to the **Email Command Center** narrative (cockpit, map, readiness, Gmail, queue, profiles, audiences, imports, SendGrid foundation, message planning, automation shell, analytics shell, **send execution governance**). Paths are **relative to the site root** (full path prefix: `/admin/workbench/…`). For **how staff use** these routes day to day, read **[`email-command-center-operator-manual.md`](./email-command-center-operator-manual.md)** (**EMAIL-COMMAND-CENTER-OPERATOR-MANUAL-1.0**).

**Legend — status**

| Status | Meaning |
|--------|---------|
| **Live** | Route renders for authorized operators; core read paths work when DB/auth env allow. |
| **Partial** | Route is real but depends on credentials, manual steps, or future execution packets. |
| **Future** | Documented intent only; execution or automation not shipped on this surface. |

**Governance (all rows):** **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** remains **`false`** — no Gmail send-from-queue, no auto-reply from **`EmailWorkflowItem`**, and no queue-triggered SendGrid send. Optional workbench Gmail send scope is **separate** from email-workflow execution. SendGrid broadcast exists only through the governed Send Execution `#ops` rail after preflight, test, final approval, and typed confirmation.

**Launch posture:** ECC is **operator-complete, execution-gated** — Daily + cockpit + Message Studio + governance are safe for daily triage and drafting; provider execution is restricted to the governed Send Execution rail, while queue sends and automation activation remain **future** packets. Heuristic **`npm run email:no-send-scan`** is a sanity aid, not a security proof.

**EMAIL-COMMAND-CENTER-OPERATOR-UX-POLISH-1.0:** Major ECC routes (Daily, Message Studio, Send Execution, Analytics, Automation, SendGrid, Audiences, Imports, Email queue) include a shared **next actions** strip, **status chips** (Live / Local-only / Hosted not verified / No-send / Requires approval / Future), **Back to Daily Operator Console**, and **blocked-because** hints where env or DB posture gaps matter — still **no** sends.

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
| **Smoke expectation** | Page loads; **Do not send** / **operator-complete, execution-gated** copy visible; quick links resolve. |
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
| **Purpose** | **EMAIL-DAILY-OPERATOR-CONSOLE-1.0** + **EMAIL-AUTOMATION-POLICY-DETAILS-1.0** — start-of-day console: snapshot **today’s priorities** (queue, profiles, imports, audiences, SendGrid signals, AI-analyzed count), **rule-based next actions**, **top 3 automation policy warn/alert** strip with deep-links to **`/automation#policy-detail-…`**, ordered **operator work queue** links, **client-only** Message Studio draft summary from **`localStorage`** (this browser). |
| **Can do today** | Open linked surfaces; see degraded copy when DB unreachable; refresh draft counts by revisiting (no server persistence of drafts). |
| **Cannot do** | Send mail; write Postgres; upload local draft payloads; activate automation. |
| **Upstream** | **`getEmailCommandCenterSnapshot`**; browser **`reddirt:email-command-center:message-studio-drafts:v1`**. |
| **Downstream** | Queue, Gmail review/monitor, profiles, imports, audiences, Message Studio (**`#editorial-review-desk`**, **`#send-packet-builder`**), send governance, analytics, automation, readiness, map. |
| **Smoke expectation** | Page loads; badges + next-actions visible; **top 3** automation policy warn/alert strip when any non-OK; DB-unavailable banner when snapshot degraded. |
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

### `/admin/workbench/email-command-center/readiness/hosted-db`

| Field | Detail |
|--------|--------|
| **Status** | **Live** |
| **Purpose** | **EMAIL-HOSTED-DB-READINESS-ASSISTANT-1.0** — hosted Supabase / Kelly-Grappe-App verification aid: **`DATABASE_URL` / `DIRECT_URL` presence + parse + hostname classification** (no secret values), **DB reachable**, **ECC migration list snapshot**, **contact import gate** labels, **copyable CLI snippets** + PowerShell session template (placeholders). |
| **Can do today** | Read posture; copy `npm run email:db:diagnose` / preflight / import-gate commands; follow links to Imports, SendGrid, Supabase dashboard. |
| **Cannot do** | Change env, run migrations, import CSV, print connection strings. |
| **Upstream** | **`getEmailCommandCenterSnapshot.operatorGate`** + `process.env` parse (names/posture only). |
| **Downstream** | Operator-run CLI on hosted **`DATABASE_URL`**; **`docs/deployment.md`**, **`docs/email-command-center-contact-import-readiness.md`**. |
| **Smoke expectation** | Table + copy buttons render; no credential text fields. |
| **Governance** | Wrong Supabase **project ref** = wrong database — verify Reference ID in dashboard before gate chain. |

---

## Gmail

### `/admin/workbench/email-command-center/gmail`

| Field | Detail |
|--------|--------|
| **Status** | **Partial** — requires **StaffGmailAccount** OAuth and operator actions |
| **Purpose** | Gmail monitor — connection status, **manual** metadata sync, watch start/renew/stop, history preview counts; **EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0** strip (renewal plan, history cursor aggregates, CLI dry-run instructions). |
| **Can do today** | Run safe metadata sync; manage watch where configured; see Pub/Sub scaffold status; read production-watch posture; from shell run **`npm run gmail:watch:renewal-check`** (dry-run; **`--execute`** only with **`GMAIL_WATCH_RENEWAL_EXECUTE=1`**). |
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
| **Purpose** | Item detail — triage, **advisory AI** (**`runEmailWorkflowAiAnalysisAction`**), **AI Task Intelligence** (**`generateTaskRecommendationsForQueueItemAction`** → **`metadataJson.emailTaskIntelligence`**), Contact/Profile Intelligence (stored AI only). |
| **Can do today** | Triage fields; run queue AI + task recommendations when configured; copy/export task JSON; inspect profile suggestions context. |
| **Cannot do** | Auto-approve queue; auto-write **`User`/`VolunteerProfile`**; send. |
| **Upstream** | **`/admin/workbench/email-queue`**. |
| **Downstream** | **`…/profiles`**, **`…/audiences`**, **`…/message-studio`** (handoff query params per UI). |
| **Smoke expectation** | Detail loads; AI panel shows gated message if no key. |
| **Governance** | AI output stored in **`metadataJson.emailAiAnalysis`** and optional **`metadataJson.emailTaskIntelligence`** — advisory only; **no** auto `CampaignTask`, **no** calendar API. |

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
| **Purpose** | Readiness UI + local previews of events/suppressions/audience maps; **receive-only** webhook path documented; **`sendGridReconciliation`** status strip (**EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0** — link to Analytics **`#reconciliation`**, **no** sends); **`#contact-sync`** (**1.1 + 1.2** + **EMAIL-SENDGRID-SYNC-RECONCILIATION-POLISH-1.0**) — sync health cards (PREVIEWED / APPROVED awaiting / SYNCED / FAILED / ARCHIVED, Σ suppressed + Σ warnings non-archived, latest sync + truncated provider job tail), recent runs with job tails + retry guidance, operator preview runs on **`SendGridContactSyncRun`**, approve, **optional governed Marketing Contacts upsert** for **APPROVED** runs — **contact sync only**, **no** email send. Snapshot **`sendGridContactSync`** feeds **Daily** + **Analytics `#contact-sync-health`**. |
| **Can do today** | Inspect stored **`SendGridEvent`** / **`SendGridSuppression`** when present; readiness copy; **reconciliation counts** (pending/matched/unmatched); save **preview** audit rows; **APPROVED** status; **execute** Marketing Contacts PUT for eligible emails when gates pass. |
| **Cannot do** | Trigger broadcast / single-send **email**; create campaigns or automation from this page; upsert without **APPROVED** run or without API key; production upsert without hosted DB verification (**deferred posture** = **EMAIL-SEND-EXECUTION-1.0** for **sends**). |
| **Upstream** | **`POST /api/sendgrid/events`** (signed in prod). |
| **Downstream** | **`…/analytics`**, **`…/daily`**, **`…/audiences`** (handoff links); future Marketing API execution + send packets. |
| **Smoke expectation** | No send buttons; governance warnings visible. |
| **Governance** | Foundation ≠ execution. |

---

## Message Studio

### `/admin/workbench/email-command-center/message-studio`

| Field | Detail |
|--------|--------|
| **Status** | **Live** (browser **`localStorage`** + **Postgres shared drafts** when DB healthy + optional **server** OpenAI when `OPENAI_API_KEY` set) |
| **Purpose** | **LOCAL-DRAFTS-1.1** + **SERVER-DRAFTS-1.0** + **REVIEW-QUEUE-1.0** + **CAMPAIGN-VOICE-1.2** + **EMAIL-CAMPAIGN-VOICE-SOURCE-READINESS-1.0** (`#message-studio-source-readiness`: four-bucket source readiness + paste templates + thin-context warning; deterministic **`sourceLimitations`** merge on AI paths) + **EDITORIAL-REVIEW-DESK-1.0** + **PRODUCTION-TEMPLATES-1.0** + **EMAIL-SEND-PACKET-BUILDER-1.0** — **`#shared-drafts`**: promote local JSON → **`MessageStudioDraft`**, linked-draft update, promote UI; **`#review-queue`**: grouped server rows by **`MessageStudioDraftStatus`**, filters, workflow status updates + revision/archive quick actions (**no** send); **`MessageStudioDraftRevision`** snapshots; **Send Packet Builder** (`#send-packet-builder`: no-send review packet — completeness, suppression/consent + approval manual checklists, copy/export `.json`/`.txt`, optional **`lastSendPacketJson`** snapshot on draft) plus **Production Templates** panel (`message-templates.ts` registry: category/audience filters, risk/approval/compliance, apply modes with body-replace confirm, template history on draft), Campaign Voice, **Editorial Review Desk** (claim/voice/compliance checklists, readiness tier, last-applied template strip, send-governance handoff), optional **admin-server** AI (advisory; optional one-shot template context on **Generate**); multi-draft workspace, autosave, copy/export, content blocks; queue/audiences/imports query params. |
| **Can do today** | Save drafts locally (`reddirt:email-command-center:message-studio-drafts:v1`); **promote** active local draft to **shared** Postgres row; **open** shared draft into editor (confirm if dirty); **update** linked shared draft + optional revision note; **save revision** snapshot; **archive** shared row; **Review Queue** filters + status transitions (existing enum only); duplicate/delete local; export .json/.txt; insert content blocks; filter/preview/apply production templates; queue template for next AI generate; apply AI suggestions manually; build/copy/export **send packet** review artifact (no provider execution). |
| **Cannot do** | Auto-send; client-side direct OpenAI (all model calls are **server actions**). |
| **Upstream** | **`…/email-queue/[id]`**, **`…/audiences`**, **`…/imports`** (query chips: `source`, `id`, `audienceDefinitionId`, `importBatchId`). |
| **Downstream** | **`…/send-execution`** (gates + **Shared draft saved / reviewed** checklist row); **EMAIL-SEND-EXECUTION-1.0** (future execution). |
| **Smoke expectation** | “Saved locally” / library sidebar; **`#shared-drafts`** + **`#review-queue`** load when DB OK; Campaign Voice **`#message-studio-source-readiness`** buckets render; **Editorial Review Desk** (**`#editorial-review-desk`**) and **Send Packet Builder** (**`#send-packet-builder`**) reachable; governance copy states **no send**. |
| **Governance** | Shared drafts are **persistence/review only**; local scratch may diverge until promoted/updated; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged. |

---

## Automation and analytics shells

### `/admin/workbench/email-command-center/automation`

| Field | Detail |
|--------|--------|
| **Status** | **Live** (governance **shell** + **read-only policy evaluations**) |
| **Purpose** | Automation Studio — tiers, triggers, actions, playbooks; **EMAIL-AUTOMATION-POLICY-ACTIVATION-1.0** + **EMAIL-AUTOMATION-POLICY-DETAILS-1.0** policy table + **`#automation-policy-details`** explainability accordions (`#policy-detail-{id}` per policy) from **`getEmailCommandCenterSnapshot.automationPolicyEval`** (no workers). |
| **Can do today** | Read maps and blocked/future callouts; **Revalidate snapshot (read-only)** revalidates server render only (`revalidatePath`); expand policy detail for watches / recommendations / never-does. |
| **Cannot do** | Activate background workers; auto-send; auto-mutate audiences/contacts. |
| **Upstream** | Cockpit **`getEmailCommandCenterSnapshot`**; master plan / automation map docs. |
| **Downstream** | Future **EMAIL-AUTOMATION-STUDIO-1.1** worker activation (separate packet). |
| **Smoke expectation** | Policy rows render when DB healthy; **`#automation-policy-details`** accordions + status pills; degraded counts when DB down. |
| **Governance** | Evaluation-only in this packet — cron/worker activation remains policy-gated and **not** shipped here. |

### `/admin/workbench/email-command-center/analytics`

| Field | Detail |
|--------|--------|
| **Status** | **Live** / **Partial** (aggregates need DB) |
| **Purpose** | Analytics & Deliverability readiness — **`getEmailCommandCenterSnapshot`** + **`buildEmailAnalyticsOperatorDrilldown`** on this route only (**EMAIL-ANALYTICS-DRILLDOWN-1.0**: readiness scores **`#analytics-readiness-scores`**, drilldown anchors for queue / drafts / send execution / sync / suppression / automation / Gmail watch, bounded row tables), suppression breakdown when healthy, **`sendGridReconciliation`** + **`#reconciliation`** (operator batch reconcile — **EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0**, **no** sends); **`#send-execution-preflight`** (**EMAIL-SEND-EXECUTION-PREFLIGHT-HARDENING-1.0**) — read-only rollup of first-failed preflight check ids across **`PREFLIGHT_FAILED`** executions + link to **`/send-execution#ops`**. |
| **Can do today** | One-page readiness + quiet-queue messaging; reconcile recent **`SendGridEvent`** rows to **`EmailSendRecipient`** when admin submits the reconcile form; inspect send-execution preflight failure patterns (**no** send). |
| **Cannot do** | Deep scheduled reporting (**EMAIL-ANALYTICS-DELIVERABILITY-1.0**). |
| **Upstream** | Queue counts; SendGrid tables; imports snapshot; **`POST /api/sendgrid/events`** ingestion. |
| **Downstream** | Charts/exports packet; suppression posture before next governed send. |
| **Smoke expectation** | Loads with DB or graceful degradation per app patterns. |
| **Governance** | Read-only observability. |

---

## Send execution (governance + governed operator console)

### `/admin/workbench/email-command-center/send-execution`

| Field | Detail |
|--------|--------|
| **Status** | **Live** — upper page: doctrine + rails (**no** buttons there). **`#ops`**: **EMAIL-SEND-EXECUTION-1.0** operator console (admin server actions → **`send-execution.ts`** → **`mail-send.ts`** `fetch` to SendGrid **`/v3/mail/send`** only on explicit submit). |
| **Purpose** | Pre-send checklist + suppression doctrine + **Prisma** **`EmailSendExecution`** / **`EmailSendRecipient`** / **`EmailSendApproval`** audit trail; create draft execution from shared draft + ACTIVE audience + optional **SYNCED** sync run; **preflight** (**EMAIL-SEND-EXECUTION-PREFLIGHT-HARDENING-1.0**: expanded checklist, **`whyFailed`**, fix-route links, **`recipientBreakdown`** in **`preflightJson`** — **no** provider calls); **single-address test send**; **final approval**; **broadcast** after typed **`SEND APPROVED`** + production hosted DB gate in **`executeEmailSendGridFinalAction`**. |
| **Can do today** | Read rails/checklist; **operator**: run preflight, copy/export summary, then governed test/final SendGrid paths when env + migrations + policy gates pass. |
| **Cannot do** | Queue-triggered send; automation activation; change **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`**; bypass suppression; broadcast without ASM env. |
| **Upstream** | Message Studio (shared drafts, send packet), Audience Studio, SendGrid Foundation (**SYNCED** runs), imports consent posture. |
| **Downstream** | Analytics/Daily snapshot counts; **`SendGridEvent`** → **`EmailSendRecipient`** via **EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0** (operator reconcile on Analytics). |
| **Smoke expectation** | Page loads; doctrine badges accurate; **`#ops`** lists executions when DB healthy; **no** send without explicit form submit. |
| **Governance** | Queue **APPROVED** ≠ send approval; contact sync **SYNCED** ≠ send; suppressions override audience membership; imports not assumed opted-in. |

---

## Quick reference table

| Route | Status | Safe to use now | Blocked / degraded when | Smoke expectation | Anchors / notes |
|-------|--------|-----------------|---------------------------|-------------------|-----------------|
| `/admin/workbench/email-command-center` | Live | **Yes** | DB unreachable → `operatorGate` | Cockpit + **operator-complete** copy | — |
| `/admin/workbench/email-command-center/daily` | Live | **Yes** | DB unreachable → degraded counts | Badges + next-actions + top-3 policy strip | Deep-link **`/automation#policy-detail-*`** |
| `/admin/workbench/email-command-center/map` | Live | **Yes** | — | All cards | — |
| `/admin/workbench/email-command-center/readiness` | Live | **Yes** | DB/keys missing → partial rows | Rows + **`#hosted-db-readiness-assistant`** | — |
| `/admin/workbench/email-command-center/readiness/hosted-db` | Live | **Yes** | — | Hosted DB table + copy snippets | — |
| `/admin/workbench/email-command-center/gmail` | Partial | **Yes** (nav) | No OAuth | Connect guidance | — |
| `/admin/workbench/email-command-center/gmail/review` | Partial | **Yes** when linked | No sync | Manual create | — |
| `/admin/workbench/email-queue` | Live | **Yes** | DB down | List / filters | — |
| `/admin/workbench/email-queue/[id]` | Live / Partial | **Yes** | DB down | AI + profile panels | — |
| `/admin/workbench/email-command-center/profiles` | Live | **Yes** | DB down | Suggestions | — |
| `/admin/workbench/email-command-center/audiences` | Live | **Yes** | DB down | Previews | — |
| `/admin/workbench/email-command-center/imports` | Live / Partial | **Yes** (UI) | Hosted DB not verified for prod commit | Staging copy | — |
| `/admin/workbench/email-command-center/imports/[id]` | Live / Partial | **Yes** when DB OK | Wrong DB | Batch detail | — |
| `/admin/workbench/email-command-center/sendgrid` | Partial | **Yes** | DB/env | No send buttons; **`#contact-sync`** preview only | **`#contact-sync`** |
| `/admin/workbench/email-command-center/message-studio` | Live | **Yes** | OpenAI optional; DB down → shared panel empty | Local + shared save + export | **`#shared-drafts`**, **`#review-queue`**, **`#message-studio-source-readiness`**, **`#editorial-review-desk`**, **`#send-packet-builder`** |
| `/admin/workbench/email-command-center/automation` | Live | **Yes** | — | No activation | **`#automation-policy-details`**, **`#policy-detail-*`** |
| `/admin/workbench/email-command-center/analytics` | Live / Partial | **Yes** | DB down | Read-only | **`#analytics-readiness-scores`**, **`#analytics-drilldown-queue`**, **`#reconciliation`**, **`#send-execution-preflight`**, **`#contact-sync-health`** |
| `/admin/workbench/email-command-center/send-execution` | Live | **Yes** (doctrine always; **#ops** sends only with env + gates) | DB/migration down → empty ops; prod without hosted gate blocks **final** broadcast action | Doctrine + hardened preflight checklist UI | **`#ops`**, governance copy |

---

*Last updated: **EMAIL-COMMAND-CENTER-MORNING-QA-CLOSEOUT-1.0** — companion **[`email-command-center-morning-upgrade-closeout.md`](./email-command-center-morning-upgrade-closeout.md)** + operator manual.*
