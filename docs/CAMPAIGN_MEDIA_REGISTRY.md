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
3. Advance status as transcript, tags, and placements land.  
4. Expand registry formats for photos/press/docs in a later slice — do not block video ingest waiting for the full multi-type product.
