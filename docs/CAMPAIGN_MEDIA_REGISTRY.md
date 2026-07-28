# Campaign Media Registry

**Status:** Canonical doctrine (documentation only — not a full product build in this pass)  
**Lane:** `H:\SOSWebsite\RedDirt`  
**Track C:** CLOSED — no homepage personality implementation authorized  

---

## 1. Purpose

RedDirt should maintain a dedicated **Campaign Media Registry** for **all** public-facing campaign assets — not only YouTube videos, and not a generic “Media” dump page.

One curated, searchable library powers the whole site so pages draw from the same records instead of scattered embeds and duplicated configuration.

### Asset classes (target)

- Videos — speeches, forums, interviews, campaign stories, **Campaign Shorts (9:16)**, ads, testimonials, event recordings  
- Photos  
- Press coverage  
- Podcasts  
- Interviews  
- Campaign ads  
- Testimonial clips  
- Event recordings  
- Downloadable documents  

Current machine-readable **video** slice:  
`data/public-experience/kelly-homepage-personality-approved-videos.json`

Story / presentation doctrine:  
`docs/KELLY_SPEAKS_MEDIA_LIBRARY_ARCHITECTURE.md`

---

## 2. Review status (mandatory for growth)

Ingest dozens of assets quickly; refine placement over time without losing track:

| Status | Meaning |
|--------|---------|
| **Imported** | In the registry |
| **Transcript Complete** | Transcript attached (video/audio) |
| **Tagged** | Topics, counties, audiences identified |
| **Placement Approved** | Assigned to one or more site locations / slots |
| **Homepage Eligible** | Approved for homepage (still under locked homepage canon rules) |
| **Featured** | Primary campaign highlight |

**Imported ≠ live on a page.** Public surfaces require at least **Placement Approved** (and operator publication gates). Homepage requires **Homepage Eligible** plus respect for locked message/momentum principals.

---

## 2a. Duplicate protection (mandatory)

One authoritative record per YouTube video. Import must:

1. Paste URL or id  
2. Extract canonical video id (all URL shapes)  
3. Search typed registry (`resolveCampaignMediaImport`)  
4. **Exists** → open / update existing  
5. **Not found** → create **one** new record  

Supported inputs include `youtu.be`, `watch?v=`, `embed`, `shorts`, `youtube-nocookie`, and bare 11-character ids (including `?si=` share params).

Code: `src/lib/media/youtube-id.ts`, `src/lib/media/campaign-media-import.ts`, Admin → Media → YouTube → Import / duplicate check.

**Example:** `72oKVAwfzZw` is already registered as a DRAFT long-form `CampaignVideoCard` — duplicate pastes must **UPDATE EXISTING RECORD**, never create a second asset. Unique inventory is **17** after Video 17 (`KSCpwLsGT0o`).

---

## 3. Display rule (videos)

- No raw `<iframe>` scatter  
- Landscape / long-form → reusable **`CampaignVideoCard`**  
- Vertical Shorts (9:16) → reusable **`CampaignShortCard`**  
- Both backed by registry records  
- `youtube-nocookie` · click-to-play · no autoplay · custom poster preferred  

---

## 4. Placement question

> What visitor question does this asset answer?

Assign pages/slots only after tagging — provisional imports stay in the registry with candidate homes noted, not locked.

---

## 5. Relationship to Owned Media / public slots

- Owned Media DAM remains the binary/governance store for campaign files where applicable.  
- This registry is the **editorial + storytelling + placement** layer (Story Engine / Content Graph edges).  
- Public slots (`PublicMediaPlacement`, future video slots) should reference registry IDs / approved assets — placement ≠ approval.

---

## 6. Near-term practice

1. Append each new YouTube ID to the video JSON + Phase 1C §15.  
2. Set `reviewStatus` (default **Imported**).  
3. Assign a **collection** when known (or leave unassigned until Tagged).  
4. Advance status as transcript, tags, and placements land.  
5. Expand registry formats for photos/press/docs in a later slice — do not block video ingest waiting for the full multi-type product.

---

## 7. Collections (organize the library — not one-off embeds)

With nine+ videos identified, stop treating them as isolated embeds. Group into **collections** that map to pages and Media Center browse facets.

| Collection | Purpose | Potential locations | Provisional members (IDs) |
|------------|---------|---------------------|---------------------------|
| **Vision for Arkansas** | Philosophy, leadership vision, campaign message | Homepage · Our Plan · Meet Kelly | `eKVz5pFJxtk` (locked homepage message) |
| **Elections & Democracy** | Elections, administration, county partnerships, transparency, voter confidence | Secure Elections · What the Office Does · County Partnerships | `Hl_n-A9aL1s` |
| **Campaign Across Arkansas** | Community visits, stops, election night, volunteers, trail | Campaign Journey · Kelly Across Arkansas · Get Involved | `aO712RsR0pQ` (locked momentum) · `amiTVLt85AM` |
| **Candidate Forums & Interviews** | Long-form evaluation in context | Kelly Speaks · Media Center · Learn More | `Hl_n-A9aL1s` (also Elections) |
| **Leadership Moments** | Values, leadership style, vision speeches | Meet Kelly · Executive Leadership · Homepage supporting | `KZ33iSxZ0ZQ` |

**Unassigned / Imported pending tagging:** `SrzDUJBvFrs`, `c2v1uZNUMf4`, `m7Mlk_bUbq4`, `72oKVAwfzZw` — keep in registry; assign collection after review.

A video may belong to **more than one** collection when themes overlap (e.g. County Clerk forum → Elections + Forums).

---

## 8. Story Engine edges (richer model)

Every video record should eventually support:

```text
Video
├── Transcript · Summary · Pull Quote
├── Related Photos · Blog Posts · Press Releases
├── Related Issues · Counties · Events · People
├── Call to Action
└── Suggested Page Placements
```

Visitor path example: watch election-admin speech → policy → event photos → related speeches → volunteer / invite Kelly.

---

## 11. Campaign Shorts (vertical short-form)

Treat **Shorts** as a distinct asset type from full speeches. Purpose: mobile-first, quick, digestible clips — not immersive long-form.

### Shorts collections

| Collection | Purpose | Example prompts |
|------------|---------|-----------------|
| **60 Seconds with Kelly** | Focused answers to common questions | Why running? · What does SOS do? · Why should young people vote? · Transparency · Small business |
| **On the Campaign Trail** | County visits, events, volunteers, BTS, rally highlights | Community / trail moments |
| **Quick Answers** | Concise FAQ responses | Election security · Business filings · Notaries · Civic education · County partnerships |

### 60 Seconds with Kelly experience (target UI)

Modern, mobile-first horizontal scroll of vertical cards. Each Short shows:

- Custom thumbnail · 1–2 sentence description · topic tags  
- Related page links · transcript · **Learn More**  
- Example titles: Why I'm Running · Government That Works for Every Arkansan · Secure Elections · Helping Small Businesses · Transparency · County Partnerships · Civic Education  

Provisional Short members (Imported — tag before shipping): `52egsV4WWgc`, `X6M_SMmbYQ4`, `scytoSXSO3A`, `1BOFM9ao8bU`, `b_tGYhWuXqI`, `Scpu5qASiTQ`, `KSCpwLsGT0o`

**Inventory (typed registry):** 10 long-form / non-Short · 7 Shorts · **17 total** (code: `src/content/media/campaign-media-registry.ts`).

### 60 Seconds with Kelly (homepage — Track C gated)

Featured Shorts carousel (approved only) with filters: Why I'm Running · Election Integrity · Small Business · Government Transparency · Community Visits · Campaign Trail · Quick Answers · Behind the Scenes. Each card links to a detail page (embed · transcript · summary · quotes · related issues/speeches/counties · CTA). **Do not implement homepage placement while Track C is CLOSED.**

### Placement fits

Homepage (“60 Seconds with Kelly”) · Meet Kelly · FAQ · Volunteer / Get Involved · County pages · Campaign Journey · Kelly Speaks Shorts section — only after **Placement Approved** / homepage rules.

### Component

```text
<CampaignShortCard />

• Vertical 9:16 aspect ratio
• Custom poster · play control · title
• 1–2 sentence summary · topic tags · related page links
• Desktop: horizontal carousel of Shorts
• Mobile: swipe-friendly vertical experience
• Embed host: youtube-nocookie · click-to-play · no autoplay
```

Do **not** force Shorts into landscape `CampaignVideoCard` framing.

### Updated media taxonomy

| Type | Purpose |
|------|---------|
| **Campaign Speech** | Full speeches and major addresses |
| **Candidate Forum** | Long-form Q&A and policy discussions |
| **Interview** | Media appearances and conversations |
| **Campaign Story** | Community visits and milestone events |
| **Campaign Short** | Vertical, quick-hit videos |
| **Town Hall** | Community forums |
| **Community Event** | Event recordings / highlights |
| **Leadership Address** | Values / leadership style speeches |
| **Issue Explainer** *(future)* | Short videos focused on a single topic |
| **Volunteer Testimonial** *(future)* | Supporters and volunteers |
| **Press Appearance** *(future)* | Press / media hits |

Presentation adapts to type: immersive for speeches/forums; fast intro for Shorts.

### Registry fields (every asset)

Display title · YouTube ID · transcript · summary · pull quote · topic tags · counties · people · organizations · related issues · event · audience · story role · homepage eligibility · featured status / collection · related photos · related blog posts · related policy pages · related events · related media · suggested CTAs · review/publication status.

### Primary library collections (knowledge base)

| Collection | Purpose |
|------------|---------|
| **Kelly Speaks** | Major speeches and addresses |
| **60 Seconds with Kelly** | Shorts and quick explainers |
| **Campaign Across Arkansas** | Visits, events, milestones |
| **Election Education** | SOS role, elections, voter info |
| **Leadership & Vision** | Philosophy, priorities, long-form interviews |
| **Media & Press** | Interviews, debates, forums, news |

At **17** unique assets, treat the registry as a reusable messaging archive—not only a gallery (**create once, reuse everywhere**: homepage, issue/county pages, events, volunteer, newsletters, press, social, search, archives). Pass 1/2 transcript pipelines feed this library; public placement still requires editorial approval.

### Asset lifecycle (health)

```text
Imported → Metadata Complete → Transcript Available → Editorial Review
  → Tagged & Related → SEO Ready → Published → Featured (optional) → Archived
```

SEO eligibility begins only after transcript approval. Post-import workbench queue (editor-gated): retrieve/review transcript · AI summary draft · key quotes · counties/cities · orgs/people · issue tags · related pages · homepage eligibility · editorial approval.

### Campaign Timeline (recommended next)

Chronological Media Workbench view: recording date · publication date · location · event/stop · related issues · transcript status · publication status — for retrospectives and county-specific assembly.

---

## 12. Campaign Content Hub (admin — pre-launch recommendation)

Before / as launch media volume grows, build a dedicated **Campaign Content Hub** in RedDirt admin so editors do not hand-embed URLs page-by-page.

Operator flow:

1. Import YouTube URL or ID  
2. Auto-detect full video vs Short (aspect / Shorts signal)  
3. Attach transcript + summary  
4. Tag topics, counties, related issues  
5. Mark approved page placements  
6. Select featured for homepage or issue pages  
7. Associate photos, events, blogs, related speeches  

Public pages then assemble dynamically from the curated registry — keeping the site fresh as speeches, interviews, and Shorts arrive during the campaign.

**Partial ship:** Pass 2 YouTube transcript admin (`/admin/media/youtube`) covers connect/sync/transcript review. Remaining Workbench modules (Media Inbox, Tagging Workspace, Publishing Controls, Performance Dashboard, **Campaign Timeline**) stay **recommended next** now that inventory is **17** assets.

**Not a full Workbench build in this pass.** Track C remains CLOSED pending production smoke (and Netlify Lambda 400 unblock — see `docs/NETLIFY_LAMBDA_DEPLOY_400.md`).

With seventeen+ videos identified, each record should capture **where it fits in the visitor journey**, not only library metadata.

| Story role | Example use |
|------------|-------------|
| **Introduction** | Homepage, Meet Kelly |
| **Vision** | Our Plan |
| **Qualification** | What the Office Does |
| **Community** | Kelly Across Arkansas |
| **Leadership** | Executive Leadership |
| **Issue Deep Dive** | Elections, Business, Transparency |
| **Inspiration** | Volunteer, Get Involved |
| **Milestone** | Campaign Journey |

Pages answer visitor questions with **policy + storytelling + Kelly’s own voice**. Prefer ending major pages with **Hear Kelly Explain It** (intro · CampaignVideoCard · topic tags · related links), e.g.:

- Secure Elections → forums / election-admin speeches  
- Business Services → small business / nonprofit speeches  
- Meet Kelly → leadership, biography, campaign journey  
- Get Involved → community events, milestones, volunteer stories  

Provisional Story Map assignments (locked homepage principals only):

| Video ID | Story role (provisional) |
|----------|--------------------------|
| `eKVz5pFJxtk` | Vision / Introduction (homepage message) |
| `aO712RsR0pQ` | Community (homepage personality) |
| `Hl_n-A9aL1s` | Qualification / Issue Deep Dive (elections) |
| `KZ33iSxZ0ZQ` | Leadership |
| `amiTVLt85AM` | Milestone / Inspiration |
| Others Imported | Assign after tagging |

---

## 9. Campaign Media Center (browse architecture)

Prefer a **Campaign Media Center** over a flat video gallery. Four browse modes that scale without redesign:

| Browse by | Examples |
|-----------|----------|
| **Topic** | Elections · Business · Transparency · Leadership · Community |
| **Format** | Speech · Interview · Forum · Town Hall · Campaign Event |
| **Location** | County or city where recorded |
| **Date** | Campaign timeline |

Pages pull featured modules from the same registry; the Media Center is the searchable index, not a second source of truth.
