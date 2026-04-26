# RedDirt Site + Engine Funnel Plan

**Doc ID:** RD-SITE-FUNNEL-1  
**Phase:** Pass 02 — public entry funnel wired (navigation, homepage four-path grid, footer CTAs). **No new routes.** No admin/relational changes.  
**Scope:** `H:\SOSWebsite\RedDirt` only. **Do not** merge with or import from `sos-public/`, `ajax/`, or `phatlip/`.  
**Related:** [`RED_DIRT_OPERATING_SYSTEM_MAP.md`](./RED_DIRT_OPERATING_SYSTEM_MAP.md), [`RED_DIRT_PACKET_QUEUE.md`](./RED_DIRT_PACKET_QUEUE.md), [`RED_DIRT_BUILD_PROTOCOL.md`](./RED_DIRT_BUILD_PROTOCOL.md).

---

## 1. Current architecture

RedDirt ships as **one** Next.js App Router application and **one** Netlify deploy. Two intentional surfaces share code and infrastructure but serve different users:

| Surface | Location | Role |
|--------|----------|------|
| **Public website** | `src/app/(site)/` | Campaign narrative, trust, issues, content hubs, volunteer/voter entry, donation handoff. Wrapped by `SiteHeader`, `SiteFooter`, `PublicLayoutMain`, `AskKellyLayout`. |
| **Engine / operator tools** | `src/app/admin/`, `src/app/relational/`, `src/app/api/`, Prisma, `scripts/` | Workbench, relational organizing, comms, media, budgets, voter tooling, ingest. Dense UI; auth-gated patterns. |

**Public-but-not-`(site)`:** `src/app/county-briefings/pope/` — SOS-style county political profile (DB-backed); uses site chrome or adjacent patterns per page implementation.

**Data:** Many public pages merge **TS content** (`src/content/`) with **Prisma** (homepage config, blog sync, counties, events). Builds should tolerate DB absence where the codebase already logs `[reddirt:db-unavailable]`; production/staging should run with a live DB for full static generation.

---

## 2. Website vs engine split

**Belongs on the public site (`(site)`):**

- Story, values, priorities, issue depth (readable, shareable).
- Volunteer and voter **intake** (forms, clear next steps, `/get-involved`, `/voter-registration`, event RSVPs).
- Editorial: blog, stories, editorial, explainers, resources.
- County **public** command pages (`/counties`, `/counties/[slug]`).
- Calendar and “from the road” / press surfaces.
- Donate explanation + external GoodChange (or env-driven) handoff.
- Search dialog (public discovery).

**Belongs in the engine (`/admin`, `/relational`, APIs):**

- Authentication and session for operators.
- Voter file import, voter model, relational contacts, email/SMS plans, sends, compliance, budgets, owned media pipeline, GOTV read models, orchestration, volunteer **document** intake review (`/admin/.../volunteers/intake`).
- Any workflow that requires PII, approvals, or bulk data mutation.

**Principle:** The public site **explains and invites**; the engine **executes and records**. Cross-links go **public → login/intake URLs**, never embed admin components in `(site)` layouts.

---

## 3. Funnel psychology

Progressive disclosure aligned with volunteer and supporter journeys:

| Level | Where | Job-to-be-done |
|-------|--------|----------------|
| **Level 1 — Homepage & top nav** | `/`, `SiteHeader` | Orient: who we are, one clear “Volunteer” / “Donate” rhythm; nav groups (Meet Kelly, The Office, News, Events, Get Involved). **Simple entry** — no wall of text. |
| **Level 2 — Hub pages** | `/get-involved`, `/local-organizing`, `/what-we-believe`, `/events`, `/listening-sessions`, etc. | **Trust + identity:** match the visitor to a lane (local host, listener, field, digital). |
| **Level 3 — Deep content** | `/blog`, `/explainers`, `/civic-depth`, `/direct-democracy`, `/resources`, `/stories`, … | **Receipts:** policy detail, explainers, media — for people who need proof before acting. |
| **Level 4 — Engine handoff** | `/relational/login`, `/relational`, `/admin/login`, on-site forms | **Action stored in the system:** account, relational graph, organizer tools, reviewed volunteer intake. |

**Emotional sequence (copy + design):**

**simple entry → trust → identity → action → engine**

- **Trust:** paid-for bar, press, trail photos, clear plain-language promises.
- **Identity:** “this is for people like you in your county.”
- **Action:** one primary CTA per section; secondary “learn more.”
- **Engine:** “your follow-up and assignments live here” — no jargon on first touch.

---

## Current entry points (audit — Pass 02)

| Location | CTA / label | Destination | Intended user | Gaps / notes |
|----------|-------------|-------------|---------------|--------------|
| `src/app/(site)/page.tsx` | (delegates to `HomeExperience`) | `/` | All | Now mounts `HomeEntryFunnelSection` via `entryFunnel` prop. |
| `HomeEntryFunnelSection` | Start as a Volunteer | `getJoinCampaignHref()` (default `/get-involved#volunteer`) | Field / time donors | Env can override external signup. |
| `HomeEntryFunnelSection` | Lead in Your County | `/local-organizing` | County leads, hosts | Deepening: `/start-a-local-team`, `/listening-sessions` in nav. |
| `HomeEntryFunnelSection` | Run for Office | `/resources` | Candidates / campaign helpers | **Not** a vetting flow—toolkits + receipts; office context in Priorities. |
| `HomeEntryFunnelSection` | Support the Work | `/donate` | Donors, amplifiers | External GoodChange via `siteConfig.donateHref` on donate page. |
| `SiteHeader` (desktop) | Start as a Volunteer / Volunteer | `getJoinCampaignHref()` | Same as volunteer funnel | XL breakpoint shows full phrase; compact shows “Volunteer”. |
| `SiteHeader` | Donate | `siteConfig.donateHref` | Donors | Unchanged behavior. |
| `SiteHeader` | Search | Search dialog | Researchers | — |
| `SiteHeader` (mobile drawer) | Start as a Volunteer | join href | — | Replaces vague “Volunteer sign-up” label. |
| `SiteHeader` (mobile) | Explore the work — Command HQ | `/get-involved` | Multi-lane explorers | Renamed from “Command HQ · this site” for clarity. |
| `SiteFooter` | Start as a Volunteer → | join href | — | Aligns with primary pathway language. |
| `SiteFooter` | Ways to plug in column | four pathways + counties + donate | — | New column; `CampaignPaidForBar` unchanged. |
| `src/config/navigation.ts` | Get Involved group | Volunteer, county, resources, events, hubs | — | Replaces undifferentiated “Get involved” list as top-level structure. |

---

## Pass 02 — Four canonical funnels (existing routes only)

### 1. Volunteer funnel

**Intent:** Entry → education → action → assignment (assignment still engine-backed later).

| Step | Existing route(s) | CTA chain |
|------|-------------------|-----------|
| Entry | `/`, `/get-involved` | Header “Start as a Volunteer”, funnel card, footer. |
| Education | `/what-we-believe`, `/understand` | Nav **About**. |
| Action | `/get-involved#volunteer`, optional external join URL | Primary volunteer href. |
| Deepening | `/events`, `/listening-sessions`, `/host-a-gathering` | Nav **Get Involved**. |

**Missing links (future, not Pass 02):** explicit `/join` short URL; optional post-signup “what happens next” block.

### 2. County leader funnel

**Intent:** Entry → qualification (values) → training-shaped pages → workbench (engine).

| Step | Existing route(s) | CTA chain |
|------|-------------------|-----------|
| Entry | `/local-organizing`, `/counties` | Funnel card + **Counties** nav. |
| Values / trust | `/what-we-believe`, `/priorities` | **About** + **Priorities**. |
| Training / gatherings | `/listening-sessions`, `/start-a-local-team`, `/events` | **Get Involved** + **Events** link. |
| Engine handoff | `/relational/login`, `/admin/login` | Linked from docs only in this pass—not added to nav per instruction. |

**Missing:** Single `/training` hub (optional later); public copy that names “relational” when appropriate.

### 3. Candidate funnel

**Intent:** Entry → interest → vetting (self-serve content) → brief → support.

| Step | Existing route(s) | CTA chain |
|------|-------------------|-----------|
| Entry | `/resources`, `/priorities` | Funnel **Run for Office** → `/resources`; Priorities nav for office grounding. |
| Interest | `/direct-democracy`, `/civic-depth` | **Priorities** group. |
| Vetting / receipts | `/explainers`, `/blog`, `/editorial` | **Blog** nav. |
| Support | `/donate`, volunteer CTAs | Donate + field support. |

**Missing:** Dedicated “candidates” landing; county brief is `/county-briefings/pope` (separate surface).

### 4. Supporter funnel

**Intent:** Entry → trust → content → donation / amplification.

| Step | Existing route(s) | CTA chain |
|------|-------------------|-----------|
| Entry | `/`, trust ribbon, hero | Home. |
| Trust | `/press-coverage`, `/from-the-road` | **Blog** group. |
| Content | `/blog`, `/stories`, Substack | **Blog** + external. |
| Donate / amplify | `/donate`, share links | Footer + header Donate; **Support the Work** card → `/donate`. |

**Missing:** Optional dedicated “share” tool block (not Pass 02).

### Standardized CTA language (key surfaces)

| Before (examples) | After (Pass 02) |
|-------------------|-----------------|
| Volunteer (header-only) | **Start as a Volunteer** (desktop XL) / **Volunteer** (compact) |
| Volunteer sign-up (footer / drawer) | **Start as a Volunteer** |
| Command HQ · this site | **Explore the work — Command HQ** |
| Get Involved (nav label) | **Get Involved** (kept) with structured sub-items |

---

## 4. Route map

### 4.1 Current public routes (`src/app/(site)/`)

Discovered from `page.tsx` files (April 2026 audit):

| Route | Notes |
|-------|--------|
| `/` | Home — `HomeExperience` + merged homepage config |
| `/about` | |
| `/about/[slug]` | |
| `/priorities` | |
| `/understand` | |
| `/what-we-believe` | |
| `/civic-depth` | |
| `/direct-democracy` | |
| `/direct-democracy/ballot-initiative-process` | |
| `/labor-and-work` | |
| `/donate` | |
| `/blog` | |
| `/blog/[slug]` | |
| `/editorial` | |
| `/editorial/[slug]` | |
| `/explainers` | |
| `/explainers/[slug]` | |
| `/stories` | |
| `/stories/[slug]` | |
| `/resources` | |
| `/resources/[slug]` | |
| `/from-the-road` | |
| `/press-coverage` | |
| `/campaign-calendar` | |
| `/campaign-calendar/[slug]` | |
| `/events` | |
| `/events/[slug]` | |
| `/listening-sessions` | |
| `/host-a-gathering` | |
| `/start-a-local-team` | |
| `/get-involved` | Volunteer + stay-connected anchors (`#volunteer`, `#join` per `external-campaign.ts`) |
| `/local-organizing` | |
| `/local-organizing/[slug]` | |
| `/voter-registration` | |
| `/voter-registration/assistance` | |
| `/counties` | |
| `/counties/[slug]` | |

**Additional public route (outside `(site)` group):**

- `/county-briefings/pope`

### 4.2 Current relational routes

| Route | Role |
|-------|------|
| `/relational` | Relational shell |
| `/relational/login` | Login |
| `/relational/new` | New entry |
| `/relational/[id]` | Record/detail |

### 4.3 Current admin entry

| Route | Role |
|-------|------|
| `/admin/login` | Admin login |
| `/admin` | Redirect / board landing (per app routing) |
| `/admin/(board)/*` | Workbench OS (dozens of nested routes: workbench, comms, events, owned-media, voters, relational-contacts, counties, content, inbox, settings, …) |

*Do not rename `/admin` or `/relational` paths in a public-site pass without an explicit engine migration packet.*

### 4.4 Proposed public route structure (future phases)

**Keep** existing URLs as canonical where already deployed and indexed.

**Optional additions** (implement only with SEO/redirect plan):

| Route | Intent |
|-------|--------|
| `/join` | **301 or alias** to `getJoinCampaignHref()` / `/get-involved#volunteer` — shorter verbal CTA (“Join”) for ads and stage. |
| `/training` | **Hub** aggregating training-shaped events (`/events` filters), resources (`/resources`), and listening sessions — today training is **distributed**, not one route. |
| `/engine` or `/for-organizers` | **Optional bridge page** on the **public** site: plain-language explanation + links to `/relational/login`, `/admin/login`, and volunteer escalation — **not** a duplicate of admin UI. |

No `/engine` or `/join` or `/training` pages exist today; add in Phase 4+ when copy and analytics are ready.

---

## 5. CTA ladder

### 5.1 Primary / secondary / tertiary (public)

| Tier | Purpose | Examples (current implementation) |
|------|---------|-----------------------------------|
| **Primary** | Commit time or money | Header/footer **Volunteer** (`getJoinCampaignHref()` → `/get-involved#volunteer` or env external); **Donate** (`siteConfig.donateHref`); mobile “Volunteer sign-up” |
| **Secondary** | Find a lane without heavy commitment | **Get involved** hub, **Local organizing**, **Events**, **Listening sessions**, **Host a gathering** |
| **Tertiary** | Depth and sharing | Blog, explainers, resources, **Read more** within cards, **Share / Substack** links |

### 5.2 Engine handoff language (recommended)

Use plain, trust-building phrases; avoid “dashboard” or internal codenames on first touch.

- **Create an account** — when signing up for relational or campaign identity.
- **Join relational organizing** — link to `/relational` / `/relational/login` with one sentence on privacy and purpose.
- **Organizer login** — link to `/admin/login` for credentialed staff/volunteers.
- **Your work shows up in the engine** — optional explainer on `/get-involved` or future `/for-organizers`: assignments, follow-up, and team coordination live behind login.

**Mobile menu** already includes **“Command HQ · this site”** → `/get-involved` as an on-site command anchor.

---

## 6. Design system direction (public site only)

**Goal:** Polished **civic movement** aesthetic: warm, rural-Arkansas-organizing tone; **simple first screen**; **strong typography**; **mobile-first**; **high contrast**; **light default** with optional **dark** support; visually **distinct from admin** information density.

**Current baseline:** `globals.css`, `tailwind.config.ts`, tokens such as `civic-midnight`, `civic-gold`, `cream-canvas`, `red-dirt`, `sunlight-gold`, `font-heading` / `font-body`. Public chrome uses **dark header/footer** (`SiteHeader` / `SiteFooter`) over lighter main content via `PublicLayoutMain`.

**Token recommendations (incremental — do not break existing pages in one shot):**

- Add **`--site-canvas`** (light) and **`--site-ink`** for main column readability; reserve `civic-midnight` for chrome.
- Document **two theme modes** in CSS variables: default light main + dark chrome; optional `prefers-color-scheme` or `data-theme` for full-page dark **content** (Phase 2).
- **Spacing scale:** enforce `--gutter-x`, `py-section-y` rhythm on new components only; migrate legacy sections over time.
- **Focus rings:** keep gold/midnight accessible contrast (WCAG AA minimum).
- **Motion:** prefer reduced motion respect (`prefers-reduced-motion`) for any new hero animations.

**Admin:** No requirement to restyle admin in these phases; only avoid coupling public components to admin-only CSS buckets.

---

## 7. Component plan

**Namespace:** Introduce `src/components/site-marketing/` for **new** composable blocks to avoid entangling `components/home` with future hub pages. Existing `components/home/*`, `components/layout/*`, and `components/campaign-guide/*` remain; refactor imports incrementally.

| Component | Responsibility |
|-----------|----------------|
| `SiteHero` | Title, dek, primary/secondary CTAs, optional media — one job per viewport. |
| `SiteCTADeck` | 2–3 equal-weight actions (volunteer / donate / local path). |
| `SiteTrustBand` | Logos, press strip, paid-for, proof microcopy. |
| `SiteRouteCards` | Hub navigation cards with consistent aspect and labels. |
| `SiteEngineBridge` | Plain-language block + links to `/relational/login`, `/admin/login`, `/get-involved`. |
| `SiteIssuePreview` | Teaser for priorities / direct democracy with link to depth. |
| `SiteTrainingPreview` | Pull next training-shaped events or resources (data from DB + fallbacks). |
| `SiteEventPreview` | Compact event list with RSVP CTA. |
| `SiteStoryBlock` | Quote + attribution + link to stories/blog. |
| `SiteFooterCTA` | Optional repeated closing CTA above global footer (donate + volunteer). |

Reuse existing primitives: `Button`, `ContentContainer`, `FullBleedSection`, etc.

---

## 8. Engine entry plan

| Entry | Public path | Notes |
|-------|-------------|--------|
| Relational organizing | `/relational`, `/relational/login` | Supabase/auth patterns per layout — keep signup copy adjacent to privacy assurances. |
| Admin / operators | `/admin/login` | Staff and credentialed volunteers only; never linked as primary CTA for cold traffic. |
| Volunteer intake | `/get-involved` (`#volunteer`, `#join`), env `NEXT_PUBLIC_JOIN_CAMPAIGN_URL` | Primary scale path; forms post to campaign APIs. |
| Volunteer document review | `/admin/(board)/volunteers/intake` | Operator-only. |
| Training | Distributed: `/events`, `/listening-sessions`, `/resources`, county hubs | Future `/training` hub can aggregate. |
| Local organizing | `/local-organizing`, `/local-organizing/[slug]`, `/start-a-local-team` | County identity → events → relational handoff. |

---

## 9. Build phases

| Phase | Scope |
|-------|--------|
| **Phase 1** | **Audit + this planning doc only** — no new routes unless emergency fix. |
| **Phase 2** | **Public design system shell** — tokens, `site-marketing` scaffolding, optional theme hook; smoke home + one hub. |
| **Phase 3** | **Homepage rebuild** — `HomeExperience` composition using new primitives; preserve SEO and DB merge behavior. |
| **Phase 4** | **Hub pages** — get-involved, local-organizing, what-we-believe, events: CTA ladder + `SiteRouteCards`. |
| **Phase 5** | **Training / events / blog depth** — optional `/training`; editorial modules; DB fallbacks documented. |
| **Phase 6** | **Engine handoff + account flow polish** — `SiteEngineBridge`, relational onboarding copy, measure drop-off. |

Align high-ROI copy/design work with queue items **RD-1** (public copy sweep), **RD-4** (forms smoke), **RD-6** (mobile pass).

---

## 10. Safety rules

1. **Do not break** `/admin/**` or `/relational/**` flows when editing `(site)` layouts or shared `lib/`.
2. **Do not rename** engine routes or auth callbacks without an explicit migration packet.
3. **Do not import** code from `sos-public/`, `ajax/`, or `phatlip/` into RedDirt (and vice versa). Cross-link URLs in content only when product intends.
4. **Keep** RedDirt **deployable** as a single Next app on Netlify (`npm run build` in CI with production DB or documented static fallbacks).
5. **Quality gate:** `npm run build` minimum; `npm run check` when touching TS/lint-sensitive paths.
6. **Local build:** If Postgres is down, expect Prisma warnings during static generation; for a clean local build run `npm run dev:full` or `docker compose up -d` per README.

---

## Appendix: Config and content touchpoints (audit)

| Area | Path | Role |
|------|------|------|
| Navigation / IA | `src/config/navigation.ts` | `primaryNavGroups`, `footerNavGroups` |
| Site strings / URLs | `src/config/site.ts`, `src/config/external-campaign.ts` | Name, tagline, donate, join, blog URLs |
| Homepage merge | `src/lib/content/homepage-merge.ts`, Prisma `homepageConfig` | DB + TS merge |
| Home sections | `src/components/home/*` | `HomeExperience` orchestration |
| Content modules | `src/content/**` | Events, explainers, editorial, stories, home journey, tone |
| Brand media | `src/config/brand-media.ts` | OG images, banners |
| **Data folder** | `src/data` | **Not present** in repo today — use `src/content` + Prisma |

---

*End of RD-SITE-FUNNEL-1.*
