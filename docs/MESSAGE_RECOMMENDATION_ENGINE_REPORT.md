# Message Recommendation Engine — build report

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Scope:** Deterministic, registry-only recommendations for volunteer-safe message templates. No authentication, no database, no voter identifiers, no external APIs, and no model-based or “smart” wording in user-facing strings.

## Artifacts

| Item | Path |
|------|------|
| Types (context extensions + output shapes) | `src/lib/message-engine/types.ts` |
| Template registry (inputs) | `src/lib/message-engine/templates.ts` |
| Engine | `src/lib/message-engine/recommendations.ts` |
| Barrel exports | `src/lib/message-engine/index.ts` |
| Self-check script | `scripts/message-recommendation-engine-self-check.ts` |

## Power of 5 demo data (read-only reference)

Demo relational geography for dashboards lives in `src/lib/power-of-5/demo/pope-seed.ts` (`PowerGeographyAttachment` for Pope County / River Valley). The recommendation engine does **not** import that file; callers may pass the same attachment shape on `MessageContext.geographyAttachment` when a UI already has public-safe geography.

## Public API (all `context`-only)

Each filter runs against the full `MESSAGE_TEMPLATE_REGISTRY` and returns a **subset** of templates (not ranked). `rankMessageTemplates` applies the visibility tier first, then scores and sorts.

| Function | Role |
|----------|------|
| `getMessageRecommendations(context)` | Visibility → geography → audience → relationship → optional `preferredCategory` → rank. Adds `fallbacksUsed`, per-template `reasons` / `nextActions`, and global `nextActions`. Restores a short universal list if filters empty the set. |
| `filterTemplatesByGeography(context)` | Ordinal geography ranks (`state` … `precinct`) with **slop = 2** so county scripts can appear with coarser anchors; **sparse** place context keeps all templates. |
| `filterTemplatesByAudience(context)` | If `audience` set: keep templates whose `primaryAudience` appears in a fixed compatibility table (not propensity scoring). If unset: no narrowing. |
| `filterTemplatesByRelationship(context)` | If `relationship` set: keep templates with no `relationshipHints`, or hints that include the relationship. If unset: no narrowing. |
| `filterTemplatesByCategory(context)` | If `preferredCategory` set: keep that category only. If unset: no narrowing. |
| `rankMessageTemplates(context)` | Visibility-filtered registry, integer score, stable tie-break by `templateId`. |
| `getConversationStarterSet(context)` | Starters: `conversation_starter`, `listening_prompt`, `bridge_statement`; same visibility/geo/audience/relationship chain as packs below. |
| `getFollowUpSet(context)` | `patternKind === follow_up` or `category === follow_up`. |
| `getPowerOf5OnboardingMessages(context)` | `power_of_5_onboarding` category, `power_of_5` tag, or pipelines `invite` / `activation`. |
| `inferFinestGeographyRank(context)` | Helper: finest known geography rank from attachment + display fields + `geographyScope`. |
| `assertMessageRecommendationEngineInvariants()` | Throws if basic expectations fail (non-empty recommendations, P5 pack contains circle invite, sparse geo inclusive). |

## Context additions (`MessageContext`)

- `preferredCategory?: MessageCategory` — drives `filterTemplatesByCategory` and boosts score when set.
- `visibilityTier?: "public_volunteer" | "leader"` — default **`public_volunteer`**: only `safetyLevel === public_volunteer` in ranked output. **`leader`**: also allows `leader_visible` and `election_law_review_required`; still excludes `finance_review_required` and `staff_only`.

## Scoring (deterministic integers)

Points stack when rules fire:

- Audience compatibility: **+20**
- Relationship hint match: **+16**
- Tone match: **+10**
- Preferred category match: **+24**
- Geography fit (`finest + slop >= template grain`) or sparse-place note: **+12** or **+4**
- Power of 5 onboarding category: **+6**
- Baseline: **+1** with a generic reason if nothing else matched

Sort: higher `score` first, then `templateId` ascending.

## Outputs

- **`RecommendedMessage`**: `templateId`, `title`, `rationale` (first reason), full `reasons[]`, `nextActions[]` (slots + pattern guidance + logging reminder), `score`.
- **`MessageRecommendationEngineResult`**: `recommendations`, `fallbacksUsed` (sparse-context notes + empty-filter recovery), `nextActions` (compliance / channel / geography coaching).

Copy strings avoid “AI” and model language; they describe **rules**, **registry**, and **compliance** only.

## Fallback behavior

1. **Sparse context notes** document when place, audience, or relationship was omitted (no hidden inference).
2. If filters yield **zero** templates, the engine restores, in order: listening opener → Power of 5 circle invite → county bridge (`FALLBACK_TEMPLATE_IDS`), each subject to visibility tier.
3. Global next steps remind staff to verify election-law templates when any selected id carries `election_law_review_required`.

## Self-check

```bash
cd RedDirt
npx tsx scripts/message-recommendation-engine-self-check.ts
```

## Follow-ups (out of scope here)

- Wire UI to `getMessageRecommendations` with geography from validated Power of 5 attachments only.
- Optional telemetry via existing `MessageUseEvent` / `MessageFeedback` types (still no PII in public tiers).
- Expand compatibility tables with counsel review if new audiences ship.
