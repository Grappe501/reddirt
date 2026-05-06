# Email dashboard operator runbook (REDDIRT-EMAIL-DASHBOARD-HARDENING-1.0)

**Scope:** `RedDirt` email triage (`/admin/workbench/email-queue`, `/admin/workbench/email-queue/[id]`) and **Gmail metadata review → queue** (`/admin/workbench/email-command-center/gmail/review`).  
**Doctrine:** queue-first, no auto-send, no auto-approval, no provider execution from `EmailWorkflowItem`.  
**Launch hardening:** [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) · [`email-command-center-first-run-operator-checklist.md`](./email-command-center-first-run-operator-checklist.md) · `npm run email:no-send-scan` (heuristic sanity scan).

## 0d) Daily Operator Console (`EMAIL-DAILY-OPERATOR-CONSOLE-1.0`)

1. Open **`/admin/workbench/email-command-center/daily`** at the start of a shift — **production** start page (not a demo): snapshot **today’s priorities**, **next best actions** (rule-based), and the five-part **operator work queue** with links into Gmail, queue, profiles, imports, Message Studio, send governance, analytics, automation, readiness, and map.  
2. When the database is unreachable, the page shows **DB unavailable — open Readiness** style guidance; counts may be zero — fix **`DATABASE_URL`** then refresh.  
3. **Local Message Studio** counts read **only** this browser’s **`localStorage`** — nothing is uploaded or sent. Use **Open Message Studio**, the **`#editorial-review-desk`** anchor for editorial review, or **`#send-packet-builder`** to assemble a **no-send** send packet before governance.  
4. **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** remains **false**; this route does not send mail or write the server database.

## 0) Message Studio — local drafts + Campaign Voice + Editorial Review + Production Templates + Send Packet Builder (`LOCAL-DRAFTS-1.1` + `CAMPAIGN-VOICE-1.2` + `EDITORIAL-REVIEW-DESK-1.0` + `PRODUCTION-TEMPLATES-1.0` + `EMAIL-SEND-PACKET-BUILDER-1.0`)

1. Open **`/admin/workbench/email-command-center/message-studio`** from the Command Center, queue detail, Audience Studio, or imports — optional query params: **`?source=emailWorkflowItem&id=…`**, **`?audienceDefinitionId=…`**, **`?importBatchId=…`** (chips only; **no** auto-fetch of bodies or private rows).  
2. **Draft workspace** saves to **browser `localStorage`** only (`reddirt:email-command-center:message-studio-drafts:v1`) — **not** shared with other staff or devices; clearing site data **deletes** drafts. Use **New / Duplicate / Delete**, **autosave**, **Copy** / **Export .json / .txt** as needed.  
3. **Content blocks** — **Insert into body** or **Copy block**; track **`contentBlocksUsed`** on the draft.  
4. Run **AI Email Intelligence** on **`/admin/workbench/email-queue/[id]`** when triaging; paste or summarize vetted context into Message Studio. Optional **Campaign Voice AI** uses **admin server actions** (not the browser SDK) when **`OPENAI_API_KEY`** is configured.  
5. **Campaign Voice (EMAIL-MESSAGE-STUDIO-CAMPAIGN-VOICE-1.2)** — right column on wide screens: select **tone / issue / audience / CTA frames**, **risk + approval tier**, **source-layer toggles** for what you have actually reviewed (mission docs, queue context, audience, imports, suppression). **Source material readiness** lists repo paths; semantic RAG over `SearchChunk` requires **`npm run ingest`** per `src/lib/openai/README.md` — do not assume indexed content until ingest has run.  
6. **Draft Quality Review** — self-checklist + advisory readiness label; not legal signoff.  
7. **AI Draft Assistant** — when server **`OPENAI_API_KEY`** is set, **Generate** / **Revision** tools call admin server actions; output is **advisory** — use **Use first suggestions + body** only after human review. If the key is missing, drafting stays fully manual.  
8. **Editorial Review Desk** — below the draft grid: set **review status** and **owner**, capture **review notes**, complete **claim/source**, **voice/audience**, and **compliance** checklists (no automated fact-check). Readiness tier is **advisory** — **not** legal compliance. When a **production template** was applied, the desk shows **last-applied** template **risk / approver track** and review notes — still **no** automated compliance. Use **Open Send Execution Governance** when ready for gate verification — still **no send**.  
9. **Production Templates** — bottom panel: pick **category** and **audience** filters; **preview** structure, **risk**, and **approval** posture; **apply** with **fill empty only**, **append body**, or **replace body** (requires explicit confirm if body already has text). Use **Copy template outline**, **Fill empty subject & preheader**, or **Append body skeleton only** when you want lighter touches. **Use this template with Campaign Voice AI** (when **`OPENAI_API_KEY`** is set) attaches template structure to the **next** **Generate campaign-voice draft** in the right column — then review advisory JSON before **Use first suggestions + body**. **No** demo templates, **no** fabricated claims in registry copy (placeholders only).  
10. **Send Packet Builder** (`EMAIL-SEND-PACKET-BUILDER-1.0`) — panel **`#send-packet-builder`** (between Editorial Review and Production Templates): review **packet summary**, **completeness** (derived from draft), **manual** suppression/consent + approval checklists, **operator notes**; **Copy** summary or subject+preheader+body; **Export** `.json` / `.txt`; **Save packet snapshot to draft** stores **`lastSendPacketJson`** in **`localStorage`** only. **Does not** call SendGrid, Gmail, or any send API; **`canSendFromPacket`** / **`canSendFromQueue`** stay **false** in the artifact.  
11. After review, open **`/admin/workbench/email-command-center/send-execution`** for send **gates** — this page still **cannot send**.  
12. **Never** treat this page as send authorization — **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** stays **false**; **server-side** shared draft review remains a **future** packet.

## 0c) Route map + Readiness + smoke test (`EMAIL-COMMAND-CENTER-FINAL-POLISH-1.0`)

1. **Route map** — **`/admin/workbench/email-command-center/map`** — every Email OS route on one page with upstream/downstream and safety.  
2. **Readiness checklist** — **`/admin/workbench/email-command-center/readiness`** — snapshot-driven **ready / partial / blocked / future** rows per subsystem (hosted Supabase stays operator-verified; send execution **future**).  
3. **Operator smoke test** — repo doc **[`email-command-center-operator-smoke-test.md`](./email-command-center-operator-smoke-test.md)** — ordered clicks through cockpit → map → readiness → Gmail → queue → … → verify **no send** CTAs on these routes.  

## 0d) Send Execution Governance shell (`EMAIL-SEND-EXECUTION-GOVERNANCE-SHELL-1.0`)

1. **Route** — **`/admin/workbench/email-command-center/send-execution`** — read-only doctrine: future Gmail vs SendGrid rails, **pre-send checklist** (includes **Send packet prepared** → Message Studio **`#send-packet-builder`**), **suppression gate** (including that **`SendGridSuppression` overrides audience membership**), **approval roles**, and a text **decision tree**.  
2. **Does not** call provider send APIs, **does not** change **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`**, **does not** persist send approvals — live execution remains **`EMAIL-SEND-EXECUTION-1.0`**.  
3. Cross-links from Message Studio, Analytics, SendGrid Foundation, Audience Studio, Automation Studio, Route map, and Readiness — still **no sends** on any of those routes.

## 0b) Automation Studio + Analytics & Deliverability (`EMAIL-AUTOMATION-ANALYTICS-SHELL-1.0`)

1. **Automation Studio** — **`/admin/workbench/email-command-center/automation`**. Read tiers (T0–T4), trigger library, action library, playbooks, and future gates. **Does not** register workers, **does not** turn on auto-send, **does not** change queue behavior.  
2. **Analytics & Deliverability** — **`/admin/workbench/email-command-center/analytics`**. One-page view of queue health, AI/profile/audience/import counts (when DB healthy), SendGrid env presence (names only in docs), events/suppressions ingested, suppression-type breakdown, and a **deliverability launch checklist** (mostly manual confirmations). **Does not** authorize sends.  
3. When the database is unreachable, both routes still load static governance copy; Analytics numeric panels may read as zero — fix **`DATABASE_URL`** then rerun **`npm run email:command-center:preflight`**.

## 0a) Contact list CSV import (staging)

Use **`/admin/workbench/email-command-center/imports`** only after **`npm run email:contact-import:gate`** (or equivalent **`migrate deploy` + preflight**) succeeds on the **same** database the app uses.

1. Upload CSV → open batch detail.  
2. **Validate** — fixes row statuses (invalid email, in-batch dupes, existing profile match, consent/source warnings).  
3. Review preview counts and row table.  
4. **Approve batch** — human gate; recorded in import decisions.  
5. **Commit approved batch** — writes **`EmailContactProfile`** + optional facts with **`CONTACT_IMPORT`** provenance; **does not** send mail, **does not** sync SendGrid, **does not** create audiences automatically.  
6. **Archive** when done for housekeeping.

**Must-not:** never treat import as marketing consent; never run commit without explicit approval; never use production PII in tests.

## 1) Daily triage flow

1. Open `/admin/workbench/email-queue`.
2. Start with the **Needs attention** section (`NEW`, `ENRICHED`, `IN_REVIEW`, `ESCALATED`).
3. Use filters to narrow by status, priority, source, escalation, spam, and assignment.
4. Open each item detail and confirm context before changing status.

## 2) When to run interpretation

- Run interpretation when summaries are thin, missing, or stale.
- Keep default behavior first (fill empty fields only).
- Use overwrite options only when an operator intentionally wants to refresh existing fields.
- Interpretation assists triage; it does not approve or send.

## 3) Assignment workflow

- Use **Assign to me** when taking ownership.
- Use **Mark unassigned** when handing back to queue.
- Keep assignment explicit on active items to avoid dropped work.

## 4) Status workflow (safe queue transitions)

Recommended path:

`NEW/ENRICHED -> IN_REVIEW -> READY_TO_RESPOND -> APPROVED`

Fallback paths:

- `IN_REVIEW -> ESCALATED` when higher-level attention is needed.
- `IN_REVIEW -> SPAM` for clear spam handling.
- `READY_TO_RESPOND/APPROVED -> NEW or IN_REVIEW` when more info is required.

Meaning of **APPROVED** in this dashboard:

- Approved for response drafting/review in queue governance.
- Not approved for provider execution.
- Not equivalent to sending.

## 5) Route to outbound execution

From an approved queue item, route work to the separately approved comms/send path:

- Use linked plan/thread/send references where available.
- Execute outbound only in approved comms/send workflows.
- Keep this queue as triage + governance context and audit trail.

## 6) Must-not rules

- Do not send email/SMS directly from `EmailWorkflowItem`.
- Do not treat queue approval as provider send authorization.
- Do not store secrets or real PII in test notes or smoke rows.
- Do not bypass human review with automation shortcuts.

## 7) Smoke-test notes (fake data only)

- Use fake addresses (`@example.com`) and non-sensitive placeholder text.
- Verify list filters, assignment actions, status actions, and detail governance copy.
- Confirm list and detail refresh after every action.

## 8) Gmail metadata review → queue item (EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4)

1. Open **`/admin/workbench/email-command-center/gmail/review`** (or from Command Center / Gmail monitor links).
2. Confirm DB/migration warnings on the page if shown; fix **`DATABASE_URL`** / **`migrate deploy`** in your environment when advised.
3. Scan **metadata-only** rows (From, Subject, Date, labels, header-derived flags) — **no bodies** on this surface.
4. For a message worth campaign triage, click **Create queue item** (manual only; server re-fetches METADATA before insert).
5. On the queue detail: run **deterministic interpretation** (E-2A) if summaries need filling; assign/review/approve per §4–§5.
6. Read the full message in **Gmail** (or a future governed body-ingest path) before any substantive reply. **Outbound** stays on approved comms/send rails — **not** from the queue item’s “approval” state alone.
7. If the UI redirects to an existing item (`gmail_review_duplicate`), treat it as a duplicate **`gmailMessageId`** for this bridge — do not expect a second row.

## 9) AI Email Intelligence (EMAIL-AI-INTELLIGENCE-1.0)

1. Open a queue item: **`/admin/workbench/email-queue/[id]`**.
2. Read **Readiness** on the **AI Email Intelligence** panel — if **not configured**, set **`OPENAI_API_KEY`** (server env; name only in docs/UI) before expecting model output.
3. Click **Run AI email analysis** when you want a fresh structured pass. Output is stored on the row under **`metadataJson.emailAiAnalysis`** (`output` JSON + envelope fields).
4. Treat every field — including **reply draft**, **profile fact suggestions**, and **audience hints** — as **advisory**. **Do not** treat AI as authority on facts. Verify before any outbound or profile merge.
5. **Nothing** in this panel sends mail, advances queue approval, or writes profiles/segments automatically. **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** remains **false**.
6. For Gmail-metadata-sourced rows: expect **metadata-only** context — **no** Gmail body was read by RedDirt for analysis; substantive reply still requires reading the thread in Gmail (or a future governed body path).

## 10) Contact / Profile Intelligence (EMAIL-CONTACT-PROFILE-GRAPH-1.0)

1. After **AI Email Intelligence** has produced `metadataJson.emailAiAnalysis`, open **Contact / Profile Intelligence** on the same queue item.
2. Click **Generate suggestions from AI analysis** to create **PENDING** rows (`EmailContactProfileFactSuggestion`, `EmailAudienceHint`) — skipped if no AI output yet.
3. **Approve** writes a governed **`EmailContactProfileFact`** (ACTIVE) with provenance — **not** an automatic `User`/`VolunteerProfile` field update in this packet.
4. **Audience hints**: approve/reject for **audit only** — they do **not** create SendGrid lists or `CommsPlanAudienceSegment` members.
5. Cross-item review: **`/admin/workbench/email-command-center/profiles`**.
6. **Migration** `20260505203000_email_contact_profile_graph` must be applied in each environment before tables exist (`npx prisma migrate deploy`).

## 11) Audience / Microtargeting Studio (EMAIL-AUDIENCE-STUDIO-1.0)

1. Open **`/admin/workbench/email-command-center/audiences`** after you have **ACTIVE** `EmailContactProfileFact` rows (approve suggestions on **`/profiles`** first when starting from AI).
2. Review **building blocks** (approved facts, pending suggestions shown separately, hint labels) — pending suggestions are **not** broadcast-eligible alone.
3. Use **Run preview** with simple filters (fact key/value, county, approved hint label, workflow `sourceType`, min confidence). Default universe requires **ACTIVE** facts.
4. **Save draft** writes `EmailAudienceDefinition` (DRAFT) — **no** SendGrid list sync, **no** sends, **no** CRM mutation.
5. **Archive** retires a definition row — still not a provider action.
6. **Migrations:** `20260505220000_email_audience_studio_foundation` (definitions + preview audit) in addition to profile graph migration when DB is ready.
7. **SendGrid readiness column** + link: **`/admin/workbench/email-command-center/sendgrid`** — posture labels only; **no** sync button.

## 12) SendGrid Foundation (EMAIL-SENDGRID-FOUNDATION-1.0)

1. Open **`/admin/workbench/email-command-center/sendgrid`** for env **names-only** readiness, webhook route copy, suppression summaries, and **local** export previews (select audience via `?preview=` link from the audience table).
2. Configure SendGrid **Event Webhook** in the SendGrid UI to **`POST`** signed batches to **`/api/sendgrid/events`** on the deployed origin (production **requires** webhook PEM env — see `.env.example` names only).
3. **Do not** expect sends from this surface — **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** stays **false**; broadcast execution remains future packets.
4. **Migration** `20260506120000_email_sendgrid_foundation` must be applied before tables exist (`npx prisma migrate deploy`).
