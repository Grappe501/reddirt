# Core schema drift repair plan (RedDirt / hosted Postgres)

## Read-only report (summary)

| Finding | Detail |
|--------|--------|
| **Missing tables** | **`User`** (`20260421120000_init`), **`County`** (`20260221120000_county_command_pages`), **`VoterRecord`** (`20260221143000_voter_file_snapshots_and_metrics`) — and supporting voter-file / warehouse objects per draft SQL. |
| **Existing dependent tables (example set)** | `VolunteerProfile`, `ContactPreference`, `StaffGmailAccount`, `EmailContactProfile`, `RelationalContact`, `CampaignEvent`, `CalendarSource`, `EmailContactImportBatch`, `EmailSendExecution` — these assume a coherent **`User`** (and for comms intel, **`VoterRecord`**) graph. |
| **Migrations with `applied_steps_count = 0`** | Inspect live DB with `npm run inspect:core-schema-drift` — lists all such rows in `_prisma_migrations`. |
| **Likely cause** | Baseline / history claimed migrations **finished** without executing early DDL in order (`County` / `VoterFileSnapshot` chain / `User`) on **this** database. |
| **Safest repair options** | **(A)** Surgical DDL from canonical migrations + data backfill for `userId` FKs (see draft SQL + DBA) — **medium risk**. **(B)** Fresh canonical Supabase + full `migrate deploy` — **lowest risk** if data disposable. **(C)** Selective logical export — high effort. |

---

**Context:** Email Command Center (ECC) and later migrations are marked applied on a database that is missing foundational **`User`**, **`County`**, and **`VoterRecord`** objects. `20260516143000_communication_intelligence_ingest` fails when adding foreign keys to **`User`** (`relation "User" does not exist`). **`CommunicationIdentity.voterRecordId`** also targets **`VoterRecord`**.

This is **schema drift / bad baseline**, not an ECC application bug. **Do not** treat it as a send-governance change. **Do not** mark `20260516143000_communication_intelligence_ingest` as applied until dependencies exist or the migration is legitimately rolled back and replayed under DBA control.

---

## 1. Missing core objects (expected vs observed)

| Object | Role | Source in repo |
|--------|------|----------------|
| **`User`** | Auth-linked staff/volunteer identity; FK target for `ExternalIngestRun`, `GmailMessageRecord`, `CommunicationProfileMatchCandidate`, `StaffGmailAccount`, `VolunteerProfile`, etc. | Created in **`20260421120000_init`** (`prisma/migrations/20260421120000_init/migration.sql`). |
| **`County`** | Canonical county row; **required** before **`VoterRecord`** (FK `VoterRecord.countyId` → `County.id`). | Created in **`20260221120000_county_command_pages`**. |
| **`VoterRecord`** | Voter warehouse row; FK target for **`CommunicationIdentity.voterRecordId`**. | Created in **`20260221143000_voter_file_snapshots_and_metrics`** together with **`VoterFileSnapshot`** and **`CountyVoterMetrics`**. |

**Chronological migration order** (folder names): `20260221120000` (County) → `20260221143000` (Voter file) → … → `20260421120000` (**`User`** + `VolunteerProfile`, etc. in `init`). A baseline that **skipped** early steps but **marked** later migrations `finished` produces exactly this failure mode.

---

## 2. Dependent tables you reported as present

These imply **partial** application of later migrations while core rows are missing:

- `VolunteerProfile` — **`userId`** is supposed to reference **`User.id`** (`init` adds `VolunteerProfile_userId_fkey`). With **`User`** absent, the table is **logically orphaned** (and may lack the FK if DDL was hand-edited or failed partway).
- `ContactPreference` — optional **`userId`** → **`User`**.
- `StaffGmailAccount` — **`userId`** → **`User`** (required).
- `EmailContactProfile` — optional **`userId`** → **`User`**.
- `RelationalContact`, `CampaignEvent`, `CalendarSource`, `EmailContactImportBatch`, `EmailSendExecution` — various relations; many ECC flows still assume a coherent **`User`** graph for staff and OAuth.

Any non-null **`userId`** / **`staffUserId`** / **`requestedByUserId`** pointing at missing **`User`** rows will break once FKs are enforced or when the communication-intelligence migration retries.

---

## 3. Failed migration and why it breaks

**`20260516143000_communication_intelligence_ingest`** (see `prisma/migrations/20260516143000_communication_intelligence_ingest/migration.sql`):

- Adds FKs such as `ExternalIngestRun_staffUserId_fkey` → **`User`**, `GmailMessageRecord_staffUserId_fkey` → **`User`**, `CommunicationProfileMatchCandidate_reviewedByUserId_fkey` → **`User`**.
- Adds `CommunicationIdentity_voterRecordId_fkey` → **`VoterRecord`**.

If **`User`** or **`VoterRecord`** (or **`County`** needed to build **`VoterRecord`** consistently) do not exist, PostgreSQL raises **`relation "User" does not exist`** (or similar) at **`ALTER TABLE … REFERENCES`**.

---

## 4. `_prisma_migrations` and `applied_steps_count = 0`

Prisma records each migration in **`public._prisma_migrations`**. Rows with **`finished_at` set** but **`applied_steps_count = 0`** often indicate:

- A migration was **marked** complete without executing its SQL steps, or
- A **failed** transaction left inconsistent state, or
- Manual edits / tooling wrote misleading history.

**Note:** Some Prisma versions or deployment paths persist **`applied_steps_count = 0`** broadly; treat the field as a **hint**, not proof. **`npm run inspect:core-schema-drift`** compares **live tables** to expected names — that is the stronger signal. Also watch for **duplicate `migration_name` rows** (e.g. one `rolled_back_at` set and another pending); Prisma expects a single logical history per name — resolve only with [official migrate troubleshooting](https://pris.ly/d/migrate-resolve) and a backup.

**Action (read-only):** run `npm run inspect:core-schema-drift` to list rows with **`applied_steps_count = 0`** and compare that list to **live** `information_schema` / table list.

**Do not** bulk-delete or rewrite `_prisma_migrations` without a **backup** and a written rollback plan.

---

## 5. Likely cause (summary)

1. **Synthetic or manual baseline** (or partial deploy) marked a **block** of migrations applied **without** running their SQL in order on this database.
2. **Early** migrations that create **`County`** / **`VoterRecord`** / **`User`** were skipped or never executed, while **later** ECC and event migrations **did** run (partially), yielding a **non-deterministic** schema.
3. **`20260516143000_communication_intelligence_ingest`** is the first migration in the chain that **hard-requires** **`User`** and **`VoterRecord`** together via FK DDL, so it surfaces the drift.

---

## 6. Safest repair options (non-destructive preference order)

### Option A — Surgical DDL + controlled migration replay (medium risk)

**When:** Drift is **narrow** (only missing **`User`**, **`County`**, **`VoterRecord`** stack); **no** conflicting objects; **backup** taken; DBA reviews **`docs/core-schema-drift-repair-draft.sql`**.

**Outline:**

1. **Backup / snapshot** the database.
2. Use the **draft SQL** only as a **verbatim-from-migrations** starting point; run **subset** actually needed after comparing **live** catalog (skip ENUM/table blocks that already exist).
3. Create missing objects in **dependency order**: County (and its prerequisites from `20260221120000`) → voter file tables (`20260221143000`) → voter warehouse hardening (`20260221180000`) where applicable → **`User`** (`20260421120000` extract) → follow-up **`User` / `VoterRecord`** columns from `20260421221514_volunteer_signup_sheet_intake` as needed for current `schema.prisma`.
4. **Reconcile constraints** for pre-existing **`VolunteerProfile`** rows: every **`userId`** must map to a **`User.id`** you create (or rows must be quarantined — **business decision**, not technical default).
5. After schema matches expectations, **either**:
   - roll back the failed migration row and **`migrate deploy`**, or  
   - run the **remaining statements** from `20260516143000` manually if Prisma history is frozen (last resort; keep Prisma history and reality aligned).

**Risks:** Orphaned FK data, duplicate ENUM names if partial county migration ran, and **`*_fkey`** name clashes. Requires **`inspect:core-schema-drift`** + manual diff.

### Option B — Fresh canonical Supabase + `migrate deploy` (lowest operational risk if data is disposable)

**When:** Production ECC data on this instance is **not** worth preserving; or drift is **too wide** to trust Option A; or **`_prisma_migrations`** no longer reflects truth.

**Outline:** New project or empty `public` (after export anything legally needed), correct **`DATABASE_URL` / `DIRECT_URL`**, single **`migrate deploy`** from a known commit, then re-seed/import.

### Option C — Full logical dump of selective tables (high effort)

Export only known-good ECC-related tables, restore into a clean DB, then migrate. Only where legal/compliance allows and IDs/FKs can be replayed.

---

### When surgical repair is **too risky**

Prefer **Option B (fresh canonical Supabase + clean `migrate deploy`)** if any of the following hold:

- **`_prisma_migrations`** contains **duplicate** rows for the same `migration_name`, or history cannot be reconciled with live DDL.
- **Orphan counts** from `inspect:core-schema-drift` are non-zero for **`userId` → `User`** (or **`voterRecordId` → `VoterRecord`**) once parent tables exist — data repair exceeds a simple DDL gap-fill.
- **Legal / ops** require a provable empty baseline rather than patching ghost history.
- Partial **ENUM** / **index** collisions would require many hand-edited statements (the draft SQL assumes migrations apply **verbatim**).

---

## 7. What **not** to do

- **`prisma migrate reset`** on production.
- **`DROP`** core or ECC tables without backup and sign-off.
- **`migrate resolve --applied`** on **`20260516143000`** while DDL never completed.
- **`migrate deploy`** again **without** a plan for missing **`User`** / **`County`** / **`VoterRecord`** (same failure).
- Change **send governance** code as a substitute for schema repair.

---

## 8. Read-only tooling in this repo

| Artifact | Purpose |
|----------|---------|
| `scripts/inspect-core-schema-drift.cjs` | Env-safe inspection: table presence, row counts, orphan **userId** / county / voter pointers, **`_prisma_migrations`** with **`applied_steps_count = 0`**. Run: `npm run inspect:core-schema-drift`. |
| `docs/core-schema-drift-repair-draft.sql` | **Not executed by automation** — DDL excerpts from named migrations for DBA review only. |
| This document | Decision record and repair ordering. |

---

## 9. Verification after repair (out of scope for drift fix itself)

When schema and Prisma history are aligned:

- `npx prisma migrate status`
- `npm run email:command-center:preflight` (does not replace a full migration audit)
- Application smoke paths that touch **`User`** and communication intelligence read models

---

**Bottom line:** Create **`User`**, **`County`**, and the **`VoterRecord`** dependency stack from **canonical migration SQL** (or start from a **clean** database). The communication-intelligence migration is failing because it correctly assumes those relations exist; the bug is **history vs reality**, not ECC product logic.
