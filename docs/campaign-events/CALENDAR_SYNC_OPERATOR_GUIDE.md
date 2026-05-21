# Calendar sync operator guide

## When to open the dashboard

`/admin/campaign-events/calendar-sync?month=YYYY-MM`

Use before month review if:

- Normalized JSON banner shows **stale**
- Many rows show **Not linked** or **Imported JSON only**
- Kelly lanes missing OAuth refresh token

## Read-only refresh sequence

Run from `RedDirt/` on a machine with `DATABASE_URL` and Google OAuth configured.

1. **Ensure calendar sources**
   ```bash
   npm run calendar:google:ensure
   ```

2. **Read Google into DB** (does not write to Google)
   ```bash
   npm run calendar:google:sync-kelly
   ```

3. **Re-seed ledger month** from normalized JSON (idempotent)
   ```bash
   npm run campaign-events:seed-month -- 2026-03
   ```
   Replace `2026-03` with the month under review.

4. **Verify truth counts**
   ```bash
   npm run campaign-events:verify-calendar-sync -- 2026-03
   ```

5. Reload **Calendar sync dashboard** and **Workbench** in the browser.

## What this does NOT do

- Does not promote events to official Google calendar
- Does not send approval emails
- Does not run `calendar:google:promote-approved` from Event OS UI

## Normalized JSON without Google

If only the workbook export is updated:

1. Regenerate `data/calendar-command-center/calendar-items.normalized.json` via your existing reconcile script.
2. Run `campaign-events:seed-month` for affected months.
3. Expect truth status **Imported JSON** until Google ingest matches ids.

## Website intake rows

Public schedule rows stay **Website only** until matched to a Google event id manually or via future promotion (Sprint 5).
