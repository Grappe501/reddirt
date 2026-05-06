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
- **Sprint closeout (docs only, 2026-05-05):** [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md) · [`email-command-center-closeout-2026-05-05.md`](./email-command-center-closeout-2026-05-05.md) · [`email-command-center-selective-staging-guide.md`](./email-command-center-selective-staging-guide.md) — **EMAIL-COMMAND-CENTER-CLOSEOUT-1.0**

**Repo reality anchor (do not over-claim):**

- **Today:** `EmailWorkflowItem` + E-1/E-2 queue at `/admin/workbench/email-queue`; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM = false`** in `src/lib/email-workflow/governance.ts`; **manual** Gmail **metadata review → queue** at **`/admin/workbench/email-command-center/gmail/review`** (operator button; server re-fetch METADATA; provenance in `metadataJson.gmailReviewSource`; **no** bodies, **no** auto-create from Pub/Sub); comms execution on **`CommunicationSend`** / workbench (`src/lib/comms/*`, `comms-workbench`); staff Gmail OAuth as **`StaffGmailAccount`** + human send path from workbench composer (not the email workflow queue). **EMAIL-AI-INTELLIGENCE-1.0:** advisory OpenAI **`json_object`** analysis on **`/admin/workbench/email-queue/[id]`** (queue fields + safe metadata provenance only); results in **`metadataJson.emailAiAnalysis`**; **no** auto-send/status/profile updates; **`OPENAI_API_KEY`** gate (UI shows **not configured** when missing). **EMAIL-COMMAND-CENTER-TONIGHT-FINISH-1.0:** **`/admin/workbench/email-command-center/message-studio`** — drafting/planning only (no DB persistence in this slice); queue/Audience/Import deep links for operator context. OpenAI elsewhere: `src/lib/openai/*`, `src/lib/comms/ai.ts`, RAG/search — distinct paths.

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

### EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0 (implemented — renewal runbook + CLI + cockpit slice)

**Scope:** **`src/lib/email-command-center/gmail-production-watch.ts`** — **`getGmailWatchProductionReadiness`**, **`listGmailWatchAccountsNeedingRenewal`**, **`buildGmailWatchRenewalPlan`**, **`renewGmailWatchForAccount`** (wraps **`users.watch`**), **`markGmailCursorStale`**, **`getGmailHistoryProcessingSummary`**, **`buildGmailProductionWatchSnapshot`**. **CLI:** **`npm run gmail:watch:renewal-check`** (**`scripts/gmail-watch-renewal-check.mjs`** → **`.impl.ts`**) — default **dry-run**; **`--execute`** requires **`GMAIL_WATCH_RENEWAL_EXECUTE=1`**; never prints tokens. **UI:** Gmail monitor production strip; **`getEmailCommandCenterSnapshot.gmailProductionWatch`** on Daily + Readiness. **No** Gmail send, **no** auto-reply, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged.

### EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4 (implemented — manual metadata → `EmailWorkflowItem`)

**Route:** **`/admin/workbench/email-command-center/gmail/review`**. **Read model:** `src/lib/gmail/review.ts` — INBOX list + **`format=METADATA`** per message; safe headers only; warning flags (no subject, list/automation hints, threaded). **Action:** `createEmailWorkflowItemFromGmailMetadataAction` in `src/app/admin/gmail-review-actions.ts` — **re-fetches** metadata server-side; verifies **`threadId`** matches form; **`sourceType` `INBOUND_EMAIL`**, **`triggerType` `INBOUND_MESSAGE`**; **`metadataJson.gmailReviewSource`** with **`bodyStored: false`**, **`createdByManualOperatorAction: true`**. **Duplicate prevention:** `findEmailWorkflowItemIdByGmailReviewMessageId` (JSON path on `gmailMessageId`) — items without that provenance are **not** detected. **Not claimed:** L4 automation, deep profile **CRM auto-merge**, SendGrid.

### EMAIL-AI-INTELLIGENCE-1.0 (implemented — advisory queue analysis)

**Scope:** **`runEmailWorkflowAiAnalysis`** loads **`EmailWorkflowItem`** row fields + **`metadataJson.gmailReviewSource`** (provenance only, **no** bodies). Server action **`runEmailWorkflowAiAnalysisAction`**; UI **AI Email Intelligence** panel on queue detail; Command Center shows **`OPENAI_API_KEY`** readiness (name only) + count of rows with **`metadataJson.emailAiAnalysis`**. **Does not** change **`status`**, **does not** send, **does not** mutate **`User`/`VolunteerProfile`**, **does not** create audience segments. **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged **false**.

### EMAIL-CONTACT-PROFILE-GRAPH-1.0 (implemented — staged facts + audience hints)

**Scope:** Prisma models **`EmailContactProfile`**, **`EmailContactProfileFact`**, **`EmailContactProfileFactSuggestion`**, **`EmailAudienceHint`**; library **`src/lib/email-command-center/profile-graph.ts`**; admin **`email-profile-graph-actions.ts`**; queue detail **Contact / Profile Intelligence** panel; review route **`/admin/workbench/email-command-center/profiles`**. Consumes **stored** `metadataJson.emailAiAnalysis` only (**no** new OpenAI calls). Approvals write **`EmailContactProfileFact`** rows with provenance; **does not** auto-update **`User`/`VolunteerProfile`**. Audience hints are **not** SendGrid or **`CommsPlanAudienceSegment`**.

### EMAIL-AUDIENCE-STUDIO-1.0 (implemented — preview + draft definitions)

**Scope:** **`src/lib/email-command-center/audience-studio.ts`**, **`src/app/admin/email-audience-actions.ts`**, route **`/admin/workbench/email-command-center/audiences`**, Prisma **`EmailAudienceDefinition`** + **`EmailAudiencePreviewRun`** (migration `20260505220000_email_audience_studio_foundation`). Building blocks + **AND** criteria previews over **ACTIVE** profile facts; **no** SendGrid API, **no** sends, **no** `User`/`VolunteerProfile` mutation, **no** `CommsPlanAudienceSegment` writes.

### EMAIL-DB-RECONCILE-CONTACT-IMPORT-GATE-1.0 (implemented — diagnostics + gates; no bulk import)

**Scope:** **`scripts/email-command-center-db-diagnose.mjs`** + **`npm run email:db:diagnose`** (safe URL shape, DNS, Prisma probe, optional **`prisma migrate status`** with redacted output, ECC migration checklist); expanded **`scripts/email-command-center-preflight.mjs`** separates **DB unreachable** vs **migration missing**; **`npm run email:contact-import:gate`** chains **`migrate deploy` → preflight → `npm run check`**; cockpit **`operatorGate`** banner; [`email-command-center-contact-import-readiness.md`](./email-command-center-contact-import-readiness.md); **`docs/deployment.md`** `DATABASE_URL` / `DIRECT_URL` strategy. **No** secrets printed, **no** SendGrid sync. **CSV import** ships in **EMAIL-CONTACT-IMPORT-STAGING-1.0** (below).

### EMAIL-CONTACT-IMPORT-STAGING-1.0 (implemented — staged CSV → approve → commit)

**Scope:** Prisma **`EmailContactImportBatch`**, **`EmailContactImportRow`**, **`EmailContactImportDecision`** (migration `20260507180000_email_contact_import_staging`); library **`src/lib/email-command-center/contact-import.ts`**; admin **`email-contact-import-actions.ts`**; routes **`/admin/workbench/email-command-center/imports`** (+ batch detail). **Validate** → **Approve** → **Commit** writes **`EmailContactProfile`** + optional **`EmailContactProfileFact`** with **`CONTACT_IMPORT`** provenance. **No** SendGrid sync, **no** sends, **no** OpenAI on this path. **Canonical Supabase DB / production** still requires the same gates on that **`DATABASE_URL`**.

### EMAIL-COMMAND-CENTER-TONIGHT-FINISH-1.0 (implemented — Message Studio drafting shell)

**Route:** **`/admin/workbench/email-command-center/message-studio`**. **UI:** `MessageStudioView` + client **`MessageStudioDraftPlanner`** (browser-only preview; **“Save draft coming in Message Studio 1.1”** — **no** new Prisma models, **no** migrations). Draft-type cards, audience-aware copy, static content blocks, AI handoff copy (queue detail first), approval-path diagram, future Gmail/SendGrid rails called out as **not implemented**. **Cockpit:** Command Center gains Message Studio card, **Tonight’s Operator Path**, split DB alerts (unreachable vs migration-only), **Do not send from here** rail, links from queue detail (`?source=emailWorkflowItem&id=…`), Audience Studio (header + per-definition `?audienceDefinitionId=…`), imports governance line. **No** sends, **no** `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` change, **no** hosted Supabase verification claims in this packet.

### EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0 (implemented — Automation Studio + Analytics / Deliverability shells)

**Routes:** **`/admin/workbench/email-command-center/automation`** (`AutomationStudioView`) · **`/admin/workbench/email-command-center/analytics`** (`AnalyticsDeliverabilityView` + `getEmailCommandCenterSnapshot` + optional `listSendGridSuppressionSummary` + **`sendGridReconciliation`** + **`#reconciliation`** operator reconcile forms). **Purpose:** operator governance visibility — tier/trigger/action/playbook maps; one-page queue + intelligence + import + audience + SendGrid readiness + deliverability checklist + suppression-type counts when Postgres is healthy; **EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0** surfaces matched vs pending webhook events and recipient status chips (**no** sends). **Cockpit:** Command Center adds featured cards, quick links, expanded **Tonight’s Operator Path**, pipeline links (**Engagement** → Analytics; **Automation readiness** → Automation Studio), **Command Center routes (status)** grid, cross-links from Message Studio, SendGrid Foundation, Audience Studio, Imports, Profiles. **Data:** `contactImportSnapshotCounts` adds **`openImportBatchCount`** (batches not `COMMITTED` or `ARCHIVED`) — application read only; reconciliation slice is read + explicit admin reconcile actions. **No** automation activation, **no** sends, **no** `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` change.

### EMAIL-AUTOMATION-POLICY-ACTIVATION-1.0 (implemented — read-only policy evaluation only)

**Libraries:** **`src/lib/email-command-center/automation-policies.ts`** (registry) · **`src/lib/email-command-center/automation-policy-runner.ts`** (`listAutomationPolicies`, `evaluateAutomationPolicy`, `evaluateAllAutomationPolicies`, `getAutomationPolicySummary` — all **read-only** from supplied context). **`getEmailCommandCenterSnapshot`** adds **`automationPolicyEval`** (built from existing snapshot slices — **no** new Prisma models in this packet). **Routes:** **`/admin/workbench/email-command-center/automation`** — **Policy evaluations** table + **Evaluate policies now** (`evaluateAutomationPoliciesNowAction`: **`revalidatePath`** + redirect query notice only). **`/admin/workbench/email-command-center/daily`** — policy warnings + priority card when any policy is non-`ok`. **Policies covered:** stale queue review, shared draft editorial review, send-packet / preflight posture, approved sync not executed, failed sync review, unreconciled SendGrid events, Gmail watch expiring, hosted DB not verified, suppressions before send. **Does not:** auto-send, SendGrid mail send, Gmail send, background workers/cron, audience/contact mutation without existing explicit operator flows, change **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`**. **Future:** **EMAIL-AUTOMATION-STUDIO-1.1** or similarly named packet for **separate** explicit approval before any worker activation or digests.

### EMAIL-COMMAND-CENTER-FINAL-POLISH-1.0 (implemented — route map, readiness, empty states, smoke test)

**Routes:** **`/admin/workbench/email-command-center/map`** (`EmailCommandCenterRouteMapView` — route cards + four flow sections) · **`/admin/workbench/email-command-center/readiness`** (`EmailCommandCenterReadinessView` — checklist rows from **`getEmailCommandCenterSnapshot`**). **Cockpit:** **Operator start path / finish tonight** ordered list, **What is ready now?** vs **What is intentionally blocked?** summaries, quick links, empty-queue hint, route status grid includes map + readiness. **Empty states:** Gmail review, profiles, audience studio, imports, SendGrid foundation, Message Studio, Automation Studio, Analytics — each explains *why empty*, *next step*, *safety*, with links. **QA:** **[`email-command-center-operator-smoke-test.md`](./email-command-center-operator-smoke-test.md)** — manual pass through all Command Center surfaces + **`npm run check`**. **Staff manual:** **[`email-command-center-operator-manual.md`](./email-command-center-operator-manual.md)** (**EMAIL-COMMAND-CENTER-OPERATOR-MANUAL-1.0**) — daily workflows + never-do + troubleshooting + roles. **No** migrations, **no** schema, **no** env work, **no** sends.

### EMAIL-COMMAND-CENTER-CLOSEOUT-1.0 (implemented — documentation + staging discipline)

**Docs only:** **[`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md)** — every ECC admin route with status, purpose, can/cannot, upstream/downstream, smoke expectation, governance note · **[`email-command-center-closeout-2026-05-05.md`](./email-command-center-closeout-2026-05-05.md)** — what is operator-ready vs blocked, hosted verification disclaimer, checks, known warnings, next packets · **[`email-command-center-selective-staging-guide.md`](./email-command-center-selective-staging-guide.md)** — do-not-stage list + packet-grouped **`git add`** hints (**commands suggested for humans; not auto-run**). **Progress ledger** moves to **~89%** overall (+ governance / deployment doc bumps) — see [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md). **No** product features, **no** migrations, **no** env.

### EMAIL-SEND-EXECUTION-GOVERNANCE-SHELL-1.0 (implemented — send doctrine, no APIs)

**Route:** **`/admin/workbench/email-command-center/send-execution`** — **`SendExecutionGovernanceView`**: Gmail vs SendGrid vs test vs internal vs automated **send rails** (all **future/blocked** today), **pre-send checklist** rows with verify links into Audience / imports / SendGrid / Analytics / readiness, **text decision tree**, **suppression gate** ( **`SendGridSuppression`** before broadcast; imports not assumed opted-in; suppression overrides audience membership ), **approval roles** table, **Blocked today** panel. **Cockpit:** featured card, pills, quick link, operator path step after Analytics, **Tonight’s path** card + future-send card both point here, **Email operating pipeline** “Send” step links here, route status grid row, audience-studio narrative link. **Cross-links:** Message Studio, Analytics, SendGrid Foundation, Audience Studio, Automation Studio, Route map, Readiness nav. **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged **false**; **no** migrations; **no** env; execution remains **`EMAIL-SEND-EXECUTION-1.0`**.

### EMAIL-MESSAGE-STUDIO-LOCAL-DRAFTS-1.1 (implemented — browser localStorage only)

**Route:** **`/admin/workbench/email-command-center/message-studio`** — **`MessageStudioDraftPlanner`** + **`message-studio-local-drafts.ts`**: multi-draft **library** in **`localStorage`** key **`reddirt:email-command-center:message-studio-drafts:v1`**; fields include title, type, subject, preheader, audience note, CTA, tone, **approvalStatus** (`draft` | `needs_review` | `reviewed` | `ready_for_future_send`), notes, **sourceContext**, body, **contentBlocksUsed**, **governanceAcknowledged**; **autosave**, duplicate/delete, copy body / subject+body, export **.json** / **.txt**; content blocks **Insert** + **Copy**; query params **`source`**, **`id`**, **`audienceDefinitionId`**, **`importBatchId`** (chips only — no body fetch). **Does not:** write Postgres, send mail. **Future:** server/shared draft persistence packet (separate from this **1.1** local slice).

### EMAIL-MESSAGE-STUDIO-CAMPAIGN-VOICE-1.2 (implemented — production drafting posture, no demo)

**Route:** same **`/message-studio`** — adds **`campaign-voice.ts`** (curated principles, tone/issue/audience/CTA frames, **source material readiness** tied to real repo paths + `SearchChunk` ingest posture per **`src/lib/openai/README.md`**), **`MessageStudioCampaignPanels`**, **Draft Quality Review** (self-checklist + advisory readiness label), **revision + generate** via **`message-studio-ai-actions.ts`** + **`message-draft-ai.ts`** when **`OPENAI_API_KEY`** is set on the server (admin session required); **graceful disable** when missing. **EMAIL-CAMPAIGN-VOICE-SOURCE-READINESS-1.0** expands the registry (mission through compliance language), **`#message-studio-source-readiness`** four-bucket panel + paste templates + thin-context warning, and merges **deterministic `sourceLimitations`** into AI JSON after each call. **Local draft** stores **`campaignVoice`**, **`lastAiAdvisoryJson`**, **`qualityChecklist`**, **`approvalOwner`** in **`localStorage`**; operator must click **Use first suggestions + body** — **no** auto-overwrite. **No** migrations, **no** sends, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged.

### EMAIL-EDITORIAL-REVIEW-DESK-1.0 (implemented — review before Send Execution Governance)

**Route:** same **`/message-studio`** — **`message-studio-editorial-review-model.ts`** + **`MessageStudioEditorialReviewPanel`**: editorial **review status** (draft → needs edits → comms → principal → send-governance review), **review owner** (operator through field/organizing), **review notes** on local draft; **claim/source** checklist (per-row `clear` / `needs_source` / `remove` / `needs_approval` + guidance — **no** automated fact-check); **voice/audience fit** checklist (aligned with Campaign Voice summary); **compliance/suppression** reminder acknowledgments; **advisory readiness tier** (missing basics / needs review / review-ready / send-governance-ready) from local fields + checklists — **explicitly not** legal compliance; **handoff** summary + **Open Send Execution Governance** CTA. **Persistence:** **`localStorage`** on draft JSON only.

### EMAIL-MESSAGE-STUDIO-PRODUCTION-TEMPLATES-1.0 (implemented — operator template library, no send)

**Route:** same **`/message-studio`** — **`src/lib/email-command-center/message-templates.ts`** defines **15** production categories (volunteer activation through voter education) with **risk**, **approval level**, **recommended** tone/issue/audience/CTA frame ids, subject/preheader patterns, body skeletons with explicit placeholders (no unsourced claims), compliance + review + source-requirement copy, and **`MessageStudioProductionTemplatesPanel.tsx`**: filter by category and audience tag, preview structure, **apply** with **empty-only / append / confirmed replace** for body, copy outline, fill/replace subject+preheader helpers, append skeleton only; **`templateIdLastApplied`** and **`templatesUsed`** on **`message-studio-local-drafts`**. **Campaign Voice AI:** **Use this template with Campaign Voice AI** queues a bounded JSON **`templateSummary`** into the **next** **`generateCampaignVoiceDraftAction`** call (existing server path; **no** new OpenAI integration). **Editorial Review Desk** shows last-applied template risk/approval + review notes strip. **No** demo mode, **no** migrations, **no** Postgres, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged. **Future:** shared/server template catalog if staff need one canonical library across devices.

### EMAIL-SEND-PACKET-BUILDER-1.0 (implemented — no-send review packet before execution)

**Route:** same **`/message-studio#send-packet-builder`** — **`message-studio-send-packet.ts`** + **`MessageStudioSendPacketPanel.tsx`**: assembles a **client-only** review artifact from the active local draft (copy, Campaign Voice summary, editorial tier/blockers, template ids used, advisory future-send rail, fixed **`sendGovernanceRequired: true`**, **`canSendFromPacket` / `canSendFromQueue` false**); **packet completeness** checklist derived from draft fields; **manual** suppression/consent + approval checklists; operator notes; **copy** summary / subject+preheader+body; **export** `.json` / `.txt`; optional **Save packet snapshot to draft** persists **`lastSendPacketJson`** + **`lastSendPacketGeneratedAt`** in **`localStorage`** only. **`/send-execution`** gains doctrine copy + precheck row **Send packet prepared** linking back to Message Studio. **`/daily`** links to **`#send-packet-builder`** when drafts reach **`send_governance_ready`**. **No** SendGrid/Gmail/provider calls, **no** migrations, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged. **Future:** server/shared packet if multi-device canonical artifacts are required.

### EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0 (implemented — Postgres persistence / review only)

**Route:** same **`/message-studio#shared-drafts`** — Prisma **`MessageStudioDraft`** + **`MessageStudioDraftRevision`** (migration **`20260508120000_message_studio_server_drafts`**); **`message-studio-drafts.ts`**, **`message-studio-draft-actions.ts`** (admin **`requireAdminAction`** only; **no** OpenAI on these paths), **`MessageStudioSharedDraftsPanel.tsx`**: promote local draft JSON → shared row; list/open (confirm if local dirty)/update workflow status + body fields; archive; revision snapshots (**review history only**). **`getEmailCommandCenterSnapshot`** exposes **`messageStudioSharedDrafts`** counts; **`/daily`** priority cards + next-actions; **`/send-execution`** pre-send checklist row **Shared draft saved / reviewed** + decision tree copy. **Does not:** send mail, change **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`**, import contacts, trust client-submitted user ids without DB verification for assignee. **Hosted:** operator must run **`migrate deploy`** + full gate on **Kelly-Grappe-App** `DATABASE_URL` / `DIRECT_URL` — **local Docker green ≠ hosted verified**.

### EMAIL-SENDGRID-CONTACT-SYNC-1.1 + EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2 (implemented — preview + governed Marketing Contacts upsert)

**Routes:** **`/admin/workbench/email-command-center/sendgrid#contact-sync`** · **`/audiences`** cross-links. **Library:** **`sendgrid-contact-sync.ts`** — readiness, preview builders, **`createSendGridContactSyncRun`**, **`markSendGridContactSyncRunPreviewed`**, **`executeApprovedSendGridContactSyncRun`**, **`markSendGridContactSyncRunSynced`**, **`markSendGridContactSyncRunFailed`**, **`buildSendGridUpsertPayloadFromApprovedRun`**; **`src/lib/sendgrid/marketing-contacts.ts`** — **`getSendGridMarketingContactsReadiness`**, **`buildSendGridMarketingContactPayload`** (**email** field only — no arbitrary custom fields), **`upsertSendGridMarketingContacts`** (PUT **`/v3/marketing/contacts`**), **`getSendGridContactImportStatus`**, **`sanitizeSendGridApiError`**. **Prisma:** **`SendGridContactSyncRun`** + enum (migration **`20260509120000_sendgrid_contact_sync_run`**). **Admin actions:** **`sendgrid-contact-sync-actions.ts`** — preview save, approve, **`executeSendGridContactSyncRunAction`** (**APPROVED** + **`SENDGRID_API_KEY`** + production **hosted DB gate**). **Read model:** **`getEmailCommandCenterSnapshot.sendGridContactSync`** (incl. **`runsApprovedAwaitingExecutionCount`**, PREVIEWED/SYNCED/FAILED counts, last sync, provider job sample). **Analytics / Daily:** same fields surfaced for operator posture (approved awaiting upsert, failed needs review). **Governance:** suppression re-check + missing-email exclusions on execute; **no** email send, **no** campaigns/schedules/automation activation; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged **false**. **Next:** **EMAIL-SEND-EXECUTION-1.0** (actual sends).

### EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0 (implemented — operator-complete, execution-gated)

**Docs + tooling:** **[`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md)** (operator-complete posture, **safe vs blocked**, local Docker vs hosted Kelly-Grappe/Supabase, no-send doctrine, `localStorage` limits, routes to smoke, commands, **stop conditions**), **[`email-command-center-first-run-operator-checklist.md`](./email-command-center-first-run-operator-checklist.md)** (**21** steps including Gmail monitor, Gmail review, queue, profiles, analytics, automation, **`npm run check`**), **`scripts/email-command-center-no-send-scan.mjs`** + **`npm run email:no-send-scan`** (**PASS** / **WARN** / **FAIL**; ECC vs integration; `sgMail` / `sendgrid.send` / Gmail send heuristics; redacted excerpts), **[`email-command-center-selective-staging-guide.md`](./email-command-center-selective-staging-guide.md)** (final staging discipline + packet buckets), **[`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md)** (quick table **safe / blocked** + **`#editorial-review-desk`** / **`#send-packet-builder`**). **Copy:** cockpit **operator-complete, execution-gated**; Daily **no-send posture**; send-execution **doctrine only**; Message Studio **local + shared drafts** (shared = **SERVER-DRAFTS-1.0**); imports **canonical DB** warning. **No** new product features in this packet; **no** migrations in the hardening pass; **no** sends.

**Remaining execution blockers (documented; not removed by hardening):** **Kelly-Grappe-App** (canonical hosted Supabase Postgres) **Prisma verification** — **`KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0`**: **`npm run email:db:diagnose`** must show **hosted** hostnames, then migrate status/deploy, preflight, **`email:contact-import:gate`**, **`email:no-send-scan`**, **`npm run check`** on **those** URLs (latest automated attempt: **not** passed — still **loopback** in that env); **SendGrid** Marketing **contact upsert** ships in **EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2** (**no** email send — production still requires hosted gate before **`executeSendGridContactSyncRunAction`**); **governed** provider **email** send execution (**EMAIL-SEND-EXECUTION-1.0** and follow-ons); **production automation activation**. **Note:** **EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0** ships on whichever Postgres **`migrate deploy`** targets — **hosted** verification = same gate on **hosted** URLs.

### EMAIL-DAILY-OPERATOR-CONSOLE-1.0 (implemented — start-of-day operator surface)

**Route:** **`/admin/workbench/email-command-center/daily`** — **`DailyOperatorConsoleView`** (client) fed by **`getEmailCommandCenterSnapshot`** on the server page: **today’s priorities** cards (queue needs-attention / unassigned / escalated / ready-to-respond, profile suggestions, audience hints, import batches, draft audience defs, SendGrid events/suppressions, AI-analyzed queue count, **shared Message Studio draft** counts from snapshot when DB healthy, plus **local-only** Message Studio draft headline counts after **`localStorage`** hydrate), **rule-based next best actions** (DB gate → queue → profiles → imports → local editorial → shared drafts → suppressions → default), five **operator work queue** sections with deep links into Gmail monitor/review, queue filters, profiles, audiences, imports, Message Studio (**`#shared-drafts`**, **`#editorial-review-desk`** anchor on **`MessageStudioEditorialReviewPanel`**), send governance, analytics, automation, readiness, map. **`DailyLocalDraftSummary`** reads **`reddirt:email-command-center:message-studio-drafts:v1`** only in-browser — **no** upload from that widget. **Cockpit:** featured card, operator path **step 1**, route grid row, quick link pill. **No** demo mode, **no** DB writes from this page, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged.

### Command Center “sub-bargraph” (track this build)

Use this table to monitor **Email OS implementation** (orthogonal to the full-campaign bargraph). Percent = rough readiness to **use** each slice in production; **100%** means shipped and operator-trusted for that slice.

| Slice | ~% | What “done” means |
|-------|---:|---------------------|
| **A. Shell + navigation** | **~100** | Cockpit + **`/daily`** + **`/map`** + **`/readiness`** + **`/send-execution`** + smoke test doc — operator navigation (**DAILY-OPERATOR-CONSOLE-1.0** + **FINAL-POLISH-1.0** + **EMAIL-SEND-EXECUTION-GOVERNANCE-SHELL-1.0**) |
| **B. Queue read model** | **100** | Real counts, deep links, assignment/stale heuristic |
| **C. Gmail monitor** | **~84** | OAuth + **manual metadata sync** + **Gmail Review → queue (manual)** + **hardened history** + **`users.watch`** + **Pub/Sub POST scaffold** + **preflight** + **renewal preview**; **subscriber auto-fetch** → future packets |
| **D. SendGrid broadcast** | **~78** | **FOUNDATION-1.0** + **CONTACT-SYNC-1.1/1.2** + **`mail-send.ts`** + **`send-execution`** governed path (ASM, suppression, typed final); live operator-proven sends raise trust |
| **E. OpenAI intelligence** | **~78** | Queue AI + Message Studio server advisory drafting (optional **templateSummary** on generate); **SOURCE-READINESS-1.0** deterministic **`sourceLimitations`** merge + thin-context UX; editorial desk improves review discipline; still no Command Center auto-send |
| **F. Audience / profile graph** | **~72** | **EMAIL-CONTACT-PROFILE-GRAPH-1.0** + **EMAIL-AUDIENCE-STUDIO-1.0** + **EMAIL-CONTACT-IMPORT-STAGING-1.0** + **Message Studio** handoff links — `/profiles` + `/audiences` + `/imports`: approved-fact previews, draft definitions, staged CSV approve/commit; **FINAL-POLISH-1.0** empty-state guidance |
| **G. Message studio** | **~99** | **LOCAL-DRAFTS-1.1** + **CAMPAIGN-VOICE-1.2** + **SOURCE-READINESS-1.0** + **EDITORIAL-REVIEW-DESK-1.0** + **PRODUCTION-TEMPLATES-1.0** + **SEND-PACKET-BUILDER-1.0** + **Daily** summary + **LAUNCH-HARDENING-1.0** first-run muscle memory — governed **review packet** export before execution; shared drafts shipped (**SERVER-DRAFTS-1.0**) |
| **H. Automation studio** | **~76** | **Daily** work-queue link + **GOVERNANCE-SHELL-1.0** + **EMAIL-ANALYTICS-DRILLDOWN-1.0** (policy table mirrored on Analytics drilldown) — doctrine visible; **no** engine activation |
| **I. Send execution (governed)** | **~88** | **EMAIL-SEND-EXECUTION-1.0** — **`#ops`** + admin actions (preflight, test, final approval, broadcast after **`SEND APPROVED`**); doctrine shell remains on same route; **no** auto-send |
| **J. Analytics + deliverability** | **~92** | **`/analytics`** — **`sendExecution`** + **`sendGridContactSync`** + **`buildEmailAnalyticsOperatorDrilldown`** row samples + readiness score chips + drilldown anchors (**EMAIL-ANALYTICS-DRILLDOWN-1.0**); suppression + reconciliation; deep performance charts = future packet |
| **K. Governance + compliance UX** | **~100** | **GOVERNANCE-SHELL-1.0** + **EDITORIAL-REVIEW-DESK-1.0** + **LAUNCH-HARDENING-1.0** (first-run + no-send scan + route health doc) — **not** legal warranty |

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

| **Purpose** | **Shipped slice:** governed **SendGrid Mail API** execution from **shared** `MessageStudioDraft` + send packet JSON + **ACTIVE** `EmailAudienceDefinition` + optional **SYNCED** `SendGridContactSyncRun` — preflight, suppression exclusions on `EmailSendRecipient`, single-address **test** send, **final** approval row, typed **`SEND APPROVED`** confirmation for broadcast, safe `providerResultJson` / `errorSafe`. **Not shipped here:** queue send, automation, Gmail mass path. **Webhook→recipient reconciliation:** **EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0** (separate; **no** sends). |
| **Dependencies** | SendGrid foundation + suppressions; Message Studio server drafts; audience studio; contact sync 1.2 for broadcast-linked runs. |
| **Schema** | **`EmailSendExecution`**, **`EmailSendRecipient`**, **`EmailSendApproval`** (+ enums) — migration **`20260510140000_email_send_execution`**. |
| **UI** | **`/admin/workbench/email-command-center/send-execution`** — `SendExecutionGovernanceView` + **`#ops`** `SendExecutionOperationsPanel`; Message Studio / Send Packet / shared drafts / Audience / SendGrid “Prepare send execution” links. |
| **Env** | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, `SENDGRID_UNSUBSCRIBE_GROUP_ID` (broadcast). |
| **Safety gate** | Fail closed: no ASM → no broadcast; zero READY recipients → no send; import consent flag in packet when import-sourced profiles; production final send requires hosted DB gate in admin action. |
| **Acceptance** | **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** stays **false**; **`npm run email:no-send-scan`** ECC-clean; provider **`/mail/send`** only in **`mail-send.ts`** + final-gated admin actions; snapshot exposes **`needPreflightCount`**, **`sendGridMailTestReady`**, **`sendGridMailBroadcastReady`** for Daily/Analytics/`#ops` disables. |

### 8.8.1 EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0

| **Purpose** | Link ingested **`SendGridEvent`** rows to **`EmailSendRecipient`** / **`EmailSendExecution`** for deliverability posture (delivered, bounce, dropped, spam, unsubscribe, open/click metadata on matched rows). **No** SendGrid Mail send, **no** Marketing upsert, **no** Gmail send from this packet. |
| **Dependencies** | **`SendGridEvent`** / **`SendGridSuppression`** from **EMAIL-SENDGRID-FOUNDATION-1.0**; **`EmailSendExecution`** / **`EmailSendRecipient`** from **EMAIL-SEND-EXECUTION-1.0**; optional **`custom_args`** on governed **`/v3/mail/send`** for deterministic match. |
| **Schema** | Uses existing models; reconciliation state in **`SendGridEvent.metadataJson.eccReconciliation`**; rollups on **`EmailSendExecution.metadataJson.eccRecipientRollup`**. |
| **UI** | Analytics **`#reconciliation`** (summary + batch reconcile); SendGrid Foundation status strip; Daily priority cards + next-actions. |
| **Env** | None beyond existing webhook + DB. |
| **Safety gate** | Admin-only server actions; reconcile is **read/update Postgres only**; suppression-class events may append **`SendGridSuppression`** when mapping says so. |
| **Acceptance** | Unmatched events recorded safely; **`npm run email:no-send-scan`** remains clean; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged. |

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
