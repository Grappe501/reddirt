# Campaign Email Command Center — Integration Plan

**Packet:** **REDDIRT-EMAIL-OS-MASTERPLAN-1.0**  
**Mode:** **Mixed** — original packet was **design-only**; **§0** records **EMAIL-GMAIL-CONNECT-1.0** (**Gmail OAuth** + monitor **only**; **no** SendGrid/OpenAI in that packet). Design narrative below unchanged.

**Related:** [`campaign-email-command-center-master-plan.md`](./campaign-email-command-center-master-plan.md) · [`campaign-email-command-center-data-model.md`](./campaign-email-command-center-data-model.md) · **[`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)**

## 0. Implementation status

### EMAIL-GMAIL-CONNECT-1.0 (implemented — foundation)

- **OAuth:** `GET /api/gmail/oauth/start` (admin session + signed state + optional `return=` path) → Google → `GET /api/gmail/oauth/callback` → sealed **`StaffGmailAccount.oauthJson`** (v2 AES-GCM when **`GMAIL_TOKEN_ENCRYPTION_KEY`** set). Legacy plaintext rows still read until reconnect.
- **Scopes (new consent):** default **`gmail.metadata` only** (monitor-first). Optional **`gmail.send`** only when **`GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH=true`** (workbench human compose — not used by EmailWorkflowItem).
- **UI:** **`/admin/workbench/email-command-center/gmail`** (monitor), **`…/gmail/connect`** (redirect to start).
- **Watch/push layer:** **EMAIL-GMAIL-WATCH-1.2** adds **`users.watch`** registration + Pub/Sub scaffold on top of this OAuth path (does not replace connect).

### EMAIL-GMAIL-SYNC-1.1 (implemented — metadata foundation)

- **DB:** **`StaffGmailAccount.gmailSyncState`** (versioned JSON telemetry — **no** bodies/tokens).
- **Server:** `src/lib/gmail/metadata.ts`, `history.ts`, `sync.ts`, `client.ts`; admin action **`runGmailSafeMetadataSyncAction`**.
- **Behavior:** manual “Run safe metadata sync” — INBOX, max 25, **`format=METADATA`** + fixed header set; labels list; updates **`lastHistoryId`** from **`users.getProfile`**; optional **`history.list`** dry-run when prior cursor exists (404 → operator-safe message; **no** `EmailWorkflowItem` auto-create).
- **Not in this packet:** Pub/Sub, **`users.watch`**, body storage, **`q`** search (not used with gmail.metadata in this path).

---

### EMAIL-GMAIL-WATCH-1.2 (implemented — watch registration + pub scaffold)

- **Watch:** Admin **`startOrRenewGmailWatchForAccount`** / **`stopGmailWatchForAccount`** → Gmail **`users.watch`** / **`users.stop`**; **`GOOGLE_PUBSUB_TOPIC`** required; optional **`GMAIL_WATCH_LABEL_IDS`** (default INBOX); renewal **recommended daily** — see **`GMAIL_WATCH_RENEWAL_DAYS`** (1–7 day hint). Response **`historyId`** + **`expiration`** stored under **`StaffGmailAccount.gmailSyncState`** (`watchHistoryId`, `watchExpiration`, `watchStatus`).
- **Pub/Sub boundary:** **`POST /api/gmail/pubsub`** verifies **`x-gmail-pubsub-token`** against **`GMAIL_PUBSUB_VERIFICATION_TOKEN`** or **`GOOGLE_PUBSUB_VERIFICATION_TOKEN`** (required for acceptance — otherwise **403**). Decodes **`emailAddress`** + **`historyId`**; matches **`StaffGmailAccount.sendAsEmail`**; updates **metadata-only** counters in **`gmailSyncState`**. **No** `messages.get`, **no** bodies, **no** `EmailWorkflowItem` creation.
- **History preview (manual):** **`processGmailHistorySinceStoredCursor`** — bounded **`history.list`** pagination, aggregate counts (added/deleted/labels), advances cursor on success; **404** → **`historyCursorStale`** + **`requiresFullSync`** (operator runs safe metadata sync).
- **Not in this packet:** renewal cron/worker, automated fetch pipeline from Pub/Sub, SendGrid/OpenAI, governed auto-queue.

---

### EMAIL-GMAIL-OPS-HISTORY-1.3 (implemented — ops hardening)

- **DB / migration honesty:** `npm run email:command-center:preflight` verifies **`DATABASE_URL`**, connectivity, and **`StaffGmailAccount.gmailSyncState`** (never prints secret values). **`npm run check` does not imply `migrate deploy` applied** — use `npx prisma migrate deploy && npm run check` or **`npm run email:command-center:migrate-and-check`**. On PowerShell prefer **`&&`** over **`;`** when migration failure must abort the chain.
- **History processor:** `processGmailHistorySinceStoredCursor` respects **`requiresFullSync`** / **`historyCursorStale`** (blocks until metadata sync); uses **`lastHistoryId`** as the only Gmail **`startHistoryId`** (Pub/Sub **`pendingHistoryId`** is a signal, not a cursor); clears **`pendingHistoryId`** after successful **`history.list`**; **404** → stale cursor + **`requiresFullSync`** without poisoning **`lastHistoryId`**; generic errors persist safe operator fields (**no** bodies, **no** queue rows, **no** send).
- **Admin:** **`processGmailPendingHistoryPreviewAction`** (manual) with dedicated redirect when full sync is required.
- **Watch renewal (runbook):** `src/lib/gmail/watch-renewal.ts` + **`npx tsx scripts/gmail-watch-renewal-preview.ts`** (preview); **`--execute`** only with **`GMAIL_WATCH_RENEWAL_EXECUTE=1`** — calls **`users.watch`** only (**no** bodies / queue). **No** scheduled job in-app until explicitly wired.
- **Pub/Sub:** `POST /api/gmail/pubsub` remains verification-gated; payload parsing centralized in **`pubsub-notify-parse`** (offline **`npm run email:gmail:pubsub-parse-check`**).

---

### EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4 (implemented — operator Gmail metadata → queue)

- **UI:** **`/admin/workbench/email-command-center/gmail/review`** — INBOX sample (max 25), **METADATA** headers only; governance copy; links to Gmail monitor + Command Center.
- **Read model:** `src/lib/gmail/review.ts` (`getGmailReviewInboxForAdmin`, `buildGmailReviewItemFromMetadata`, …).
- **Write path:** `createEmailWorkflowItemFromGmailMetadataAction` (`src/app/admin/gmail-review-actions.ts`) — **admin** + connected **`StaffGmailAccount`**; **re-fetch** message METADATA before insert; **`threadId`** must match client hidden fields; creates **`EmailWorkflowItem`** with **`metadataJson.gmailReviewSource`** (`bodyStored: false`, `createdByManualOperatorAction: true`).
- **Duplicate guard:** `findEmailWorkflowItemIdByGmailReviewMessageId` — JSON path **`gmailReviewSource.gmailMessageId`**; rows without that key are not matched.
- **Out of scope:** bodies, attachments, Gmail send, SendGrid, OpenAI, Pub/Sub-triggered queue rows, profile/audience automation.

---

### EMAIL-AI-INTELLIGENCE-1.0 (implemented — advisory queue analysis)

- **Server:** `src/lib/email-workflow/ai/{types,config,analyzer}.ts` — `runEmailWorkflowAiAnalysis({ itemId })` merges **`metadataJson.emailAiAnalysis`** (**v1** envelope: `promptVersion`, `inputSourceSummary`, `output` or `lastErrorSafe`); preserves **`gmailReviewSource`** / **`emailWorkflowInterpretation`**. **JSON** completion only; forces **`shouldSendAutomatically`** / **`canSendFromQueue`** **false**; **never** reads Gmail bodies through this path.
- **Action:** `runEmailWorkflowAiAnalysisAction` (`src/app/admin/email-ai-actions.ts`) — admin-only; revalidates queue list/detail + Command Center.
- **UI:** **`/admin/workbench/email-queue/[id]`** — **AI Email Intelligence** panel (readiness, run button, advisory copy, last result). Command Center — OpenAI integration column + **Queue items with AI analysis** count.
- **Missing key:** Persists safe **`lastErrorSafe`** and surfaces **not configured** in UI (**no** crash, **no** secret values).

---

### EMAIL-CONTACT-PROFILE-GRAPH-1.0 (implemented — staged profile facts + audience hints)

- **Schema:** `EmailContactProfile`, `EmailContactProfileFact`, `EmailContactProfileFactSuggestion`, `EmailAudienceHint`; `EmailWorkflowItem.emailContactProfileId`. **Migration:** `20260505203000_email_contact_profile_graph` — apply per environment (`npx prisma migrate deploy`). **`npm run check` does not imply migration applied.**
- **Library:** `src/lib/email-command-center/profile-graph.ts` — reads **stored** `metadataJson.emailAiAnalysis` only (no OpenAI, no Gmail API); creates **PENDING** suggestions/hints; **approve** creates **`EmailContactProfileFact`** (ACTIVE) with provenance JSON; **does not** auto-update `User` / `VolunteerProfile` / `CommsPlanAudienceSegment`.
- **Actions:** `src/app/admin/email-profile-graph-actions.ts` — generate + approve/reject; revalidates queue detail, Command Center, **`/admin/workbench/email-command-center/profiles`**.
- **UI:** Queue detail **Contact / Profile Intelligence**; cross-item review **`/admin/workbench/email-command-center/profiles`**; Command Center card — counts + link. **Audience hints** = audit/governance only — **not** SendGrid segments.
- **Out of scope:** mass email, auto-send, Gmail bodies, SendGrid sync, silent profile merges.

---

### EMAIL-AUDIENCE-STUDIO-1.0 (implemented — audience preview + draft definitions)

- **Schema:** `EmailAudienceDefinition` (DRAFT / ACTIVE / ARCHIVED), `EmailAudiencePreviewRun` (criteria + matchCount audit). **Migration:** `20260505220000_email_audience_studio_foundation`.
- **Library:** `src/lib/email-command-center/audience-studio.ts` — building blocks, `buildAudiencePreview`, suggested clusters, draft create + archive; **no** SendGrid, **no** Gmail, **no** people-table mutation.
- **Actions:** `src/app/admin/email-audience-actions.ts` — preview (optional preview-run row), create draft, archive; revalidates Command Center + Audience Studio route.
- **UI:** **`/admin/workbench/email-command-center/audiences`** — governance banner, blocks table, clusters, preview form, saved definitions; Command Center links + counts.
- **Out of scope:** SendGrid API, list sync, mass send, auto audience from AI without operator saves.

---

**Design references below** — original packet REDDIRT-EMAIL-OS-MASTERPLAN-1.0 narrative.

**Repo grounding:** `StaffGmailAccount` with **v2 sealed** `oauthJson` + **`gmailSyncState`** for monitor telemetry (**metadata sync**, **watch**, **Pub/Sub notification metadata**, **manual history preview**); **manual** Gmail **metadata review** → **`EmailWorkflowItem`** (provenance JSON); optional **`metadataJson.emailAiAnalysis`** (**EMAIL-AI-INTELLIGENCE-1.0**, advisory queue analysis — **OPENAI_API_KEY**); **EMAIL-CONTACT-PROFILE-GRAPH-1.0** stages **`EmailContactProfileFactSuggestion`** / **`EmailAudienceHint`** from stored AI output and **`EmailContactProfileFact`** on operator approve; **EMAIL-AUDIENCE-STUDIO-1.0** adds **`/audiences`** previews + **`EmailAudienceDefinition`** over **ACTIVE** facts; Command Center shows readiness + profile-graph + audience-studio counts; workbench composer may require **`GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH`** + reconnect for `gmail.send`.

---

## 1. Google OAuth / Gmail API

### 1.1 Recommended phases

| Phase | Goal | Typical scopes (conceptual) |
|-------|------|------------------------------|
| **P0** | Connection health, **read-only** message ingest for monitoring | `gmail.readonly` + baseline userinfo for identity binding |
| **P1** | Thread labels **read**, history sync, incremental sync | Same + sync cursors (`historyId`) |
| **P2** | **Modify** labels / archive (operator actions only) | Add `gmail.modify` under explicit policy |
| **P3** | Send as connected user (already a distinct **staff** path — reconcile with `StaffGmailAccount`) | `gmail.send` only on dedicated **human** actions |

**Doctrine:** **Read-only sync before modify/send** expansion. UI must not imply “monitoring” uses the same **authority** as broadcast.

### 1.2 Labels / thread sync

- Map Gmail `threadId` → `SyncedEmailThread`; messages → `SyncedEmailMessage`.  
- Optional: campaign-defined label set (“Kelly Ops / Needs triage”) for **pull** filters to reduce noise.  
- **Dual-write** caution: if `CommunicationThread` already exists for the same conversation, maintain **one** canonical link or explicit merge rules.

### 1.3 Pub/Sub watch plan (design)

- Gmail **push** via Google Pub/Sub reduces polling; requires **verified** domain/topic and service account setup (all **human-provisioned**).  
- Fallback: **bounded polling** with exponential backoff for small deployments.  
- **Watch renewal** job must run before expiry — surface **Integration health** in Settings.

### 1.4 Token storage and renewal

- Refresh tokens **encrypted at rest**; rotation on scope changes; immediate **REVOKED** status on Google revocation callbacks if enabled.  
- **Per-operator** connections: tie to `User` id; audit who connected.

### 1.5 Restricted scope caution

**Gmail restricted scopes** trigger Google’s verification / CASA processes. Treat **verification timeline** as a **program risk** and keep **minimal** scopes until counsel + technical owner sign off.

---

## 2. SendGrid

### 2.1 Contacts / lists / segments mapping

- **RedDirt DB** holds **policy** truth (membership reason, suppression, consent notes).  
- **SendGrid** holds **operational** list IDs for broadcast. Implement **sync jobs** with idempotency keys; **never** the inverse (Do not treat SendGrid as CRM of record).  
- `DynamicSegmentDefinition` refresh → **diff** → SendGrid contact updates / segment membership (rate-limited).

### 2.2 Domain authentication checklist (design)

- SPF, DKIM, DMARC alignment for campaign sending domains.  
- Link-branding if applicable.  
- **Document** owner, DNS operator, and **rollback** steps — **no** secret tokens in repo docs.

### 2.3 Sender identity checklist

- From-name / from-address policy; reply-to routing to monitored inbox where appropriate.  
- **Physical address** and **paid-for** compliance lines per finance/counsel (campaign-specific — reference Kelly compliance docs, not invented copy).

### 2.4 Single sends / templates / mail send

- **Broadcast:** existing Tier-2 / `CommunicationSend` patterns.  
- **Templates:** SendGrid template IDs stored as **opaque** IDs (env or DB); **version** labels in `EmailSendPlan` metadata.  
- **Transactional single-send** (if ever): separate template + suppression rules from **marketing**.

### 2.5 Event webhook ingestion

- HTTP endpoint with **signature verification** (SendGrid signed webhook).  
- Persist `SendGridWebhookEvent` → normalize → `EmailEngagementEvent` with **dedupe** on provider event id + recipient.  
- **Lag** and **ordering** — design for out-of-order events (late opens after clicks).

### 2.6 Suppression / unsubscribe handling

- Global suppression list synced **from** webhooks (bounce, spam complaint, unsubscribe).  
- **Pre-send** job: **fail closed** if **any** recipient on suppression; **partial send** only if product explicitly allows **skip** with logged exclusions (default: **do not** partial without human ack).

---

## 3. OpenAI API

### 3.1 Env-only key storage

- **`OPENAI_API_KEY`** server-side only; never `NEXT_PUBLIC_*`.  
- Optional: org/project scoping per OpenAI dashboard — **human-owned**.

### 3.2 Server-only calls

- All invocations from API routes, server actions, or background workers — **never** browser-exposed keys.  
- **Rate limit** per actor and per automation rule to prevent cost + abuse.

### 3.3 Structured extraction

- Prefer **JSON schema** / structured outputs for facts → `ContactProfileFactSuggestion`.  
- Store **prompt slug + model + token usage** (approx) in provenance — **no** secrets.

### 3.4 Summarization

- Thread + queue summaries align with existing **`comms/ai.ts`** and **E‑2** provenance patterns.  
- **Overwrite** rules: operator overrides win (E‑2B).

### 3.5 Drafting

- Drafts land in **`CampaignEmailDraft`** or draft equivalent — **not** directly in queue **`APPROVED`** fields as if sent.

### 3.6 Clustering / similarity

- Batch **embedding** jobs (optional) for “similar recipients” — **separate** packet; **no** hidden clusters driving send without UI review.

### 3.7 Risk flags

- Model outputs **escalation** / **toxicity** / **journalist** sensitivity hints — **never** auto-archive real press without human ack.

### 3.8 Prompt / version audit

- Checksum or version tag per template; **rollback** to previous prompt version in config (design).

### 3.9 Training assumption (policy reference only)

**Do not** assume vendor “no training” guarantees in code. Corporate policy may require **BAAs** / zero-retention settings where available — **legal** owns that contract layer; engineering documents **env** choices only.

---

## 4. RedDirt DB — source of truth and profile governance

### 4.1 Source of truth mapping

| Concern | Source of truth |
|---------|-----------------|
| Queue / triage state | `EmailWorkflowItem` (+ `metadataJson` provenance) |
| Plans / sends | `CommunicationPlan`, `CommunicationSend`, recipients |
| Staff Gmail OAuth row | `StaffGmailAccount` (today) — align with any new `CampaignEmailAccount` |
| People core | `User`, `VolunteerProfile`, `RelationalContact` |
| Engagement facts | `EmailEngagementEvent` (normalized), raw vendor in `SendGridWebhookEvent` |
| Suppression | `EmailSuppression` / existing preferences modules (`src/lib/comms/preferences.ts` patterns) — **consolidate** in implementation packet |

### 4.2 Profile update governance

- **Webhook-derived** facts (e.g., “clicked volunteer CTA”) may auto-update **low-sensitivity** counters.  
- **Demographic** or **relational** claims require **suggestion** + approval.  
- **Voter file** fields remain **`VoterRecord`** authority — email OS **links**, not duplicates.

### 4.3 Audit logs

- **`EmailAuditLog`** for security/compliance events.  
- Append-only **`metadataJson`** on workflow items for operator × interpretation history (already used in E‑2).

---

## 5. Implementation sequencing hint

1. **EMAIL-SENDGRID-FOUNDATION-1.0** — **shipped (v1):** `POST /api/sendgrid/events` + `SendGridEvent` / `SendGridSuppression` + operator `/sendgrid` readiness (**no** send, **no** auto sync). **Next:** contact sync packet + webhook dedupe beyond `sendgridEventId` when broadcast is priority.  
2. **EMAIL-GMAIL-CONNECT-1.0** read-only (if inbox monitoring is priority).  
3. **EMAIL-AI-INTELLIGENCE-1.0** — **partially shipped** as **advisory queue analysis** (`metadataJson.emailAiAnalysis`); deeper **grounded** context / eval harness remains future work.  
4. **EMAIL-CONTACT-PROFILE-GRAPH-1.0** — **shipped** as **staged** profile facts + audience hints from **stored** AI JSON; operator **approve** → **`EmailContactProfileFact`**; **no** SendGrid / no auto CRM merge in this packet.  
5. **EMAIL-AUDIENCE-STUDIO-1.0** — **shipped** as **preview + draft definitions** over approved profile graph; **no** SendGrid list sync; **SendGrid foundation** should still land before trusting broadcast paths.  

---

*Design only — REDDIRT-EMAIL-OS-MASTERPLAN-1.0.*
