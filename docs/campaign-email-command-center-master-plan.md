# Campaign Email Command Center — Master Plan

**Packet:** **REDDIRT-EMAIL-OS-MASTERPLAN-1.0**  
**Mode:** **Design / blueprint only** — no production code, migrations, or sends in this packet.  
**Lane:** `RedDirt/` only.

**Companion docs (read in order for implementation later):**

- Data model (design, no migration): [`campaign-email-command-center-data-model.md`](./campaign-email-command-center-data-model.md)  
- Integrations: [`campaign-email-command-center-integration-plan.md`](./campaign-email-command-center-integration-plan.md)  
- Automation (gated): [`campaign-email-command-center-automation-map.md`](./campaign-email-command-center-automation-map.md)  
- ChatGPT ↔ Cursor protocol (email packets): [`campaign-email-command-center-cursor-protocol.md`](./campaign-email-command-center-cursor-protocol.md)  
- **Progress ledger (primary bar for email work until Command Center complete):** [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)

**Repo reality anchor (do not over-claim):**

- **Today:** `EmailWorkflowItem` + E-1/E-2 queue at `/admin/workbench/email-queue`; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM = false`** in `src/lib/email-workflow/governance.ts`; **manual** Gmail **metadata review → queue** at **`/admin/workbench/email-command-center/gmail/review`** (operator button; server re-fetch METADATA; provenance in `metadataJson.gmailReviewSource`; **no** bodies, **no** auto-create from Pub/Sub); comms execution on **`CommunicationSend`** / workbench (`src/lib/comms/*`, `comms-workbench`); staff Gmail OAuth as **`StaffGmailAccount`** + human send path from workbench composer (not the email workflow queue). **EMAIL-AI-INTELLIGENCE-1.0:** advisory OpenAI **`json_object`** analysis on **`/admin/workbench/email-queue/[id]`** (queue fields + safe metadata provenance only); results in **`metadataJson.emailAiAnalysis`**; **no** auto-send/status/profile updates; **`OPENAI_API_KEY`** gate (UI shows **not configured** when missing). OpenAI elsewhere: `src/lib/openai/*`, `src/lib/comms/ai.ts`, RAG/search — distinct paths.

---

## 0. Implementation status

### EMAIL-COMMAND-CENTER-SHELL-1.0 (implemented)

**Route:** **`/admin/workbench/email-command-center`** — admin workbench cockpit that reads **existing** `EmailWorkflowItem` counts, `StaffGmailAccount` rollups, and **env presence only** for SendGrid/OpenAI (no values, no API calls). **No** migrations; **no** new integrations in this slice. **Email workflow queue** remains **`/admin/workbench/email-queue`**.

### EMAIL-GMAIL-CONNECT-1.0 (implemented)

**Routes:** OAuth **`/api/gmail/oauth/start`** · **`/api/gmail/oauth/callback`** · monitor **`/admin/workbench/email-command-center/gmail`** · connect shim **`…/email-command-center/gmail/connect`**. **Sealed** tokens (v2) in **`StaffGmailAccount.oauthJson`**; signed OAuth **state**; **default scopes:** **`gmail.metadata` only**; optional **`gmail.send`** via **`GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH=true`** for workbench human send.

### EMAIL-GMAIL-SYNC-1.1 (implemented)

**Foundation:** **`StaffGmailAccount.gmailSyncState`** + manual **Run safe metadata sync** on the Gmail monitor (INBOX, METADATA headers, max 25, no bodies). **`history.list`** dry-run + **`lastHistoryId`** cursor.

### EMAIL-GMAIL-WATCH-1.2 (implemented — watch + pub scaffold)

**Scope:** Manual **Start/Renew** / **Stop** **`users.watch`** (topic from **`GOOGLE_PUBSUB_TOPIC`**; optional **`GMAIL_WATCH_LABEL_IDS`**); persist **`watchHistoryId`**, **`watchExpiration`**, **`watchStatus`** in **`gmailSyncState`**. **POST `/api/gmail/pubsub`** accepts push envelopes **only** when **`GMAIL_PUBSUB_VERIFICATION_TOKEN`** or **`GOOGLE_PUBSUB_VERIFICATION_TOKEN`** is set and **`x-gmail-pubsub-token`** matches — stores **notification metadata only** (no `messages.get`, no queue rows). **Manual** “Process pending history preview” = bounded **`history.list`** **counts** + cursor advance; **404** → stale cursor / **`requiresFullSync`**. **Not in this packet:** auto message fetch, renewal cron, SendGrid/OpenAI, **`EmailWorkflowItem`** auto-create.

**Operator truth:** [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md).

### EMAIL-GMAIL-OPS-HISTORY-1.3 (implemented — ops / history hardening)

**Scope:** **`npm run email:command-center:preflight`** (DB + **`gmailSyncState`** column, no secret prints); **`npm run email:command-center:migrate-and-check`** and deployment docs clarifying **`&&` vs `;`** — **`npm run check` alone does not apply migrations**. Hardened **`history.list`** preview (respect **`requiresFullSync` / `historyCursorStale`**, **`pendingHistoryId`** lifecycle, safe **404**, generic error persistence); **watch renewal preview** library + **`tsx scripts/gmail-watch-renewal-preview.ts`** (**`--execute`** gated by **`GMAIL_WATCH_RENEWAL_EXECUTE=1`**). **No** in-app renewal cron until wired; **no** auto-fetch; **no** queue auto-create.

### EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4 (implemented — manual metadata → `EmailWorkflowItem`)

**Route:** **`/admin/workbench/email-command-center/gmail/review`**. **Read model:** `src/lib/gmail/review.ts` — INBOX list + **`format=METADATA`** per message; safe headers only; warning flags (no subject, list/automation hints, threaded). **Action:** `createEmailWorkflowItemFromGmailMetadataAction` in `src/app/admin/gmail-review-actions.ts` — **re-fetches** metadata server-side; verifies **`threadId`** matches form; **`sourceType` `INBOUND_EMAIL`**, **`triggerType` `INBOUND_MESSAGE`**; **`metadataJson.gmailReviewSource`** with **`bodyStored: false`**, **`createdByManualOperatorAction: true`**. **Duplicate prevention:** `findEmailWorkflowItemIdByGmailReviewMessageId` (JSON path on `gmailMessageId`) — items without that provenance are **not** detected. **Not claimed:** L4 automation, deep profile **CRM auto-merge**, SendGrid.

### EMAIL-AI-INTELLIGENCE-1.0 (implemented — advisory queue analysis)

**Scope:** **`runEmailWorkflowAiAnalysis`** loads **`EmailWorkflowItem`** row fields + **`metadataJson.gmailReviewSource`** (provenance only, **no** bodies). Server action **`runEmailWorkflowAiAnalysisAction`**; UI **AI Email Intelligence** panel on queue detail; Command Center shows **`OPENAI_API_KEY`** readiness (name only) + count of rows with **`metadataJson.emailAiAnalysis`**. **Does not** change **`status`**, **does not** send, **does not** mutate **`User`/`VolunteerProfile`**, **does not** create audience segments. **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged **false**.

### EMAIL-CONTACT-PROFILE-GRAPH-1.0 (implemented — staged facts + audience hints)

**Scope:** Prisma models **`EmailContactProfile`**, **`EmailContactProfileFact`**, **`EmailContactProfileFactSuggestion`**, **`EmailAudienceHint`**; library **`src/lib/email-command-center/profile-graph.ts`**; admin **`email-profile-graph-actions.ts`**; queue detail **Contact / Profile Intelligence** panel; review route **`/admin/workbench/email-command-center/profiles`**. Consumes **stored** `metadataJson.emailAiAnalysis` only (**no** new OpenAI calls). Approvals write **`EmailContactProfileFact`** rows with provenance; **does not** auto-update **`User`/`VolunteerProfile`**. Audience hints are **not** SendGrid or **`CommsPlanAudienceSegment`**.

### EMAIL-AUDIENCE-STUDIO-1.0 (implemented — preview + draft definitions)

**Scope:** **`src/lib/email-command-center/audience-studio.ts`**, **`src/app/admin/email-audience-actions.ts`**, route **`/admin/workbench/email-command-center/audiences`**, Prisma **`EmailAudienceDefinition`** + **`EmailAudiencePreviewRun`** (migration `20260505220000_email_audience_studio_foundation`). Building blocks + **AND** criteria previews over **ACTIVE** profile facts; **no** SendGrid API, **no** sends, **no** `User`/`VolunteerProfile` mutation, **no** `CommsPlanAudienceSegment` writes.

### Command Center “sub-bargraph” (track this build)

Use this table to monitor **Email OS implementation** (orthogonal to the full-campaign bargraph). Percent = rough readiness to **use** each slice in production; **100%** means shipped and operator-trusted for that slice.

| Slice | ~% | What “done” means |
|-------|---:|---------------------|
| **A. Shell + navigation** | **100** | Command Center route + workbench link live |
| **B. Queue read model** | **100** | Real counts, deep links, assignment/stale heuristic |
| **C. Gmail monitor** | **~84** | OAuth + **manual metadata sync** + **Gmail Review → queue (manual)** + **hardened history** + **`users.watch`** + **Pub/Sub POST scaffold** + **preflight** + **renewal preview**; **subscriber auto-fetch** → future packets |
| **D. SendGrid broadcast** | **~25** | Env + code paths exist elsewhere; **foundation + execution** packets remain |
| **E. OpenAI intelligence** | **~50** | **EMAIL-AI-INTELLIGENCE-1.0** — advisory queue analysis + cockpit readiness; no Command Center auto-send |
| **F. Audience / profile graph** | **~52** | **EMAIL-CONTACT-PROFILE-GRAPH-1.0** + **EMAIL-AUDIENCE-STUDIO-1.0** — `/profiles` + `/audiences`: approved-fact previews, draft definitions, preview audit rows; **no** SendGrid list sync. |
| **G. Message studio** | **~32** | Partial via comms workbench + **advisory** reply drafts on queue (not sent) |
| **H. Automation studio** | **~42** | T0–T2 + **T3 partial** (Gmail ops + **manual** metadata→queue bridge; **no** Pub/Sub-driven queue rows); engine **EMAIL-AUTOMATION-STUDIO-1.0** |
| **I. Send execution (governed)** | **~15** | Comms sends elsewhere; **EMAIL-SEND-EXECUTION-1.0** for OS-grade |
| **J. Analytics + deliverability** | **~24** | Webhooks partial; **EMAIL-ANALYTICS-1.0** |
| **K. Governance + compliance UX** | **~80** | Queue doctrine + **Audience Studio** governance copy + explicit **AI advisory-only** copy on queue detail + cockpit + duplicate guard + migrate/check honesty; counsel-owned items remain external |

**Tonight:** use the **shell** for **queue health**, **readiness truth**, and **deep links** — not for bulk send or inbox sync.

---

## 1. North star

Build the **most powerful campaign email operating system** that RedDirt can support **without** collapsing **triage**, **governance**, and **send execution** into one unsafe surface.

**Outcome:** Operators see **one command narrative** — what arrived, who it is, what it means, what audience it belongs to, what was sent, what engaged — while **policy gates** keep **mass send**, **profile mutation**, and **automation** **auditable** and **human-approvable** where required.

**Non‑negotiables (carry forward from PROTO‑2 + E‑lane):**

- **Queue-first** for sensitive inbound and ambiguous cases.  
- **No** blind auto-send from `EmailWorkflowItem`.  
- **AI suggests**; **humans and policy** decide **execution** and **truth-sensitive** writes.  
- **Strongest system** = best **observability + governance**, not highest **automation velocity**.

---

## 2. What this does beyond Gmail

Gmail is **one channel** for **human-scale** thread truth and **1:1** operator mail. The Command Center also covers:

- **SendGrid (and peers)** for **broadcast**, **templates**, **scheduling**, and **event webhooks** (opens, clicks, bounces, spam complaints, unsubscribes).  
- **Audience fabric** — static groups, **dynamic segments**, **suppression**, and **consent posture** aligned to compliance processes.  
- **Message studio** — drafts, variants, approvals, **separate** from triage queue semantics.  
- **Automation studio** — rule-based **suggestions** and **bounded** auto-actions (each behind explicit **gates**).  
- **Analytics + deliverability** — funnel health, cohort engagement, anomaly detection.  
- **Profile enrichment** — **suggestions** that flow through **`ContactProfileFactSuggestion`**-style governance before becoming canonical facts.

---

## 3. How each integration fits

| System | Role in the Command Center |
|--------|----------------------------|
| **Gmail (Google OAuth + Gmail API)** | Monitor and sync **designated** staff/campaign mailboxes; thread and label continuity; **human** 1:1 send path (extends existing **staff** rail — not broadcast). Phased: **read** before **modify/send** expansion. |
| **SendGrid** | **Broadcast** and **transactional-at-scale** provider; **lists/segments** (or mirrored projections); **domain authentication**; **event webhooks** → `EmailEngagementEvent` / `SendGridWebhookEvent` **ingestion**; **global** suppression. |
| **OpenAI API** | Server-only **classification**, **summarization**, **structured extraction**, **draft assistance**, **clustering/similarity**, **risk flags**; **prompt/version** provenance; **never** the sole authority on facts or compliance. |
| **RedDirt DB (Prisma/Postgres)** | **Source of truth** for campaign objects: contacts, queue items, sends, recipients, engagement facts, automation runs, audit logs. **Profile updates** from AI or webhooks land as **suggestions** or **append-only engagement** until approved where sensitive. |

---

## 4. Dashboard information architecture (IA)

Top-level nav (conceptual — implementation may nest under `/admin/workbench` or a dedicated `/admin/email-command` shell later).

### 4.1 Command Overview

Cross-cutting KPIs: queue depth, SLA-style “stale no-reply,” send volume, bounce/unsub rates, top segments, automation runs awaiting approval, integration health (token expiry, webhook lag).

### 4.2 Gmail Monitor

Connected accounts, sync status, thread list, label mapping, “new mail” indicators, link to related `EmailWorkflowItem` / `CommunicationThread`. **Read-only-first** UX until scopes and policy allow actions.

### 4.3 Queue / Triage

Existing **`EmailWorkflowItem`** surface (enhanced over time): filters, assignment, interpretation, governance copy — **no** send execution here.

### 4.4 Contact / Profile Builder

Unified view of **`User`**, **`VolunteerProfile`**, **`RelationalContact`** (where linked), email identities, tags, **fact** timeline, **suggestion** inbox for enrichment.

### 4.5 Audience Builder / Microtargeting Studio

Static groups, dynamic segment definitions (query/spec), overlap warnings, **suppression** preview, export/sync plan toward SendGrid (design: **mirrored** lists/segments with DB as policy source).

### 4.6 Message Studio

Plans, drafts, variants, approval states — aligned with **`CommunicationPlan`** / draft patterns; **does not** replace triage queue.

### 4.7 SendGrid Broadcast Center

Campaign sends, recipient preview, schedule, **pre-send checklist** (suppression, unsubscribe, identity), post-send monitoring. **Tied** to **`CommunicationSend`**-class objects and webhook ingestion.

### 4.8 Individual Reply Center

Human 1:1 from connected Gmail / staff rail; thread-aware; explicit **“this is not broadcast.”**

### 4.9 Automation Studio

Rules, triggers, **dry-run**, approvals, **kill switch**, per-rule audit. **No** silent cross-cutting automation without packet-scoped implementation + review.

### 4.10 Analytics + Deliverability

Sends, engagement time series, cohort comparisons, bounce/spam diagnostics, **advisory** deliverability guidance (human-owned remediation).

### 4.11 Governance / Compliance

Policy packs: what may auto-run, retention posture, consent notes, **no** unsourced factual claims in outbound, finance/legal **handoff** hooks for paid media adjacency. **Not** a substitute for counsel.

### 4.12 Settings / Integrations

OAuth clients (names only in docs), scoped connection health, webhook endpoints, environment **names** (no secret values), feature flags for automation tiers.

---

## 5. Feature inventory

| Capability | Command Center intent |
|------------|----------------------|
| Monitor Gmail account | Sync designated mailbox(es); health + backoff. |
| Sync threads/messages | Persist `SyncedEmailThread` / `SyncedEmailMessage` (design). |
| Label/archive/organize | Optional Gmail **modify** scopes **after** read-only maturity. |
| Classify inbound email | AI + rules; outputs are **suggestions** + queue fields. |
| Create/assign queue items | Triggers create/update `EmailWorkflowItem`; assign per existing patterns. |
| Summarize threads | AI summaries with provenance; operator override preserved (E‑2B pattern). |
| Draft replies | AI drafts in **draft** store; **human** send via approved path. |
| Extract profile facts | Structured extraction → **suggestion** rows → approval for merge. |
| Create groups/lists | `ContactGroup` / audience mirrors. |
| Create dynamic segments | `DynamicSegmentDefinition` + materialized membership (implementation choice TBD). |
| Mass email | SendGrid-backed **`CommunicationSend`** broadcast path; governance checklist. |
| Individual email | Gmail staff path + optional transactional single-send (policy). |
| Schedule sends | `EmailSendPlan` / send **`scheduledAt`** patterns. |
| Track opens/clicks/bounces/unsubscribes/spam | Webhook → `EmailEngagementEvent` / raw vendor row. |
| Update profiles from engagement | **Bounded** updates + **suggestion** for sensitive fields. |
| Automate follow-ups | Rules in `EmailAutomationRule` — **gated** (see automation map). |
| Detect duplicate contacts | Similarity + operator merge workflow (relational lane alignment). |
| Identify similar recipients | Clustering for “common message” batching — **human** approval to send. |
| Recommend next-best action | AI ranking; **no** auto-exec of high-impact actions without gate. |
| Preserve audit trail | `EmailAuditLog` + append-only metadata patterns (`metadataJson` namespacing). |

---

## 6. Data flow diagrams (text)

### 6.1 Gmail inbound → action

```text
Gmail API (watch/poll/sync)
    → SyncedEmailThread / SyncedEmailMessage (normalized)
    → Classify + summarize (OpenAI + deterministic rules; provenance stored)
    → EmailWorkflowItem (queue-first; operator assignment)
    → Optional: ContactProfileFactSuggestion (extracted facts; not auto-canonical)
    → Operator decision
        → Approve draft path → Message Studio / Individual Reply Center
        → Or: link CommunicationPlan / CampaignTask / WorkflowIntake
    → Send execution ONLY via gated CommunicationSend / Gmail human path
    → EmailEngagementEvent (if tracked) → Analytics
```

### 6.2 RedDirt contacts → SendGrid → engagement

```text
User / VolunteerProfile / RelationalContact (+ tags)
    → Audience Builder (group + DynamicSegmentDefinition)
    → Sync/mapping job → SendGrid list/segment (projection; DB retains policy source)
    → EmailSendPlan + CommunicationSend (+ recipients)
    → SendGrid send
    → Event webhook → SendGridWebhookEvent (raw) → EmailEngagementEvent (normalized)
    → Profile updates (non-sensitive engagement flags) + suggestions for sensitive
```

### 6.3 OpenAI → gate → action

```text
OpenAI (server-only; structured outputs)
    → draft | summary | classification | cluster | risk_score (all versioned in metadata)
    → Policy gate (automation tier + role + consent + suppression)
    → If allowed: write to suggestion tables OR non-sensitive engagement counters
    → If not allowed: queue for operator OR EmailWorkflowItem only
    → Human send gate for all outbound
```

---

## 7. Governance model (explicit)

| Layer | Rule |
|-------|------|
| **AI** | May **suggest**, **classify**, **draft**, **cluster**, **enrich**; must store **provenance** (model id/version, prompt hash/slug, timestamp, inputs **checksum** where feasible — **no secrets** in metadata). |
| **Policy gates** | Define **automation tiers**: observation-only → draft-only → auto-internal-note → auto-non-sensitive-field → **never** auto mass-send without explicit packet + compliance review. |
| **Mass send** | Requires **suppression/unsubscribe** check, **identity alignment** (domain auth), and **recipient preview**; **no** sends from triage queue UI. |
| **Sensitive fields** | Phone, legal/journalist flags, finance-touchy notes, relationship graph changes — **suggestion + approval**. |
| **Content** | **No** unsourced factual claims in outbound; opposition/advocacy content follows INTEL / comms doctrine. |
| **Testing** | **No** real PII in smoke tests; fake fixtures only. |
| **Audit** | Retention and access aligned with campaign counsel/treasurer processes — **document intent** here; **operational** detail is human-gated. |

---

## 8. Build packet roadmap (design → implementation)

Each packet below is a **future** implementation slice. Dependencies and schema are **likely** — **verify in repo** before building.

### 8.1 EMAIL-GMAIL-CONNECT-1.0

| Field | Content |
|-------|---------|
| **Purpose** | Phased Gmail OAuth + **read-only** sync for designated accounts; thread/message normalization; foundation for Gmail Monitor UI. |
| **Dependencies** | Google Cloud project (human-owned), existing `StaffGmailAccount` patterns reviewed for generalization vs parallel “monitoring” connection. |
| **Schema likely** | `CampaignEmailAccount` / `GmailConnection`, `SyncedEmailThread`, `SyncedEmailMessage`, optional `GmailSyncState`. |
| **UI likely** | Settings connection card; Gmail Monitor list; thread detail (no send until phase 2). |
| **Env / keys** | OAuth client **IDs** (public), redirect URIs, **secrets** in env (human-provisioned — never in docs). |
| **Safety gate** | **Read-only** scopes first; restricted scopes only with counsel + Google verification posture understood. |
| **Acceptance** | Sync reads threads reliably; backoff; audit fields; **no** mass send; tokens encrypted at rest (implementation standard TBD). |

### 8.1a EMAIL-GMAIL-SYNC-1.1 (implemented — metadata-only monitor)

| Field | Content |
|-------|---------|
| **Purpose** | Operational **metadata** sync for Command Center monitor: labels, INBOX refs (**max 25**), **METADATA** headers only; **`history.list`** dry-run when cursor present; **no** bodies, **no** `EmailWorkflowItem` auto-create. |
| **Schema** | **`StaffGmailAccount.gmailSyncState`** (JSON telemetry). |
| **UI** | Gmail monitor — **Run safe metadata sync**; Command Center shows last sync summary. |
| **Next packet** | Governed **Pub/Sub → bounded increment sync** (explicit packet) or **scheduled watch renewal** worker — **no** silent `messages.get` / queue auto-create. |

### 8.2 EMAIL-PROFILE-GRAPH-1.0

| **Purpose** | Canonical + suggested profile facts; email identities; dedupe helpers. |
| **Dependencies** | `User` / `VolunteerProfile` / `RelationalContact` linkage strategy. |
| **Schema likely** | `EmailIdentity`, `ContactProfileFact`, `ContactProfileFactSuggestion`, `ContactTag`. |
| **UI likely** | Profile builder panels; **suggestion inbox**. |
| **Env** | None for MVP beyond DB. |
| **Safety gate** | Suggestions cannot overwrite sensitive canonical fields without approval. |
| **Acceptance** | Approved suggestions merge with audit trail; PII minimization documented. |

### 8.3 EMAIL-SENDGRID-FOUNDATION-1.0

| **Purpose** | **Shipped (v1):** env/readiness + **`SendGridEvent`** / **`SendGridSuppression`** intake via **`POST /api/sendgrid/events`**; operator **`/sendgrid`** surface; Audience Studio SendGrid posture column; local export preview helpers (**no** SendGrid HTTP sync, **no** sends). **Still future:** full lists/segments execution, `CommunicationSend` alignment, duplicate engagement merge beyond `sendgridEventId` uniqueness. |
| **Dependencies** | Existing Comms **`/api/webhooks/sendgrid`** path remains separate. |
| **Schema shipped** | `SendGridEvent`, `SendGridSuppression`, `SendGridAudienceMap`, `SendGridContactMap` — migration `20260506120000_email_sendgrid_foundation`. |
| **UI shipped** | **`/admin/workbench/email-command-center/sendgrid`** + Command Center cards + Audience Studio link/column. |
| **Env** | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, webhook PEM (`SENDGRID_WEBHOOK_VERIFICATION_KEY` or `SENDGRID_WEBHOOK_PUBLIC_KEY`); optional future keys documented in `.env.example` (names only). |
| **Safety gate** | **No** mass send; **no** OpenAI from webhook path; **no** `User`/`VolunteerProfile` mutation; production rejects unsigned webhooks without PEM. |
| **Acceptance** | Staging can receive **signed** sample batches → rows in `SendGridEvent`; suppressions append for bounce/unsubscribe/spam/group_unsubscribe/selected dropped reasons; **`npm run email:sendgrid:event-parse-check`** passes offline. |

### 8.4 EMAIL-AI-INTELLIGENCE-1.0

| **Purpose** | Structured LLM pipelines for classify/summarize/extract/draft with **versioned** prompts and **no** training claim in code. |
| **Dependencies** | OpenAI env; existing `comms/ai.ts` + email-workflow intelligence patterns. |
| **Schema likely** | Prompt/registry tables optional; **`metadataJson.emailAiAnalysis`** envelope (**v1**) ships first. |
| **UI likely** | **Implemented (v1):** queue detail **AI Email Intelligence** panel + Command Center readiness row. |
| **Env** | `OPENAI_API_KEY` (server-only); optional `OPENAI_MODEL`. |
| **Safety gate** | All outputs labeled advisory; **no** auto-send, **no** auto-status, **no** profile merge, **no** segment creation from AI output; **no** Gmail bodies in this lane. |
| **Acceptance** | Provenance block on every AI write (`promptVersion`, `inputSourceSummary`, `model`); rate limits; redaction policies. **v1 shipped:** operator-triggered analysis only. |

### 8.5 EMAIL-AUDIENCE-STUDIO-1.0

| **Purpose** | Groups + dynamic segments; overlap + exclusion rules; audience membership materialization. |
| **Dependencies** | Profile graph; voter/relational read models where segments need them. |
| **Schema likely** | `ContactGroup`, `DynamicSegmentDefinition`, `EmailAudienceMembership`. |
| **UI likely** | Segment builder; **preview counts** (explainable). |
| **Env** | Optional SendGrid sync credentials. |
| **Safety gate** | Segment changes that trigger automation require explicit rule opt-in. |
| **Acceptance** | Deterministic refresh job; **no** surprise auto-send on segment membership change alone. |

### 8.6 EMAIL-MESSAGE-STUDIO-1.0

| **Purpose** | Unified authoring UX bridging plans/drafts/variants and approval metadata. |
| **Dependencies** | `CommunicationPlan` / draft models; governance copy. |
| **Schema likely** | `CampaignEmailDraft` / extensions to existing draft tables. |
| **UI likely** | Message Studio routes; preview; collaboration. |
| **Env** | Optional template IDs (SendGrid). |
| **Safety gate** | **No** conflation with triage queue statuses. |
| **Acceptance** | Approvals recorded; immutable snapshots for sent content references. |

### 8.7 EMAIL-AUTOMATION-STUDIO-1.0

| **Purpose** | `EmailAutomationRule` + `EmailAutomationRun` execution engine with **dry-run** and **kill switch**. |
| **Dependencies** | Audience studio; webhooks; AI packet for classifier helpers. |
| **Schema likely** | Rules, runs, schedules, outcomes. |
| **UI likely** | Rule builder; run log; approvals. |
| **Env** | Job runner / queue (design TBD). |
| **Safety gate** | **Every** destructive or outbound rule requires **dual** gate: human policy + send gate. |
| **Acceptance** | Simulated runs produce same payload as live runs minus side effects. |

### 8.8 EMAIL-SEND-EXECUTION-1.0

| **Purpose** | End-to-end **governed** execution: plan → recipient expansion → suppression → SendGrid/Gmail path selection → post-send tracking. |
| **Dependencies** | SendGrid foundation; comms-workbench patterns. |
| **Schema likely** | `EmailSendPlan`, `EmailSendRecipient` (or map to `CommunicationRecipient`). |
| **UI likely** | Broadcast center; scheduling; retry with caps. |
| **Env** | Provider keys. |
| **Safety gate** | Send must fail closed on suppression/consent ambiguity. |
| **Acceptance** | Full audit: who approved, when, to how many, with what template. |

### 8.9 EMAIL-ANALYTICS-1.0

| **Purpose** | Dashboards for engagement, deliverability, cohort outcomes; export for counsel/treasurer. |
| **Dependencies** | Engagement events; send/recipient tables. |
| **Schema likely** | Aggregates / materialized views (implementation choice). |
| **UI likely** | Analytics IA section. |
| **Env** | None extra. |
| **Safety gate** | No **individual** voter surveillance narratives; aggregate-first for sensitive contexts. |
| **Acceptance** | Numbers reconcile to webhook counts within tolerance; documented lag. |

---

## 9. Maturity statement (honest)

This master plan is **L1–L2 blueprint depth** for a **large L4–L5 ambition**. **Existing** code remains **L3 triage** for the queue and **partial** comms execution elsewhere. **Do not** mark Comms as **L4 automation exists** until **policy-gated** automation packets ship.

---

*Last updated: REDDIRT-EMAIL-OS-MASTERPLAN-1.0 — blueprint + **EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4** + progress ledger anchor.*
