# Power of 5 — Gamification

**Lane:** `RedDirt/`  
**Scope:** XP, badges, streaks, and missions for the **personal** volunteer surface. This document describes the **demo-first** implementation in `src/lib/power-of-5/gamification.ts` and its use on `/dashboard`.

## Goals

- Reward **relational habits** (intentional circle, conversations, follow-ups, team cadence) without turning organizing into a performative leaderboard.
- Keep payloads **aggregate and synthetic** in demo mode — no voter file, no PII, no production streak storage yet.
- Make persistence mapping obvious later: same types can be fed from audited activity rows instead of demo counters.

## Module layout

| Concern | Primary API |
|--------|-------------|
| XP weights | `XP_PER_ACTIVITY`, `XpActivityKind` |
| Level curve | `LEVEL_THRESHOLDS`, `LEVEL_TITLES`, `computeXpState` |
| Demo ledger | `demoLedgerFromPersonalDashboard`, `totalXpFromDemo` |
| Badges | `BADGE_CATALOG`, `evaluateBadges` |
| Streaks | `buildStreakSnapshots` |
| Missions | `buildMissionsFromDemo` |
| Full snapshot | `buildPersonalGamificationFromDemo` |

The personal dashboard calls `buildPersonalGamificationFromDemo(PERSONAL_DASHBOARD_DEMO)` and renders `GamificationPanel` (`src/components/dashboard/personal/GamificationPanel.tsx`).

## XP system

- **Ledger model:** XP is the sum of weighted activity counts (`XpLedgerLine[]`). Live systems should append lines from validated events, not from client-reported totals alone.
- **Weights** live in `XP_PER_ACTIVITY` (e.g. conversations vs invites vs mission completion). Adjust in one place when balancing.
- **Levels** are bands over cumulative XP (`LEVEL_THRESHOLDS`). Titles in `LEVEL_TITLES` are motivational copy, not ranks exposed on public pages.

## Badges

- Badges are **definitions + rules** evaluated against the current demo snapshot (`evaluateBadges`).
- Rules today are simple thresholds (circle fill, invite count, conversation count, team streak, XP band). Production can add time windows, consent gates, and anti-abuse checks.

## Streaks

Two demo streaks are exposed:

1. **Personal touch rhythm** — derived from recent conversation density in the demo payload (not a real login streak).
2. **Team cadence** — mirrors `TeamProgressDemo.consistencyStreakWeeks`.

Live implementation should use explicit **calendar buckets** (UTC or organizer timezone) and idempotent event IDs to avoid double-counting.

## Missions

- Missions are **short objectives** with `current` / `target`, a status (`locked` | `active` | `complete`), and an XP reward on completion.
- Demo missions align to: filling the Power of 5, team weekly conversation goal, and clearing high-priority follow-ups.
- Locked missions exist to show gating UX before dependencies are met (e.g. team mission unlocks after two circle slots are active in the demo).

## Ethics and product boundaries

- **No public leaderboards** in this slice; copy on the dashboard states cooperative, private-to-team recognition.
- **No dark patterns:** streaks should not shame users; prefer “resume your rhythm” framing in live copy.
- **Children / sensitive audiences:** if a youth-facing surface reuses this module, revisit XP density and badge names with program compliance.

## Future work (not in this file)

- Persist `XpLedgerLine` + badge grants in Postgres with actor and source event IDs.
- Server-side recomputation of streaks from `OrganizingActivity`-style rows (`types.ts`).
- Leader-only rollup views using `buildPowerOf5LeaderDashboardDemo` patterns, separate from volunteer-facing XP.

## Related docs

- `docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`
- `docs/POWER_OF_5_DATA_MODEL.md` (if present)
- `src/lib/power-of-5/types.ts` — domain types for future persistence.
