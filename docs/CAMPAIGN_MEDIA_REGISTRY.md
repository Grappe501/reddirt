# Campaign Media Registry

**Status:** Canonical doctrine (documentation only — not a full product build in this pass)  
**Lane:** `H:\SOSWebsite\RedDirt`  
**Track C:** CLOSED — no homepage personality implementation authorized  

---

## 1. Purpose

RedDirt should maintain a dedicated **Campaign Media Registry** for **all** public-facing campaign assets — not only YouTube videos, and not a generic “Media” dump page.

One curated, searchable library powers the whole site so pages draw from the same records instead of scattered embeds and duplicated configuration.

### Asset classes (target)

- Videos (speeches, forums, election-night moments, ads, testimonials, event recordings)  
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

## 3. Display rule (videos)

- No raw `<iframe>` scatter  
- Reusable **`CampaignVideoCard`** backed by registry records  
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

## 10. Campaign Story Map (visitor journey)

With ten+ videos identified, each record should capture **where it fits in the visitor journey**, not only library metadata.

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
