# Email Command Center — production migration runbook (RedDirt / Kelly Grappe SOS)

Safe, **non-destructive** guidance for applying Prisma migrations so Email Command Center (ECC) tables and columns exist on the **correct** Postgres database. This doc does **not** contain secrets.

---

## 0. Prisma P3005 (non-empty database / migration history mismatch)

**What it means:** `npx prisma migrate deploy` can fail with **P3005** when Prisma detects that the database already has objects in the schema (or the situation does not match a “fresh” migrate baseline), while `_prisma_migrations` is missing, empty, or does not line up with what Prisma expects for this repository. That is common on **hosted Supabase** where `auth`, `storage`, and other schemas already exist, or where tables were created without Prisma migration history.

**What not to do:** Do **not** run `prisma migrate reset`, blanket `DROP`, or **`migrate resolve` for every migration** without proving each migration either was already applied to this database or is safe to skip. **Do not baseline blindly.**

**What to do first:** Run read-only recon from `RedDirt/` and treat its **recommendation line** as input to the decision tree below — not as permission to run destructive fixes.

```bash
npm run email:baseline:recon
npm run email:baseline:plan
```

`email:baseline:plan` scans all `prisma/migrations/*/migration.sql` against the **live** `public` / `auth` catalog and writes **`docs/EMAIL_BASELINE_PLAN.md`** plus **`docs/email-baseline-plan-output.json`** (no secrets). Use it before deciding on a **synthetic baseline marker** or any `migrate resolve`.

`email:baseline:recon` prints schema/table/column posture and `_prisma_migrations` status — never secrets. `email:baseline:plan` emits collision + readiness reports to `docs/` — also no secrets in output.

### Baseline decision tree (after `email:baseline:recon`)

| Recon signal | Interpretation | Next steps (non-destructive) |
|--------------|----------------|------------------------------|
| **EMPTY/NEAR EMPTY DB** heuristic | Public schema is essentially empty (aside from normal noise); you intend this to be the Greenfield DB for this app. | Confirm `DATABASE_URL` is the **correct** project. Then `npx prisma migrate status` → `npx prisma migrate deploy`. If P3005 still appears, the DB is **not** actually empty — re-run recon and escalate. |
| **EXISTING REDDIRT DB WITHOUT MIGRATION HISTORY** | `_prisma_migrations` missing or **zero** rows, while **public** is not trivially empty — includes databases with legacy `import_*` / `voter_*` / petition-style tables **or** partial Prisma tables, even when `User` is not present yet. Recon lists all `public` names for evidence. | **Stop.** You need a **steered baseline**: map which `prisma/migrations/*` folders already reflected in the live DDL (compare `migration.sql` to `information_schema` / table list). Only then use targeted `prisma migrate resolve` (per migration, with evidence) or approved DBA SQL — never “mark all applied.” |
| **PARTIAL ECC DB** | `_prisma_migrations` has rows and core RedDirt exists, but ECC tables/columns (or `gmailSyncState`, etc.) are incomplete. | Prefer **`npx prisma migrate status`** then **`npx prisma migrate deploy`** for **pending** migrations only. If deploy errors on “already exists,” treat as **drift**: reconcile that migration’s statements against the live DB, then resolve **that** migration only with evidence. |
| **Schema largely complete** | History + key ECC tables/columns present. | `npx prisma migrate status` → `migrate deploy` → `npm run email:command-center:preflight`. If P3005 persists, history is still misaligned — use the “without migration history” / drift path with recon output attached. |

**Always** follow the recon footer: **DO NOT BASELINE BLINDLY.**

### Why you must not resolve all ~72 RedDirt migrations at once

The repo has **one folder per migration** under `prisma/migrations/`. Running `prisma migrate resolve --applied` (or equivalent) for **every** folder **without proving** each migration’s DDL already ran on **this** database would make `_prisma_migrations` claim a false history: later deploys could **skip** work the database still needs, while the app expects tables, enums, indexes, and columns that were never created. That is especially dangerous when the database already has **legacy `public` tables** but **no** Prisma history (common with P3005 on hosted Supabase). **Never resolve the full chain blindly.**

### Synthetic legacy baseline marker (candidate only)

After recon, run **`npm run email:baseline:plan`**. It compares live **`public` / `auth`** names (tables, enums, index names) to a **heuristic regex parse** of every `migration.sql`. If the plan reports **no collisions**, a **candidate** (DBA-reviewed) path is:

1. **Backup or snapshot** the database on the host.
2. Add **one** new migration folder (for example `00000000000000_existing_supabase_legacy_baseline`) whose `migration.sql` is intentionally a **no-op** (comments and `SELECT 1;` only — no DDL that drops or rewrites legacy data).
3. Run **`npx prisma migrate resolve --applied <that_folder_name>`** for **only** that synthetic marker — **not** for each real RedDirt migration.
4. Run **`npx prisma migrate deploy`** so Prisma applies the **real** migrations in timestamp order.

This remains **conditional** on the collision report, parse limits, and org policy; it is **not** permission to skip human review.

### Collision check requirement

Treat **`npm run email:baseline:plan`** as mandatory reading before any baseline `resolve`: it emits **`docs/EMAIL_BASELINE_PLAN.md`** and **`docs/email-baseline-plan-output.json`**. If **any** table, enum, or index **name collision** appears between **live** objects and migration `CREATE TABLE` / `CREATE TYPE` / `CREATE INDEX` usage, **stop** — use a manual DBA baseline; do not `resolve` or `deploy` until overlap is understood.

### Backup / snapshot before `resolve` or `deploy`

**`migrate resolve`** and **`migrate deploy`** change `_prisma_migrations` and schema. Take a **Supabase backup / PITR snapshot** (or your host’s equivalent) **before** running them against a database you cannot trivially recreate.

---

## 1. What migrations add ECC artifacts

These folders exist under `prisma/migrations/`. Apply them with `npx prisma migrate deploy` (applies **all** pending migrations **in timestamp order**, not only the rows below).

| Artifact | Migration folder | Notes |
|----------|------------------|--------|
| `StaffGmailAccount` (table) | `20260423120000_tier25_webhooks_gmail` | Base staff Gmail OAuth row. |
| `StaffGmailAccount.gmailSyncState` | `20260505190000_staff_gmail_sync_state` | `JSONB` column (preflight checks this). |
| `EmailContactProfile` graph (and related) | `20260505203000_email_contact_profile_graph` | Profile/fact graph for audiences and imports. |
| `EmailAudienceDefinition`, preview run FK | `20260505220000_email_audience_studio_foundation` | Audience Studio. |
| `SendGridEvent`, suppression/maps foundations | `20260506120000_email_sendgrid_foundation` | Webhook intake tables. |
| `EmailContactImportBatch` (+ rows, decisions) | `20260507180000_email_contact_import_staging` | CSV staging. |
| `MessageStudioDraft` (+ revisions) | `20260508120000_message_studio_server_drafts` | Shared server drafts. |
| `SendGridContactSyncRun` | `20260509120000_sendgrid_contact_sync_run` | Governed Marketing Contacts sync lane. |
| `EmailSendExecution`, `EmailSendApproval`, `EmailSendRecipient` | `20260510140000_email_send_execution` | Governed send lane. |

**Verify in repo:** each folder above contains a `migration.sql` that creates or alters the named objects.

---

## 2. Confirm the correct `DATABASE_URL` target

Do **not** paste connection strings into chat, tickets, or screenshots.

1. In **Supabase** (or your host), open the **intended** project for **Kelly Grappe SOS / RedDirt production**.
2. From **Database** settings, confirm **host**, **project ref**, and **database name** match what you expect.
3. Locally / CI, ensure `DATABASE_URL` and `DIRECT_URL` in the **deployment environment** (or shell) point at **that** project — not a disposable dev DB unless you mean to migrate dev only.
4. Heuristic: run from `RedDirt/`:

   ```bash
   npm run email:baseline:recon
   npm run email:baseline:plan
   npm run email:db:diagnose
   ```

   Use **baseline recon** when `migrate deploy` fails with **P3005** or migration history is missing. Use **baseline plan** for **collision / synthetic-marker viability** against all `migration.sql` files. Use **db:diagnose** for ongoing checks — it reports whether Prisma can connect and whether ECC migration rows appear applied (after deploy). Interpret **names and presence only** in all three.

---

## 3. Commands to run (operator order)

From repository root **`RedDirt/`** (where `package.json` lives):

| Step | Command | Expected when healthy |
|------|---------|------------------------|
| 0 | `npm run email:baseline:recon` | Read-only posture on `_prisma_migrations` + key ECC table/column presence. |
| 0b | `npm run email:baseline:plan` | Live vs migration **collision** report + synthetic-marker candidacy; writes `docs/EMAIL_BASELINE_PLAN.md` and JSON. |
| 1 | `npm run email:db:diagnose` | DB connect OK; after migrate, ECC migration rows reported applied. |
| 2 | `npx prisma migrate status` | Pending list matches what you expect; no surprise drift. |
| 3 | `npx prisma migrate deploy` | Exits **0**; applies pending migrations **forward only**. |
| 4 | `npm run email:command-center:preflight` | **PASS** — includes `StaffGmailAccount.gmailSyncState` present; ECC migration list all applied. |
| 5 | `npm run email:contact-import:gate` | Full gate: deploy + preflight + `npm run check` (use before bulk import). |
| 6 | `npm run email:no-send-scan` | **WARN** allowed for integration baseline; ECC lane must stay **clean** of direct sends. |

**After code changes in CI:**

```bash
npm run typecheck
npm run build
```

---

## 4. What failure means

| Symptom | Likely meaning |
|---------|----------------|
| `migrate deploy` → **P3005** | Non-empty or mismatched schema vs migration history — run `npm run email:baseline:recon` and **`npm run email:baseline:plan`**, follow §0 tree and collision report; do not reset DB or resolve all migrations blindly. |
| Preflight: `gmailSyncState` missing | `20260505190000_staff_gmail_sync_state` not applied (or wrong database). |
| Preflight: ECC migrations “NOT applied” | `_prisma_migrations` out of date — run `migrate deploy` on **this** URL. |
| `migrate deploy` errors (SQL) | Dependency migration missing, permission issue, or manual drift — **stop**, read Prisma error; do not force. |
| App UI: “Migration required” banner | Snapshot reports `allEmailCommandCenterMigrationsApplied !== true` — finish deploy + preflight. |
| Gmail/SendGrid still “incomplete” after migrate | **Env** issue (OAuth redirect, Pub/Sub topic, tokens, SendGrid keys) — separate from migrations. |

---

## 5. Rollback / non-destructive warning

- **`prisma migrate deploy` is forward-only** — it does not “undo” a migration automatically.
- **Do not** run `prisma migrate reset` against production (wipes data).
- **Do not** manually `DROP` ECC tables in production without a **backup and explicit runbook review**.
- If a migration partially fails: stop, capture the **error text** (redact URLs/passwords), restore from **host backup** only per your org’s policy — outside this repo’s automation.

---

## 6. After green: operator path (one line)

**Diagnose → migrate deploy → preflight → contact-import gate → import → preview audience → test send → first batch**

1. `npm run email:baseline:recon` (if hosted DB is new to this repo or P3005 occurred)
2. `npm run email:baseline:plan` (collision / synthetic baseline marker viability)
3. `npm run email:db:diagnose`
4. `npx prisma migrate status` (optional but recommended before deploy)
5. `npx prisma migrate deploy`
6. `npm run email:command-center:preflight`
7. `npm run email:contact-import:gate` (before bulk CSV)
8. **Import:** `/admin/workbench/email-command-center/imports`
9. **Audience:** `/admin/workbench/email-command-center/audiences#audience-preview`
10. **Test send:** `/admin/workbench/email-command-center/send-execution#ops`
11. **First batch:** same **#ops** flow after approvals + typed confirmation

**Default cockpit:** `/admin/workbench/email-command-center` (Today view).
