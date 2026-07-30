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

- Photo derivatives via `sharp` → `public/media/campaign-derivatives/{photoId}/` (web / thumb / hero 16:9 / portrait 4:5 / square / auto-orient / **focus_* attention crops**)  
- Ledger: `data/campaign-media/media-derivatives.json`  
- Workbench Photos tab: Inspect, Crop plan, one-click derivative buttons, **click-to-set focus + focus crops + Apply cropAdvice**  
- **Batch metadata:** multi-select filmstrip + field-level “Apply to N selected” (max 80)  
- **Batch AI assist:** Cluster selection + Suggest for selection → proposal review → operator apply  
- **Batch derivatives:** create web/thumb/hero/square/… for up to 40 selected stills (chunked progress + ledger `batchRuns`)  
- **Promote to placement:** set `publicSrcOverride` from a derivative + optional homepage/hero flags; clear restores registry original  
- **Focus / attention crops:** overlay stores `focusX`/`focusY`; AI tools `create_focus_crop` + `create_derivative_from_crop_advice`  
- **ffmpeg foundation:** prefers `H:/SOSWebsite/.local/ffmpeg/bin`; Speeches tab can probe masters + extract poster frames; AI tools `probe_local_video` / `extract_video_poster`  
- **Video clip encode:** Plan excerpts → Encode clip/all into `/media/campaign-derivatives/_video/`; AI tool `encode_video_excerpt`  
- **Transcript intelligence:** local chapters/quotes/claims + do-not-claim; Speeches Analyze → Apply; AI tool `analyze_transcript_intelligence`  
- **Batch publish:** Approve / Hold / Homepage / Featured on selection (consent-aware; albums refresh once); AI tool `batch_publish_photo_flags`  
- **Ops polish:** Undo last publish · batch op history · keyboard multi-select · smoke pack `scripts/smoke-evidence-workbench-pack.cjs`  
- **Simple intake:** Drop into `public/media/campaign-photos/` (nested OK) → **Intake all new** (flatten copies + queue drafts) → Photos label → Approve. CLI: `npm run evidence:intake`. Board: [`EVIDENCE_WORKBENCH_INTAKE_UPGRADE.md`](./EVIDENCE_WORKBENCH_INTAKE_UPGRADE.md)  
- **Video Prep package:** Speeches tab **Prep package** (plan + transcript intel + optional encode/poster); manual windows; quote→encode; **9:16 social** reframes; AI tools `prep_video_package` / `list_video_derivatives` / `apply_transcript_intelligence` (encode gated). Board: [`EVIDENCE_VIDEO_PREP_PASS.md`](./EVIDENCE_VIDEO_PREP_PASS.md)  
- **Video Pro Edit:** Speeches **Pro Edit** — AI director proposes cut list → Confirm render (concat/crossfade, looks, loudnorm, SRT/burn-in captions, multi-aspect pack). Tools `propose_video_edit_project` / `render_video_edit_project` / `list_video_assemblies`. Board: [`EVIDENCE_VIDEO_PRO_EDIT_PASS.md`](./EVIDENCE_VIDEO_PRO_EDIT_PASS.md)  
- **Photo Pro Edit:** Photos **Pro Edit** — AI director proposes look + focus-aware multi-aspect pack (incl. story 9:16) → Confirm render; promote stays explicit. Tools `propose_photo_edit_project` / `render_photo_edit_project` / `list_photo_assemblies`. Board: [`EVIDENCE_PHOTO_PRO_EDIT_PASS.md`](./EVIDENCE_PHOTO_PRO_EDIT_PASS.md)  
- **Publish Queue:** Workbench **Publish Queue** tab — live Unknown→Save→Approve backlog, Turbo backlog, Batch Approve needs-approval, density snapshot. Tools `get_evidence_publish_queue` / `run_publish_queue_turbo` / `refresh_evidence_density_snapshot`. Board: [`EVIDENCE_PUBLISH_QUEUE_PASS.md`](./EVIDENCE_PUBLISH_QUEUE_PASS.md)  
- **Ship Checklist:** Workbench **Ship** tab — dirty git paths for overlays/photos, gitignored derivative warning, commit template, draft→registry stub (never silent). Tools `build_evidence_ship_report` / `write_registry_graduation_stub`. Board: [`EVIDENCE_SHIP_CHECKLIST_PASS.md`](./EVIDENCE_SHIP_CHECKLIST_PASS.md)  
- **Turbo Ingest:** Intake → AI/heuristic identify + **website-fit rankings** (homepage / journey / albums / From the Road) → operator Apply. Tools `turbo_ingest_photos` / `score_photo_website_fit` / `get_website_surface_inventory`. Board: [`EVIDENCE_WORKBENCH_TURBO_INGEST.md`](./EVIDENCE_WORKBENCH_TURBO_INGEST.md)  
- Drop local masters in `public/media/campaign-video-masters/` or `.local/video-masters/`  
- 10-pass upgrade map (locked complete): [`EVIDENCE_WORKBENCH_10_PASS_UPGRADE.md`](./EVIDENCE_WORKBENCH_10_PASS_UPGRADE.md)  
- Video: `plan_video_excerpt` builds timed clip candidates from local transcript workspace; encode/poster needs local `ffmpeg` (optional)  
- Originals under `public/media/campaign-photos/` are never overwritten

**County albums (public delivery):**

- Confirmed county photos group into **county → event** albums on `/campaign-photos` and `/campaign-photos/{county-slug}`  
- Saving photo evidence refreshes albums from **disk** (not stale webpack JSON) via `listCampaignPhotosLive` / `refreshCountyAlbumIndex({ photos })`  
- Uncheck **Approved for public** to hold a still off albums; legacy FEATURE stills with confirmed geo remain until explicitly denied  
- **Intake** tab queues files from `public/media/campaign-photos/` into `photo-ingest-drafts.json` (flatten nested automatically)  
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
