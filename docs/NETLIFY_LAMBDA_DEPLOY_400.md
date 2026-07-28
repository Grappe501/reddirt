# Netlify Lambda deploy 400 — operator note

**Symptom (recurring — latest 2026-07-28 ~08:52 CT):** Build completes; deploy stage fails uploading `___netlify-server-handler` with:

```text
Failed to create function: invalid parameter for function creation:
Invalid AWS Lambda parameters used in this request.
HTTP 400 on PUT /deploys/{deploy_id}/functions/{name}
```

Site: **kgrappe** · Site ID: `e952be4a-3291-492c-9ba2-f31fd23cdede` (from local `.netlify/state.json`)

---

## Verdict (2026-07-28)

**Stop retrying clear-cache deploys.** Local checks already show:

- `npm run netlify:env:scopes:launch-minimal:dry` → **0 build-only leaks**, 30 vars unchanged
- Failure message has **no** “Unzipped size must be smaller…” detail
- Build OK; only `___netlify-server-handler` creation fails

This matches the 2026 Netlify **new-builds / Lambda backend rollout** class of bugs. Staff fix is **exclude the site from the rollout** — see:

- https://answers.netlify.com/t/invalid-aws-lambda-parameters-used-in-this-request-on-function-creation-faktorist2026-next-js-please-exclude-from-rollout/164582
- https://answers.netlify.com/t/invalid-aws-lambda-parameters-on-function-creation-site-cvsharp-please-exclude-from-new-builds-rollout/165165

### Copy-paste for Netlify Support / Forums

```text
Site: kgrappe
Site ID: e952be4a-3291-492c-9ba2-f31fd23cdede
Stack: Next.js 15 + @netlify/plugin-nextjs (unpinned in netlify.toml) + custom prune-server-handler + lambda-env-guard

Every production deploy fails at Deploying with:
Failed to create function: invalid parameter for function creation: Invalid AWS Lambda parameters used in this request.
Failed to upload file: ___netlify-server-handler
HTTP 400 on PUT /deploys/{deploy_id}/functions/{name}

Build compiles successfully; only Lambda function creation fails.
We already:
- Confirmed no AWS_-prefixed env vars
- Ran launch-minimal env scope enforcement (0 leaks remaining)
- Excluded large data/public trees via functions.___netlify-server-handler.included_files
- Use Node 22; no NODE_OPTIONS in Netlify UI (heap only in netlify-build.sh)

Please exclude kgrappe from the new-builds / Lambda backend rollout (same resolution as forum topics 164582 / 165165 / 146976).
```

Paste the **failed deploy ID** from the Netlify UI into that message before sending.

---

## What this usually is

1. **Netlify platform / feature-flag rollout** — same generic message on Next.js OpenNext sites where staff must **exclude the site from a backend rollout**. Build OK; only function creation fails.
2. **Unzipped function > ~250 MB** — sometimes the API returns a clearer “Unzipped size must be smaller…” message; RedDirt already runs `prune-server-handler` + `included_files` exclusions in `netlify.toml`.
3. **Lambda env / invalid params** — `AWS_*` env vars, oversized Functions-scoped secrets, or UI-pinned duplicate `@netlify/plugin-nextjs`. Guarded by `lambda-env-guard` and `npm run netlify:env:scopes:launch-minimal`.

The pasted logs do **not** show an unzipped-size detail → prioritize (1). Env scopes already verified clean → (3) is ruled out for site-managed vars.

**Note:** One 08:52 CT resolved-config dump omitted `!data/campaign-media/**` and `!data/integrations/**` that exist on current feature-branch `netlify.toml` (`b82cecfc`). That suggests the failing deploy may be from an older production commit — still irrelevant if the platform rejects handler creation with the generic 400.

---

## Operator checklist (no secrets in chat)

1. Confirm Netlify **Base directory** is `RedDirt` (if monorepo) and Publish is empty / `.next` under base — not monorepo root.  
2. Confirm **no UI-pinned** old `@netlify/plugin-nextjs` alongside `netlify.toml`’s unpinned plugin.  
3. Confirm **no `AWS_`-prefixed** site env vars / no UI `NODE_OPTIONS`.  
4. Run **`npm run netlify:env:scopes:launch-minimal:dry`** — expect 0 leaks (already verified 2026-07-28).  
5. **Do not** burn more clear-cache redeploys expecting a different result.  
6. **Open Netlify Support / helpdesk** with site ID + deploy ID; ask for exclusion from the Lambda/new-builds rollout.

---

## Out of scope for Track C / media registry / homepage slices

This deploy failure does **not** reopen homepage video canon, authorize Track C personality, or block Slice 2 photo work on the feature branch. Production smoke remains blocked until Netlify excludes the site or the rollout is fixed.
