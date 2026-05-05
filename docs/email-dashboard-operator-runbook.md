# Email dashboard operator runbook (REDDIRT-EMAIL-DASHBOARD-HARDENING-1.0)

**Scope:** `RedDirt` email triage (`/admin/workbench/email-queue`, `/admin/workbench/email-queue/[id]`) and **Gmail metadata review → queue** (`/admin/workbench/email-command-center/gmail/review`).  
**Doctrine:** queue-first, no auto-send, no auto-approval, no provider execution from `EmailWorkflowItem`.

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
