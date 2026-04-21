# Instagram connector (ingestion-first)

## Scope

- Instagram **media** via Graph API (`/{ig-user-id}/media`) for Business/Creator accounts linked to a Facebook Page.
- Normalizes into `InboundContentItem` with `sourcePlatform: INSTAGRAM`.
- **Comment ingestion** is not implemented here — design for a future edge or webhook consumer.

## Configuration

| Variable | Purpose |
|----------|---------|
| `INSTAGRAM_USER_ID` | Instagram Business Account id (Graph) |
| `INSTAGRAM_ACCESS_TOKEN` | Token with `instagram_basic`, `instagram_manage_insights` as needed |

Tokens must stay server-side. App Review applies for production scale.

## Future

- Comment moderation pipeline.
- Reels-specific previews for on-site video rails.
- Rate limits and cursor paging.
