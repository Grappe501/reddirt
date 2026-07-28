# Homepage current-state assessment (Ernie baseline)

**Lane:** `RedDirt/`  
**Route:** `/`  
**Status:** LOCKED AS-BUILT inventory — not a redesign  
**Date:** 2026-07-28  
**Live stack:** Trust-funnel wireframe (not the older journey `HomeExperience`)

Use this as the locked “what’s on the page now” packet before any forward plan.  
**Forward plan handoff:** [`HOMEPAGE_FORWARD_PLAN.md`](./HOMEPAGE_FORWARD_PLAN.md) (Ernie fills decisions).

**Canon lock:** Until Ernie’s forward plan explicitly replaces it, treat these as authoritative for `/`:

- [`src/app/(site)/page.tsx`](../../src/app/(site)/page.tsx)
- [`src/components/home/HomeTrustFunnelWireframe.tsx`](../../src/components/home/HomeTrustFunnelWireframe.tsx)
- [`src/content/home/trust-funnel-home.ts`](../../src/content/home/trust-funnel-home.ts)
- [`WEBSITE_CONTENT_INTEGRITY_AUDIT.md`](./WEBSITE_CONTENT_INTEGRITY_AUDIT.md)

---

## Architecture (what actually mounts)

```text
(site)/layout.tsx  →  SiteHeader · main · SiteFooter · AskKelly (env-gated)
         │
         └─ page.tsx
              ├─ HomeDonateFloatingGate
              └─ HomeTrustFunnelWireframe
                    ├─ trust-funnel-home.ts (hardcoded copy)
                    ├─ listRoadPreviewPosts (SyncedPost) ── live when rows exist
                    └─ listUpcomingPublicCampaignEventsForHomepage ── live when rows exist
```

| Layer | Path | Role |
|-------|------|------|
| Route | `src/app/(site)/page.tsx` | Fetches road posts + events; renders donate gate + wireframe |
| Orchestrator | `src/components/home/HomeTrustFunnelWireframe.tsx` | Section order top → bottom |
| Copy canon | `src/content/home/trust-funnel-home.ts` | All section headlines/bodies/CTAs |
| Integrity doctrine | `docs/website/WEBSITE_CONTENT_INTEGRITY_AUDIT.md` | Why fake quotes / résumé bullets were removed |

**Not driving `/` today:**

- `getMergedHomepageConfig()` / admin Homepage board (still used by `/about`, `/civic-depth`, `/admin/homepage`)
- `HomeExperience` journey stack (orphaned — defined, not imported by `/`)
- Campaign-photo registry `homepageCandidate` (all `false`; not wired)
- Track C personality / YouTube embeds (CLOSED)

---

## Visual order (top → bottom)

### Chrome (site layout + home-only overlay)

1. **`SiteHeader`** — Fixed navy nav; Vote / Volunteer / Donate; mega-nav / mobile drawer. Header Volunteer uses `getJoinCampaignHref()` (often `mailto:` if env unset) — **different** from in-page volunteer CTA.
2. **`HomeDonateFloatingGate`** — Delayed full-viewport donate modal; dismiss persisted in `sessionStorage`. Image is legacy statewide banner crop (not a dedicated headshot). Donate → `siteConfig.donateHref` (GoodChange default).

### Page sections (trust funnel)

| # | Section | Headline / job | Content type |
|---|---------|----------------|--------------|
| 1 | **Hero** | Eyebrow: “Kelly Grappe · Secretary of State”; H1: “Government That Works for Every Arkansan”; philosophy: “People Over Politics”; long office-service body | Hardcoded + hero still (`media.heroHome` / Squarespace banner) **or** `NEXT_PUBLIC_HERO_VIDEO_URL` loop |
| 1a | Hero CTAs (6) | Meet Kelly `/about` · Our Plan `/priorities` · What the Office Does `/understand` · Business `/office/business` · Secure Elections `/office/elections` · Get Involved `/get-involved` | Hardcoded |
| 2 | **Four pillars** | “The Office Serves Arkansas in Four Ways” — Elections / Business / Transparent Government / Capitol Leadership with bullet lists | Hardcoded civic |
| 3 | **Office serves strip** | 8 icon cards (Elections, Business, Records, Capitol, Capitol Police, County Clerks, Digital Government, Civic Education) | Hardcoded links |
| 4 | **Executive leadership** | “Proven Executive Leadership” — soft differentiator; **no employer names / headcounts** | Hardcoded; CTA → `/about` |
| 5 | **Direct democracy** | “Direct democracy & the ballot initiative process” — ballot access / process / commitment network / organizing record + CTAs | Hardcoded + `direct-democracy-links.ts` |
| 6 | **Meet Kelly** | Short teaser + **draft** `ContentPendingBadge` (“Some long-form biography chapters remain draft”) | Hardcoded pending; CTA → `/about` |
| 7 | **Invite Kelly** | Invite / schedule request CTAs | Hardcoded → `/events/request`, `/schedule` |
| 8 | **Get Involved** (`#get-involved`) | Vote · Volunteer · Stay Connected · Donate cards | Hardcoded + runtime hrefs (volunteer/donate/blog env) |
| 9 | **Listening** | “Listening across Arkansas” — invite/share bullets | Hardcoded |
| 10 | **Trust band** | Navy strip of 6 principle lines (ballot access, 75 counties, transparent systems, etc.) | Hardcoded |
| 11 | **On the Road** | Upcoming events + From the Road preview **or** dashed placeholders if empty | **Only live DB band** |
| 12 | **Final CTA** | “Learn the story. Defend ballot access. Join the work.” — Meet Kelly / Direct democracy / Invite / Get involved | Hardcoded |

Footer + optional **Ask Kelly** dock (`NEXT_PUBLIC_ASK_KELLY_UI_ENABLED` — off unless `true`).

---

## What is live vs placeholder vs off

| Category | On `/` now |
|----------|------------|
| **Real / always** | Candidacy framing, office pillars, DD pillar, invite/volunteer/donate/vote links, trust band |
| **Live when DB has rows** | Published events (`listUpcomingPublicCampaignEventsForHomepage`); From the Road posts (`listRoadPreviewPosts`) |
| **Explicit pending** | Meet Kelly band draft badge |
| **Empty-state UI** | On the Road placeholders when no events/posts |
| **OFF — Track C CLOSED** | Homepage personality, 60 Seconds Shorts carousel, approved YouTube embeds |
| **OFF — not wired** | Campaign photo registry; admin homepage merge config on `/`; featured env YouTube URL |
| **Orphaned / superseded** | `HomeExperience` + Pass 02 organizing journey; `officeExplainer` copy kept in module but **not rendered**; narrative `homepage-wireframe.md` |

---

## Media reality on `/`

- Hero: legacy statewide banner still (or env video loop) — **not** new trail photo registry assets.
- Donate gate: same banner used as circular “portrait.”
- No campaign-photo FEATURE stills on home.
- No YouTube embeds on home while Track C stays closed.
- OG image for `/`: same statewide banner.

---

## CTA / env traps

- **Volunteer split:** header (`getJoinCampaignHref`) vs roles card (`getVolunteerSignupHref`) can disagree.
- Donate: `NEXT_PUBLIC_DONATE_EXTERNAL_URL` / GoodChange.
- Blog link in Stay Connected: `NEXT_PUBLIC_CAMPAIGN_BLOG_URL`.
- Hero video: `NEXT_PUBLIC_HERO_VIDEO_URL` only.
- Forms are **not** embedded on `/` — they live on `/get-involved`, `/events/request`, `/schedule`, `/volunteer`.

---

## Stale docs (do not treat as current render)

| Doc | Issue |
|-----|--------|
| `docs/WEBSITE_PASS_02_HOMEPAGE_REPORT.md` | Old `HomeExperience` stack |
| `docs/narrative/homepage-wireframe.md` | Older movement wireframe |
| `docs/KELLY_SOS_ROUTE_MAP.md` | Historically implied DB homepage merge for `/` — corrected 2026-07-28 to point here |
| Track C personality docs | Aspirational; gate still CLOSED |

---

## Ernie decision checklist (forward plan only)

When writing the forward plan, decide explicitly against this baseline:

1. Keep trust-funnel as the public canon, or replace/resequence sections.
2. Whether Track C / video / photo trail may land on `/` (requires gate open + integrity rules).
3. Whether admin `getMergedHomepageConfig` should reattach to `/` or stay unused.
4. Fix volunteer CTA env split and donate-gate first-impression behavior.
5. How much Meet Kelly / priorities pending content may surface on home vs deep pages only.
6. Whether “On the Road” stays the sole dynamic band or expands (news, photos, Shorts).

**This assessment pass makes no homepage UI changes.**
