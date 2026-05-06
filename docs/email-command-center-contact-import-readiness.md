# Email Command Center — Contact import readiness

**Packets:** **EMAIL-DB-RECONCILE-CONTACT-IMPORT-GATE-1.0** (gates) · **EMAIL-CONTACT-IMPORT-STAGING-1.0** (staged CSV → approve → commit) · **EMAIL-DB-PEOPLEBASE-SUPABASE-VERIFY-1.0** (hosted canonical DB gate — docs + diagnostics; *packet ID retains historical codename “PeopleBase” — canonical target is the **Live RedDirt Supabase DB** until Steve confirms the Supabase project name*) · **SUPABASE-CANONICAL-DB-AND-ENV-GATE-1.0** (SSR public env vs Prisma `DATABASE_URL` / `DIRECT_URL`; diagnose shows both groups) · **KELLY-GRAPPE-APP-DB-GATE-1.0** · **KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0** (Kelly-Grappe-App = canonical hosted Supabase; full hosted chain: diagnose → migrate status/deploy → preflight → **`email:contact-import:gate`** → **`email:no-send-scan`** + **`npm run check`** — **only** when Prisma URLs clearly target **hosted** Supabase)  
**Lane:** `RedDirt/` · **Division:** Comms / Email Workflow Intelligence  
**Primary progress bar:** [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)

---

## Canonical Supabase DB is canonical for real imports

**Kelly-Grappe-App** (hosted Supabase project name — confirm in dashboard with Steve) is the **canonical** Postgres for **production** RedDirt / Kelly SOS Prisma when **`DATABASE_URL` / `DIRECT_URL`** point at that project’s connection strings. The **database name** in the URL may still be **`postgres`**; trust **host / pooler / project ref + successful diagnose + migrate status + gate**, not the UI label alone.

**Local Docker** proves the **code path** and migrations for dev builds only. The **Canonical Supabase DB** (**Live RedDirt Supabase DB** / **Kelly-Grappe-App**) is the intended **canonical** database for **real** contact import commits.

### Kelly-Grappe-App verification status (docs)

| Check | Status |
|--------|--------|
| **`npm run email:db:diagnose`** on **hosted** `DATABASE_URL` (Supabase hostname) | **Not completed** — **`KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0`** automated pass still saw **loopback** + **unreachable** local port; **not** Kelly-Grappe-App hosted proof. |
| **`npm run email:contact-import:gate`** on **hosted** URLs | **Not run** — Prisma URLs did **not** target hosted Supabase in that pass. |
| **`npm run email:no-send-scan`** + **`npm run check`** as hosted-chain tail | **Not run** as part of hosted gate (chain stopped at diagnose). |

**Local Docker success does not equal Kelly-Grappe-App success.** Real contact import **commits** remain **blocked** until the **same** gate sequence passes against the **hosted** canonical database.

**Do not** treat `npm run email:contact-import:gate` passing on localhost as permission to load real lists until the **same** command sequence has passed with **`DATABASE_URL` / `DIRECT_URL`** pointed at that **hosted** database (operator sets env privately — see [`deployment.md`](./deployment.md) § Canonical Supabase DB).

### Supabase SSR env is not the Prisma database (`SUPABASE-CANONICAL-DB-AND-ENV-GATE-1.0`)

- **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** power **Supabase Auth / SSR** (`src/utils/supabase/*`, middleware). They are **not** `DATABASE_URL` and do **not** prove the **Canonical Supabase DB** is migrated or import-ready.
- **Real contact imports** stay **paused** until **`npm run email:contact-import:gate`** succeeds against the **intended** Prisma target (hosted canonical Postgres), regardless of whether Supabase public vars are set.

---

## Why the database gate still matters

Steve’s sequencing is intentional: **Email Command Center**, **profile graph**, **Audience Studio**, and **SendGrid foundation** should exist *before* bulk contact lists land, so contacts can be **sorted, deduped, consent-aware, and governed** on ingest.

`npm run check` (lint + TypeScript + `next build`) **does not** run `prisma migrate deploy` and **does not** prove that **your** database has applied the Email Command Center migrations (including **`20260507180000_email_contact_import_staging`**). Until connectivity and migrations are verified on **each** target database (local Docker, **Canonical Supabase DB**, production), **do not** assume import readiness.

**Shipped behavior:** admin **`/admin/workbench/email-command-center/imports`** uploads CSV → **`EmailContactImportBatch` / `EmailContactImportRow`** → **Validate** (row rules + in-batch dedupe + match on **`EmailContactProfile.primaryEmail`**) → **Approve** → **Commit** creates/updates **`EmailContactProfile`** and optional **`EmailContactProfileFact`** rows with **`sourceType: CONTACT_IMPORT`** and `sourceMetadataJson` batch/row ids. **No** SendGrid sync, **no** sends, **no** OpenAI on this path. **Contact import ≠ send consent.**

---

## Required database gate (operator)

From the **`RedDirt/`** folder, after **`DATABASE_URL`** and **`DIRECT_URL`** (both required by Prisma — mirror for local Docker) point at the database you intend to use (local Docker, **Live RedDirt Supabase DB**, Netlify-linked Postgres, etc.):

```bash
npm run email:contact-import:gate
```

This runs:

1. `prisma migrate deploy`
2. `node scripts/email-command-center-preflight.mjs`
3. `npm run check`

**Safer diagnostics first (no secrets printed):**

```bash
npm run email:db:diagnose
npm run email:command-center:preflight
```

**Do not run production-sized imports until this gate passes on the same `DATABASE_URL` the app uses** (or an operator-explicit exception is documented with Steve). Passing locally on Docker **does not** prove the **Canonical Supabase DB** or production.

---

## Contact import principles (staging shipped)

1. **Staging first** — load files into **`EmailContactImportBatch` / `EmailContactImportRow`**, not directly into production `User` / volunteer CRM tables.
2. **Validate before commit** — schema checks, required columns, email shape, obvious garbage rows.
3. **Dedupe by normalized email** — stable lowercase trim; merge policy is human-approved, not silent.
4. **Preserve original source** — keep raw filename, upload timestamp, and immutable copy or hash of the source list where policy allows.
5. **Preserve consent / source fields** — never overwrite provenance; never assume opt-in from a bare list.
6. **Never assume opt-in** — marketing sends require explicit consent posture per counsel and product rules.
7. **Never auto-send after import** — imports are data events; sends remain separate governed actions.
8. **Profile fact suggestions** — where AI or heuristics are uncertain, stage as **suggestions** with confidence; operators approve **`EmailContactProfileFact`** (existing graph pattern).
9. **Suppress invalid / unsubscribed / bounced** — respect **`SendGridSuppression`** and internal unsubscribe flags before any send path (future packets).

---

## Recommended CSV columns

| Column | Purpose |
|--------|---------|
| `email` | Primary key for dedupe (required for most flows) |
| `firstName` / `lastName` | Identity |
| `phone` | Optional outreach channel |
| `county` / `city` / `state` | Geography for segmentation |
| `sourceList` | Human-readable list name |
| `sourceDate` | When the list was acquired/exported |
| `consentStatus` | Legal/comms posture (values defined with counsel) |
| `tags` | Freeform or controlled vocabulary |
| `organization` / `role` | Affiliation |
| `notes` | Operator context |
| `volunteerInterest` / `donorInterest` / `issueInterest` | Segmentation hints (not votes) |

---

## Import stages (implemented workflow)

1. **Upload** — admin **`/imports`**; `createdByUserId` when actor resolves.  
2. **Parse** — CSV (comma + quoted fields) → **`EmailContactImportRow`** + `rawJson`.  
3. **Validate** — email required; in-batch duplicate detection; match existing **`EmailContactProfile`**; consent/source warnings.  
4. **Preview** — batch detail + commit preview counts.  
5. **Approve** — operator only; **`EmailContactImportDecision`**.  
6. **Commit** — operator only; profiles + **`EmailContactProfileFact`** with **`CONTACT_IMPORT`** provenance; **no** **`EmailAudienceDefinition`** auto-create.  
7. **Archive** — batch status **`ARCHIVED`**.

---

## Follow-on packets (not shipped)

- Row-level merge UX, richer dedupe against relational contacts, XLSX ingestion.  
- **EMAIL-SENDGRID-CONTACT-SYNC-1.1** — governed SendGrid sync (separate explicit packet).

---

## Related scripts and docs

- **DB diagnose:** `npm run email:db:diagnose` → `scripts/email-command-center-db-diagnose.mjs` (Supabase **public** env presence + Prisma target + ECC + contact-import **prerequisite** hint — does **not** run the full gate)  
- **Preflight:** `npm run email:command-center:preflight`  
- **Deployment / env:** [`deployment.md`](./deployment.md)  
- **SendGrid foundation:** receive-only; **no** contact sync in foundation packet.

---

*Last updated: **KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0** — hosted gate chain documented; automated pass **not** verified (loopback); prior staging + Canonical DB narrative retained.*
