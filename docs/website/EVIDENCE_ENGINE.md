# THE EVIDENCE ENGINE

**Status:** LOCKED doctrine — 2026-07-29  
**Parent:** [`OPERATION_ARKANSAS.md`](./OPERATION_ARKANSAS.md)  
**Identity:** The website is designed around **evidence of Kelly’s work**, not around Kelly as a product.

---

## Governing sentence

> **The campaign doesn't exist to produce website content. The website exists to document the campaign.**

When the campaign does meaningful work across Arkansas, the site grows richer. When the site starts driving the campaign instead of documenting it, authenticity drops.

---

## Pipeline

```text
Campaign Event
        │
        ▼
Evidence Collected
(photo • video • quote • issue • community)
        │
        ▼
Campaign Confirmation
(county • city • venue • date • context)
        │
        ▼
Evidence Classified
(Gold • Silver • Archive)
        │
        ▼
Published
(homepage • journey • gallery • events • priorities)
        │
        ▼
Trust Built
```

### Not in the pipeline

- Marketing copy as the product  
- Redesigns for their own sake  
- New features / new pages as the default move  

**The campaign itself is the content engine.**

---

## Arkansas Evidence Standard

Before any photo or video is published, ask:

> **What does this prove?**

Not: “Is this a good picture?”

| Weak | Stronger proof |
| --- | --- |
| Handshake alone | Almost nothing by itself |
| Discussion at a school table | Engagement with educators |
| Town hall | Accessibility / public listening |
| Local business visit | Presence in community commerce |
| Conversation with volunteers | Organization / coalition work |
| County fair | Statewide travel / festival presence |

Every public asset needs a purpose beyond aesthetics. Prefer Journey verbs: **listened · learned · visited · spoke · engaged**.

Confirmation worksheet: [`COUNTY_CONFIRMATION_TEMPLATE.md`](./COUNTY_CONFIRMATION_TEMPLATE.md)

### Local Evidence Workbench

Operator UI (localhost): **`/admin/evidence-workbench`**

- Calendar presence, photo geography, and speech counties  
- Writes JSON under `data/campaign-media/` on the H: machine  
- Photo/speech overlays merge into public registry reads  
- Remote/Netlify hosts cannot write (local Host gate)

**AI assist (OPENAI_API_KEY):**

1. **Suggest with AI (tools)** — tool-calling brain can look up counties, calendar presence, confirmed memory, similar photos, album chapters, placement rules, speech registry, local transcript excerpts, **pixel inspect / crop plans / photo derivatives**, and **video excerpt plans** before proposing fields (never auto-confirmed; Unknown preferred)  
2. **Save** — stores overlay + feeds confirmed geography into `evidence-ai-memory.json` for future suggestions  
3. **Build outgoing metadata packet** — extensive JSON under `data/campaign-media/intelligence-packets/` (press/social/journey captions, entities, do-not-claim). Best-effort attach to `OwnedMediaAsset.enrichmentMetadata` when a filename match exists.

**Media manipulation (local, non-destructive):**

- Photo derivatives via `sharp` → `public/media/campaign-derivatives/{photoId}/` (web / thumb / hero 16:9 / portrait 4:5 / square / auto-orient)  
- Ledger: `data/campaign-media/media-derivatives.json`  
- Workbench Photos tab: Inspect, Crop plan, and one-click derivative buttons  
- Video: `plan_video_excerpt` builds timed clip candidates from local transcript workspace; encode/poster needs local `ffmpeg` (optional)  
- Originals under `public/media/campaign-photos/` are never overwritten

**County albums (public delivery):**

- Confirmed county photos group into **county → event** albums on `/campaign-photos` and `/campaign-photos/{county-slug}`  
- Saving photo evidence refreshes albums from **disk** (not stale webpack JSON) via `listCampaignPhotosLive` / `refreshCountyAlbumIndex({ photos })`  
- Uncheck **Approved for public** to hold a still off albums; legacy FEATURE stills with confirmed geo remain until explicitly denied  
- Ingest tab promotes files from `public/media/campaign-photos/` into `photo-ingest-drafts.json` for labeling  
- Local admin on loopback skips passphrase in development; `x-forwarded-host` is not trusted  

---

## Measure evidence density (not page count)

Living scoreboard: [`EVIDENCE_DENSITY.md`](./EVIDENCE_DENSITY.md)

| Category | What counts |
| --- | --- |
| Counties represented | Confirmed geography on public media |
| Communities represented | Confirmed cities / named places |
| Campaign events documented | Published public events + documented trail events |
| Videos published | PUBLISHED campaign videos on public surfaces |
| Volunteer activities documented | Trail/volunteer stills with honest captions |
| Endorsements confirmed | Campaign-confirmed public endorsements |
| Issues discussed publicly | Priorities / office / trail issues with evidence |

Page count is not a maturity metric.

---

## Evening questions (every day)

1. **What evidence did we publish today?**  
2. **What evidence did we create today that is not yet published?**  

Those answers should **never be identical**. A healthy backlog keeps the site evolving during busy campaign weeks.

---

## Campaign Journey sequence (protected)

> **Listened · Learned · Visited · Spoke · Engaged**

Mirrors campaign philosophy: listen first → learn → show up → share ideas → invite participation.  
Do not collapse into a stop list or county scoreboard.

---

## Publishing discipline

| Ask | Discipline |
| --- | --- |
| What should we build? | Website development (mostly complete) |
| What happened today that Arkansans deserve to see? | **Campaign publishing** (now) |

Stay faithful to the second question. Anchor: **Regnat Populus — The People Rule.**
