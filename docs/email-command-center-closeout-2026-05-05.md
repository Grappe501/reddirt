# Email Command Center — Sprint Closeout (2026-05-05)

**Packet:** **EMAIL-COMMAND-CENTER-CLOSEOUT-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Mode:** Documentation and steering only — **no** product feature expansion in this packet.

**Read next**

- Route inventory: [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md)  
- Selective git staging: [`email-command-center-selective-staging-guide.md`](./email-command-center-selective-staging-guide.md)  
- Operator smoke test: [`email-command-center-operator-smoke-test.md`](./email-command-center-operator-smoke-test.md)  
- Progress ledger (primary bar): [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)

---

## 1. What was built this sprint (summary)

Across **EMAIL-COMMAND-CENTER-SHELL** through **EMAIL-COMMAND-CENTER-FINAL-POLISH-1.0**, the repo gained an **operator-navigable** Email Command Center: cockpit, Gmail monitor + metadata review → manual queue create, **email workflow queue** + detail with **advisory OpenAI**, contact/profile graph with approvals, Audience Studio previews, staged contact CSV import, SendGrid **receive-only** foundation + admin surface, Message Studio **planning** shell, Automation + Analytics **governance/readiness** shells, **route map** and **readiness** checklist routes, empty-state guidance, and **operator smoke test** documentation.

**This closeout packet** adds **route inventory**, this **closeout narrative**, and **selective staging guidance** so Steve can land commits without sweeping unrelated dirty paths.

---

## 2. What is operator-ready (tonight)

- **Queue triage** at **`/admin/workbench/email-queue`** and detail at **`…/email-queue/[id]`** when Postgres is available.  
- **Gmail metadata review** and **manual** queue item creation at **`…/email-command-center/gmail/review`**.  
- **Advisory AI** on queue detail when **`OPENAI_API_KEY`** is configured.  
- **Profile suggestions** approval and **Audience Studio** previews over approved facts.  
- **Contact import staging** validate → approve → commit **on a healthy local or verified hosted DB**.  
- **Message planning** session UI (**no** DB persistence until **EMAIL-MESSAGE-STUDIO-1.1**).  
- **Automation planning** and **Analytics readiness** shells (**no** activation).  
- **Cockpit**, **map**, **readiness**, and **smoke test doc** for orientation and QA.

---

## 3. What is intentionally blocked or future

- **Live SendGrid broadcast send** from Command Center surfaces.  
- **Gmail send** from email workflow queue (**`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** stays **false**).  
- **Send-from-queue** automation.  
- **Automation activation** (engine + policy packets).  
- **Production hosted contact imports** until **`email:contact-import:gate`** (and operator trust) on **that** **`DATABASE_URL`**.  
- **Pub/Sub production hardening** (auto-fetch, renewal cron, subscriber-driven **`messages.get`**) — explicit future packets.  
- **SendGrid governed contact sync execution** (**EMAIL-SENDGRID-CONTACT-SYNC-1.1**).  
- **Message Studio draft persistence** (**EMAIL-MESSAGE-STUDIO-1.1**).

---

## 4. What requires hosted Supabase / Kelly DB verification

**Not claimed by this repo state:** canonical **hosted** Postgres (Kelly / Supabase) matching migration order, **`DIRECT_URL`**, DNS, and **`email:contact-import:gate`** outcome. Operators must run diagnostics and gate scripts **on the hosted environment** and record results outside secret-bearing channels.

---

## 5. What requires future policy approval

- Any **mass send**, **auto-send**, or **auto-profile-merge** behavior.  
- **Automation Studio activation** and cross-channel **playbook execution**.  
- Broadening **Gmail** scopes or **ingesting bodies** into **`EmailWorkflowItem`** without a governed packet.

---

## 6. What requires SendGrid / Gmail credentials

- **Gmail OAuth** and **metadata sync** — Google Cloud project + OAuth client + staff account linkage.  
- **SendGrid webhook verification** and event intake — provider keys and signing secrets configured **only** in env (never committed).  
- **OpenAI** — **`OPENAI_API_KEY`** for queue intelligence (name only in docs).

---

## 7. Migrations already in repo vs hosted env

Several **ECC-related** migrations are defined in the repo (see progress ledger packet list for IDs). **This closeout does not verify** they are applied on any **hosted** database. **`npm run check`** may complete while logging **DB unreachable** during static generation; that is **not** proof of hosted readiness.

---

## 8. Local Docker status

Per Steve: **local Docker Postgres was restored earlier** — suitable for **local** development and **`npm run check`** when the stack is up. Local health **does not** prove hosted Kelly DB.

---

## 9. Checks passed (closeout criteria)

- **`npm run typecheck`** — required green for closeout.  
- **`npm run check`** — required green; may emit **existing** ESLint warnings elsewhere in the monorepo slice.  
- Build may log **`Can't reach database server`** during **page data** / static generation; when the app handles **`[kelly-sos:db-unavailable]`** (or equivalent), the **check** script may still exit **0** — treat as **environment signal**, not as “database verified.”

---

## 10. Known warnings

- **`next lint`** deprecation notice (Next.js 16 direction).  
- Numerous **ESLint warnings** in non-ECC files (social, calendar, etc.) — **out of scope** for this closeout; do not broad-fix in the same commit as ECC docs.

---

## 11. Next recommended packets (ordered)

1. **Hosted DB gate verification** — operator-run **`email:db:diagnose`** + **`email:contact-import:gate`** on canonical hosted URL; document outcome (no secrets).  
2. **EMAIL-MESSAGE-STUDIO-1.1** — persist drafts (governed Prisma slice).  
3. **EMAIL-SENDGRID-CONTACT-SYNC-1.1** — governed list sync (no silent mass ops).  
4. **EMAIL-SEND-EXECUTION-1.0** — governed send execution (separate from triage UI).  
5. **EMAIL-ANALYTICS-DELIVERABILITY-1.0** — deeper analytics / scheduling beyond current shell.  
6. **EMAIL-AUTOMATION-STUDIO-1.1** — activation policies + audit hooks.

---

## 12. Overall ECC status (ledger)

**~89%** overall after **CLOSEOUT-1.0** documentation (see ledger for per-layer percentages). Execution and hosted verification remain the main gap to a “100% production” story.

---

*Last updated: **EMAIL-COMMAND-CENTER-CLOSEOUT-1.0** (2026-05-05).*
