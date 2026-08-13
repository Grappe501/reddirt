# Netlify handler 250 MB fix — Arkansas Visits deploy

**Date:** 2026-08-06 (updated 2026-08-12)  
**Site:** kgrappe (`e952be4a-3291-492c-9ba2-f31fd23cdede`)  
**Error:** `The function exceeds the maximum size of 250 MB` on `___netlify-server-handler`

## Cause

Build succeeded and the prune plugin could report the **handler directory** under the fail threshold, but Netlify upload still exceeded AWS Lambda’s 250 MB unzipped cap.

OpenNext (`@netlify/plugin-nextjs`) writes:

```json
{
  "config": {
    "nodeBundler": "none",
    "includedFiles": ["**"],
    "includedFilesBasePath": "<handler dir>"
  }
}
```

`**` is correct **only** when `includedFilesBasePath` is the pruned handler directory.

Two later mistakes re-inflated the upload:

1. **`netlify.toml` `[functions."___netlify-server-handler"].included_files`** — those globs are **site-root** relative and **replace** the OpenNext manifest. Exclusion-only lists made zip-it pull repo `node_modules` / `.next` (minus a few packages) past 250 MB.
2. **`patchServerHandlerManifest` looked at the wrong JSON path** (sidecar next to the handler) and then **stripped `**`**, leaving exclusion-only config with no handler base path.

## Fix (RedDirt only)

1. **Do not set `included_files` in `netlify.toml` for this function.** Keep `node_bundler = "none"`.
2. **Patch the JSON inside the handler directory.** Restore `includedFiles: ["**", …handler-relative exclusions]` and `includedFilesBasePath` = handler dir.
3. Keep Netlify admin board whitelist empty on the public hub; drop `election-plan` / `volunteers` from the Lambda. Keep `(site)` public routes that the live site must SSR.
4. Plugin always logs `>>> prune-server-handler: …` so size is visible in the build log.

## Verify after deploy

- https://kgrappe.netlify.app/ → **THE PEOPLE RULE.**
- https://kgrappe.netlify.app/about → 200
- https://kgrappe.netlify.app/priorities → 200
- Deploy log shows prune summary with `manifest patched (** + handler basePath)` and no `function exceeds the maximum size of 250 MB`
