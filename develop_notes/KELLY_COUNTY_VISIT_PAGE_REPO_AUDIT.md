# Kelly County Visit Page — Repository Audit (Pass 1)

**Date:** 2026-08-05  
**Workspace:** `H:\SOSWebsite`

## Selected repository

| Field | Value |
| --- | --- |
| Path | `H:\SOSWebsite\RedDirt` |
| Git remote | `https://github.com/Grappe501/reddirt.git` (`origin`) |
| Branch (at audit) | `fix/netlify-handler-250mb-volunteer-presentation` |
| Framework | Next.js (App Router) under `src/app` |
| Package manager | npm (`package-lock.json`) |
| Package name | `reddirt-site` |

## Evidence tying this repo to `kgrappe.netlify.app`

1. `.netlify/state.json` site ID: `e952be4a-3291-492c-9ba2-f31fd23cdede`
2. `docs/website/PUBLIC_SITE_LAUNCH_STATUS.md` names **Canonical URL (stuck):** `https://kgrappe.netlify.app` and that same site ID
3. `docs/deployment.md` documents the `kgrappe.netlify.app` certificate / hostname rules
4. Multiple develop_notes / ops reports probe production as `https://kgrappe.netlify.app`
5. Workaround site `kelly-sos-public` is documented as the **same RedDirt repo** with a cloned env (not a different application)

## Candidates considered

| Path | Why not selected |
| --- | --- |
| `H:\SOSWebsite\sos-public` | Dedicated lighter public package; **no git remote**; docs in RedDirt explicitly say `sos-public/` is **not** the active production public surface |
| `H:\SOSWebsite\stand-up-arkansas` | Different product (`stand-up-arkansas` Netlify publish) |
| `H:\SOSWebsite\Kelly-calendar` | Calendar ops lane, not the voter-facing campaign site |
| `H:\SOSWebsite\RedDirt-main-travel-ledger` | Travel/calendar mirror of RedDirt data, not the deployed public app |

## Public route structure (relevant)

- Site layout: `src/app/(site)/layout.tsx` + `SiteHeader` / `SiteFooter`
- Existing related routes: `/arkansas`, `/events`, `/about/journey`, `/from-the-road`
- Nav config: `src/config/navigation.ts`
- New Pass 1 route: `/arkansas-visits`

## Netlify configuration

- `netlify.toml` build: `bash scripts/netlify-build.sh`, publish `.next`, Next.js runtime plugin
- Linked site name in ops docs: **kgrappe**
- Deploy risk: recent Lambda upload **400** on `___netlify-server-handler` has blocked shipping newer homepage cuts; live `kgrappe` may still serve an older publish

## Older placeholder vs active surface

- **Linked deployment:** RedDirt → `kgrappe.netlify.app` (active Netlify site association)
- **Live content risk:** ops docs report the live URL can lag local/main polish (“A Secretary of State for Everyone” vs newer “Government That Works” spine)
- **`sos-public`:** parallel/isolated scaffold; not the Netlify site named `kgrappe`

## Deployment risks for Pass 1

- Do **not** push or deploy in Pass 1 (calendar inventory incomplete)
- Full RedDirt `next build` is heavy and DB-aware; use H-drive env wrappers already in npm scripts
- Avoid changing Netlify site linkage or env vars
- Keep feature isolated under `src/data/kelly-county-visits` + `src/components/kelly-county-visits` + one route
