# Contact Intelligence — operator guide

Private library for emails and phones ingested from spreadsheets. Nothing is sent. Import is not consent to email or text.

**Do not upload a real contact file into an unintended RedDirt environment.** Confirm you are on the worktree and database you mean to use before choosing a file.

---

## 1. Start the H: worktree application

From `H:\SOSWebsite\RedDirt-contact-intel` (not the dirty `H:\SOSWebsite\RedDirt` checkout):

```powershell
node scripts/run-with-h-drive-env.cjs npm run dev
```

Uses the existing RedDirt `.env` / `.env.local` and PostgreSQL database. Cache and temp stay on `H:\SOSWebsite\.local\`.

Standalone dashboard (separate repo): `H:\SOSWebsite\data-upload` on port 3005.

## 2. Open the library

- RedDirt chrome: `http://localhost:3000/admin/contact-intel`
- Requires existing admin authentication (`requireAdminPage` / local trusted host).

## 3. Supported formats and limits

| Rule | Value |
|------|--------|
| Extensions | `.csv`, `.xlsx`, `.xls` only |
| Size | 8MB maximum |
| Rows | 20,000 data rows maximum |
| Sheets | First worksheet only |
| Blank trailing rows | Omitted (not stored as contacts) |
| Duplicate headers | Rejected — rename columns and retry |

Formulas are read as cached display values. Spreadsheet structure is not executed as code.

## 4. Mapping fields

After upload, assign each source column:

- `email`, `phone`, `full_name`, `first_name`, `last_name`
- `address`, `city`, `state`, `zip` — assembled into one address per row
- `tag` — comma/semicolon-separated values (`Volunteer; Donor, Pulaski County`)
- `custom field` — pick an existing definition or create one (`employer` / Employer)
- `ignore`

Addresses, tags, and custom fields never match or merge people. Unmapped columns stay on the original source row (`rawJson`).

**Address dedup:** same person + same normalized line/city/state/ZIP fingerprint does not clone. Distinct fingerprints stay as separate addresses. Partial addresses are kept.

**Tags:** `Volunteer` and ` volunteer ` reuse one tag. Re-import does not clone the person-tag link.

**Custom fields:** `Employer` → key `employer`. Re-import reuses the definition. The person page shows the current value; earlier values remain on source rows. Blank cells create no value.

Import is not consent to email or text.

## 5. Default-country phone behavior

Import accepts:

- 10-digit US numbers (any common punctuation)
- 11-digit numbers that start with `1` (E.164 `+1…`)

Import does **not** accept:

- Shorter numbers
- Longer junk (it will not silently take the last 10 digits)
- Extensions (`5015550100 x123` is invalid as a phone)

Original formatting is stored next to the normalized 10-digit value.

## 6. Preview classifications

| Label | Meaning |
|-------|---------|
| New | No existing person matches these identifiers |
| Update | Identifiers belong to one existing person, or repeat a row already seen in this file |
| Invalid | No valid email or phone (name-only and blank-identifier rows) |
| Conflict | Email matches one person and phone matches another |

Preview classifies rows and stores that staging on the import job. It does **not** create people, methods, addresses, tags, custom-field definitions, or values. Repeating preview does not add library contacts.

If the library changes between preview and commit, commit re-classifies against current identifiers and stores the updated counts.

## 7. Commit behavior

Commit writes people, methods, provenance, and conflicts in one database transaction.

- Success: job status `COMMITTED`, counts stored on the job (including import ID).
- Failure: job status `FAILED`, error shown on the job page. People and methods from that attempt are not left behind. Preview again, then retry.

Invalid and conflict rows are not written onto people.

## 8. Search behavior

On `/admin/contact-intel`, search uses:

- Exact normalized email (`Alex@Example.com` → `alex@example.com`)
- Phone with or without punctuation (`(501) 555-0100` or `5015550100`)
- Partial match on original or normalized method values
- Name (display, first, last)

Person detail lists every method (original + normalized) and every attached source filename / import, including ignored columns on the original row.

## 9. Re-import behavior

Uploading the same file again creates a **new** import job. Existing emails and phones match the same people (`UPDATE`). Unique `(kind, normalizedValue)` prevents duplicate methods. Source rows for the new job are stored for audit.

## 10. Conflict behavior

If one row’s email is already on person A and its phone is already on person B:

- The row is `CONFLICT`
- A and B stay separate
- No automatic merge
- There is no merge UI in this release

## 11. Ignored columns

They remain on the source row and appear on the person detail audit line. They are not copied into a custom-field schema in this phase.

## 12. Safe troubleshooting

1. Confirm you are in `H:\SOSWebsite\RedDirt-contact-intel` and the URL you expect.
2. Check the import job status and Import ID on the job page.
3. Read the row-level Notes column for invalid/conflict reasons.
4. If commit failed, do not assume people were created. Search the library for the synthetic values you used.
5. Split files over 8MB or 20,000 rows.
6. Rename duplicate headers.
7. Do not paste file contents or environment values into tickets or chat.

## 13. Known limitations

- Custom fields are text-only in this release. There is no separate schema-admin app.
- Phone extensions are not supported.
- Only the first spreadsheet sheet is imported.
- Preview updates staging rows on the job (not the contact graph).
- Persistence / transaction tests are not run against the live RedDirt database from the automated checker.
- No conflict merge UI.
- No local-drive, Google Drive, Google Contacts, or Gmail ingest.
- Does not write `User`, `RelationalContact`, `EmailContactProfile`, or `VoterRecord`.

## 14. Recovery / escalation

- Failed commit: job is `FAILED`; retry after preview. If the same file keeps failing, keep the Import ID and the error sentence only (no file dump).
- Accidental upload into the wrong environment: stop. Do not keep importing. Escalate with the Import ID, not the spreadsheet.
- Suspected duplicate people with different identifiers: leave them unmerged; that is intended until a later review tool exists.

## 15. Environment warning

This worktree shares the existing RedDirt PostgreSQL database. A committed import is real library data. Use synthetic fixtures (`alex@example.com`, `5015550100`) unless you intend to load production contacts into this database.
