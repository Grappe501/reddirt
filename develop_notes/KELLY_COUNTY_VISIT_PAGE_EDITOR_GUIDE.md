# Kelly Across Arkansas — Editor Guide (Steve)

Pass 1 editing is done by changing **one typed data file**. No admin dashboard.

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
