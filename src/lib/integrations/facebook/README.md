# Facebook connector (ingestion-first)

## Scope (Script 6.5)

- Read-only **Page feed** pathway via Graph API (`/{page-id}/feed`).
- Normalizes posts into `InboundContentItem` (`sourcePlatform: FACEBOOK`).
- **No outbound publishing** in this repo yet.

## Configuration

Environment variables (server-only):

| Variable | Purpose |
|----------|---------|
| `FACEBOOK_PAGE_ID` | Facebook Page id to read |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Page access token with `pages_read_engagement` (and any fields you request) |

Do **not** commit tokens. Prefer a secrets manager in production.

## Hardening before production

- App Review for required permissions.
- Rate limiting and backoff.
- Webhooks for real-time updates (optional).
- Paging for large feeds.
- Separate **comment** ingestion (different edge) — design only in this pass.

## Code

- `client.ts` — minimal Graph client.
- `normalize.ts` — feed edge → internal shape.
- `sync.ts` — upserts inbound rows + platform connection status.
