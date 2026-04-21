# Platform connectors

## Architecture

Each connector lives under `src/lib/integrations/<platform>/`:

| File | Responsibility |
|------|----------------|
| `types.ts` | Config + normalized shapes |
| `client.ts` | HTTP client (env-based credentials) |
| `normalize.ts` | Map provider payloads → fields |
| `sync.ts` | Upsert `InboundContentItem`, update `PlatformConnection` via `touchPlatformConnection` |
| `README.md` | Env vars, scope, future work |

Shared orchestration helpers: `src/lib/orchestrator/`.

## Live vs scaffolded

| Platform | Ingestion | Notes |
|----------|-----------|--------|
| **Substack** | **Live** (RSS) | Writes `SyncedPost` + `InboundContentItem` via `upsertInboundFromSyncedPost`. |
| **Facebook** | **Ready when env set** | Graph Page feed → inbound posts. Comments/webhooks later. |
| **Instagram** | **Ready when env set** | `/{ig-user-id}/media` for Business/Creator. Comments later. |
| **YouTube** | **Ready when env set** | `search.list` by channel (public videos). Comments/playlists later. |

If env vars are missing, sync sets `PlatformConnection` to `ERROR` with a clear `lastSyncError` — safe for staging.

## Environment variables

Documented in `.env.example` and `/admin/settings/platforms`. **Never** store tokens in the database or client bundles.

## Read-only / trust stance

- This script is **ingestion-first**: read posts/media metadata, normalize, audit.
- Outbound posting requires app review, token rotation, rate limits, and human approval gates — **TODO** hooks only (`publishCandidate`, connector READMEs).

## Manual sync

`/admin/platforms` submits `runPlatformSyncAction` per platform. Substack can also run from `/admin/blog`.
