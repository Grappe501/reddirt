# Kelly Across Arkansas — Pass 1 Build Report

**Date:** 2026-08-05  
**Pass:** Discovery + scaffold (calendar inventory Pass 2 still required before deploy)

## Repository selected

| Field | Value |
| --- | --- |
| Path | `H:\SOSWebsite\RedDirt` |
| Remote | `https://github.com/Grappe501/reddirt.git` |
| Netlify site | `kgrappe` / `kgrappe.netlify.app` (site ID `e952be4a-3291-492c-9ba2-f31fd23cdede`) |
| Branch | `fix/netlify-handler-250mb-volunteer-presentation` |
| Framework | Next.js App Router |

See `KELLY_COUNTY_VISIT_PAGE_REPO_AUDIT.md` for full evidence.

## Files created

- `src/data/kelly-county-visits/types.ts`
- `src/data/kelly-county-visits/arkansas-counties.ts`
- `src/data/kelly-county-visits/kelly-county-visits.ts`
- `src/data/kelly-county-visits/selectors.ts`
- `src/data/kelly-county-visits/index.ts`
- `src/components/kelly-county-visits/VisitSummaryStats.tsx`
- `src/components/kelly-county-visits/CountyProgressGrid.tsx`
- `src/components/kelly-county-visits/StopList.tsx`
- `src/components/kelly-county-visits/VisitInviteCta.tsx`
- `src/app/(site)/arkansas-visits/page.tsx`
- `develop_notes/KELLY_COUNTY_VISIT_PAGE_REPO_AUDIT.md`
- `develop_notes/KELLY_COUNTY_VISIT_LOCAL_EVIDENCE_AUDIT.md`
- `develop_notes/KELLY_COUNTY_VISIT_PAGE_EDITOR_GUIDE.md`
- `develop_notes/KELLY_COUNTY_VISIT_PAGE_BUILD_REPORT.md`
- Generator (H-drive ops only, not app runtime): `H:\SOSWebsite\.local-ops\scripts\generate-kelly-county-visits.cjs`

## Files modified

- `src/config/navigation.ts` — Events submenu + footer link **Across Arkansas** → `/arkansas-visits`
- `src/lib/civic-intelligence/env/loadPublicdataEnv.ts` — removed unnecessary regex `/s` flag that blocked whole-repo `tsc` / `next build` typecheck (pre-existing)

## Local evidence found

Primary seeds: county-visit-log, arkansas_county_visits_FINAL.xlsx (dates+counties only), locked-events-steve.json, calendar-items.normalized.json (county-touch), calendar-presence.json. Details in `KELLY_COUNTY_VISIT_LOCAL_EVIDENCE_AUDIT.md`.

## Seed counts (Pass 1)

| Metric | Count |
| --- | ---: |
| Total records in canonical file | 330 |
| Public-facing stops | 188 |
| Completed public stops | 171 |
| Scheduled public stops | 17 |
| Needing county review | 20 |
| Unique visited counties (from public completed data) | 49 / 75 (65.3%) |

## Route

```text
/arkansas-visits
```

Public title: **Kelly Across Arkansas**

## Navigation

Added restrained **Across Arkansas** link under Events (primary nav) and News & events (footer). Did not add a new top-level primary tab.

## Validation

| Command | Result |
| --- | --- |
| `node …/tsc --noEmit` (via H-drive wrapper) | **Pass** after `/s` flag fix |
| `next lint` on new/edited feature files | **Pass** (no warnings/errors) |
| `next build` first attempt | Compile **succeeded** (~41 min); failed later on pre-existing `/s` type error |
| `next build` retry after fix | **Pass** — `/arkansas-visits` in route table (1.73 kB); log `H:\SOSWebsite\.local-ops\logs\kelly-visits-build2.log` |

## Local preview

```powershell
$env:TEMP="H:\SOSWebsite\.local-ops\tmp"
$env:TMP="H:\SOSWebsite\.local-ops\tmp"
$env:npm_config_cache="H:\SOSWebsite\.local-ops\npm-cache"
cd H:\SOSWebsite\RedDirt
npm run dev
```

URL: `http://localhost:3000/arkansas-visits`

## H-drive storage

- Ops dirs: `H:\SOSWebsite\.local-ops\...` and existing `H:\SOSWebsite\.local\...` via `run-with-h-drive-env.cjs`
- No intentional project files written to `C:\`
- TEMP/TMP/npm cache session-pinned to H:

## Git / deploy

- **Not pushed**
- **Not deployed**
- Netlify linkage untouched
- Local commit: see git log on branch (Pass 1 scaffold); **not pushed**

## Remaining work for Calendar Data Pass 2

1. Merge complete Google Calendar inventory into `kelly-county-visits.ts` (including uncertain + multi-county)
2. Steve review of ~20 county-assignment-pending public rows
3. Re-validate totals / privacy scrub
4. Then commit (if not already), push, and deploy
