# Email Command Center — Launch Hardening

**Packet:** **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0** · **KELLY-GRAPPE-APP-DB-GATE-1.0** · **KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0** (hosted Kelly-Grappe-App verification)  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Purpose:** Lock **operator-complete, execution-gated** posture: route health, **safe-now vs blocked**, **no-send** doctrine, first-run + staging discipline, heuristic scan. **Not** a security audit.

**Companion:** **[`email-command-center-operator-manual.md`](./email-command-center-operator-manual.md)** (staff daily manual) · **[`email-command-center-morning-upgrade-closeout.md`](./email-command-center-morning-upgrade-closeout.md)** (morning verify log after stacked upgrades) · [`email-ai-intelligence-upgrade-closeout.md`](./email-ai-intelligence-upgrade-closeout.md) (AI stack closeout — can/cannot, approvals, **`npm run email:ai:eval`**) · [`email-command-center-first-run-operator-checklist.md`](./email-command-center-first-run-operator-checklist.md) · [`email-command-center-selective-staging-guide.md`](./email-command-center-selective-staging-guide.md) · [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md) · [`email-command-center-production-qa-closeout.md`](./email-command-center-production-qa-closeout.md)

**Cross-cut — Prisma / production DB readiness (no migrate on prod):** [`production-db-test-readiness.md`](./production-db-test-readiness.md) · **REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0** — [`post-migration-history-netlify-retry-packet.md`](./post-migration-history-netlify-retry-packet.md) · [`data/post-migration-history-netlify-retry-packet.json`](../data/post-migration-history-netlify-retry-packet.json) · `node scripts/build-post-migration-history-netlify-retry-packet.mjs` · `node scripts/validate-post-migration-history-netlify-retry-packet.mjs` · `node scripts/run-hosted-db-proof-readiness.mjs` — **readiness only** for first operator Netlify retry after migration-history alignment (**no** Netlify trigger, **no** live send). · **REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0** — **The raw Prisma diff is not safe to execute.** [`docs/unsafe-production-schema-diff-analysis.md`](./unsafe-production-schema-diff-analysis.md) · [`data/unsafe-production-schema-diff-analysis.json`](../data/unsafe-production-schema-diff-analysis.json) · [`docs/additive-schema-install-plan.md`](./additive-schema-install-plan.md) · [`data/additive-schema-install-plan.json`](../data/additive-schema-install-plan.json) · [`data/sql/additive-schema-install-candidate.sql`](../data/sql/additive-schema-install-candidate.sql) · [`data/sql/additive-schema-install-rejected-statements.sql`](../data/sql/additive-schema-install-rejected-statements.sql) · [`data/additive-schema-install-validation.json`](../data/additive-schema-install-validation.json) · [`docs/additive-schema-clone-test-plan.md`](./additive-schema-clone-test-plan.md) · [`data/additive-schema-clone-test-result.json`](../data/additive-schema-clone-test-result.json) · [`docs/additive-schema-production-execution-review.md`](./additive-schema-production-execution-review.md) · [`data/additive-schema-production-execution-review.json`](../data/additive-schema-production-execution-review.json) · [`develop_notes/REDDIRT_PRODUCTION_ADDITIVE_SCHEMA_INSTALL_PLAN_1_0_REPORT.md`](../develop_notes/REDDIRT_PRODUCTION_ADDITIVE_SCHEMA_INSTALL_PLAN_1_0_REPORT.md) · [`develop_notes/REDDIRT_ADDITIVE_SCHEMA_CLONE_PROOF_HARDENING_1_0_REPORT.md`](../develop_notes/REDDIRT_ADDITIVE_SCHEMA_CLONE_PROOF_HARDENING_1_0_REPORT.md) (**production-like hardened clone proof required** before production apply of curated additive SQL). · [`prisma-schema-map-patch-plan.md`](./prisma-schema-map-patch-plan.md) · [`production-db-shadow-proof-plan.md`](./production-db-shadow-proof-plan.md) · [`production-baseline-execution-packet-draft.md`](./production-baseline-execution-packet-draft.md) (**REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-AND-SHADOW-PROOF-1.0**) · **REDDIRT-PRODUCTION-BASELINE-EXECUTION-REVIEW-1.0** — [`production-baseline-execution-review.md`](./production-baseline-execution-review.md) · [`data/production-baseline-execution-review.json`](../data/production-baseline-execution-review.json) · [`data/production-baseline-execution-review-validation.json`](../data/production-baseline-execution-review-validation.json) · [`production-baseline-command-checklist.md`](./production-baseline-command-checklist.md) · [`data/production-baseline-command-checklist.json`](../data/production-baseline-command-checklist.json) · [`netlify-production-retry-readiness.md`](./netlify-production-retry-readiness.md) · [`data/netlify-production-retry-readiness.json`](../data/netlify-production-retry-readiness.json) · [`develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_REVIEW_1_0_REPORT.md`](../develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_REVIEW_1_0_REPORT.md) · `node scripts/review-production-baseline-execution.mjs` · `node scripts/validate-production-baseline-execution-review.mjs` (**offline**; **no** production approval). **REDDIRT-SHADOW-PROOF-ARTIFACT-CONSOLIDATION-1.0** — [`shadow-db-migration-proof.md`](./shadow-db-migration-proof.md) · [`migration-dependency-repair.md`](./migration-dependency-repair.md) · [`data/shadow-db-migration-proof.json`](../data/shadow-db-migration-proof.json) · [`develop_notes/REDDIRT_SHADOW_PROOF_ARTIFACT_CONSOLIDATION_1_0_REPORT.md`](../develop_notes/REDDIRT_SHADOW_PROOF_ARTIFACT_CONSOLIDATION_1_0_REPORT.md). **REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0** — [`production-baseline-execution-packet.md`](./production-baseline-execution-packet.md) · [`data/production-baseline-execution-packet.json`](../data/production-baseline-execution-packet.json) · [`data/production-baseline-execution-packet-validation.json`](../data/production-baseline-execution-packet-validation.json) · [`production-baseline-approval-gates.md`](./production-baseline-approval-gates.md) · [`data/production-baseline-approval-gates.json`](../data/production-baseline-approval-gates.json) · [`production-baseline-execution-runbook.md`](./production-baseline-execution-runbook.md) · [`post-baseline-netlify-test-plan.md`](./post-baseline-netlify-test-plan.md) · [`data/post-baseline-netlify-test-plan.json`](../data/post-baseline-netlify-test-plan.json) · [`hosted-db-proof-after-baseline.md`](./hosted-db-proof-after-baseline.md) · [`data/production-baseline-execution-preflight.json`](../data/production-baseline-execution-preflight.json) · [`develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT.md`](../develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT.md) (**prepared** — **no** production execution from repo; **`node scripts/run-production-baseline-execution-guarded.mjs --dry-run`** only from automation).

---

## Current status

| Statement | Meaning |
|-----------|---------|
| **Operator-complete** | All **shipped** Email Command Center surfaces (cockpit, Daily, map, readiness, Gmail monitor/review, queue, profiles, audiences, imports, SendGrid foundation, Message Studio, Automation shell, Analytics shell, send execution governance) are **usable for real daily triage and drafting** — no demo mode. |
| **Execution-gated** | **No** Command Center mass **email** send, **no** Gmail send-from-queue, **no** SendGrid broadcast **send**, **no** automation activation from these routes. **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** stays **`false`**. **EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2** allows **Marketing Contacts** upsert (contact records only) for **APPROVED** sync runs — **not** a marketing **send**; FAILED runs store **sanitized** **`safeError`** in **`resultJson`** ( **`emailSendPerformed`: false** ). Provider **email** execution = **EMAIL-SEND-EXECUTION-1.0** (and related packets). |

---

## What is safe to use now

- **Operator manual:** **[`email-command-center-operator-manual.md`](./email-command-center-operator-manual.md)** — canonical **staff** workflows (not a demo); read with this hardening doc for **safe-now vs blocked** truth.  
- **Navigation + doctrine:** Cockpit, **Daily** (`/daily`), **map**, **readiness**, **send-execution** — always safe to open; DB may change **counts** only.  
- **Hosted DB read-only proof (HTTP):** **`GET /api/admin/production-readiness/hosted-db`** with **`Authorization: Bearer`** using server **`EMAIL_DIAGNOSTICS_TOKEN`** (fallback **`ADMIN_DIAGNOSTIC_TOKEN`** if primary unset) — returns **`env`** with **`supabaseProjectRefConfirmed`** / **`parseHint`** (no URI values), read-only **`SELECT 1`**, optional **`User`** probe **`ok`** flags, and **`productionSchemaContract`** (canonical ref **`giozeoqulfojhxpywjil`**, legacy + new public tables, **`auth.users`**, **`_prisma_migrations`** count **71**); **`proof.productionCanonical`** is **`true`** when that contract passes (**REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0** + **REDDIRT-HOSTED-DB-PROOF-CANONICAL-FLAG-1.0**). Operator procedure: [`email-hosted-db-proof.md`](./email-hosted-db-proof.md); optional redacted paste into **`develop_notes/REDDIRT_EMAIL_HOSTED_DB_PROOF_1_0_REPORT.md`** for ticket hygiene.  
- **Communication Command Center hosted diagnostics (HTTP):** **`GET /api/admin/communication-command-center/readiness`** — **same bearer** as hosted DB proof; JSON **`mode`:** **`communication_command_center_readiness`** — DB **`reachable`** + **`productionCanonical`**, eight comms/public tables, webhook **route** file contract, explicit **`safety`** no-send flags (**REDDIRT-COMMUNICATION-COMMAND-CENTER-HOSTED-DIAGNOSTICS-1.0**). Dashboard: **`/admin/workbench/communication-command-center/readiness`**. Doc: [`communication-command-center-readiness.md`](./communication-command-center-readiness.md). **No** live send, Gmail send, SendGrid send, Twilio SMS, imports, or workers enabled by this slice.  
- **Gmail + Calendar OAuth proof (HTTP):** **`GET /api/admin/communication-command-center/gmail-calendar-readiness`** — **same bearer**; JSON **`gmail_calendar_oauth_readiness`** — OAuth/Pub/Sub + Calendar route presence, **send detected vs locked** (static); admin **`/admin/workbench/communication-command-center/gmail-calendar`**; Email Command Center **Readiness** card; doc [`gmail-calendar-oauth-proof.md`](./gmail-calendar-oauth-proof.md) (**REDDIRT-GMAIL-CALENDAR-OAUTH-PROOF-1.0**). **No** Google API calls from this readiness route, **no** live send. **Rotate `ADMIN_DIAGNOSTIC_TOKEN` in Netlify if it was ever pasted into chat**, then redeploy.
- **Gmail + Calendar operator hosted proof (HTTP + UI):** **`GET /api/admin/communication-command-center/gmail-calendar-operator-proof`** — **same bearer**; JSON gates on CCC + Gmail/Calendar + email sandbox readiness all **`ok`**; admin **`/admin/workbench/communication-command-center/gmail-calendar/operator-proof`**; doc [`gmail-calendar-operator-proof.md`](./gmail-calendar-operator-proof.md) (**REDDIRT-GMAIL-CALENDAR-OAUTH-OPERATOR-HOSTED-PROOF-1.0**). **Does not** authorize email send, SendGrid delivery, Twilio SMS, list sends, contact import, automation workers, or calendar event writes — connection and read-first proof only.  
- **Email sandbox send proof readiness (HTTP):** **`GET /api/admin/communication-command-center/email-sandbox-readiness`** — **same bearer**; JSON **`email_sandbox_send_readiness`** — requires **green** Gmail/Calendar **contract** file plus live hosted + comms readiness; **internal test-only** posture in copy; **does not** authorize live email, list sends, Gmail send, or SendGrid broadcast (**REDDIRT-EMAIL-SANDBOX-SEND-PROOF-1.0**). Doc [`email-sandbox-send-proof.md`](./email-sandbox-send-proof.md). Validator stops with **blocked** artifact if Gmail/Calendar proof is missing or failed.  
- **Queue:** List + item detail for triage, AI advisory, profile panels — **no** send from item.  
- **Gmail:** Monitor + **metadata** review → **manual** queue create — safe when OAuth configured; still **no** body store / **no** auto-queue from Pub/Sub in this lane’s contract.  
- **Profiles / audiences / imports:** Governed review, previews, **staging** CSV path — safe for UI; **commit** to profiles still requires **correct** hosted DB + operator gate (see blocked).  
- **SendGrid foundation:** Readiness + **receive** path docs + **`#contact-sync`** governed **contact** upsert (**no** “send campaign”, **no** email send from this path).  
- **Message Studio:** **localStorage** drafts + **shared** Postgres drafts (**`#shared-drafts`**, **EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0**), Campaign Voice, editorial, templates, **Send packet** (`#send-packet-builder`) — copy/export + persistence/review only (**no** send).  
- **Automation / Analytics:** **Shell** read-only governance / aggregates — **no** worker activation; **EMAIL-AUTOMATION-POLICY-ACTIVATION-1.0** adds **policy evaluations** (read-only snapshot + **Evaluate policies now** = revalidate only).

---

## What remains blocked (until named packets + ops)

1. **Hosted Kelly-Grappe-App / Supabase canonical DB verification** — wrong `DATABASE_URL` ⇒ wrong suppressions, audiences, imports. Operator-run **`npm run email:db:diagnose`** + **`npm run email:contact-import:gate`** on the **target** env (see [`email-command-center-contact-import-readiness.md`](./email-command-center-contact-import-readiness.md)). Before any **Prisma** baseline / **`migrate resolve`** / **`db push`** on shared voter/campaign data, run **`node scripts/audit-production-db-baseline.mjs`** and read [`production-db-baseline-audit.md`](./production-db-baseline-audit.md) (read-only metadata audit; **no** writes). Then run **`node scripts/plan-production-db-baseline.mjs`** and read [`production-db-baseline-plan.md`](./production-db-baseline-plan.md) (offline migration footprint plan; **no** DB, **no** executable SQL). For **Prisma vs legacy public naming** drift, run **`node scripts/reconcile-production-db-schema.mjs`** and read [`production-db-schema-reconciliation.md`](./production-db-schema-reconciliation.md) (**no** DB). For **model ↔ table ownership and `@@map` planning** (still offline), run **`node scripts/align-prisma-schema-map.mjs`** and read [`prisma-schema-map-alignment.md`](./prisma-schema-map-alignment.md), machine-readable [`data/prisma-schema-map-alignment.json`](../data/prisma-schema-map-alignment.json), and slice report [`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md`](../develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md) (**no** DB, **no** `schema.prisma` edits in that slice).  
2. **SendGrid Marketing email sends without full doctrine** — **blocked**; governed path is **`/send-execution#ops`** (**EMAIL-SEND-EXECUTION-1.0**) with final gates — **operator-proven** test/broadcast on hosted stack still **Steve-owned**. **Note:** **EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2** ships **governed contact upsert** (PUT Marketing Contacts) for **APPROVED** runs — **not** an email send; production upsert requires **hosted** DB gate per action.  
3. **Shared Message Studio drafts** — Postgres **`MessageStudioDraft`** when DB healthy (**no** send). **Send packet** snapshot JSON remains on the **local** draft until copied into shared row via promote/update.  
4. **Operator-proven live mail** — code paths may exist; **proof** of successful hosted test/broadcast is **not** automatic.  
5. **Production automation worker activation** — **EMAIL-AUTOMATION-STUDIO-1.1** (future).

---

## Local Docker DB vs hosted Kelly-Grappe / Supabase

| Environment | Role | Operator note |
|-------------|------|-----------------|
| **Local Docker Postgres** (`npm run dev:db` / stack scripts) | Dev + **local** migrate/check | Fine for **feature** dev; **not** proof of hosted readiness. Preflight may show migration parity vs ECC set. |
| **Hosted Kelly-Grappe / Supabase (canonical)** | **Production** campaign DB | **Must** be verified separately — URL, pooler username (`postgres.<project>` for Supavisor), **`DIRECT_URL`** if split. **Do not** assume local gate = hosted gate. |
| **Netlify build** | CI build host | **`DATABASE_URL`** must be **cloud** Postgres (see `scripts/netlify-build.sh` — **blocks** localhost). |

**Stop condition:** If hosted verification is **not** done, treat **imports commit**, **suppression-dependent sends** (future), and **broadcast** as **blocked** even when local UI works.

### Kelly-Grappe-App hosted DB gate (`KELLY-GRAPPE-APP-DB-GATE-1.0` + `KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0`)

- **Kelly-Grappe-App** is the **canonical hosted Supabase** Postgres project name for Kelly SOS / RedDirt (confirm in Supabase dashboard with Steve). The **default database name** is often still **`postgres`**; proof is **connection + migrations + gate** on the **Prisma** URLs, not the display name alone.  
- **Local Docker** passing diagnose / preflight / import gate **does not** equal **Kelly-Grappe-App** verified — `DATABASE_URL` must resolve to a **hosted** Supabase host pattern (`*.supabase.co`, pooler, etc.) for that claim.  
- **`KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0` (historical automated pass, older shell):** `npm run email:db:diagnose` showed **`DATABASE_URL` / `DIRECT_URL` on loopback** with **Prisma unreachable** / local engine down — **hosted Kelly-Grappe-App gate not passed** in that run.  
- **`EMAIL-COMMAND-CENTER-PRODUCTION-QA-CLOSEOUT-1.0` (2026-05-06 QA pass):** `npm run email:db:diagnose` on a **healthy local Docker** target (`127.0.0.1:5433`) returned **TCP + Prisma ok**, **`prisma migrate status` clean**, and **all ECC `_prisma_migrations` rows applied** — this **still** confirms **local** only, **not** Kelly-Grappe-App hosted URLs. **Hosted canonical DB production readiness is not claimed** until `DATABASE_URL` / `DIRECT_URL` point at the hosted project and the full operator chain succeeds.  
- When the hosted gate **does** pass: real data may use the **staged import commit** workflow on that DB (DB/migration standpoint only) — **sends remain blocked**; run **`migrate deploy`** on that DB so **`20260508120000_message_studio_server_drafts`** exists before relying on shared drafts in production; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged until a future execution packet explicitly changes it.

---

## No-send doctrine (summary)

- Queue status **APPROVED** ≠ provider send approval.  
- **No** `messages.send` / mass ESP execution from Email Command Center UI in this slice.  
- **No** automation **activation** from Automation Studio (shell only).  
- **Send Execution Governance** is **doctrine only** — not a send console.  
- **Send Packet** is a **review artifact** (export/copy) — not a campaign or Gmail action.

---

## `localStorage` draft and send-packet limitations

- Key: **`reddirt:email-command-center:message-studio-drafts:v1`** (browser only).  
- **Not** shared across staff or devices; clearing site data **deletes** drafts.  
- **Send packet** optional snapshot fields **`lastSendPacketJson`** / **`lastSendPacketGeneratedAt`** live on the same draft JSON — still **no server** persistence.

---

## Routes to smoke (order)

1. `/admin/workbench/email-command-center/daily`  
2. `/admin/workbench/email-command-center`  
3. `/admin/workbench/email-command-center/readiness`  
4. `/admin/workbench/email-command-center/map`  
5. `/admin/workbench/email-command-center/gmail`  
6. `/admin/workbench/email-command-center/gmail/review`  
7. `/admin/workbench/email-queue`  
8. `/admin/workbench/email-queue/[id]` (any open item)  
9. `/admin/workbench/email-command-center/profiles`  
10. `/admin/workbench/email-command-center/audiences`  
11. `/admin/workbench/email-command-center/imports`  
12. `/admin/workbench/email-command-center/sendgrid`  
13. `/admin/workbench/email-command-center/message-studio` (+ anchors `#shared-drafts`, `#editorial-review-desk`, `#send-packet-builder`)  
14. `/admin/workbench/email-command-center/send-execution`  
15. `/admin/workbench/email-command-center/automation`  
16. `/admin/workbench/email-command-center/analytics`

---

## Commands to run (repo)

```bash
cd H:\SOSWebsite\RedDirt
npm run email:db:diagnose
npm run typecheck
npm run check
npm run email:no-send-scan
npm run email:ai:eval
```

`npm run email:ai:eval` defaults to **static-only** synthetic fixtures (**no** OpenAI, **no** sends) — see [`email-ai-intelligence-upgrade-closeout.md`](./email-ai-intelligence-upgrade-closeout.md).

Optional (operator machine, **not** required for doc-only hardening): `npm run email:db:diagnose`, `npm run email:contact-import:gate` — per runbook; **do not** run `migrate deploy` as part of this packet unless steered for env repair.

---

## Stop conditions (do not ship / do not “declare green”)

- **Secrets** in diff, chat, or CI logs — stop; rotate if exposed.  
- **`.env` / `.env.backup*`** staged — stop; use selective staging guide.  
- **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** not **`false`** in `governance.ts` — stop (**`email:no-send-scan`** should FAIL).  
- **New** `sgMail.send` / `sendgrid.send` / Gmail send API usage under **`email-command-center`** UI/libs — stop and review (**scan** should FAIL on ECC paths).  
- **Hosted DB** for production imports **not** verified — treat import **commit** as **blocked** even if UI allows click.

---

## Route health inventory (full table)

Paths use site root prefix **`/admin/workbench/…`**.

| Route | Purpose | Current state | Safe to use now? | Blocked / degraded when | No-send | Smoke expectation |
|-------|---------|---------------|------------------|---------------------------|---------|---------------------|
| `…/email-command-center/daily` | Daily Operator Console | **Live** | **Yes** | DB unreachable → degraded counts | **Yes** | Badges + next-actions |
| `…/email-command-center` | Cockpit | **Live** | **Yes** | Snapshot `operatorGate` | **Yes** | Operator-complete copy |
| `…/email-command-center/map` | Route map | **Live** | **Yes** | — | **Yes** | Cards + links |
| `…/email-command-center/readiness` | Checklist | **Live** / **Partial** | **Yes** | DB/keys missing | **Yes** | Rows render |
| `…/email-command-center/gmail` | Gmail monitor | **Partial** | **Yes** (nav) | No OAuth | **Yes** | No send actions |
| `…/email-command-center/gmail/connect` | OAuth shim | **Partial** | **Yes** when used | No OAuth config | **Yes** | Redirect works |
| `…/email-command-center/gmail/review` | Metadata → queue | **Partial** | **Yes** when linked | No sync | **Yes** | Manual create only |
| `…/email-queue` | Queue list | **Live** | **Yes** | DB down | **Yes** | List / empty state |
| `…/email-queue/[id]` | Item detail | **Live** / **Partial** | **Yes** | DB down | **Yes** | No dispatch |
| `…/email-command-center/profiles` | Profile review | **Live** / **Partial** | **Yes** | DB down | **Yes** | Suggestions when present |
| `…/email-command-center/audiences` | Audience studio | **Live** / **Partial** | **Yes** | DB down | **Yes** | No SendGrid sync |
| `…/email-command-center/imports` | Import list | **Live** / **Partial** | **Yes** (UI) | Hosted DB not verified for prod commit | **Yes** | Staging copy |
| `…/email-command-center/imports/[id]` | Batch detail | **Live** / **Partial** | **Yes** when DB OK | Wrong DB | **Yes** | Explicit commit path |
| `…/email-command-center/sendgrid` | Foundation | **Partial** | **Yes** | DB/env | **Yes** | No broadcast |
| `…/email-command-center/message-studio` | Message Studio | **Live** | **Yes** | OpenAI optional | **Yes** | Anchors **`#shared-drafts`**, **`#editorial-review-desk`**, **`#send-packet-builder`** |
| `…/email-command-center/automation` | Automation shell + policy eval | **Live** | **Yes** | — | **Yes** | No worker activation |
| `…/email-command-center/analytics` | Analytics shell | **Live** / **Partial** | **Yes** | DB down | **Yes** | Read-only |
| `…/email-command-center/send-execution` | Governance doctrine | **Live** | **Yes** | — | **Yes** | No provider APIs |

---

### Expected `email:no-send-scan` baseline (not failures)

Known **integration** seams (outside ECC UI) may still **warn** — typically **`src/lib/integrations/gmail/gmail-api.ts`**, **`src/lib/integrations/sendgrid/send-email.ts`**, **`src/lib/integrations/sendgrid/env.ts`**, **`src/lib/comms-workbench/send-provider-adapters.ts`**. **New** warnings under **`email-command-center`** paths require review.

---

*Last updated: **EMAIL-AI-INTELLIGENCE-UPGRADE-CLOSEOUT-1.0** — **[`email-ai-intelligence-upgrade-closeout.md`](./email-ai-intelligence-upgrade-closeout.md)** (AI stack summary + commands incl. **`email:ai:eval`**); prior **EMAIL-COMMAND-CENTER-MORNING-QA-CLOSEOUT-1.0** verify log unchanged; **hosted** Kelly-Grappe-App gate still **operator-owned**.*


## Cross-cut — REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0

Gated additive DDL packet: [`docs/additive-schema-production-execution-packet.md`](./additive-schema-production-execution-packet.md) · [`data/additive-schema-production-execution-packet.json`](../data/additive-schema-production-execution-packet.json). **No** production execution from repo scripts; **no** Netlify retry; **no** live send. Rebuild: `node scripts/build-additive-schema-production-execution-packet.mjs`.

## Cross-cut — REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0

After additive SQL on production: **schema** may match migrations, but **`_prisma_migrations` is not set by additive SQL** — see [`post-additive-migration-history-strategy.md`](./post-additive-migration-history-strategy.md) · [`post-additive-netlify-readiness-decision.md`](./post-additive-netlify-readiness-decision.md). **No** blind `migrate deploy` / Netlify retry until **`REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0`**. Rebuild: `node scripts/build-post-additive-migration-history-strategy.mjs`.
