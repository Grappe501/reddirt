# Calendar Command Center — V2 closeout checklist

This document captures what is **working in code**, what is **file-staged**, what is now **database-backed**, what still needs **Google live sync**, and what moves to **V3 intelligence**.

## What works (in repo / file-backed)

- **`/admin/calendar-command-center/kelly`** — Kelly schedule settlement cockpit: week pins, map, route comparison, weekend route cards, day/hour buffer preview, focused approval queue, staged settlement actions (JSON append).
- **`/admin/calendar-command-center`** — Desktop command center shell: Franklin board, county priority strip, travel list, approval queue, alerts (DB-backed alerts gated when Prisma unavailable).
- **`/admin/calendar-command-center/week`** — Week route planner with map polyline and day columns.
- **Schedule settlement compute** — Snapshot counts, recommended week summary, route comparison scaffold, deterministic AI fallback path for settlement recommendation API.
- **Kelly agent tool bundle** — Calendar window summary, route matrix cache metadata, county facts slice, opportunity graph summary, media index slice, Google calendar lane discovery (read-only; no calendar mutation from tools).

## What is file-staged

- Travel / campaign calendar workbook → **`data/calendar-command-center/calendar-items.normalized.json`** (reconcile script).
- County priority / touch / facts JSON under **`data/calendar-command-center/`**.
- Weekend route plans / opportunities JSON under **`data/opportunities/`** (as consumed by loaders).
- Schedule settlement staged decisions: **`data/calendar-command-center/schedule-settlement-decisions.staged.json`** (via server actions).
- **V3 win target scenario** — **`data/election/kelly-win-target-scenario-v1.json`** and CSV export (built by `npm run election:targets:build` when source JSON is present).

## DB status

The Prisma migration blocker is repaired as of 2026-05-13 after a local logical backup was created under `backups/db/` (local only; never commit). `20260518210000_kelly_calendar_cockpit` was marked rolled back, then `prisma migrate deploy` successfully applied the corrected migration.

Live DB objects:

- `CalendarAlert`
- `KellyCalendarDecision`
- `KellyCalendarPromotion`
- `LocalCoverageRequest`

Live Kelly Google enum labels:

- `KELLY_GOOGLE_TENTATIVE`
- `KELLY_GOOGLE_CONFIRMED`

Historical cause: the first attempt failed because `LocalCoverageRequest.countyId` was `TEXT` while `counties.id` is `UUID`. The migration SQL now uses `UUID`.

## What still needs activation

- Promote `data/calendar-command-center/calendar-items.normalized.json` into `CampaignEvent` with `npm run calendar:promote-staged-to-db`.
- Verify the cockpit becomes DB-backed or mixed instead of staged fallback.
- Identify a Google `CalendarSource` anchor with a refresh token.
- Run `calendar:google:ensure` to create/find the Kelly Tentative and Confirmed lanes.
- Run a Google sync smoke test with one low-risk event and confirm no duplicate cockpit row.
- Resolve current schedule conflicts before treating the dashboard as fully decision-ready.

## What needs Google live sync

- HQ promotion and two-way sync remain **CLI / scripted** paths (`package.json` `calendar:google:*`). No agent tool autonomously writes Google Calendar.
- Smoke / orchestration tests that hit live Google should stay **off** until the anchor source, refresh token, and Kelly lane `CalendarSource` rows are confirmed.

## What is deferred to V3

- **Campaign intelligence ledger** — `data/agent/kelly-agent-capabilities.json` + build-status panel (see V3 board JSON).
- **County win-target / election math** — scenario model, CSV/JSON artifacts, Kelly agent `win_targets` tool output, dashboard map/cards (file-backed until voter registration goals ingest lands in DB).
- **County vault depth**, **media ingestion** automation, richer **opportunity graph** scoring tied to DB.
- **Public scheduling** — spec exists; product choice is to keep it parked while settlement + intelligence advance.

## Kelly agent guardrails (all versions)

The Kelly agent **recommends, explains, flags, and prepares**. It does **not** autonomously publish, spend money, contact voters, send SMS/email, or commit Kelly without **human approval** and override paths.
