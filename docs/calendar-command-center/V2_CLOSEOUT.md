# Calendar Command Center — V2 closeout checklist

This document captures what is **working in code**, what is **file-staged**, what still needs **database / migrations**, **Google live sync**, and what moves to **V3 intelligence**.

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

## What needs DB

- Prisma-backed **Kelly decisions**, **alerts**, and calendar HQ workflows that depend on migrated schema.
- **`LocalCoverageRequest.countyId`** must align with **`counties.id`** (UUID) before cockpit-related migrations can apply cleanly on the shared database.

## What needs migration repair

Blocked migration (known):

- **`20260518210000_kelly_calendar_cockpit`**
- **Cause (historical):** `LocalCoverageRequest.countyId` was `TEXT` while `counties.id` is `UUID` (SQL type mismatch).
- **Repair path (run only with backup authority, prefer `DIRECT_URL` / direct Supabase host over pooler):**

```bash
npx prisma migrate resolve --rolled-back 20260518210000_kelly_calendar_cockpit
npx prisma migrate deploy
npx prisma validate
npx prisma generate
npm run typecheck
```

Do **not** assume production or shared DB is repaired until the above has been executed successfully. Until then, treat **DB-backed cockpit features** as **blocked**.

## What needs Google live sync

- HQ promotion and two-way sync remain **CLI / scripted** paths (`package.json` `calendar:google:*`). No agent tool autonomously writes Google Calendar.
- Smoke / orchestration tests that hit live Google should stay **off** until migrations and env are green.

## What is deferred to V3

- **Campaign intelligence ledger** — `data/agent/kelly-agent-capabilities.json` + build-status panel (see V3 board JSON).
- **County win-target / election math** — scenario model, CSV/JSON artifacts, Kelly agent `win_targets` tool output, dashboard map/cards (file-backed until voter registration goals ingest lands in DB).
- **County vault depth**, **media ingestion** automation, richer **opportunity graph** scoring tied to DB.
- **Public scheduling** — spec exists; product choice is to keep it parked while settlement + intelligence advance.

## Kelly agent guardrails (all versions)

The Kelly agent **recommends, explains, flags, and prepares**. It does **not** autonomously publish, spend money, contact voters, send SMS/email, or commit Kelly without **human approval** and override paths.
