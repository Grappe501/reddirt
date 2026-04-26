# Kelly SOS — Day 2 completion report

**Date:** 2026-04-26  
**Theme:** Public polish, CTA completion, mobile spot-check, RD-1

## Objective

Make the Kelly SOS public site feel launch-ready; complete **RD-1** public copy/jargon sweep for `(site)` + `/county-briefings/pope`; audit CTAs; improve mobile tap targets; document routes.

## RD-1 status

**Complete** for **user-visible** strings on:

- `src/app/(site)/**` (targeted fixes on calendar, events, ballot process, local organizing slug, priorities)
- `src/app/county-briefings/pope/page.tsx`
- `src/components/layout/SiteHeader.tsx` (voter-facing drawer link)
- `src/components/organizing/MovementFairsMap.tsx` + `globals.css` (class rename)

**Residual (non-blocking):** Developer comments inside `{/* */}` on a few `(site)` pages still mention “Script 5”—**not shown to visitors**.

## Routes inspected

All key RedDirt public routes from the Day 2 list; documented **`sos-public`-only** paths in `KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md`.

## Public files changed

- `src/app/county-briefings/pope/page.tsx`
- `src/app/(site)/campaign-calendar/page.tsx`
- `src/app/(site)/campaign-calendar/[slug]/page.tsx`
- `src/app/(site)/events/page.tsx`
- `src/app/(site)/direct-democracy/ballot-initiative-process/page.tsx`
- `src/app/(site)/local-organizing/[slug]/page.tsx`
- `src/app/(site)/priorities/page.tsx`
- `src/components/layout/SiteHeader.tsx`
- `src/components/organizing/MovementFairsMap.tsx`
- `src/app/globals.css`

## CTA fixes

- Mobile nav drawer: **“Get involved on this site”** replaces internal-sounding **“Command HQ · this site”**.
- No external URL changes (GoodChange, Substack, mailto defaults unchanged—treasurer/content owner).

## Mobile / a11y

- Mobile header controls: **`min-h-11`** for primary actions.
- Leaflet pin class: **`sos-leaflet-pin`**.

## Database / migrations

- **`npm run dev:prepare`:** **Failed** — `P1001` cannot reach `127.0.0.1:5433` (Postgres not running in this session).
- **`npm run db:seed`:** Not run (depends on DB).
- **To run site with full data locally:** `npm run dev:db` (or start Postgres on 5433), then `npm run dev:prepare`, then optional `npm run db:seed`, then `npm run dev` or `npm run dev:full`.

## Commands

| Command | Result |
|---------|--------|
| `npm run dev:prepare` | **Exit 1** — DB unreachable |
| `npm run check` | **Exit 0** — lint warnings only, build OK |

## Current launch readiness %

**~78%** (public polish + RD-1); **~73%** overall program until DB/staging smoke and RD-4/6 close.

## Remaining blockers

1. Local/prod **Postgres** for faithful previews.
2. **RD-4** forms smoke on staging.
3. **RD-6** full mobile pass (beyond header).
4. **Counsel/treasurer** review of new accountability framing on `/priorities`.

## Top quick wins

1. Start **Docker DB** → `dev:prepare` → `db:seed` → `npm run dev`.
2. Spot-check **`/priorities`** new section with Steve.
3. Remove **`TODO(Script 5)`** comments from `(site)` in a tiny chore PR.

## Day 3 focus

Intake → DB → admin review/export; automation; `POST /api/forms` staging proof.

## Day 3 Cursor script draft

```text
KELLY SOS — Day 3 (intake, DB, admin workflow)

READ: docs/KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md § Day 3
READ: docs/KELLY_SOS_ROUTE_MAP.md § API /forms
RULES: Kelly-only data; no cross-lane; no secrets in docs.

TASKS:
1) With DB up: npm run dev:prepare && npm run db:seed (if appropriate) — log in KELLY_SOS_BUILD_LOG.md
2) Trace POST /api/forms → persistFormSubmission; document admin path to view submissions (relational/volunteer/inbox)
3) If export gap: smallest safe doc or CSV note for operators
4) Update KELLY_SOS_LAUNCH_STATUS.md intake/admin rows
5) npm run check

REPORT: KELLY_SOS_DAY_3_COMPLETION_REPORT.md (create)
```

## Paste-back for ChatGPT

```text
Kelly SOS Day 2 done. RD-1 complete for voter-visible copy on (site)+Pope; priorities gained accountability section; calendar/events offline msgs de-jargoned; mobile tap targets + drawer label fixed; map CSS class renamed sos-leaflet-pin.

npm run check: exit 0. dev:prepare: failed (no Postgres on 5433)—start dev:db then dev:prepare + optional db:seed.

Readiness ~78% public / ~73% overall. See docs/KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md + KELLY_SOS_DAY_2_COMPLETION_REPORT.md.
```
