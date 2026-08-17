# Arkansas Media Radar — Master Build Plan

**Doc ID:** AMR-1  
**Product name:** Arkansas Media Radar  
**Lane:** `RedDirt/` only  
**Status:** Design lock — no implementation in this pass  
**Last updated:** 2026-08-17

**Related:** [`CAMPAIGN_MEDIA_REGISTRY.md`](./CAMPAIGN_MEDIA_REGISTRY.md) · [`intelligence/ARKANSAS_MEDIA_INTELLIGENCE_INTAKE_PLAN.md`](./intelligence/ARKANSAS_MEDIA_INTELLIGENCE_INTAKE_PLAN.md) · [`county-media-mapping.md`](./county-media-mapping.md) · [`src/lib/media-monitor/`](../src/lib/media-monitor/) · public [`/press-coverage`](../src/app/(site)/press-coverage/page.tsx) · admin [`/admin/media-monitor`](../src/app/admin/(board)/media-monitor/page.tsx)

---

## 1. Command decision

Do **not** buy Meltwater or Muck Rack as the campaign’s understanding of rural Arkansas.

Build **Arkansas Media Radar** as a first-class RedDirt campaign-OS subsystem:

**Campaign itinerary → geographic media universe → continuous searches → AI triage → human approval → public Media page**

The public site never publishes because AI found something.

This is **not a greenfield**. RedDirt already has earned-media plumbing. Radar **extends** that spine. It does not create a second press database.

### Already in the repo (keep and grow)

| Piece | Today |
|-------|--------|
| Outlet registry | `ExternalMediaSource` + 22 seeds in `arkansas-media-sources.ts` (statewide papers + a few TV, almost no weeklies/radio) |
| Mentions | `ExternalMediaMention` with review, `showOnPublicSite`, optional `relatedEventId` / `relatedCountyId` |
| Ingest | RSS/sitemap/search-page fetch, robots.txt, keyword gate, optional OpenAI refine |
| Operator UI | `/admin/media-monitor` |
| Public | `/press-coverage` (approved rows + curated links; weekly cadence copy) |
| Cron | `GET /api/cron/media-monitor` (Netlify; default vertical slice) |
| Outreach (separate) | `MediaOutreachItem` — press *sending*, not monitoring |
| Intel track (separate) | NSI-7/8 `publicMediaMonitor` — opposition/morning-brief intake, not the voter Media page |

### The product gap (why Radar exists)

The current monitor asks, roughly: **“Did any of these 22 feeds mention Kelly?”**

Radar asks: **“Kelly is entering this community. What is that community saying before, during, and after she arrives?”**

That requires itinerary-driven search envelopes, a 75-county media ecosystem, multiple discovery engines, canonical-story dedupe, and a public archive that filters by county/city/outlet.

---

## 2. Non-negotiables

1. **Human approval** before any public listing. AI never auto-posts.
2. **No full-article republication.** Public records store headline, outlet, date, author if known, short campaign description or permitted excerpt, thumbnail if licensed/permitted, geography, type, and outbound link. Internal `fullText` stays operator-only and is never a public field.
3. **Send traffic back** (“Read at The Baxter Bulletin”, “Listen at KTLO”).
4. **Obey robots.txt.** Prefer RSS/API. No paywall bypass, no login scraping, no private groups.
5. **Hot Springs (city) never maps to Hot Spring County.** Same county-key rules as events.
6. **Sentiment never decides keep vs drop.** It is an operator hint only.
7. **Expensive work runs on the local/operator machine.** Netlify does not crawl the internet with OpenAI. Production receives **approved public records only**.
8. **No secrets in docs, logs, commits, or screenshots.** Env var *names* only.
9. **No deletes / no repo moves / no template extraction / no sister-lane edits.** `/press-coverage` becomes a redirect to `/media`, not a removed route.
10. **No unsourced opponent claims** on public Media cards. Opponent coverage can exist in the operator queue; public copy stays Kelly-coverage unless Steve explicitly approves a sourced clip.

---

## 3. Target architecture

```text
REDDIRT CAMPAIGN DATA
  Events · Counties · Cities · Travel ledger
                │
                ▼
       MEDIA WATCH PLANNER
       (per stop: T-21 … T+21 query envelope + local outlets)
                │
      ┌─────────┼──────────┐
      ▼         ▼          ▼
 Arkansas    Global      Direct
 Media       Search      Outlet
 Registry    adapters    RSS/sitemap
      │         │          │
      └─────────┼──────────┘
                ▼
       RAW DISCOVERY (many hits)
                │
                ▼
       DEDUPE → CANONICAL STORY
                │
                ▼
       AI CLASSIFICATION (analyst, not publisher)
                │
                ▼
       HUMAN REVIEW QUEUE  (Approve / Reject / Merge / Flag)
                │
                ▼
       PUBLIC MEDIA RECORD
                │
                ▼
       kgrappe.netlify.app/media
```

**Two search kinds, both required**

| Kind | Question |
|------|----------|
| Global discovery | What on the internet mentions Kelly in this place/time window? |
| Local surveillance | What have the outlets that serve this town published lately? |

---

## 4. Database schema (additive)

Keep `ExternalMediaSource`, `ExternalMediaMention`, `ExternalMediaIngestRun`. Add Radar tables and **extend** the source row. Do not rename existing tables in Slice 1 (no repo-move energy). Public code may *brand* the subsystem Arkansas Media Radar.

### 4.1 Extend `ExternalMediaSource` (the Media Registry)

Add fields (all nullable or defaulted so existing 22 rows keep working):

| Field | Purpose |
|-------|---------|
| `domain` | Canonical host (`ktlo.com`) for `site:` queries |
| `websiteUrl` | If distinct from `homepage` |
| `newsUrl` | News/home section |
| `youtubeUrl` `facebookUrl` `xUrl` `instagramUrl` | Public channels |
| `radioCallsign` `tvCallsign` | KTLO, KATV, etc. |
| `contactEmail` | Outreach later — not public |
| `submissionUrl` | Press-release / contact page |
| `searchMethod` | `RSS` / `SITEMAP` / `SITE_SEARCH` / `API_ONLY` / `MANUAL` |
| `crawlAllowed` | Operator assertion after robots check |
| `countiesServedKeys` | Canonical county keys (`baxter`, `hot-spring`, never `hot-springs`) |
| `primaryCountyKey` | Home county when one is clear |
| `primaryCity` | Mountain Home, Stuttgart, … |
| `registryOrigin` | `SEED` / `APA` / `ABA` / `MANUAL` / `DISCOVERED` |

Optional later: `ExternalMediaSourceCounty` join table if array queries get painful. Slice 1 may start with `countiesServedKeys String[]`.

### 4.2 New: `MediaWatchPlan`

One plan per campaign stop (or per city-day if multiple events share a town).

| Field | Notes |
|-------|--------|
| `id` | cuid |
| `campaignEventId` | FK, unique-or-many if we watch venue + city separately |
| `eventSlug` `eventTitle` `eventStartAt` | Denormalized for jobs that run without joining content catalogs |
| `city` `countyKey` | From event; Hot Springs city must not become Hot Spring County |
| `windowStart` `windowEnd` | T-21 through T+21 of event date |
| `status` | `SCHEDULED` / `ACTIVE` / `SWEEPING` / `CLOSED` |
| `queryEnvelopeJson` | Generated queries (see §6) |
| `outletIdsJson` or relation | Registry outlets serving that county/city |
| `lastRunAt` `nextRunAt` | Cadence checkpoints |
| `createdAt` `updatedAt` | |

Checkpoints (locked): **T-21, T-7, T-2, event day, T+1, T+3, T+7, T+21**.

### 4.3 New: `MediaDiscoveryHit` (raw)

Every provider result lands here **before** it is a story.

| Field | Notes |
|-------|--------|
| `provider` | `BRAVE_WEB` `BRAVE_NEWS` `NEWSAPI` `GOOGLE_PSE` `SERPAPI` `GDELT` `TALKWALKER_RSS` `OUTLET_RSS` `OUTLET_SITEMAP` `MANUAL` |
| `providerHitId` | Provider’s id when present |
| `query` `watchPlanId` | Why we searched |
| `url` `canonicalUrl` `title` `snippet` `publishedAt` `outletGuess` | |
| `rawJson` | Operator/debug; never public |
| `dedupeKey` | URL-normalized |
| `storyId` | Null until clustered |

### 4.4 New: `MediaStory` (canonical)

One story, many hits.

Reuse most of `ExternalMediaMention` semantics. **Preferred path:** evolve `ExternalMediaMention` into the canonical story (it already has review, public flag, event/county). Add:

| Field | Notes |
|-------|--------|
| `importanceScore` | 0–100, AI + rules |
| `candidateProminence` | `PRIMARY` `SECONDARY` `INCIDENTAL` `UNKNOWN` |
| `mediaKind` | Expand enum: interview, preview, photo/gallery, radio, podcast, video, calendar, analysis, … |
| `aiRationale` | Short internal explanation |
| `publicBlurb` | Campaign-written or AI-drafted **description** (not article body); human-editable; only this (plus headline) may go public |
| `thumbnailUrl` | Only if permitted |
| `featured` | Featured Coverage rail |
| `showInWatchListen` | TV/radio/podcast/YouTube |

Then `MediaDiscoveryHit.storyId → ExternalMediaMention.id` (or `MediaStory` if we split). **Slice 1 recommendation:** keep `ExternalMediaMention` as the canonical story; add `MediaDiscoveryHit` + `MediaWatchPlan`. Avoid a dual-write mess.

### 4.5 Enum expansions (additive)

`ExternalMediaMentionType` add: `INTERVIEW` `EVENT_PREVIEW` `PHOTO_GALLERY` `RADIO` `PODCAST` `VIDEO` `COMMUNITY_CALENDAR` `ELECTION_ANALYSIS` `INCIDENTAL`.

`ExternalMediaIngestMethod` add: `BRAVE` `NEWSAPI` `GDELT` `TALKWALKER` `WATCH_PLAN`.

`ExternalMediaSourceType` already covers newspaper/radio/TV; add `PODCAST` `COMMUNITY` if needed.

---

## 5. Discovery-provider adapters

Each adapter implements one interface:

```ts
type RadarSearchRequest = {
  query: string;
  since?: Date;
  until?: Date;
  site?: string;       // site:ktlo.com
  countyKey?: string;
  watchPlanId?: string;
  limit: number;
};

type RadarSearchHit = {
  url: string;
  title: string;
  snippet: string;
  publishedAt: Date | null;
  outletGuess: string | null;
  provider: string;
  raw: unknown;
};
```

Rules: timeouts, User-Agent `RedDirtMediaRadar/1.0`, robots for **direct fetches**, never log API keys, cap daily quota.

| Provider | Role | When |
|----------|------|------|
| **Brave Web + News** | Primary programmable discovery | Slice 2 — env `BRAVE_SEARCH_API_KEY` |
| **NewsAPI Everything** | Second lens; raise confidence on overlap | Slice 2 — `NEWSAPI_KEY` |
| **Outlet RSS / sitemap** | Local surveillance (already started) | Slice 1–2 expand registry |
| **Talkwalker Alerts RSS** | Safety-net sensor, not the brain | Slice 3 — operator-created alerts, we ingest RSS |
| **GDELT DOC API** | Statewide / retrospective / propagation | Slice 4 optional |
| **Google PSE / SerpAPI** | Blind-spot only | Slice 4+ if Brave+NewsAPI miss weeklies |

**Do not** make Google the architectural dependency.

Quota posture (planning numbers, not a budget request): Brave’s published basic search is inexpensive enough for thousands of Arkansas-specific queries. Historical sweep of ~300 stops × ~12 queries is on the order of a few thousand requests — run in batches on the local machine with a daily cap.

---

## 6. Geography / event search algorithm

### 6.1 Inputs per stop

From public event catalog + visit ledger (not invented geography):

- date, city, county key, venue, event title
- nearby outlets from registry (`countiesServedKeys` contains county, or city match)
- callsigns / domains for those outlets

### 6.2 Query envelope (example: Mountain Home / Baxter / Farm Bureau)

Always include Kelly-specific queries **and** office-in-place queries (pre-event calendars often omit her name):

1. `"Kelly Grappe"` `{city}`
2. `"Kelly Grappe"` `{county} County`
3. `"Kelly Grappe"` `{venue or host}` (e.g. Farm Bureau)
4. `"Secretary of State"` `"{city}"` candidate
5. `"Secretary of State candidate"` `{county} County`
6. `Kelly Grappe {callsign}`
7. `Kelly Grappe {outlet name}`
8. `Kelly Grappe site:{domain}`
9. Optional: `{event title}` `"Kelly Grappe"`

Skip Hot Spring County queries when the city is Hot Springs (use Garland). Skip `Arkansas County` unless the event is actually there.

### 6.3 Cadence

For each plan, a job runner evaluates due checkpoints. If `now` is inside a checkpoint ± grace (e.g. 12 hours), run the envelope against:

1. Brave (when keyed)
2. NewsAPI (when keyed)
3. Direct RSS/sitemap for the plan’s outlet set

Store every hit as `MediaDiscoveryHit`. Cluster into `ExternalMediaMention`.

### 6.4 Future-event radar

On **create/update** of a public upcoming event, upsert a `MediaWatchPlan` with status `SCHEDULED` and `nextRunAt = startAt - 21 days` (or now if the event is already inside the window). Ponca Color Fest → watch Ponca, Newton County, Color Fest, Kelly, Secretary of State candidate, plus Newton County registry outlets.

### 6.5 Historical sweep

Batch job, local only:

1. Load all public campaign stops (content catalog + DB events).
2. Create `MediaWatchPlan` with `status = SWEEPING` and a compressed checkpoint set (at least event day, T+7, T+21).
3. Run envelopes with `since = eventDate - 21d`, `until = eventDate + 21d`.
4. Dedup globally.
5. Close plans.

Never run the full historical sweep on Netlify.

---

## 7. AI contracts (analyst, not publisher)

Run **after** dedupe, on the canonical story, on the operator machine.

### 7.1 `radar.classify_v1` (JSON only)

```json
{
  "isKellyGrappe": true,
  "matchTier": "DEFINITE",
  "candidateProminence": "PRIMARY",
  "mediaKind": "EVENT_COVERAGE",
  "sentiment": "neutral",
  "importanceScore": 96,
  "localRelevance": 90,
  "eventMatch": {
    "campaignEventId": "… or null",
    "confidence": 0.86,
    "label": "Farm Bureau Candidate Forum"
  },
  "geography": {
    "countyKeys": ["baxter"],
    "city": "Mountain Home"
  },
  "rationale": "Kelly is the primary subject of this Mountain Home candidate-forum article. Published by a Baxter County outlet two days after the campaign stop. Recommended for public Media page.",
  "publicBlurbDraft": "Kelly joined a Baxter County candidate forum in Mountain Home. Read the original at the outlet.",
  "duplicateOfUrl": null
}
```

Zod-validate. Reject/retry on schema fail. Conservative: uncertain Kelly match → `NEEDS_REVIEW`, never `showOnPublicSite`.

### 7.2 Importance (0–100) factors

Candidate prominence, headline prominence, outlet priority, local relevance, event connection, original vs syndicated, substance, A/V availability.

### 7.3 AI must not

Create public copy as final, invent quotes, infer opponent motive, auto-approve, score voters, or store secrets in `rationale`.

Existing `refineMentionWithOpenAi` is a **subset**; Radar replaces it with `radar.classify_v1` without removing the old function until the new contract is live.

---

## 8. Deduplication

Pipeline: **hits → URL key → story**.

Deterministic first:

1. Normalized canonical URL (strip tracking params, `www`, trailing slash).
2. Same host + highly similar title (token Jaccard / normalized Levenshtein) + date ± 2 days.
3. Syndication markers (MSN, Yahoo, Google News wrapper → original when `canonical` link exists).

AI second: `duplicateOfUrl` suggestion only; operator **Merge Duplicate**.

One `ExternalMediaMention` (story). Many `MediaDiscoveryHit` rows. Confidence rises when Brave **and** NewsAPI **and** local RSS agree.

---

## 9. Media Command Center (admin)

**Route:** `/admin/media-radar`  
**Keep** `/admin/media-monitor` as a redirect (no delete).

Top stats: New discoveries · High confidence · Needs review · Likely duplicates.

Card fields: headline, outlet/city, date, relevance, prominence, sentiment (hint), event match, providers, actions:

- Open original
- Approve for website
- Reject
- Merge duplicate
- Flag (response needed / amplification)

Approve sets `reviewStatus = APPROVED` and `showOnPublicSite = true` only after a human click. Optional: require `publicBlurb` non-empty before approve.

---

## 10. Public `/media` data contract

**Canonical public route:** `/media`  
**Redirect:** `/press-coverage` → `/media` (permanent). Nav label can stay “Press Coverage” or become “Media”; recommend **Media** in From the Road group, keep Press Coverage as alias text in footer for a sprint if bookmarks matter.

### 10.1 Rails

| Rail | Rule |
|------|------|
| Featured Coverage | `featured = true` and approved |
| Kelly in the News | Chronological approved stories |
| Watch & Listen | radio / TV / podcast / video kinds |
| From Around Arkansas | Filter: county, city, outlet, month, media type |

Empty filter states are honest: “No reviewed coverage for this county yet.”

### 10.2 Public JSON shape (page + optional later API)

```ts
type PublicMediaCard = {
  id: string;
  title: string;
  outletName: string;
  publishedAt: string | null;
  href: string;           // original publisher
  ctaLabel: string;       // "Read at KTLO" / "Listen at Twin Lakes Radio"
  blurb: string;          // short, campaign-owned
  mediaKind: string;
  countyKey: string | null;
  city: string | null;
  thumbnailUrl: string | null;
  isFeatured: boolean;
};
```

No `fullText`, no AI rationale, no provider raw JSON, no contact emails.

### 10.3 Connections (later slices, do not block Slice 1)

Events → county page → `/media?county=baxter` → From the Road journal. Same county-key helper as the map.

---

## 11. Scheduling and runtime

| Work | Where | How |
|------|--------|-----|
| Watch-plan generation | Local or admin action | `npm run media-radar:plan` (name TBD) |
| Historical sweep | Local only | batched, daily request cap |
| Brave/NewsAPI search | Local only | checkpoint runner |
| Direct RSS of known outlets | Local primary; existing Netlify cron may keep a **light** RSS slice |
| OpenAI classify | Local only | `MEDIA_MONITOR_USE_OPENAI=1` already exists — do not enable on Netlify |
| Approve | Admin in production | writes approved flags to Kelly Postgres |
| Public `/media` | Netlify | reads approved rows only |

If production DB is the same Kelly Postgres locally and on Netlify, local jobs write discoveries + classifications; Netlify never needs search API keys.

---

## 12. Registry seeding plan

1. **Keep** the 22 existing seeds.
2. **Priority seed (Slice 1):** outlets that serve the next 60 days of stops — Mountain Home / Baxter (KTLO, Twin Lakes Radio, Baxter Bulletin if listed), Hot Springs / Garland (Sentinel-Record already in seeds), Stuttgart / Arkansas County, Greers Ferry / Cleburne, Ponca / Newton, plus Jonesboro/Harrison/Batesville/Camden/Russellville where itinerary hits.
3. **APA member list + ABA directory:** operator-assisted import (public directory pages). Do not scrape behind logins. Manual CSV import is acceptable for Slice 1–2.
4. **Coverage goal:** every one of 75 counties has ≥1 known outlet (newspaper, radio, TV, or community digital) before calling Radar “statewide.” That is a **later gate**, not Slice 1.

APA/ABA directories are the seed **bibliography**, not a live crawl target unless a public, robots-allowed page exists.

---

## 13. Success gates

### Slice 1 (next Cursor build) is done when

- `MediaWatchPlan` exists and is generated from public upcoming + recent events without inventing counties.
- Registry sources can store county keys + domain/callsign; at least the next-itinerary cluster (Baxter, Garland, Arkansas, Newton, Cleburne) has real outlets including **radio**, not only dailies.
- Admin **Media Radar** queue shows plans + existing mentions with Approve still human-gated.
- No public auto-publish. No Meltwater. No sister-lane files. `npm run typecheck` green. No secrets in diffs.

### Radar is campaign-useful when

- A new event creates a watch plan automatically.
- Pre-event calendar notices for a rural stop can appear in the queue (not necessarily public) within the T-21 window.
- Approved `/media` can filter Baxter County and show only reviewed coverage.
- Historical sweep has been run once on the local machine and operators have a duplicate-merge path.

### Radar is not done if

- Google is the only discovery path.
- Netlify serverless is doing historical sweep or OpenAI classification.
- `/media` copies article bodies.
- Hot Springs coverage is filed under Hot Spring County.

---

## 14. Build slices (give Cursor one at a time)

| Slice | Outcome | Buys APIs? |
|-------|---------|------------|
| **0 — this document** | Architecture lock | No |
| **1 — Watch planner + geo registry + command-center shell** | Itinerary becomes the search brain; Radio/weekly gaps for near-term stops filled; `/admin/media-radar` | No |
| **2 — Brave + NewsAPI adapters + MediaDiscoveryHit + overlap confidence** | Global discovery | Yes (Steve pastes keys locally) |
| **3 — AI `radar.classify_v1` + importance + merge UI** | Analyst layer | OpenAI already in stack |
| **4 — Public `/media` rails + `/press-coverage` redirect + county filter** | Voter-facing archive | No |
| **5 — Historical sweep runner** | Backfill | Uses Slice 2 keys |
| **6 — Auto watch on event create + Talkwalker RSS safety net** | Future-event radar | Optional |
| **7 — Press outreach join** (`MediaOutreachItem` ← registry contacts) | Sending, not monitoring | No |

**Next coding packet is Slice 1 only.** Do not improvise Slice 2–4 in the same pass.

### Slice 1 file hints (for the implementer)

- `prisma/schema.prisma` — `MediaWatchPlan`, `MediaDiscoveryHit` (hit table may wait until Slice 2 if we want a thinner Slice 1; **prefer adding WatchPlan + source columns now**, defer `MediaDiscoveryHit` to Slice 2 if migrate risk is high)
- `src/lib/media-monitor/sources/arkansas-media-sources.ts` — geo + radio seeds
- `src/lib/media-radar/build-watch-plans.ts` — new
- `src/lib/media-radar/query-envelope.ts` — new
- `src/app/admin/(board)/media-radar/page.tsx` — new shell; redirect old monitor path
- Scripts: `scripts/media-radar-build-plans.ts` wrapped with `run-with-h-drive-env.cjs`
- **Do not** add `/media` public page in Slice 1 (would ship an empty-looking redesign). Keep `/press-coverage` until Slice 4.

**Slice 1 schema minimum:** WatchPlan + source geography columns. Hits table can wait for Brave.

---

## 15. Env inventory (names only)

| Name | Slice | Runtime |
|------|-------|---------|
| `BRAVE_SEARCH_API_KEY` | 2 | Local |
| `NEWSAPI_KEY` | 2 | Local |
| `MEDIA_RADAR_DAILY_QUERY_CAP` | 2 | Local |
| `OPENAI_API_KEY` (existing) | 3 | Local |
| `MEDIA_MONITOR_USE_OPENAI` (existing) | 3 | Must stay off on Netlify |
| `MEDIA_MONITOR_CRON_SECRET` (existing) | keep | Netlify light RSS only |
| `GOOGLE_PSE_*` / `SERPAPI_API_KEY` | 4+ optional | Local |
| `TALKWALKER_ALERTS_RSS_URL` | 6 | Local |

---

## 16. What this is not

- Not a replacement for From the Road (Kelly’s own writing).
- Not the YouTube / photo DAM (`CAMPAIGN_MEDIA_REGISTRY.md`).
- Not opposition media footprint (`/admin/intelligence/.../media-footprint`).
- Not paid APA placements (`APA-MEDIA-PROGRAM.md`) — Radar *informs* outreach later.

---

## 17. Handoff prompt for Slice 1 (paste to Cursor)

> Active lane `RedDirt/` only. Implement **Arkansas Media Radar Slice 1** from `docs/ARKANSAS_MEDIA_RADAR_MASTER_BUILD_PLAN.md`. Do not implement Brave/NewsAPI, public `/media`, or historical sweep. Extend `ExternalMediaSource` with county keys, domain, callsigns; seed near-term itinerary outlets including Baxter radio; add `MediaWatchPlan` generated from public campaign events with T-21/T+21 envelopes and the locked query patterns; add `/admin/media-radar` command-center shell using existing mention review actions. Redirect `/admin/media-monitor` to the new shell (no deletes). Obey Hot Springs ≠ Hot Spring County. No secrets. No auto-publish. Typecheck, then commit and push per lane GitHub rules.
