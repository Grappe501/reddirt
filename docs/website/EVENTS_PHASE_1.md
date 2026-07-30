# Events Phase 1 — single public schedule model

**Status:** shipped on `feature/kelly-schedule-settlement-dashboard`  
**Depends on:** Phase 0 (`EVENTS_PHASE_0.md`)

## Done

1. **Stop fair-research merge** — `ARKANSAS_FESTIVAL_EVENTS_2026` no longer spreads into public `events`; file kept for operator/research export.
2. **Hub source** — curated `movementEventsCore` + published CampaignOS via `mergeMovementAndCalendarEvents`.
3. **Detail URLs** — `detailHref` is `/events/{slug}` (bookmarks via `/campaign-calendar/{slug}` still redirect).
4. **Slug resolver** — `/events/[slug]` tries curated → `resolvePublicEventPageBySlug` (live / canceled / soft DB error).
5. **Public detail UI** — calendar events use the same public EventMeta template (not ops briefing).
6. **Prefer Unknown** — no venue invent; no map pin without county; missing location → `Unknown`.
7. **Filter** — campaign calendar checkbox removed; published rows always included.

Approved ingest highlights (`listPublicFestivalFeed`) remain a separate hub section — not the research dump.

## Not in Phase 1 (Phase 2) — **done in EVENTS_PHASE_2.md**

- ~~One pin style / drop attendance palette~~
- ~~Drop `includeCalendar` type field entirely~~
- ~~Exact coords-only pins restyle~~
