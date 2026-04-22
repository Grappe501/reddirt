# Content graph (data model)

## Overview

The “content graph” is the set of Prisma models that tie **platform connections**, **normalized inbound items**, **editor decisions**, and optional **metric snapshots** into one pipeline suitable for the public site, search, and future AI tooling (without building an agent in this script).

## Core models

### `PlatformConnection`

One row per `ContentPlatform` (Substack, Facebook, Instagram, YouTube). Tracks `status`, `lastSyncedAt`, `lastSyncError`, and non-secret `metadata`. Secrets stay in env.

### `InboundContentItem`

Canonical ingest row:

- Identity: `sourcePlatform`, `sourceType`, `externalId` (unique per platform)
- Editorial: `title`, `body`, `excerpt`, `canonicalUrl`, `publishedAt`, `tags`
- Lineage: `rawPayload`, `metrics` (JSON for future analytics), optional `mediaAssetId`
- Review: `reviewStatus`
- Distribution: `visibleOnUpdatesPage`, `visibleOnHomepageRail`, `routeToBlog`, `storySeed`, `editorialSeed`, `publishCandidate`
- Substack link: optional `syncedPostId` → `SyncedPost`

### `ContentDecision`

Append-only audit of review/routing actions (`status`, `destination`, `notes`, `editor`).

### `PlatformMetricSnapshot`

Optional time-series JSON for connector metrics (likes, views, etc.) — populated when needed.

### `MediaAsset` extensions

`originPlatform` and `originExternalId` tie library assets back to connector IDs (e.g. video thumbnails later).

### `SyncedPost`

Unchanged as the Substack mirror; orchestrator **adds** `InboundContentItem` for unified inbox/routing.

## AI / search compatibility

- Stable text fields (`title`, `excerpt`, `body`) and `tags` support lexical search indexing.
- `rawPayload` preserves provider fidelity for future summarization or grounding.
- No embeddings or agents in this script — only schema readiness.

## Public read path

`src/lib/orchestrator/public-feed.ts` exposes `listHomepageOrchestratorRail` (homepage rail and/or `visibleOnUpdatesPage`) with explicit visibility + review filters so the site never leaks unreviewed items.
