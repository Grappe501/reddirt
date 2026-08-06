# Arkansas Visits — standalone static publish

Bypasses the RedDirt Next.js `___netlify-server-handler` 250 MB deploy cap.

## What it is

Static site in `standalone/arkansas-visits/`:

- Same public ledger (generated from `src/data/kelly-county-visits`)
- Filters, county grid, summary stats
- Links CTAs back to `kgrappe.netlify.app`

## Regenerate data

From repo root after ledger edits:

```bash
npm run visits:standalone
```

Commits `standalone/arkansas-visits/data/public-visits.json`.

## Deploy (new Netlify site)

1. Create a Netlify site linked to `Grappe501/reddirt` (or drag-drop the folder).
2. **Base directory:** `standalone/arkansas-visits`
3. **Build command:** leave as `echo 'arkansas-visits static'` (or empty)
4. **Publish directory:** `.`
5. Deploy — no Next plugin, no Lambda.

Optional: point a path/domain (e.g. `visits.kelly…` or temporary `*.netlify.app`) and later 301 `/arkansas-visits` on the main site once that deploy works again.
