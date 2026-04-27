# Narrative packet builder — implementation report

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Scope:** Deterministic helpers that turn message context, geography, and demo narrative registries into **distribution packet views** for planners and UI. **No** publishing, **no** external APIs, **no** live sends, **no** private or voter-level data.

## Files

| Path | Role |
|------|------|
| `src/lib/narrative-distribution/packet-builder.ts` | All builder logic, lookup tables, and `assertNarrativePacketBuilderInvariants()`. |
| `src/lib/narrative-distribution/index.ts` | Re-exports packet builder types and functions alongside existing NDE exports. |

Related foundations (read-only dependencies):

- `src/lib/narrative-distribution/types.ts`, `assets.ts` — NDE record shapes and demo registry.
- `src/lib/message-engine/*` — `MessageContext`, template registry, `getMessageRecommendations`.
- `src/lib/power-of-5/pipelines.ts` — Organizing ladder copy for launch packet text.
- `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts` — Region display names when slug is canonical.

## Exported API

| Function | Behavior |
|----------|----------|
| `buildNarrativePacket(context)` | Runs the existing deterministic recommendation engine, takes the top template, maps category → primary channel (unless `primaryChannel` override), attaches demo or bridged assets, and fills coaching fields from static tables. |
| `getAssetsForChannel(channel)` | Returns demo `NarrativeAsset` rows that appear on any demo `NarrativePacket` listing that channel; sorted by asset id. |
| `getCountyNarrativePacket(countySlug)` | Normalizes slug (`[a-z0-9]+(-[a-z0-9]+)*`, max 80). **Pope** resolves to the demo county packet; other counties get a **generic** county-organizing packet (same template family, no DB). |
| `getRegionNarrativePacket(regionSlug)` | **Northwest Arkansas** resolves to the demo NWA listening packet when the slug matches the demo registry; other slugs get a **generic** listening-first packet with `regionKey` set to the normalized slug and display name from the campaign region table when known. |
| `getPowerOf5LaunchPacket()` | Wraps `nde.demo.packet.power_of_5_launch`, merges in the six-stage organizing ladder summaries from `POWER_OF_5_ORGANIZING_PIPELINES`, and pins the primary template to `mce.p5_onboarding.circle_invite.v1`. |
| `bridgeMessageTemplatesToNarrativeAssets()` | Pure projection of `MESSAGE_TEMPLATE_REGISTRY` into synthetic `NarrativeAsset` rows (`nde.bridge.asset.*`), deterministic kind mapping from `MessagePatternKind` → `NarrativeAssetKind`. |

## Packet shape: `NarrativeDistributionPacket`

Each packet includes the fields requested for planner handoff:

1. **core message** — `coreMessage` (summary-line intent; may include a short engine fallback note when filters were sparse).
2. **audience** — `audience` (`MessageTemplate["primaryAudience"]`).
3. **channel** — `channel` (`NarrativeChannel`); one primary channel per packet for stable sorting and UI.
4. **copy assets** — `copyAssets` (`NarrativeAsset[]`): demo assets when linked, otherwise the synthetic bridge asset for the driving template.
5. **assignment suggestion** — `assignmentSuggestion` (static table keyed by `MessagePatternKind`).
6. **timing suggestion** — `timingSuggestion` (static table keyed by `MessageCategory`).
7. **KPI target** — `kpiTarget` (aggregate-safe coaching language keyed by category; not live metrics).
8. **feedback question** — `feedbackQuestion` (theme-level debrief prompt keyed by category).

Optional trace fields: `sourceNarrativePacketId`, `primaryTemplateId`, `geography`.

## Determinism and safety rules

- **Same inputs → same outputs.** Ordering uses lexicographic sorts on ids where lists are composed.
- **No I/O** in this module: no `fetch`, no Prisma, no filesystem, no `Date`/`Math.random` for packet content.
- **No sends:** outputs are planning artifacts only; execution rails stay elsewhere.
- **No PII / voter file:** geography is public slug + `stateCode: "AR"`; copy comes from approved template and demo registries only.

## Invariants

`assertNarrativePacketBuilderInvariants()` checks:

- Bridged template assets have unique ids and template links.
- Demo `MessageToNarrativeBridge` rows reference templates and assets that exist.
- Representative calls (`buildNarrativePacket({})`, Pope county, NWA region, Power of 5 launch, `getAssetsForChannel("email")`) return non-empty, expected traces.

Invoke from a script or test harness when changing registries or lookup tables.

## Non-goals (this pass)

- Replacing CMS/workbench rows or Prisma models.
- Replacing `NarrativePacket` persistence; `NarrativeDistributionPacket` is a **view** for UX and docs.
- Scoring model or propensity: all routing remains rule-based via the message engine.

## Live publishing

**Do not** wire these helpers directly to outbound email/SMS/social senders without staff review, consent rails, and compliance sign-off. This report and module are **planning-only** artifacts.
