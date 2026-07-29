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

1. **Suggest with AI** — vision/text suggestions into the form (never auto-confirmed; Unknown preferred)  
2. **Save** — stores overlay + feeds confirmed geography into `evidence-ai-memory.json` for future suggestions  
3. **Build outgoing metadata packet** — extensive JSON under `data/campaign-media/intelligence-packets/` (press/social/journey captions, entities, do-not-claim). Best-effort attach to `OwnedMediaAsset.enrichmentMetadata` when a filename match exists.

**County albums (public delivery):**

- Confirmed county photos group into **county → event** albums on `/campaign-photos` and `/campaign-photos/{county-slug}`  
- Saving photo evidence refreshes `data/campaign-media/county-album-index.json` and copies stills into `public/media/county-albums/{county}/{event}/`  
- Public CTAs use album URLs — not `/counties/...` command pages  

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
