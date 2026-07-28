# Public website launch status (operator)

**Date:** 2026-07-28  
**Lane:** RedDirt  
**Canonical URL (stuck):** https://kgrappe.netlify.app  
**Workaround URL (new site):** https://kelly-sos-public.netlify.app  
**New site ID:** `addb3880-18e6-45f8-af9e-24b24e3d8e27`

---

## Bottom line

| Question | Answer |
|----------|--------|
| Is the public website down? | **No.** `kgrappe` returns HTTP 200. |
| Is the app broken locally? | **No.** Sandbox `http://127.0.0.1:3456/` serves Slice 1+2 homepage. |
| Can we ship Slice 1/2 to `kgrappe`? | **Not yet** — Netlify Lambda upload 400 on `___netlify-server-handler`. |
| Workaround in flight? | **Yes** — new site `kelly-sos-public` (same repo + env clone). Forum pattern: new site can escape the rollout stuck on the old site. |

---

## Sandbox proof (2026-07-28)

```text
npm run dev -- -p 3456
GET / → 200
Government That Works: true
Latest Campaign Photos: true
Meet Kelly: true
Draft section: false
A Secretary of State for Everyone: false
```

Local homepage is current (Slice 1 polish + Slice 2 photos). Failure is **Netlify deploy upload**, not Next.js compile of the public pages.

---

## What is live on kgrappe now

Last ready production deploy:

- Deploy ID: `6a6811aba8bf67ac5955c183`
- Branch: `main` @ `9f5f20d9`
- Published: ~2026-07-28 02:19 UTC

Older trust-funnel homepage (headline “A Secretary of State for Everyone”, Meet Kelly draft badge, **no** Latest Campaign Photos).

After ~05:20 UTC the same day, every new deploy errors with build exit code 2 — Steve’s pasted logs show the real cause is Lambda function creation on `___netlify-server-handler` (“Invalid AWS Lambda parameters”).

---

## Why new deploys fail on kgrappe

```text
Failed to create function: Invalid AWS Lambda parameters used in this request.
Failed to upload file: ___netlify-server-handler
HTTP 400
```

Ruled out:

- Env scope leaks (`netlify:env:scopes:launch-minimal:dry` → 0 leaks)
- GitHub quality gate (passes on the same commits)
- App homepage / Slice 1–2 code (sandbox 200)

Matches Netlify **new-builds / Lambda backend rollout**. Staff fix: exclude `kgrappe` (`e952be4a-3291-492c-9ba2-f31fd23cdede`). See `docs/NETLIFY_LAMBDA_DEPLOY_400.md`.

---

## Workaround: kelly-sos-public

Created 2026-07-28:

1. Site `kelly-sos-public` under account `grappe4arkansas`
2. Env cloned from `kgrappe` (scopes preserved by `env:clone`)
3. Git linked to `Grappe501/reddirt` · production branch = `feature/kelly-schedule-settlement-dashboard`
4. Build command / publish: `bash scripts/netlify-build.sh` / `.next`
5. First build failed in ~1 min — **env clone had not applied** (0 vars).
6. Silent clone `scripts/clone-netlify-env-silent.cjs` copied **29/30** keys (`DATABASE_URL` / `DIRECT_URL` nonempty).
7. Builds still fail in **~45–60s** with generic exit code 2 — including **`main` @ `9f5f20d9`** (the same commit that is live on `kgrappe`). So this is **not** Slice 1/2 code.
8. Deploy logs are **not** available via the open API (`/log` → 404). Steve must open a failed deploy in the Netlify UI and paste the last ~40 lines.

This early failure is a **different** class from `kgrappe`’s long-build → Lambda 400. Until the UI log is pasted, do not assume Support exclusion alone fixes the new site.

**Ops:** Rotate `ADMIN_SECRET` if it was ever printed by `netlify env:list --plain`; do not commit secret values.

---

## Do not

- Clear-cache redeploy `kgrappe` expecting a different result
- Treat this as a homepage code bug
- Open Track C or expand scope while waiting
- Commit secrets or print env values
