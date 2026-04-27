# Website Pass 09 — SEO, metadata, and share copy

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Reads:** `docs/WEBSITE_PASS_08_MOBILE_ACCESSIBILITY_REPORT.md`; `src/app/layout.tsx`; `src/lib/seo/metadata.ts` (`pageMeta`, `articleMeta`); public pages for home, onboarding, OIS, Pope v2, counties, messages, get-involved, privacy-and-trust; eight regional dashboards under `organizing-intelligence/regions/*`.

---

## 1. Mission

Make the upgraded public site **search-ready** and **share-ready** by tightening **titles** and **descriptions**, wiring **Open Graph** and **Twitter** cards where they were missing, and keeping copy **factual** (demo/seed called out where appropriate). **No** public “AI” wording. **No** inflated claims.

---

## 2. Baseline (unchanged patterns)

| Piece | Role |
|-------|------|
| `src/app/layout.tsx` | Default `title` template `%s · ${siteConfig.name}`, `description`, `metadataBase` from `siteConfig.url`. |
| `src/lib/seo/metadata.ts` | `pageMeta()` → `openGraph` (`type: website`, `url`, `siteName`, `locale`, images) + `twitter` (`summary_large_image`). |
| `src/config/site.ts` | Campaign name, default description, normalized public URL for absolute OG URLs. |

Child routes override with `pageMeta({ title, description, path, imageSrc? })` so share previews get correct **canonical path** and image.

---

## 3. New helper

| Export | Purpose |
|--------|---------|
| `organizingIntelligenceRegionPageMeta({ regionTitle, slug, description })` | One-liner for regional dashboards: title `"{Region} — Arkansas organizing intelligence"`, path `/organizing-intelligence/regions/{slug}`, default OG image via `pageMeta`. |

---

## 4. Routes updated

| Route | Title direction | Notes |
|-------|-----------------|--------|
| `/` | Stronger campaign + organizing headline | Still uses statewide banner for OG when configured. |
| `/onboarding/power-of-5` | Relational walkthrough | Now uses `pageMeta` (OG/Twitter + canonical path). |
| `/organizing-intelligence` | Statewide OIS | `pageMeta` + default OG asset. |
| `/county-briefings/pope/v2` | Sample county dashboard | Removed duplicate long site name from title; `pageMeta` for shares. |
| `/counties` | 75-county workbench | `pageMeta`; description stays honest about Pope sample vs rollout. |
| `/messages` | Volunteer message hub | Title/subtitle tuned; existing `pageMeta` retained. |
| `/get-involved` | Volunteer pathways | **New** `pageMeta` (previously title/description only — no OG block). |
| `/privacy-and-trust` | Organizer-facing trust | Clearer plain-language description; kept texture OG image. |
| `/organizing-intelligence/regions/*` (8 live dashboards) | Regional OIS | `organizingIntelligenceRegionPageMeta`; descriptions de-jargoned for public SEO. |
| `/organizing-intelligence/regions/[slug]` | Preview / fallback | `generateMetadata` → `pageMeta` when slug is valid. |
| `/organizing-intelligence/counties/[countySlug]` | Placeholder | `generateMetadata` → `pageMeta` for consistent previews. |

---

## 5. Copy guardrails applied

- **Demo / seed / placeholder** language where the UI is not live election data or not yet hydrated.
- **No private voter data** called out on intelligence and county surfaces instead of insider abbreviations in customer-facing descriptions.
- **No** “AI” or automation hype in titles or descriptions.
- Avoided superlatives and guarantees; framed as planning views, samples, and pathways.

---

## 6. Files touched

- `src/lib/seo/metadata.ts` — `organizingIntelligenceRegionPageMeta`.
- `src/app/(site)/page.tsx`
- `src/app/onboarding/power-of-5/page.tsx`
- `src/app/organizing-intelligence/page.tsx`
- `src/app/county-briefings/pope/v2/page.tsx`
- `src/app/(site)/counties/page.tsx`
- `src/app/(site)/messages/page.tsx`
- `src/app/(site)/get-involved/page.tsx`
- `src/app/(site)/privacy-and-trust/page.tsx`
- `src/app/organizing-intelligence/regions/*/page.tsx` (eight region routes)
- `src/app/organizing-intelligence/regions/[slug]/page.tsx`
- `src/app/organizing-intelligence/counties/[countySlug]/page.tsx`

---

## 7. Checks

| Check | Result |
|-------|--------|
| `read_lints` on edited app/seo files | No issues reported. |
| `npm run lint` (RedDirt) | Invoked from workspace tooling (exit 0); capture may be empty in this environment — re-run locally if needed. |

**Recommended local verification:** `npm run lint` and `npm run build` in `RedDirt/`; spot-check share debuggers (Facebook Sharing Debugger / Twitter Card Validator) against `NEXT_PUBLIC_SITE_URL` for absolute OG URLs.

---

## 8. Follow-ups (out of scope for Pass 09)

- Per-story or per-blog `articleMeta` audit for long-tail content.
- Optional `robots.txt` / sitemap review if production domain moves off Netlify defaults.
- Canonical alternates for duplicate paths if marketing adds vanity URLs.
