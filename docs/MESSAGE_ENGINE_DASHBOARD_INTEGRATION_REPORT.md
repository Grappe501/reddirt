# Message engine — dashboard integration report

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Scope:** Public organizing dashboards only — aggregate message intelligence panels wired to **demo/seed** data until live conversation logging connects.

## Summary

Three UI panels plus a deterministic demo payload builder extend the Message Content Engine into the dashboard hierarchy:

- **State:** `/organizing-intelligence` (`StateOrganizingIntelligenceView`)
- **Region:** all routes using `RegionDashboardView` (eight campaign region pages)
- **County sample:** Pope County v2 (`PopeCountyDashboardV2View`)

No new npm dependencies. No individual-level or voter-linked conversation content on these surfaces.

## Files added

| File | Role |
|------|------|
| `src/lib/message-engine/message-intelligence-dashboard.ts` | `MessageIntelligenceScope`, demo model types, `getMessageIntelligenceDemoModel()` — state / region / county mixes |
| `src/components/message-engine/MessageIntelligencePanel.tsx` | Composed section: header + performance + narrative |
| `src/components/message-engine/MessagePerformancePreview.tsx` | Themes, categories in use, pipeline movement |
| `src/components/message-engine/NarrativeGapPanel.tsx` | Narrative gaps, suggested field message of the week, follow-up table |

## Files touched (integration)

| File | Change |
|------|--------|
| `src/components/message-engine/index.ts` | Barrel exports for new panels |
| `src/components/organizing-intelligence/StateOrganizingIntelligenceView.tsx` | `MessageIntelligencePanel` with `scope={{ level: "state" }}` after relational charts |
| `src/components/regions/dashboard/RegionDashboardView.tsx` | `MessageIntelligencePanel` with `regionDisplayName: data.displayName` after Power of 5 block |
| `src/components/county/pope/PopeCountyDashboardV2View.tsx` | County scope with `displayName` + `regionLabel` after relational graph demo |

## Content policy (enforced in UI copy)

- **Aggregates only** on public dashboards — no names, quotes attributed to individuals, or voter microdata.
- **Demo / preview** labeling via `CountySourceBadge` and window copy — figures are illustrative until telemetry replaces `getMessageIntelligenceDemoModel`.
- **No “AI”** wording in user-facing strings for this integration.
- Categories align with `MESSAGE_CATEGORIES` in `src/lib/message-engine/types.ts` (human labels in the demo builder).

## Panel contents

1. **Top conversation themes** — percentage bars, themed buckets (preview).
2. **Message categories in use** — share of tagged template uses by workbench category.
3. **Narrative gaps** — coaching cards (priority: high / medium / low).
4. **Suggested field message of the week** — short script + category; volunteers localize slots on their turf.
5. **Follow-up needs** — aggregate open counts by theme (preview ledger).
6. **Pipeline movement from conversations** — stage-to-stage deltas vs prior window (illustrative).

## Follow-up (when live data exists)

1. Replace `getMessageIntelligenceDemoModel` with a server-side aggregate query (Postgres / analytics store) that returns the same shape or a narrowed DTO.
2. Keep public routes **aggregate-only**; move attributable transcripts to admin / REL-2 tools with access controls.
3. Optionally add `src/app/admin/...` intelligence views that reuse `MessagePerformancePreview` / `NarrativeGapPanel` with staff-only filters — out of scope for this pass.

## Verification

From `RedDirt/`:

```bash
npm run check
```

Manual smoke: open `/organizing-intelligence`, any `/organizing-intelligence/regions/*` dashboard, and `/county-briefings/pope/v2` — confirm panels render and badges read **Demo / seed**.
