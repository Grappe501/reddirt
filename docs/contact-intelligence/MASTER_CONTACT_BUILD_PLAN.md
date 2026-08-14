# RedDirt Contact Intelligence — Master Build Plan

**Packet:** CONTACT-INTEL-1.0  
**Product repo:** [https://github.com/Grappe501/data](https://github.com/Grappe501/data) (`H:\SOSWebsite\data-upload`)  
**Lane:** RedDirt database + env; standalone UI is **not** Campaign OS  
**RedDirt branch (schema/migrations):** `feat/contact-intelligence-v1`  
**Worktree (H: only):** `H:\SOSWebsite\RedDirt-contact-intel` (schema owner) · `H:\SOSWebsite\data-upload` (dashboard)  
**Database / env:** existing RedDirt `DATABASE_URL` + `DIRECT_URL` (`.env` / `.env.local`)  
**Auth:** existing `requireAdminPage` / `requireAdminAction` / `ADMIN_SECRET`  
**Dashboard:** `/admin/contact-intel` (standalone chrome, not Campaign OS shell)

This document is the drift lock. Later Cursor scripts must copy its phase boundaries, allowed files, forbidden work, and exit tests. Do not invent a second contact system, a second database, or a C: scratch path.

---

## 0. Vision (locked)

Create one private contact library that can ingest every spreadsheet, and later every authorized local folder, Google Drive, Google Contacts account, and Gmail account, into a single evolving profile per person.

**First retrieval that matters:** email addresses and phone numbers. Names help operators recognize people. Addresses, tags, and custom fields come after the email/phone pipeline is trusted.

For every person the system must answer:

- Who is this?
- Which emails and phones do we have?
- Where did each value come from?
- What is new, updated, invalid, or in conflict?
- Are two records probably the same person? (review, never reckless merge)

**Core promise of the hours-MVP:** upload a previously unseen CSV or XLSX, map its columns without engineering help, preview the effect, commit, then search by email, phone, or name.

---

## 1. Phase 0 reconnaissance (done 2026-08-13)

| Fact | Actual RedDirt convention |
|------|---------------------------|
| App | Next.js App Router in `RedDirt/` |
| DB | Prisma + Postgres; `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`, schemas `public` + `auth` |
| Env | `RedDirt/.env` + `RedDirt/.env.local` (gitignored). Do not commit. Do not copy values into docs. |
| Commands | Always `cd H:\SOSWebsite\RedDirt-contact-intel` then `node scripts/run-with-h-drive-env.cjs …`. Cache/temp: `H:\SOSWebsite\.local\` |
| Migrate | `npm run stack:migrate` (generate + migrate deploy + status) |
| Auth | `src/lib/admin/require-admin.ts`; local trusted host may skip passphrase |
| Actor | `getAdminActorUserId()` via `ADMIN_ACTOR_USER_EMAIL` |
| Spreadsheet parser | `xlsx` already in `package.json`; CSV can be parsed in-process |
| Email normalize | `src/lib/communications/email-address.ts` → `normalizeEmail` |
| Phone normalize | `src/lib/communications/phone.ts` → 10-digit US-centric |
| Existing email CSV import | `/admin/workbench/email-command-center/imports` → `EmailContactProfile` |
| Why not reuse that import | It **requires email**. Phone-only rows are invalid. Column names are hardcoded. Profiles are email-primary. |
| Existing `RelationalContact` | Volunteer-owned organizing graph (power-of-5). Do **not** bulk-load lists into it. |
| Existing `User` | CRM / login identity with unique email. Do **not** create a User per imported row. |
| Existing Google models | `GoogleContactRecord`, `ExternalIngestRun`, `CommunicationIdentity` — later phases may *link*, not replace this library. |
| Standalone UI | New route group **outside** `src/app/admin/(board)/` so it does not load Campaign OS nav |
| Latest migration before this packet | `20260813120000_campaign_event_canonical_lifecycle` |
| This packet migration | `20260813180000_contact_intelligence_v1` |

---

## 2. Hard rules (every phase)

1. **H: only.** No `npm install` / `npx` / `tsx` except through `scripts/run-with-h-drive-env.cjs`. Temp/cache stay in `H:\SOSWebsite\.local\`.
2. **RedDirt lane only.** No ajax, phatlip, countyWorkbench, sos-public.
3. **No deletes** of production data, no repo moves, no template extraction.
4. **No secrets** in docs, logs, commits, or chat.
5. **No real PII** in tests — use `alex@example.com`, `5015550100`.
6. **No outbound communication** from this product. Import is not consent to email or text.
7. **Do not write** imported rows into `EmailContactProfile`, `RelationalContact`, `User`, or `VoterRecord` in v1.
8. **Do not auto-merge** when an email points at person A and a phone points at person B.
9. **Names never merge people.**
10. **Original row values are always kept** (`rawJson` + `originalValue`).
11. Extra columns that are not mapped stay in `rawJson`. Addresses, tags, and governed custom fields are Phase 5 enrichment and never identity keys.
12. One phase per Cursor script. No drive-by refactors, dependency upgrades, visual redesigns, or later-phase schema.

---

## 3. Hours-MVP identity rules

An imported row must contain **at least one valid email or one valid phone**.

| Rule | Behavior |
|------|----------|
| Email | trim + lowercase via `normalizeEmail`; keep original |
| Phone | Import uses `normalizeContactIntelPhone` (10-digit US or `+1`); keep original. Does not take the last 10 digits of longer junk. |
| Multiple email/phone columns | all collected onto one person |
| No matching identifiers | create `ContactIntelPerson` |
| All matching identifiers belong to one person | enrich that person (add missing methods; fill empty names) |
| Email → A and phone → B | **CONFLICT** — do not commit that row onto either person |
| Same file re-imported | methods unique on `(kind, normalizedValue)` so duplicates update, they do not clone |
| Unmapped extra columns | stored in `rawJson` only |

---

## 4. Canonical v1 schema (implemented)

| Model | Role |
|-------|------|
| `ContactIntelPerson` | Unified individual |
| `ContactIntelMethod` | One email or phone (`kind` + `normalizedValue` unique) |
| `ContactIntelImportJob` | One upload + mapping + stats |
| `ContactIntelSourceRow` | Untouched source row + mapped extraction |
| `ContactIntelConflict` | Identifier collision for operator review |

Core mapping targets: `email`, `phone`, `full_name`, `first_name`, `last_name`, `address`, `city`, `state`, `zip`, `tag`, `custom:<key>`, `ignore`.

---

## 5. Build phases

### Phase 1 — Database foundation (hours-MVP)

**Goal:** Additive Prisma models exist on the existing RedDirt database.

**Allowed:** `prisma/schema.prisma`, `prisma/migrations/20260813180000_contact_intelligence_v1/`, this docs folder.

**Forbidden:** editing Email Command Center import, RelationalContact, User identity fields, Google ingest.

**Steps:**

1. Add CONTACT-INTEL-1.0 models + User relation `contactIntelImportJobsCreated`.
2. Add migration `20260813180000_contact_intelligence_v1`.
3. `npm run stack:migrate`.

**Exit:** `prisma migrate status` reports the new migration applied. Prisma client has `contactIntelPerson`.

**Stop if:** migrate fails twice, or migration timestamp would reorder existing migrations.

---

### Phase 2 — Ingestion engine (hours-MVP)

**Goal:** Parse CSV/XLSX, map columns, normalize, match, preview, commit, stay idempotent.

**Allowed:** `src/lib/contact-intel/**`, `scripts/verify-contact-intel-normalize.ts`, `package.json` script only if needed.

**Steps:**

1. Parse CSV text and first-sheet XLSX from an in-memory buffer (no C: tempfile).
2. Guess mapping from header names; operator can override.
3. Extract emails/phones/names; extra columns remain in `rawJson`.
4. Validate: require email and/or phone.
5. Match using existing methods + in-file first-seen identifiers.
6. Preview counts: new / update / invalid / conflict / skipped.
7. Commit in chunks; unique methods prevent clones.

**Exit:** synthetic CSV with two emails, one phone-only row, one invalid row, and one email+phone conflict produces the expected statuses. Re-commit of the same file does not create duplicate methods.

**Stop if:** xlsx cannot parse without a new dependency, or Prisma unique constraint is missing.

---

### Phase 3 — Import dashboard (hours-MVP)

**Goal:** Operator can upload → map → preview → commit from a standalone page.

**Allowed:** `src/app/admin/contact-intel/**`, `src/app/admin/contact-intel-actions.ts`.

**Route:** `/admin/contact-intel` (outside `(board)`).

**Steps:**

1. Layout with `requireAdminPage` and a short header (Library / Import).
2. Upload CSV or XLSX (max 8MB, max 20_000 rows).
3. Mapping UI: one select per source column.
4. Preview table + counts.
5. Commit button (disabled until previewed; blocked rows stay out of people).

**Exit:** a browser pass on localhost can complete one import without Campaign OS chrome.

**Stop if:** admin auth rejects local host unexpectedly, or upload writes to C:\Temp.

---

### Phase 4 — Retrieval (hours-MVP)

**Goal:** Search the library by email, phone, or name and open a person with all methods + source rows.

**Allowed:** same dashboard routes + `src/lib/contact-intel/queries.ts`.

**Exit:** search finds the synthetic person by email, by 10-digit phone, and by last name.

---

### Phase 5 — MVP hardening (Steve override, 2026-08-13)

**Goal:** Make the existing upload → mapping → preview → commit → search path safe for representative CSV/XLSX files. No new product capabilities.

**Status:** Implemented in this pass. Automated checker is isolated (no live `DATABASE_URL` writes).

**Allowed:** fixture tests, import limits, safe parse, commit transaction/idempotency, operator guide, minor UI clarity.

**Forbidden:** addresses, tags, custom fields, disk/Drive/Gmail, fuzzy name merge, conflict merge UI, writes into other identity tables, new DB/ORM/auth.

**Confirmed limits:** 8MB, 20,000 data rows, `.csv`/`.xlsx`/`.xls`, first sheet only, sanitized filenames, duplicate headers rejected.

**Confirmed transaction behavior:** upload job+rows, preview staging, and commit people/methods/conflicts each run in `prisma.$transaction`. Commit failure marks the job `FAILED` and does not keep partial people/methods from that attempt.

**Tests added:** `scripts/verify-contact-intel-hardening.ts` (`npm run contact-intel:harden-check`) plus existing `contact-intel:normalize-check`.

**Remaining limitations:** phone extensions unsupported; preview writes staging only (not the contact graph); no live-DB integration tests; no merge UI.

**Operator guide:** `docs/contact-intelligence/OPERATOR_GUIDE.md`

### Phase 5b — Schema expansion (addresses, tags, custom fields)

**Goal:** Map extra spreadsheet columns onto existing people without changing email/phone identity.

**Status:** Implemented this pass. Migration `20260813223000_contact_intelligence_schema_expansion`.

**Models:** `ContactIntelAddress`, `ContactIntelTag`, `ContactIntelPersonTag`, `ContactIntelCustomFieldDefinition`, `ContactIntelCustomFieldValue`.

**Address dedup:** SHA-256 of `normalizedLine|normalizedCity|normalizedState|normalizedPostal` per person. Partial addresses allowed. Not an identity key.

**Tags:** split on comma/semicolon only; key is lowercase collapsed text; first-seen display name kept.

**Custom fields:** `custom:<key>` with key `lowercase_alnum`; type TEXT; one current value per person+definition; earlier values remain on source rows.

**Preview:** staging + plan only. Does not create tags, definitions, addresses, joins, or values.

**Forbidden:** Google, local disk, outbound comms, rewriting v1 match rules.

**Exit:** a synthetic CSV and XLSX can be previewed, classified, committed, retrieved by email/phone, audited to original rows, and re-imported without duplicate people/methods; a conflicting email/phone row stays unmerged; a failed commit leaves no partial contact data.

---

### Phase 6 — Local folder discovery

**Goal:** Scan operator-selected folders on H: (never C: system dirs) for likely contact files; preview; require approve-to-ingest.

**Forbidden:** scanning without an explicit folder list; writing discovered files to C:; auto-commit.

**Cursor script:** `docs/contact-intelligence/CURSOR_SCRIPT_PHASE_06_LOCAL_DISCOVERY.md`

---

### Phase 7 — Google Drive (multiple accounts)

**Goal:** Connect Drive accounts with least privilege; discover candidate files; reuse Phase 2 mapping/commit.

**Forbidden:** broad Drive write scopes; auto-ingest; storing refresh tokens in git.

**Cursor script:** `docs/contact-intelligence/CURSOR_SCRIPT_PHASE_07_GOOGLE_DRIVE.md`

---

### Phase 8 — Google Contacts (multiple accounts)

**Goal:** Ingest **saved** contacts first (not Other contacts, not Gmail participants).

**Forbidden:** treating inferred Gmail participants as trusted contacts.

**Cursor script:** `docs/contact-intelligence/CURSOR_SCRIPT_PHASE_08_GOOGLE_CONTACTS.md`

---

### Phase 9 — Opt-in Gmail participant discovery

**Goal:** Derive email identities from Gmail as **inferred** until reviewed.

**Forbidden:** auto-creating trusted contacts; any send.

**Cursor script:** `docs/contact-intelligence/CURSOR_SCRIPT_PHASE_09_GMAIL_INFERRED.md`

---

## 6. Hours-MVP verification commands

From `H:\SOSWebsite\RedDirt-contact-intel`:

```bash
node scripts/run-with-h-drive-env.cjs npm run stack:migrate
node scripts/run-with-h-drive-env.cjs npm run contact-intel:normalize-check
node scripts/run-with-h-drive-env.cjs npm run contact-intel:harden-check
node scripts/run-with-h-drive-env.cjs npm run typecheck
node scripts/run-with-h-drive-env.cjs npm run dev
```

Open: `http://localhost:3000/admin/contact-intel`

---

## 7. What this first release will not do

- Local disk crawler (Phase 6)
- Google Drive / Contacts / Gmail ingest
- Merge UI for conflicts (conflicts are flagged and left uncommitted)
- Linking into `User` / `RelationalContact` / `EmailContactProfile` / `VoterRecord`
- Any email or SMS send

---

## 8. Cursor script template (copy into each later phase file)

```text
Active lane: RedDirt (worktree H:\SOSWebsite\RedDirt-contact-intel)
Branch: feat/contact-intelligence-v1
Phase: N — <title>
One objective: <one sentence>
Allowed paths: <list>
Forbidden: C: scratch; other lanes; EmailContactProfile bulk writes; sends; refactors; later-phase schema
Reuse: DATABASE_URL/DIRECT_URL, requireAdmin*, normalizeEmail, normalizePhone, xlsx, run-with-h-drive-env.cjs
Steps: numbered
Acceptance: numbered
Verify: exact commands
Stop if: assumption false, migrate fails twice, secrets appear
Completion report: files, migration, tests, limitations
```

---

## 9. Operator path after this pass

1. Run `npm run dev` from the contact-intel worktree (H: wrapper).
2. Open `/admin/contact-intel`.
3. Upload a CSV or XLSX.
4. Confirm column mapping (email / phone / names / ignore).
5. Preview counts.
6. Commit.
7. Search by email or phone.

Conflicts stay in the import job for later review. They do not create a merged person.
