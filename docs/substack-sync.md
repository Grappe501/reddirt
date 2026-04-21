# Substack RSS sync

## Overview

External posts are ingested **read-only** from a Substack RSS URL. The site stores normalized rows in `SyncedPost` (`source = "substack"`) and never writes back to Substack.

Code lives in `src/lib/integrations/substack/`:

| File | Role |
|------|------|
| `fetchFeed.ts` | HTTP fetch + timeouts + errors |
| `normalize.ts` | RSS item → structured fields + slug from `/p/{slug}` |
| `types.ts` | Shared TypeScript types |
| `sync.ts` | `rss-parser` → Prisma upsert + `SiteSettings` status |

## Configuration

Priority for feed URL:

1. Explicit URL passed to `syncSubstackPosts({ feedUrl })`
2. `process.env.SUBSTACK_FEED_URL`
3. `SiteSettings.substackFeedUrl` (editable in `/admin/settings`)

## Data captured

- Title, slug (from URL), canonical link, summary/excerpt, published date  
- Author when RSS provides it  
- Tags/categories from RSS when present  
- Featured image from `enclosure`, first `<img>` in content, or podcast/image extensions when available  
- Raw item JSON in `SyncedPost.rawItem` for debugging  

## Admin controls

Per post (`/admin/blog/[slug]`):

- Featured / hidden  
- Homepage rail eligibility vs blog index visibility  
- `BlogDisplayMode`: short summary link, longer excerpt link, or `INTERNAL_MIRROR_TODO` placeholder for a future on-site mirror  
- Teaser override, local categories/tags, optional `MediaAsset` hero override  

## Public surfaces

- `/blog` — branded index  
- `/blog/[slug]` — on-site summary + prominent link to canonical Substack URL  

## Failure behavior

If the feed is missing, unreachable, or invalid XML, sync records `SiteSettings.lastSubstackSyncOk = false` and an error string. The public `/blog` page shows an empty state with instructions.

## Future: scheduled jobs

Add a cron worker that POSTs to an authenticated route (not included here) or invokes `syncSubstackPosts()` in a trusted server context. Document the secret header or signed JWT your ops team prefers.
