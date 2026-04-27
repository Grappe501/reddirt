# Narrative Distribution Engine — types foundation report

**Lane:** `H:\SOSWebsite\RedDirt` only.  
**Date:** 2026-04-27.  
**Scope:** TypeScript module + demo registry only — **no** live publishing, **no** new npm dependencies, **no** external APIs.  
**Cross-ref:** [`NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md`](./NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md) · [`MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md`](./MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md) · [`src/lib/message-engine/types.ts`](../src/lib/message-engine/types.ts)

---

## 1. Purpose

This packet adds a **typed foundation** for the Narrative Distribution Engine (NDE): channels, assets, distribution packets, editorial status, intake and queue shapes, geography-scoped plans, calendar items, and a **handshake type** to MCE template ids. The goal is to name and structure orchestration concerns (reach, scope, assignments, measurement) separately from **what we say**, which remains the Message Content Engine’s responsibility.

Public-facing vocabulary follows the message system language audit: **story**, **message support**, **organizing insights**, **distribution packet** — not vendor hype or claims about automated authorship of campaign material.

---

## 2. Files added

| File | Role |
|------|------|
| [`src/lib/narrative-distribution/types.ts`](../src/lib/narrative-distribution/types.ts) | Canonical types and string unions (`NARRATIVE_CHANNELS`, `NARRATIVE_ASSET_KINDS`, `EDITORIAL_STATUSES`). |
| [`src/lib/narrative-distribution/assets.ts`](../src/lib/narrative-distribution/assets.ts) | Demo-only assets, packets, and `MessageToNarrativeBridge` examples; lookup helpers and a dev invariant assert. |
| [`src/lib/narrative-distribution/index.ts`](../src/lib/narrative-distribution/index.ts) | Barrel exports for importers. |

---

## 3. Type inventory

| Type | Summary |
|------|---------|
| `NarrativeChannel` | Surfaces NDE must route to (P5 network, blog, email, SMS, social, events, community leaders, earned media, county pages, region dashboards). |
| `NarrativeAssetKind` | Asset taxonomy from the system plan (talking points through county message packet). |
| `NarrativeAsset` | Single versioned content object reference; optional `linkedMessageTemplateIds` and `MessageCategory` hints from MCE. |
| `NarrativePacket` | Frozen bundle: `assetIds`, `channels`, geography, rollout window fields, `editorialStatus`, optional compliance note. |
| `DistributionAssignment` | Who owns localization / execution for a packet on a geography (opaque role labels in this module). |
| `EditorialStatus` | Conceptual lifecycle: draft through archived (maps to workbench/CMS in future packets). |
| `StoryIntake` | Aggregate field signal (`themeSummary`) without transcripts; optional workflow link id. |
| `AmplificationQueueItem` | Leader-ordered ask row: packet id, sort order, script asset or MCE template id, due date. |
| `ChannelPerformance` | Aggregate performance placeholder (optional numeric fields + notes). |
| `RegionNarrativePlan` / `CountyNarrativePlan` | Geography narrative headline/summary, active packet id, **gap** enum list. |
| `NarrativeCalendarItem` | Scheduled wave or dependency (ties to `narrativePacketId` when known). |
| `MessageToNarrativeBridge` | Links `messageTemplateId` ↔ `narrativeAssetId` / `narrativePacketId` with optional `MessagePatternKind`. |

Shared geography shape **`NarrativeGeographyScope`** reuses MCE **`MessageGeographyScope`** and adds optional `stateCode`, `regionKey`, `countySlug` (public-safe keys only).

---

## 4. Demo registry (safe placeholders)

Seven **distribution packets** mirror the requested demo themes. Each packet references one **demo asset** and sets `isDemoPlaceholder: true`. **`editorialStatus`** is `approved` only to exercise UI states — copy is not production-approved.

| Demo packet id | Theme |
|----------------|--------|
| `nde.demo.packet.power_of_5_launch` | Power of 5 launch packet |
| `nde.demo.packet.pope_county_organizing` | Pope County organizing packet |
| `nde.demo.packet.nwa_listening` | NWA listening packet |
| `nde.demo.packet.volunteer_recruitment` | Volunteer recruitment packet |
| `nde.demo.packet.county_captain_recruitment` | County captain recruitment packet |
| `nde.demo.packet.petition_action` | Petition action packet |
| `nde.demo.packet.gotv_reminder` | GOTV reminder packet |

Each asset lists **`linkedMessageTemplateIds`** that exist in [`src/lib/message-engine/templates.ts`](../src/lib/message-engine/templates.ts) (for example `mce.p5_onboarding.circle_invite.v1`, `mce.county_organizing.local_stake.v1`). **`DEMO_MESSAGE_TO_NARRATIVE_BRIDGES`** repeats those relationships explicitly for planner mocks.

---

## 5. Relationship to MCE and execution rails

- **MCE** continues to own patterns, templates, categories, and volunteer-safe copy.  
- **NDE** types describe **which packet is active**, **where** it applies, **which channels** participate, and **how work is assigned** — not the final rendered body of sends or posts.  
- **Execution** (email sends, social posts, blog publish) stays on existing models and admin flows described in COMMS-UNIFY-1 and the narrative system plan; this module does not enqueue or publish.

---

## 6. Verification

From the RedDirt folder:

```bash
npm run check
```

---

## 7. Next packets (from system plan)

Suggested follow-ons: NDE-2 inventory audit, metadata convention on `CommunicationPlan`, read-only narrative calendar UI, then wire amplification and telemetry when roster and aggregate queries are ready.

---

**End of report.**
