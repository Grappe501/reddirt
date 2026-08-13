# Netlify handler 250 MB fix — Arkansas Visits deploy

**Date:** 2026-08-06 (updated 2026-08-12)  
**Site:** kgrappe (`e952be4a-3291-492c-9ba2-f31fd23cdede`)  
**Error:** `The function exceeds the maximum size of 250 MB` on `___netlify-server-handler`

## Cause

Build succeeded and the prune plugin could report the **handler directory** under the fail threshold, but Netlify upload still exceeded AWS Lambda’s 250 MB unzipped cap.

OpenNext (`@netlify/plugin-nextjs`) writes `includedFiles: ["**"]` with `includedFilesBasePath` = the handler directory. Netlify’s deploy merge **drops `includedFilesBasePath`**. zip-it’s `none` bundler then globs `**` from the **site root**, so the upload is the repo (minus a few excludes) — well over 250 MB — even when the pruned handler directory itself is under the fail threshold.

Toml `included_files` **replaces** the JSON list (resolved config shows toml only):

1. Exclusion-only lists → include-all-then-exclude from the site root.
2. No `included_files` + leftover JSON `**` → same site-root glob.
3. **Fix:** site-root **positive** globs for the handler directory only (no bare `**`).

## Fix (RedDirt only)

1. `netlify.toml` `included_files` = `.netlify/functions-internal/___netlify-server-handler/**` (and the `.netlify/functions/` twin). `node_bundler = "none"`.
2. Patch the JSON inside the handler directory to the same globs with `includedFilesBasePath` = site root.
3. Keep Netlify admin board whitelist empty on the public hub; drop `election-plan` / `volunteers` from the Lambda. Keep `(site)` public routes that the live site must SSR.
4. Plugin always logs `>>> prune-server-handler: …` so size is visible in the build log.

## Verify after deploy

- https://kgrappe.netlify.app/ → **THE PEOPLE RULE.**
- https://kgrappe.netlify.app/about → 200
- https://kgrappe.netlify.app/priorities → 200
- Deploy log shows prune summary with `manifest patched (handler glob, no **)` and no `function exceeds the maximum size of 250 MB`
