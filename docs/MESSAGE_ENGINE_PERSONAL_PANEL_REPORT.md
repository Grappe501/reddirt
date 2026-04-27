# Message Engine — personal “What to Say” panel

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Scope:** Reusable volunteer-facing **Conversation Tools** UI wired to the existing deterministic message registry (`src/lib/message-engine/`). No auth, database, voter identifiers, or model calls.

## Summary

Shipped a **What to Say** panel that surfaces listening-first scripts for personal organizing. Copy follows product rules: **no “AI” language**, emphasis on **Conversation Tools**, practical tone, **no shame**, and **no sensitive targeting** (selectors describe posture and mission focus only; they do not label people in the background).

## Files added

| File | Role |
|------|------|
| `src/components/message-engine/WhatToSayPanel.tsx` | Client panel: context state, pulls starters / follow-ups / local story / next step from the engine. |
| `src/components/message-engine/MessageCard.tsx` | Presentational card (starter, follow-up, local story, next action). |
| `src/components/message-engine/MessageContextControls.tsx` | Relationship, audience, mission focus, optional place label (display only). |
| `src/components/message-engine/index.ts` | Barrel exports. |

## Engine alignment

- **Starters:** `getConversationStarterSet` — top three after ranking. **Mission focus** (`preferredCategory` on `MessageContext`) now participates via `applyCategoryFilter` in `getConversationStarterSet` (see `recommendations.ts`).
- **Follow-ups:** Registry template from `getFollowUpSet` when available, plus short prompts from `MESSAGE_STARTER_FOLLOW_UP_PROMPTS`.
- **Local story:** First entry in `MESSAGE_STARTER_LOCAL_STORY_PROMPTS` with `{{place_name}}` filled from the optional place field (defaults to “your area”).
- **Next best step:** First line from `getMessageRecommendations(...).nextActions`.

## Registry tweak

- Added `mce.followup_prompt.thanks_one_beat.v1` in `templates.ts` so the panel can show **two** distinct follow-up prompts when no follow-up template ranks first.

## Integrations (safe)

| Surface | Change |
|---------|--------|
| `/dashboard` | `PersonalDashboardView` renders `<WhatToSayPanel />` below gamification; still demo-only at the page level. |
| `/onboarding/power-of-5` | Screen 5 (“Micro-training: listen first”) includes `<WhatToSayPanel compact />` under the existing training cards. |

## Copy and UX guardrails

- Panel intro states scripts are **starting points**, not a scorecard; **listen first**; people can **opt out with dignity**.
- Controls explain that choices **narrow friendly scripts** for relationships the volunteer **already has permission** to use — not covert targeting.
- Language uses **Conversation Tools** / **What to Say** only; never “AI.”

## Follow-ups (future packets)

- Copy-to-clipboard or channel-specific formatting (SMS vs in-person), if compliance approves.
- Optional `visibilityTier="leader"` on the panel when embedded in leader-only surfaces (registry already supports tier filtering).
- Telemetry hooks (`MessageUseEvent`) only behind explicit policy — not added here.

## Verification

From `RedDirt/`: run `npm run check` (lint, `tsc`, build). Invariants: `assertMessageRecommendationEngineInvariants()` in `recommendations.ts` remains valid for empty context.
