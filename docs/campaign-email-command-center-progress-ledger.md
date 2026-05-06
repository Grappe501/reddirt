# Email Command Center — Progress Ledger

**Packet:** **EMAIL-COMMAND-CENTER-PROGRESS-LEDGER-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Companion:** [`campaign-email-command-center-master-plan.md`](./campaign-email-command-center-master-plan.md) · [`campaign-email-command-center-cursor-protocol.md`](./campaign-email-command-center-cursor-protocol.md)

## Rules (Steve / Cursor protocol)

1. **Until the Email Command Center is considered complete**, every **Comms / Email OS** Cursor return must include the **EMAIL COMMAND CENTER PROGRESS LEDGER** block (15 layers + Overall below). This is the **primary** progress bar for email work — **not** the full multi-division campaign bargraph.
2. **Full-campaign** progress may be included **secondarily** only when it helps steering; it does **not** replace this ledger.
3. **Percentages move only** when **code, operators-visible runtime behavior, or honest documentation of shipped reality** changes — not from aspiration or roadmap text alone.
4. **No secrets** in ledger updates: env **names** only; never token values, client secrets, or webhook strings.

---

## Milestone rubric (all layers)

Use the same anchors when scoring any layer:

| % | Meaning |
|---|--------|
| **0%** | Not started — no intentional repo seam for operators. |
| **25%** | Scaffold — types, docs, or env gates; little or no operator UI. |
| **50%** | **Partial** — real path exists; notable gaps, manual steps, or policy not productized. |
| **75%** | **Strong** — operators can complete the core job repeatedly; governance/edge cases still thin. |
| **100%** | **Production-grade** for this layer — trusted, documented, with clear failure modes and compliance posture (where applicable). |

---

## Tracked layers (15 + overall)

Percentages below reflect **repo reality after EMAIL-SEND-EXECUTION-1.0** (governed **`EmailSendExecution`** path: preflight → optional **SendGrid** test → final approval → **`SEND APPROVED`** broadcast via **`mail-send.ts`** — **no** queue send, **no** automation; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged **false**) layered on **EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2**. **`npm run email:db:diagnose`** in automated passes still commonly shows **local Docker** loopback — **Kelly-Grappe-App hosted Supabase** verification remains **operator-owned**. Agent pass did **not** prove live test or final broadcast against production keys.

| Layer | ~% | What moves the needle |
|-------|---:|------------------------|
| **1. Command Center Shell / Cockpit** | **100** | **Daily Operator Console** featured first in operator path + route grid; start-of-day surface ships. |
| **2. Email Queue / Triage Workflow** | **93** | Daily console surfaces needs-attention / unassigned / escalated / ready counts + deep links; shared draft posture line when DB healthy. |
| **3. Gmail OAuth Connection** | **80** | Unchanged. |
| **4. Gmail Metadata Sync** | **82** | Unchanged. |
| **5. Gmail Watch / Push Sync** | **65** | Unchanged. |
| **6. SendGrid Foundation** | **88** | **1.1 + 1.2** contact upsert rails unchanged; **1.0** adds **`mail-send.ts`** (POST **`/v3/mail/send`**) used **only** from **`send-execution.ts`** + admin **`email-send-execution-actions`**; broadcast requires numeric **`SENDGRID_UNSUBSCRIBE_GROUP_ID`**; sanitized errors only; **no** Marketing **campaign** scheduling here. |
| **7. OpenAI Email Intelligence** | **70** | Unchanged. |
| **8. Contact/Profile Graph** | **72** | Daily console highlights pending suggestions for triage posture. |
| **9. Audience / Microtargeting Studio** | **80** | Per-audience **SendGrid contact sync** link + latest run status chip; execution path documented on SendGrid Foundation (**contact upsert ≠ send**). |
| **10. Message Studio / Drafting** | **98** | **EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0**: Postgres **`MessageStudioDraft`** + **`MessageStudioDraftRevision`**; promote/list/open/update/archive/revision UI; **localStorage** remains for per-browser scratch; **no** send. |
| **11. Automation Studio** | **76** | Daily console work-queue link + analytics pairing; execution path remains **operator-only** — no automation activation. |
| **12. Analytics / Deliverability** | **82** | Snapshot **`sendExecution`** counts + Analytics section (totals, test/final/failed); contact sync counts retained; **no** open/click claims until webhook reconciliation packet. |
| **13. Governance / Compliance Rails** | **100** | Launch hardening + send doctrine + no-send scan hook — **not** legal warranty; operators have explicit **safe-now vs blocked** docs. |
| **14. Deployment / Env Readiness** | **88** | **Local only** for automated verification this pass — **hosted Kelly-Grappe-App** still needs **`migrate deploy`** + **`email:contact-import:gate`** on **hosted** `DATABASE_URL` / `DIRECT_URL` (**93%** here when hosted verified). Production upsert to SendGrid is **blocked** until that gate passes (`executeSendGridContactSyncRunAction`). |
| **15. Overall Email Command Center** | **99** | **1.0** wires governed SendGrid **Mail** execution UI + audit models (explicit actions only); **1.2** contact upsert still separate; **~99.2%** when operator-proven **test** send on hosted stack; **~99.5%** when **final** broadcast + hosted gate smoke both proven. |

---

## Cursor return — paste block

Every **email packet** return must end with:

```text
EMAIL COMMAND CENTER PROGRESS LEDGER
- Overall Email Command Center:
- Command Center Shell / Cockpit:
- Email Queue / Triage Workflow:
- Gmail OAuth Connection:
- Gmail Metadata Sync:
- Gmail Watch / Push Sync:
- SendGrid Foundation:
- OpenAI Email Intelligence:
- Contact/Profile Graph:
- Audience / Microtargeting Studio:
- Message Studio / Drafting:
- Automation Studio:
- Analytics / Deliverability:
- Governance / Compliance Rails:
- Deployment / Env Readiness:
```

---

## Related implementation packets (grounding)

- **EMAIL-COMMAND-CENTER-SHELL-1.0** — cockpit route.  
- **EMAIL-GMAIL-CONNECT-1.0** — OAuth + Monitor shell.  
- **EMAIL-GMAIL-SYNC-1.1** — metadata sync + history dry-run cursor.  
- **EMAIL-GMAIL-WATCH-1.2** — `users.watch`, `gmailSyncState` watch fields, Pub/Sub receiver scaffold, manual history preview.  
- **EMAIL-GMAIL-OPS-HISTORY-1.3** — DB preflight; honest migrate/check docs; hardened history processor; watch renewal preview tooling; Pub/Sub parse helper.  
- **EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4** — **`/admin/workbench/email-command-center/gmail/review`**: metadata-only INBOX review; **manual** `createEmailWorkflowItemFromGmailMetadataAction`; `metadataJson.gmailReviewSource` provenance (`bodyStored: false`); Postgres JSON duplicate guard; **no** bodies, **no** send, **no** auto-queue from Gmail.  
- **EMAIL-AI-INTELLIGENCE-1.0** — **`src/lib/email-workflow/ai/*`**, **`runEmailWorkflowAiAnalysisAction`**; queue detail **AI Email Intelligence** panel; Command Center readiness + count of rows with `metadataJson.emailAiAnalysis`; **advisory-only** structured output; **no** Gmail body reads, **no** send, **no** automatic queue approval or profile merges.  
- **EMAIL-CONTACT-PROFILE-GRAPH-1.0** — Prisma **`EmailContactProfile*`** + **`EmailAudienceHint`**; **`profile-graph.ts`**, **`email-profile-graph-actions.ts`**; queue detail **Contact / Profile Intelligence**; **`/admin/workbench/email-command-center/profiles`**; **no** auto CRM merge, **no** SendGrid segments from hints. **Migration:** `20260505203000_email_contact_profile_graph`.  
- **EMAIL-AUDIENCE-STUDIO-1.0** — **`audience-studio.ts`**, **`email-audience-actions.ts`**, **`/admin/workbench/email-command-center/audiences`**; **`EmailAudienceDefinition`** + **`EmailAudiencePreviewRun`**; previews over **ACTIVE** facts; **no** SendGrid sync, **no** sends. **Migration:** `20260505220000_email_audience_studio_foundation`.  
- **EMAIL-SENDGRID-FOUNDATION-1.0** — **`src/lib/sendgrid/config.ts`**, **`sendgrid-foundation.ts`**, **`event-parser.ts`**, **`/admin/workbench/email-command-center/sendgrid`**, **`POST /api/sendgrid/events`** → **`SendGridEvent`** + **`SendGridSuppression`** (+ mapping tables **unused for live sync** in this packet); **no** sends, **no** OpenAI, **no** auto contact sync. **Migration:** `20260506120000_email_sendgrid_foundation`.  
- **EMAIL-SENDGRID-CONTACT-SYNC-1.1** — **`sendgrid-contact-sync.ts`**, **`sendgrid-contact-sync-actions.ts`**, **`SendGridContactSyncRun`** + enum; **`#contact-sync`** on Sendgrid Foundation; **ACTIVE**-audience-only operator **preview run** persistence; suppression-aware exclusions + consent/source warnings; **`getEmailCommandCenterSnapshot.sendGridContactSync`**; Audience Studio link + run status; Analytics + Daily cards. **Migration:** `20260509120000_sendgrid_contact_sync_run`.  
- **EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2** — **`src/lib/sendgrid/marketing-contacts.ts`** (readiness, payload builder `email` only, `upsertSendGridMarketingContacts`, `getSendGridContactImportStatus`, `sanitizeSendGridApiError`); **`executeApprovedSendGridContactSyncRun`**, **`markSendGridContactSyncRunSynced`**, **`markSendGridContactSyncRunFailed`**, **`buildSendGridUpsertPayloadFromApprovedRun`**; admin **`executeSendGridContactSyncRunAction`** (requires **APPROVED**, **SENDGRID_API_KEY**, production **hosted DB gate**); **`#contact-sync`** execute UI + warnings; snapshot **SYNCED**/failed/last job fields; **no** email send, **no** campaigns/schedules/automation activation; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged.  
- **EMAIL-SEND-EXECUTION-1.0** — Prisma **`EmailSendExecution`**, **`EmailSendRecipient`**, **`EmailSendApproval`** (migration **`20260510140000_email_send_execution`**); **`send-execution.ts`**, **`mail-send.ts`** (SendGrid **`/v3/mail/send`** only); admin **`email-send-execution-actions.ts`**; **`/send-execution#ops`** `SendExecutionOperationsPanel`; snapshot **`sendExecution`**; Daily + Analytics cards; Message Studio / Send Packet / Audience / SendGrid handoff links; preflight (suppression + consent packet gate + ASM for broadcast), single-address test send, final approval, typed **`SEND APPROVED`** broadcast; production final send **hosted DB gate**; **no** queue send, **no** automation. **Next:** event→recipient reconciliation; Gmail one-to-one governed path; automation activation policies.  
- **EMAIL-DB-RECONCILE-CONTACT-IMPORT-GATE-1.0** — **`scripts/email-command-center-db-diagnose.mjs`**, **`npm run email:db:diagnose`**, **`npm run email:contact-import:gate`**, expanded **`email-command-center-preflight.mjs`** (DNS + `_prisma_migrations` ECC migration set vs DB unreachable), cockpit **`operatorGate`**, [`email-command-center-contact-import-readiness.md`](./email-command-center-contact-import-readiness.md); **no** secrets in CLI output.  
- **EMAIL-CONTACT-IMPORT-STAGING-1.0** — Prisma **`EmailContactImportBatch`**, **`EmailContactImportRow`**, **`EmailContactImportDecision`**; **`contact-import.ts`**; **`email-contact-import-actions.ts`**; **`/admin/workbench/email-command-center/imports`** (+ batch detail); validate → approve → commit to **`EmailContactProfile`** + facts with **`CONTACT_IMPORT`** provenance; **no** SendGrid sync, **no** sends, **no** OpenAI on this path. **Migration:** `20260507180000_email_contact_import_staging`.  
- **EMAIL-DB-PEOPLEBASE-SUPABASE-VERIFY-1.0** — **`npm run email:db:diagnose`**: Supabase vs local-Docker hints, **`DIRECT_URL`** parse, operator checklist for the **Canonical Supabase DB**, safe failure categories; **`prisma/schema.prisma`** `directUrl = env("DIRECT_URL")`; **Netlify** `netlify-build.sh` mirrors `DIRECT_URL` when unset; **docs** [`deployment.md`](./deployment.md) + import readiness: **real imports blocked until that hosted gate passes** (operator sets hosted `DATABASE_URL` / `DIRECT_URL` privately). *Packet ID retains historical codename PeopleBase.*  
- **SUPABASE-CANONICAL-DB-AND-ENV-GATE-1.0** — Diagnose + docs: **`NEXT_PUBLIC_SUPABASE_*`** (SSR/Auth) reported **separately** from **`DATABASE_URL` / `DIRECT_URL`** (Prisma); contact-import **full** gate still operator-run; **no** claim of canonical verification without hosted **`email:contact-import:gate`**.  
- **EMAIL-COMMAND-CENTER-TONIGHT-FINISH-1.0** — **`/admin/workbench/email-command-center/message-studio`** (drafting/planning only; client planner preview; **no** DB persistence); cockpit **Tonight’s Operator Path**, Message Studio card, queue/Audience/Import handoff links; split DB warnings; **no** migrations, **no** sends, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged.  
- **EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0** — **`/admin/workbench/email-command-center/automation`** (Automation Studio: tiers, triggers, actions, playbooks, governance — **no** activation) · **`/admin/workbench/email-command-center/analytics`** (Analytics & Deliverability: read-only aggregates from **`getEmailCommandCenterSnapshot`** + suppression breakdown when DB healthy); cockpit cards, operator path, pipeline links, cross-links; **`openImportBatchCount`** on import snapshot (non-terminal batches); **no** migrations, **no** sends, **no** env changes, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged.  
- **EMAIL-COMMAND-CENTER-FINAL-POLISH-1.0** — **`/admin/workbench/email-command-center/map`** (route map + flows) · **`/admin/workbench/email-command-center/readiness`** (snapshot-driven checklist); cockpit **Operator start path**, **What is ready / blocked** summaries, empty-queue hint; empty-state panels on Gmail review, profiles, audience studio, imports, SendGrid, Message Studio, Automation, Analytics; **[`email-command-center-operator-smoke-test.md`](./email-command-center-operator-smoke-test.md)**; **no** migrations, **no** sends, **no** env/schema work.  
- **EMAIL-COMMAND-CENTER-CLOSEOUT-1.0** — **[`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md)** (every ECC route: status, purpose, can/cannot, links, smoke, governance) · **[`email-command-center-closeout-2026-05-05.md`](./email-command-center-closeout-2026-05-05.md)** (what shipped, blocked, hosted verification, checks, next packets) · **[`email-command-center-selective-staging-guide.md`](./email-command-center-selective-staging-guide.md)** (do-not-stage + packet-grouped `git add` hints); **docs-only** — **no** features, **no** migrations, **no** env.  
- **EMAIL-SEND-EXECUTION-GOVERNANCE-SHELL-1.0** — **`/admin/workbench/email-command-center/send-execution`** (`SendExecutionGovernanceView`): send rails cards, pre-send checklist, decision tree, suppression gate doctrine, approval roles, blocked-today panel; cockpit card + operator path + pipeline link + cross-links (Message Studio, Analytics, SendGrid, Audience, Automation, map, readiness); read-model governance bullet; **no** provider APIs, **no** migrations, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged; execution = **EMAIL-SEND-EXECUTION-1.0** future.  
- **EMAIL-MESSAGE-STUDIO-LOCAL-DRAFTS-1.1** — **`message-studio-local-drafts.ts`** + **`MessageStudioDraftPlanner`** + **`message-studio-content-blocks.ts`**: browser **`localStorage`** multi-draft workspace (autosave, library, duplicate/delete, copy/export JSON+txt, content-block insert + **`contentBlocksUsed`**); query **`importBatchId`**; **no** sends. **Superseded for sharing** by **EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0** (local remains for scratch).  
- **EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0** — Prisma **`MessageStudioDraft`** + **`MessageStudioDraftRevision`**; migration **`20260508120000_message_studio_server_drafts`**; **`message-studio-drafts.ts`**, **`message-studio-draft-actions.ts`**, **`MessageStudioSharedDraftsPanel.tsx`**, **`#shared-drafts`**; promote local → server, list/open/update/archive, revision snapshots; **`getEmailCommandCenterSnapshot.messageStudioSharedDrafts`** + Daily Console + Send Governance checklist row; **no** SendGrid/Gmail/OpenAI on these paths; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged. **Hosted:** run **`migrate deploy`** + full gate on Kelly-Grappe-App URLs.  
- **EMAIL-MESSAGE-STUDIO-CAMPAIGN-VOICE-1.2** — **`campaign-voice.ts`** (curated principles, frames, source readiness from repo doc paths), **`MessageStudioCampaignPanels.tsx`**, **`message-draft-ai.ts`**, **`message-studio-ai-actions.ts`** (admin `requireAdminAction` + JSON OpenAI responses): Campaign Voice panel, draft quality self-check + readiness label, revision tools, **optional** AI generate when **`OPENAI_API_KEY`** set; **`lastAiAdvisoryJson`** on local draft until operator applies; **no** migrations, **no** demo mode, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged.  
- **EMAIL-EDITORIAL-REVIEW-DESK-1.0** — **`message-studio-editorial-review-model.ts`** + **`MessageStudioEditorialReviewPanel.tsx`**: editorial review status/owner/notes; claim+source, voice+audience, compliance reminder checklists; advisory **readiness tier** (missing basics → send-governance-ready); handoff blockers + **Open Send Execution Governance** link; all fields on **`localStorage`** draft; **no** DB, **no** send, **no** legal compliance claim.  
- **EMAIL-MESSAGE-STUDIO-PRODUCTION-TEMPLATES-1.0** — **`src/lib/email-command-center/message-templates.ts`** (registry: categories volunteer through voter education; risk, approval, tone/issue/audience/CTA hints, placeholders — **no** fabricated claims) + **`MessageStudioProductionTemplatesPanel.tsx`**: filter/preview/apply (empty-only / append / confirmed replace), copy outline, meta/body insert helpers, **`templateIdLastApplied`** / **`templatesUsed`** on local draft; **Use with Campaign Voice AI** queues **`templateSummary`** into existing **`generateCampaignVoiceDraftAction`**; editorial panel shows last template risk/approval + review notes. **No** demo mode, **no** migrations, **no** DB, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged. **Future:** optional shared/server template library if multi-device staff need one canonical set.  
- **EMAIL-DAILY-OPERATOR-CONSOLE-1.0** — **`/admin/workbench/email-command-center/daily`**: **`DailyOperatorConsoleView.tsx`** + **`DailyLocalDraftSummary.tsx`** — snapshot-driven **today’s priorities**, **rule-based next actions**, five-section **operator work queue**; **localStorage** draft summary (this browser only; **`#editorial-review-desk`** anchor) **plus** shared draft counts from **`getEmailCommandCenterSnapshot`** (**read-only**); cockpit **featured card**, operator path **step 1**, route grid row, quick link; **map** + **readiness** nav links. **No** demo mode, **no** sends.  
- **EMAIL-SEND-PACKET-BUILDER-1.0** — **`message-studio-send-packet.ts`** + **`MessageStudioSendPacketPanel.tsx`** on **`/message-studio`** (`#send-packet-builder`): builds a **no-send** operator review packet from the active local draft (subject, preheader, body, CTA, audience/source context, Campaign Voice labels, template tracking, editorial tier/blockers, compliance notes, fixed **`sendGovernanceRequired: true`**, **`canSendFromPacket` / `canSendFromQueue` false**); manual suppression + approval checklists; copy summary / copy body stack / export **.json** + **.txt**; **Save packet snapshot to draft** writes **`lastSendPacketJson`** + **`lastSendPacketGeneratedAt`** on **`MessageStudioLocalDraft`** (browser only). **`SendExecutionGovernanceView`**: intro copy + precheck row **Send packet prepared** + anchor link. **Daily**: next-action when **`send_governance_ready`** drafts exist; priority card + work-queue link to **`#send-packet-builder`**. **No** SendGrid/Gmail calls, **no** migrations/schema, **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged. **Future:** shared/server packet store if multi-device staff need one canonical artifact.  
- **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0** — **[`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md)** (operator-**complete** / execution-**gated**, safe vs blocked, local Docker vs hosted Kelly-Grappe/Supabase, no-send doctrine, `localStorage` limits, routes to smoke, commands, **stop conditions**); **[`email-command-center-first-run-operator-checklist.md`](./email-command-center-first-run-operator-checklist.md)** (**21** steps incl. Gmail monitor + review + queue + profiles + analytics + automation + `npm run check`); **`scripts/email-command-center-no-send-scan.mjs`** + **`npm run email:no-send-scan`** (**PASS** / **WARN** / **FAIL**; ECC vs integration; **`sgMail` / `sendgrid.send` / Gmail send** heuristics; excerpts redacted); **[`email-command-center-selective-staging-guide.md`](./email-command-center-selective-staging-guide.md)** (final discipline + packet buckets); **[`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md)** (quick table **safe / blocked** + **`#editorial-review-desk`** / **`#send-packet-builder`**); cockpit copy **operator-complete**. **No** new features, **no** migrations in this pass, **no** sends.  
- **KELLY-GRAPPE-APP-DB-GATE-1.0** — first operator/agent diagnose pass; loopback + unreachable local port → **Kelly-Grappe-App not verified** (docs).  
- **KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0** — **hosted** Kelly-Grappe-App verification packet: **`npm run email:db:diagnose`** → (only if **`DATABASE_URL`** = hosted Supabase) **`prisma migrate status`** → **`migrate deploy`** → **`email:command-center:preflight`** → **`email:contact-import:gate`** → **`email:no-send-scan`** + **`npm run check`**; **no** imports, **no** sends. **This repo pass (automated):** still **loopback** + DB unreachable → **gate not passed**; ledger **97%** / **86%** unchanged.  
- **Next (named):** **(1) Complete KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0** on **hosted** `DATABASE_URL` / `DIRECT_URL` (operator-owned env) — re-run **`migrate deploy`** + **`email:contact-import:gate`** so ECC tables (incl. contact sync runs) exist on production Postgres · **(2) EMAIL-SEND-EXECUTION-1.0** (governed **email** send / broadcast — **separate** from **1.2** contact-only Marketing upsert) · **(3) EMAIL-ANALYTICS-DELIVERABILITY-1.0** (charts + scheduled reporting beyond this shell) · **(4) EMAIL-AUTOMATION-STUDIO-1.1** (activation policies); governed **auto**-processing from Pub/Sub remains a **separate** explicit packet (**no** silent `messages.get`).

---

*Last updated: EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2 — Marketing Contacts upsert path for **APPROVED** `SendGridContactSyncRun` (no sends); local Docker **`npm run check`** + **`email:no-send-scan`** WARN (integration baseline); live SendGrid upsert smoke **operator-run**; hosted Kelly-Grappe-App verification **operator-run** on Supabase `DATABASE_URL`.*
