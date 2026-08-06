# Netlify handler 250 MB fix — Arkansas Visits deploy

**Date:** 2026-08-06  
**Site:** kgrappe (`e952be4a-3291-492c-9ba2-f31fd23cdede`)  
**Error:** `The function exceeds the maximum size of 250 MB` on `___netlify-server-handler`

## Cause

Build succeeded; deploy upload of `___netlify-server-handler` exceeded AWS Lambda’s 250 MB unzipped cap. Existing prune plugin was present but still left too much admin SSR + repo trees in the upload for `kelly_sos_ops`.

## Fix (RedDirt only)

1. Shrink Netlify admin board whitelist in `scripts/prune-netlify-server-handler.cjs` to core ops boards.
2. Drop heavy / nonessential app trees from the handler (keep `(site)` root and **`/arkansas-visits`**).
3. Exclude Volunteer Presentation, develop_notes, field-structure, media vaults, caches, and heavy node tooling from `netlify.toml` + manifest exclusions.

## Verify after deploy

- https://kgrappe.netlify.app/arkansas-visits → 200  
- Homepage still 200  
- Netlify deploy log shows prune summary under 220 MB staging / under 250 MB deploy
