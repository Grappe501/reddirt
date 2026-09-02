# Kelly Across Arkansas — Editor Guide (Steve)

Preferred path: use the **local Edit mode UI**. You can still edit the typed ledger file directly if needed.

## 0. Local Edit mode (recommended)

```powershell
cd H:\SOSWebsite\RedDirt
npm run visits:edit
```

Open http://127.0.0.1:8765/

1. Review **Counties visited vs not visited** at the top
2. Open **Needs attention** for stops missing counties
3. **Click any stop** to open its drill-down page (`/stop/<id>`)
4. On the stop page: edit date/title/city/status/counties/notes, save, or **Add related stop** if the trip covered more places than the calendar
5. Use **Add stop** for a brand-new ledger row

The editor only listens on `127.0.0.1` (this machine). It is not a public admin page.

## 1. Canonical data file

```text
H:\SOSWebsite\RedDirt\src\data\kelly-county-visits\kelly-county-visits.ts
```

Supporting files (usually leave alone):

- `types.ts` — TypeScript shape
- `arkansas-counties.ts` — all 75 county spellings
- `selectors.ts` — public filtering + dynamic totals

## 2. Change a county

Find the stop by `date` / `title`. Edit the `counties` array using exact spellings from `arkansas-counties.ts`:

```ts
counties: ["Pulaski"],
```

If the stop was unresolved, also clear the review status:

```ts
status: "completed", // or "scheduled"
confidence: "confirmed",
```

## 3. Add a second or third county

```ts
counties: ["Bradley", "Drew"],
```

## 4. Add a missing stop

Copy the template at the bottom of `kelly-county-visits.ts` (`// COPY THIS BLOCK TO ADD A STOP`), paste a new object into the `kellyCampaignStops` array, and fill it in:

```ts
{
  id: "manual-2026-09-01-example-county-visit",
  date: "2026-09-01",
  title: "Original calendar heading goes here",
  publicTitle: "Optional cleaner public title",
  city: "City name",
  counties: ["Pulaski"],
  status: "scheduled",
  includeOnPublicPage: true,
  confidence: "confirmed",
  notes: "Internal only — not shown on the public page",
  sourceType: "manual",
},
```

Use a unique `id`. Keep `title` as the original calendar heading.

## 4b. Attach queue (next Jonesboro, etc.)

Some extras wait for a city or county before they should appear. They live in:

```text
src/data/kelly-county-visits/pending-attachments.json
```

Open items attach automatically when you **Add stop** in the local editor (`npm run visits:edit`) or via `addStop` in `scripts/apply-kelly-visit-edits.cjs` — if the new stop’s `city` or `counties` matches.

Example: **KLEK 102.5 FM interview** waits for the next public **Jonesboro** / **Craighead** stop, then creates a same-day companion row.

If you paste a stop into the ledger by hand, either use `addStop` or mark the queue item `attached` yourself so it does not fire twice.

## 5. Change scheduled → completed

```ts
status: "completed",
```

## 6. Hide a record from the public page

```ts
includeOnPublicPage: false,
```

Or set `status` to `private` / `canceled` / `declined` / `virtual` / `duplicate` (those statuses never appear publicly).

## 7. How unresolved counties appear

When `counties: []` on a public stop, the page shows:

```text
County assignment pending
```

Totals also count these under “County assignments pending.”

## 8. How dynamic totals are calculated

`selectors.ts` computes:

- unique completed counties
- % of 75
- completed public stop count
- upcoming public stop count
- needs-review / empty-county count

Do **not** hardcode totals in page copy.

## 9. Preview locally (H-drive session)

In PowerShell:

```powershell
$env:TEMP="H:\SOSWebsite\.local-ops\tmp"
$env:TMP="H:\SOSWebsite\.local-ops\tmp"
$env:npm_config_cache="H:\SOSWebsite\.local-ops\npm-cache"
cd H:\SOSWebsite\RedDirt
npm run dev
```

Open:

```text
http://localhost:3000/arkansas-visits
```

(`npm run dev` already wraps H-drive env via `scripts/run-with-h-drive-env.cjs`.)

## 10. Build and deploy safely

Validate:

```powershell
cd H:\SOSWebsite\RedDirt
npm run typecheck
npm run lint
npm run build
```

**Pass 1 rule:** do not push and do not deploy until Pass 2 merges the full Google Calendar inventory.

Nav label: **Across Arkansas** (Events menu + footer News & events).
