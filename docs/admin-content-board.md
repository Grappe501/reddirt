# Admin content board

The **content board** (`/admin`) is the public website control room: copy, homepage composition, Substack syndication controls, media metadata, and visibility overrides for static stories/editorial/explainers.

It is **not** the movement operations dashboard. Field organizing data, volunteer CRM workflows, and future “AI chief of staff” tools belong in other systems.

## Access model (temporary guard)

This codebase uses a **deliberately simple, env-based guard** until a full identity provider or SSO is warranted for a small editorial team:

1. Set `ADMIN_SECRET` in the environment (see `.env.example`) to a long random passphrase.
2. Visit `/admin/login` and enter that same value.
3. A signed HTTP-only cookie (`reddirt_admin_session`) gates all routes under the `(board)` layout.

**Production:** rotate `ADMIN_SECRET` if it leaks; prefer HTTPS-only cookies (already `secure` in production). **Not suitable** for multi-tenant or untrusted networks without upgrading to real auth.

If `ADMIN_SECRET` is missing, middleware sends admin traffic (except `/admin/login`) to the login screen with a configuration error.

## What you can edit

| Area | Route | Notes |
|------|-------|--------|
| Overview | `/admin`, `/admin/content` | Orientation |
| Homepage | `/admin/homepage` | Hero text, section order/visibility, split-band copy, quote + final CTA, featured stories / **editorial** / notebook / explainer slugs |
| Page heroes | `/admin/pages` | Eyebrow, title, subtitle for six pillar pages (first pass); deeper blocks (FAQ, card sets, etc.) can use `AdminContentBlock` later |
| Stories | `/admin/stories` | Hide, feature, teaser/summary overrides, hero media |
| Editorial | `/admin/editorial` | Same pattern |
| Explainers | `/admin/explainers` | Same pattern |
| Media | `/admin/media` | Register **image or video embed URLs**, optional width/height, alt, caption, tags; filter by kind/tag |
| Blog / Substack | `/admin/blog` | Sync, per-post placement + display mode |
| Settings | `/admin/settings` | Feed URL (optional), notes, sync status |

Long-form body copy for stories, editorial essays, and explainer steps **remains in TypeScript content modules** unless you extend the block model.

## Media workflow (URL-first)

1. Host the asset (CMS bucket, CDN, Substack CDN, etc.).
2. Register the URL in **Media** with alt text and optional tags.
3. Attach the asset from dropdowns on story / editorial / explainer / blog forms.

Binary upload can replace the “paste URL” step later without changing the `MediaAsset` shape.

## Integration with the external organizing database

`SiteSettings.adminNotes` and future columns can hold foreign keys or sync markers. Keep website-specific tables (`SyncedPost`, `HomepageConfig`, …) separate from volunteer CRM schema to avoid coupling.

## Schema naming vs. generic spec

| Concept | Implementation |
|--------|----------------|
| `FeaturedContentPlacement` / `HomepageSectionConfig` | Folded into **`HomepageConfig`**: JSON hero, `sectionOrder`, and string arrays for featured slugs (stories, editorial, Substack, explainers). |
| `isFeatured` / `isVisible` (blog) | **`featured`** / **`hidden`** on `SyncedPost`. |
| `localTeaserOverride` | **`teaserOverride`** (+ optional **`summaryOverride`** on static content overrides). |
| `externalId` | **`feedGuid`** (RSS `guid` when present). |
| `altText` | **`alt`** on `MediaAsset`. |

## Scheduled Substack sync

Manual sync runs from **Blog** or **Settings**. For automation, add a cron (Vercel Cron, GitHub Action, etc.) that calls a **protected** HTTP endpoint you trust—this repo leaves that endpoint as a TODO to avoid over-building background infra in Script 6.

See `docs/substack-sync.md` for RSS details.
