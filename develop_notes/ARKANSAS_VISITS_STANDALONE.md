# Arkansas Visits — standalone static publish

Bypasses the RedDirt Next.js `___netlify-server-handler` 250 MB deploy cap.

## GitHub to connect in Netlify

**Repository:** [https://github.com/Grappe501/reddirt](https://github.com/Grappe501/reddirt)

This is a **new Netlify site** (do not reuse the `kgrappe` site).

## Netlify site settings

| Setting | Value |
| --- | --- |
| Repository | `Grappe501/reddirt` |
| Branch | `main` (or the branch that has `standalone/arkansas-visits`) |
| Base directory | `standalone/arkansas-visits` |
| Build command | `echo 'arkansas-visits static'` |
| Publish directory | `.` |
| Next.js plugin | **Off** |

## What it publishes

Static site in `standalone/arkansas-visits/`:

- County visited / not visited math
- Completed, upcoming, and needs-attention stop lists
- Per-stop detail pages (`stop.html?id=…`)
- CTA links back to `kgrappe.netlify.app` (optional)

Staff **editing** stays local (`npm run visits:edit` on port 8877). Public Netlify is view-only.

## Regenerate after ledger edits

From repo root:

```powershell
cd H:\SOSWebsite\RedDirt
npm run visits:standalone
git add standalone/arkansas-visits
git commit -m "Update Arkansas Visits standalone data"
git push
```

Netlify will redeploy from the connected branch.
