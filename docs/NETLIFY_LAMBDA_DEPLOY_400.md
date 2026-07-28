# Netlify Lambda deploy 400 — operator note

**Symptom (recurring — latest 2026-07-28 ~23:44 CT):** Build completes; deploy stage fails uploading `___netlify-server-handler` with:

```text
Failed to create function: invalid parameter for function creation:
Invalid AWS Lambda parameters used in this request.
HTTP 400 on PUT /deploys/{deploy_id}/functions/{name}
```

Site: **kgrappe** · Site ID: `e952be4a-3291-492c-9ba2-f31fd23cdede` (from local `.netlify/state.json`)

---

## What this usually is

1. **Netlify platform / feature-flag rollout** — same generic message on Next.js OpenNext sites where staff must **exclude the site from a backend rollout** ([Netlify forums](https://answers.netlify.com/t/invalid-aws-lambda-parameters-used-in-this-request-on-function-creation-faktorist2026-next-js-please-exclude-from-rollout/164582)). Build OK; only function creation fails.
2. **Unzipped function > ~250 MB** — sometimes the API returns a clearer “Unzipped size must be smaller…” message; RedDirt already runs `prune-server-handler` + `included_files` exclusions in `netlify.toml`.
3. **Lambda env / invalid params** — `AWS_*` env vars, oversized Functions-scoped secrets, or UI-pinned duplicate `@netlify/plugin-nextjs`. Guarded by `lambda-env-guard` and `npm run netlify:env:scopes:launch-minimal`.

The pasted log does **not** show an unzipped-size detail → prioritize (1) and (3).

**2026-07-28 note:** Same HTTP 400 after Pass 2 transcript pipeline landed (`be1b14f4`). Build OK; only function upload fails. `google-auth-library` remains excluded via `included_files`. Added exclusions for `data/campaign-media/**` and `data/integrations/**` so transcript workspace/OAuth seal files cannot inflate the handler. This does **not** prove a size root cause — still treat platform rollout + Functions-scoped env as primary.

---

## Operator checklist (no secrets in chat)

1. Confirm Netlify **Base directory** is `RedDirt` (if monorepo) and Publish is empty / `.next` under base — not monorepo root.  
2. Confirm **no UI-pinned** old `@netlify/plugin-nextjs` alongside `netlify.toml`’s unpinned plugin.  
3. Confirm **no `AWS_`-prefixed** site env vars.  
4. Run **`npm run netlify:env:scopes:launch-minimal`** (or documented env-scope script) so heavy secrets are Builds-only, not Functions.  
5. Clear cache + redeploy once.  
6. If still failing with identical code that previously deployed: **open Netlify Support / helpdesk** with site ID + deploy ID and ask for exclusion from the Lambda/new-builds rollout (standard resolution in 2026 forum threads).

---

## Out of scope for Track C / media registry

This deploy failure does **not** reopen homepage video canon or authorize Track C personality implementation. Continue ingesting videos into the Campaign Media Registry while production deploy is unblocked separately.
