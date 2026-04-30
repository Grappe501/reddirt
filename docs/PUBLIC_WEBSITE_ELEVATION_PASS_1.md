# Public website elevation — Pass 1

Scope: **RedDirt public site** (`kgrappe.netlify.app`), homepage-first. No new backend/admin features; no new external imagery (existing registry + env video URL only).

## Media assets found

| Asset / mechanism | Location | Used on homepage? |
|-------------------|----------|-------------------|
| Hero still (legacy campaign photo) | `src/config/brand-media.ts` → `media.heroHome` | Yes — `HomeHeroSection` when no video |
| Optional hero loop | `NEXT_PUBLIC_HERO_VIDEO_URL` in `src/config/site.ts` (`siteConfig.heroVideoSrc`) | Yes — full-bleed `<video>` when set |
| Split-section fallbacks | `public/media/placeholders/split-*.svg` | Yes — via `HomeSplitSection` trail-photo fallbacks |
| Optional trail photos | `src/content/media/campaign-trail-photos` (+ related IDs) | Yes — when a trail photo id resolves |
| No MP4/WebM in `public/` | — | Deploy should set `NEXT_PUBLIC_HERO_VIDEO_URL` if a self-hosted loop is ready |

## Homepage sections (order after Pass 1)

1. **Hero** — `HomeHeroSection` — Kelly / SOS / trust & transparency; primary **Join the movement**, secondary **Meet Kelly**, tertiary text **Support the campaign**; video if env set, else campaign still.
2. **Why Kelly is running** — `HomeHeardSection` + `HeardTopicCards` — voter/neighbor framing (merged `heardItems` when DB present).
3. **What the Secretary of State’s office should be** — intro + `HomeSplitSection` democracy + labor (`splitDemocracy` / `splitLabor` from merge).
4. **What Kelly believes** — `HomeMovementSection` (`movementBeliefs`).
5. **Across Arkansas / local voices** — `HomeAcrossArkansasVoices` — “Working with communities across Arkansas,” county + briefing links, story previews.
6. **Ask Kelly** — `HomeAskKellyInvite` — controlled copy; opens existing `CampaignGuideDock` via `kelly-open-campaign-guide` window event (`src/lib/campaign-guide/open.ts`).
7. **Trust & privacy** + **dual CTA band** — `HomeTrustAndActBand` (ribbon + `CTASection`).
8. **Volunteer / donate / stay informed** — `HomeGetInvolvedSection` (`#beat-act`).

Removed from homepage flow: `HomeOrganizingConversionBand` (replaced by the narrative stack + `HomeTrustAndActBand`). Renamed pattern: `HeardDrillCards` → `HeardTopicCards`.

## Organizing / internal language trimmed or replaced (high level)

- Homepage merge defaults: hero + final CTA + Arkansas band + democracy split bullets — fewer “machine” metaphors; CTA no longer mentions “sample briefing.”
- `content/homepage.ts`: counties pathway, donate line, story meta (Organizer → Volunteer neighbor).
- `content/home/homepagePremium.ts`: `PROOF_SECTION`, `GET_INVOLVED_SECTION`; volunteer grid titles (“Become an Organizer” → “Lead locally”).
- `content/home/journey.ts`: beat copy (removed Power of 5 / organizing pathway phrasing).
- **`/counties`**: metadata + `PageHero` + **`CountyCommandHub` public mode** — filters and cards use briefing/community language; removed public links to organizing-intelligence placeholder and “Dashboard v2” wording on cards; hub link for counties without v2 points to `/county-briefings`.

Remaining internal names may still exist in **filenames**, **admin routes**, or **catalog** helpers (`county-intelligence-catalog.ts` still powers tier logic; public UI overrides presentation).

## Remaining rough spots (Pass 2 candidates)

- **`/counties/[slug]` and briefing views** — audit for “command,” “intelligence,” “dashboard,” captain/Power of 5 copy.
- **Campaign guide / Ask Kelly** opening lines (`AskKellyLayout`, `CampaignGuideDock`, `tone-nuggets`) — ensure assistant intro matches homepage “controlled / no hype” bar.
- **Educate/civic depth pages** (`/understand`, `/civic-depth`) — still carry older section IDs; align with Pass 1 tone if they stay in nav funnels.
- **Self-host hero video** — add MP4 to `public/` or CDN and set `NEXT_PUBLIC_HERO_VIDEO_URL` for cinematic hero without external hotlink risk.
- **Docs** referencing `HomeOrganizingConversionBand` / Psycho audit — update when those docs are next touched.

## Recommended Pass 2

- County **detail** pages + briefing chrome: single glossary for “briefing vs overview vs priorities.”
- Optional: single **homepage config** section-order type extending `HOMEPAGE_SECTION_IDS` if admin needs to match new bands 1:1.
- Search index chunks (`fullSiteSearchChunks`) refresh after copy stabilizes.
- Light **motion** pass on hero (scrub bar, pause) if video goes live.
