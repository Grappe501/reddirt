# Admin content orchestrator

## Purpose

The orchestrator is the **trusted intake and routing layer** for public-facing content: external sources normalize into `InboundContentItem`, humans review and route, and the public site reads approved flags — **not** automatic publish-everywhere.

Movement operations dashboards and outbound social posting are **out of scope** for this script.

## Admin routes

| Route | Role |
|-------|------|
| `/admin/orchestrator` | Command center: health, counts, recent activity |
| `/admin/inbox` | Filterable list of all inbound items |
| `/admin/inbox/[id]` | Review + distribution for one item |
| `/admin/review-queue` | `PENDING` items only |
| `/admin/feed` | Chronological sync timeline |
| `/admin/content-graph` | Aggregate counts (platform, status, seeds) |
| `/admin/distribution` | Bulk routing for reviewed/featured items |
| `/admin/platforms` | Per-platform status, counts, manual sync |
| `/admin/settings/platforms` | Env variable reference (no secrets in UI) |
| `/admin/media-library` | Alias → `/admin/media` |
| `/admin/insights` | Placeholder for future metrics |

Existing site board routes (`/admin/content`, homepage, blog sync, etc.) remain unchanged.

## Human workflow

1. Connectors write or update `InboundContentItem` (and Substack still updates `SyncedPost`).
2. Editors work **Review queue** or **Inbox** → set `reviewStatus`.
3. For items that should surface publicly, open **Distribution** (or the detail panel) and set:
   - `visibleOnUpdatesPage` → `/campaign-trail` (merged with rail items; no separate `/updates` page)
   - `visibleOnHomepageRail` → homepage “From the movement” section
   - `routeToBlog` → toggles `SyncedPost.showOnBlogLanding` when linked
   - `storySeed` / `editorialSeed` → internal creative buckets
   - `publishCandidate` → **future outbound only**; no posting implemented

4. `ContentDecision` rows append an audit trail per action.

## Public surfaces

- `/campaign-trail` — includes items with `visibleOnHomepageRail` and/or `visibleOnUpdatesPage` (review `REVIEWED` or `FEATURED`). The `/updates` URL redirects here.
- Homepage section `updates` — same data when `visibleOnHomepageRail` is set (section can be ordered in `/admin/homepage`).

## Deferred (by design)

- Outbound publishing to Facebook/Instagram/YouTube.
- AI agent / auto-moderation.
- Full insights dashboards.

See `docs/platform-connectors.md` and `docs/content-graph.md` for connector and schema detail.
