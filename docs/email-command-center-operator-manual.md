# Email Command Center — Operator Manual (staff)

**Packet:** **EMAIL-COMMAND-CENTER-OPERATOR-MANUAL-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Audience:** Campaign staff who run the Email Command Center **daily** — not a demo walkthrough.  
**Posture:** **Operator-complete, execution-gated** — real triage, drafting, imports, and readiness work are supported; mass **email** send, Gmail send-from-queue, and automation **activation** remain governed and/or blocked per [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md).

**Companion docs (read in parallel when unsure):**

| Doc | Use |
|-----|-----|
| [`email-dashboard-operator-runbook.md`](./email-dashboard-operator-runbook.md) | Detailed procedural steps, CLI hints, edge cases. |
| [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md) | Every route: purpose, can/cannot, smoke, governance. |
| [`email-command-center-first-run-operator-checklist.md`](./email-command-center-first-run-operator-checklist.md) | First machine / env verification (21 steps). |
| [`email-command-center-operator-smoke-test.md`](./email-command-center-operator-smoke-test.md) | Ordered click-through QA (no send). |
| [`email-hosted-db-readiness-assistant-1-0.md`](./email-hosted-db-readiness-assistant-1-0.md) | Hosted Supabase / `DATABASE_URL` posture (no secrets in UI). |
| [`email-hosted-db-proof.md`](./email-hosted-db-proof.md) | Bearer **`GET /api/admin/production-readiness/hosted-db`** — read-only Prisma probe after Netlify deploy (no secrets in JSON). |
| [`email-command-center-contact-import-readiness.md`](./email-command-center-contact-import-readiness.md) | Import + DB gate doctrine. |
| [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md) | Honest shipped % by layer. |

**Doctrine (non-negotiable):** Queue status **APPROVED** is **workflow** posture — **not** permission to blast mail. **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** remains **`false`** until an explicit future packet changes it. **Never** paste secrets (tokens, URIs with passwords, webhook keys) into tickets, chat, or screenshots.

---

## 1. Daily workflow

**Primary surface:** `/admin/workbench/email-command-center/daily` — **Daily Operator Console**.

1. **Start of shift:** Open Daily first. Confirm the page loaded; if you see database-degraded copy, treat counts as unreliable until **Readiness** (`/admin/workbench/email-command-center/readiness`) and shell gates are green for **this** environment (see [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md)).  
2. **Priorities strip:** Work top cards first (queue attention, drafts needing review, sync failures, etc., as rendered for the day). Numbers come from **`getEmailCommandCenterSnapshot`** — they reflect **this** app’s Postgres when healthy.  
3. **Next best actions:** Follow the rule-based hints; they deep-link into the right sub-route (queue, Gmail, Message Studio anchors, SendGrid, Analytics, Automation, Readiness).  
4. **Work queue:** Use the five-part operator queue as your **navigation spine** — it is ordered for typical triage flow, not arbitrary tabs.  
5. **Message Studio local drafts:** The Daily strip may summarize **this browser’s** `localStorage` drafts only — not other staff machines. Shared draft counts are **server** counts when DB is healthy.  
6. **End of shift:** Leave queue items in honest statuses; hand off with notes on **`EmailWorkflowItem`** or shared draft review fields where your team expects continuity.

**Cross-links:** Cockpit `/admin/workbench/email-command-center` · Map `/admin/workbench/email-command-center/map` · Readiness `/admin/workbench/email-command-center/readiness` · Hosted DB assistant `/admin/workbench/email-command-center/readiness/hosted-db`.

---

## 2. Gmail review workflow

**Surfaces:** Monitor `/admin/workbench/email-command-center/gmail` · Review `/admin/workbench/email-command-center/gmail/review` · Connect `/admin/workbench/email-command-center/gmail/connect` (when OAuth incomplete).

1. **Monitor:** Confirm OAuth / actor / metadata sync posture before trusting review lists. Watch and Pub/Sub rows are **governance** — they do not auto-create queue items from notifications in this lane’s contract.  
2. **Review (metadata-only):** INBOX list is built from **metadata** reads — **no** full message bodies in the designed path. Skim sender, subject, snippet-class hints.  
3. **Create queue item:** Use the explicit **Create queue item** action when a thread should enter campaign triage. Provenance is stored so duplicates are detectable.  
4. **Never assume consent:** Inbox visibility ≠ voter consent to fundraising or blast mail.  
5. **Escalation:** If OAuth, watch renewal, or Pub/Sub verification is red, document in your shift log and pull comms/infra per [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) stop conditions.

---

## 3. Queue triage workflow

**Surfaces:** List `/admin/workbench/email-queue` · Detail `/admin/workbench/email-queue/[id]`.

1. **Order of attack:** Start with **Needs attention** — `NEW`, `ENRICHED`, `IN_REVIEW`, `ESCALATED` as your playbook defines.  
2. **Filters:** Narrow by status, priority, source, assignment, spam — reduce noise before opening items.  
3. **Item detail:** Read thread context, attachments policy, and any AI advisory panels **as hints only**. AI does not approve, merge CRM, or send.  
4. **Assignment:** Claim work explicitly; unassigned queues are a first-class failure mode.  
5. **Status transitions:** Move states only when the **definition** your team uses matches the UI label — do not use **APPROVED** as “send it.”  
6. **Handoff to Message Studio:** Use documented links or query params from queue / audiences / imports into Message Studio when copy work is needed; chips do **not** auto-fetch private bodies.

---

## 4. Contact import workflow

**Surfaces:** `/admin/workbench/email-command-center/imports` · batch detail `/admin/workbench/email-command-center/imports/[id]`.

1. **Gate before trust:** On the **target** database (local **or** hosted Kelly-Grappe-App), run the documented gate chain from [`email-command-center-contact-import-readiness.md`](./email-command-center-contact-import-readiness.md) — **`npm run email:contact-import:gate`** includes **`prisma migrate deploy`**; only run when `DATABASE_URL` is intentionally pointed at that target.  
2. **Upload:** CSV → new batch; keep filenames and operator notes traceable.  
3. **Validate:** Fix row-level outcomes (invalid email, dupes, profile matches, consent/source warnings). Re-validate until counts are honest.  
4. **Operator approve:** Human approval is recorded — this is a **legal/compliance** moment for your campaign, not a technical toggle.  
5. **Commit:** Writes **`EmailContactProfile`** and facts with **`CONTACT_IMPORT`** provenance. **Does not** send mail, **does not** sync SendGrid lists automatically.  
6. **Archive:** Close batches for housekeeping when no further work remains.

**Must-not:** Never treat “imported” as marketing consent; never commit on production-hosted DB until hosted verification is real, not “local green.”

---

## 5. Profile review workflow

**Surface:** `/admin/workbench/email-command-center/profiles`.

1. **Suggestions queue:** AI and other sources stage **`PENDING`** facts — they are **not** live voter record merges until approved.  
2. **Approve / reject:** Use explicit actions; note rationale when your team audits later.  
3. **Audience hints:** Hints are **not** SendGrid segments — they inform Audience Studio only after governance rules you adopt.  
4. **Downstream:** Approved **ACTIVE** facts unlock Audience Studio previews and definitions — plan profile work **before** audience expansion when starting cold.

---

## 6. Audience Studio workflow

**Surface:** `/admin/workbench/email-command-center/audiences`.

1. **Preconditions:** Prefer a healthy **profile graph** with **ACTIVE** facts before trusting previews.  
2. **Definitions:** Draft → active transitions should follow your campaign’s data minimization and purpose-limitation rules.  
3. **Previews:** Run previews to see counts and sample rows — they are **read** paths over governed data, not sends.  
4. **SendGrid:** Foundation rails may show readiness links; **list sync execution** is its own governed action on SendGrid routes — see §12.  
5. **Query chips:** Message Studio can accept `?audienceDefinitionId=` — use for coherent copy sessions.

---

## 7. Message Studio workflow

**Surface:** `/admin/workbench/email-command-center/message-studio` (optional query: `?source=emailWorkflowItem&id=…`, `?audienceDefinitionId=…`, `?importBatchId=…`).

1. **Local drafts (`localStorage`):** Scratch space per browser — **autosave**, duplicate, export. Clearing site data **deletes** local drafts.  
2. **Shared drafts (`#shared-drafts`):** Promote local JSON to **`MessageStudioDraft`** for cross-staff review. Updates and revisions are audited.  
3. **Review queue (`#review-queue`):** Grouped server workflow when DB healthy — filters and status transitions stay within shipped enums.  
4. **Production templates:** Apply with the **least destructive** mode first (fill empty / append); body replace requires explicit confirmation.  
5. **No send:** There is no “send campaign” button on this route — only planning, persistence, and review artifacts.

---

## 8. Campaign Voice workflow

**Surface:** Message Studio — Campaign Voice column / panels.

1. **Frames:** Select tone, issue, audience, CTA frames that match **verified** content — the registry is curated, not a claim factory.  
2. **Source layers:** Toggle only layers you have **actually** reviewed (mission docs, queue context, audience, imports, suppression awareness).  
3. **Source readiness (`#message-studio-source-readiness`):** Use the four-bucket panel to see what is static, missing, not indexed, or operator-paste — do not pretend RAG coverage exists without ingest.  
4. **AI paths:** When **`OPENAI_API_KEY`** is set, **Generate** / **Revise** are **server** actions — output is **advisory**. Merge suggestions manually; use **Use first suggestions + body** only after human review.  
5. **Thin context:** If the banner warns context is thin, treat AI output as **draft scaffolding** only.

---

## 9. Editorial review workflow

**Surface:** Message Studio — **`#editorial-review-desk`**.

1. **Ownership:** Set review status and owner so the next shift knows who carries the baton.  
2. **Checklists:** Complete claim/source, voice/audience, and compliance **reminder** items — these are discipline rails, **not** legal sign-off unless counsel says otherwise.  
3. **Readiness tier:** Advisory label only — “send-governance-ready” in UI still does **not** bypass Send Execution governance (`/admin/workbench/email-command-center/send-execution` — see [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md)).  
4. **Templates:** When a production template was applied, desk shows last risk / approval posture — re-read before publish-class handoff.  
5. **Handoff:** Use **Open Send Execution Governance** when the team is ready for **gate** discussion — still not a send button.

---

## 10. Send packet workflow

**Surface:** Message Studio — **`#send-packet-builder`** (Send Packet Builder).

1. **Purpose:** Build a **no-send** review packet (subject, preheader, body stack, governance flags, checklists).  
2. **Manual checklists:** Suppression and consent checkboxes require **human** attestation — the UI cannot know your legal posture.  
3. **Export:** Copy summary and export `.json` / `.txt` for counsel, partners, or platform upload **outside** this app if needed.  
4. **Snapshot:** Optional **`lastSendPacketJson`** on the **local** draft only — multi-device staff should agree where canonical artifacts live.  
5. **`canSendFromPacket` / `canSendFromQueue`:** Stay **false** in the artifact — truthful labeling.

---

## 11. Send execution workflow

**Surfaces:** Governance + ops `/admin/workbench/email-command-center/send-execution` · anchor **`#ops`** for operator console.

1. **Governance view:** Read doctrine — rails, pre-send checklist, suppression gate (**`SendGridSuppression` overrides audience membership**), approval roles, decision tree. **No provider APIs** from governance-only panels.  
2. **Ops console (`EMAIL-SEND-EXECUTION-1.0`):** Creates **`EmailSendExecution`**, runs **preflight**, supports **test** send to a single address, **final approval**, and **broadcast** only with explicit confirmations (**typed `SEND APPROVED`** where required). Hosted DB verification gates production-class actions per server actions.  
3. **Preflight failures:** Use Analytics / Send Execution surfaces to see **first-failed** checklist patterns — fix data, not the checklist text.  
4. **Overnight rule:** Do not run test or final sends when no responsible human is available to accept delivery consequences.  
5. **Queue:** No “send from queue item” shortcut — execution is **packet-based** off governed drafts + audiences + sync posture.

---

## 12. SendGrid sync workflow

**Surface:** `/admin/workbench/email-command-center/sendgrid` — **`#contact-sync`** and foundation strips.

1. **Foundation:** Events webhook path, suppression tables, env **names-only** posture — intake is **receive**, not broadcast.  
2. **Preview runs:** Build preview payloads for **ACTIVE** audiences; review excluded counts and warnings before any **APPROVED** state.  
3. **Approve / execute (1.2):** Marketing Contacts **upsert** is **contact records only** — not an email send. Production execution requires hosted DB gate + **`SENDGRID_API_KEY`** per action guards.  
4. **FAILED runs:** Read sanitized errors; fix source data; re-preview — do not “click until it works” without understanding.  
5. **Reconciliation:** Analytics and SendGrid surfaces may offer **DB-only** reconciliation helpers for events — still **no** ESP send from those tools.

---

## 13. Analytics workflow

**Surface:** `/admin/workbench/email-command-center/analytics`.

1. **One-page posture:** Scan queue, AI, imports, SendGrid signals, suppression mix, sync and send-execution **counts** when DB healthy.  
2. **Readiness scores:** Heuristic chips — use as **triage temperature**, not KPI promises.  
3. **Drilldowns:** Bounded tables link back to owning routes (queue items, drafts, send execution, sync, suppression, automation policies, Gmail watch).  
4. **Reconciliation form:** Optional operator-triggered match of **`SendGridEvent`** rows to recipients — understand each batch before submit.  
5. **Preflight rollup:** See failed preflight **check id** frequencies — prioritize data fixes that move the most sends from blocked to healthy.

---

## 14. Automation policy workflow

**Surface:** `/admin/workbench/email-command-center/automation` — policy table + **`#automation-policy-details`** explainers.

1. **Read-only eval:** Policies reflect **snapshot** counts — there is **no** background worker in this packet.  
2. **Detail accordions:** For each policy id, read what it watches, recommends, never does, data source, and **route to act**.  
3. **Revalidate snapshot:** Button is **read-only server revalidate** — it does not enqueue jobs or mutate contacts/audiences.  
4. **Daily strip:** Top non-OK policies surface on Daily with deep-links to `#policy-detail-…` — treat as **daily hygiene**, not paging.  
5. **Future:** **EMAIL-AUTOMATION-STUDIO-1.1** (explicit packet) — activation, digests, scheduled eval — **not** implied here.

---

## 15. What never to do

- **Never** send mass mail from queue approval states, Message Studio, Analytics, or Automation surfaces.  
- **Never** enable automation workers or cron from Automation Studio in this lane — not shipped as safe actions.  
- **Never** paste secrets into Linear, Slack, SMS, or screenshots — rotate if exposed.  
- **Never** treat CSV import commit as consent or as SendGrid list sync.  
- **Never** use production voter PII in **test** batches or demo screenshots.  
- **Never** bypass hosted DB verification for **production** Marketing upsert or final-class sends when the server enforces those gates.  
- **Never** fabricate opponent or third-party claims — templates and AI are **advisory** scaffolding only.  
- **Never** claim legal compliance from Editorial Review Desk checklists without counsel.

---

## 16. Troubleshooting

| Symptom | Likely cause | First steps |
|--------|----------------|------------|
| Daily / cockpit counts all zero or “DB unavailable” | `DATABASE_URL` unreachable from app host | Readiness + [`email:db:diagnose`](./email-dashboard-operator-runbook.md); fix connectivity; refresh. |
| Readiness shows migration partial | ECC migrations not applied on **this** DB | Operator runs **`npx prisma migrate deploy`** from `RedDirt/` against intentional target, then **`npm run email:command-center:preflight`**. |
| Gmail OAuth “env incomplete” | Missing OAuth env vars or actor | [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md) Gmail rows; fix env with infra — **no** secrets in tickets. |
| Shared drafts panel empty | Migration not applied or DB down | Confirm **`20260508120000_message_studio_server_drafts`** on target DB. |
| Send execution preflight always fails same check | Data / consent / suppression / ASM posture | Use Analytics **`#send-execution-preflight`** + execution detail rows; fix underlying rows. |
| Contact sync FAILED | Payload / API / consent classification | Read **`safeError`** / result JSON on run; fix audience or rerun preview. |
| `email:no-send-scan` WARN | Known integration baselines outside ECC | Read script output — new WARN **under** `email-command-center` paths needs engineering. |
| `email:ai:eval` fails or looks stale | Fixtures changed without regen, or optional OpenAI mode mis-invoked | Default: **`npm run email:ai:eval`** (**static-only**). For adjudication, run script **without** `--static-only` only with **`OPENAI_API_KEY`** and owner approval — see [`email-ai-intelligence-upgrade-closeout.md`](./email-ai-intelligence-upgrade-closeout.md). |
| “Hosted not verified” everywhere | Still on loopback or wrong Supabase project | [`email-hosted-db-readiness-assistant-1-0.md`](./email-hosted-db-readiness-assistant-1-0.md) + Supabase dashboard Reference ID check. |

---

## 17. Role responsibilities

| Role | Owns |
|------|------|
| **Shift operator (comms)** | Daily start, queue triage, Gmail review creates, import validate/approve, profile suggestions triage, Message Studio drafting, editorial checklists, send packet export, honest statuses. |
| **Comms lead** | Priority order across channels, escalation to counsel/manager, approval of **commit**-class imports and **final**-class sends when org policy says so. |
| **Steve / infra** | Hosted `DATABASE_URL` / `DIRECT_URL`, OAuth credentials, SendGrid account health, Netlify env, rotation after leaks, **migrate deploy** on production when steered. |
| **Engineering (RedDirt lane)** | Regressions, schema migrations in named packets, `npm run check` green, **no-send** scan posture — **not** day-to-day triage unless on-call. |
| **Counsel / compliance (when engaged)** | Consent language, fundraising disclaimers, retention, third-party claims — Editorial Review Desk does **not** replace counsel. |

---

*Last updated: **EMAIL-AI-INTELLIGENCE-UPGRADE-CLOSEOUT-1.0** — cross-link **[`email-ai-intelligence-upgrade-closeout.md`](./email-ai-intelligence-upgrade-closeout.md)** (AI can/cannot + **`npm run email:ai:eval`**); staff manual base **EMAIL-COMMAND-CENTER-OPERATOR-MANUAL-1.0**; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** still **false**.*
