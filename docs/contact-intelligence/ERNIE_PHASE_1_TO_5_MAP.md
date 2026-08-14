# Ernie briefing — Contact Intelligence Phase 1–5 map

**Read this before writing any Cursor script.**  
Source of truth: `docs/contact-intelligence/MASTER_CONTACT_BUILD_PLAN.md`  
Packet: **CONTACT-INTEL-1.0**

This is one product: a private contact library that accumulates every email and phone Steve has, with provenance, then later addresses/tags/custom fields, then local disk, Drive, Google Contacts, and inferred Gmail. It is **not** a second CRM, **not** Email Command Center import, and **not** RelationalContact / User / VoterRecord bulk load.

---

## Where the code lives (do not confuse these)

| Role | Path | Git |
|------|------|-----|
| **Schema owner / migrations** | `H:\SOSWebsite\RedDirt-contact-intel` | `feat/contact-intelligence-v1` on [Grappe501/reddirt](https://github.com/Grappe501/reddirt) |
| **Standalone dashboard (product)** | `H:\SOSWebsite\data-upload` | `main` on [Grappe501/data](https://github.com/Grappe501/data) |
| **Database / env** | Existing RedDirt Postgres | `DATABASE_URL` + `DIRECT_URL` from `H:\SOSWebsite\RedDirt\.env` / `.env.local` — never commit |

- **Additive migrations run only from the RedDirt worktree** (`npm run stack:migrate`).
- The data app Prisma schema is a **generate-only subset**. **Never** `prisma migrate deploy` from `data-upload` — a subset schema would look like the rest of RedDirt should be dropped.
- After a RedDirt schema change, copy the new ContactIntel* models into `data-upload/prisma/schema.prisma` (still no `User` relation required) and run `prisma generate` there.
- H: only. Wrapper: `node scripts/run-with-h-drive-env.cjs …`. Cache/temp: `H:\SOSWebsite\.local\`. No C: scratch.

**Operator URLs**

- RedDirt chrome: `http://localhost:3000/admin/contact-intel`
- Standalone app: `http://localhost:3005` (Netlify site uses this repo)

---

## Vision Ernie must keep in his head

For every person the system answers:

1. Who is this?
2. Which emails and phones (later: addresses, tags, custom fields) do we have?
3. Where did each value come from?
4. What is new, updated, invalid, or in conflict?
5. Are two records probably the same person? Review — never reckless merge.

**Core identity rules (locked — do not rewrite in Phase 5)**

- A row needs **email and/or phone**. Names never merge people.
- Email: trim + lowercase. Phone: 10-digit US via existing `normalizePhone`. Keep originals.
- No match → create person. All identifiers → one person → enrich.
- Email points at A and phone points at B → **CONFLICT**, do not commit onto either.
- `(kind, normalizedValue)` is unique on `ContactIntelMethod` — re-import updates, it does not clone.
- Unmapped extra columns stay in `rawJson` until Phase 5 maps them.
- **No sends.** Import is not consent.
- **Do not write** into `EmailContactProfile`, `RelationalContact`, `User`, or `VoterRecord`.

**Why a new library exists:** Email Command Center CSV import **requires email**. Phone-only rows are the first-class case here.

---

## Full journey (so Phase 5 scripts do not leak later work)

| Phase | Status | What it is |
|-------|--------|------------|
| 0 Recon | **Done** | Locked to real RedDirt stack |
| 1 Schema | **Done** | ContactIntel tables on RedDirt DB |
| 2 Engine | **Done** | Parse / map / normalize / match / preview / commit |
| 3 Import UI | **Done** | Upload → map → preview → commit |
| 4 Retrieval | **Done** | Search by email / phone / name + person page |
| **5 Schema expansion** | **Next — Ernie writes the Cursor script, then implement** | Addresses, tags, governed custom fields |
| 6 Local discovery | Later (script stub exists) | Operator-selected H: folders only |
| 7 Google Drive | Later (script stub exists) | Least-privilege, no auto-ingest |
| 8 Google Contacts | Later (script stub exists) | Saved contacts only |
| 9 Gmail inferred | Later (script stub exists) | Inferred until promoted; no send |

Phases 6–9 already have stub scripts in `docs/contact-intelligence/CURSOR_SCRIPT_PHASE_0N_*.md`. **Do not implement them in the Phase 5 script.**

---

## Phase 1 — Database foundation — DONE

**Objective:** Additive Prisma models on the existing RedDirt database.

**Shipped**

- Migration `20260813180000_contact_intelligence_v1` (applied).
- Models: `ContactIntelPerson`, `ContactIntelMethod`, `ContactIntelImportJob`, `ContactIntelSourceRow`, `ContactIntelConflict`.
- User relation only: `contactIntelImportJobsCreated` (optional actor). No User created per contact.

**Ernie script work:** none. Do not invent a second contact table set.

---

## Phase 2 — Ingestion engine — DONE

**Objective:** Irregular spreadsheets become previewable, committable, idempotent source rows.

**Shipped (RedDirt + copied into data app)**

- `src/lib/contact-intel/parse.ts` — CSV + first-sheet XLSX from memory (8MB / 20k rows).
- `mapping.ts` — targets: `email`, `phone`, `full_name`, `first_name`, `last_name`, `ignore`.
- `pipeline.ts` — preview + commit; in-file first-seen + DB method index.
- `jobs.ts` — chunked `createMany`.
- Normalize check: `scripts/verify-contact-intel-normalize.ts` (RedDirt) / `scripts/verify-normalize.ts` (data).

**Ernie script work:** none unless Phase 5 needs new mapping targets (then extend this engine, do not replace it).

---

## Phase 3 — Import dashboard — DONE

**Objective:** Operator maps columns without engineering help.

**Shipped**

- RedDirt: `/admin/contact-intel` (outside Campaign OS `(board)` shell).
- Data app: `/`, `/import`, `/import/[id]`.
- Flow: upload → per-column select → preview counts → commit. Invalid/conflict rows stay out of the library.

**Ernie script work:** Phase 5 adds mapping options and profile display; do not redesign the dashboard.

---

## Phase 4 — Retrieval — DONE

**Objective:** Find a person by email, phone, or name; see all methods and source files.

**Shipped:** library search + `/contacts/[id]` (data) / `/admin/contact-intel/contacts/[id]` (RedDirt).

**Ernie script work:** Phase 5 shows addresses/tags/custom values on the person page. Do not change match rules to use names or addresses for auto-merge.

---

## Phase 5 — Addresses, tags, governed custom fields — NEXT SCRIPT

**This is the only phase Ernie should write a build script for right now.**  
Existing stub: `docs/contact-intelligence/CURSOR_SCRIPT_PHASE_05_SCHEMA_EXPANSION.md` — expand it into a full Cursor implementation script using the template below. Then implement only that script.

**One objective:** Let Steve map extra spreadsheet columns to addresses, tags, or reusable custom fields without rebuilding the database and without changing email/phone identity rules.

**Allowed paths**

- RedDirt worktree: `prisma/schema.prisma` (additive), new migration folder **after** `20260813180000` (use a later timestamp, e.g. `20260814…`), `src/lib/contact-intel/**`, `src/app/admin/contact-intel/**`, `docs/contact-intelligence/**`.
- Data app (same change, generate only): `H:\SOSWebsite\data-upload/prisma/schema.prisma`, `src/lib/contact-intel/**`, `src/app/(app)/**`. No migrate from data-upload.

**Forbidden in the Phase 5 script**

- C: scratch; ajax / phatlip / countyWorkbench / sos-public
- `EmailContactProfile` / `RelationalContact` / `User` / `VoterRecord` bulk writes
- Any send / SendGrid / Gmail send
- Local disk scanners (Phase 6)
- Google Drive / Contacts / Gmail (Phases 7–9)
- Rewriting `ContactIntelMethod` uniqueness or auto-merge rules
- Dependency upgrades, visual redesign, refactors unrelated to mapping/profile

**Models to add (additive)**

| Model | Role |
|-------|------|
| `ContactIntelAddress` | One address on a person (original + normalized parts) |
| `ContactIntelTag` | Reusable tag; person↔tag join |
| `ContactIntelCustomFieldDefinition` | Governed field (key, label, type, sensitivity) |
| `ContactIntelCustomFieldValue` | Value on a person for a definition, with source row id |

**Mapping targets to add:** `address`, `city`, `state`, `zip`, `tag`, and `custom:<key>` (create definition if Steve confirms in the UI). Unmapped extras still stay in `rawJson`.

**Steps the script must number**

1. Additive Prisma models + RedDirt migration + `stack:migrate`.
2. Mirror models into data-upload schema; `prisma generate` only.
3. Extend mapping UI + `extractContactIntelRow` + commit path (attach address/tag/custom on NEW/UPDATE; never on CONFLICT/INVALID).
4. Person page shows addresses, tags, custom values + which import they came from.
5. Synthetic CSV only (`alex@example.com`, `5015550100`, fake employer/city). No real PII.
6. Typecheck both apps. Do not `migrate deploy` from data-upload.

**Acceptance**

1. A sheet with `Employer` can create a reusable custom field and attach it.
2. Address/city/state/zip map onto `ContactIntelAddress` without becoming match keys.
3. Tags can be multi-value (split on comma/semicolon).
4. Email/phone uniqueness and conflict behavior unchanged.
5. Re-import does not clone methods or custom-field definitions.
6. No send paths.

**Verify**

```bash
cd H:\SOSWebsite\RedDirt-contact-intel
node scripts/run-with-h-drive-env.cjs npm run stack:migrate
node scripts/run-with-h-drive-env.cjs npm run typecheck

cd H:\SOSWebsite\data-upload
node scripts/run-with-h-drive-env.cjs npm run prisma:generate
node scripts/run-with-h-drive-env.cjs npm run typecheck
```

**Stop if:** migrate fails twice; secrets in diff; would rewrite method uniqueness; would require scanning disk or Google.

**Completion report:** files, migration name, tests, limitations, whether data-upload schema was mirrored.

---

## Cursor script template (use this for Phase 5, and later 6–9)

```text
Active lane: RedDirt worktree H:\SOSWebsite\RedDirt-contact-intel
Also update: H:\SOSWebsite\data-upload (UI + generate-only Prisma)
Branch: feat/contact-intelligence-v1 (schema) · data main (dashboard)
Phase: N — <title>
One objective: <one sentence>
Allowed paths: <list>
Forbidden: C: scratch; other lanes; EmailContactProfile/RelationalContact/User/VoterRecord bulk writes; sends; later-phase work; migrate deploy from data-upload
Reuse: RedDirt DATABASE_URL/DIRECT_URL, existing normalize + mapping UI, run-with-h-drive-env.cjs
Steps: numbered
Acceptance: numbered
Verify: exact commands
Stop if: assumption false, migrate fails twice, secrets appear
Completion report: files, migration, tests, limitations
```

---

## What Ernie should produce next

1. **One file:** a complete `CURSOR_SCRIPT_PHASE_05` (replace/expand the stub) that a Cursor agent can execute without asking Steve about scope.
2. **Do not** write Phase 6–9 implementation scripts until Steve says so. Stubs already exist.
3. **Do not** start Phase 5 implementation in the same pass as writing the script unless Steve says “build Phase 5 now.”
