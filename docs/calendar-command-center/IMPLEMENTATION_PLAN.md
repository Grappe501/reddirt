# Campaign Calendar Command Center — implementation plan

## Current state (this pass)

- **Types:** `src/lib/calendar/campaign-calendar-item.ts` defines `CampaignCalendarItem` and related row types.
- **Ingest / reconcile:** `scripts/travel-calendar-xlsx-reconcile.ts` reads the Kelly travel workbook, optionally matches `CampaignEvent` / `ArkansasFestivalIngest` when Prisma can connect to a DB that matches the generated schema, and writes JSON under `data/calendar-command-center/`.
- **Admin UI:** `/admin/calendar-command-center` (Franklin-style shell) reads normalized JSON server-side; event drill-down at `/admin/calendar-command-center/event/[id]`.
- **Existing Calendar HQ:** `/admin/workbench/calendar` remains the operational Google / workflow surface; the command center is the travel-planning + tentative vs confirmed lens.

## Data model changes (proposed, additive only — not applied in this pass)

Staging tables would let operators re-run ingest without overwriting files and would support approval queues:

- `TravelCalendarImport` — batch metadata (source file, importedAt, importedBy).
- `TravelCalendarImportEvent` — raw row JSON + normalized FK optional to `CampaignEvent`.
- `CountyTouchAudit` — snapshot of per-county touch counts vs spreadsheet.
- `FestivalLeadAudit` — join keys to `ArkansasFestivalIngest`.
- `CountyMeetingLeadAudit` — DPA + county confirmation fields, always `tentative` until verified.

**Rule:** No destructive migrations; add tables/enums only after Steve review against production Kelly-Grappe-App.

## Routes / components (next slices)

| Area | Action |
|------|--------|
| Month / week / day / hourly | Extend `FranklinCalendarCommandCenter` or extract grid primitives; add drag-resize only after staging DB exists. |
| Approve / hold / reject | POST server actions writing to `CampaignEvent.eventWorkflowState` + `EventStageChangeLog`, or to staging tables first. |
| County heat | Reuse `getCountyNeglectNarrative` patterns from `hq-command-data.ts`; merge with `county-priority-snapshot.json`. |
| Public site | Do not publish until `publishStatus` pipeline + existing event workflow approve; no live public writes from this JSON. |

## Review / approval workflow

1. Re-run `npm run calendar:travel:reconcile` after workbook updates.
2. Staff filters tentative vs confirmed / conflicts in command center UI.
3. **Confirmed** schedule: promote selected rows to `CampaignEvent` (or link `googleEventId`) via Calendar HQ or a dedicated promote action (future).
4. **Official calendar:** only events in `APPROVED` / `PUBLISHED` workflow with `isPublicOnWebsite` per existing rules.

## Remains manual

- DPA county-party meeting dates and cadence (do not infer).
- Fair/festival dates not in `ArkansasFestivalIngest` (web leads stay supplemental until verified).
- Final call on overlapping items flagged as `conflict`.
- Kelly Tuesday Little Rock daytime constraint — heuristic warnings only until staff confirms each block.

## Kelly Calendar Cockpit (implemented slice)

**Prisma (additive migration `20260518210000_kelly_calendar_cockpit`):** `KellyCalendarDecision`, `LocalCoverageRequest`, `CalendarAlert`, `KellyCalendarPromotion` (+ enums). Run `npx prisma migrate deploy` on Supabase Kelly-Grappe-App before relying on approvals in production.

**Routes:** `/admin/calendar-command-center` (desktop edge-to-edge shell), `/admin/calendar-command-center/kelly` (mobile cockpit, no left admin sidebar), `/admin/calendar-command-center/event/[id]` (Kelly action strip), `/kelly/calendar` (PWA install entry + manifest; auth required for data).

**Env:** `KELLY_COCKPIT_ACTOR_ID` (optional logical actor id for `decidedByUserId`; defaults to `kelly-cockpit-admin`). Email/SMS/push for `CalendarAlert` channels are **not** wired until credentials and opt-in are approved — in-app alerts only.
