# YouTube connector (ingestion-first)

## Scope

- Lists recent **public videos** for a channel via YouTube Data API v3 `search.list` (date order).
- Normalizes into `InboundContentItem` (`sourcePlatform: YOUTUBE`, `sourceType: VIDEO`).
- **Comments** and full analytics are future phases.

## Configuration

| Variable | Purpose |
|----------|---------|
| `YOUTUBE_CHANNEL_ID` | Channel id (UC…) |
| `YOUTUBE_API_KEY` | Server-side API key (quota: Google Cloud console) |

OAuth may be required later for private or member-only content.

## Public site

Approved items can surface on `/updates` and future **video rails** once `visibleOnUpdatesPage` / `visibleOnHomepageRail` are set in the orchestrator.

## Future

- Playlist ingestion (campaign briefings, explainers).
- Podcast RSS cross-link (episode id mapping).
- Thumbnail registration into `MediaAsset`.
