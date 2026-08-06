# Netlify handler 250 MB fix — Arkansas Visits deploy

**Date:** 2026-08-06  
**Site:** kgrappe (`e952be4a-3291-492c-9ba2-f31fd23cdede`)  
**Error:** `The function exceeds the maximum size of 250 MB` on `___netlify-server-handler`

## Cause

Build succeeded and the prune plugin could report the **handler directory** under the fail threshold, but Netlify upload still exceeded AWS Lambda’s 250 MB unzipped cap.

Root cause: `patchServerHandlerManifest` set `includedFiles: ["**", …exclusions]`. With `@netlify/plugin-nextjs`, `"**"` re-pulls the **site root** into the function upload after prune, so deploy size ≫ measured handler size.

Secondary: admin SSR + heavy public server trees still need pruning for a healthy margin under 250 MB.

## Fix (RedDirt only)

1. **Stop writing `"**"` into the handler manifest.** Keep exclusion globs only (synced with `netlify.toml`).
2. Keep Netlify admin board whitelist minimal in `scripts/prune-netlify-server-handler.cjs`.
3. Drop heavy / nonessential app trees from the handler (keep `(site)` homepage + **`/arkansas-visits`** via existing drop-list).
4. Exclude vaults, caches, and heavy node tooling from `netlify.toml` + manifest exclusions.
5. Plugin always logs `>>> prune-server-handler: …` so size is visible in the build log.

## Verify after deploy

- https://kgrappe.netlify.app/arkansas-visits → 200  
- Homepage still 200  
- Deploy log shows prune summary and no `function exceeds the maximum size of 250 MB`
